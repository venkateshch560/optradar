const skillKeywords = [
  "sql",
  "python",
  "excel",
  "power bi",
  "tableau",
  "aws",
  "azure",
  "snowflake",
  "etl",
  "data analysis",
  "business analysis",
  "reporting",
  "dashboard",
  "power query",
  "dax",
  "javascript",
  "react",
  "node",
  "api",
  "rest",
  "agile",
  "scrum",
  "jira",
  "git",
  "docker",
  "kubernetes",
  "devops",
  "machine learning",
  "data engineering",
  "cloud",
  "analytics"
];

function clean(text = "") {
  return text.toLowerCase().replace(/[^a-z0-9+#.\s]/g, " ");
}

export function analyzeResumeMatch(resumeText, jobText) {
  const resume = clean(resumeText);
  const job = clean(jobText);

  const requiredSkills = skillKeywords.filter((skill) => job.includes(skill));
  const matchedSkills = requiredSkills.filter((skill) => resume.includes(skill));
  const missingSkills = requiredSkills.filter((skill) => !resume.includes(skill));

  const score =
    requiredSkills.length === 0
      ? 50
      : Math.round((matchedSkills.length / requiredSkills.length) * 100);

  return {
    score,
    requiredSkills,
    matchedSkills,
    missingSkills,
    summary: `Your resume matches ${score}% of the important keywords from this job.`
  };
}

export function generateFreeTailoredResume(resumeText, jobText) {
  const analysis = analyzeResumeMatch(resumeText, jobText);

  return `
ATS Match Score: ${analysis.score}%

Matched Skills:
${analysis.matchedSkills.map((s) => `- ${s}`).join("\n") || "- None found"}

Missing Keywords to Add if truthful:
${analysis.missingSkills.map((s) => `- ${s}`).join("\n") || "- None"}

Suggested Tailored Summary:
Data-driven professional with experience in ${
    analysis.matchedSkills.slice(0, 6).join(", ") ||
    "analytics, reporting, and business problem-solving"
  }. Skilled in translating business needs into actionable insights, building reports, analyzing data, and supporting decision-making using modern tools.

Suggested Skills Section:
${[...new Set([...analysis.matchedSkills, ...analysis.missingSkills.slice(0, 6)])].join(" • ")}

Important:
Only add missing skills if you actually know them. Do not fake skills.
`;
}
