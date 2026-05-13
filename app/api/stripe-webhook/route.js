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

    await supabase.from("subscriptions").upsert(
      {
        user_email: session.customer_email,
        active: true,
        status: "active",
        stripe_customer_id: session.customer,
        stripe_subscription_id: session.subscription,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_email" }
    );
  }

  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object;

    const { data } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("stripe_subscription_id", subscription.id)
      .single();

    if (data) {
      await supabase
        .from("subscriptions")
        .update({
          active: false,
          status: "cancelled",
          updated_at: new Date().toISOString(),
        })
        .eq("stripe_subscription_id", subscription.id);
    }
  }

  if (event.type === "invoice.payment_failed") {
    const invoice = event.data.object;

    await supabase
      .from("subscriptions")
      .update({
        active: false,
        status: "payment_failed",
        updated_at: new Date().toISOString(),
      })
      .eq("stripe_customer_id", invoice.customer);
  }

  return Response.json({ received: true });
}