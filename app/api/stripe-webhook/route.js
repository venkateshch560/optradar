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
    return new Response(`Webhook Error: ${err.message}`, {
      status: 400,
    });
  }

  const data = event.data.object;

  if (event.type === "checkout.session.completed") {
    const email =
      data.customer_email || data.customer_details?.email;

    if (email) {
      await supabase.from("subscriptions").upsert(
        {
          user_email: email,
          stripe_customer_id: data.customer,
          stripe_subscription_id: data.subscription,
          status: "active",
          active: true,
          email_alerts: true,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_email",
        }
      );
    }
  }

  if (event.type === "customer.subscription.updated") {
    const subscription = data;

    const isActive =
      subscription.status === "active" ||
      subscription.status === "trialing";

    await supabase
      .from("subscriptions")
      .update({
        status: subscription.status,
        active: isActive,
        updated_at: new Date().toISOString(),
      })
      .eq("stripe_subscription_id", subscription.id);
  }

  if (event.type === "customer.subscription.deleted") {
    const subscription = data;

    await supabase
      .from("subscriptions")
      .update({
        status: "canceled",
        active: false,
        updated_at: new Date().toISOString(),
      })
      .eq("stripe_subscription_id", subscription.id);
  }

  if (event.type === "invoice.payment_failed") {
    const invoice = data;

    await supabase
      .from("subscriptions")
      .update({
        status: "payment_failed",
        active: false,
        updated_at: new Date().toISOString(),
      })
      .eq("stripe_subscription_id", invoice.subscription);
  }

  return Response.json({
    received: true,
  });
}
