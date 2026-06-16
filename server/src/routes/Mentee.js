const express = require('express')
const router = express.Router()
const Mentee = require('../models/Mentee')

// Save a new mentee
router.post('/', async (req, res) => {
  try {
    const mentee = new Mentee(req.body)
    await mentee.save()
    res.status(201).json({ message: 'Mentee saved successfully' })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// Get all mentees
router.get('/', async (req, res) => {
  try {
    const mentees = await Mentee.find()
    res.json(mentees)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
