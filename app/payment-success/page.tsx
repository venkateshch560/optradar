"use client";

import { useEffect } from "react";

export default function PaymentSuccessPage() {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.href = "/dashboard";
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="min-h-screen bg-[#050712] text-white flex items-center justify-center px-6">
      <div className="max-w-xl rounded-3xl border border-white/10 bg-[#0B1020] p-10 text-center">
        <h1 className="text-4xl font-bold">Payment Successful</h1>
        <p className="mt-4 text-gray-400">
          Your subscription is being activated. Redirecting to dashboard...
        </p>
      </div>
    </main>
  );
}