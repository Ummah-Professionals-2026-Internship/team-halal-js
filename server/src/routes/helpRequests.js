const express = require('express');
const router = express.Router();
const HelpRequest = require('../models/HelpRequest');
const User = require('../models/User');
const requireAuth = require('../middleware/requireAuth');
const { sendNotification } = require('../services/notificationService');

// POST /api/help-requests — submit a new help request
router.post('/', requireAuth, async (req, res) => {
    try {
        const { topics, message } = req.body;
        const helpRequest = await HelpRequest.create({
            user: req.user.id,
            topics: topics || [],
            message: message || ''
        });

        const requester = await User.findById(req.user.id);
        const requesterName = `${requester.firstName} ${requester.lastName}`.trim();
        const admins = await User.find({ role: 'admin' });
        admins.forEach(admin => {
            sendNotification({
                recipientId: admin._id,
                senderId: req.user.id,
                type: 'help_request_submitted',
                title: 'New Help Request',
                message: `${requesterName} (${requester.role === 'mentor' ? 'Mentor' : 'Mentee'}) asked for help${topics?.length ? `: ${topics.join(', ')}` : ''}`,
                relatedId: helpRequest._id,
                relatedModel: 'HelpRequest'
            }).catch(err => console.error('Help request notification failed:', err));
        });

        res.status(201).json(helpRequest);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// GET /api/help-requests — list all help requests (admin only)
router.get('/', requireAuth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Only admins can view help requests' });
        }
        const helpRequests = await HelpRequest.find()
            .populate('user', 'firstName lastName role')
            .sort({ createdAt: -1 });
        res.json(helpRequests);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PATCH /api/help-requests/:id/respond — admin sends a response to a help request
router.patch('/:id/respond', requireAuth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Only admins can respond to help requests' });
        }
        const { response } = req.body;
        if (!response || !response.trim()) {
            return res.status(400).json({ error: 'A response is required' });
        }

        const helpRequest = await HelpRequest.findById(req.params.id);
        if (!helpRequest) {
            return res.status(404).json({ error: 'Help request not found' });
        }

        helpRequest.response = response;
        helpRequest.status = 'resolved';
        await helpRequest.save();

        sendNotification({
            recipientId: helpRequest.user,
            senderId: req.user.id,
            type: 'help_request_response',
            title: 'The Ummah Professionals team responded to your help request',
            message: response,
            relatedId: helpRequest._id,
            relatedModel: 'HelpRequest'
        }).catch(err => {
            console.error('Asynchronous notification dispatch failed:', err);
        });

        res.json(helpRequest);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
