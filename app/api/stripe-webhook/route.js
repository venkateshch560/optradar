const data = event.data.object;

if (event.type === "checkout.session.completed") {
  const email = data.customer_email;

  await supabase.from("subscriptions").upsert({
    user_email: email,
    stripe_customer_id: data.customer,
    stripe_subscription_id: data.subscription,
    status: "active",
    active: true,
    email_alerts: true,
  });

  console.log("CHECKOUT SUCCESS:", email);
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
    })
    .eq("stripe_subscription_id", subscription.id);

  console.log(
    "SUBSCRIPTION UPDATED:",
    subscription.id,
    subscription.status
  );
}

if (event.type === "customer.subscription.deleted") {
  const subscription = data;

  await supabase
    .from("subscriptions")
    .update({
      status: "canceled",
      active: false,
    })
    .eq("stripe_subscription_id", subscription.id);

  console.log("SUBSCRIPTION CANCELED:", subscription.id);
}

if (event.type === "invoice.payment_failed") {
  const invoice = data;

  await supabase
    .from("subscriptions")
    .update({
      status: "payment_failed",
      active: false,
    })
    .eq("stripe_subscription_id", invoice.subscription);

  console.log("PAYMENT FAILED:", invoice.subscription);
}

return Response.json({
  received: true,
});
