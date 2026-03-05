import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { JobRole } from "../models/JobRole.js";
import { Application } from "../models/Application.js";

const router = Router();

router.post("/", requireAuth, requireRole("recruiter"), async (req, res) => {
  try {
    const { title, requiredSkills, weights } = req.body || {};

    if (!title || !weights) {
      return res.status(400).json({ message: "Title and weights are required" });
    }

    const job = await JobRole.create({
      title,
      requiredSkills: requiredSkills || [],
      weights,
      createdBy: req.user._id,
    });

    return res.status(201).json(job);
  } catch (err) {
    console.error("Create job error", err);
    return res
      .status(400)
      .json({ message: "Failed to create job role", error: String(err) });
  }
});

// List all job roles for any authenticated user (recruiters and candidates).
// Creation and management of jobs remain recruiter-only.
router.get("/", requireAuth, async (_req, res) => {
  try {
    const jobs = await JobRole.find().sort({ createdAt: -1 }).lean();
    const jobIds = jobs.map((j) => j._id);

    const counts = await Application.aggregate([
      { $match: { jobRoleId: { $in: jobIds } } },
      { $group: { _id: "$jobRoleId", count: { $sum: 1 } } },
    ]);

    const countsMap = new Map();
    counts.forEach((c) => countsMap.set(String(c._id), c.count));

    const enriched = jobs.map((job) => ({
      ...job,
      applicantCount: countsMap.get(String(job._id)) || 0,
    }));

    return res.json(enriched);
  } catch (err) {
    console.error("List jobs error", err);
    return res.status(500).json({ message: "Failed to list jobs" });
  }
});

router.get("/:id", requireAuth, requireRole("recruiter"), async (req, res) => {
  try {
    const job = await JobRole.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
    return res.json(job);
  } catch (err) {
    console.error("Get job error", err);
    return res.status(500).json({ message: "Failed to fetch job" });
  }
});

export default router;

