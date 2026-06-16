const express = require('express')
const router = express.Router()
const Mentor = require('../models/Mentor')

// Save a new mentor
router.post('/', async (req, res) => {
  try {
    const mentor = new Mentor(req.body)
    await mentor.save()
    res.status(201).json(mentor)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// Get all mentors
router.get('/', async (req, res) => {
  try {
    const mentors = await Mentor.find()
    res.json(mentors)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router