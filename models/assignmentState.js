import mongoose from "mongoose";

const assignmentStateSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    userIndex: { type: Number, default: 0 },
    sellerIndex: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const AssignmentState = mongoose.model("AssignmentState", assignmentStateSchema);

export default AssignmentState;
