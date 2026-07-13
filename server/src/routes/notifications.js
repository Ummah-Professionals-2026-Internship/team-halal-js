const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const User = require('../models/User');
const requireAuth = require('../middleware/requireAuth');

// GET /api/notifications - Get all notifications for logged-in user
router.get('/', requireAuth, async (req, res) => {
  try {
    const recipientId = req.user.id;
    // Retrieve all notifications for recipient, sorted by isRead (unreads first) then newest first
    const notifications = await Notification.find({ recipient: recipientId })
      .populate('sender', 'firstName lastName profilePicture')
      .sort({ isRead: 1, createdAt: -1 });
    
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/notifications/read-all - Mark all notifications as read for logged-in user
router.patch('/read-all', requireAuth, async (req, res) => {
  try {
    const recipientId = req.user.id;
    await Notification.updateMany(
      { recipient: recipientId, isRead: false },
      { $set: { isRead: true } }
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/notifications/:id/read - Mark a specific notification as read
router.patch('/:id/read', requireAuth, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user.id },
      { $set: { isRead: true } },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found or access denied.' });
    }
    res.json(notification);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/notifications/preferences - Get notification preferences for the logged-in user
router.get('/preferences', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    // Return preferences, default to true if not populated
    const preferences = user.notificationPreferences || {
      email: true,
      sms: true,
      inApp: true
    };
    res.json(preferences);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/notifications/preferences - Update notification preferences for the logged-in user
router.patch('/preferences', requireAuth, async (req, res) => {
  try {
    const { email, sms, inApp } = req.body;
    
    // Update fields on notificationPreferences object
    const updateFields = {};
    if (email !== undefined) updateFields['notificationPreferences.email'] = email;
    if (sms !== undefined) updateFields['notificationPreferences.sms'] = sms;
    if (inApp !== undefined) updateFields['notificationPreferences.inApp'] = inApp;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user.notificationPreferences || { email: true, sms: true, inApp: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
