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
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

    const { data: jobs, error: jobsError } = await supabase
      .from("jobs")
      .select("*")
      .gte("created_at", oneHourAgo)
      .limit(20);

    if (jobsError) {
      throw jobsError;
    }

    if (!jobs || jobs.length === 0) {
      return Response.json({
        success: true,
        message: "No new jobs",
      });
    }

    const { data: subscribers, error: subscribersError } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("active", true)
      .eq("email_alerts", true);

    if (subscribersError) {
      throw subscribersError;
    }

    for (const user of subscribers || []) {
      const jobsHtml = jobs
        .map(
          (job) => `
            <div style="margin-bottom:20px;padding:16px;border:1px solid #ddd;border-radius:10px;">
              <h2>${job.title || "Untitled Job"}</h2>
              <p><strong>${job.company || "Unknown Company"}</strong></p>
              <p>${job.location || "Remote / Not listed"}</p>
              <p>OPT Risk: ${job.opt_risk_level || "Unknown"} | Confidence: ${
                job.apply_confidence || 50
              }%</p>
              <a href="${job.apply_link || "https://jobs.theaisolutionist.com/dashboard"}" target="_blank">
                Apply Now
              </a>
            </div>
          `
        )
        .join("");

      await resend.emails.send({
        from: process.env.ALERT_FROM_EMAIL,
        to: user.user_email,
        subject: "Fresh OPT Jobs - OPT Radar",
        html: `
          <div style="font-family:sans-serif;max-width:680px;margin:0 auto;padding:20px;">
            <h1>Fresh OPT Jobs</h1>

            <p>
              Here are the latest jobs posted in the last hour.
            </p>

            ${jobsHtml}

            <hr style="margin-top:30px;" />

            <p style="font-size:12px;color:#777;">
              You're receiving this because you're subscribed to OPT Radar.
              <br /><br />

              <a href="https://jobs.theaisolutionist.com/api/unsubscribe?email=${user.user_email}">
                Unsubscribe
              </a>
            </p>
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
