"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function LoginPage() {
  const [isSignup, setIsSignup] = useState(false);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function checkSubscriptionAndRedirect(userEmail: string) {
    const res = await fetch("/api/check-subscription", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: userEmail,
      }),
    });

    const data = await res.json();

    if (data.active) {
      window.location.href = "/dashboard";
    } else {
      window.location.href = "/pricing";
    }
  }

  async function handleSignup() {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    await supabase.from("profiles").upsert({
      email,
      full_name: fullName,
      phone,
    });

    alert("Account created successfully. Please complete payment to access dashboard.");

    window.location.href = "/pricing";
  }

  async function handleLogin() {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    await checkSubscriptionAndRedirect(email);
  }

  return (
    <main className="min-h-screen bg-[#030712] text-white flex items-center justify-center px-6">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0B1120] p-8 shadow-2xl">
        <p className="text-blue-400 font-semibold">OPT Radar</p>

        <h1 className="mt-3 text-4xl font-bold">
          {isSignup ? "Create Account" : "Welcome Back"}
        </h1>

        <p className="mt-3 text-gray-400">
          Fresh OPT jobs, sponsorship insights, AI-powered tracking.
        </p>

        {isSignup && (
          <>
            <input
              className="mt-6 w-full rounded-xl bg-white/5 border border-white/10 p-3 outline-none"
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />

            <input
              className="mt-3 w-full rounded-xl bg-white/5 border border-white/10 p-3 outline-none"
              placeholder="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </>
        )}

        <input
          className="mt-6 w-full rounded-xl bg-white/5 border border-white/10 p-3 outline-none"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="mt-3 w-full rounded-xl bg-white/5 border border-white/10 p-3 outline-none"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={isSignup ? handleSignup : handleLogin}
          className="mt-6 w-full rounded-xl bg-white text-black font-bold p-3 hover:bg-gray-200"
        >
          {isSignup ? "Create Account & Continue to Payment" : "Login"}
        </button>

        <button
          onClick={() => setIsSignup(!isSignup)}
          className="mt-4 w-full text-sm text-gray-400 hover:text-white"
        >
          {isSignup
            ? "Already have an account? Login"
            : "New user? Create account"}
        </button>

        <div className="mt-6 flex items-center justify-between text-sm text-gray-400">
          <a href="/" className="hover:text-white">
            ← Back to Home
          </a>

          <a href="/pricing" className="hover:text-white">
            Pricing →
          </a>
        </div>
      </div>
    </main>
  );
}
