import mongoose from "mongoose";

const StudyBlockSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
  },
  { timestamps: true }
);


export default mongoose.models.StudyBlock ||
  mongoose.model("StudyBlock", StudyBlockSchema);
