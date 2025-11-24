const { Schema, model } = require('mongoose');

const categorySchema = new Schema(
  {
    label: { type: String, required: true, trim: true },
    slug: { type: String, required: true, lowercase: true, trim: true, unique: true },
    type: { type: String, enum: ['category', 'cuisine', 'dietary'], required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

categorySchema.index({ type: 1, label: 1 });

module.exports = model('Category', categorySchema);
