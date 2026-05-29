import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

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

  const endpoint =
    `${source.careers_url.split("/").slice(0, 3).join("/")}` +
    `/wday/cxs/${parsed.tenant}/${parsed.site}/jobs`;

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
    const location = job.locationsText || "United States";

    const applyLink =
      source.careers_url +
      (job.externalPath ? `/job/${job.externalPath}` : "");

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
      job_hash: hash(
        title,
        source.company_name,
        location,
        applyLink
      ),
      description: "",
      full_page_text: "",
      is_fresh: true,
      is_active: true,
      scraped_at: new Date().toISOString(),
      ats_platform: "Workday",
      source_type: "direct_employer_career_site",
    });
  }

  return {
    rows,
    found: jobs.length,
  };
}
