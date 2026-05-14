import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(request) {
  const { searchParams } = new URL(request.url);

  const secret = searchParams.get("secret");

  if (secret !== process.env.CRON_SECRET) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { error } = await supabase
    .from("jobs")
    .delete()
    .lt(
      "created_at",
      new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
    );

  if (error) {
    return Response.json({
      success: false,
      error: error.message,
    });
  }

  return Response.json({
    success: true,
    message: "Old jobs cleaned",
  });
}