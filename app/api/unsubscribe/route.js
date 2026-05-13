import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(req) {
  const { searchParams } = new URL(req.url);

  const email = searchParams.get("email");

  if (!email) {
    return new Response("Missing email", {
      status: 400,
    });
  }

  await supabase
    .from("subscriptions")
    .update({
      email_alerts: false,
    })
    .eq("user_email", email);

  return new Response(
    "You have been unsubscribed from OPT Radar emails."
  );
}