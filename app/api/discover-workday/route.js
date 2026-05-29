export const maxDuration = 60;

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function possibleWorkdayUrls(slug) {
  return [
    `https://${slug}.wd1.myworkdayjobs.com/External`,
    `https://${slug}.wd1.myworkdayjobs.com/Careers`,
    `https://${slug}.wd1.myworkdayjobs.com/en-US/External`,
    `https://${slug}.wd1.myworkdayjobs.com/en-US/Careers`,

    `https://${slug}.wd3.myworkdayjobs.com/External`,
    `https://${slug}.wd3.myworkdayjobs.com/Careers`,
    `https://${slug}.wd3.myworkdayjobs.com/en-US/External`,
    `https://${slug}.wd3.myworkdayjobs.com/en-US/Careers`,

    `https://${slug}.wd5.myworkdayjobs.com/External`,
    `https://${slug}.wd5.myworkdayjobs.com/Careers`,
    `https://${slug}.wd5.myworkdayjobs.com/en-US/External`,
    `https://${slug}.wd5.myworkdayjobs.com/en-US/Careers`
  ];
}

async function isValidWorkdayUrl(url) {
  try {
    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      cache: "no-store",
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    });

    if (!res.ok) return false;

    const html = await res.text();

    return (
      html.includes("workday") ||
      html.includes("myworkdayjobs") ||
      html.includes("__NEXT_DATA__") ||
      html.includes("wday")
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

  const { data: sources, error } = await supabase
    .from("company_sources")
    .select("*")
    .eq("ats_platform", "workday")
    .is("careers_url", null)
    .eq("active", true)
    .limit(20);

  if (error) {
    return Response.json({ success: false, error: error.message });
  }

  const debug = [];

  for (const source of sources || []) {
    const slug = source.ats_slug;
    const candidates = possibleWorkdayUrls(slug);

    let foundUrl = null;

    for (const url of candidates) {
      const valid = await isValidWorkdayUrl(url);

      if (valid) {
        foundUrl = url;
        break;
      }
    }

    if (foundUrl) {
      await supabase
        .from("company_sources")
        .update({ careers_url: foundUrl })
        .eq("id", source.id);

      debug.push({
        company: source.company_name,
        slug,
        found: foundUrl
      });
    } else {
      debug.push({
        company: source.company_name,
        slug,
        found: null
      });
    }
  }

  return Response.json({
    success: true,
    checked: sources?.length || 0,
    debug
  });
}
