const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  mentee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  compatibilityScore: { type: Number },
  status: {
    type: String,
    enum: ['pending', 'active', 'completed', 'cancelled'],
    default: 'pending'
  }
}, { timestamps: true });

matchSchema.index({ mentor: 1, status: 1 });

module.exports = mongoose.model('Match', matchSchema);
