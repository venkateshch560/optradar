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
} from "lucide-react";

const SUPPORT_EMAIL = "support@theaisolutionist.com";
const GMAIL_LINK =
  "https://mail.google.com/mail/?view=cm&fs=1&to=support@theaisolutionist.com";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#050813] text-white">
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#050813]/90 backdrop-blur-xl">
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
            className="rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-3 text-sm font-bold shadow-lg shadow-blue-500/20"
          >
            Subscribe Now
          </a>
        </div>
      </nav>

      <section className="relative overflow-hidden border-b border-white/10 px-6 py-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(124,58,237,0.25),transparent_34%),radial-gradient(circle_at_left,rgba(59,130,246,0.18),transparent_30%)]" />

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
              OPT Radar helps international students find fresh jobs faster,
              avoid noisy job boards, and apply with better clarity using OPT
              risk signals and apply confidence scoring.
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
                <div key={title} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                  <div className="mb-4 flex flex-wrap gap-2">
                    <span className="rounded-full bg-green-500/15 px-3 py-1 text-xs text-green-300">Fresh</span>
                    <span className="rounded-full bg-blue-500/15 px-3 py-1 text-xs text-blue-300">Official Career Link</span>
                    <span className="rounded-full bg-yellow-500/15 px-3 py-1 text-xs text-yellow-300">{risk}</span>
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
          </div>
        </div>
      </section>

      <section id="why" className="border-b border-white/10 px-6 py-20">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2">
          <div>
            <p className="font-bold uppercase tracking-wide text-blue-300">
              Why normal job search fails
            </p>

            <h2 className="mt-4 text-4xl font-black leading-tight md:text-5xl">
              Most students apply late, apply blind, and apply to the wrong jobs.
            </h2>

            <p className="mt-6 text-lg leading-8 text-gray-400">
              Job boards are crowded with old postings, reposted roles, ghost
              jobs, recruiter duplicates, and listings that are risky for OPT
              students.
            </p>

            <div className="mt-8 space-y-4">
              {[
                "Old jobs keep circulating after hiring slows down.",
                "Ghost jobs collect resumes but may not be actively hiring.",
                "Students waste time on citizen-only or clearance roles.",
                "Fresh official career openings get missed.",
              ].map((text) => (
                <div key={text} className="flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-red-100">
                  <XCircle className="h-5 w-5 text-red-400" />
                  {text}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#0B1020] p-8">
            <p className="font-bold text-green-300">OPT Radar Flow</p>

            <div className="mt-8 space-y-5">
              {[
                ["Find fresh jobs", "Refreshes job data hourly and separates fresh listings from older postings.", Zap],
                ["Remove junk sources", "Filters noisy job-board results and duplicate apply paths.", Filter],
                ["Analyze OPT risk", "Checks sponsorship risk, clearance language, and citizenship restrictions.", ShieldCheck],
                ["Score confidence", "Ranks jobs by freshness, role level, risk, and apply path.", Star],
                ["Track next action", "Save jobs, open apply links, and confirm applied jobs.", Send],
              ].map(([title, desc, Icon]: any, i) => (
                <div key={title} className="flex gap-5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 font-black">
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

      <section id="features" className="border-b border-white/10 px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <p className="font-bold uppercase tracking-wide text-blue-300">
            Why students pay for it
          </p>

          <h2 className="mt-4 max-w-3xl text-4xl font-black md:text-5xl">
            Built to reduce wasted applications.
          </h2>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              ["Hourly Fresh Jobs", "See newer openings faster."],
              ["Fresh vs Older Jobs", "Know where to focus first."],
              ["OPT Risk Detection", "Avoid citizen-only and clearance roles."],
              ["Apply Confidence Score", "Prioritize better-fit opportunities."],
              ["Official Career Links", "Apply closer to company/ATS sources."],
              ["Saved & Applied Tracker", "Keep job search organized."],
            ].map(([title, desc]) => (
              <div key={title} className="rounded-3xl border border-white/10 bg-[#0B1020] p-7">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/20">
                  <Star className="h-5 w-5 text-blue-300" />
                </div>
                <h3 className="text-xl font-bold">{title}</h3>
                <p className="mt-3 leading-7 text-gray-400">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="preview" className="border-b border-white/10 px-6 py-20">
        <div className="mx-auto max-w-7xl text-center">
          <p className="font-bold text-blue-300">Premium Dashboard Preview</p>
          <h2 className="mt-4 text-4xl font-black md:text-5xl">
            One clean command center after subscribing.
          </h2>
          <p className="mx-auto mt-5 max-w-3xl text-lg text-gray-400">
            Fresh jobs, saved jobs, applied tracking, OPT risk signals, and apply confidence scoring in one place.
          </p>
        </div>

        <div className="mx-auto mt-12 max-w-6xl rounded-3xl border border-white/10 bg-[#0B1020] p-8">
          <div className="grid gap-4 md:grid-cols-5">
            {[
              ["Fresh Jobs", "128"],
              ["All Jobs", "642"],
              ["Saved", "14"],
              ["Applied", "7"],
              ["Low Risk", "89"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-left">
                <p className="text-gray-400">{label}</p>
                <p className="mt-2 text-3xl font-bold">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="border-b border-white/10 px-6 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-black md:text-5xl">
            One subscription. Full access.
          </h2>
          <p className="mt-5 text-lg text-gray-400">
            Fresh jobs, OPT risk insights, and application tracking for one monthly price.
          </p>
        </div>

        <div className="mx-auto mt-12 max-w-3xl rounded-3xl border border-blue-500/30 bg-gradient-to-br from-[#0B1020] to-[#080B16] p-9 shadow-2xl shadow-blue-500/10">
          <p className="font-bold text-blue-300">OPT Radar Premium</p>

          <div className="mt-5 flex items-end gap-4">
            <p className="text-6xl font-black">$19.99</p>
            <p className="mb-2 text-3xl text-gray-500 line-through">$29.99</p>
          </div>

          <p className="mt-4 text-gray-400">
            Monthly subscription • Cancel anytime.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {[
              "Hourly fresh jobs",
              "Official career links",
              "OPT risk detection",
              "Apply confidence scoring",
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
            className="mt-9 block rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 px-8 py-4 text-center text-lg font-black"
          >
            Subscribe Now
          </a>
        </div>
      </section>

      <section className="border-b border-white/10 px-6 py-20 text-center">
        <h2 className="mx-auto max-w-4xl text-4xl font-black leading-tight md:text-6xl">
          Apply smarter. Apply earlier.
        </h2>

        <p className="mx-auto mt-5 max-w-2xl text-lg text-gray-400">
          Built for OPT/STEM students who cannot afford to waste time on the wrong jobs.
        </p>

        <a
          href="/login"
          className="mt-8 inline-block rounded-2xl bg-white px-10 py-4 text-lg font-black text-black"
        >
          Subscribe Now
        </a>
      </section>

      <footer className="border-t border-white/10 bg-[#050813] px-6 py-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500">
                <Clock3 className="h-5 w-5 text-white" />
              </div>

              <div>
                <h3 className="text-xl font-bold">OPT Radar</h3>
                <p className="text-sm text-gray-400">by The AI Solutionist</p>
              </div>
            </div>

            <p className="mt-4 max-w-md text-sm leading-6 text-gray-500">
              Fresh OPT/STEM job intelligence with official career links, OPT risk signals, and apply confidence scoring.
            </p>
          </div>

          <div className="flex flex-wrap gap-6 text-sm text-gray-400">
            <a href="#why" className="hover:text-white">Why It Works</a>
            <a href="#features" className="hover:text-white">Features</a>
            <a href="#preview" className="hover:text-white">Preview</a>
            <a href="#pricing" className="hover:text-white">Pricing</a>
            <a href="/login" className="hover:text-white">Login</a>
          </div>

          <a
            href={GMAIL_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-2xl border border-blue-500/20 bg-blue-500/10 px-5 py-4 text-sm font-semibold text-blue-300 hover:bg-blue-500/20"
          >
            <Mail className="h-5 w-5" />
            {SUPPORT_EMAIL}
          </a>
        </div>

        <div className="mx-auto mt-8 flex max-w-7xl flex-col gap-4 border-t border-white/10 pt-6 text-sm text-gray-600 md:flex-row md:items-center md:justify-between">
          <p>© 2026 OPT Radar by The AI Solutionist. All rights reserved.</p>

          <div className="flex gap-5">
            <a href="/login" className="hover:text-gray-300">Login</a>
            <a href="#pricing" className="hover:text-gray-300">Pricing</a>
            <a
              href={GMAIL_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-300"
            >
              Contact
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
