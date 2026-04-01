import express from "express";
import nodemailer from "nodemailer";

const router = express.Router();

async function handleContact(req, res) {
  const { email } = req.body;
  if (!email || typeof email !== "string") {
    return res.status(400).json({ message: "Valid candidate email is required" });
  }

  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpUser || !smtpPass) {
    return res.status(500).json({
      message: "Email service is not configured. Set SMTP_USER and SMTP_PASS in backend/.env.",
    });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: Number(process.env.SMTP_PORT || 587),
      secure: false,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    await transporter.sendMail({
      from: smtpUser,
      to: email,
      subject: "Interview Opportunity",
      text: "Congratulations! You are shortlisted.",
    });

    res.json({ message: "Email sent successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Email failed" });
  }
}

router.post("/", handleContact);
// Backward compatibility for clients that call /api/contact/contact.
router.post("/contact", handleContact);

export default router;