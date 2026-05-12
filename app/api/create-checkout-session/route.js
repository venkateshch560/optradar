import Stripe from "stripe";

const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY
);

export async function POST(req) {

  try {

    const body = await req.json();

    const { email } = body;

    const session =
      await stripe.checkout.sessions.create({

        payment_method_types: ["card"],

        mode: "subscription",

        customer_email: email,

        line_items: [
          {
            price_data: {

              currency: "usd",

              product_data: {
                name: "OPT Radar Premium"
              },

              recurring: {
                interval: "month"
              },

              unit_amount: 1999
            },

            quantity: 1
          }
        ],

        success_url:
          "http://localhost:3000/dashboard",

        cancel_url:
          "http://localhost:3000/pricing"
      });

    return Response.json({
      url: session.url
    });

  } catch (err) {

    console.log(err);

    return Response.json({
      error: err.message
    });
  }
}