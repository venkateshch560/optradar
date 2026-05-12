import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

const resend = new Resend(process.env.RESEND_API_KEY);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(req) {
  const auth = req.headers.get("authorization");

  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { data: jobs, error: jobsError } = await supabase
    .from("jobs")
    .select("*")
    .gte("posted_at", since)
    .order("posted_at", { ascending: false })
    .limit(10);

  if (jobsError) {
    return Response.json({ success: false, error: jobsError.message }, { status: 500 });
  }

  const { data: users, error: usersError } = await supabase
    .from("subscriptions")
    .select("user_email, active")
    .eq("active", true);

  if (usersError) {
    return Response.json({ success: false, error: usersError.message }, { status: 500 });
  }

  if (!jobs || jobs.length === 0) {
    return Response.json({
      success: true,
      message: "No fresh jobs to send",
    });
  }

  let sent = 0;

  for (const user of users || []) {
    const jobHtml = jobs
      .map(
        (job) => `
          <div style="border:1px solid #e5e7eb;border-radius:12px;padding:16px;margin-bottom:12px;">
            <h3 style="margin:0 0 6px 0;">${job.title || "Untitled Job"}</h3>
            <p style="margin:0 0 8px 0;color:#4b5563;">${job.company || ""} • ${job.location || ""}</p>
            <p style="margin:0 0 8px 0;color:#4b5563;">
              OPT Risk: ${job.opt_risk_level || "Unknown"} • Confidence: ${job.apply_confidence || 50}%
            </p>
            <a href="${job.apply_link}" style="display:inline-block;background:#111827;color:white;padding:10px 14px;border-radius:8px;text-decoration:none;">
              Apply Direct
            </a>
          </div>
        `
      )
      .join("");

    await resend.emails.send({
      from: process.env.ALERT_FROM_EMAIL,
      to: user.user_email,
      subject: `${jobs.length} fresh OPT/STEM OPT jobs found today`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:680px;margin:0 auto;padding:24px;">
          <h1>Fresh OPT Jobs Today</h1>
          <p style="color:#4b5563;">
            Here are fresh direct job openings found in the last 24 hours.
          </p>
          ${jobHtml}
          <p style="font-size:12px;color:#6b7280;margin-top:24px;">
            OPT Radar helps organize public job openings. We do not guarantee interviews, sponsorship, or employment.
          </p>
        </div>
      `,
    });

    sent++;
  }

  return Response.json({
    success: true,
    sent,
    jobs: jobs.length,
  });
}