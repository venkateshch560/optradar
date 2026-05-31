import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return Response.json({ active: false, error: "Missing email" });
    }

    const { data, error } = await supabase
      .from("user_subscriptions")
      .select("*")
      .eq("email", email.toLowerCase())
      .maybeSingle();

    if (error) {
      return Response.json({
        active: false,
        error: error.message,
      });
    }

    if (!data) {
      return Response.json({
        active: false,
        reason: "No subscription row found",
      });
    }

    const active =
      data.paid === true ||
      data.status === "active" ||
      data.status === "trialing";

    return Response.json({
      active,
      subscription: data,
    });
  } catch (error) {
    return Response.json({
      active: false,
      error: error.message,
    });
  }
}
