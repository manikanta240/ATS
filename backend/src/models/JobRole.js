import mongoose from "mongoose";

const { Schema, model } = mongoose;

const WeightsSchema = new Schema(
  {
    skills: { type: Number, required: true },
    experience: { type: Number, required: true },
    education: { type: Number, required: true },
    projects: { type: Number, required: true },
  },
  { _id: false }
);

const JobRoleSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    requiredSkills: { type: [String], default: [] },
    weights: { type: WeightsSchema, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

JobRoleSchema.pre("validate", function () {
  // Be tolerant to avoid blocking job creation for tiny mismatches.
  if (!this.weights) return;
  const total =
    Number(this.weights.skills || 0) +
    Number(this.weights.experience || 0) +
    Number(this.weights.education || 0) +
    Number(this.weights.projects || 0);

  const rounded = Math.round(total);
  if (rounded !== 100) {
    console.warn(
      "JobRole created with non-100 total weights:",
      this.weights,
      "sum=",
      total
    );
  }
});

export const JobRole = model("JobRole", JobRoleSchema);

