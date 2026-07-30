const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    session: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: true },
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    about: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    meetingRating: { type: Number, min: 1, max: 5, required: true },
    usefulAdviceRating: { type: Number, min: 1, max: 5, required: true },
    comments: { type: String, default: '' },
    followedUpAt: { type: Date },
    followUpReply: { type: String },
    followUpRepliedAt: { type: Date }
}, { timestamps: true });

// A user can only leave one piece of feedback per session
feedbackSchema.index({ session: 1, submittedBy: 1 }, { unique: true });

module.exports = mongoose.model('Feedback', feedbackSchema);
