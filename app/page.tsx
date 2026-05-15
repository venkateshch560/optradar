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
  BriefcaseBusiness,
  BadgeCheck,
  Layers,
  Gauge,
  Bookmark,
  FileCheck2,
  ArrowRight,
} from "lucide-react";

const SUPPORT_EMAIL = "support@theaisolutionist.com";
const GMAIL_LINK =
  "https://mail.google.com/mail/?view=cm&fs=1&to=support@theaisolutionist.com";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#050712] text-white">
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#050712]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <a href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-black">
              <Clock3 className="h-5 w-5" />
            </div>

            <div>
              <h1 className="text-xl font-bold tracking-tight">OPT Radar</h1>
              <p className="text-xs text-gray-400">by The AI Solutionist</p>
            </div>
          </a>

          <div className="hidden items-center gap-8 text-sm text-gray-300 md:flex">
            <a href="#why" className="hover:text-white">Why It Works</a>
            <a href="#features" className="hover:text-white">Features</a>
            <a href="#preview" className="hover:text-white">Preview</a>
            <a href="#pricing" className="hover:text-white">Pricing</a>
            <a href={GMAIL_LINK} target="_blank" rel="noopener noreferrer" className="hover:text-white">Contact</a>
          </div>

          <a
            href="/login"
            className="rounded-xl bg-white px-6 py-3 text-sm font-bold text-black transition hover:bg-gray-200"
          >
            Subscribe Now
          </a>
        </div>
      </nav>

      <section className="relative overflow-hidden border-b border-white/10 px-6 py-20 md:px-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.14),transparent_36%)]" />

        <div className="relative mx-auto grid max-w-7xl gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-gray-300">
              <span className="h-2 w-2 rounded-full bg-green-400" />
              Hourly job updates for active subscribers
            </div>

            <h1 className="mt-8 max-w-4xl text-5xl font-semibold leading-[1.05] tracking-[-0.05em] md:text-7xl">
              A smarter job search platform for OPT and STEM OPT students.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-400">
              OPT Radar helps international students discover fresh career
              opportunities, reduce wasted applications, and prioritize roles
              using official apply links, OPT risk signals, and apply confidence
              scoring.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="/login"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-7 py-4 font-bold text-black transition hover:bg-gray-200"
              >
                Subscribe Now
                <ArrowRight className="h-4 w-4" />
              </a>

              <a
                href="#preview"
                className="rounded-xl border border-white/10 px-7 py-4 font-bold text-gray-200 transition hover:bg-white/[0.05]"
              >
                View Dashboard Preview
              </a>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {[
                ["Official apply links", ShieldCheck],
                ["Hourly refresh", Clock3],
                ["OPT-focused signals", Target],
              ].map(([text, Icon]: any) => (
                <div key={text} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-gray-300">
                  <Icon className="h-5 w-5 text-blue-300" />
                  {text}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-[#0B1020] p-6 shadow-2xl shadow-black/40">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-300">
                  Fresh OPT Jobs
                </p>
                <h2 className="mt-1 text-2xl font-semibold">
                  Hourly Priority List
                </h2>
              </div>

              <span className="rounded-full border border-green-500/20 bg-green-500/10 px-4 py-2 text-sm text-green-300">
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
                  className="rounded-2xl border border-white/10 bg-white/[0.035] p-5"
                >
                  <div className="mb-4 flex flex-wrap gap-2">
                    <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs text-green-300">
                      Fresh
                    </span>
                    <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs text-blue-300">
                      Official Career Link
                    </span>
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-gray-300">
                      {risk}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold">{title}</h3>
                      <p className="mt-1 text-sm text-gray-400">{meta}</p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-black/20 px-5 py-4 text-center">
                      <p className="text-xs text-gray-400">Confidence</p>
                      <p className="text-2xl font-bold text-green-300">{score}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-6 text-gray-400">
              Fresh jobs are separated from older postings so students can focus
              on opportunities with better timing.
            </p>
          </div>
        </div>
      </section>

      <section id="why" className="border-b border-white/10 px-6 py-18 md:px-10">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-300">
              Why it matters
            </p>

            <h2 className="mt-4 text-4xl font-semibold leading-tight tracking-[-0.04em] md:text-5xl">
              Most job searches waste time before the application even starts.
            </h2>

            <p className="mt-6 text-lg leading-8 text-gray-400">
              Job boards are crowded with outdated postings, duplicated roles,
              ghost jobs, and listings that may not be suitable for OPT or STEM
              OPT candidates.
            </p>

            <div className="mt-8 space-y-4">
              {[
                "Old jobs continue circulating after hiring slows down.",
                "Ghost jobs collect resumes but may not be actively hiring.",
                "Students apply blindly to citizen-only or clearance roles.",
                "Fresh official career openings are often missed.",
              ].map((text) => (
                <div
                  key={text}
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-gray-300"
                >
                  <XCircle className="h-5 w-5 text-red-300" />
                  {text}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-[#0B1020] p-7 shadow-2xl shadow-black/30">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-green-300">
              Platform workflow
            </p>

            <div className="mt-8 space-y-5">
              {[
                ["Find fresh job signals", "Refreshes job data hourly and separates fresh listings from older postings.", Zap],
                ["Reduce noisy results", "Filters lower-quality job-board signals and duplicate apply paths.", Filter],
                ["Analyze OPT risk", "Checks for sponsorship risk, clearance language, and citizenship restrictions.", ShieldCheck],
                ["Score apply confidence", "Ranks jobs by freshness, role level, risk, and apply path.", Star],
                ["Track applications", "Save jobs, open official links, and confirm applied jobs.", Send],
              ].map(([title, desc, Icon]: any, i) => (
                <div key={title} className="flex gap-5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white text-sm font-bold text-black">
                    {i + 1}
                  </div>

                  <div className="flex-1 rounded-2xl border border-white/10 bg-white/[0.035] p-5">
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5 text-blue-300" />
                      <h3 className="font-semibold">{title}</h3>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-gray-400">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="border-b border-white/10 px-6 py-18 md:px-10">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-300">
            Core features
          </p>

          <h2 className="mt-4 max-w-3xl text-4xl font-semibold tracking-[-0.04em] md:text-5xl">
            Built to make job search decisions clearer.
          </h2>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              ["Hourly Fresh Job Updates", "See newer openings faster instead of applying only to stale roles.", Clock3],
              ["Fresh vs Older Jobs", "Separate recent postings from older opportunities.", Layers],
              ["OPT Risk Detection", "Identify citizen-only, clearance, and no-sponsorship language.", ShieldCheck],
              ["Apply Confidence Score", "Prioritize roles based on freshness, risk, level, and apply path.", Gauge],
              ["Official Career Links", "Apply closer to official company and ATS sources.", BadgeCheck],
              ["Saved & Applied Tracker", "Organize saved roles and confirmed applications.", Bookmark],
            ].map(([title, desc, Icon]: any) => (
              <div
                key={title}
                className="rounded-2xl border border-white/10 bg-[#0B1020] p-6 transition hover:border-white/20"
              >
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
                  <Icon className="h-5 w-5 text-blue-300" />
                </div>

                <h3 className="text-xl font-semibold">{title}</h3>
                <p className="mt-3 leading-7 text-gray-400">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="preview" className="border-b border-white/10 px-6 py-18 md:px-10">
        <div className="mx-auto max-w-7xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-300">
            Dashboard preview
          </p>

          <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] md:text-5xl">
            One organized command center after subscribing.
          </h2>

          <p className="mx-auto mt-5 max-w-3xl text-lg text-gray-400">
            Fresh jobs, saved jobs, applied tracking, OPT risk signals, and
            apply confidence scoring in one clean dashboard.
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-7xl rounded-[2rem] border border-white/10 bg-[#0B1020] p-6 shadow-2xl shadow-black/30">
          <div className="grid gap-6 lg:grid-cols-[250px_1fr]">
            <aside className="rounded-3xl border border-white/10 bg-[#070A12] p-6">
              <h3 className="text-2xl font-semibold">OPT Radar</h3>
              <p className="mt-2 text-sm text-gray-400">
                Job Intelligence Platform
              </p>

              <div className="mt-8 space-y-3 text-sm text-gray-300">
                {["Dashboard", "Fresh Jobs", "All Jobs", "Entry Level", "Low OPT Risk", "Saved Jobs", "Applied Jobs"].map((item, i) => (
                  <div
                    key={item}
                    className={
                      i === 1
                        ? "rounded-xl bg-white px-4 py-3 text-black"
                        : "rounded-xl px-4 py-3 hover:bg-white/5"
                    }
                  >
                    {item}
                  </div>
                ))}
              </div>
            </aside>

            <div className="rounded-3xl border border-white/10 bg-[#080B16] p-6">
              <div className="grid gap-4 md:grid-cols-5">
                {[
                  ["Fresh Jobs", "128", Clock3],
                  ["All Jobs", "642", BriefcaseBusiness],
                  ["Saved", "14", Bookmark],
                  ["Applied", "7", FileCheck2],
                  ["Low Risk", "89", ShieldCheck],
                ].map(([label, value, Icon]: any) => (
                  <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 text-left">
                    <div className="mb-3 flex items-center gap-2">
                      <Icon className="h-4 w-4 text-blue-300" />
                      <p className="text-sm text-gray-400">{label}</p>
                    </div>
                    <p className="text-3xl font-semibold">{value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 space-y-4">
                {[
                  ["Junior Data Analyst", "Healthcare Analytics Company • Remote / United States", "86%"],
                  ["AI Data Analyst", "Enterprise AI Platform • Austin, TX", "78%"],
                  ["Cloud Support Engineer", "SaaS Company • Remote", "82%"],
                ].map(([title, meta, score]) => (
                  <div key={title} className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="mb-3 flex flex-wrap gap-2">
                        <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs text-green-300">Fresh</span>
                        <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs text-blue-300">Official Career Link</span>
                      </div>
                      <h4 className="text-xl font-semibold">{title}</h4>
                      <p className="mt-1 text-gray-400">{meta}</p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-black/20 px-6 py-4 text-center text-green-300">
                      <p className="text-sm text-gray-400">Apply Confidence</p>
                      <p className="text-3xl font-semibold">{score}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="border-b border-white/10 px-6 py-18 md:px-10">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-300">
            Pricing
          </p>

          <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] md:text-5xl">
            One subscription. Full access.
          </h2>

          <p className="mt-5 text-lg text-gray-400">
            Fresh jobs, OPT risk insights, official career links, and
            application tracking for one monthly price.
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-3xl rounded-[2rem] border border-white/10 bg-[#0B1020] p-9 shadow-2xl shadow-black/30">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-300">
            OPT Radar Premium
          </p>

          <div className="mt-5 flex items-end gap-4">
            <p className="text-6xl font-semibold">$19.99</p>
            <p className="mb-2 text-3xl text-gray-500 line-through">$29.99</p>
          </div>

          <p className="mt-4 text-gray-400">
            Monthly subscription • Cancel anytime before your next billing cycle.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
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
              <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                <CheckCircle className="h-5 w-5 text-green-300" />
                <span>{item}</span>
              </div>
            ))}
          </div>

          <a
            href="/login"
            className="mt-9 block rounded-xl bg-white px-8 py-4 text-center text-lg font-bold text-black transition hover:bg-gray-200"
          >
            Subscribe Now
          </a>
        </div>
      </section>

      <section className="border-b border-white/10 px-6 py-16 text-center md:px-10">
        <h2 className="mx-auto max-w-4xl text-4xl font-semibold leading-tight tracking-[-0.04em] md:text-6xl">
          Apply smarter. Apply earlier.
        </h2>

        <p className="mx-auto mt-5 max-w-2xl text-lg text-gray-400">
          Built for OPT/STEM students who cannot afford to waste time on the
          wrong jobs.
        </p>

        <a
          href="/login"
          className="mt-8 inline-block rounded-xl bg-white px-10 py-4 text-lg font-bold text-black transition hover:bg-gray-200"
        >
          Subscribe Now
        </a>
      </section>

      <footer className="border-t border-white/10 bg-[#050712] px-6 py-12 md:px-10">
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[1.2fr_0.8fr_1fr]">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-black">
                <Clock3 className="h-5 w-5" />
              </div>

              <div>
                <h3 className="text-2xl font-semibold tracking-tight">
                  OPT Radar
                </h3>
                <p className="text-sm text-gray-400">by The AI Solutionist</p>
              </div>
            </div>

            <p className="mt-5 max-w-md text-sm leading-7 text-gray-400">
              Fresh OPT/STEM job intelligence platform with official career
              links, hourly updates, OPT risk signals, and apply confidence
              scoring.
            </p>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-white">Quick Links</h4>

            <div className="mt-5 grid gap-3 text-sm text-gray-400">
              <a href="#why" className="transition hover:text-white">Why It Works</a>
              <a href="#features" className="transition hover:text-white">Features</a>
              <a href="#preview" className="transition hover:text-white">Dashboard Preview</a>
              <a href="#pricing" className="transition hover:text-white">Pricing</a>
              <a href="/login" className="transition hover:text-white">Login</a>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-[#0B1020] p-7">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-300">
              Support
            </p>

            <h4 className="mt-3 text-2xl font-semibold">
              Contact OPT Radar
            </h4>

            <p className="mt-3 text-sm leading-7 text-gray-400">
              For billing, login, subscription, or dashboard access support.
            </p>

            <a
              href={GMAIL_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.035] px-5 py-4 transition hover:bg-white/[0.06]"
            >
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-gray-500">
                  Email
                </p>

                <p className="mt-1 break-all text-base font-semibold text-blue-300">
                  {SUPPORT_EMAIL}
                </p>
              </div>

              <Mail className="h-5 w-5 shrink-0 text-blue-300" />
            </a>
          </div>
        </div>

        <div className="mx-auto mt-10 flex max-w-7xl flex-col gap-4 border-t border-white/10 pt-6 text-sm text-gray-500 md:flex-row md:items-center md:justify-between">
          <p>© 2026 OPT Radar by The AI Solutionist. All rights reserved.</p>

          <div className="flex items-center gap-6">
            <a href="/login" className="hover:text-white">Login</a>
            <a href="#pricing" className="hover:text-white">Pricing</a>
            <a href={GMAIL_LINK} target="_blank" rel="noopener noreferrer" className="hover:text-white">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
