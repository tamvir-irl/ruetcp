import mongoose from "mongoose";

const contestSchema = new mongoose.Schema(
  {
    contestName: {
      type: String,
      required: true,
    },
    contestUrl: {
      type: String,
      required: true,
      unique: true, // Optional: ensures that each contest has a unique URL
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    phase: {
      type: String,
      enum: ["BEFORE", "RUNNING", "FINISHED"], // Allowed values for phase
      required: true,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

const Contest =
  mongoose.models.Contest || mongoose.model('Contest', contestSchema);

export default Contest;
