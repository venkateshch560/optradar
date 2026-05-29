export const maxDuration = 60;

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function generateUrls(slug) {
  return [
    `https://${slug}.wd1.myworkdayjobs.com/External`,
    `https://${slug}.wd1.myworkdayjobs.com/Careers`,
    `https://${slug}.wd1.myworkdayjobs.com/en-US/External`,
    `https://${slug}.wd5.myworkdayjobs.com/External`,
    `https://${slug}.wd5.myworkdayjobs.com/Careers`,
    `https://${slug}.wd5.myworkdayjobs.com/en-US/External`
  ];
}

async function validate(url) {
  try {
    const res = await fetch(url, {
      cache: "no-store",
      redirect: "follow",
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    });

    if (!res.ok) return false;

    const html = await res.text();

    return (
      html.includes("workday") ||
      html.includes("myworkdayjobs")
    );
  } catch {
    return false;
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);

  if (searchParams.get("secret") !== process.env.CRON_SECRET) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: companies } = await supabase
    .from("company_sources")
    .select("*")
    .eq("ats_platform", "workday")
    .is("careers_url", null)
    .limit(20);

  const results = [];

  for (const company of companies || []) {
    let found = null;

    for (const url of generateUrls(company.ats_slug)) {
      const ok = await validate(url);

      if (ok) {
        found = url;
        break;
      }
    }

    if (found) {
      await supabase
        .from("company_sources")
        .update({ careers_url: found })
        .eq("id", company.id);
    }

    results.push({
      company: company.company_name,
      found
    });
  }

  return Response.json({
    success: true,
    checked: results.length,
    results
  });
}
