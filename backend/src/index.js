import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "node:path";

import authRoutes from "./routes/authRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import contactRoutes from "./routes/contact.js";

dotenv.config();

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());

const __dirname = path.resolve();
const frontendPath = path.join(__dirname, "frontend", "dist");

app.use(express.static(frontendPath));

const MONGO_URI = process.env.MONGO_URI;
const PORT = process.env.PORT || 4000;

/* API ROUTES */

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "openats-plus-backend" });
});

app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/contact", contactRoutes);

/* Uploads */

const uploadsDir =
  process.env.UPLOADS_DIR || path.join(__dirname, "uploads");

app.use("/uploads", express.static(uploadsDir));

/* React fallback */

app.use((req, res, next) => {
  if (req.path.startsWith("/api")) return next();
  res.sendFile(path.join(frontendPath, "index.html"));
});

/* Start server */

async function start() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    app.listen(PORT, () => {
      console.log(`OpenATS+ backend listening on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server", err);
    process.exit(1);
  }
}

start();