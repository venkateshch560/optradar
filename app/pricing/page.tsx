"use client";
import { createClient } from "@supabase/supabase-js";
export default function PricingPage() {

 async function subscribe() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    window.location.href = "/login";
    return;
  }

  const res = await fetch("/api/create-checkout-session", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: user.email,
    }),
  });

  const data = await res.json();

  if (data.url) {
    window.location.href = data.url;
  } else {
    alert(data.error || "Stripe checkout failed");
  }
}
  return (

    <main className="min-h-screen bg-[#050712] text-white flex items-center justify-center px-6">

      <div className="max-w-2xl rounded-[2rem] border border-blue-500/20 bg-[#0B1020] p-10 shadow-2xl">

        <p className="text-sm font-bold text-blue-300">
          OPT Radar Premium
        </p>

        <h1 className="mt-4 text-6xl font-bold">
          $19.99
          <span className="ml-4 text-3xl text-gray-500 line-through">
            $29.99
          </span>
        </h1>

        <p className="mt-4 text-lg text-gray-400 leading-8">
          Fresh direct employer jobs, AI risk analysis,
          sponsorship insights, and high-confidence applications.
        </p>

        <div className="mt-10 grid gap-4">

          {[
            "Unlimited fresh jobs",
            "AI apply confidence scoring",
            "OPT risk detection",
            "Sponsorship insights",
            "Advanced filters",
            "Priority access"
          ].map((item) => (

            <div
              key={item}
              className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
            >
              ✓ {item}
            </div>

          ))}

        </div>

        <button
          onClick={subscribe}
          className="mt-10 w-full rounded-2xl bg-white px-5 py-5 text-2xl font-bold text-black hover:bg-gray-200"
        >
          Subscribe Now
        </button>

        <p className="mt-6 text-center text-sm text-gray-500 leading-7">
          Subscription renews monthly. Cancel before next billing cycle.
          No refunds after activation.
        </p>

      </div>

    </main>
  );
}
