const User = require('../models/User');
const Match = require('../models/Match');

const WEIGHTS = {
  MAJOR_PER_MATCH: 10,
  MAJOR_CAP:       30,
  UNIVERSITY:      10,
  STATE:           10,
  TIMEZONE:        10,
  AVAILABILITY:    20,
};
// 40 pts are reserved for tag overlap (mentee.lookingFor ∩ mentor.volunteeringFor).
// That field pair doesn't exist in the schema yet — it will be the highest-weighted
// signal once the teammate adds it to the profile forms (follow-up PR).
const TAG_RESERVED = 40;
const MAX_SCORE = TAG_RESERVED + WEIGHTS.MAJOR_CAP + WEIGHTS.UNIVERSITY +
                  WEIGHTS.STATE + WEIGHTS.TIMEZONE + WEIGHTS.AVAILABILITY; // 120

// ── Helpers ───────────────────────────────────────────────────────────────────

function parseMinutes(timeStr) {
  if (!timeStr) return 0;
  const s = timeStr.toLowerCase().trim();
  const pm = s.includes('pm');
  const am = s.includes('am');
  const [h, m = '0'] = s.replace(/\s*[ap]m/i, '').split(':');
  let hours = parseInt(h, 10);
  if (pm && hours !== 12) hours += 12;
  if (am && hours === 12) hours = 0;
  return hours * 60 + parseInt(m, 10);
}

function countAvailabilityOverlap(mentorSlots = [], menteeSlots = []) {
  let count = 0;
  for (const ms of mentorSlots) {
    for (const ts of menteeSlots) {
      if (!ms.day || ms.day !== ts.day) continue;
      const msS = parseMinutes(ms.startTime), msE = parseMinutes(ms.endTime);
      const tsS = parseMinutes(ts.startTime), tsE = parseMinutes(ts.endTime);
      if (msS < tsE && msE > tsS) count++;
    }
  }
  return count;
}

// Checks if mentor's industry and mentee's desired career share meaningful signal.
// Note: Figma shows a separate 'desiredIndustry' field on mentee that isn't in the
// schema yet. Using desiredCareer as a proxy until that field is added.
// Returns true (skip filter) if either value is missing, so incomplete profiles
// aren't unfairly excluded.
function industryCareerAligns(industry, career) {
  if (!industry || !career) return true;
  const a = industry.toLowerCase();
  const b = career.toLowerCase();
  if (a.includes(b) || b.includes(a)) return true;
  const tokens = str => str.split(/\W+/).filter(w => w.length > 3);
  const aSet = new Set(tokens(a));
  return tokens(b).some(t => aSet.has(t));
}

// ── Scoring ───────────────────────────────────────────────────────────────────

function scoreCandidate(mentor, mentee) {
  let score = 0;

  // ── TAG OVERLAP seam (40 pts reserved) ───────────────────────────────────
  // When lookingFor[] (mentee) and volunteeringFor[] (mentor) are added to the
  // schema, replace the zero below with:
  //   const tagHits = (mentee.lookingFor || [])
  //     .filter(t => (mentor.volunteeringFor || []).includes(t)).length;
  //   score += Math.min(tagHits * 10, TAG_RESERVED);
  score += 0;
  // ─────────────────────────────────────────────────────────────────────────

  // Shared majors (10 pts each, cap 30)
  const mentorMajorSet = new Set((mentor.majors || []).map(m => m.toLowerCase()));
  const sharedMajors = (mentee.majors || [])
    .filter(m => mentorMajorSet.has(m.toLowerCase())).length;
  score += Math.min(sharedMajors * WEIGHTS.MAJOR_PER_MATCH, WEIGHTS.MAJOR_CAP);

  // Same university (10 pts)
  if (mentor.university && mentee.university &&
      mentor.university.toLowerCase() === mentee.university.toLowerCase()) {
    score += WEIGHTS.UNIVERSITY;
  }

  // Same state (10 pts)
  if (mentor.state && mentor.state === mentee.state) {
    score += WEIGHTS.STATE;
  }

  // Same timezone (10 pts)
  if (mentor.timeZone && mentor.timeZone === mentee.timeZone) {
    score += WEIGHTS.TIMEZONE;
  }

  // Availability overlap (0–20 pts; 3 overlapping slots earns full marks)
  const overlaps = countAvailabilityOverlap(mentor.manualAvailabilitySlots, mentee.manualAvailabilitySlots);
  score += Math.round(Math.min(overlaps, 3) / 3 * WEIGHTS.AVAILABILITY);

  return Math.round((score / MAX_SCORE) * 100);
}

// ── Main export ───────────────────────────────────────────────────────────────

async function getRankedMentors(menteeId) {
  const mentee = await User.findById(menteeId).select('-password');
  if (!mentee || mentee.role !== 'mentee') {
    const err = new Error('Mentee not found');
    err.status = 404;
    throw err;
  }

  // Fetch all mentors who have completed their profile
  const allMentors = await User.find({ role: 'mentor', hasCompletedProfile: true })
    .select('-password');

  // Hard filter 1: industry/career alignment (gate — not a score)
  const industryFiltered = allMentors.filter(m =>
    industryCareerAligns(m.mentorProfile?.industry, mentee.menteeProfile?.desiredCareer)
  );

  if (industryFiltered.length === 0) return [];

  // Hard filter 2: capacity (exclude mentors already at their maxMentees active matches)
  const mentorIds = industryFiltered.map(m => m._id);
  const activeCounts = await Match.aggregate([
    { $match: { mentor: { $in: mentorIds }, status: 'active' } },
    { $group: { _id: '$mentor', count: { $sum: 1 } } }
  ]);
  const activeCountMap = {};
  for (const { _id, count } of activeCounts) activeCountMap[_id.toString()] = count;

  const capacityFiltered = industryFiltered.filter(mentor => {
    const max = mentor.mentorProfile?.maxMentees;
    if (!max) return true; // no cap set on this mentor — allow
    return (activeCountMap[mentor._id.toString()] || 0) < max;
  });

  // Score and rank survivors
  const scored = capacityFiltered.map(mentor => ({
    mentor,
    compatibilityScore: scoreCandidate(mentor, mentee)
  }));
  scored.sort((a, b) => b.compatibilityScore - a.compatibilityScore);

  return scored;
}

module.exports = { getRankedMentors };
