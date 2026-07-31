const mongoose = require('mongoose');
require('dotenv').config({ path: 'z:/Developing/Mentorship-App/server/.env' });
const User = require('../models/User');
const Session = require('../models/Session');
const { completePastSessions } = require('../jobs/completeSessionsJob');

async function testFeedbackFlow() {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mentorship_db';
    console.log('Connecting to MongoDB at:', uri);
    await mongoose.connect(uri);

    // 1. Ensure user account for jude@lahagetutoring.com exists
    let mentee = await User.findOne({ email: 'jude@lahagetutoring.com' });
    if (!mentee) {
      console.log('Creating mentee account for jude@lahagetutoring.com...');
      mentee = new User({
        firstName: 'Jude',
        lastName: 'Lahage',
        email: 'jude@lahagetutoring.com',
        password: 'Password123!',
        role: 'mentee',
        hasCompletedProfile: true
      });
      await mentee.save();
    } else {
      mentee.role = 'mentee';
      await mentee.save();
    }
    console.log('Mentee User ID:', mentee._id, mentee.email);

    // 2. Ensure a separate mentor account exists for pairing
    let mentor = await User.findOne({ email: 'tariq.mentor@ummahprofessionals.com' });
    if (!mentor) {
      console.log('Creating sample mentor account...');
      mentor = new User({
        firstName: 'Tariq',
        lastName: 'Mansour',
        email: 'tariq.mentor@ummahprofessionals.com',
        password: 'Password123!',
        role: 'mentor',
        hasCompletedProfile: true
      });
      await mentor.save();
    }
    console.log('Mentor User ID:', mentor._id, mentor.email);

    // 3. Create a past session (2 hours ago)
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    const session = new Session({
      mentor: mentor._id,
      mentee: mentee._id,
      scheduledTime: twoHoursAgo,
      service: 'resume review',
      details: 'Test feedback notification session',
      status: 'scheduled'
    });
    await session.save();
    console.log('Created past test session ID:', session._id, 'scheduled at:', twoHoursAgo);

    // 4. Trigger completion job
    console.log('\nRunning completePastSessions job...');
    await completePastSessions();

    console.log('\nSUCCESS! Check jlahage25@gmail.com inbox for Resend email.');
  } catch (err) {
    console.error('Error during test setup:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

testFeedbackFlow();
