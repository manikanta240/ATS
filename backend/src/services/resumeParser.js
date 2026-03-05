export async function extractTextFromPdf(buffer) {
  return buffer.toString("utf8");
}

export function parseResumeText(text) {
  const lower = text.toLowerCase();

  const skills = [];
  const knownSkills = [
    "javascript", "typescript", "react", "reactjs", "node", "nodejs",
    "express", "mongodb", "mysql", "sql",
    "python", "java", "spring", "springboot",
    "aws", "docker", "kubernetes",
    "html", "css", "tailwind",
    "git", "github",
    "nextjs", "redux"
  ];
  for (const skill of knownSkills) {
    if (lower.includes(skill)) {
      skills.push(skill);
    }
  }

  let yearsExperience = 0;
  const expMatch = lower.match(/(\d+)\+?\s*(years?|yrs?)/);
  if (expMatch) {
    yearsExperience = parseInt(expMatch[1], 10);
  }

  let educationLevel;
  if (lower.includes("phd")) educationLevel = "phd";
  else if (lower.includes("master") || lower.includes("msc") || lower.includes("m.tech"))
    educationLevel = "masters";
  else if (lower.includes("bachelor") || lower.includes("b.tech") || lower.includes("bsc"))
    educationLevel = "bachelors";
  else if (lower.includes("diploma")) educationLevel = "diploma";

  const projects = [];
  const projectLines = text.split("\n").filter((line) =>
    /(project|developed|built|application|system)/i.test(line)
  ); for (const line of projectLines) {
    const trimmed = line.trim();
    if (trimmed && projects.length < 10) {
      projects.push(trimmed);
    }
  }

  return {
    skills,
    yearsExperience,
    educationLevel,
    projects,
  };
}

