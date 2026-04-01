import mongoose from "mongoose";

const { Schema, model } = mongoose;

const ParsedResumeSchema = new Schema(
  {
    email: { type: String },
    skills: { type: [String], default: [] },
    yearsExperience: { type: Number, default: 0 },
    educationLevel: { type: String },
    projects: { type: [String], default: [] },
  },
  { _id: false }
);

const CandidateSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    resumeUrl: { type: String, required: true },
    rawResumeText: { type: String },
    sanitizedResumeText: { type: String },
    parsed: { type: ParsedResumeSchema, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

export const Candidate = model("Candidate", CandidateSchema);

