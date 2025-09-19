import mongoose from "mongoose";

const StudyBlockSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    userEmail: { type: String, required: true }, // <- add this
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    reminderSent: { type: Boolean, default: false }, // <- track emails
  },
  { timestamps: true }
);

export default mongoose.models.StudyBlock ||
  mongoose.model("StudyBlock", StudyBlockSchema);
