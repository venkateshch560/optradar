export const maxDuration = 60;

import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const companies = ["airbnb", "stripe", "datadog", "cloudflare", "reddit", "ramp"];

function createJobHash(title, company, location, applyLink) {
  return crypto
    .createHash("sha256")
    .update(`${title}|${company}|${location}|${applyLink}`.toLowerCase().trim())
    .digest("hex");
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");

  if (secret !== process.env.CRON_SECRET) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let totalSaved = 0;
  const debug = [];

  for (const company of companies) {
    try {
      const response = await fetch(
        `https://boards-api.greenhouse.io/v1/boards/${company}/jobs?content=true`,
        { cache: "no-store" }
      );

      if (!response.ok) {
        debug.push({ company, error: response.status });
        continue;
      }

      const data = await response.json();
      const jobs = data.jobs || [];

      const rows = jobs
        .filter((job) => job.title && job.absolute_url)
        .map((job) => {
          const title = job.title;
          const location = job.location?.name || "United States";
          const applyLink = job.absolute_url;
          const description = job.content || "";
          const jobHash = createJobHash(title, company, location, applyLink);

          return {
            title,
            company: company.toUpperCase(),
            location,
            description,
            posted_at: job.updated_at || new Date().toISOString(),
            first_seen_at: new Date().toISOString(),
            last_seen_at: new Date().toISOString(),
            job_hash: jobHash,
            apply_link: applyLink,
            apply_url: applyLink,
            source: "Greenhouse",
            opt_status: "Possible OPT",
            risk_reason: "No blocking language found",
            experience_level: "Experience not listed by employer",
            experience_years: null,
            is_fresh: true,
            is_active: true,
            salary: "",
            remote:
              title.toLowerCase().includes("remote") ||
              location.toLowerCase().includes("remote"),
            full_page_text: description,
            scraped_at: new Date().toISOString(),
            is_direct_employer: true,
            source_type: "direct_employer_career_site",
            excluded_reason: "",
            sponsorship_chance: "Medium",
            apply_confidence: 80,
            opt_risk_level: "Medium Risk",
            opt_risk_reason: "No clear OPT/sponsorship language",
            freshness_label: "Fresh",
            role_category: "Other",
            apply_ease: "Direct Apply",
            ats_platform: "Greenhouse",
            company_domain: `${company}.com`,
          };
        });

      if (rows.length > 0) {
        const { error } = await supabase.from("jobs").upsert(rows, {
          onConflict: "job_hash",
          ignoreDuplicates: true,
        });

        if (error) {
          debug.push({ company, found: jobs.length, saved: 0, error: error.message });
        } else {
          totalSaved += rows.length;
          debug.push({ company, found: jobs.length, saved: rows.length });
        }
      } else {
        debug.push({ company, found: jobs.length, saved: 0 });
      }
    } catch (err) {
      debug.push({ company, error: err.message });
    }
  }

  return Response.json({
    success: true,
    totalSaved,
    debug,
  });
}
