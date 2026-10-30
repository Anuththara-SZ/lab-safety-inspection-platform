const mongoose = require('mongoose');

const incidentSchema = new mongoose.Schema(
  {
    lab: { type: mongoose.Schema.Types.ObjectId, ref: 'Lab', required: true },
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'low' },
    status: { type: String, enum: ['open', 'investigating', 'resolved'], default: 'open' },
    resolution: { type: String, trim: true },
    resolvedAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Incident', incidentSchema);
