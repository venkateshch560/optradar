import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    const body = await req.json();
    const { user_email, job_id } = body;

    const { error } = await supabase
      .from("applied_jobs")
      .upsert(
        { user_email, job_id, status: "Applied" },
        { onConflict: "user_email,job_id" }
      );

    if (error) throw error;

    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ success: false, error: err.message });
  }
}