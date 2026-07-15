const express = require('express');
const router = express.Router();
const Session = require('../models/Session');
const User = require('../models/User');
const Match = require('../models/Match');
const requireAuth = require('../middleware/requireAuth');
const { scheduleSessionOnGoogleCalendar, updateSessionOnGoogleCalendar, deleteSessionFromGoogleCalendar } = require('../services/googleCalendarService');
const { sendNotification } = require('../services/notificationService');

const MIN_LEAD_TIME_MS = 48 * 60 * 60 * 1000;

async function createMenteeSession({ mentorId, menteeId, scheduledTime, service, details, oldScheduledTime = null }) {
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
    const calendarResult = await scheduleSessionOnGoogleCalendar(mentor, mentee, session);
    if (calendarResult) {
        session.link = calendarResult.meetLink;
        session.googleCalendarEventId = calendarResult.googleCalendarEventId;
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

    if (oldScheduledTime) {
        const oldDate = new Date(oldScheduledTime);
        const formattedOldDate = oldDate.toLocaleDateString(undefined, { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        const formattedOldTime = oldDate.toLocaleTimeString(undefined, { 
            hour: 'numeric', 
            minute: '2-digit' 
        });

        sendNotification({
            recipientId: mentorId,
            senderId: menteeId,
            type: 'session_rescheduled',
            title: 'Session Rescheduled',
            message: `${mentee.firstName} ${mentee.lastName} rescheduled their session originally on ${formattedOldDate} at ${formattedOldTime} to ${formattedDate} at ${formattedTime}.`,
            relatedId: session._id,
            relatedModel: 'Session',
            metadata: { 
                session, 
                oldScheduledTime 
            }
        }).catch(err => {
            console.error('Asynchronous notification dispatch failed:', err);
        });
    } else {
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
    }

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

// PUT /api/sessions/:id/reschedule — updates the session in place (can be called by mentor or mentee)
router.put('/:id/reschedule', requireAuth, async (req, res) => {
    try {
        const { scheduledTime, service, details } = req.body;
        const session = await Session.findOne({
            _id: req.params.id,
            $or: [{ mentee: req.user.id }, { mentor: req.user.id }]
        });
        if (!session) {
            return res.status(404).json({ error: 'Session not found or access denied.' });
        }
        if (session.scheduledTime.getTime() < Date.now() + MIN_LEAD_TIME_MS) {
            return res.status(400).json({ error: 'Sessions can only be rescheduled at least 48 hours in advance.' });
        }
        if (new Date(scheduledTime).getTime() < Date.now() + MIN_LEAD_TIME_MS) {
            return res.status(400).json({ error: 'Sessions must be rescheduled at least 48 hours in advance.' });
        }

        const oldScheduledTime = session.scheduledTime;

        // Update session properties
        session.scheduledTime = new Date(scheduledTime);
        if (service !== undefined) session.service = service;
        if (details !== undefined) session.details = details;

        await session.save();

        // Update on Google Calendar if event exists
        const mentor = await User.findById(session.mentor);
        const mentee = await User.findById(session.mentee);
        if (mentor && mentee && session.googleCalendarEventId) {
            await updateSessionOnGoogleCalendar(mentor, mentee, session);
        }

        // Prepare formats for notification and email
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

        const oldDate = new Date(oldScheduledTime);
        const formattedOldDate = oldDate.toLocaleDateString(undefined, { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        const formattedOldTime = oldDate.toLocaleTimeString(undefined, { 
            hour: 'numeric', 
            minute: '2-digit' 
        });

        // Determine who initiated the reschedule
        const isMentor = String(session.mentor) === req.user.id;
        const recipientId = isMentor ? session.mentee : session.mentor;
        const senderId = isMentor ? session.mentor : session.mentee;
        const actorName = isMentor ? `${mentor.firstName} ${mentor.lastName}` : `${mentee.firstName} ${mentee.lastName}`;
        const message = `${actorName} rescheduled the session originally on ${formattedOldDate} at ${formattedOldTime} to ${formattedDate} at ${formattedTime}.`;

        sendNotification({
            recipientId,
            senderId,
            type: 'session_rescheduled',
            title: 'Session Rescheduled',
            message,
            relatedId: session._id,
            relatedModel: 'Session',
            metadata: { 
                session, 
                oldScheduledTime 
            }
        }).catch(err => {
            console.error('Asynchronous notification dispatch failed:', err);
        });

        res.status(200).json(session);
    } catch (err) {
        res.status(err.status || 500).json({ error: err.message });
    }
});

router.get('/mentor/:mentorId/booked', requireAuth, async (req, res) => {
    try {
        // 1. Fetch scheduled mentorship sessions from the database
        const sessions = await Session.find({ mentor: req.params.mentorId, status: 'scheduled' })
            .select('scheduledTime');

        // 2. Fetch the mentor's user document to check Google Calendar busy slots
        const mentor = await User.findById(req.params.mentorId).select('calendarBusySlots');

        if (mentor && mentor.calendarBusySlots && mentor.calendarBusySlots.length > 0) {
            const now = new Date();
            // Start from 2 days ago to cover current week views and timezone boundary shifts
            const startTimeLimit = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
            startTimeLimit.setMinutes(0, 0, 0);

            // Look up to 45 days in the future
            const endTimeLimit = new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000);

            // Convert existing sessions' scheduled times to a Set of timestamps for quick lookup and de-duplication
            const existingBookings = new Set(sessions.map(s => new Date(s.scheduledTime).getTime()));

            for (let time = startTimeLimit.getTime(); time <= endTimeLimit.getTime(); time += 60 * 60 * 1000) {
                // If there's already a mentorship session at this hour, skip to avoid duplicates
                if (existingBookings.has(time)) continue;

                const slotStart = new Date(time);
                const slotEnd = new Date(time + 60 * 60 * 1000);

                const isBusy = mentor.calendarBusySlots.some(busy => {
                    const busyStart = new Date(busy.start);
                    const busyEnd = new Date(busy.end);
                    return busyStart < slotEnd && busyEnd > slotStart;
                });

                if (isBusy) {
                    sessions.push({ scheduledTime: slotStart });
                }
            }
        }

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

// PUT /api/sessions/:id/cancel - Cancel a scheduled session (mentor or mentee)
router.put('/:id/cancel', requireAuth, async (req, res) => {
    try {
        const session = await Session.findOne({
            _id: req.params.id,
            status: 'scheduled',
            $or: [{ mentee: req.user.id }, { mentor: req.user.id }]
        });
        if (!session) {
            return res.status(404).json({ error: 'Session not found, already cancelled, or access denied.' });
        }

        if (session.scheduledTime.getTime() < Date.now() + MIN_LEAD_TIME_MS) {
            return res.status(400).json({ error: 'Sessions can only be cancelled at least 48 hours in advance.' });
        }

        session.status = 'cancelled';
        await session.save();

        const mentor = await User.findById(session.mentor);
        const mentee = await User.findById(session.mentee);

        // Delete from Google Calendar if event exists
        if (mentor && mentee && session.googleCalendarEventId) {
            try {
                await deleteSessionFromGoogleCalendar(mentor, mentee, session.googleCalendarEventId);
            } catch (calErr) {
                console.error('Error deleting event from Google Calendar during cancellation:', calErr);
            }
        }

        // Clean up cached calendarBusySlots for both users
        const sessionStart = new Date(session.scheduledTime);
        const durationMin = session.duration || 60;
        const sessionEnd = new Date(sessionStart.getTime() + durationMin * 60 * 1000);

        if (mentor && mentor.calendarBusySlots && mentor.calendarBusySlots.length > 0) {
            mentor.calendarBusySlots = mentor.calendarBusySlots.filter(busy => {
                const busyStart = new Date(busy.start);
                const busyEnd = new Date(busy.end);
                return !(busyStart < sessionEnd && busyEnd > sessionStart);
            });
            await mentor.save();
        }

        if (mentee && mentee.calendarBusySlots && mentee.calendarBusySlots.length > 0) {
            mentee.calendarBusySlots = mentee.calendarBusySlots.filter(busy => {
                const busyStart = new Date(busy.start);
                const busyEnd = new Date(busy.end);
                return !(busyStart < sessionEnd && busyEnd > sessionStart);
            });
            await mentee.save();
        }

        // Send notifications
        const isMentor = String(session.mentor) === req.user.id;
        const recipientId = isMentor ? session.mentee : session.mentor;
        const senderId = isMentor ? session.mentor : session.mentee;
        const actorName = isMentor ? `${mentor.firstName} ${mentor.lastName}` : `${mentee.firstName} ${mentee.lastName}`;

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

        const message = `${actorName} cancelled the session scheduled for ${formattedDate} at ${formattedTime}.`;

        sendNotification({
            recipientId,
            senderId,
            type: 'session_cancelled',
            title: 'Session Cancelled',
            message,
            relatedId: session._id,
            relatedModel: 'Session',
            metadata: { session }
        }).catch(err => {
            console.error('Asynchronous notification dispatch failed:', err);
        });

        res.status(200).json(session);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
