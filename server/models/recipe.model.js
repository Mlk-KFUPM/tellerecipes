const { Schema, model } = require('mongoose');

const ingredientSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    quantity: { type: Number, default: 0 },
    unit: { type: String, default: '' },
    alternatives: { type: [String], default: [] },
  },
  { _id: false },
);

const stepSchema = new Schema(
  {
    description: { type: String, required: true },
    order: { type: Number, default: 0 },
  },
  { _id: false },
);

const ratingSummarySchema = new Schema(
  {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 },
  },
  { _id: false },
);

const engagementSchema = new Schema(
  {
    views: { type: Number, default: 0 },
    saves: { type: Number, default: 0 },
    shoppingAdds: { type: Number, default: 0 },
  },
  { _id: false },
);

const recipeSchema = new Schema(
  {
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    chefProfile: { type: Schema.Types.ObjectId, ref: 'ChefProfile', default: null },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    cuisine: { type: String, default: '' },
    dietary: { type: [String], default: [] },
    categories: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
    prepTime: { type: Number, default: 0 },
    cookTime: { type: Number, default: 0 },
    servings: { type: Number, default: 0 },
    status: { type: String, enum: ['draft', 'pending', 'approved', 'rejected', 'archived'], default: 'pending' },
    image: { type: String, default: '' },
    gallery: { type: [String], default: [] },
    ingredients: { type: [ingredientSchema], default: [] },
    steps: { type: [stepSchema], default: [] },
    ratingSummary: { type: ratingSummarySchema, default: () => ({}) },
    engagement: { type: engagementSchema, default: () => ({}) },
    submittedAt: { type: Date, default: Date.now },
    approvedAt: { type: Date, default: null },
    rejectedAt: { type: Date, default: null },
    rejectionNote: { type: String, default: '' },
  },
  { timestamps: true },
);

recipeSchema.index({ title: 'text', description: 'text' });
recipeSchema.index({ status: 1, cuisine: 1 });
recipeSchema.index({ chefProfile: 1, status: 1 });

module.exports = model('Recipe', recipeSchema);
