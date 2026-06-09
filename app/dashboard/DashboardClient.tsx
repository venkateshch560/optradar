"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  Clock3,
  FolderOpen,
  GraduationCap,
  MapPin,
  ShieldCheck,
  Heart,
  Send,
  LogOut,
  RotateCcw,
  Bookmark,
  FileText,
  Search,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function DashboardClient({
  jobs = [],
  savedJobs = [],
  appliedJobs = [],
}: {
  jobs?: any[];
  savedJobs?: any[];
  appliedJobs?: any[];
}) {
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [experience, setExperience] = useState("");
  const [category, setCategory] = useState("");
  const [risk, setRisk] = useState("");
  const [quickFilter, setQuickFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [savedIds, setSavedIds] = useState<any[]>([]);
  const [appliedIds, setAppliedIds] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const jobsPerPage = 20;
  const now = Date.now();
  const safeJobs = jobs || [];

  const [lastRefreshed, setLastRefreshed] = useState(
    new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })
  );

  useEffect(() => {
    setLastRefreshed(
      new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      window.location.reload();
    }, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/login";
        return;
      }

      setUserEmail(user.email || "");

      const subRes = await fetch("/api/check-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: user.email,
        }),
      });

      const subData = await subRes.json();

      if (!subData.active) {
        window.location.href = "/pricing";
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("email", user.email)
        .maybeSingle();

      if (profile?.first_name) {
        setUserName(profile.first_name.toUpperCase());
      } else if (profile?.full_name) {
        setUserName(profile.full_name.split(" ")[0].toUpperCase());
      } else {
        setUserName((user.email || "STUDENT").split("@")[0].toUpperCase());
      }

      setSavedIds(
        savedJobs
          .filter((x: any) => x.user_email === user.email)
          .map((x: any) => x.job_id)
      );

      setAppliedIds(
        appliedJobs
          .filter((x: any) => x.user_email === user.email)
          .map((x: any) => x.job_id)
      );

      setLoading(false);
    }

    loadUser();
  }, [savedJobs, appliedJobs]);

  useEffect(() => {
    setCurrentPage(1);
  }, [quickFilter, title, location, experience, category, risk]);

  useEffect(() => {
    function handleFocus() {
      const saved = localStorage.getItem("lastOpenedJob");
      if (!saved) return;

      const job = JSON.parse(saved);

      const applied = window.confirm(
        `Did you apply to ${job.title} at ${job.company}?`
      );

      if (applied && userEmail) {
        fetch("/api/apply-job", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_email: userEmail,
            job_id: job.id,
          }),
        });

        setAppliedIds((prev) => Array.from(new Set([...prev, job.id])));
      }

      localStorage.removeItem("lastOpenedJob");
    }

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [userEmail]);

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  async function saveJob(job: any) {
    if (!userEmail) {
      alert("Please login again.");
      return;
    }

    await fetch("/api/save-job", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_email: userEmail,
        job_id: job.id,
      }),
    });

    setSavedIds((prev) => Array.from(new Set([...prev, job.id])));
  }

  function getJobDate(job: any) {
    return (
      job.first_seen_at ||
      job.last_seen_at ||
      job.scraped_at ||
      job.posted_at ||
      job.created_at
    );
  }

  function getJobAgeGroup(job: any) {
    const dateToCheck = getJobDate(job);
    if (!dateToCheck) return "old";

    const jobTime = new Date(dateToCheck).getTime();
    if (Number.isNaN(jobTime)) return "old";

    const diff = now - jobTime;
    const oneDay = 24 * 60 * 60 * 1000;

    if (diff <= oneDay) return "fresh";
    if (diff <= 3 * oneDay) return "recent";
    if (diff <= 7 * oneDay) return "week";

    return "old";
  }

  function isFreshJob(job: any) {
    return getJobAgeGroup(job) === "fresh";
  }

  function isReviewJob(job: any) {
    return (
      job.opt_status === "Review Required" ||
      job.opt_risk_level === "Medium Risk"
    );
  }

  function isOptFriendly(job: any) {
    return job.opt_status === "OPT Friendly" || job.opt_risk_level === "Low Risk";
  }

  const freshJobs = safeJobs.filter((job) => getJobAgeGroup(job) === "fresh");
  const recentJobs = safeJobs.filter((job) => getJobAgeGroup(job) === "recent");
  const weekJobs = safeJobs.filter((job) => getJobAgeGroup(job) === "week");

  const stats = useMemo(() => {
    return {
      total: safeJobs.filter((job) => getJobAgeGroup(job) !== "old").length,
      fresh: freshJobs.length,
      recent: recentJobs.length,
      week: weekJobs.length,
      saved: savedIds.length,
      applied: appliedIds.length,
      friendly: safeJobs.filter((job) => isOptFriendly(job)).length,
      review: safeJobs.filter((job) => isReviewJob(job)).length,
    };
  }, [safeJobs, savedIds, appliedIds]);

  const filteredJobs = safeJobs
    .filter((job) => {
      const ageGroup = getJobAgeGroup(job);

      if (ageGroup === "old") return false;

      if (quickFilter === "fresh" && ageGroup !== "fresh") return false;
      if (quickFilter === "entry" && job.experience_level !== "Entry Level")
        return false;
      if (quickFilter === "remote" && job.remote !== true) return false;
      if (quickFilter === "friendly" && !isOptFriendly(job)) return false;
      if (quickFilter === "review" && !isReviewJob(job)) return false;
      if (quickFilter === "saved" && !savedIds.includes(job.id)) return false;
      if (quickFilter === "applied" && !appliedIds.includes(job.id))
        return false;

      if (title && !job.title?.toLowerCase().includes(title.toLowerCase()))
        return false;

      if (
        location &&
        !job.location?.toLowerCase().includes(location.toLowerCase())
      )
        return false;

      if (experience && job.experience_level !== experience) return false;
      if (category && job.role_category !== category) return false;
      if (risk && job.opt_risk_level !== risk) return false;

      return true;
    })
    .sort(
      (a, b) =>
        new Date(getJobDate(b) || 0).getTime() -
        new Date(getJobDate(a) || 0).getTime()
    );

  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);

  const paginatedJobs = filteredJobs.slice(
    (currentPage - 1) * jobsPerPage,
    currentPage * jobsPerPage
  );

  function resetFilters() {
    setTitle("");
    setLocation("");
    setExperience("");
    setCategory("");
    setRisk("");
    setQuickFilter("all");
  }

  function formatDate(date: string) {
    if (!date) return "Unknown";
    const diff = now - new Date(date).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;

    return `${Math.floor(hours / 24)}d ago`;
  }

  function riskColor(level: string) {
    if (level === "Low Risk") return "bg-emerald-500/15 text-emerald-300";
    if (level === "Medium Risk") return "bg-amber-500/15 text-amber-300";
    if (level === "High Risk") return "bg-red-500/15 text-red-300";
    return "bg-slate-500/15 text-slate-300";
  }

  function workAuthLabel(job: any) {
    if (isOptFriendly(job)) return "OPT Friendly";
    if (isReviewJob(job)) return "Review Required";
    return "Work Auth Unknown";
  }

  function ageBadge(job: any) {
    const ageGroup = getJobAgeGroup(job);

    if (ageGroup === "fresh") return "Fresh • 24h";
    if (ageGroup === "recent") return "Last 3 Days";
    return "Last 7 Days";
  }

  function experienceText(job: any) {
    if (!job.experience_level || job.experience_level === "Not specified") {
      return "Experience not specified";
    }

    if (job.experience_years === null || job.experience_years === undefined) {
      return job.experience_level;
    }

    if (job.experience_years === 0) return `${job.experience_level} • 0–2 yrs`;

    return `${job.experience_level} • ${job.experience_years}+ yrs`;
  }

  const navItems = [
    { id: "all", label: "All Clean Jobs", icon: FolderOpen },
    { id: "fresh", label: "Fresh 24h", icon: Clock3 },
    { id: "friendly", label: "OPT Friendly", icon: CheckCircle2 },
    { id: "review", label: "Review Required", icon: AlertTriangle },
    { id: "entry", label: "Entry Level", icon: GraduationCap },
    { id: "remote", label: "Remote", icon: MapPin },
    { id: "saved", label: "Saved", icon: Heart },
    { id: "applied", label: "Applied", icon: Send },
  ];

  const pageTitle =
    navItems.find((item) => item.id === quickFilter)?.label || "All Clean Jobs";

  if (loading) {
    return (
      <main className="min-h-screen bg-[#050712] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-white" />
          <p className="mt-6 text-lg text-gray-400">Loading OPT Radar...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050712] text-white">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 shrink-0 border-r border-white/10 bg-[#080B16] p-6 lg:block">
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <h2 className="text-2xl font-bold tracking-tight">OPT Radar</h2>
            <p className="mt-2 text-sm text-gray-400">
              Fresh company career jobs, cleaned for OPT/STEM candidates.
            </p>
          </div>

          <div className="mt-5 rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-4">
            <p className="text-xs font-semibold uppercase text-emerald-300">
              Account
            </p>
            <p className="mt-1 text-lg font-bold text-emerald-300">ACTIVE</p>
          </div>

          <nav className="mt-8 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  onClick={() => setQuickFilter(item.id)}
                  className={
                    quickFilter === item.id
                      ? "flex w-full items-center gap-3 rounded-2xl bg-white text-black px-4 py-3 text-left font-semibold"
                      : "flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-gray-300 hover:bg-white/5 hover:text-white"
                  }
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <button
            onClick={logout}
            className="mt-10 flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 px-4 py-3 text-gray-300 hover:bg-white/5"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </aside>

        <section className="flex-1">
          <header className="border-b border-white/10 bg-[radial-gradient(circle_at_top_left,#1E3A8A_0,#050712_42%)]">
            <div className="mx-auto max-w-7xl px-6 py-8">
              <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-sm font-semibold text-blue-300">
                    OPT / STEM OPT Job Intelligence
                  </p>

                  <h1 className="mt-2 text-3xl font-bold md:text-5xl">
                    {pageTitle}
                  </h1>

                  <p className="mt-4 max-w-3xl text-base leading-7 text-gray-300">
                    Welcome {userName || "STUDENT"}. These jobs are pulled from
                    official company career systems and filtered to remove
                    obvious citizenship, clearance, and no-sponsorship roles.
                  </p>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-300">
                      <span className="h-2 w-2 rounded-full bg-emerald-400" />
                      Cleaned direct employer jobs
                    </div>

                    <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-sm text-blue-300">
                      Last refreshed: {lastRefreshed}
                    </div>

                    <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-4 py-2 text-sm text-amber-300">
                      Review Required means sponsorship was not confirmed
                    </div>
                  </div>
                </div>

                <button
                  onClick={resetFilters}
                  className="rounded-2xl border border-white/10 px-5 py-3 text-sm hover:bg-white/5"
                >
                  Reset View
                </button>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
                {[
                  ["Clean Jobs", stats.total, FolderOpen],
                  ["Fresh 24h", stats.fresh, Clock3],
                  ["OPT Friendly", stats.friendly, CheckCircle2],
                  ["Review", stats.review, AlertTriangle],
                  ["Saved", stats.saved, Bookmark],
                  ["Applied", stats.applied, Send],
                ].map(([label, value, Icon]: any) => (
                  <div
                    key={label}
                    className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-xl"
                  >
                    <div className="mb-3 flex items-center gap-3">
                      <Icon className="h-5 w-5 text-blue-300" />
                      <p className="text-sm text-gray-400">{label}</p>
                    </div>

                    <p className="text-3xl font-bold">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </header>

          <div className="mx-auto max-w-7xl px-6 py-6">
            <div className="mb-6 rounded-3xl border border-white/10 bg-[#080B16]/80 p-4 shadow-2xl backdrop-blur">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
                <div className="relative xl:col-span-2">
                  <Search className="pointer-events-none absolute left-3 top-3.5 h-5 w-5 text-gray-500" />
                  <input
                    className="w-full rounded-2xl border border-white/10 bg-white/5 p-3 pl-10 outline-none placeholder:text-gray-500"
                    placeholder="Search title, e.g. Data Analyst"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <input
                  className="rounded-2xl border border-white/10 bg-white/5 p-3 outline-none placeholder:text-gray-500"
                  placeholder="Location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />

                <select
                  className="rounded-2xl border border-white/10 bg-white/5 p-3 outline-none"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                >
                  <option value="">All Levels</option>
                  <option value="Entry Level">Entry Level</option>
                  <option value="Mid Level">Mid Level</option>
                  <option value="Senior">Senior</option>
                  <option value="Not specified">Not specified</option>
                </select>

                <select
                  className="rounded-2xl border border-white/10 bg-white/5 p-3 outline-none"
                  value={risk}
                  onChange={(e) => setRisk(e.target.value)}
                >
                  <option value="">All Work Auth</option>
                  <option value="Low Risk">OPT Friendly</option>
                  <option value="Medium Risk">Review Required</option>
                </select>

                <button
                  onClick={resetFilters}
                  className="flex items-center justify-center gap-2 rounded-2xl border border-blue-500/20 bg-blue-500/10 px-4 py-3 text-sm text-blue-300 hover:bg-blue-500/20"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </button>
              </div>
            </div>

            <div className="mb-5 flex items-center justify-between">
              <p className="text-sm text-gray-400">
                Showing{" "}
                <span className="font-semibold text-white">
                  {filteredJobs.length}
                </span>{" "}
                cleaned jobs
              </p>

              <p className="text-xs text-gray-500">20 jobs per page</p>
            </div>

            <div className="grid gap-4">
              {paginatedJobs.map((job, index) => {
                const isSaved = savedIds.includes(job.id);
                const isApplied = appliedIds.includes(job.id);
                const friendly = isOptFriendly(job);

                return (
                  <article
                    key={job.id || index}
                    className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#0B1020] to-[#070A12] p-6 shadow-xl transition hover:border-blue-500/40 hover:shadow-blue-500/10"
                  >
                    <div className="flex flex-col gap-5 md:flex-row md:justify-between">
                      <div className="flex-1">
                        <div className="mb-4 flex flex-wrap gap-2">
                          <span className="rounded-full bg-blue-500/15 px-3 py-1 text-xs font-medium text-blue-300">
                            {ageBadge(job)}
                          </span>

                          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-gray-300">
                            {job.ats_platform || "Career Site"}
                          </span>

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${riskColor(
                              job.opt_risk_level
                            )}`}
                          >
                            {workAuthLabel(job)}
                          </span>

                          {isSaved && (
                            <span className="rounded-full bg-purple-500/15 px-3 py-1 text-xs font-medium text-purple-300">
                              Saved
                            </span>
                          )}

                          {isApplied && (
                            <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-300">
                              Applied
                            </span>
                          )}
                        </div>

                        <div className="mb-3 flex items-start gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                            <FileText className="h-5 w-5 text-blue-300" />
                          </div>

                          <div>
                            <h2 className="text-xl font-semibold leading-snug">
                              {job.title || "Untitled Job"}
                            </h2>

                            <p className="mt-1 text-gray-300">
                              {job.company || "Unknown Company"}
                            </p>
                          </div>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-3 text-sm text-gray-500">
                          <span>{job.location || "Location not listed"}</span>
                          <span>•</span>
                          <span>{formatDate(getJobDate(job))}</span>
                          <span>•</span>
                          <span>{job.role_category || "Technology / Business"}</span>
                          <span>•</span>
                          <span className="text-emerald-300">
                            Direct employer source
                          </span>
                        </div>

                        <div className="mt-4 grid gap-3 md:grid-cols-3">
                          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                            <p className="text-xs uppercase text-gray-500">
                              Experience
                            </p>
                            <p className="mt-1 text-sm text-gray-200">
                              {experienceText(job)}
                            </p>
                          </div>

                          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                            <p className="text-xs uppercase text-gray-500">
                              Work Authorization
                            </p>
                            <p
                              className={
                                friendly
                                  ? "mt-1 text-sm text-emerald-300"
                                  : "mt-1 text-sm text-amber-300"
                              }
                            >
                              {workAuthLabel(job)}
                            </p>
                          </div>

                          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                            <p className="text-xs uppercase text-gray-500">
                              Reason
                            </p>
                            <p className="mt-1 text-sm text-gray-300">
                              {job.opt_risk_reason || "No restriction found"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="w-full shrink-0 md:w-56">
                        <button
                          onClick={() => saveJob(job)}
                          disabled={isSaved}
                          className={
                            isSaved
                              ? "mb-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-purple-500/20 bg-purple-500/10 px-5 py-3 text-center font-semibold text-purple-300"
                              : "mb-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 px-5 py-3 text-center font-semibold hover:bg-white/5"
                          }
                        >
                          <Bookmark className="h-4 w-4" />
                          {isSaved ? "Saved ✓" : "Save Job"}
                        </button>

                        <button
                          onClick={() => {
                            localStorage.setItem(
                              "lastOpenedJob",
                              JSON.stringify({
                                id: job.id,
                                title: job.title,
                                company: job.company,
                              })
                            );
                            window.open(job.apply_link || "#", "_blank");
                          }}
                          className={
                            isApplied
                              ? "flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500/20 px-5 py-3 text-center font-semibold text-emerald-300"
                              : "flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-center font-semibold text-black hover:bg-gray-200"
                          }
                        >
                          <ExternalLink className="h-4 w-4" />
                          {isApplied ? "Applied ✓" : "Apply on Company Site"}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}

              {filteredJobs.length > jobsPerPage && (
                <div className="mt-8 flex items-center justify-center gap-3">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="rounded-2xl border border-white/10 px-5 py-3 disabled:opacity-40"
                  >
                    Prev
                  </button>

                  <span className="rounded-2xl bg-white px-4 py-3 text-sm font-bold text-black">
                    {currentPage}
                  </span>

                  <span className="text-sm text-gray-500">of {totalPages}</span>

                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="rounded-2xl border border-white/10 px-5 py-3 disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              )}

              {filteredJobs.length === 0 && (
                <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center">
                  <p className="text-xl font-semibold">No clean jobs found</p>
                  <p className="mt-2 text-gray-400">
                    Run the job fetcher or adjust filters.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
