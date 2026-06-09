import crypto from "crypto";

function cleanText(value = "") {
  return String(value)
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function hash(title, company, location, applyLink) {
  return crypto
    .createHash("sha256")
    .update(`${title}|${company}|${location}|${applyLink}`.toLowerCase())
    .digest("hex");
}

function parseWorkday(url) {
  const match = url.match(
    /https:\/\/([^.]+)\.wd\d+\.myworkdayjobs\.com\/(?:en-US\/)?([^/]+)/
  );

  if (!match) return null;

  return {
    tenant: match[1],
    site: match[2],
  };
}

function buildApplyLink(careersUrl, externalPath) {
  const base = careersUrl.replace(/\/$/, "");

  if (!externalPath) return base;
  if (externalPath.startsWith("http")) return externalPath;

  const cleanPath = externalPath.startsWith("/")
    ? externalPath
    : `/${externalPath}`;

  return `${base}${cleanPath}`;
}

const allowedRoles = [
  "data",
  "analyst",
  "business",
  "software",
  "engineer",
  "developer",
  "frontend",
  "backend",
  "full stack",
  "cloud",
  "devops",
  "qa",
  "support",
  "systems",
  "security",
  "product",
  "operations",
  "machine learning",
  "ai",
  "sql",
  "power bi",
  "sap",
  "cyber",
  "reporting",
  "database",
  "etl",
];

function allowed(title = "") {
  const t = title.toLowerCase();
  return allowedRoles.some((r) => t.includes(r));
}

function analyzeEligibility(text = "") {
  const t = text.toLowerCase();

  const blocked = [
    "u.s. citizen",
    "us citizen",
    "u.s. citizens",
    "us citizens",
    "security clearance",
    "secret clearance",
    "top secret",
    "ts/sci",
    "public trust",
    "green card only",
    "permanent resident only",
    "us persons only",
    "u.s. persons only",
    "requires citizenship",
    "no sponsorship",
    "will not sponsor",
    "does not sponsor",
    "without sponsorship",
    "unable to sponsor",
    "cannot sponsor",
  ];

  if (blocked.some((x) => t.includes(x))) {
    return null;
  }

  const good = [
    "visa sponsorship",
    "sponsorship available",
    "h1b",
    "h-1b",
    "stem opt",
    "opt",
    "f-1",
    "cpt",
    "ead",
    "e-verify",
    "new grad",
    "early career",
  ];

  if (good.some((x) => t.includes(x))) {
    return {
      status: "OPT Friendly",
      risk: "Low Risk",
      chance: "High",
      score: 90,
      reason: "Positive sponsorship/OPT signal detected",
    };
  }

  return {
    status: "Review Required",
    risk: "Medium Risk",
    chance: "Unknown",
    score: 50,
    reason: "No restriction found",
  };
}

function experience(text = "") {
  const t = text.toLowerCase();

  const m =
    t.match(/(\d+)\+?\s+years/) ||
    t.match(/(\d+)\+?\s+yrs/);

  if (m) {
    const y = Number(m[1]);

    if (y <= 2) return ["Entry Level", y];
    if (y <= 5) return ["Mid Level", y];

    return ["Senior", y];
  }

  if (
    t.includes("intern") ||
    t.includes("junior") ||
    t.includes("associate") ||
    t.includes("new grad")
  ) {
    return ["Entry Level", 0];
  }

  return ["Not specified", null];
}

export async function fetchWorkday(source) {
  if (!source.careers_url) {
    return {
      rows: [],
      found: 0,
      error: "Missing careers_url",
    };
  }

  const parsed = parseWorkday(source.careers_url);

  if (!parsed) {
    return {
      rows: [],
      found: 0,
      error: "Could not parse Workday URL",
    };
  }

  const base = source.careers_url.split("/").slice(0, 3).join("/");
  const endpoint = `${base}/wday/cxs/${parsed.tenant}/${parsed.site}/jobs`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "User-Agent": "Mozilla/5.0",
      Referer: source.careers_url,
    },
    body: JSON.stringify({
      appliedFacets: {},
      limit: 25,
      offset: 0,
      searchText: "",
    }),
  });

  if (!response.ok) {
    return {
      rows: [],
      found: 0,
      error: `Workday ${response.status}`,
    };
  }

  const data = await response.json();
  const jobs = data.jobPostings || [];
  const rows = [];

  for (const job of jobs) {
    const title = cleanText(job.title || "");

    if (!title) continue;
    if (!allowed(title)) continue;

    const location = cleanText(job.locationsText || "United States");
    const externalPath = job.externalPath || "";
    const applyLink = buildApplyLink(source.careers_url, externalPath);

    if (!applyLink.startsWith("http")) continue;

    const description = cleanText(
      `${job.title || ""} ${job.locationsText || ""} ${job.bulletFields || ""}`
    );

    const fullText = `${title} ${source.company_name} ${location} ${description}`;

    const visa = analyzeEligibility(fullText);

    if (!visa) continue;

    const exp = experience(fullText);

    if (exp[1] !== null && exp[1] >= 8) continue;

    rows.push({
      title,
      company: source.company_name,
      location,

      description,
      full_page_text: description,

      apply_link: applyLink,
      apply_url: applyLink,

      job_hash: hash(title, source.company_name, location, applyLink),

      source: "Workday",
      ats_platform: "Workday",

      posted_at: new Date().toISOString(),
      last_seen_at: new Date().toISOString(),

      is_active: true,
      is_fresh: true,

      opt_status: visa.status,
      opt_risk_level: visa.risk,
      sponsorship_chance: visa.chance,
      apply_confidence: visa.score,
      opt_risk_reason: visa.reason,
      risk_reason: visa.reason,

      experience_level: exp[0],
      experience_years: exp[1],

      role_category: "Technology / Business",

      apply_ease: "Direct Apply",
      source_type: "direct_employer_career_site",

      remote:
        title.toLowerCase().includes("remote") ||
        location.toLowerCase().includes("remote"),

      salary: "",
      company_domain: "",
      excluded_reason: "",
      freshness_label: "Fresh",
      scraped_at: new Date().toISOString(),
    });
  }

  return {
    rows,
    found: rows.length,
  };
}
