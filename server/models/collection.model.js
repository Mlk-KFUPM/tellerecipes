const { Schema, model } = require('mongoose');

const collectionSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    recipeIds: [{ type: Schema.Types.ObjectId, ref: 'Recipe' }],
    isDefault: { type: Boolean, default: false },
    visibility: { type: String, enum: ['private', 'public'], default: 'private' },
  },
  { timestamps: true },
);

collectionSchema.index({ user: 1, name: 1 }, { unique: true });
collectionSchema.index({ user: 1, isDefault: 1 });

module.exports = model('Collection', collectionSchema);
