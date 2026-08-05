const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');
const Session = require('../models/Session');
const User = require('../models/User');
const Notification = require('../models/Notification');
const requireAuth = require('../middleware/requireAuth');
const { sendNotification } = require('../services/notificationService');
const { sendFeedbackFollowUpEmail } = require('../services/emailService');

// POST /api/feedback — submit feedback for a completed session
router.post('/', requireAuth, async (req, res) => {
    try {
        const { sessionId, meetingRating, usefulAdviceRating, comments } = req.body;

        if (!meetingRating || !usefulAdviceRating) {
            return res.status(400).json({ error: 'Both ratings are required.' });
        }

        const session = await Session.findOne({
            _id: sessionId,
            $or: [{ mentor: req.user.id }, { mentee: req.user.id }]
        });
        if (!session) {
            return res.status(404).json({ error: 'Session not found or access denied.' });
        }

        const isMentor = String(session.mentor) === req.user.id;
        const about = isMentor ? session.mentee : session.mentor;

        const feedback = await Feedback.create({
            session: sessionId,
            submittedBy: req.user.id,
            about,
            meetingRating,
            usefulAdviceRating,
            comments: comments || ''
        });

        await Notification.updateMany(
            { recipient: req.user.id, relatedId: sessionId, relatedModel: 'Session', type: 'feedback_requested', actionResolved: { $ne: true } },
            { isRead: true, actionResolved: true }
        );

        const submitter = await User.findById(req.user.id);
        const submitterName = `${submitter.firstName} ${submitter.lastName}`.trim();
        const lowScore = Math.min(meetingRating, usefulAdviceRating);
        const isNegative = lowScore <= 2;
        const admins = await User.find({ role: 'admin' });
        admins.forEach(admin => {
            sendNotification({
                recipientId: admin._id,
                senderId: req.user.id,
                type: 'feedback_submitted',
                title: isNegative ? 'New negative review submitted' : 'New feedback submitted',
                message: `${submitterName} (${submitter.role === 'mentor' ? 'Mentor' : 'Mentee'}) rated their session ${lowScore}/5${isNegative ? ' — may need a follow-up' : ''}.`,
                relatedId: feedback._id,
                relatedModel: 'Feedback'
            }).catch(err => console.error('Feedback submitted notification failed:', err));
        });

        res.status(201).json(feedback);
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ error: 'You already submitted feedback for this session.' });
        }
        res.status(500).json({ error: err.message });
    }
});

// GET /api/feedback — list all feedback (admin only)
router.get('/', requireAuth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Only admins can view feedback' });
        }
        const feedback = await Feedback.find()
            .populate('submittedBy', 'firstName lastName role')
            .populate('about', 'firstName lastName role')
            .populate('session', 'service scheduledTime')
            .sort({ createdAt: -1 });
        res.json(feedback);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/feedback/session/:sessionId — all feedback for a session, mentor + mentee (admin only)
router.get('/session/:sessionId', requireAuth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Only admins can view feedback' });
        }
        const feedback = await Feedback.find({ session: req.params.sessionId })
            .populate('submittedBy', 'firstName lastName role')
            .populate('about', 'firstName lastName role');
        res.json(feedback);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/feedback/mine/:sessionId — check whether the current user already left feedback for a session
router.get('/mine/:sessionId', requireAuth, async (req, res) => {
    try {
        const existing = await Feedback.findOne({ session: req.params.sessionId, submittedBy: req.user.id });
        res.json({ submitted: !!existing });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/feedback/:id/follow-up — admin follows up on a negative review
router.post('/:id/follow-up', requireAuth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Only admins can send follow-ups' });
        }

        const { message } = req.body;
        if (!message || !message.trim()) {
            return res.status(400).json({ error: 'A message is required.' });
        }

        const feedback = await Feedback.findById(req.params.id).populate('submittedBy');
        if (!feedback) {
            return res.status(404).json({ error: 'Feedback not found' });
        }

        await sendNotification({
            recipientId: feedback.submittedBy._id,
            type: 'feedback_followup',
            title: "We'd love to hear from you",
            message,
            relatedId: feedback._id,
            relatedModel: 'Feedback'
        });

        sendFeedbackFollowUpEmail(feedback.submittedBy, message).catch(err => {
            console.error('Feedback follow-up email failed:', err);
        });

        feedback.followedUpAt = new Date();
        await feedback.save();

        res.json(feedback);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/feedback/:id/reply — the reviewer replies to an admin's follow-up
router.post('/:id/reply', requireAuth, async (req, res) => {
    try {
        const { reply } = req.body;
        if (!reply || !reply.trim()) {
            return res.status(400).json({ error: 'A reply is required.' });
        }

        const feedback = await Feedback.findOne({ _id: req.params.id, submittedBy: req.user.id })
            .populate('submittedBy', 'firstName lastName');
        if (!feedback) {
            return res.status(404).json({ error: 'Feedback not found or access denied.' });
        }

        feedback.followUpReply = reply;
        feedback.followUpRepliedAt = new Date();
        await feedback.save();

        await Notification.updateMany(
            { recipient: req.user.id, relatedId: feedback._id, relatedModel: 'Feedback', type: 'feedback_followup', actionResolved: { $ne: true } },
            { isRead: true, actionResolved: true }
        );

        const reviewerName = `${feedback.submittedBy.firstName} ${feedback.submittedBy.lastName}`.trim();
        const admins = await User.find({ role: 'admin' });
        admins.forEach(admin => {
            sendNotification({
                recipientId: admin._id,
                senderId: feedback.submittedBy._id,
                type: 'feedback_reply',
                title: 'New reply to your follow-up',
                message: `${reviewerName} replied: "${reply}"`,
                relatedId: feedback._id,
                relatedModel: 'Feedback'
            }).catch(err => console.error('Feedback reply notification failed:', err));
        });

        res.json(feedback);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
