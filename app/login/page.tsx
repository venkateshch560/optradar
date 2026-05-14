"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function LoginPage() {
  const [isSignup, setIsSignup] = useState(false);
  const [message, setMessage] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
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
    const cleanEmail = email.trim().toLowerCase();
    const cleanFirstName = firstName.trim();
    const cleanLastName = lastName.trim();

    const { data, error } = await supabase.auth.signUp({
  email,
  password,
});

    if (error) {
setMessage(error.message);
      return;
    }

    const profileRes = await fetch("/api/save-profile", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    email,
    first_name: firstName,
    last_name: lastName,
    phone,
  }),
});

const profileData = await profileRes.json();

if (!profileData.success) {
  setMessage("Profile save failed: " + profileData.error);
  return;
}

    setMessage(
      "Account created successfully. Please complete payment to access dashboard."
    );

    window.location.href = "/pricing";
  }

  async function handleLogin() {
    const cleanEmail = email.trim().toLowerCase();

    const { error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (error) {
setMessage(error.message);
      return;
    }

    await checkSubscriptionAndRedirect(cleanEmail);
  }

  return (
    <main className="min-h-screen bg-[#030712] text-white flex items-center justify-center px-6">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0B1120] p-8 shadow-2xl">
        <p className="text-blue-400 font-semibold">OPT Radar</p>

        <h1 className="mt-3 text-4xl font-bold">
          {isSignup ? "Create Account" : "Welcome Back"}
        </h1>

        <p className="mt-3 text-gray-400">
          Fresh OPT jobs, hourly updates, sponsorship insights, and premium job
          tracking.
        </p>

        {isSignup && (
          <>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <input
                className="w-full rounded-xl bg-white/5 border border-white/10 p-3 outline-none"
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />

              <input
                className="w-full rounded-xl bg-white/5 border border-white/10 p-3 outline-none"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>

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
        {message && (
  <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
    {message}
  </div>
)}
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
