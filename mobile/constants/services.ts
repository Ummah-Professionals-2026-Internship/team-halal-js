// Copied from client/src/constants/services.js — kept in sync manually.
// Single source of truth for the service tags used by both mentor
// (mentorProfile.volunteeringFor) and mentee (menteeProfile.desiredServices)
// profiles. `id` must match the enum values on both User.js profile subdocs.
export const MENTOR_SERVICES = [
  {
    id: 'general career advice',
    label: 'General Career Advice',
    description: 'Broad guidance on career growth and direction.',
    icon: 'bulb',
  },
  {
    id: 'resume/portfolio review',
    label: 'Resume/Portfolio Review',
    description: 'Detailed feedback to sharpen a resume or portfolio.',
    icon: 'document',
  },
  {
    id: 'mock interview',
    label: 'Mock Interview',
    description: 'Practice interviews with real-time feedback.',
    icon: 'chat',
  },
]
