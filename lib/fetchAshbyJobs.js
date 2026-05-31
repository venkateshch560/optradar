import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const companies = [
  "perplexity",
  "cursor",
  "anthropic",
  "linear",
  "vercel",
  "replit",
  "ramp",
  "mercury",
  "instabase",
  "scale-ai"
];

function isFresh(date) {
  if (!date) return false;
  return Date.now() - new Date(date).getTime() <= 24 * 60 * 60 * 1000;
}

function category(title) {
  const t = title.toLowerCase();
  if (t.includes("data") || t.includes("analyst")) return "Data / Analytics";
  if (t.includes("software") || t.includes("engineer")) return "Software / Engineering";
  if (t.includes("cloud") || t.includes("devops")) return "Cloud / DevOps";
  if (t.includes("support")) return "IT Support";
  if (t.includes("product") || t.includes("business")) return "Business / Product";
  return "Other";
}

function classifyOpt(title, description, location) {
  const text = `${title || ""} ${description || ""} ${location || ""}`.toLowerCase();

  const hardBlocked = [
    "us citizen only",
    "u.s. citizen only",
    "citizen only",
    "green card only",
    "permanent resident only",
    "security clearance",
    "secret clearance",
    "top secret",
    "ts/sci",
    "public trust",
    "us persons only",
    "federal clearance"
  ];

  const optFriendly = [
    "opt",
    "stem opt",
    "cpt",
    "f-1",
    "ead",
    "h-1b",
    "visa sponsorship",
    "sponsorship available",
    "open to sponsorship",
    "e-verify",
    "entry level",
    "new grad"
  ];

  const warning = [
    "no sponsorship",
    "without sponsorship",
    "no future sponsorship",
    "must be authorized to work"
  ];

  const blocked = hardBlocked.find((word) => text.includes(word));
  const friendly = optFriendly.find((word) => text.includes(word));
  const warn = warning.find((word) => text.includes(word));

  if (blocked) {
    return {
      skip: true,
      opt_status: "Not Eligible",
      sponsorship_chance: "Low",
      apply_confidence: 0,
      opt_risk_level: "High Risk",
      opt_risk_reason: blocked,
      risk_reason: blocked,
      excluded_reason: blocked
    };
  }

  if (friendly) {
    return {
      skip: false,
      opt_status: "OPT Friendly",
      sponsorship_chance: "High",
      apply_confidence: 92,
      opt_risk_level: "Low Risk",
      opt_risk_reason: "",
      risk_reason: "",
      excluded_reason: ""
    };
  }

  if (warn) {
    return {
      skip: false,
      opt_status: "Apply Carefully",
      sponsorship_chance: "Medium",
      apply_confidence: 70,
      opt_risk_level: "Medium Risk",
      opt_risk_reason: "Sponsorship unclear",
      risk_reason: "Sponsorship unclear",
      excluded_reason: ""
    };
  }

  return {
    skip: false,
    opt_status: "Possible OPT",
    sponsorship_chance: "Medium",
    apply_confidence: 80,
    opt_risk_level: "Medium Risk",
    opt_risk_reason: "No clear OPT/sponsorship language",
    risk_reason: "No clear OPT/sponsorship language",
    excluded_reason: ""
  };
}

function createJobHash(title, company, location, applyLink) {
  return crypto
    .createHash("sha256")
    .update(`${title}|${company}|${location}|${applyLink}`.toLowerCase().trim())
    .digest("hex");
}

export async function fetchAshbyJobs() {
  let totalSaved = 0;

  for (const company of companies) {
    try {
      const res = await fetch(
        `https://api.ashbyhq.com/posting-api/job-board/${company}`,
        { cache: "no-store" }
      );

      if (!res.ok) continue;

      const data = await res.json();
      const jobs = data.jobs || [];
      const rows = [];

      for (const job of jobs) {
        const title = job.title || "";
        const applyLink = job.jobUrl || job.applyUrl || "";
        const postedAt = job.publishedAt || job.updatedAt || new Date().toISOString();
        const location = job.location || "United States";
        const description = job.descriptionPlain || job.descriptionHtml || "";

        if (!title || !applyLink) continue;

        const opt = classifyOpt(title, description, location);

        if (opt.skip) continue;

        const fresh = isFresh(postedAt);
        const jobHash = createJobHash(title, company, location, applyLink);

        rows.push({
          title,
          company: company.toUpperCase(),
          location,
          posted_at: postedAt,
         last_seen_at: new Date().toISOString(),
          job_hash: jobHash,
          apply_link: applyLink,
          source: "Ashby",
          description,
          opt_status: opt.opt_status,
          risk_reason: opt.risk_reason,
          experience_level: "Experience not listed by employer",
          experience_years: null,
          is_fresh: fresh,
          is_active: true,
          salary: "",
          remote:
            title.toLowerCase().includes("remote") ||
            location.toLowerCase().includes("remote"),
          full_page_text: description,
          scraped_at: new Date().toISOString(),
          is_direct_employer: true,
          source_type: "direct_employer_career_site",
          excluded_reason: opt.excluded_reason,
          sponsorship_chance: opt.sponsorship_chance,
          apply_confidence: opt.apply_confidence,
          opt_risk_level: opt.opt_risk_level,
          opt_risk_reason: opt.opt_risk_reason,
          freshness_label: fresh ? "Fresh" : "Archive",
          role_category: category(title),
          apply_ease: "Direct Apply",
          ats_platform: "Ashby",
          company_domain: `${company}.com`,
        });
      }

      if (rows.length > 0) {
        const { error } = await supabase.from("jobs").upsert(rows, {
          onConflict: "job_hash",
          ignoreDuplicates: true,
        });

        if (!error) totalSaved += rows.length;
        else console.log("ASHBY UPSERT ERROR:", company, error.message);
      }
    } catch (err) {
      console.log("ASHBY ERROR:", company, err.message);
    }
  }

  return totalSaved;
}
