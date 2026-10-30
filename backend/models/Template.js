const mongoose = require('mongoose');

const CATEGORIES = ['Fire Safety', 'Chemical', 'Electrical', 'PPE', 'Emergency', 'Waste', 'General'];

const templateSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    items: [
      {
        text: { type: String, required: true, trim: true },
        category: { type: String, enum: CATEGORIES, default: 'General' },
        critical: { type: Boolean, default: false },
      },
    ],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

templateSchema.path('items').validate((v) => v && v.length > 0, 'A template needs at least one checklist item');

module.exports = mongoose.model('Template', templateSchema);
module.exports.CATEGORIES = CATEGORIES;
