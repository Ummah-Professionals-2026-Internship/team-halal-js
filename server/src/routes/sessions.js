const express = require('express');
const router = express.Router();
const Session = require('../models/Session');
const requireAuth = require('../middleware/requireAuth');

router.post('/', requireAuth, async (req, res) => {
    try {
        const { mentorId, scheduledTime, service, details } = req.body;
        const existing = await Session.findOne({ mentee: req.user.id, scheduledTime, status: 'scheduled' });
        if (existing) return res.status(409).json({ error: 'You already have a session at this time.' });
        const session = await Session.create({
            mentor: mentorId,
            mentee: req.user.id,
            scheduledTime,
            service: service || 'mentorship program',
            details,
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
            .populate('mentor', 'firstName lastName profilePicture')
            .sort({ scheduledTime: 1 });
        res.json(sessions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/', requireAuth, async (req, res) => {
    try{
        const sessions = await Session.find({mentor: req.user.id})
        .populate('mentee', 'firstName lastName profilePicture')
        .sort({scheduledTime: 1});
        res.json(sessions);
    }
    catch(err){
        res.status(500).json({ error: err.message});
    }

});


module.exports = router;