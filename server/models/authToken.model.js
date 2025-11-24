const { Schema, model } = require('mongoose');

const authTokenSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['verify_email', 'reset_password'], required: true },
    tokenHash: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
    consumedAt: { type: Date, default: null },
    ipAddress: { type: String, default: '' },
    userAgent: { type: String, default: '' },
  },
  { timestamps: true },
);

authTokenSchema.index({ user: 1, type: 1, expiresAt: 1 });

module.exports = model('AuthToken', authTokenSchema);
