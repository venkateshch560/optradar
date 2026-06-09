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

  await supabase
    .from("jobs")
    .update({ is_active: false })
    .lt("first_seen_at", sevenDaysAgo);

  await supabase
    .from("jobs")
    .update({ is_active: false })
    .lt("last_seen_at", twoDaysAgo);

  await supabase
    .from("jobs")
    .delete()
    .or(
      "apply_link.is.null,apply_link.eq.,apply_link.like.%api.smartrecruiters.com%"
    );

  return Response.json({
    success: true,
    message: "Old, unseen, and broken jobs cleaned",
  });
}
