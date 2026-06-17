const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/requireAuth');
const { getRankedMentors } = require('../services/matchingService');

// GET /api/matches — ranked mentor suggestions for the logged-in mentee
router.get('/', requireAuth, async (req, res) => {
  try {
    if (req.user.role !== 'mentee') {
      return res.status(403).json({ error: 'Only mentees can view match suggestions' });
    }
    const results = await getRankedMentors(req.user.id);
    res.json(results.map(({ mentor, compatibilityScore }) => ({
      ...mentor.toObject(),
      compatibilityScore
    })));
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

// POST /api/matches — confirm a pairing and create a Match document
// PAUSED: implementation pending Match↔Session relationship design confirmation

module.exports = router;
