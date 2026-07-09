const express = require('express');
const router = express.Router();
const Session = require('../models/Session');
const User = require('../models/User');
const Match = require('../models/Match');
const requireAuth = require('../middleware/requireAuth');
const { scheduleSessionOnGoogleCalendar } = require('../services/googleCalendarService');
const { sendSessionConfirmationEmail } = require('../services/emailService');

router.post('/', requireAuth, async (req, res) => {
    try {
        const { mentorId, scheduledTime, service, details } = req.body;
        const menteeId = req.user.id;

        const existing = await Session.findOne({ mentee: menteeId, scheduledTime, status: 'scheduled' });
        if (existing) {
            return res.status(409).json({ error: 'You already have a session at this time.' });
        }

        // Fetch mentor and mentee documents
        const mentor = await User.findById(mentorId);
        const mentee = await User.findById(menteeId);

        if (!mentor) {
            return res.status(404).json({ error: 'Mentor not found.' });
        }
        if (!mentee) {
            return res.status(404).json({ error: 'Mentee not found.' });
        }

        // Create the session
        const session = new Session({
            mentor: mentorId,
            mentee: menteeId,
            scheduledTime: new Date(scheduledTime),
            service: service || 'mentorship program',
            details,
            status: 'scheduled'
        });

        // Try to find a match between them and attach it; auto-create if missing
        let match = await Match.findOne({
            mentor: mentorId,
            mentee: menteeId,
            status: 'active'
        });
        if (!match) {
            match = new Match({
                mentor: mentorId,
                mentee: menteeId,
                status: 'active'
            });
            await match.save();
            console.log(`Auto-created active Match document: ${match._id}`);
        }
        session.match = match._id;

        // Generate Google Meet Link if Google Calendar integration is available
        const meetLink = await scheduleSessionOnGoogleCalendar(mentor, mentee, session);
        if (meetLink) {
            session.link = meetLink;
        }

        await session.save();

        // Send confirmation email asynchronously (does not block response)
        sendSessionConfirmationEmail(mentor, mentee, session).catch(err => {
            console.error('Asynchronous email dispatch failed:', err);
        });

        res.status(201).json(session);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/mentor/:mentorId/booked', requireAuth, async (req, res) => {
    try {
        const sessions = await Session.find({ mentor: req.params.mentorId, status: 'scheduled' })
            .select('scheduledTime');
        res.json(sessions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/mentee', requireAuth, async (req, res) => {
    try {
        const sessions = await Session.find({ mentee: req.user.id })
            .populate('mentor', 'firstName lastName profilePicture email')
            .sort({ scheduledTime: 1 });
        res.json(sessions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/', requireAuth, async (req, res) => {
    try {
        // Retrieve sessions for mentors, populating both to be safe
        const sessions = await Session.find({ mentor: req.user.id })
            .populate('mentee', 'firstName lastName profilePicture email')
            .populate('mentor', 'firstName lastName profilePicture email')
            .sort({ scheduledTime: 1 });
        res.json(sessions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
