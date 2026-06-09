import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(request) {
  const { searchParams } = new URL(request.url);

  if (searchParams.get("secret") !== process.env.CRON_SECRET) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sevenDaysAgo = new Date(
    Date.now() - 7 * 24 * 60 * 60 * 1000
  ).toISOString();

  const twoDaysAgo = new Date(
    Date.now() - 2 * 24 * 60 * 60 * 1000
  ).toISOString();

  const { error: oldError } = await supabase
    .from("jobs")
    .update({ is_active: false })
    .lt("first_seen_at", sevenDaysAgo);

  const { error: unseenError } = await supabase
    .from("jobs")
    .update({ is_active: false })
    .lt("last_seen_at", twoDaysAgo);

  if (oldError || unseenError) {
    return Response.json({
      success: false,
      error: oldError?.message || unseenError?.message,
    });
  }

  return Response.json({
    success: true,
    message: "Old or unseen jobs marked inactive",
  });
}
