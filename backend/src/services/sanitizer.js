const emailRegex = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const phoneRegex = /(\+?\d[\d\s\-()]{7,}\d)/g;

export function sanitizeResumeText(text) {
  let sanitized = text.replace(emailRegex, "[email hidden]").replace(phoneRegex, "[phone hidden]");

  const collegeKeywords = [
    "university",
    "institute of technology",
    "college of engineering",
    "iit ",
    "nit ",
  ];

  for (const kw of collegeKeywords) {
    const regex = new RegExp(kw, "gi");
    sanitized = sanitized.replace(regex, "[institution hidden]");
  }

  return sanitized;
}

