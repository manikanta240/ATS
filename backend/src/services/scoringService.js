export function scoreCandidateForJob(parsed, job) {
  const explanation = [];
  const biasFlags = [];

  const weights = job.weights;

  function createDimension(max) {
    return { score: 0, max, reasons: [] };
  }

  const dim = {
    skills: createDimension(weights.skills),
    experience: createDimension(weights.experience),
    education: createDimension(weights.education),
    projects: createDimension(weights.projects),
  };

  const requiredSkills = (job.requiredSkills || []).map((s) => s.toLowerCase().trim());
  const candidateSkills = (parsed.skills || []).map((s) => s.toLowerCase().trim());
  if (requiredSkills.length === 0) {
    dim.skills.score = dim.skills.max;
    dim.skills.reasons.push(
      `No required skills configured for this role → ${dim.skills.score}/${dim.skills.max}`
    );
  } else {
    const matched = requiredSkills.filter((s) => candidateSkills.includes(s));
    const matchCount = matched.length;
    const totalRequired = requiredSkills.length;
    const skillsScore = (matchCount / totalRequired) * dim.skills.max;
    dim.skills.score = Math.round(skillsScore);
    dim.skills.reasons.push(
      `Matched ${matchCount}/${totalRequired} required skills → ${dim.skills.score}/${dim.skills.max}`
    );
    const missingSkills = requiredSkills.filter((s) => !candidateSkills.includes(s));
    if (missingSkills.length) {
      dim.skills.reasons.push(`Missing critical skills: ${missingSkills.join(", ")}`);
    }
  }

  const years = parsed.yearsExperience ?? 0;
  const expectedYears = 3;
  if (years >= expectedYears) {
    dim.experience.score = dim.experience.max;
    dim.experience.reasons.push(
      `Experience meets or exceeds expectation (${years} years) → ${dim.experience.score}/${dim.experience.max}`
    );
  } else {
    const ratio = years / expectedYears;
    dim.experience.score = Math.round(ratio * dim.experience.max);
    dim.experience.reasons.push(
      `Experience below expectation (${years}/${expectedYears} years) → ${dim.experience.score}/${dim.experience.max}`
    );
  }

  const eduLevel = (parsed.educationLevel || "").toLowerCase();
  if (!eduLevel) {
    dim.education.score = Math.round(dim.education.max * 0.3);
    dim.education.reasons.push(
      `Education level not clearly detected → ${dim.education.score}/${dim.education.max}`
    );
  } else if (eduLevel === "phd") {
    dim.education.score = dim.education.max;
    dim.education.reasons.push(`PhD detected → ${dim.education.score}/${dim.education.max}`);
  } else if (eduLevel === "masters") {
    dim.education.score = Math.round(dim.education.max * 0.9);
    dim.education.reasons.push(
      `Master's degree detected → ${dim.education.score}/${dim.education.max}`
    );
  } else if (eduLevel === "bachelors") {
    dim.education.score = Math.round(dim.education.max * 0.75);
    dim.education.reasons.push(
      `Bachelor's degree detected → ${dim.education.score}/${dim.education.max}`
    );
  } else {
    dim.education.score = Math.round(dim.education.max * 0.5);
    dim.education.reasons.push(
      `Education level (${eduLevel}) partially matched → ${dim.education.score}/${dim.education.max}`
    );
  }

  const projectsCount = parsed.projects?.length ?? 0;
  if (projectsCount === 0) {
    dim.projects.score = Math.round(dim.projects.max * 0.2);
    dim.projects.reasons.push(
      `No explicit projects found → ${dim.projects.score}/${dim.projects.max}`
    );
  } else {
    const capped = Math.min(projectsCount, 5);
    const ratio = capped / 5;
    dim.projects.score = Math.round(ratio * dim.projects.max);
    dim.projects.reasons.push(
      `${projectsCount} project entries detected → ${dim.projects.score}/${dim.projects.max}`
    );
  }

  const overallScore =
    dim.skills.score + dim.experience.score + dim.education.score + dim.projects.score;

  explanation.push(
    `Overall score ${overallScore}/${dim.skills.max + dim.experience.max + dim.education.max + dim.projects.max}`
  );
  explanation.push(...dim.skills.reasons);
  explanation.push(...dim.experience.reasons);
  explanation.push(...dim.education.reasons);
  explanation.push(...dim.projects.reasons);

  const skillWeight = weights.skills;
  const educationWeight = weights.education;
  if (educationWeight > skillWeight) {
    biasFlags.push({
      dimension: "configuration",
      severity: "medium",
      message:
        "Education is weighted higher than skills for this role, which can introduce prestige bias.",
      mitigationHint: "Consider increasing skills weight and reducing education weight.",
    });
  }

  return { overallScore, dimensionScores: dim, explanation, biasFlags };
}

