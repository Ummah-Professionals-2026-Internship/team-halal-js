// Single source of truth for the services a mentor can offer.
// `id` must match the values stored on the mentor profile (volunteeringFor).
export const MENTOR_SERVICES = [
  {
    id: 'healthcare service',
    label: 'Healthcare Service',
    description: 'Guidance for healthcare and medical career paths.',
    icon: 'heart',
  },
  {
    id: 'mentorship program',
    label: 'Mentorship Program',
    description: 'Ongoing one-on-one mentorship for mentees.',
    icon: 'users',
  },
  {
    id: 'resume review',
    label: 'Resume Review',
    description: 'Detailed feedback to sharpen a resume.',
    icon: 'document',
  },
  {
    id: 'mock interview',
    label: 'Mock Interview',
    description: 'Practice interviews with real-time feedback.',
    icon: 'chat',
  },
  {
    id: 'general career advice',
    label: 'General Career Advice',
    description: 'Broad guidance on career growth and direction.',
    icon: 'bulb',
  },
]
