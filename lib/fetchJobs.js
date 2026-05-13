import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const searches = [
  "AI Engineer United States",
  "Junior AI Engineer United States",
  "Machine Learning Engineer United States",
  "AI Analyst United States",
  "AI Data Analyst United States",
  "Data Scientist United States",

  "Entry Level Data Analyst United States",
  "Junior Data Analyst United States",
  "Data Analyst United States",
  "Business Analyst United States",
  "Reporting Analyst United States",
  "BI Analyst United States",
  "SQL Analyst United States",
  "Operations Analyst United States",
  "Product Analyst United States",
  "Marketing Analyst United States",
  "Financial Analyst United States",
  "Healthcare Analyst United States",
  "Supply Chain Analyst United States",
  "Revenue Analyst United States",
  "Associate Analyst United States",
  "Junior Analyst United States",
  "Analyst I United States",

  "Junior Data Engineer United States",
  "Data Engineer United States",
  "ETL Developer United States",
  "SQL Developer United States",
  "Database Developer United States",
  "Database Analyst United States",

  "Software Engineer United States",
  "Junior Software Engineer United States",
  "Associate Software Engineer United States",
  "Frontend Developer United States",
  "Backend Developer United States",
  "Full Stack Developer United States",
  "QA Analyst United States",
  "QA Engineer United States",

  "Cloud Engineer United States",
  "Junior Cloud Engineer United States",
  "AWS Engineer United States",
  "Azure Engineer United States",
  "Cloud Support Engineer United States",
  "DevOps Engineer United States",

  "IT Analyst United States",
  "IT Support Analyst United States",
  "Systems Analyst United States",
  "Business Systems Analyst United States",
  "Technical Support Analyst United States",
  "Application Support Analyst United States",
  "Desktop Support Technician United States",

  "Cybersecurity Analyst United States",
  "Information Security Analyst United States",
  "SOC Analyst United States",
  "Security Analyst United States",

  "Project Coordinator United States",
  "IT Project Coordinator United States",
  "Product Coordinator United States",
  "ERP Analyst United States",
  "SAP Analyst United States",

  "Data Center Technician United States",
  "Data Center Engineer United States",

  "Google Software Engineer Careers",
  "Google Data Analyst Careers",
  "Amazon Analyst Careers",
  "Amazon Software Development Engineer Careers",
  "Microsoft Analyst Careers",
  "Meta Software Engineer Careers",
  "Apple Analyst Careers",
  "NVIDIA AI Engineer Careers",
  "Oracle Analyst Careers",
  "Salesforce Analyst Careers",
  "Adobe Analyst Careers",

  "JPMorgan Analyst Careers",
  "Goldman Sachs Analyst Careers",
  "Bank of America Analyst Careers",
  "Wells Fargo Analyst Careers",
  "Walmart Analyst Careers",
  "Target Analyst Careers",
  "Costco Analyst Careers",
  "UnitedHealth Analyst Careers",
  "CVS Health Analyst Careers",
];

const blockedSourceDomains = [
  "bebee.com",
  "lensa.com",
  "talent.com",
  "linkedin.com",
  "indeed.com",
  "ziprecruiter.com",
  "monster.com",
  "careerbuilder.com",
  "simplyhired.com",
  "jooble.org",
  "glassdoor.com",
  "dice.com",
];

const blockedWords = [
  "security clearance",
  "secret clearance",
  "top secret",
  "ts/sci",
  "public trust",
  "u.s. citizen",
  "us citizen",
  "citizen only",
  "no sponsorship",
  "unable to sponsor",
  "will not sponsor",
  "sponsorship unavailable",
];

function getDomain(url) {
  try {
    return new URL(url).hostname.replace("www.", "").toLowerCase();
  } catch {
    return "";
  }
}

function isBadSource(url) {
  const domain = getDomain(url);
  return blockedSourceDomains.some((bad) => domain.includes(bad));
}

function getAtsPlatform(url) {
  const lower = url.toLowerCase();

  if (lower.includes("greenhouse.io")) return "Greenhouse";
  if (lower.includes("lever.co")) return "Lever";
  if (lower.includes("ashbyhq.com")) return "Ashby";
  if (lower.includes("workdayjobs.com") || lower.includes("myworkdayjobs.com"))
    return "Workday";
  if (lower.includes("smartrecruiters.com")) return "SmartRecruiters";
  if (lower.includes("icims.com")) return "iCIMS";
  if (lower.includes("bamboohr.com")) return "BambooHR";
  if (lower.includes("successfactors.com")) return "SAP SuccessFactors";
  if (lower.includes("oraclecloud.com")) return "Oracle";

  return "Company Career Site";
}

function isCareerLink(url) {
  const lower = url.toLowerCase();

  return (
    lower.includes("greenhouse.io") ||
    lower.includes("lever.co") ||
    lower.includes("ashbyhq.com") ||
    lower.includes("workdayjobs.com") ||
    lower.includes("myworkdayjobs.com") ||
    lower.includes("smartrecruiters.com") ||
    lower.includes("icims.com") ||
    lower.includes("bamboohr.com") ||
    lower.includes("successfactors.com") ||
    lower.includes("oraclecloud.com") ||
    lower.includes("/careers") ||
    lower.includes("/jobs") ||
    lower.includes("/job") ||
    lower.includes("/positions") ||
    lower.includes("/openings")
  );
}

function getBestApplyLink(job) {
  const links = [];

  if (job.job_apply_link) links.push(job.job_apply_link);

  if (Array.isArray(job.apply_options)) {
    for (const option of job.apply_options) {
      if (option.apply_link) links.push(option.apply_link);
    }
  }

  const good = links.filter((link) => link && !isBadSource(link));
  const career = good.find((link) => isCareerLink(link));

  return career || good[0] || "";
}

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
    lower.includes("e-verify") ||
    lower.includes("stem opt") ||
    lower.includes("opt") ||
    lower.includes("visa sponsorship")
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

function detectExperience(text) {
  const lower = text.toLowerCase();

  if (
    lower.includes("director") ||
    lower.includes("manager") ||
    lower.includes("head of")
  ) {
    return { experience_level: "Lead / Manager", experience_years: 10 };
  }

  if (
    lower.includes("senior") ||
    lower.includes("sr.") ||
    lower.includes("principal")
  ) {
    return { experience_level: "Senior", experience_years: 6 };
  }

  if (
    lower.includes("entry level") ||
    lower.includes("entry-level") ||
    lower.includes("junior") ||
    lower.includes("new grad") ||
    lower.includes("associate")
  ) {
    return { experience_level: "Entry Level", experience_years: 0 };
  }

  const matches = [...lower.matchAll(/(\d+)\+?\s*(years|year|yrs)/g)];
  const numbers = matches
    .map((m) => parseInt(m[1]))
    .filter((n) => n >= 0 && n <= 20);

  if (numbers.length === 0) {
    return {
      experience_level: "Experience not listed by employer",
      experience_years: null,
    };
  }

  const years = Math.min(...numbers);

  if (years <= 2)
    return { experience_level: "Entry Level", experience_years: years };
  if (years <= 5)
    return { experience_level: "Mid Level", experience_years: years };
  if (years <= 9)
    return { experience_level: "Senior", experience_years: years };

  return { experience_level: "Lead / Manager", experience_years: years };
}

function detectCategory(title, description) {
  const text = `${title} ${description}`.toLowerCase();

  if (
    text.includes("data") ||
    text.includes("analytics") ||
    text.includes("sql") ||
    text.includes("power bi") ||
    text.includes("bi analyst")
  ) {
    return "Data / Analytics";
  }

  if (
    text.includes("cloud") ||
    text.includes("aws") ||
    text.includes("azure") ||
    text.includes("devops")
  ) {
    return "Cloud / DevOps";
  }

  if (
    text.includes("software") ||
    text.includes("developer") ||
    text.includes("engineer")
  ) {
    return "Software / Engineering";
  }

  if (
    text.includes("business analyst") ||
    text.includes("requirements") ||
    text.includes("product analyst")
  ) {
    return "Business / Product";
  }

  if (
    text.includes("support") ||
    text.includes("help desk") ||
    text.includes("desktop")
  ) {
    return "IT Support";
  }

  if (text.includes("project") || text.includes("coordinator")) {
    return "Project / Operations";
  }

  return "Other";
}

function sponsorshipChance(optRisk, text) {
  const lower = text.toLowerCase();

  if (optRisk.opt_risk_level === "High Risk") return "Unlikely";

  if (
    lower.includes("h-1b") ||
    lower.includes("visa sponsorship") ||
    lower.includes("stem opt") ||
    lower.includes("e-verify")
  ) {
    return "High";
  }

  if (optRisk.opt_risk_level === "Medium Risk") return "Medium";

  return "Unknown";
}

function applyConfidence(optRisk, experienceLevel, careerLink, finalApplyUrl) {
  let score = 50;

  if (careerLink) score += 20;
  if (finalApplyUrl) score += 10;

  if (optRisk.opt_risk_level === "Low Risk") score += 20;
  if (optRisk.opt_risk_level === "Medium Risk") score += 5;
  if (optRisk.opt_risk_level === "High Risk") score -= 50;

  if (experienceLevel === "Entry Level") score += 10;
  if (experienceLevel === "Mid Level") score += 5;
  if (experienceLevel === "Senior") score -= 5;
  if (experienceLevel === "Lead / Manager") score -= 15;

  return Math.max(0, Math.min(score, 100));
}

function getPostedTime(job) {
  const posted =
    job.job_posted_at_datetime_utc ||
    job.job_posted_at_timestamp ||
    job.job_posted_at_timestamp_utc;

  if (!posted) return null;

  const postedTime =
    typeof posted === "number" ? posted * 1000 : new Date(posted).getTime();

  if (!postedTime || Number.isNaN(postedTime)) return null;

  return postedTime;
}

function isPostedWithinLast24Hours(job) {
  const postedTime = getPostedTime(job);

  if (!postedTime) return false;

  return Date.now() - postedTime <= 24 * 60 * 60 * 1000;
}

function getPostedAt(job) {
  const postedTime = getPostedTime(job);

  if (!postedTime) return new Date().toISOString();

  return new Date(postedTime).toISOString();
}

export async function fetchJobs() {
  let totalSaved = 0;

  for (const query of searches) {
    const url = `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(
      query
    )}&page=1&num_pages=3`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "X-RapidAPI-Key": process.env.JSEARCH_API_KEY,
        "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
      },
    });

    if (!response.ok) {
      console.error("JSEARCH ERROR:", response.status, query);
      continue;
    }

    const data = await response.json();
    const jobs = data.data || [];
    const rows = [];

    for (const job of jobs) {
      const title = job.job_title || "";
      const company = job.employer_name || "";
      const description = job.job_description || "";
      const originalLink = getBestApplyLink(job);

      if (!title || !company || !originalLink) continue;
      if (isBadSource(originalLink)) continue;

      const postedFresh = isPostedWithinLast24Hours(job);
      const finalApplyLink = originalLink;

      if (!finalApplyLink || isBadSource(finalApplyLink)) continue;

      const combinedText = `${title} ${company} ${description}`;

      const opt = classifyOpt(combinedText);
      const exp = detectExperience(combinedText);
      const category = detectCategory(title, description);
      const ats = getAtsPlatform(finalApplyLink);
      const sponsor = sponsorshipChance(opt, combinedText);
      const careerLink = isCareerLink(finalApplyLink);

      const confidence = applyConfidence(
        opt,
        exp.experience_level,
        careerLink,
        finalApplyLink
      );

      rows.push({
        title,
        company,
        location:
          `${job.job_city || ""} ${job.job_state || ""}`.trim() ||
          job.job_country ||
          "United States",
        posted_at: getPostedAt(job),
        created_at: getPostedAt(job),
        apply_link: finalApplyLink,
        source: job.job_publisher || "JSearch",
        description,
        opt_status: opt.opt_status,
        risk_reason: opt.opt_risk_reason,
        experience_level: exp.experience_level,
        experience_years: exp.experience_years,
        is_fresh: postedFresh,
        salary: job.job_salary || "",
        remote: job.job_is_remote || false,
        full_page_text: "",
        scraped_at: new Date().toISOString(),
        is_direct_employer: careerLink,
        source_type: careerLink ? "direct_employer_career_site" : "company_or_ats_link",
        excluded_reason: "",
        sponsorship_chance: sponsor,
        apply_confidence: confidence,
        opt_risk_level: opt.opt_risk_level,
        opt_risk_reason: opt.opt_risk_reason,
        freshness_label: postedFresh ? "Fresh" : "Archive",
        role_category: category,
        apply_ease:
          ats === "Greenhouse" || ats === "Lever" || ats === "Ashby"
            ? "Easy Apply"
            : "Standard Apply",
        ats_platform: ats,
        company_domain: getDomain(finalApplyLink),
      });
    }

    const uniqueRows = Array.from(
      new Map(rows.map((row) => [row.apply_link, row])).values()
    );

    if (uniqueRows.length > 0) {
      const { error } = await supabase
        .from("jobs")
        .upsert(uniqueRows, { onConflict: "apply_link" });

      if (error) {
        console.error("SUPABASE ERROR:", error);
      } else {
        totalSaved += uniqueRows.length;
      }
    }
  }

  return totalSaved;
}
