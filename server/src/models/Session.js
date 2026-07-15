const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
    scheduledTime: {type: Date, required: true},
    duration: {type: Number},
    mentor: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    mentee: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    service:{
        type: String,
        enum: ['healthcare service', 'mentorship program', 'resume review', 'mock interview', 'general career advice'],
        required: true
    },
    match: {type: mongoose.Schema.Types.ObjectId, ref: 'Match'}, //will make this required later
    link: {type: String},
    details: {type: String},
    status: {type: String, enum: ['scheduled', 'completed', 'cancelled'], default: 'scheduled'},
    googleCalendarEventId: {type: String},



},

{timestamps: true});

module.exports = mongoose.model('Session', sessionSchema);