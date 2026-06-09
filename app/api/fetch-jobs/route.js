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
  "machine learning", "ai", "sql", "power bi", "sap", "cyber",
  "bi developer", "reporting", "database", "etl"
];

const blockedWords = [
  "us citizen only", "u.s. citizen only", "u.s. citizens only",
  "green card only", "permanent resident only", "security clearance",
  "secret clearance", "top secret", "ts/sci", "public trust",
  "us persons only", "u.s. persons only"
];

function jobHash(title, company, location, link) {
  return crypto
    .createHash("sha256")
    .update(`${title}|${company}|${location}|${link}`.toLowerCase().trim())
    .digest("hex");
}

function cleanText(value = "") {
  return String(value).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function isAllowedRole(title = "") {
  const t = title.toLowerCase();
  return allowedRoles.some((r) => t.includes(r));
}

function classify(text = "") {
  const lower = text.toLowerCase();

  if (
    lower.includes("u.s. citizen") ||
    lower.includes("us citizen") ||
    lower.includes("security clearance") ||
    lower.includes("secret clearance") ||
    lower.includes("top secret")
  ) {
    return null;
  }


  if (
    lower.includes("will not sponsor") ||
    lower.includes("does not sponsor") ||
    lower.includes("without sponsorship") ||
    lower.includes("no sponsorship")
  ) {
    return {
      opt_status: "Not OPT Friendly",
      opt_risk_level: "High Risk",
      sponsorship_chance: "Low",
      apply_confidence: 20,
      opt_risk_reason:
        "Employer indicates sponsorship restriction",
    };
  }


  if (
    lower.includes("h-1b") ||
    lower.includes("visa sponsorship") ||
    lower.includes("stem opt") ||
    lower.includes("opt") ||
    lower.includes("f-1") ||
    lower.includes("e-verify")
  ) {
    return {
      opt_status: "OPT Friendly",
      opt_risk_level: "Low Risk",
      sponsorship_chance: "High",
      apply_confidence: 90,
      opt_risk_reason:
        "Positive immigration keywords found",
    };
  }


  return {
    opt_status: "Review Needed",
    opt_risk_level: "Medium Risk",
    sponsorship_chance: "Unknown",
    apply_confidence: 50,
    opt_risk_reason:
      "No sponsorship information found",
  };
}

  return {
    opt_status: "Possible OPT",
    opt_risk_level: "Medium Risk",
    sponsorship_chance: "Medium",
    apply_confidence: 80,
    opt_risk_reason: "No clear OPT/sponsorship language",
  };
}

function roleCategory(title = "") {
  const t = title.toLowerCase();

  if (
    t.includes("data") ||
    t.includes("analyst") ||
    t.includes("bi") ||
    t.includes("sql") ||
    t.includes("reporting")
  ) {
    return "Data / Analytics";
  }

  if (
    t.includes("software") ||
    t.includes("engineer") ||
    t.includes("developer")
  ) {
    return "Software / Engineering";
  }

  if (t.includes("cloud") || t.includes("devops")) return "Cloud / DevOps";
  if (t.includes("support") || t.includes("help desk")) return "IT Support";
  if (t.includes("security") || t.includes("soc")) return "Cybersecurity";
  if (t.includes("product") || t.includes("business")) return "Business / Product";
  if (t.includes("sap") || t.includes("erp")) return "ERP / SAP";

  return "Other";
}

function experience(text = "") {

 const t = text.toLowerCase();


 const match =
 t.match(/(\d+)\+?\s+years/) ||
 t.match(/(\d+)\+?\s+yrs/);


 if(match){

 const yrs = Number(match[1]);

 if(yrs <=2)
 return {
 level:"Entry Level",
 years:yrs
 };

 if(yrs <=5)
 return {
 level:"Mid Level",
 years:yrs
 };

 return {
 level:"Senior",
 years:yrs
 };

 }


 if(
 t.includes("intern") ||
 t.includes("new grad") ||
 t.includes("junior") ||
 t.includes("associate")
 ){
 return {
 level:"Entry Level",
 years:0
 };
 }


 return {
 level:"Not specified",
 years:null
 };

}

function normalizeJob({
  title,
  company,
  location,
  description,
  applyLink,
  source,
  postedAt,
}) {
  const cleanTitle = cleanText(title);
  const cleanDescription = cleanText(description);
  const cleanLocation = cleanText(location || "United States");

  if (!cleanTitle || !applyLink) return null;
  if (!applyLink.startsWith("http")) return null;
  if (!isAllowedRole(cleanTitle)) return null;

  const opt = classify(`${cleanTitle} ${company} ${cleanLocation} ${cleanDescription}`);
  if (!opt) return null;

const exp = experience(
 `${cleanTitle} ${cleanDescription}`
);
  return {
    title: cleanTitle,
    company,
    location: cleanLocation,
    description: cleanDescription,
    full_page_text: cleanDescription,
    apply_link: applyLink,
    apply_url: applyLink,
    job_hash: jobHash(cleanTitle, company, cleanLocation, applyLink),
    source,
    posted_at: postedAt || new Date().toISOString(),
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
      cleanTitle.toLowerCase().includes("remote") ||
      cleanLocation.toLowerCase().includes("remote"),
    salary: "",
    scraped_at: new Date().toISOString(),
    is_direct_employer: true,
    source_type: "direct_employer_career_site",
    excluded_reason: "",
    freshness_label: "Fresh",
    role_category: roleCategory(cleanTitle),
    apply_ease: "Direct Apply",
    ats_platform: source,
    company_domain: "",
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
        postedAt: job.updated_at,
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
        applyLink: job.hostedUrl || job.applyUrl,
        source: "Lever",
        postedAt: job.createdAt ? new Date(job.createdAt).toISOString() : null,
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
        applyLink: job.jobUrl || job.applyUrl,
        source: "Ashby",
        postedAt: job.publishedAt || job.updatedAt,
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

  if (!res.ok) {
    return { rows: [], found: 0, error: `SmartRecruiters ${res.status}` };
  }

  const data = await res.json();
  const jobs = data.content || [];

  const rows = jobs
    .map((job) => {
      const applyLink =
        job.applyUrl ||
        job.postingUrl ||
        (job.id
          ? `https://jobs.smartrecruiters.com/${source.ats_slug}/${job.id}`
          : "");

      return normalizeJob({
        title: job.name,
        company: source.company_name,
        location:
          job.location?.city ||
          job.location?.region ||
          job.location?.country ||
          "United States",
        description: job.refNumber || job.name || "",
        applyLink,
        source: "SmartRecruiters",
        postedAt: job.releasedDate,
      });
    })
    .filter(Boolean);

  return { rows, found: jobs.length };
}

async function saveRows(rows) {
  if (!rows.length) return { saved: 0, error: null };

  const uniqueRows = Array.from(
    new Map(rows.map((row) => [row.job_hash, row])).values()
  );

  const { error } = await supabase.from("jobs").upsert(uniqueRows, {
    onConflict: "job_hash",
  });

  return { saved: error ? 0 : uniqueRows.length, error };
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
    .in("ats_platform", [
      "greenhouse",
      "lever",
      "ashby",
      "smartrecruiters",
      "workday",
    ])
    .limit(150);

  if (sourceError) {
    return Response.json(
      { success: false, error: sourceError.message },
      { status: 500 }
    );
  }

  let totalSaved = 0;
  const debug = [];

  for (const source of sources || []) {
    let result = { rows: [], found: 0 };

    try {
      if (source.ats_platform === "greenhouse") {
        result = await fetchGreenhouse(source);
      } else if (source.ats_platform === "lever") {
        result = await fetchLever(source);
      } else if (source.ats_platform === "ashby") {
        result = await fetchAshby(source);
      } else if (source.ats_platform === "smartrecruiters") {
        result = await fetchSmartRecruiters(source);
      } else if (source.ats_platform === "workday") {
        result = await fetchWorkday(source);
      }

      const save = await saveRows(result.rows || []);

      if (save.error) {
        debug.push({
          company: source.company_name,
          ats: source.ats_platform,
          found: result.found,
          prepared: result.rows?.length || 0,
          saved: 0,
          error: save.error.message,
        });
      } else {
        totalSaved += save.saved;
        debug.push({
          company: source.company_name,
          ats: source.ats_platform,
          found: result.found,
          prepared: result.rows?.length || 0,
          saved: save.saved,
          error: result.error || null,
        });
      }
    } catch (err) {
      debug.push({
        company: source.company_name,
        ats: source.ats_platform,
        saved: 0,
        error: err.message,
      });
    }
  }

  return Response.json({
    success: true,
    totalSaved,
    sourcesChecked: sources?.length || 0,
    debug,
  });
}
