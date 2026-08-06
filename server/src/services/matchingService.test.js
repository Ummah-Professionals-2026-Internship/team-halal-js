const test = require('node:test');
const assert = require('node:assert/strict');
const User = require('../models/User');
const Match = require('../models/Match');
const {
  careerCompatibility,
  getRankedMentors,
  scoreCandidate,
} = require('./matchingService');

function profilePair(overrides = {}) {
  const mentor = {
    _id: { toString: () => 'mentor-1' },
    role: 'mentor',
    gender: 'male',
    hasCompletedProfile: true,
    mentorProfile: {
      jobTitle: 'Software Engineer',
      industry: 'Technology',
      volunteeringFor: ['general career advice'],
    },
    majors: ['Computer Science'],
    university: 'Rutgers',
    state: 'NJ',
    manualAvailabilitySlots: [
      { day: 'Monday', startTime: '9:00 AM', endTime: '11:00 AM' },
    ],
    ...overrides.mentor,
  };
  const mentee = {
    _id: { toString: () => 'mentee-1' },
    role: 'mentee',
    menteeProfile: {
      desiredCareer: 'Software Engineer',
      desiredServices: ['general career advice'],
      preferredMentorGender: '',
    },
    majors: ['Computer Science'],
    university: 'Rutgers',
    state: 'NJ',
    manualAvailabilitySlots: [
      { day: 'Monday', startTime: '9:00 AM', endTime: '11:00 AM' },
    ],
    ...overrides.mentee,
  };
  return { mentor, mentee };
}

test('a complete identical profile pair can reach 100%', () => {
  const { mentor, mentee } = profilePair();
  const result = scoreCandidate(mentor, mentee);

  assert.equal(result.score, 100);
  assert.equal(result.confidence.percentage, 100);
  assert.equal(result.breakdown.careerAlignment, 100);
});

test('job title is considered when measuring career alignment', () => {
  const result = careerCompatibility(
    { jobTitle: 'Software Engineer', industry: 'Technology' },
    'Software Engineer'
  );

  assert.equal(result.ratio, 1);
});

test('career wording mismatch lowers score but does not hide mentor', async t => {
  const { mentor, mentee } = profilePair({
    mentee: {
      menteeProfile: {
        desiredCareer: 'Dentist',
        desiredServices: ['general career advice'],
        preferredMentorGender: '',
      },
    },
  });
  const originalFindById = User.findById;
  const originalFind = User.find;
  const originalAggregate = Match.aggregate;
  t.after(() => {
    User.findById = originalFindById;
    User.find = originalFind;
    Match.aggregate = originalAggregate;
  });
  User.findById = () => ({ select: async () => mentee });
  User.find = () => ({ select: async () => [mentor] });
  Match.aggregate = async () => [];

  const results = await getRankedMentors('mentee-1');

  assert.equal(results.length, 1);
  assert.equal(results[0].mentor, mentor);
  assert.ok(results[0].compatibilityScore < 100);
});
