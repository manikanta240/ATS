import mongoose from "mongoose";

const { Schema, model } = mongoose;

const DimensionScoreSchema = new Schema(
  {
    score: { type: Number, required: true },
    max: { type: Number, required: true },
    reasons: { type: [String], default: [] },
  },
  { _id: false }
);

const BiasFlagSchema = new Schema(
  {
    dimension: { type: String, required: true },
    severity: { type: String, enum: ["low", "medium", "high"], required: true },
    message: { type: String, required: true },
    mitigationHint: { type: String },
  },
  { _id: false }
);

const ApplicationSchema = new Schema(
  {
    candidateId: { type: Schema.Types.ObjectId, ref: "Candidate", required: true },
    jobRoleId: { type: Schema.Types.ObjectId, ref: "JobRole", required: true },
    overallScore: { type: Number, required: true },
    dimensionScores: {
      skills: { type: DimensionScoreSchema, required: true },
      experience: { type: DimensionScoreSchema, required: true },
      education: { type: DimensionScoreSchema, required: true },
      projects: { type: DimensionScoreSchema, required: true },
    },
    explanation: { type: [String], default: [] },
    biasFlags: { type: [BiasFlagSchema], default: [] },
    anonymousModeUsed: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

export const Application = model("Application", ApplicationSchema);

