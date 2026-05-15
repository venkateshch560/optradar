import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const companies = [
  "netflix",
  "ramp",
  "benchling",
  "zapier",
  "coursera",
  "loom",
  "calendly",
  "reddit",
  "scaleai",
];

const blockedWords = [
  "security clearance",
  "top secret",
  "u.s. citizen",
  "us citizen",
  "citizen only",
  "no sponsorship",
  "unable to sponsor",
  "will not sponsor",
];

function classifyOpt(text) {
  const lower = text.toLowerCase();

  for (const word of blockedWords) {
    if (lower.includes(word)) {
      return {
        opt_status: "Avoid",
        opt_risk_level: "High Risk",
        opt_risk_reason: word,
      };
    }
  }

  if (
    lower.includes("visa") ||
    lower.includes("sponsorship") ||
    lower.includes("opt") ||
    lower.includes("stem")
  ) {
    return {
      opt_status: "Likely OPT Friendly",
      opt_risk_level: "Low Risk",
      opt_risk_reason: "",
    };
  }

  return {
    opt_status: "Review Needed",
    opt_risk_level: "Medium Risk",
    opt_risk_reason: "No clear OPT/sponsorship language",
  };
}

function getCategory(title) {
  const lower = title.toLowerCase();

  if (lower.includes("data") || lower.includes("analyst") || lower.includes("analytics")) {
    return "Data / Analytics";
  }

  if (lower.includes("software") || lower.includes("engineer") || lower.includes("developer")) {
    return "Software / Engineering";
  }

  if (lower.includes("cloud") || lower.includes("devops")) {
    return "Cloud / DevOps";
  }

  if (lower.includes("support") || lower.includes("help desk")) {
    return "IT Support";
  }

  return "Other";
}

function detectExperience(title) {
  const lower = title.toLowerCase();

  if (lower.includes("senior") || lower.includes("sr.") || lower.includes("principal")) {
    return { level: "Senior", years: 6 };
  }

  if (lower.includes("manager") || lower.includes("director") || lower.includes("lead")) {
    return { level: "Lead / Manager", years: 8 };
  }

  if (lower.includes("junior") || lower.includes("associate") || lower.includes("entry")) {
    return { level: "Entry Level", years: 0 };
  }

  return { level: "Experience not listed by employer", years: null };
}

function isFresh(date) {
  if (!date) return false;
  const posted = new Date(date).getTime();
  if (!posted || Number.isNaN(posted)) return false;
  return Date.now() - posted <= 24 * 60 * 60 * 1000;
}

export async function fetchLeverJobs() {
  let totalSaved = 0;

  for (const company of companies) {
    try {
      const response = await fetch(
        `https://api.lever.co/v0/postings/${company}?mode=json`,
        { cache: "no-store" }
      );

      if (!response.ok) continue;

      const jobs = await response.json();
      const rows = [];

      for (const job of jobs || []) {
        const title = job.text || "";
        const description = job.descriptionPlain || job.description || "";
        const applyLink = job.hostedUrl || "";
        const postedAt = job.createdAt
          ? new Date(job.createdAt).toISOString()
          : new Date().toISOString();

        if (!title || !applyLink) continue;

        const opt = classifyOpt(`${title} ${description}`);
        const exp = detectExperience(title);
        const fresh = isFresh(postedAt);

        rows.push({
          title,
          company: company.toUpperCase(),
          location: job.categories?.location || "United States",
          posted_at: postedAt,
          apply_link: applyLink,
          source: "Lever",
          description,
          opt_status: opt.opt_status,
          risk_reason: opt.opt_risk_reason,
          experience_level: exp.level,
          experience_years: exp.years,
          is_fresh: fresh,
          salary: "",
          remote:
            title.toLowerCase().includes("remote") ||
            (job.categories?.location || "").toLowerCase().includes("remote"),
          full_page_text: "",
          scraped_at: new Date().toISOString(),
          is_direct_employer: true,
          source_type: "direct_employer_career_site",
          excluded_reason: "",
          sponsorship_chance: opt.opt_risk_level === "Low Risk" ? "High" : "Medium",
          apply_confidence: opt.opt_risk_level === "High Risk" ? 40 : 88,
          opt_risk_level: opt.opt_risk_level,
          opt_risk_reason: opt.opt_risk_reason,
          freshness_label: fresh ? "Fresh" : "Archive",
          role_category: getCategory(title),
          apply_ease: "Easy Apply",
          ats_platform: "Lever",
          company_domain: `${company}.com`,
        });
      }

      const uniqueRows = Array.from(
        new Map(rows.map((row) => [row.apply_link, row])).values()
      );

      if (uniqueRows.length > 0) {
        const { error } = await supabase
          .from("jobs")
.upsert(rows, {
  onConflict: "apply_link",
  ignoreDuplicates: true,
});
        if (!error) totalSaved += uniqueRows.length;
      }
    } catch (err) {
      console.log("LEVER ERROR:", company, err.message);
    }
  }

  return totalSaved;
}
