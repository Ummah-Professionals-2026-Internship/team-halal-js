const mongoose = require('mongoose')

const mentorSchema = new mongoose.Schema({
  name:            { type: String },
  email:           { type: String },
  industry:        { type: String },
  jobTitle:        { type: String },
  linkedinProfile: { type: String },
  experienceLevel: { type: String },
  employer:        { type: String },
  volunteeringFor: { type: String },
  majors:          { type: String },
  almaMater:       { type: String },
  countyState:     { type: String },
  additionalInfo:  { type: String },
  frequency:       { type: String },
  calendarAccess:  { type: Boolean, default: false },
  // TODO: availability — store mentor's available time slots
  // availability: [{ day: String, startTime: String, endTime: String }]
}, { timestamps: true })

module.exports = mongoose.model('Mentor', mentorSchema)
