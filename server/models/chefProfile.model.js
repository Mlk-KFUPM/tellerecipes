const { Schema, model } = require('mongoose');

const chefProfileSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    displayName: { type: String, required: true, trim: true },
    bio: { type: String, default: '' },
    specialties: { type: [String], default: [] },
    yearsExperience: { type: Number, default: 0, min: 0 },
    phone: { type: String, default: '' },
    website: { type: String, default: '' },
    signatureDish: { type: String, default: '' },
    avatarUrl: { type: String, default: null },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    submissionNote: { type: String, default: '' },
    rejectionReason: { type: String, default: '' },
    termsAcceptedAt: { type: Date, default: null },
    submittedAt: { type: Date, default: Date.now },
    approvedAt: { type: Date, default: null },
    rejectedAt: { type: Date, default: null },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true },
);

chefProfileSchema.index({ user: 1 });
chefProfileSchema.index({ status: 1 });

module.exports = model('ChefProfile', chefProfileSchema);
