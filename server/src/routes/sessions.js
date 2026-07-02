const express = require('express');
const router = express.Router();
const Session = require('../models/Session');
const requireAuth = require('../middleware/requireAuth');

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