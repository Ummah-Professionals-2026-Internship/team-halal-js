const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
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

module.exports = router;
