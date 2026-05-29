export const maxDuration = 60;

import { createClient } from "@supabase/supabase-js";
import { fetchWorkday } from "@/lib/fetchWorkday";
import crypto from "crypto";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const allowedRoles = [
  "data", "analyst", "business", "software", "engineer", "developer",
  "frontend", "backend", "full stack", "cloud", "devops", "qa",
  "support", "systems", "security", "product", "operations",
  "machine learning", "ai", "sql", "power bi", "sap", "cyber"
];

const blockedWords = [
  "us citizen only",
  "u.s. citizen only",
  "green card only",
  "permanent resident only",
  "security clearance",
  "top secret",
  "ts/sci",
  "public trust",
  "us persons only"
];

function jobHash(title, company, location, link) {
  return crypto
    .createHash("sha256")
    .update(`${title}|${company}|${location}|${link}`.toLowerCase())
    .digest("hex");
}

function isAllowedRole(title = "") {
  const t = title.toLowerCase();
  return allowedRoles.some((r) => t.includes(r));
}

function classify(text = "") {
  const lower = text.toLowerCase();

  if (blockedWords.some((w) => lower.includes(w))) return null;

  if (
    lower.includes("opt") ||
    lower.includes("stem opt") ||
    lower.includes("f-1") ||
    lower.includes("cpt") ||
    lower.includes("ead") ||
    lower.includes("visa sponsorship") ||
    lower.includes("h-1b") ||
    lower.includes("e-verify")
  ) {
    return {
      opt_status: "OPT Friendly",
      opt_risk_level: "Low Risk",
      sponsorship_chance: "High",
      apply_confidence: 90,
      opt_risk_reason: ""
    };
  }

  if (
    lower.includes("no sponsorship") ||
    lower.includes("without sponsorship") ||
    lower.includes("must be authorized")
  ) {
    return {
      opt_status: "Apply Carefully",
      opt_risk_level: "Medium Risk",
      sponsorship_chance: "Medium",
      apply_confidence: 70,
      opt_risk_reason: "Sponsorship unclear"
    };
  }

  return {
    opt_status: "Possible OPT",
    opt_risk_level: "Medium Risk",
    sponsorship_chance: "Medium",
    apply_confidence: 80,
    opt_risk_reason: "No clear OPT/sponsorship language"
  };
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
  if (t.includes("sap") || t.includes("erp")) return "ERP / SAP";

  return "Other";
}

function experience(title = "") {
  const t = title.toLowerCase();

  if (t.includes("junior") || t.includes("entry") || t.includes("associate") || t.includes("new grad")) {
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

function normalizeJob({
  title,
  company,
  location,
  description,
  applyLink,
  source,
  postedAt
}) {
  if (!title || !applyLink) return null;
  if (!isAllowedRole(title)) return null;

  const opt = classify(`${title} ${company} ${location} ${description}`);
  if (!opt) return null;

  const exp = experience(title);

  return {
    title,
    company,
    location: location || "United States",
    description: description || "",
    full_page_text: description || "",
    apply_link: applyLink,
    apply_url: applyLink,
    job_hash: jobHash(title, company, location || "United States", applyLink),
    source,
    posted_at: postedAt || new Date().toISOString(),
    first_seen_at: new Date().toISOString(),
    last_seen_at: new Date().toISOString(),
    opt_status: opt.opt_status,
    opt_risk_level: opt.opt_risk_level,
    opt_risk_reason: opt.opt_risk_reason,
    risk_reason: opt.opt_risk_reason,
    sponsorship_chance: opt.sponsorship_chance,
    apply_confidence: opt.apply_confidence,
    experience_level: exp.level,
    experience_years: exp.years,
    is_fresh: true,
    is_active: true,
    remote:
      title.toLowerCase().includes("remote") ||
      (location || "").toLowerCase().includes("remote"),
    salary: "",
    scraped_at: new Date().toISOString(),
    is_direct_employer: true,
    source_type: "direct_employer_career_site",
    excluded_reason: "",
    freshness_label: "Fresh",
    role_category: roleCategory(title),
    apply_ease: "Direct Apply",
    ats_platform: source,
    company_domain: ""
  };
}

async function fetchGreenhouse(source) {
  const res = await fetch(
    `https://boards-api.greenhouse.io/v1/boards/${source.ats_slug}/jobs?content=true`,
    { cache: "no-store" }
  );

  if (!res.ok) return { rows: [], found: 0, error: `Greenhouse ${res.status}` };

  const data = await res.json();
  const jobs = data.jobs || [];

  const rows = jobs
    .map((job) =>
      normalizeJob({
        title: job.title,
        company: source.company_name,
        location: job.location?.name || "United States",
        description: job.content || "",
        applyLink: job.absolute_url,
        source: "Greenhouse",
        postedAt: job.updated_at
      })
    )
    .filter(Boolean);

  return { rows, found: jobs.length };
}

async function fetchLever(source) {
  const res = await fetch(
    `https://api.lever.co/v0/postings/${source.ats_slug}?mode=json`,
    { cache: "no-store" }
  );

  if (!res.ok) return { rows: [], found: 0, error: `Lever ${res.status}` };

  const jobs = await res.json();

  const rows = (jobs || [])
    .map((job) =>
      normalizeJob({
        title: job.text,
        company: source.company_name,
        location: job.categories?.location || "United States",
        description: job.descriptionPlain || job.description || "",
        applyLink: job.hostedUrl,
        source: "Lever",
        postedAt: job.createdAt ? new Date(job.createdAt).toISOString() : null
      })
    )
    .filter(Boolean);

  return { rows, found: jobs.length };
}

async function fetchAshby(source) {
  const res = await fetch(
    `https://api.ashbyhq.com/posting-api/job-board/${source.ats_slug}`,
    { cache: "no-store" }
  );

  if (!res.ok) return { rows: [], found: 0, error: `Ashby ${res.status}` };

  const data = await res.json();
  const jobs = data.jobs || [];

  const rows = jobs
    .map((job) =>
      normalizeJob({
        title: job.title,
        company: source.company_name,
        location: job.location || "United States",
        description: job.descriptionPlain || job.descriptionHtml || "",
        applyLink: job.jobUrl,
        source: "Ashby",
        postedAt: job.publishedAt
      })
    )
    .filter(Boolean);

  return { rows, found: jobs.length };
}

async function fetchSmartRecruiters(source) {
  const res = await fetch(
    `https://api.smartrecruiters.com/v1/companies/${source.ats_slug}/postings?limit=100`,
    { cache: "no-store" }
  );

  if (!res.ok) return { rows: [], found: 0, error: `SmartRecruiters ${res.status}` };

  const data = await res.json();
  const jobs = data.content || [];

  const rows = jobs
    .map((job) =>
      normalizeJob({
        title: job.name,
        company: source.company_name,
        location: job.location?.city || job.location?.country || "United States",
        description: job.refNumber || "",
        applyLink: job.ref,
        source: "SmartRecruiters",
        postedAt: job.releasedDate
      })
    )
    .filter(Boolean);

  return { rows, found: jobs.length };
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);

  if (searchParams.get("secret") !== process.env.CRON_SECRET) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: sources, error: sourceError } = await supabase
   .from("company_sources")
.select("*")
.eq("active", true)
.not("careers_url", "is", null)
.limit(100);

  if (sourceError) {
    return Response.json({ success: false, error: sourceError.message }, { status: 500 });
  }

  let totalSaved = 0;
  const debug = [];

  for (const source of sources || []) {
    let result = { rows: [], found: 0 };

    try {
      if (source.ats_platform === "greenhouse") result = await fetchGreenhouse(source);
      else if (source.ats_platform === "lever") result = await fetchLever(source);
      else if (source.ats_platform === "ashby") result = await fetchAshby(source);
      else if (source.ats_platform === "smartrecruiters") result = await fetchSmartRecruiters(source);
            else if (source.ats_platform === "workday") {
      result = await fetchWorkday(source);
    }
      else {
        debug.push({
          company: source.company_name,
          ats: source.ats_platform,
          saved: 0,
          error: "ATS not supported yet"
        });
        continue;
      }

      const uniqueRows = Array.from(
        new Map(result.rows.map((row) => [row.job_hash, row])).values()
      );

      if (uniqueRows.length > 0) {
        const { error } = await supabase.from("jobs").upsert(uniqueRows, {
          onConflict: "job_hash",
          ignoreDuplicates: true
        });

        if (error) {
          debug.push({
            company: source.company_name,
            ats: source.ats_platform,
            found: result.found,
            prepared: uniqueRows.length,
            saved: 0,
            error: error.message
          });
        } else {
          totalSaved += uniqueRows.length;
          debug.push({
            company: source.company_name,
            ats: source.ats_platform,
            found: result.found,
            prepared: uniqueRows.length,
            saved: uniqueRows.length
          });
        }
      } else {
        debug.push({
          company: source.company_name,
          ats: source.ats_platform,
          found: result.found,
          prepared: 0,
          saved: 0,
          error: result.error || null
        });
      }
    } catch (err) {
      debug.push({
        company: source.company_name,
        ats: source.ats_platform,
        saved: 0,
        error: err.message
      });
    }
  }

  return Response.json({
    success: true,
    totalSaved,
    sourcesChecked: sources?.length || 0,
    debug
  });
}
