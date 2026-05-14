import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    const body = await req.json();

    const { id, email, first_name, last_name, phone } = body;

    if (!id || !email) {
      return Response.json(
        {
          success: false,
          error: "User ID and email are required",
        },
        { status: 400 }
      );
    }

    const { error } = await supabase.from("profiles").upsert({
      id,
      email,
      first_name,
      last_name,
      full_name: `${first_name || ""} ${last_name || ""}`.trim(),
      phone,
    });

    if (error) {
      return Response.json(
        {
          success: false,
          error: error.message,
        },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
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
