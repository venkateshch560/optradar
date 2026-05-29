import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const searches = [
  // Data / Analytics
  "Entry Level Data Analyst United States",
  "Junior Data Analyst United States",
  "Data Analyst United States",
  "Business Analyst United States",
  "BI Analyst United States",
  "Power BI Developer United States",
  "Reporting Analyst United States",
  "SQL Analyst United States",
  "Operations Analyst United States",
  "Product Analyst United States",
  "Marketing Analyst United States",
  "Financial Analyst United States",
  "Healthcare Data Analyst United States",
  "Supply Chain Analyst United States",
  "Revenue Analyst United States",
  "People Analytics Analyst United States",
  "HRIS Analyst United States",
  "Payroll Analyst United States",

  // Software
  "Entry Level Software Engineer United States",
  "Junior Software Engineer United States",
  "Associate Software Engineer United States",
  "Software Engineer United States",
  "Frontend Developer United States",
  "Backend Developer United States",
  "Full Stack Developer United States",
  "React Developer United States",
  "Node.js Developer United States",
  "Python Developer United States",
  "Java Developer United States",
  "API Developer United States",

  // Data Engineering / AI
  "Junior Data Engineer United States",
  "Data Engineer United States",
  "ETL Developer United States",
  "Database Developer United States",
  "Machine Learning Engineer United States",
  "AI Engineer United States",
  "AI Analyst United States",
  "Data Scientist United States",

  // Cloud / DevOps / IT
  "Cloud Engineer United States",
  "Junior Cloud Engineer United States",
  "AWS Engineer United States",
  "Azure Engineer United States",
  "DevOps Engineer United States",
  "Cloud Support Engineer United States",
  "Systems Analyst United States",
  "IT Analyst United States",
  "Application Support Analyst United States",
  "Technical Support Analyst United States",
  "Desktop Support Technician United States",

  // QA / Security / ERP
  "QA Analyst United States",
  "QA Engineer United States",
  "Software QA Engineer United States",
  "Automation QA Engineer United States",
  "Cybersecurity Analyst United States",
  "SOC Analyst United States",
  "Information Security Analyst United States",
  "ERP Analyst United States",
  "SAP Analyst United States",
  "SAP Integration Analyst United States",

  // Coordinator / Ops
  "Project Coordinator United States",
  "IT Project Coordinator United States",
  "Product Coordinator United States",
  "Operations Coordinator United States",
  "Business Operations Analyst United States"
];

const blockedSourceDomains = [
  "bebee.com",
  "lensa.com",
  "talent.com",
  "ziprecruiter.com",
  "monster.com",
  "careerbuilder.com",
  "simplyhired.com",
  "jooble.org",
  "glassdoor.com",
  "dice.com"
];

const hardBlockedWords = [
  "security clearance",
  "secret clearance",
  "top secret",
  "ts/sci",
  "public trust",
  "u.s. citizen only",
  "us citizen only",
  "citizen only",
  "green card only",
  "permanent resident only",
  "us persons only"
];

function createJobHash(title, company, location, applyLink) {
  return crypto
    .createHash("sha256")
    .update(`${title}|${company}|${location}|${applyLink}`.toLowerCase().trim())
    .digest("hex");
}

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

function getBestApplyLink(job) {
  const links = [];

  if (job.job_apply_link) links.push(job.job_apply_link);

  if (Array.isArray(job.apply_options)) {
    for (const option of job.apply_options) {
      if (option.apply_link) links.push(option.apply_link);
    }
  }

  const good = links.filter((link) => link && !isBadSource(link));

  const direct = good.find((link) =>
    link.includes("greenhouse.io") ||
    link.includes("lever.co") ||
    link.includes("ashbyhq.com") ||
    link.includes("workdayjobs.com") ||
    link.includes("myworkdayjobs.com") ||
    link.includes("smartrecruiters.com") ||
    link.includes("icims.com") ||
    link.includes("oraclecloud.com") ||
    link.includes("successfactors.com") ||
    link.includes("/careers") ||
    link.includes("/jobs") ||
    link.includes("/job")
  );

  return direct || good[0] || "";
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
    lower.includes("oraclecloud.com") ||
    lower.includes("successfactors.com") ||
    lower.includes("/careers") ||
    lower.includes("/jobs") ||
    lower.includes("/job")
  );
}

function getAtsPlatform(url) {
  const lower = url.toLowerCase();

  if (lower.includes("greenhouse.io")) return "Greenhouse";
  if (lower.includes("lever.co")) return "Lever";
  if (lower.includes("ashbyhq.com")) return "Ashby";
  if (lower.includes("workdayjobs.com") || lower.includes("myworkdayjobs.com")) return "Workday";
  if (lower.includes("smartrecruiters.com")) return "SmartRecruiters";
  if (lower.includes("icims.com")) return "iCIMS";
  if (lower.includes("oraclecloud.com")) return "Oracle";
  if (lower.includes("successfactors.com")) return "SAP SuccessFactors";

  return "Company Career Site";
}

function classifyOpt(text) {
  const lower = text.toLowerCase();

  const blocked = hardBlockedWords.find((word) => lower.includes(word));

  if (blocked) {
    return {
      skip: true,
      opt_status: "Not Eligible",
      opt_risk_level: "High Risk",
      opt_risk_reason: blocked,
      sponsorship_chance: "Low",
      apply_confidence: 0,
      excluded_reason: blocked
    };
  }

  if (
    lower.includes("stem opt") ||
    lower.includes("opt") ||
    lower.includes("f-1") ||
    lower.includes("cpt") ||
    lower.includes("ead") ||
    lower.includes("h-1b") ||
    lower.includes("visa sponsorship") ||
    lower.includes("sponsorship available") ||
    lower.includes("open to sponsorship") ||
    lower.includes("e-verify")
  ) {
    return {
      skip: false,
      opt_status: "OPT Friendly",
      opt_risk_level: "Low Risk",
      opt_risk_reason: "",
      sponsorship_chance: "High",
      apply_confidence: 90,
      excluded_reason: ""
    };
  }

  if (
    lower.includes("no sponsorship") ||
    lower.includes("without sponsorship") ||
    lower.includes("must be authorized to work")
  ) {
    return {
      skip: false,
      opt_status: "Apply Carefully",
      opt_risk_level: "Medium Risk",
      opt_risk_reason: "Sponsorship unclear",
      sponsorship_chance: "Medium",
      apply_confidence: 70,
      excluded_reason: ""
    };
  }

  return {
    skip: false,
    opt_status: "Possible OPT",
    opt_risk_level: "Medium Risk",
    opt_risk_reason: "No clear OPT/sponsorship language",
    sponsorship_chance: "Medium",
    apply_confidence: 80,
    excluded_reason: ""
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
    lower.includes("associate") ||
    lower.includes("analyst i")
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

  if (years <= 2) return { experience_level: "Entry Level", experience_years: years };
  if (years <= 5) return { experience_level: "Mid Level", experience_years: years };
  if (years <= 9) return { experience_level: "Senior", experience_years: years };

  return { experience_level: "Lead / Manager", experience_years: years };
}

function detectCategory(title, description) {
  const text = `${title} ${description}`.toLowerCase();

  if (text.includes("data") || text.includes("analytics") || text.includes("sql") || text.includes("power bi")) return "Data / Analytics";
  if (text.includes("cloud") || text.includes("aws") || text.includes("azure") || text.includes("devops")) return "Cloud / DevOps";
  if (text.includes("software") || text.includes("developer") || text.includes("engineer")) return "Software / Engineering";
  if (text.includes("business analyst") || text.includes("requirements") || text.includes("product analyst")) return "Business / Product";
  if (text.includes("support") || text.includes("help desk") || text.includes("desktop")) return "IT Support";
  if (text.includes("project") || text.includes("coordinator")) return "Project / Operations";
  if (text.includes("security") || text.includes("soc analyst")) return "Cybersecurity";

  return "Other";
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

function isPostedWithinLast7Days(job) {
  const postedTime = getPostedTime(job);
  if (!postedTime) return true;
  return Date.now() - postedTime <= 7 * 24 * 60 * 60 * 1000;
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
  const debug = [];

  for (const query of searches) {
    try {
      const url = `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(
        query
      )}&page=1&num_pages=1&date_posted=week`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "X-RapidAPI-Key": process.env.JSEARCH_API_KEY,
          "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
        },
      });

      if (!response.ok) {
        debug.push({ query, saved: 0, error: `JSearch status ${response.status}` });
        continue;
      }

      const data = await response.json();
      const jobs = data.data || [];
      const rows = [];

      for (const job of jobs) {
        const title = job.job_title || "";
        const company = job.employer_name || "";
        const description = job.job_description || "";
        const applyLink = getBestApplyLink(job);

        if (!title || !company || !applyLink) continue;
        if (isBadSource(applyLink)) continue;
        if (!isPostedWithinLast7Days(job)) continue;

        const location =
          `${job.job_city || ""} ${job.job_state || ""}`.trim() ||
          job.job_country ||
          "United States";

        const combinedText = `${title} ${company} ${description} ${location}`;

        const opt = classifyOpt(combinedText);
        if (opt.skip) continue;

        const exp = detectExperience(combinedText);
        const category = detectCategory(title, description);
        const ats = getAtsPlatform(applyLink);
        const careerLink = isCareerLink(applyLink);
        const fresh = isPostedWithinLast24Hours(job);
        const postedAt = getPostedAt(job);
        const jobHash = createJobHash(title, company, location, applyLink);

        rows.push({
          title,
          company,
          location,
          posted_at: postedAt,
          first_seen_at: new Date().toISOString(),
          last_seen_at: new Date().toISOString(),
          job_hash: jobHash,
          apply_link: applyLink,
          apply_url: applyLink,
          source: job.job_publisher || "JSearch",
          description,
          opt_status: opt.opt_status,
          risk_reason: opt.opt_risk_reason,
          experience_level: exp.experience_level,
          experience_years: exp.experience_years,
          is_fresh: fresh,
          is_active: true,
          salary: job.job_salary || "",
          remote: job.job_is_remote || false,
          full_page_text: description,
          scraped_at: new Date().toISOString(),
          is_direct_employer: careerLink,
          source_type: careerLink ? "direct_employer_career_site" : "company_or_ats_link",
          excluded_reason: opt.excluded_reason,
          sponsorship_chance: opt.sponsorship_chance,
          apply_confidence: opt.apply_confidence,
          opt_risk_level: opt.opt_risk_level,
          opt_risk_reason: opt.opt_risk_reason,
          freshness_label: fresh ? "Fresh" : "Recent",
          role_category: category,
          apply_ease:
            ats === "Greenhouse" || ats === "Lever" || ats === "Ashby"
              ? "Easy Apply"
              : "Standard Apply",
          ats_platform: ats,
          company_domain: getDomain(applyLink),
        });
      }

      const uniqueRows = Array.from(
        new Map(rows.map((row) => [row.job_hash, row])).values()
      );

      if (uniqueRows.length > 0) {
        const { error } = await supabase.from("jobs").upsert(uniqueRows, {
          onConflict: "job_hash",
          ignoreDuplicates: true,
        });

        if (error) {
          debug.push({ query, found: jobs.length, prepared: uniqueRows.length, saved: 0, error: error.message });
        } else {
          totalSaved += uniqueRows.length;
          debug.push({ query, found: jobs.length, prepared: uniqueRows.length, saved: uniqueRows.length });
        }
      } else {
        debug.push({ query, found: jobs.length, prepared: 0, saved: 0 });
      }
    } catch (err) {
      debug.push({ query, saved: 0, error: err.message });
    }
  }

  return {
    totalSaved,
    debug,
  };
}
