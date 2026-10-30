const mongoose = require('mongoose');

const labSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    building: { type: String, required: true, trim: true },
    department: { type: String, trim: true, default: 'Electrical and Information Engineering' },
    capacity: { type: Number, default: 20, min: 1 },
    hazardLevel: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    status: { type: String, enum: ['active', 'inactive', 'closed'], default: 'active' },
    manager: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    lastInspectionDate: Date,
    lastScore: Number,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Lab', labSchema);
