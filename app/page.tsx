import {
  Clock3,
  ShieldCheck,
  Target,
  Zap,
  Filter,
  Star,
  Send,
  CheckCircle,
  XCircle,
  Mail,
  MessageCircle,
} from "lucide-react";

const SUPPORT_EMAIL = "support@theaisolutionist.com";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#050813] text-white">
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#050813]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <a href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500">
              <Clock3 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">OPT Radar</h1>
              <p className="text-xs text-gray-400">by The AI Solutionist</p>
            </div>
          </a>

          <div className="hidden items-center gap-8 text-sm text-gray-300 md:flex">
            <a href="#why" className="hover:text-white">Why It Works</a>
            <a href="#features" className="hover:text-white">Features</a>
            <a href="#preview" className="hover:text-white">Preview</a>
            <a href="#pricing" className="hover:text-white">Pricing</a>
            <a href="/login" className="hover:text-white">Login</a>
          </div>

          <a
            href="/login"
            className="rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-3 text-sm font-bold"
          >
            Subscribe Now
          </a>
        </div>
      </nav>

      <section className="relative overflow-hidden border-b border-white/10 px-6 py-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(124,58,237,0.25),transparent_35%),radial-gradient(circle_at_left,rgba(59,130,246,0.18),transparent_30%)]" />

        <div className="relative mx-auto grid max-w-7xl gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm text-blue-200">
              <span className="h-2 w-2 rounded-full bg-green-400" />
              Jobs refresh every hour for active subscribers
            </div>

            <h1 className="mt-8 text-5xl font-black leading-tight md:text-7xl">
              Stop applying to jobs that were{" "}
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                never built
              </span>{" "}
              for OPT students.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-300">
              OPT Radar refreshes job opportunities every hour, separates fresh
              jobs from older postings, filters noisy results, and helps
              students focus on official career opportunities with OPT risk and
              apply confidence signals.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="/login"
                className="rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 px-8 py-4 font-bold shadow-xl shadow-blue-500/20"
              >
                Subscribe Now
              </a>

              <a
                href="#preview"
                className="rounded-xl border border-blue-500/40 px-8 py-4 font-bold text-blue-200 hover:bg-blue-500/10"
              >
                Preview Dashboard
              </a>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {[
                ["Official career links", ShieldCheck],
                ["Hourly refresh", Clock3],
                ["Built for OPT/STEM", Target],
              ].map(([text, Icon]: any) => (
                <div key={text} className="flex items-center gap-2 text-sm text-gray-400">
                  <Icon className="h-4 w-4 text-green-300" />
                  {text}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#0B1020]/85 p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-300">Fresh OPT Jobs</p>
                <h2 className="text-2xl font-bold">Hourly Priority List</h2>
              </div>
              <span className="rounded-full bg-green-500/15 px-4 py-2 text-sm text-green-300">
                Updated hourly
              </span>
            </div>

            <div className="space-y-4">
              {[
                ["Data Analyst", "Greenhouse • 2h ago • Entry/Mid Level", "92%", "Low Risk"],
                ["Cloud Support Analyst", "Workday • 4h ago • Entry/Mid Level", "76%", "Review Needed"],
                ["Business Analyst", "Lever • 6h ago • Entry/Mid Level", "88%", "Low Risk"],
              ].map(([title, meta, score, risk]) => (
                <div
                  key={title}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] p-5"
                >
                  <div className="mb-4 flex flex-wrap gap-2">
                    <span className="rounded-full bg-green-500/15 px-3 py-1 text-xs text-green-300">
                      Fresh
                    </span>
                    <span className="rounded-full bg-blue-500/15 px-3 py-1 text-xs text-blue-300">
                      Official Career Link
                    </span>
                    <span className="rounded-full bg-yellow-500/15 px-3 py-1 text-xs text-yellow-300">
                      {risk}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-bold">{title}</h3>
                      <p className="mt-1 text-sm text-gray-400">{meta}</p>
                    </div>

                    <div className="rounded-2xl border border-green-500/20 bg-green-500/10 px-6 py-4 text-center">
                      <p className="text-xs text-green-300">Confidence</p>
                      <p className="text-2xl font-black text-green-300">{score}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-2xl border border-blue-500/20 bg-blue-500/10 p-4 text-sm text-blue-200">
              Fresh jobs are updated hourly. Older jobs stay available inside the dashboard.
            </div>
          </div>
        </div>
      </section>

      <section id="why" className="border-b border-white/10 px-6 py-24">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2">
          <div>
            <p className="font-bold uppercase tracking-wide text-blue-300">
              Why normal job search fails
            </p>

            <h2 className="mt-4 text-4xl font-black leading-tight md:text-6xl">
              Most students apply late, apply blind, and apply to the wrong jobs.
            </h2>

            <p className="mt-6 text-lg leading-8 text-gray-400">
              Job boards are crowded with old postings, reposted jobs, ghost
              jobs, recruiter duplicates, and roles that quietly reject OPT/STEM
              OPT candidates.
            </p>

            <div className="mt-8 space-y-4">
              {[
                "Old jobs keep circulating even after hiring slows down.",
                "Ghost jobs collect resumes but may not be actively hiring.",
                "Thousands apply to the same public job-board links.",
                "OPT students waste time on citizen-only or clearance roles.",
                "Students miss fresh official career openings posted earlier.",
              ].map((text) => (
                <div
                  key={text}
                  className="flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-red-100"
                >
                  <XCircle className="h-5 w-5 text-red-400" />
                  {text}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#0B1020] p-8">
            <p className="font-bold text-green-300">OPT Radar AI Flow</p>

            <div className="mt-8 space-y-5">
              {[
                ["Find fresh job signals", "Refreshes job data hourly and separates fresh listings from older postings.", Zap],
                ["Remove junk sources", "Filters low-quality job boards, duplicates, and noisy apply paths.", Filter],
                ["Analyze OPT risk", "Scans descriptions for sponsorship risk, clearance language, and citizenship restrictions.", ShieldCheck],
                ["Score apply confidence", "Ranks jobs by freshness, link quality, OPT risk, role level, and application ease.", Star],
                ["Guide next action", "Helps students decide what to apply to first and track saved/applied jobs.", Send],
              ].map(([title, desc, Icon]: any, i) => (
                <div key={title} className="flex gap-5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 font-black">
                    {i + 1}
                  </div>

                  <div className="flex-1 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5 text-blue-300" />
                      <h3 className="font-bold">{title}</h3>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-gray-400">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="border-b border-white/10 px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <p className="font-bold uppercase tracking-wide text-blue-300">
            Why students pay for it
          </p>

          <h2 className="mt-4 max-w-3xl text-4xl font-black md:text-6xl">
            Built to reduce wasted applications.
          </h2>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {[
              ["Hourly Fresh Job Updates", "Students see newer openings faster."],
              ["Fresh vs Older Jobs", "Fresh and older jobs are clearly separated."],
              ["OPT Risk Detection", "Flags risky citizen-only, clearance, and no-sponsorship roles."],
              ["Apply Confidence Score", "Prioritize jobs based on freshness, risk, role level, and apply path."],
              ["Official Apply Links", "Skip noisy job boards and go closer to company career/ATS links."],
              ["Saved & Applied Tracker", "Track saved roles and confirmed applications inside one dashboard."],
            ].map(([title, desc]) => (
              <div key={title} className="rounded-3xl border border-white/10 bg-[#0B1020] p-8">
                <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/20">
                  <Star className="h-6 w-6 text-blue-300" />
                </div>
                <h3 className="text-2xl font-bold">{title}</h3>
                <p className="mt-4 leading-7 text-gray-400">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="preview" className="border-b border-white/10 px-6 py-24">
        <div className="mx-auto max-w-7xl text-center">
          <p className="font-bold text-blue-300">Premium Dashboard Preview</p>
          <h2 className="mt-4 text-4xl font-black md:text-6xl">
            See what students unlock after subscribing
          </h2>
          <p className="mx-auto mt-5 max-w-3xl text-lg text-gray-400">
            A clean job-search command center with fresh jobs, saved jobs,
            applied tracking, OPT risk signals, and apply confidence scoring.
          </p>
        </div>

        <div className="mx-auto mt-14 max-w-6xl rounded-3xl border border-white/10 bg-[#0B1020] p-8">
          <div className="grid gap-4 md:grid-cols-5">
            {[
              ["Fresh Jobs", "128"],
              ["All Jobs", "642"],
              ["Saved Jobs", "14"],
              ["Applied Jobs", "7"],
              ["Low OPT Risk", "89"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-left">
                <p className="text-gray-400">{label}</p>
                <p className="mt-2 text-3xl font-bold">{value}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 space-y-4">
            {[
              ["Junior Data Analyst", "Healthcare Analytics Company • Remote / United States", "86%"],
              ["AI Data Analyst", "Enterprise AI Platform • Austin, TX", "78%"],
              ["Cloud Support Engineer", "SaaS Company • Remote", "82%"],
            ].map(([title, meta, score]) => (
              <div key={title} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                <div className="text-left">
                  <div className="mb-3 flex gap-2">
                    <span className="rounded-full bg-green-500/15 px-3 py-1 text-xs text-green-300">Fresh</span>
                    <span className="rounded-full bg-blue-500/15 px-3 py-1 text-xs text-blue-300">Official Career Link</span>
                  </div>
                  <h4 className="text-xl font-bold">{title}</h4>
                  <p className="mt-1 text-gray-400">{meta}</p>
                </div>

                <div className="rounded-2xl bg-green-500/10 px-6 py-4 text-center text-green-300">
                  <p className="text-sm">Apply Confidence</p>
                  <p className="text-3xl font-bold">{score}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="border-b border-white/10 px-6 py-24">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-black md:text-6xl">
            One subscription. Full access.
          </h2>
          <p className="mt-5 text-lg text-gray-400">
            Most students spend more on one weekend meal than on tools that
            could improve their future.
          </p>
        </div>

        <div className="mx-auto mt-14 max-w-3xl rounded-3xl border border-blue-500/30 bg-gradient-to-br from-[#0B1020] to-[#080B16] p-10 shadow-2xl shadow-blue-500/10">
          <p className="font-bold text-blue-300">OPT Radar Premium</p>

          <div className="mt-5 flex items-end gap-4">
            <p className="text-6xl font-black">$19.99</p>
            <p className="mb-2 text-3xl text-gray-500 line-through">$29.99</p>
          </div>

          <p className="mt-4 text-gray-400">
            Monthly subscription • Cancel anytime before your next billing cycle.
          </p>

          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {[
              "Unlimited fresh OPT/STEM OPT jobs",
              "Hourly job updates",
              "Official company & ATS links",
              "AI apply confidence scoring",
              "OPT risk detection",
              "Sponsorship insights",
              "Saved and applied tracker",
              "Priority support",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <CheckCircle className="h-5 w-5 text-green-300" />
                <span>{item}</span>
              </div>
            ))}
          </div>

          <a
            href="/login"
            className="mt-10 block rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 px-8 py-4 text-center text-lg font-black"
          >
            Subscribe Now
          </a>
        </div>
      </section>

      <section className="border-b border-white/10 px-6 py-28 text-center">
        <h2 className="mx-auto max-w-5xl text-5xl font-black leading-tight md:text-7xl">
          Apply smarter. Apply earlier. Apply with clarity.
        </h2>
        <p className="mx-auto mt-6 max-w-3xl text-xl text-gray-400">
          Built for international students who cannot afford to waste time on
          the wrong jobs.
        </p>

        <a
          href="/login"
          className="mt-10 inline-block rounded-2xl bg-white px-10 py-5 text-lg font-black text-black"
        >
          Subscribe Now
        </a>
      </section>

  <footer className="border-t border-white/10 bg-[#050813] px-6 py-14">
  <div className="mx-auto max-w-7xl">
    <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#0B1020] to-[#070A12] p-8 md:p-10">
      <div className="grid gap-10 md:grid-cols-3 md:items-start">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 shadow-lg shadow-blue-500/20">
              <Clock3 className="h-5 w-5 text-white" />
            </div>

            <div>
              <h3 className="text-2xl font-bold">OPT Radar</h3>
              <p className="text-sm text-gray-400">by The AI Solutionist</p>
            </div>
          </div>

          <p className="mt-5 max-w-sm text-sm leading-7 text-gray-400">
            Helping OPT students find fresher jobs, avoid wasted applications,
            and apply with better clarity.
          </p>
        </div>

        <div>
          <h4 className="text-lg font-bold">Quick Links</h4>

          <div className="mt-5 grid gap-3 text-sm text-gray-400">
            <a href="#why" className="hover:text-white">Why It Works</a>
            <a href="#features" className="hover:text-white">Features</a>
            <a href="#preview" className="hover:text-white">Dashboard Preview</a>
            <a href="#pricing" className="hover:text-white">Pricing</a>
            <a href="/login" className="hover:text-white">Login</a>
          </div>
        </div>

        <div className="rounded-3xl border border-blue-500/20 bg-blue-500/10 p-6">
          <h4 className="text-lg font-bold">Contact Support</h4>

          <p className="mt-2 text-sm leading-6 text-gray-400">
            Questions about billing, login, or dashboard access? Email us.
          </p>

          <a
            href="https://mail.google.com/mail/?view=cm&fs=1&to=support@theaisolutionist.com"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 hover:bg-white/[0.06]"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/20">
              <Mail className="h-5 w-5 text-blue-300" />
            </div>

            <span className="break-all text-base font-semibold text-blue-300">
              support@theaisolutionist.com
            </span>
          </a>
        </div>
      </div>

      <div className="mt-10 flex flex-col gap-4 border-t border-white/10 pt-6 text-sm text-gray-500 md:flex-row md:items-center md:justify-between">
        <p>© 2026 OPT Radar by The AI Solutionist. All rights reserved.</p>

        <div className="flex gap-6">
          <a href="/login" className="hover:text-white">Login</a>
          <a href="#pricing" className="hover:text-white">Pricing</a>
          <a
            href="https://mail.google.com/mail/?view=cm&fs=1&to=support@theaisolutionist.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white"
          >
            Contact
          </a>
        </div>
      </div>
    </div>
  </div>
</footer>
    </main>
  );
}
