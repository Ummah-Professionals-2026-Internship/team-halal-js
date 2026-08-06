const User = require('../models/User');
const Match = require('../models/Match');

const WEIGHTS = {
  SERVICES: 25,
  CAREER: 25,
  MAJORS: 20,
  UNIVERSITY: 5,
  STATE: 5,
  AVAILABILITY: 20,
};
const MAX_SCORE = Object.values(WEIGHTS).reduce((total, weight) => total + weight, 0);
const FULL_AVAILABILITY_MINUTES = 120;

function normalize(value) {
  return value.trim().toLowerCase();
}

function parseMinutes(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') return null;
  const value = timeStr.toLowerCase().trim();
  const pm = value.includes('pm');
  const am = value.includes('am');
  const [hourPart, minutePart = '0'] = value.replace(/\s*[ap]m/i, '').split(':');
  let hours = parseInt(hourPart, 10);
  const minutes = parseInt(minutePart, 10);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes) || minutes < 0 || minutes > 59) return null;
  if (pm && hours !== 12) hours += 12;
  if (am && hours === 12) hours = 0;
  if (hours < 0 || hours > 23) return null;
  return hours * 60 + minutes;
}

function mergeAvailabilityByDay(slots = []) {
  const byDay = new Map();

  for (const slot of slots || []) {
    const day = slot.day?.trim().toLowerCase();
    const start = parseMinutes(slot.startTime);
    const end = parseMinutes(slot.endTime);
    if (!day || start === null || end === null || start >= end) continue;
    if (!byDay.has(day)) byDay.set(day, []);
    byDay.get(day).push([start, end]);
  }

  for (const [day, intervals] of byDay) {
    intervals.sort((a, b) => a[0] - b[0]);
    const merged = [];
    for (const interval of intervals) {
      const previous = merged[merged.length - 1];
      if (!previous || interval[0] > previous[1]) merged.push([...interval]);
      else previous[1] = Math.max(previous[1], interval[1]);
    }
    byDay.set(day, merged);
  }

  return byDay;
}

function totalAvailabilityMinutes(byDay) {
  let total = 0;
  for (const intervals of byDay.values()) {
    for (const [start, end] of intervals) total += end - start;
  }
  return total;
}

function availabilityCompatibility(mentorSlots = [], menteeSlots = []) {
  const mentorByDay = mergeAvailabilityByDay(mentorSlots);
  const menteeByDay = mergeAvailabilityByDay(menteeSlots);
  let overlapMinutes = 0;

  for (const [day, menteeIntervals] of menteeByDay) {
    const mentorIntervals = mentorByDay.get(day) || [];
    for (const [menteeStart, menteeEnd] of menteeIntervals) {
      for (const [mentorStart, mentorEnd] of mentorIntervals) {
        overlapMinutes += Math.max(0, Math.min(menteeEnd, mentorEnd) - Math.max(menteeStart, mentorStart));
      }
    }
  }

  const menteeMinutes = totalAvailabilityMinutes(menteeByDay);
  const targetMinutes = Math.min(menteeMinutes, FULL_AVAILABILITY_MINUTES);
  return {
    hasData: mentorByDay.size > 0 && menteeByDay.size > 0,
    menteeHasData: menteeByDay.size > 0,
    overlapMinutes,
    ratio: targetMinutes > 0 ? Math.min(overlapMinutes / targetMinutes, 1) : 0,
  };
}

function careerTextSimilarity(mentorValue, desiredCareer) {
  if (!mentorValue || !desiredCareer) return 0;
  const mentorText = normalize(mentorValue);
  const desiredText = normalize(desiredCareer);
  if (mentorText === desiredText) return 1;
  if (mentorText.includes(desiredText) || desiredText.includes(mentorText)) return 0.9;

  const tokens = value => new Set(
    value.split(/\W+/).filter(word => word.length > 2 && !['and', 'the', 'for', 'with'].includes(word))
  );
  const mentorTokens = tokens(mentorText);
  const desiredTokens = tokens(desiredText);
  if (mentorTokens.size === 0 || desiredTokens.size === 0) return 0;
  const sharedCount = [...desiredTokens].filter(token => mentorTokens.has(token)).length;
  return sharedCount / desiredTokens.size;
}

function careerCompatibility(mentorProfile = {}, desiredCareer) {
  const hasData = !!(desiredCareer && (mentorProfile.jobTitle || mentorProfile.industry));
  if (!hasData) return { hasData: false, menteeHasData: !!desiredCareer, ratio: 0 };

  // A matching job title is the strongest signal. Industry is a fallback for
  // related roles whose titles use different wording.
  const ratio = Math.max(
    careerTextSimilarity(mentorProfile.jobTitle, desiredCareer),
    careerTextSimilarity(mentorProfile.industry, desiredCareer)
  );
  return { hasData: true, menteeHasData: true, ratio };
}

function scoreCandidate(mentor, mentee) {
  const mentorServices = new Set((mentor.mentorProfile?.volunteeringFor || []).map(normalize));
  const desiredServices = mentee.menteeProfile?.desiredServices || [];
  const sharedTagsList = desiredServices.filter(service => mentorServices.has(normalize(service)));
  const servicesHaveData = mentorServices.size > 0 && desiredServices.length > 0;
  const servicePoints = servicesHaveData
    ? (sharedTagsList.length / desiredServices.length) * WEIGHTS.SERVICES
    : 0;

  const career = careerCompatibility(
    mentor.mentorProfile,
    mentee.menteeProfile?.desiredCareer
  );
  const careerPoints = career.ratio * WEIGHTS.CAREER;

  const mentorMajors = new Set((mentor.majors || []).map(normalize));
  const menteeMajors = mentee.majors || [];
  const sharedMajorsList = menteeMajors.filter(major => mentorMajors.has(normalize(major)));
  const majorsHaveData = mentorMajors.size > 0 && menteeMajors.length > 0;
  const majorPoints = majorsHaveData
    ? (sharedMajorsList.length / menteeMajors.length) * WEIGHTS.MAJORS
    : 0;

  const universityHasData = !!(mentor.university && mentee.university);
  const sameUniversity = !!(
    universityHasData && normalize(mentor.university) === normalize(mentee.university)
  );
  const universityPoints = sameUniversity ? WEIGHTS.UNIVERSITY : 0;

  const stateHasData = !!(mentor.state && mentee.state);
  const sameState = !!(stateHasData && mentor.state === mentee.state);
  const statePoints = sameState ? WEIGHTS.STATE : 0;

  const availability = availabilityCompatibility(
    mentor.manualAvailabilitySlots,
    mentee.manualAvailabilitySlots
  );
  const availabilityPoints = availability.ratio * WEIGHTS.AVAILABILITY;

  const criteria = [
    { label: 'mentorship services', weight: WEIGHTS.SERVICES, available: servicesHaveData, menteeHasData: desiredServices.length > 0, points: servicePoints },
    { label: 'career alignment', weight: WEIGHTS.CAREER, available: career.hasData, menteeHasData: career.menteeHasData, points: careerPoints },
    { label: 'academic background', weight: WEIGHTS.MAJORS, available: majorsHaveData, menteeHasData: menteeMajors.length > 0, points: majorPoints },
    { label: 'university', weight: WEIGHTS.UNIVERSITY, available: universityHasData, menteeHasData: !!mentee.university, points: universityPoints },
    { label: 'location', weight: WEIGHTS.STATE, available: stateHasData, menteeHasData: !!mentee.state, points: statePoints },
    { label: 'availability', weight: WEIGHTS.AVAILABILITY, available: availability.hasData, menteeHasData: availability.menteeHasData, points: availabilityPoints },
  ];
  const evaluated = criteria.filter(criterion => criterion.available);
  const evaluatedWeight = evaluated.reduce((total, criterion) => total + criterion.weight, 0);
  const earnedPoints = evaluated.reduce((total, criterion) => total + criterion.points, 0);
  const confidencePercentage = Math.round((evaluatedWeight / MAX_SCORE) * 100);
  const confidenceLabel = confidencePercentage >= 80
    ? 'high'
    : confidencePercentage >= 50 ? 'medium' : 'low';

  return {
    score: evaluatedWeight > 0 ? Math.round((earnedPoints / evaluatedWeight) * 100) : 0,
    confidence: {
      percentage: confidencePercentage,
      label: confidenceLabel,
      evaluatedCriteria: evaluated.map(criterion => criterion.label),
      missingCriteria: criteria.filter(criterion => !criterion.available).map(criterion => criterion.label),
      menteeMissingCriteria: criteria.filter(criterion => !criterion.menteeHasData).map(criterion => criterion.label),
    },
    breakdown: {
      sharedTags: sharedTagsList,
      sharedMajors: sharedMajorsList,
      sameUniversity,
      sameState,
      availabilityOverlap: availability.overlapMinutes > 0,
      availabilityOverlapMinutes: availability.overlapMinutes,
      careerAlignment: Math.round(career.ratio * 100),
      points: {
        tags: Math.round(servicePoints * 10) / 10,
        career: Math.round(careerPoints * 10) / 10,
        majors: Math.round(majorPoints * 10) / 10,
        university: universityPoints,
        state: statePoints,
        availability: Math.round(availabilityPoints * 10) / 10,
      },
      evaluatedWeight,
    },
  };
}

async function getRankedMentors(menteeId) {
  const mentee = await User.findById(menteeId).select('-password');
  if (!mentee || mentee.role !== 'mentee') {
    const err = new Error('Mentee not found');
    err.status = 404;
    throw err;
  }

  const allMentors = await User.find({ role: 'mentor', hasCompletedProfile: true })
    .select('-password');

  const preferredGender = mentee.menteeProfile?.preferredMentorGender;
  const genderFiltered = preferredGender
    ? allMentors.filter(mentor => mentor.gender === preferredGender)
    : allMentors;
  if (genderFiltered.length === 0) return [];

  const mentorIds = genderFiltered.map(mentor => mentor._id);
  const activeCounts = await Match.aggregate([
    { $match: { mentor: { $in: mentorIds }, status: 'active' } },
    { $group: { _id: '$mentor', count: { $sum: 1 } } },
  ]);
  const activeCountMap = {};
  for (const { _id, count } of activeCounts) activeCountMap[_id.toString()] = count;

  const capacityFiltered = genderFiltered.filter(mentor => {
    const max = mentor.mentorProfile?.maxMentees;
    if (!max) return true;
    return (activeCountMap[mentor._id.toString()] || 0) < max;
  });

  const scored = capacityFiltered.map(mentor => {
    const { score, confidence, breakdown } = scoreCandidate(mentor, mentee);
    // Keep the displayed compatibility score independent, but prevent a high
    // score based on sparse data from becoming the top recommendation.
    const rankingScore = score * (0.5 + confidence.percentage / 200);
    return { mentor, compatibilityScore: score, confidence, breakdown, rankingScore };
  });
  scored.sort((a, b) =>
    b.rankingScore - a.rankingScore ||
    b.compatibilityScore - a.compatibilityScore ||
    b.confidence.percentage - a.confidence.percentage
  );

  return scored;
}

module.exports = { getRankedMentors, scoreCandidate, careerCompatibility };
