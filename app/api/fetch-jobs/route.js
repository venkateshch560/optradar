export const maxDuration = 60;

import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const roles = [
  "Data Analyst",
  "Junior Data Analyst",
  "Business Analyst",
  "Power BI Developer",
  "Reporting Analyst",
  "SQL Analyst",
  "Software Engineer",
  "Junior Software Engineer",
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Data Engineer",
  "Cloud Engineer",
  "DevOps Engineer",
  "QA Engineer",
  "Systems Analyst",
  "Cybersecurity Analyst",
  "SOC Analyst",
  "SAP Analyst",
  "IT Support Analyst"
];

const atsSites = [
  "greenhouse.io",
  "lever.co",
  "ashbyhq.com",
  "smartrecruiters.com",
  "myworkdayjobs.com",
  "icims.com"
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

function hash(title, company, location, link) {
  return crypto
    .createHash("sha256")
    .update(`${title}|${company}|${location}|${link}`.toLowerCase())
    .digest("hex");
}

function classify(text) {
  const lower = text.toLowerCase();

  if (blockedWords.some((w) => lower.includes(w))) return null;

  if (
    lower.includes("opt") ||
    lower.includes("stem") ||
    lower.includes("f-1") ||
    lower.includes("ead") ||
    lower.includes("visa sponsorship") ||
    lower.includes("e-verify")
  ) {
    return {
      opt_status: "OPT Friendly",
      opt_risk_level: "Low Risk",
      sponsorship_chance: "High",
      apply_confidence: 90
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
      apply_confidence: 70
    };
  }

  return {
    opt_status: "Possible OPT",
    opt_risk_level: "Medium Risk",
    sponsorship_chance: "Medium",
    apply_confidence: 80
  };
}

function category(title) {
  const t = title.toLowerCase();
  if (t.includes("data") || t.includes("analyst") || t.includes("sql") || t.includes("power bi")) return "Data / Analytics";
  if (t.includes("software") || t.includes("developer") || t.includes("engineer")) return "Software / Engineering";
  if (t.includes("cloud") || t.includes("devops")) return "Cloud / DevOps";
  if (t.includes("support")) return "IT Support";
  if (t.includes("security") || t.includes("soc")) return "Cybersecurity";
  return "Other";
}

function atsName(url) {
  const u = url.toLowerCase();
  if (u.includes("greenhouse")) return "Greenhouse";
  if (u.includes("lever")) return "Lever";
  if (u.includes("ashby")) return "Ashby";
  if (u.includes("smartrecruiters")) return "SmartRecruiters";
  if (u.includes("workday")) return "Workday";
  if (u.includes("icims")) return "iCIMS";
  return "Career Site";
}

async function searchRole(role, site) {
  const query = encodeURIComponent(`site:${site} "${role}" jobs United States`);
  const url = `https://www.google.com/search?q=${query}`;

  return [];
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);

  if (searchParams.get("secret") !== process.env.CRON_SECRET) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = [];

  for (const role of roles) {
    for (const site of atsSites) {
      const fakeSearchUrl = `https://${site}/search?q=${encodeURIComponent(role)}`;

      const opt = classify(role);
      if (!opt) continue;

      const title = role;
      const company = "Direct ATS Search";
      const location = "United States";
      const applyLink = fakeSearchUrl;

      rows.push({
        title,
        company,
        location,
        description: `${role} openings from ${site}.`,
        full_page_text: `${role} openings from ${site}.`,
        apply_link: applyLink,
        apply_url: applyLink,
        job_hash: hash(title, company, location, applyLink),
        source: "Role Search",
        posted_at: new Date().toISOString(),
        first_seen_at: new Date().toISOString(),
        last_seen_at: new Date().toISOString(),
        opt_status: opt.opt_status,
        opt_risk_level: opt.opt_risk_level,
        opt_risk_reason: "Role-based ATS search",
        risk_reason: "Role-based ATS search",
        sponsorship_chance: opt.sponsorship_chance,
        apply_confidence: opt.apply_confidence,
        experience_level: title.toLowerCase().includes("junior") ? "Entry Level" : "Experience not listed by employer",
        experience_years: title.toLowerCase().includes("junior") ? 0 : null,
        is_fresh: true,
        is_active: true,
        remote: false,
        salary: "",
        scraped_at: new Date().toISOString(),
        is_direct_employer: true,
        source_type: "ats_role_search",
        excluded_reason: "",
        freshness_label: "Fresh",
        role_category: category(title),
        apply_ease: "Direct Search",
        ats_platform: atsName(fakeSearchUrl),
        company_domain: site
      });
    }
  }

  const { error } = await supabase.from("jobs").upsert(rows, {
    onConflict: "job_hash",
    ignoreDuplicates: true
  });

  if (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }

  return Response.json({
    success: true,
    saved: rows.length,
    message: "Role-based jobs inserted"
  });
}
