import { Router } from "express";
import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { JobRole } from "../models/JobRole.js";
import { Candidate } from "../models/Candidate.js";
import { Application } from "../models/Application.js";
import { AuditLog } from "../models/AuditLog.js";
import { extractTextFromPdf, parseResumeText } from "../services/resumeParser.js";
import { sanitizeResumeText } from "../services/sanitizer.js";
import { scoreCandidateForJob } from "../services/scoringService.js";

const router = Router();

const uploadsRoot = process.env.UPLOADS_DIR || path.join(process.cwd(), "uploads");
const resumesDir = path.join(uploadsRoot, "resumes");
if (!fs.existsSync(resumesDir)) {
  fs.mkdirSync(resumesDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, resumesDir);
  },
  filename: (_req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      return cb(new Error("Only PDF resumes are supported"));
    }
    cb(null, true);
  },
});

router.post(
  "/upload",
  requireAuth,
  // Allow any authenticated user (e.g., candidates) to upload resumes.
  upload.single("resume"),
  async (req, res) => {
    try {
      const jobRoleId = req.body.jobRoleId;
      const anonymousMode = req.body.anonymousMode === "true";

      if (!jobRoleId || !req.file) {
        return res.status(400).json({ message: "jobRoleId and resume PDF are required" });
      }

      const job = await JobRole.findById(jobRoleId);
      if (!job) {
        return res.status(404).json({ message: "Job role not found" });
      }

      const fileBuffer = await fs.promises.readFile(req.file.path);
      const rawText = await extractTextFromPdf(fileBuffer);

      const sanitizedText = anonymousMode ? sanitizeResumeText(rawText) : rawText;
      const parsed = parseResumeText(sanitizedText);

      const resumeUrl = `/uploads/resumes/${path.basename(req.file.path)}`;

      const candidate = await Candidate.create({
        resumeUrl,
        rawResumeText: rawText,
        sanitizedResumeText: sanitizedText,
        parsed,
      });

      const { overallScore, dimensionScores, explanation, biasFlags } =
        scoreCandidateForJob(parsed, job);

      const application = await Application.create({
        candidateId: candidate._id,
        jobRoleId: job._id,
        overallScore,
        dimensionScores,
        explanation,
        biasFlags,
        anonymousModeUsed: anonymousMode,
      });

      await AuditLog.create({
        actorId: req.user?._id,
        action: "score_application",
        entityType: "Application",
        entityId: application._id,
        details: {
          jobRoleId: job._id,
          candidateId: candidate._id,
          anonymousMode,
          overallScore,
        },
      });

      return res.status(201).json({
        applicationId: application._id,
        overallScore,
        dimensionScores,
        explanation,
        biasFlags,
        anonymousModeUsed: anonymousMode,
        parsedPreview: {
          email: parsed.email,
          skills: parsed.skills,
          yearsExperience: parsed.yearsExperience,
        },
      });
    } catch (err) {
      console.error("Upload application error", err);
      return res
        .status(500)
        .json({ message: "Failed to process resume", error: String(err) });
    }
  }
);

router.get(
  "/by-job/:jobRoleId",
  requireAuth,
  requireRole("recruiter"),
  async (req, res) => {
    try {
      const jobRoleId = req.params.jobRoleId;

      const apps = await Application.find({ jobRoleId })
        .sort({ overallScore: -1, createdAt: 1 })
        .lean();

      const candidateIds = apps.map((a) => a.candidateId);
      const candidates = await Candidate.find({ _id: { $in: candidateIds } }).lean();
      const candidateMap = new Map();
      candidates.forEach((c) => candidateMap.set(String(c._id), c));

      const response = apps.map((app) => {
        const candidate = candidateMap.get(String(app.candidateId));
        return {
          id: app._id,
          candidateId: app.candidateId,
          overallScore: app.overallScore,
          dimensionScores: app.dimensionScores,
          explanation: app.explanation,
          anonymousModeUsed: app.anonymousModeUsed,
          createdAt: app.createdAt,
          email: candidate?.parsed?.email || null,
          candidateSummary: candidate
            ? {
                resumeUrl: candidate.resumeUrl,
                parsed: candidate.parsed,
              }
            : null,
        };
      });

      return res.json(response);
    } catch (err) {
      console.error("List applications by job error", err);
      return res.status(500).json({ message: "Failed to list applications" });
    }
  }
);

router.get("/:id", requireAuth, requireRole("recruiter"), async (req, res) => {
  try {
    const app = await Application.findById(req.params.id).lean();
    if (!app) {
      return res.status(404).json({ message: "Application not found" });
    }

    const candidate = await Candidate.findById(app.candidateId).lean();
    return res.json({
      ...app,
      candidate,
    });
  } catch (err) {
    console.error("Get application error", err);
    return res.status(500).json({ message: "Failed to fetch application" });
  }
});

export default router;

