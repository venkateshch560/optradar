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
      limit: 20,
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
    const title = job.title || "";
    if (!title) continue;

    const location = job.locationsText || "United States";
    const externalPath = job.externalPath || "";

   const cleanPath = externalPath.startsWith("/")
  ? externalPath
  : `/${externalPath}`;

const applyLink = externalPath.startsWith("http")
  ? externalPath
  : `${source.careers_url}${cleanPath}`;

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
      description: "",
      full_page_text: "",
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
      experience_level: "Experience not listed by employer",
      experience_years: null,
      salary: "",
      remote:
        title.toLowerCase().includes("remote") ||
        location.toLowerCase().includes("remote"),
      is_direct_employer: true,
      excluded_reason: "",
      freshness_label: "Fresh",
      role_category: "Other",
      apply_ease: "Direct Apply",
      company_domain: "",
    });
  }

  return {
    rows,
    found: jobs.length,
  };
}
