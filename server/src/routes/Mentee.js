const express = require('express');
const router = express.Router();
const User = require('../models/User');
const requireAuth = require('../middleware/requireAuth');

// Save a new mentee
router.post('/', requireAuth, async (req, res) => {
  try {
    const mentee = await User.findById(req.user.id);
    if(!mentee){
      return res.status(404).json({error: 'Mentee profile not found'});
    }
    mentee.gender = req.body.gender;
    mentee.phone = req.body.phone;
    mentee.linkedinUrl = req.body.linkedinUrl;
    mentee.referralSource = req.body.referralSource;
    if (req.body.profilePicture) mentee.profilePicture = req.body.profilePicture;
    mentee.state = req.body.state;
    mentee.timeZone = req.body.timeZone || mentee.timeZone || req.headers['x-timezone'] || 'UTC';
    mentee.additionalInfo = req.body.additionalInfo;
    mentee.university = req.body.university;
    mentee.majors = req.body.majors;
    mentee.calendarAccess = req.body.calendarAccess;
    mentee.resume = req.body.resume;
    mentee.hasCompletedProfile = true;
    mentee.menteeProfile = {
      academicStatus: req.body.academicStatus,
      desiredCareer: req.body.desiredCareer,
      desiredServices: req.body.desiredServices
    }
    mentee.manualAvailabilitySlots = req.body.manualAvailabilitySlots || [];
    await mentee.save();
    res.status(201).json({ message: 'Mentee saved successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// Get all mentees
router.get('/', requireAuth, async (req, res) => {
  try {
    const mentees = await User.find({role: 'mentee', hasCompletedProfile: true});
    res.json(mentees);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
})

const UPDATABLE_FIELDS = ['firstName', 'lastName', 'email', 'phone', 'state', 'referralSource', 'resume', 'linkedinUrl', 'websiteUrl', 'university', 'majors', 'additionalInfo', 'manualAvailabilitySlots', 'notificationPreferences'];
const UPDATABLE_MENTEE_PROFILE_FIELDS = ['academicStatus', 'desiredCareer', 'desiredServices'];

router.patch('/me', requireAuth, async (req, res) => {
  try {
    const update = {};
    UPDATABLE_FIELDS.forEach(f => { if (req.body[f] !== undefined) update[f] = req.body[f]; });
    UPDATABLE_MENTEE_PROFILE_FIELDS.forEach(f => { if (req.body[f] !== undefined) update[`menteeProfile.${f}`] = req.body[f]; });
    const mentee = await User.findByIdAndUpdate(req.user.id, update, { new: true, runValidators: true });
    res.json(mentee);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
})

module.exports = router;
