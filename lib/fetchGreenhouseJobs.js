import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function createJobHash(title, company, location, applyLink) {
  return crypto
    .createHash("sha256")
    .update(`${title}|${company}|${location}|${applyLink}`.toLowerCase().trim())
    .digest("hex");
}

export async function fetchGreenhouseJobs() {
  const title = "Test Data Analyst";
  const company = "OPT RADAR TEST";
  const location = "United States";
  const applyLink = "https://jobs.theaisolutionist.com/test-job";

  const row = {
    title,
    company,
    location,
    posted_at: new Date().toISOString(),
    first_seen_at: new Date().toISOString(),
    last_seen_at: new Date().toISOString(),
    job_hash: createJobHash(title, company, location, applyLink),
    apply_link: applyLink,
    source: "Test",
    description: "Test job to verify Supabase insert.",
    opt_status: "Possible OPT",
    risk_reason: "Test insert",
    experience_level: "Entry Level",
    experience_years: 0,
    is_fresh: true,
    is_active: true,
    salary: "",
    remote: true,
    full_page_text: "Test job to verify Supabase insert.",
    scraped_at: new Date().toISOString(),
    is_direct_employer: true,
    source_type: "direct_employer_career_site",
    excluded_reason: "",
    sponsorship_chance: "Medium",
    apply_confidence: 100,
    opt_risk_level: "Medium Risk",
    opt_risk_reason: "Test insert",
    freshness_label: "Fresh",
    role_category: "Data / Analytics",
    apply_ease: "Direct Apply",
    ats_platform: "Test",
    company_domain: "theaisolutionist.com",
  };

  const { error } = await supabase.from("jobs").upsert([row], {
    onConflict: "job_hash",
    ignoreDuplicates: true,
  });

  if (error) {
    return {
      totalSaved: 0,
      error: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    };
  }

  return {
    totalSaved: 1,
    message: "Test job inserted successfully",
  };
}
