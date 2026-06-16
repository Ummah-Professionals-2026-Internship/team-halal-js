const mongoose = require('mongoose')

const menteeSchema = new mongoose.Schema({
  name:             { type: String },
  phone:            { type: String },
  university:       { type: String },
  major:            { type: String },
  academicStanding: { type: String },
  resume: { type: String }, // TODO: integrate actual file upload (e.g. Cloudinary)
  desiredIndustry:  { type: String },
  desiredCareer:    { type: String },
  lookingFor:       { type: String },
  calendarAccess:   { type: Boolean, default: false },
  profilePicture:   { type: String },
  referralSource:   { type: String },
  additionalInfo:   { type: String },
}, { timestamps: true })

module.exports = mongoose.model('Mentee', menteeSchema)