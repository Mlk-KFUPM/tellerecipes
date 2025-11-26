const { Schema, model } = require('mongoose');

const itemSchema = new Schema(
  {
    name: { type: String, required: true },
    quantity: { type: Number, default: 0 },
    unit: { type: String, default: '' },
    sourceRecipe: { type: Schema.Types.ObjectId, ref: 'Recipe', default: null },
  },
  { _id: false },
);

const shoppingListSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    recipeIds: [{ type: Schema.Types.ObjectId, ref: 'Recipe' }],
    consolidatedItems: { type: [itemSchema], default: [] },
    generatedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

shoppingListSchema.index({ user: 1 });

module.exports = model('ShoppingList', shoppingListSchema);
