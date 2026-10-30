const mongoose = require('mongoose');

const responseSchema = new mongoose.Schema({
  text: { type: String, required: true },
  category: String,
  critical: { type: Boolean, default: false },
  result: { type: String, enum: ['pending', 'pass', 'fail', 'na'], default: 'pending' },
  remarks: { type: String, trim: true, default: '' },
});

const inspectionSchema = new mongoose.Schema(
  {
    lab: { type: mongoose.Schema.Types.ObjectId, ref: 'Lab', required: true },
    template: { type: mongoose.Schema.Types.ObjectId, ref: 'Template', required: true },
    templateTitle: String,
    inspector: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    scheduledDate: { type: Date, default: Date.now },
    completedDate: Date,
    status: { type: String, enum: ['scheduled', 'completed'], default: 'scheduled' },
    responses: [responseSchema],
    score: { type: Number, min: 0, max: 100 },
    riskLevel: { type: String, enum: ['low', 'medium', 'high', 'critical'] },
    summary: { type: String, trim: true },
  },
  { timestamps: true }
);

// Score = passed / (passed + failed). N/A and pending items are ignored.
inspectionSchema.methods.calculateResult = function () {
  const passed = this.responses.filter((r) => r.result === 'pass').length;
  const failed = this.responses.filter((r) => r.result === 'fail').length;
  const total = passed + failed;
  this.score = total === 0 ? 100 : Math.round((passed / total) * 100);
  const criticalFail = this.responses.some((r) => r.result === 'fail' && r.critical);
  if (criticalFail) this.riskLevel = 'critical';
  else if (this.score < 60) this.riskLevel = 'high';
  else if (this.score < 80) this.riskLevel = 'medium';
  else this.riskLevel = 'low';
};

module.exports = mongoose.model('Inspection', inspectionSchema);
