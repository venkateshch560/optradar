import crypto from "crypto";

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

function cleanText(value = "") {
  return String(value).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
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

function roleCategory(title = "") {
  const t = title.toLowerCase();

  if (t.includes("data") || t.includes("analyst") || t.includes("bi") || t.includes("sql")) {
    return "Data / Analytics";
  }

  if (t.includes("software") || t.includes("engineer") || t.includes("developer")) {
    return "Software / Engineering";
  }

  if (t.includes("cloud") || t.includes("devops")) return "Cloud / DevOps";
  if (t.includes("support") || t.includes("help desk")) return "IT Support";
  if (t.includes("security") || t.includes("soc")) return "Cybersecurity";
  if (t.includes("product") || t.includes("business")) return "Business / Product";

  return "Other";
}

function isAllowedRole(title = "") {
  const t = title.toLowerCase();

  return [
    "data",
    "analyst",
    "business",
    "software",
    "engineer",
    "developer",
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
  ].some((role) => t.includes(role));
}

function isBlocked(text = "") {
  const lower = text.toLowerCase();

  return [
    "us citizen only",
    "u.s. citizen only",
    "u.s. citizens only",
    "green card only",
    "permanent resident only",
    "security clearance",
    "secret clearance",
    "top secret",
    "ts/sci",
    "public trust",
    "us persons only",
    "u.s. persons only",
  ].some((word) => lower.includes(word));
}

function experience(title = "") {
  const t = title.toLowerCase();

  if (t.includes("intern") || t.includes("internship")) {
    return { level: "Internship", years: 0 };
  }

  if (
    t.includes("junior") ||
    t.includes("entry") ||
    t.includes("associate") ||
    t.includes("new grad")
  ) {
    return { level: "Entry Level", years: 0 };
  }

  if (t.includes("senior") || t.includes("sr.") || t.includes("principal")) {
    return { level: "Senior", years: 6 };
  }

  if (t.includes("manager") || t.includes("lead") || t.includes("director")) {
    return { level: "Lead / Manager", years: 8 };
  }

  return { level: "Experience not listed by employer", years: null };
}

export async function fetchWorkday(source) {
  if (!source.careers_url) {
    return { rows: [], found: 0, error: "Missing careers_url" };
  }

  const parsed = parseWorkday(source.careers_url);

  if (!parsed) {
    return { rows: [], found: 0, error: "Could not parse Workday URL" };
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
      limit: 100,
      offset: 0,
      searchText: "",
    }),
  });

  if (!response.ok) {
    return { rows: [], found: 0, error: `Workday ${response.status}` };
  }

  const data = await response.json();
  const jobs = data.jobPostings || [];
  const rows = [];

  for (const job of jobs) {
    const title = cleanText(job.title || "");

    if (!title) continue;
    if (!isAllowedRole(title)) continue;

    const location = cleanText(job.locationsText || "United States");
    const externalPath = job.externalPath || "";
    const description = cleanText(job.bulletFields || job.title || "");
    const checkText = `${title} ${location} ${description}`;

    if (isBlocked(checkText)) continue;

    const applyLink = buildApplyLink(source.careers_url, externalPath);
    const exp = experience(title);

    rows.push({
      title,
      company: source.company_name,
      location,
      apply_link: applyLink,
      apply_url: applyLink,
      source: "Workday",
      posted_at: new Date().toISOString(),
      last_seen_at: new Date().toISOString(),
      job_hash: hash(title, source.company_name, location, applyLink),
      description,
      full_page_text: description,
      is_fresh: true,
      is_active: true,
      scraped_at: new Date().toISOString(),
      ats_platform: "Workday",
      source_type: "direct_employer_career_site",
      opt_status: "Possible OPT",
      opt_risk_level: "Medium Risk",
      opt_risk_reason: "No clear OPT/sponsorship language",
      risk_reason: "No clear OPT/sponsorship language",
      sponsorship_chance: "Medium",
      apply_confidence: 80,
      experience_level: exp.level,
      experience_years: exp.years,
      salary: "",
      remote:
        title.toLowerCase().includes("remote") ||
        location.toLowerCase().includes("remote"),
      is_direct_employer: true,
      excluded_reason: "",
      freshness_label: "Fresh",
      role_category: roleCategory(title),
      apply_ease: "Direct Apply",
      company_domain: "",
    });
  }

  return { rows, found: jobs.length };
}
