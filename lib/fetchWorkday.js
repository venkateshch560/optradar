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

  const endpoints = [
    `${base}/wday/cxs/${parsed.tenant}/${parsed.site}/jobs`,
    `${base}/wday/cxs/${parsed.tenant}/${parsed.site}/jobs/search`,
    `${base}/wday/cxs/${parsed.tenant}/${parsed.site}/jobs/`,
  ];

  let data = null;
  let lastError = null;

  for (const endpoint of endpoints) {
    try {
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
          limit: 50,
          offset: 0,
          searchText: "",
        }),
      });

      if (!response.ok) {
        lastError = `Workday ${response.status}`;
        continue;
      }

      data = await response.json();
      break;
    } catch (err) {
      lastError = err.message;
    }
  }

  if (!data) {
    return {
      rows: [],
      found: 0,
      error: lastError || "Workday request failed",
    };
  }

  const jobs = data.jobPostings || data.jobs || [];
  const rows = [];

  for (const job of jobs) {
    const title = job.title || "";
    const location =
      job.locationsText ||
      job.location ||
      job.primaryLocation ||
      "United States";

    const externalPath =
      job.externalPath ||
      job.url ||
      job.jobPath ||
      "";

    const applyLink = externalPath.startsWith("http")
      ? externalPath
      : `${source.careers_url}/job/${externalPath}`;

    rows.push({
      title,
      company: source.company_name,
      location,
      apply_link: applyLink,
      apply_url: applyLink,
      source: "Workday",
      posted_at: new Date().toISOString(),
      first_seen_at: new Date().toISOString(),
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
