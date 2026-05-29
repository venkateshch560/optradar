import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const companies = [
  "airbnb",
  "stripe",
  "datadog",
  "cloudflare",
  "reddit",
  "brex",
  "plaid",
  "figma",
  "doordash",
  "ramp",
  "asana",
  "hubspot",
  "mongodb",
  "benchling",
  "checkr",
  "coinbase",
  "robinhood",
  "affirm",
  "notion"
];

const blockedWords = [
  "security clearance",
  "top secret",
  "ts/sci",
  "public trust",
  "u.s. citizen only",
  "us citizen only",
  "citizen only",
  "green card only",
  "permanent resident only",
  "us persons only",
  "federal clearance"
];

function createJobHash(title, company, location, applyLink) {
  return crypto
    .createHash("sha256")
    .update(`${title}|${company}|${location}|${applyLink}`.toLowerCase().trim())
    .digest("hex");
}

function classifyOpt(text) {
  const lower = text.toLowerCase();
  const blocked = blockedWords.find((word) => lower.includes(word));

  if (blocked) {
    return {
      skip: true,
      opt_status: "Not Eligible",
      opt_risk_level: "High Risk",
      opt_risk_reason: blocked,
      sponsorship_chance: "Low",
      apply_confidence: 0
    };
  }

  if (
    lower.includes("visa") ||
    lower.includes("sponsorship") ||
    lower.includes("opt") ||
    lower.includes("stem") ||
    lower.includes("f-1") ||
    lower.includes("ead") ||
    lower.includes("cpt") ||
    lower.includes("e-verify")
  ) {
    return {
      skip: false,
      opt_status: "OPT Friendly",
      opt_risk_level: "Low Risk",
      opt_risk_reason: "",
      sponsorship_chance: "High",
      apply_confidence: 92
    };
  }

  if (
    lower.includes("must be authorized") ||
    lower.includes("without sponsorship") ||
    lower.includes("no sponsorship")
  ) {
    return {
      skip: false,
      opt_status: "Apply Carefully",
      opt_risk_level: "Medium Risk",
      opt_risk_reason: "Sponsorship unclear",
      sponsorship_chance: "Medium",
      apply_confidence: 70
    };
  }

  return {
    skip: false,
    opt_status: "Possible OPT",
    opt_risk_level: "Medium Risk",
    opt_risk_reason: "No clear OPT/sponsorship language",
    sponsorship_chance: "Medium",
    apply_confidence: 82
  };
}

function getCategory(title) {
  const lower = title.toLowerCase();
  if (lower.includes("data") || lower.includes("analyst") || lower.includes("analytics")) return "Data / Analytics";
  if (lower.includes("software") || lower.includes("engineer") || lower.includes("developer")) return "Software / Engineering";
  if (lower.includes("cloud") || lower.includes("devops")) return "Cloud / DevOps";
  if (lower.includes("support") || lower.includes("help desk")) return "IT Support";
  if (lower.includes("security") || lower.includes("cyber")) return "Cybersecurity";
  return "Other";
}

function detectExperience(title) {
  const lower = title.toLowerCase();
  if (lower.includes("senior") || lower.includes("sr.") || lower.includes("principal")) return { level: "Senior", years: 6 };
  if (lower.includes("manager") || lower.includes("director") || lower.includes("lead")) return { level: "Lead / Manager", years: 8 };
  if (lower.includes("junior") || lower.includes("associate") || lower.includes("entry")) return { level: "Entry Level", years: 0 };
  return { level: "Experience not listed by employer", years: null };
}

function isFresh(date) {
  if (!date) return false;
  const posted = new Date(date).getTime();
  if (!posted || Number.isNaN(posted)) return false;
  return Date.now() - posted <= 24 * 60 * 60 * 1000;
}

export async function fetchGreenhouseJobs() {
  let totalSaved = 0;
  const debug = [];

  for (const company of companies) {
    try {
      const response = await fetch(
        `https://boards-api.greenhouse.io/v1/boards/${company}/jobs?content=true`,
        { cache: "no-store" }
      );

      if (!response.ok) {
        debug.push({ company, found: 0, saved: 0, error: `Status ${response.status}` });
        continue;
      }

      const data = await response.json();
      const jobs = data.jobs || [];
      const rows = [];

      for (const job of jobs) {
        const title = job.title || "";
        const applyLink = job.absolute_url || "";
        const location = job.location?.name || "United States";
        const description = job.content || "";
        const postedAt = job.updated_at || new Date().toISOString();

        if (!title || !applyLink) continue;

        const opt = classifyOpt(`${title} ${description} ${location}`);
        if (opt.skip) continue;

        const exp = detectExperience(title);
        const fresh = isFresh(postedAt);
        const jobHash = createJobHash(title, company, location, applyLink);

        rows.push({
          title,
          company: company.toUpperCase(),
          location,
          posted_at: postedAt,
          first_seen_at: new Date().toISOString(),
          last_seen_at: new Date().toISOString(),
          job_hash: jobHash,
          apply_link: applyLink,
          apply_url: applyLink,
          source: "Greenhouse",
          description,
          opt_status: opt.opt_status,
          risk_reason: opt.opt_risk_reason,
          experience_level: exp.level,
          experience_years: exp.years,
          is_fresh: fresh,
          is_active: true,
          salary: "",
          remote: title.toLowerCase().includes("remote") || location.toLowerCase().includes("remote"),
          full_page_text: description,
          scraped_at: new Date().toISOString(),
          is_direct_employer: true,
          source_type: "direct_employer_career_site",
          excluded_reason: "",
          sponsorship_chance: opt.sponsorship_chance,
          apply_confidence: opt.apply_confidence,
          opt_risk_level: opt.opt_risk_level,
          opt_risk_reason: opt.opt_risk_reason,
          freshness_label: fresh ? "Fresh" : "Archive",
          role_category: getCategory(title),
          apply_ease: "Direct Apply",
          ats_platform: "Greenhouse",
          company_domain: `${company}.com`
        });
      }

      const uniqueRows = Array.from(new Map(rows.map((row) => [row.job_hash, row])).values());

      if (uniqueRows.length > 0) {
        const { error } = await supabase.from("jobs").upsert(uniqueRows, {
          onConflict: "job_hash",
          ignoreDuplicates: true
        });

        if (error) {
          debug.push({ company, found: jobs.length, prepared: uniqueRows.length, saved: 0, error: error.message });
        } else {
          totalSaved += uniqueRows.length;
          debug.push({ company, found: jobs.length, prepared: uniqueRows.length, saved: uniqueRows.length });
        }
      } else {
        debug.push({ company, found: jobs.length, prepared: 0, saved: 0 });
      }
    } catch (err) {
      debug.push({ company, found: 0, prepared: 0, saved: 0, error: err.message });
    }
  }

  return { totalSaved, debug };
}
