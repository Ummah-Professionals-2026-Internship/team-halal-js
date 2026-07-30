const mongoose = require('mongoose');

const helpRequestSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    topics: { type: [String], default: [] },
    message: { type: String, default: '' },
    response: { type: String, default: '' },
    status: { type: String, enum: ['open', 'resolved'], default: 'open' },
}, { timestamps: true });

module.exports = mongoose.model('HelpRequest', helpRequestSchema);
