import express from "express";
import nodemailer from "nodemailer";

const router = express.Router();

router.post("/contact", async (req, res) => {
  const { email } = req.body;

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "yourgmail@gmail.com",
        pass: "your_app_password",
      },
    });

    await transporter.sendMail({
      from: "yourgmail@gmail.com",
      to: email,
      subject: "Interview Opportunity",
      text: "Congratulations! You are shortlisted.",
    });

    res.json({ message: "Email sent successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Email failed" });
  }
});

export default router;