const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const User = require('../models/User');

const SAMPLE_MENTORS = [
  {
    firstName: 'Bilal',
    lastName: 'Ahmed',
    email: 'bilal.ahmed.sample@example.com',
    password: 'Password123!',
    role: 'mentor',
    gender: 'male',
    state: 'CA',
    phone: '555-010-1001',
    referralSource: 'LinkedIn',
    university: 'Massachusetts Institute of Technology (MIT)',
    majors: ['Computer Science'],
    linkedinUrl: 'https://linkedin.com/in/sample-bilal-ahmed',
    hasCompletedProfile: true,
    calendarAccess: false,
    manualAvailabilitySlots: [
      { day: 'Monday', startTime: '14:00', endTime: '18:00' },
      { day: 'Wednesday', startTime: '14:00', endTime: '18:00' },
      { day: 'Thursday', startTime: '09:00', endTime: '13:00' }
    ],
    mentorProfile: {
      jobTitle: 'Staff Backend Engineer',
      employer: 'Google',
      industry: 'Software / Tech',
      yearsOfProfExp: 8,
      maxMentees: 3,
      frequency: 'bi-weekly',
      volunteeringFor: ['general career advice', 'resume/portfolio review', 'mock interview'],
      customMeetingLink: 'https://meet.google.com/sample-bilal-meet'
    }
  },
  {
    firstName: 'Amina',
    lastName: 'Al-Sayed',
    email: 'amina.alsayed.sample@example.com',
    password: 'Password123!',
    role: 'mentor',
    gender: 'female',
    state: 'LA',
    phone: '555-010-1002',
    referralSource: 'Friend / Colleague',
    university: 'Stanford University',
    majors: ['Computer Engineering', 'Computer Science'],
    linkedinUrl: 'https://linkedin.com/in/sample-amina-alsayed',
    hasCompletedProfile: true,
    calendarAccess: false,
    manualAvailabilitySlots: [
      { day: 'Thursday', startTime: '09:00', endTime: '14:00' },
      { day: 'Tuesday', startTime: '16:00', endTime: '20:00' }
    ],
    mentorProfile: {
      jobTitle: 'Senior Full-Stack Engineer',
      employer: 'Microsoft',
      industry: 'Software / Tech',
      yearsOfProfExp: 6,
      maxMentees: 3,
      frequency: 'bi-weekly',
      volunteeringFor: ['general career advice', 'resume/portfolio review', 'mock interview'],
      customMeetingLink: 'https://teams.microsoft.com/sample-amina-meet'
    }
  },
  {
    firstName: 'Tariq',
    lastName: 'Mansour',
    email: 'tariq.mansour.sample@example.com',
    password: 'Password123!',
    role: 'mentor',
    gender: 'male',
    state: 'NJ',
    phone: '555-010-1003',
    referralSource: 'Community Event',
    university: 'New Jersey Institute of Technology',
    majors: ['Computer Engineering'],
    linkedinUrl: 'https://linkedin.com/in/sample-tariq-mansour',
    hasCompletedProfile: true,
    calendarAccess: false,
    manualAvailabilitySlots: [
      { day: 'Thursday', startTime: '09:00', endTime: '13:00' },
      { day: 'Saturday', startTime: '10:00', endTime: '14:00' }
    ],
    mentorProfile: {
      jobTitle: 'Principal Cloud & Systems Engineer',
      employer: 'Amazon Web Services (AWS)',
      industry: 'Cloud Infrastructure',
      yearsOfProfExp: 10,
      maxMentees: 4,
      frequency: 'bi-weekly',
      volunteeringFor: ['general career advice', 'resume/portfolio review', 'mock interview'],
      customMeetingLink: 'https://zoom.us/j/sample-tariq-zoom'
    }
  },
  {
    firstName: 'Fatima',
    lastName: 'Hassan',
    email: 'fatima.hassan.sample@example.com',
    password: 'Password123!',
    role: 'mentor',
    gender: 'female',
    state: 'NJ',
    phone: '555-010-1004',
    referralSource: 'LinkedIn',
    university: 'University of Chicago',
    majors: ['Computer Science'],
    linkedinUrl: 'https://linkedin.com/in/sample-fatima-hassan',
    hasCompletedProfile: true,
    calendarAccess: false,
    manualAvailabilitySlots: [
      { day: 'Monday', startTime: '18:00', endTime: '21:00' },
      { day: 'Thursday', startTime: '18:00', endTime: '21:00' }
    ],
    mentorProfile: {
      jobTitle: 'Lead Frontend & Mobile Engineer',
      employer: 'Stripe',
      industry: 'Software / Tech',
      yearsOfProfExp: 5,
      maxMentees: 2,
      frequency: 'monthly',
      volunteeringFor: ['general career advice', 'resume/portfolio review'],
      customMeetingLink: 'https://meet.google.com/sample-fatima-meet'
    }
  },
  {
    firstName: 'Zayd',
    lastName: 'Khan',
    email: 'zayd.khan.sample@example.com',
    password: 'Password123!',
    role: 'mentor',
    gender: 'male',
    state: 'NY',
    phone: '555-010-1005',
    referralSource: 'Instagram',
    university: 'University of California, Berkeley (UC Berkeley)',
    majors: ['Computer Engineering', 'Electrical Engineering'],
    linkedinUrl: 'https://linkedin.com/in/sample-zayd-khan',
    hasCompletedProfile: true,
    calendarAccess: false,
    manualAvailabilitySlots: [
      { day: 'Wednesday', startTime: '17:00', endTime: '20:00' },
      { day: 'Saturday', startTime: '13:00', endTime: '17:00' }
    ],
    mentorProfile: {
      jobTitle: 'Senior AI & ML Infrastructure Engineer',
      employer: 'OpenAI',
      industry: 'Artificial Intelligence',
      yearsOfProfExp: 7,
      maxMentees: 3,
      frequency: 'bi-weekly',
      volunteeringFor: ['resume/portfolio review', 'mock interview'],
      customMeetingLink: 'https://zoom.us/j/sample-zayd-zoom'
    }
  },
  {
    firstName: 'Mariam',
    lastName: 'Malik',
    email: 'mariam.malik.sample@example.com',
    password: 'Password123!',
    role: 'mentor',
    gender: 'female',
    state: 'NY',
    phone: '555-010-1006',
    referralSource: 'LinkedIn',
    university: 'New Jersey Institute of Technology',
    majors: ['Computer Engineering', 'Software Engineering'],
    linkedinUrl: 'https://linkedin.com/in/sample-mariam-malik',
    hasCompletedProfile: true,
    calendarAccess: false,
    manualAvailabilitySlots: [
      { day: 'Thursday', startTime: '10:00', endTime: '13:00' },
      { day: 'Friday', startTime: '14:00', endTime: '17:00' }
    ],
    mentorProfile: {
      jobTitle: 'Engineering Manager (Software Infrastructure)',
      employer: 'Meta',
      industry: 'Software / Tech',
      yearsOfProfExp: 9,
      maxMentees: 2,
      frequency: 'bi-weekly',
      volunteeringFor: ['general career advice', 'mock interview'],
      customMeetingLink: 'https://meet.google.com/sample-mariam-meet'
    }
  }
];

const SAMPLE_MENTEES = [
  {
    firstName: 'Youssef',
    lastName: 'Omar',
    email: 'youssef.omar.sample@example.com',
    password: 'Password123!',
    role: 'mentee',
    gender: 'male',
    state: 'MI',
    phone: '555-020-2001',
    referralSource: 'University Club',
    university: 'University of Michigan',
    majors: ['Computer Science'],
    linkedinUrl: 'https://linkedin.com/in/sample-youssef-omar',
    hasCompletedProfile: true,
    calendarAccess: false,
    manualAvailabilitySlots: [
      { day: 'Monday', startTime: '15:00', endTime: '19:00' },
      { day: 'Wednesday', startTime: '15:00', endTime: '19:00' }
    ],
    menteeProfile: {
      academicStatus: 'Senior (Year 4)',
      desiredCareer: 'Software Engineer (Backend)',
      desiredServices: ['resume/portfolio review', 'mock interview'],
      preferredMentorGender: ''
    }
  },
  {
    firstName: 'Zahra',
    lastName: 'Ibrahim',
    email: 'zahra.ibrahim.sample@example.com',
    password: 'Password123!',
    role: 'mentee',
    gender: 'female',
    state: 'CA',
    phone: '555-020-2002',
    referralSource: 'Friend / Colleague',
    university: 'University of California, Los Angeles (UCLA)',
    majors: ['Computer Science', 'Software Engineering'],
    linkedinUrl: 'https://linkedin.com/in/sample-zahra-ibrahim',
    hasCompletedProfile: true,
    calendarAccess: false,
    manualAvailabilitySlots: [
      { day: 'Tuesday', startTime: '10:00', endTime: '14:00' },
      { day: 'Thursday', startTime: '10:00', endTime: '14:00' }
    ],
    menteeProfile: {
      academicStatus: 'Junior (Year 3)',
      desiredCareer: 'Full-Stack Software Engineer',
      desiredServices: ['general career advice', 'resume/portfolio review'],
      preferredMentorGender: 'female'
    }
  },
  {
    firstName: 'Hamza',
    lastName: 'Kassis',
    email: 'hamza.kassis.sample@example.com',
    password: 'Password123!',
    role: 'mentee',
    gender: 'male',
    state: 'NY',
    phone: '555-020-2003',
    referralSource: 'LinkedIn',
    university: 'New York University (NYU)',
    majors: ['Computer Science', 'Data Science'],
    linkedinUrl: 'https://linkedin.com/in/sample-hamza-kassis',
    hasCompletedProfile: true,
    calendarAccess: false,
    manualAvailabilitySlots: [
      { day: 'Friday', startTime: '12:00', endTime: '16:00' },
      { day: 'Saturday', startTime: '14:00', endTime: '18:00' }
    ],
    menteeProfile: {
      academicStatus: 'Graduate Student',
      desiredCareer: 'Machine Learning Infrastructure Engineer',
      desiredServices: ['mock interview', 'general career advice'],
      preferredMentorGender: ''
    }
  },
  {
    firstName: 'Sumaya',
    lastName: 'Patel',
    email: 'sumaya.patel.sample@example.com',
    password: 'Password123!',
    role: 'mentee',
    gender: 'female',
    state: 'TX',
    phone: '555-020-2004',
    referralSource: 'Instagram',
    university: 'University of Texas at Austin',
    majors: ['Computer Science'],
    linkedinUrl: 'https://linkedin.com/in/sample-sumaya-patel',
    hasCompletedProfile: true,
    calendarAccess: false,
    manualAvailabilitySlots: [
      { day: 'Monday', startTime: '17:00', endTime: '20:00' },
      { day: 'Thursday', startTime: '17:00', endTime: '20:00' }
    ],
    menteeProfile: {
      academicStatus: 'Sophomore (Year 2)',
      desiredCareer: 'Mobile App Developer',
      desiredServices: ['general career advice', 'mock interview'],
      preferredMentorGender: ''
    }
  }
];

async function seedDatabase() {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mentorship_db';
    console.log('Connecting to MongoDB at:', uri);
    await mongoose.connect(uri);

    const allProfiles = [...SAMPLE_MENTORS, ...SAMPLE_MENTEES];
    let createdCount = 0;
    let updatedCount = 0;

    for (const profile of allProfiles) {
      let existingUser = await User.findOne({ email: profile.email });
      if (existingUser) {
        Object.assign(existingUser, profile);
        await existingUser.save();
        updatedCount++;
        console.log(`Updated software engineering profile: ${profile.firstName} ${profile.lastName} (${profile.role})`);
      } else {
        const newUser = new User(profile);
        await newUser.save();
        createdCount++;
        console.log(`Created software engineering profile: ${profile.firstName} ${profile.lastName} (${profile.role})`);
      }
    }

    console.log(`\nSEEDED_SWE_PROFILES_SUCCESSFULLY: Created ${createdCount}, Updated ${updatedCount}`);
  } catch (error) {
    console.error('Error seeding sample profiles:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seedDatabase();
