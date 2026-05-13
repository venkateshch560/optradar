import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    const email =
      session.customer_email ||
      session.customer_details?.email;

    if (!email) {
      return Response.json({
        received: true,
        warning: "No customer email found",
      });
    }

    const { error } = await supabase.from("subscriptions").upsert(
      {
        user_email: email,
        active: true,
        status: "active",
        stripe_customer_id: session.customer,
        stripe_subscription_id: session.subscription,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_email" }
    );

    if (error) {
      return Response.json(
        {
          received: false,
          error: error.message,
        },
        { status: 500 }
      );
    }
  }

  return Response.json({ received: true });
}
