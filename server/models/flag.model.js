const { Schema, model } = require("mongoose");

const flagSchema = new Schema(
  {
    targetModel: {
      type: String,
      enum: ["Recipe", "Review", "User", "ChefProfile"],
      required: true,
    },
    reference: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: "targetModel",
    },
    title: { type: String, default: "" },
    reason: { type: String, required: true },
    snippet: { type: String, default: "" },
    reportedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    flaggedAt: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["open", "dismissed", "removed"],
      default: "open",
    },
    handledBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    handledAt: { type: Date, default: null },
    actionNote: { type: String, default: "" },
  },
  { timestamps: true }
);

flagSchema.index({ status: 1, flaggedAt: -1 });
flagSchema.index({ targetModel: 1 });

module.exports = model("Flag", flagSchema);
