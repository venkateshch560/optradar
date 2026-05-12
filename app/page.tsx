const features = [
  {
    title: "Fresh 24h Direct Jobs",
    desc: "See direct employer openings added recently, not old reposted jobs.",
  },
  {
    title: "OPT Risk Detection",
    desc: "Flags citizen-only, clearance, and no-sponsorship language before you waste time.",
  },
  {
    title: "Apply Confidence Score",
    desc: "Prioritize jobs based on freshness, risk, role level, and apply path.",
  },
  {
    title: "Sponsorship Signals",
    desc: "See whether a role looks low, medium, or high risk for OPT/STEM OPT applicants.",
  },
  {
    title: "Direct Apply Links",
    desc: "Skip noisy job boards and go closer to company career pages and ATS links.",
  },
  {
    title: "Student-Focused Filters",
    desc: "Filter by entry level, location, remote, role category, and OPT risk.",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#050712] text-white overflow-hidden">
      <section className="relative min-h-screen border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.25),transparent_35%),radial-gradient(circle_at_80%_10%,rgba(168,85,247,0.18),transparent_35%),radial-gradient(circle_at_50%_90%,rgba(16,185,129,0.16),transparent_40%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050712]/70 to-[#050712]" />

        <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
          <div>
            <p className="text-xl font-bold tracking-tight">OPT Radar</p>
            <p className="text-xs text-gray-400">by The AI Solutionist</p>
          </div>

          <div className="hidden items-center gap-8 text-sm text-gray-300 md:flex">
            <a href="#problem" className="hover:text-white">Why It Works</a>
            <a href="#features" className="hover:text-white">Features</a>
            <a href="#pricing" className="hover:text-white">Pricing</a>
            <a href="/login" className="hover:text-white">Login</a>
            <a
              href="/login"
              className="rounded-full bg-white px-5 py-2 font-semibold text-black hover:bg-gray-200"
            >
              Get Started
            </a>
          </div>
        </nav>

        <div className="relative z-10 mx-auto grid max-w-7xl gap-12 px-6 pb-24 pt-16 lg:grid-cols-2 lg:items-center">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-2 text-sm text-blue-200">
              <span className="h-2 w-2 rounded-full bg-green-400" />
              Live AI-powered OPT/STEM OPT job intelligence
            </div>

            <h1 className="max-w-4xl text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl">
              Stop applying to jobs that were never built for OPT students.
            </h1>

            <p className="mt-7 max-w-2xl text-lg leading-8 text-gray-300">
              OPT Radar filters noisy job boards, removes junk sources, finds fresh direct employer openings, detects OPT risk, and helps students focus on jobs with stronger screening potential.
            </p>

            <div className="mt-9 flex flex-wrap gap-4">
              <a
                href="/login"
                className="rounded-2xl bg-white px-8 py-4 text-lg font-bold text-black shadow-2xl shadow-white/10 transition hover:-translate-y-0.5 hover:bg-gray-200"
              >
                Start Free
              </a>

              <a
                href="/dashboard"
                className="rounded-2xl border border-white/15 bg-white/5 px-8 py-4 text-lg font-semibold backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/10"
              >
                View Dashboard
              </a>
            </div>

            <div className="mt-10 grid max-w-2xl gap-3 text-sm text-gray-300 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                ✅ Direct employer & ATS links
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                ⚡ Fresh 24-hour openings
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                🛡 OPT risk warnings
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                🎯 Apply confidence score
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 rounded-[2rem] bg-blue-500/20 blur-3xl" />

            <div className="relative rounded-[2rem] border border-white/10 bg-[#0B1020]/90 p-5 shadow-2xl backdrop-blur">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-300">Fresh OPT Jobs</p>
                  <h2 className="text-2xl font-bold">Today’s AI Priority List</h2>
                </div>
                <div className="rounded-full bg-green-500/15 px-3 py-1 text-sm text-green-300">
                  Live
                </div>
              </div>

              {[
                ["Data Analyst", "Low Risk", "92%", "Greenhouse", "2h ago"],
                ["Cloud Support Analyst", "Medium Risk", "76%", "Workday", "4h ago"],
                ["Business Analyst", "Low Risk", "88%", "Lever", "6h ago"],
              ].map(([role, risk, score, ats, time]) => (
                <div
                  key={role}
                  className="mb-4 rounded-2xl border border-white/10 bg-white/[0.04] p-5"
                >
                  <div className="mb-3 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full bg-green-500/15 px-3 py-1 text-green-300">
                      Fresh
                    </span>
                    <span className="rounded-full bg-blue-500/15 px-3 py-1 text-blue-300">
                      Direct Employer
                    </span>
                    <span className="rounded-full bg-yellow-500/15 px-3 py-1 text-yellow-300">
                      {risk}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-semibold">{role}</h3>
                      <p className="mt-1 text-sm text-gray-400">
                        {ats} • {time} • Entry/Mid Level
                      </p>
                    </div>

                    <div className="rounded-2xl border border-green-500/20 bg-green-500/10 px-5 py-3 text-center">
                      <p className="text-xs text-green-300">Confidence</p>
                      <p className="text-2xl font-bold text-green-300">{score}</p>
                    </div>
                  </div>
                </div>
              ))}

              <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-5">
                <p className="text-sm text-blue-200">
                  38 fresh low-risk roles found today. Apply before competition increases.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="problem" className="border-b border-white/10 bg-[#070A12]">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-sm font-bold text-blue-300">
                WHY NORMAL JOB SEARCH FAILS
              </p>

              <h2 className="mt-3 text-4xl font-bold md:text-5xl">
                Most students apply late, apply blind, and apply to the wrong jobs.
              </h2>

              <p className="mt-6 text-lg leading-8 text-gray-400">
                LinkedIn and job boards are crowded with old postings, reposted jobs,
                ghost jobs, recruiter duplicates, and roles that quietly reject OPT/STEM OPT
                candidates. Students waste hours applying without knowing if the job is fresh,
                direct, or visa-safe.
              </p>

              <div className="mt-8 grid gap-4">
                {[
                  "Old jobs keep circulating even after hiring slows down.",
                  "Ghost jobs collect resumes but may not be actively hiring.",
                  "Thousands apply to the same public job board links.",
                  "OPT students waste time on citizen-only, clearance, or no-sponsorship roles.",
                  "Candidates miss fresh direct employer openings posted earlier the same day.",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-red-100"
                  >
                    ✕ {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-[#0B1020] p-6 shadow-2xl">
              <p className="mb-6 text-sm font-semibold text-green-300">
                OPT Radar AI Flow
              </p>

              <div className="space-y-4">
                {[
                  ["1", "Find fresh job signals", "Tracks direct employer and ATS openings instead of relying on noisy reposts."],
                  ["2", "Remove junk sources", "Filters out low-quality job boards, duplicate posts, and pay-to-apply sources."],
                  ["3", "Analyze OPT risk", "Scans descriptions for sponsorship risk, clearance language, and citizenship restrictions."],
                  ["4", "Score apply confidence", "Ranks jobs by freshness, direct link quality, OPT risk, role level, and application ease."],
                  ["5", "Guide next action", "Helps students decide what to apply to first and move toward screening faster."],
                ].map(([num, title, desc], index) => (
                  <div key={title} className="relative flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500 text-lg font-bold text-black">
                        {num}
                      </div>
                      {index < 4 && <div className="h-10 w-px bg-white/20" />}
                    </div>

                    <div className="flex-1 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                      <h3 className="font-bold">{title}</h3>
                      <p className="mt-1 text-sm leading-6 text-gray-400">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 bg-[#080B16]">
        <div className="mx-auto grid max-w-7xl gap-4 px-6 py-10 md:grid-cols-4">
          {[
            ["Fresh roles", "500+"],
            ["Job sources", "Direct ATS"],
            ["Risk checks", "AI-assisted"],
            ["Built for", "OPT/STEM"],
          ].map(([label, value]) => (
            <div key={label} className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
              <p className="text-sm text-gray-400">{label}</p>
              <p className="mt-2 text-3xl font-bold">{value}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-6 py-24">
        <div className="max-w-3xl">
          <p className="text-sm font-bold text-blue-300">WHY STUDENTS PAY FOR IT</p>
          <h2 className="mt-3 text-4xl font-bold md:text-5xl">
            Built to reduce wasted applications.
          </h2>
          <p className="mt-5 text-lg leading-8 text-gray-400">
            Most job boards show too many old, duplicate, or visa-unfriendly jobs.
            OPT Radar focuses on clarity, speed, and better application decisions.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-[2rem] border border-white/10 bg-[#0B1020] p-8 transition hover:-translate-y-1 hover:border-blue-500/40 hover:bg-[#0E1628]"
            >
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-300">
                ✦
              </div>
              <h3 className="text-2xl font-bold">{feature.title}</h3>
              <p className="mt-4 leading-7 text-gray-400">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-7xl px-6 py-24">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-bold text-blue-300">PRICING</p>
          <h2 className="mt-3 text-4xl font-bold md:text-5xl">
            One subscription. Full access.
          </h2>
          <p className="mt-5 text-lg leading-8 text-gray-400">
            Most students spend more on one weekend meal than on tools that could improve their future.
            One strong application can change your life.
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-2xl rounded-[2.5rem] border border-blue-500/30 bg-gradient-to-br from-blue-500/10 via-[#0B1020] to-purple-500/10 p-10 shadow-2xl shadow-blue-500/10">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-6">
            <div>
              <p className="text-sm font-semibold text-blue-300">
                OPT Radar Premium
              </p>

              <div className="mt-3 flex items-end gap-4">
                <h3 className="text-6xl font-bold">$19.99</h3>
                <span className="mb-2 text-3xl text-gray-500 line-through">
                  $29.99
                </span>
              </div>

              <p className="mt-4 text-gray-400">
                Monthly subscription • Cancel anytime before your next billing cycle.
              </p>
            </div>

            <div className="rounded-3xl border border-green-500/20 bg-green-500/10 px-6 py-4 text-center text-green-300">
              <p className="text-sm font-semibold">LIMITED OFFER</p>
              <p className="mt-1 text-3xl font-bold">33% OFF</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {[
              "Unlimited fresh OPT/STEM OPT jobs",
              "Direct employer & ATS links",
              "AI apply confidence scoring",
              "OPT risk detection",
              "Sponsorship insights",
              "Priority fresh-job visibility",
              "Advanced dashboard filters",
              "Future resume matching upgrades",
            ].map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-gray-200"
              >
                ✓ {item}
              </div>
            ))}
          </div>

          <div className="mt-10 rounded-[2rem] border border-yellow-500/20 bg-yellow-500/10 p-8 text-center">
            <p className="text-2xl font-bold text-yellow-200">
              One biryani. One movie ticket. One weekend food order.
            </p>

            <p className="mt-5 text-lg leading-8 text-gray-300">
              That same amount could help you discover one opportunity that changes your future.
              One early application. One direct employer. One interview can completely change your career path.
            </p>
          </div>

          <a
            href="/login"
            className="mt-10 block rounded-2xl bg-white px-5 py-5 text-center text-2xl font-bold text-black transition hover:bg-gray-200"
          >
            Try OPT Radar Today
          </a>

          <p className="mt-6 text-center text-sm leading-7 text-gray-500">
            Subscription renews monthly. Cancel before your next billing cycle to avoid future charges.
            Due to digital access and live data systems, refunds are not provided after activation.
          </p>
        </div>
      </section>

      <section className="border-t border-white/10 bg-gradient-to-br from-blue-500/10 via-[#0B1020] to-purple-500/10">
        <div className="mx-auto max-w-5xl px-6 py-24 text-center">
          <h2 className="text-4xl font-bold md:text-6xl">
            Apply smarter. Apply earlier. Apply with clarity.
          </h2>
          <p className="mx-auto mt-6 max-w-3xl text-xl leading-8 text-gray-300">
            Built for international students who cannot afford to waste time on the wrong jobs.
          </p>
          <a
            href="/login"
            className="mt-10 inline-flex rounded-2xl bg-white px-8 py-4 text-lg font-bold text-black hover:bg-gray-200"
          >
            Start Free Today
          </a>
        </div>
      </section>
      <footer className="border-t border-white/10 py-10 text-center text-sm text-gray-500">

  <p>
    OPT Radar is a job intelligence and aggregation platform that helps users discover publicly available job openings faster.
  </p>

  <p className="mt-3">
    We do not guarantee interviews, sponsorship, employment, callbacks, or hiring outcomes.
  </p>

  <div className="mt-5 flex items-center justify-center gap-6">

    <a
      href="/terms"
      className="hover:text-white"
    >
      Terms
    </a>

    <a
      href="/privacy"
      className="hover:text-white"
    >
      Privacy
    </a>

    <a
      href="/disclaimer"
      className="hover:text-white"
    >
      Disclaimer
    </a>

  </div>

  <p className="mt-6 text-xs text-gray-600">
    © 2026 OPT Radar by The AI Solutionist
  </p>

</footer>
    </main>
  );
}