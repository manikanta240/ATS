import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "node:path";
import authRoutes from "./routes/authRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import contactRoutes from "./routes/contact.js";
import nodemailer from "nodemailer";

dotenv.config();

const app = express();

app.use(cors())
app.use(express.json())


const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/openats_plus";
const PORT = process.env.PORT || 4000;


app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "openats-plus-backend" });
});

app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes);


const uploadsDir = process.env.UPLOADS_DIR || path.join(process.cwd(), "uploads");
app.use("/uploads", express.static(uploadsDir));
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

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

