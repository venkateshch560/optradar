import { createClient }
from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {

  try {

    const body = await req.json();

    const { email } = body;

    console.log("CHECKING EMAIL:", email);

    const { data, error } =
      await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_email", email)
        .single();

    console.log("SUB DATA:", data);
    console.log("SUB ERROR:", error);

    if (error || !data) {

      return Response.json({
        active: false
      });
    }

    return Response.json({
      active: data.active
    });

  } catch (err) {

    console.log(err);

    return Response.json({
      active: false
    });
  }
}