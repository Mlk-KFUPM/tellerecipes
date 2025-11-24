const { Schema, model } = require("mongoose");

const userSchema = new Schema(
  {
    fullName: { type: String, required: true, trim: true },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["user", "chef", "admin"], default: "user" },
    status: {
      type: String,
      enum: ["active", "pending", "deactivated"],
      default: "active",
    },
    avatarUrl: { type: String, default: null },
    isEmailVerified: { type: Boolean, default: false },
    emailVerifiedAt: { type: Date, default: null },
    passwordUpdatedAt: { type: Date, default: null },
    termsAcceptedAt: { type: Date, default: null },
    lastLoginAt: { type: Date, default: null },
    onboardingCompleted: { type: Boolean, default: false },
    flags: { type: Number, default: 0 },
  },
  { timestamps: true }
);

userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ role: 1, status: 1 });

module.exports = model("User", userSchema);
