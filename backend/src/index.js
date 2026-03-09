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

/* Serve React build */
app.use(express.static(path.join(__dirname, "../../frontend/dist")));

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/openats_plus";

const PORT = process.env.PORT || 4000;

/* API Routes */
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "openats-plus-backend" });
});

app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/contact", contactRoutes);

/* uploads */
const uploadsDir =
  process.env.UPLOADS_DIR || path.join(process.cwd(), "uploads");

app.use("/uploads", express.static(uploadsDir));

/* React fallback route (must be LAST) */
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "../../frontend/dist/index.html"));
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