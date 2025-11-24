const { Schema, model } = require('mongoose');

const replySchema = new Schema(
  {
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    displayName: { type: String, default: '' },
    comment: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const reviewSchema = new Schema(
  {
    recipe: { type: Schema.Types.ObjectId, ref: 'Recipe', required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    displayName: { type: String, default: '' },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, required: true },
    replies: { type: [replySchema], default: [] },
    status: { type: String, enum: ['visible', 'removed', 'flagged'], default: 'visible' },
    flaggedReason: { type: String, default: '' },
  },
  { timestamps: true },
);

reviewSchema.index({ recipe: 1, createdAt: -1 });
reviewSchema.index({ author: 1 });
reviewSchema.index({ status: 1 });

module.exports = model('Review', reviewSchema);
