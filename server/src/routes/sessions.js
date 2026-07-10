const express = require('express');
const router = express.Router();
const Session = require('../models/Session');
const User = require('../models/User');
const Match = require('../models/Match');
const requireAuth = require('../middleware/requireAuth');
const { scheduleSessionOnGoogleCalendar } = require('../services/googleCalendarService');
const { sendNotification } = require('../services/notificationService');

const MIN_LEAD_TIME_MS = 48 * 60 * 60 * 1000;

async function createMenteeSession({ mentorId, menteeId, scheduledTime, service, details }) {
    if (new Date(scheduledTime).getTime() < Date.now() + MIN_LEAD_TIME_MS) {
        const err = new Error('Sessions must be scheduled at least 48 hours in advance.');
        err.status = 400;
        throw err;
    }

    const existing = await Session.findOne({ mentee: menteeId, scheduledTime, status: 'scheduled' });
    if (existing) {
        const err = new Error('You already have a session at this time.');
        err.status = 409;
        throw err;
    }

    // Fetch mentor and mentee documents
    const mentor = await User.findById(mentorId);
    const mentee = await User.findById(menteeId);

    if (!mentor) {
        const err = new Error('Mentor not found.');
        err.status = 404;
        throw err;
    }
    if (!mentee) {
        const err = new Error('Mentee not found.');
        err.status = 404;
        throw err;
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

    // Dispatch unified notification asynchronously (does not block response)
    const sessionDate = new Date(session.scheduledTime);
    const formattedDate = sessionDate.toLocaleDateString(undefined, { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    const formattedTime = sessionDate.toLocaleTimeString(undefined, { 
        hour: 'numeric', 
        minute: '2-digit' 
    });

    sendNotification({
        recipientId: mentorId,
        senderId: menteeId,
        type: 'session_booked',
        title: 'New Session Scheduled',
        message: `${mentee.firstName} ${mentee.lastName} booked a mentorship session with you for ${formattedDate} at ${formattedTime}.`,
        relatedId: session._id,
        relatedModel: 'Session',
        metadata: { session }
    }).catch(err => {
        console.error('Asynchronous notification dispatch failed:', err);
    });

    return session;
}

router.post('/', requireAuth, async (req, res) => {
    try {
        const { mentorId, scheduledTime, service, details } = req.body;
        const session = await createMenteeSession({ mentorId, menteeId: req.user.id, scheduledTime, service, details });
        res.status(201).json(session);
    } catch (err) {
        res.status(err.status || 500).json({ error: err.message });
    }
});

// PUT /api/sessions/:id/reschedule — deletes the mentee's existing session and books a new one in its place
router.put('/:id/reschedule', requireAuth, async (req, res) => {
    try {
        const { scheduledTime, service, details } = req.body;
        const oldSession = await Session.findOne({ _id: req.params.id, mentee: req.user.id });
        if (!oldSession) {
            return res.status(404).json({ error: 'Session not found.' });
        }
        if (oldSession.scheduledTime.getTime() < Date.now() + MIN_LEAD_TIME_MS) {
            return res.status(400).json({ error: 'Sessions can only be rescheduled at least 48 hours in advance.' });
        }

        const mentorId = oldSession.mentor;
        await Session.deleteOne({ _id: oldSession._id });

        const session = await createMenteeSession({
            mentorId,
            menteeId: req.user.id,
            scheduledTime,
            service: service || oldSession.service,
            details: details !== undefined ? details : oldSession.details
        });
        res.status(201).json(session);
    } catch (err) {
        res.status(err.status || 500).json({ error: err.message });
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
            .populate('mentor', 'firstName lastName profilePicture email manualAvailabilitySlots mentorProfile majors university linkedinUrl')
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
