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
    mentee.profilePicture = req.body.profilePicture;
    mentee.state = req.body.state;
    mentee.timeZone = req.body.timeZone;
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

module.exports = router;
