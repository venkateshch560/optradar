const skills = [
  "sql","python","excel","power bi","tableau","aws","azure","snowflake",
  "etl","data analysis","business analysis","reporting","dashboard","dax",
  "power query","javascript","react","node","api","rest","agile","scrum",
  "jira","git","docker","kubernetes","devops","machine learning","cloud"
];

function clean(text = "") {
  return text.toLowerCase().replace(/[^a-z0-9+#.\s]/g, " ");
}

export function analyzeResumeMatch(resumeText, jobText) {
  const resume = clean(resumeText);
  const job = clean(jobText);

  const requiredSkills = skills.filter((s) => job.includes(s));
  const matchedSkills = requiredSkills.filter((s) => resume.includes(s));
  const missingSkills = requiredSkills.filter((s) => !resume.includes(s));

  const score = requiredSkills.length
    ? Math.round((matchedSkills.length / requiredSkills.length) * 100)
    : 50;

  return { score, requiredSkills, matchedSkills, missingSkills };
}

export function generateFreeTailoredResume(resumeText, jobText) {
  const a = analyzeResumeMatch(resumeText, jobText);

  return `
ATS Match Score: ${a.score}%

Matched Skills:
${a.matchedSkills.map((s) => `- ${s}`).join("\n") || "- None found"}

Missing Keywords to Add Only If You Know Them:
${a.missingSkills.map((s) => `- ${s}`).join("\n") || "- None"}

Suggested Summary:
Data-driven professional with experience in ${a.matchedSkills.slice(0, 6).join(", ") || "analytics, reporting, and business problem-solving"}. Skilled in analyzing data, building reports, supporting business decisions, and working with cross-functional teams.

Suggested Skills Section:
${[...new Set([...a.matchedSkills, ...a.missingSkills.slice(0, 6)])].join(" • ")}

Important: Do not add fake skills. Only use missing keywords if you actually know them.
`;
}
