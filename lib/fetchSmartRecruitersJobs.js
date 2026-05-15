import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const companies = [
  "Visa",
  "Bosch",
  "NielsenIQ",
  "PublicisGroupe",
  "Square",
  "Snowflake"
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

export async function fetchSmartRecruitersJobs() {
  let totalSaved = 0;

  for (const company of companies) {
    try {
      const res = await fetch(
        `https://api.smartrecruiters.com/v1/companies/${company}/postings?limit=100`,
        { cache: "no-store" }
      );

      if (!res.ok) continue;

      const data = await res.json();
      const jobs = data.content || [];
      const rows = [];

      for (const job of jobs) {
        const title = job.name || "";
        const applyLink = job.ref || "";
        const postedAt = job.releasedDate || new Date().toISOString();

        if (!title || !applyLink) continue;

        const fresh = isFresh(postedAt);

        rows.push({
          title,
          company,
          location: job.location?.city || job.location?.country || "United States",
          posted_at: postedAt,
          apply_link: applyLink,
          source: "SmartRecruiters",
          description: "",
          opt_status: "Review Needed",
          risk_reason: "No clear OPT/sponsorship language",
          experience_level: "Experience not listed by employer",
          experience_years: null,
          is_fresh: fresh,
          salary: "",
          remote: title.toLowerCase().includes("remote"),
          full_page_text: "",
          scraped_at: new Date().toISOString(),
          is_direct_employer: true,
          source_type: "direct_employer_career_site",
          excluded_reason: "",
          sponsorship_chance: "Medium",
          apply_confidence: 85,
          opt_risk_level: "Medium Risk",
          opt_risk_reason: "No clear OPT/sponsorship language",
          freshness_label: fresh ? "Fresh" : "Archive",
          role_category: category(title),
          apply_ease: "Standard Apply",
          ats_platform: "SmartRecruiters",
          company_domain: `${company.toLowerCase()}.com`,
        });
      }

      if (rows.length > 0) {
        const { error } = await supabase
          .from("jobs")
.upsert(rows, {
  onConflict: "apply_link",
  ignoreDuplicates: true,
});
        if (!error) totalSaved += rows.length;
      }
    } catch (err) {
      console.log("SMARTRECRUITERS ERROR:", company, err.message);
    }
  }

  return totalSaved;
}
