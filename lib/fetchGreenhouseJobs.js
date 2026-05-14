import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const companies = [
  "openai",
  "stripe",
  "airbnb",
  "notion",
  "duolingo",
  "discord",
  "coinbase",
  "scaleai",
  "figma",
  "datadog",
  "cloudflare",
  "reddit",
  "brex",
  "robinhood",
  "plaid",
  "huggingface",
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

  if (lower.includes("security") || lower.includes("cyber")) {
    return "Cybersecurity";
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

export async function fetchGreenhouseJobs() {
  let totalSaved = 0;

  for (const company of companies) {
    try {
      const response = await fetch(
        `https://boards-api.greenhouse.io/v1/boards/${company}/jobs`,
        { cache: "no-store" }
      );

      if (!response.ok) continue;

      const data = await response.json();
      const jobs = data.jobs || [];

      const rows = [];

      for (const job of jobs) {
        const title = job.title || "";
        const description = job.content || "";
        const applyLink = job.absolute_url || "";
        const postedAt = job.updated_at || new Date().toISOString();

        if (!title || !applyLink) continue;

        const opt = classifyOpt(`${title} ${description}`);
        const exp = detectExperience(title);
        const fresh = isFresh(postedAt);
        const relevantKeywords = [
  "analyst",
  "engineer",
  "developer",
  "cloud",
  "data",
  "software",
  "ai",
  "machine learning",
  "devops",
  "security",
  "support",
  "systems",
  "product",
  "business",
  "operations"
];

const lowerTitle = title.toLowerCase();

const relevant = relevantKeywords.some((word) =>
  lowerTitle.includes(word)
);

if (!relevant) continue;

        rows.push({
          title,
          company: company.toUpperCase(),
          location: job.location?.name || "United States",
          posted_at: postedAt,
          created_at: postedAt,
          apply_link: applyLink,
          source: "Greenhouse",
          description,
          opt_status: opt.opt_status,
          risk_reason: opt.opt_risk_reason,
          experience_level: exp.level,
          experience_years: exp.years,
          is_fresh: fresh,
          salary: "",
          remote:
            title.toLowerCase().includes("remote") ||
            (job.location?.name || "").toLowerCase().includes("remote"),
          full_page_text: "",
          scraped_at: new Date().toISOString(),
          is_direct_employer: true,
          source_type: "direct_employer_career_site",
          excluded_reason: "",
          sponsorship_chance: opt.opt_risk_level === "Low Risk" ? "High" : "Medium",
          apply_confidence: opt.opt_risk_level === "High Risk" ? 40 : 90,
          opt_risk_level: opt.opt_risk_level,
          opt_risk_reason: opt.opt_risk_reason,
          freshness_label: fresh ? "Fresh" : "Archive",
          role_category: getCategory(title),
          apply_ease: "Easy Apply",
          ats_platform: "Greenhouse",
          company_domain: `${company}.com`,
        });
      }

      const uniqueRows = Array.from(
        new Map(rows.map((row) => [row.apply_link, row])).values()
      );

      if (uniqueRows.length > 0) {
        const { error } = await supabase
          .from("jobs")
          .upsert(uniqueRows, { onConflict: "apply_link" });

        if (!error) totalSaved += uniqueRows.length;
      }
    } catch (err) {
      console.log("GREENHOUSE ERROR:", company, err.message);
    }
  }

  return totalSaved;
}
