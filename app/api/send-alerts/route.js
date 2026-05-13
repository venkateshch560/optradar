import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

const resend = new Resend(process.env.RESEND_API_KEY);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(req) {
  try {
    const authHeader = req.headers.get("authorization");

    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const oneHourAgo = new Date(
      Date.now() - 60 * 60 * 1000
    ).toISOString();

    const { data: jobs } = await supabase
      .from("jobs")
      .select("*")
      .gte("created_at", oneHourAgo)
      .limit(20);

    if (!jobs || jobs.length === 0) {
      return Response.json({
        success: true,
        message: "No new jobs",
      });
    }

    const { data: subscribers } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("active", true)
      .eq("email_alerts", true);

    for (const user of subscribers || []) {
      const jobsHtml = jobs
        .map(
          (job) => `
            <div style="margin-bottom:20px;padding:16px;border:1px solid #ddd;border-radius:10px;">
              <h2>${job.title}</h2>
              <p><strong>${job.company}</strong></p>
              <p>${job.location || "Remote"}</p>
              <a href="${job.apply_link}" target="_blank">
                Apply Now
              </a>
            </div>
          `
        )
        .join("");

      await resend.emails.send({
        from: process.env.ALERT_FROM_EMAIL,
        to: user.user_email,
        subject: "🚀 Fresh OPT Jobs - OPT Radar",
        html: `
          <div style="font-family:sans-serif;">
            <h1>Fresh OPT Jobs</h1>
            <p>Here are the latest jobs posted in the last hour.</p>
            ${jobsHtml}
          </div>
        `,
      });
    }

    return Response.json({
      success: true,
      emails_sent: subscribers?.length || 0,
    });
  } catch (err) {
    return Response.json(
      {
        success: false,
        error: err.message,
      },
      { status: 500 }
    );
  }
}
