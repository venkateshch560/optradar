import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  try {
    const body = await req.json();
    const { email } = body;

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: email,
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      success_url: "https://jobs.theaisolutionist.com/dashboard",
      cancel_url: "https://jobs.theaisolutionist.com/pricing",
    });

    return Response.json({ url: session.url });
  } catch (err) {
    return Response.json({
      error: err.message,
    });
  }
}
