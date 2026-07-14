const express = require('express');
const router = express.Router();
const User = require('../models/User');
const requireAuth = require('../middleware/requireAuth');

// Save a new mentor
router.post('/', requireAuth, async (req, res) => {
  try {
    const mentor = await User.findById(req.user.id);
    if(!mentor){
      return res.status(404).json({error: "Mentor profile not found"});
    }
    mentor.gender = req.body.gender;
    mentor.phone = req.body.phone;
    mentor.linkedinUrl = req.body.linkedinUrl;
    mentor.referralSource = req.body.referralSource;
    if (req.body.profilePicture) mentor.profilePicture = req.body.profilePicture;
    mentor.state = req.body.state;
    mentor.timeZone = req.body.timeZone;
    mentor.additionalInfo = req.body.additionalInfo;
    mentor.university = req.body.university;
    mentor.majors = req.body.majors;
    mentor.calendarAccess = req.body.calendarAccess;
    mentor.resume = req.body.resume;
    mentor.hasCompletedProfile = true;
    mentor.mentorProfile = {
      jobTitle: req.body.jobTitle,
      employer: req.body.employer,
      industry: req.body.industry,
      yearsOfProfExp: req.body.yearsOfProfExp,
      maxMentees: req.body.maxMentees,
      frequency: req.body.frequency,
      volunteeringFor: req.body.volunteeringFor || [],
      customMeetingLink: req.body.customMeetingLink
    }
    mentor.manualAvailabilitySlots = req.body.manualAvailabilitySlots || [];
    await mentor.save()
    res.status(201).json(mentor)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// Get all mentors
router.get('/', requireAuth, async (req, res) => {
  try {
    const mentors = await User.find({ role: 'mentor', hasCompletedProfile: true})
    res.json(mentors)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.patch('/me',requireAuth, async (req, res) => {
  try{
    const mentor=await User.findByIdAndUpdate(
      req.user.id,
      {
        manualAvailabilitySlots: req.body.manualAvailabilitySlots
      },
      {
        new:true
      }
    )
      res.json(mentor)

      }
      catch (err) {
    res.status(500).json({ error: err.message })
  }
    
})

module.exports = router