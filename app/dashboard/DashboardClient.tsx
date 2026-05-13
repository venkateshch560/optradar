"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

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
  const [view, setView] = useState("all");
  const [quickFilter, setQuickFilter] = useState("dashboard");

  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [savedIds, setSavedIds] = useState<any[]>([]);
  const [appliedIds, setAppliedIds] = useState<any[]>([]);

  const safeJobs = jobs || [];
  const now = Date.now();

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
        .single();

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
    }

    loadUser();
  }, [savedJobs, appliedJobs]);

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
        alert("Application saved in Applied Jobs.");
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
    alert("Job saved.");
  }

  function isFreshJob(job: any) {
    return now - new Date(job.created_at).getTime() <= 24 * 60 * 60 * 1000;
  }

  const stats = useMemo(() => {
    return {
      total: safeJobs.length,
      fresh: safeJobs.filter((job) => isFreshJob(job)).length,
      older: safeJobs.filter((job) => !isFreshJob(job)).length,
      saved: savedIds.length,
      applied: appliedIds.length,
      strong: safeJobs.filter((job) => (job.apply_confidence || 50) >= 75).length,
      lowRisk: safeJobs.filter((job) => job.opt_risk_level === "Low Risk").length,
    };
  }, [safeJobs, savedIds, appliedIds]);

  const filteredJobs = safeJobs.filter((job) => {
    const fresh = isFreshJob(job);

    if (quickFilter === "dashboard") return false;
    if (quickFilter === "fresh" && !fresh) return false;
    if (quickFilter === "older" && fresh) return false;
    if (quickFilter === "entry" && job.experience_level !== "Entry Level") return false;
    if (quickFilter === "remote" && job.remote !== true) return false;
    if (quickFilter === "lowrisk" && job.opt_risk_level !== "Low Risk") return false;
    if (quickFilter === "strong" && (job.apply_confidence || 50) < 75) return false;
    if (quickFilter === "saved" && !savedIds.includes(job.id)) return false;
    if (quickFilter === "applied" && !appliedIds.includes(job.id)) return false;

    if (view === "fresh" && !fresh) return false;
    if (view === "older" && fresh) return false;

    if (title && !job.title?.toLowerCase().includes(title.toLowerCase())) return false;
    if (location && !job.location?.toLowerCase().includes(location.toLowerCase())) return false;
    if (experience && job.experience_level !== experience) return false;
    if (category && job.role_category !== category) return false;
    if (risk && job.opt_risk_level !== risk) return false;

    return true;
  });

  function resetFilters() {
    setTitle("");
    setLocation("");
    setExperience("");
    setCategory("");
    setRisk("");
    setView("all");
    setQuickFilter("dashboard");
  }

  function formatDate(date: string) {
    if (!date) return "Unknown";
    const diff = now - new Date(date).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  }

  function confidenceColor(score: number) {
    if (score >= 75) return "border-green-500/30 bg-green-500/10 text-green-300";
    if (score >= 55) return "border-yellow-500/30 bg-yellow-500/10 text-yellow-300";
    return "border-red-500/30 bg-red-500/10 text-red-300";
  }

  function riskColor(level: string) {
    if (level === "Low Risk") return "bg-green-500/15 text-green-300";
    if (level === "Medium Risk") return "bg-yellow-500/15 text-yellow-300";
    if (level === "High Risk") return "bg-red-500/15 text-red-300";
    return "bg-gray-500/15 text-gray-300";
  }

  function experienceText(job: any) {
    if (
      !job.experience_level ||
      job.experience_level === "Not specified" ||
      job.experience_level === "Experience not listed by employer"
    ) {
      return "Experience not listed by employer";
    }

    if (job.experience_years === null || job.experience_years === undefined) {
      return job.experience_level;
    }

    if (job.experience_years === 0) return `${job.experience_level} • 0–2 yrs`;

    return `${job.experience_level} • ${job.experience_years}+ yrs`;
  }

  const navItems = [
    { id: "dashboard", label: "Dashboard" },
    { id: "fresh", label: "Fresh Jobs" },
    { id: "older", label: "Older Jobs" },
    { id: "entry", label: "Entry Level" },
    { id: "remote", label: "Remote Jobs" },
    { id: "lowrisk", label: "Low OPT Risk" },
    { id: "strong", label: "Strong Matches" },
    { id: "saved", label: "Saved Jobs" },
    { id: "applied", label: "Applied Jobs" },
  ];

  const pageTitle =
    quickFilter === "dashboard"
      ? `WELCOME ${userName || "Student"}`
      : navItems.find((item) => item.id === quickFilter)?.label || "Jobs";

  return (
    <main className="min-h-screen bg-[#070A12] text-white">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 shrink-0 border-r border-white/10 bg-[#0B1020] p-6 lg:block">
          <h2 className="text-2xl font-bold leading-tight">OPT Radar</h2>
          <p className="mt-2 text-sm text-gray-400">Job Intelligence Platform</p>

          <nav className="mt-8 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setQuickFilter(item.id)}
                className={
                  quickFilter === item.id
                    ? "w-full rounded-xl bg-white/10 px-4 py-3 text-left font-medium"
                    : "w-full rounded-xl px-4 py-3 text-left text-gray-300 hover:bg-white/5"
                }
              >
                {item.label}
              </button>
            ))}
          </nav>

          <button
            onClick={logout}
            className="mt-10 w-full rounded-xl border border-white/10 px-4 py-3 text-gray-300 hover:bg-white/5"
          >
            Logout
          </button>
        </aside>

        <section className="flex-1">
          <header className="border-b border-white/10 bg-gradient-to-br from-[#111827] via-[#0B1020] to-[#070A12]">
            <div className="mx-auto max-w-7xl px-6 py-8">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-semibold text-blue-300">
                    OPT / STEM OPT Job Intelligence
                  </p>

                  <h1 className="mt-2 text-3xl font-bold md:text-4xl">
                    {pageTitle}
                  </h1>

                  <p className="mt-3 max-w-3xl text-gray-400">
                    Track fresh jobs, saved roles, direct applications, and low-risk OPT opportunities from one clean workspace.
                  </p>
                </div>

                <button
                  onClick={resetFilters}
                  className="rounded-xl border border-white/10 px-4 py-3 text-sm hover:bg-white/5"
                >
                  Dashboard Home
                </button>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                {[
                  ["Fresh Jobs", stats.fresh],
                  ["Older Jobs", stats.older],
                  ["Saved Jobs", stats.saved],
                  ["Applied Jobs", stats.applied],
                  ["Low OPT Risk", stats.lowRisk],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-white/10 bg-white/5 p-5"
                  >
                    <p className="text-sm text-gray-400">{label}</p>
                    <p className="mt-2 text-3xl font-bold">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </header>

          <div className="mx-auto max-w-7xl px-6 py-6">
            {quickFilter === "dashboard" ? (
              <div className="grid gap-6 xl:grid-cols-3">
                <div className="rounded-3xl border border-white/10 bg-[#0B1020] p-8 xl:col-span-2">
                  <h2 className="text-3xl font-bold">Today’s Job Search Command Center</h2>
                  <p className="mt-4 text-gray-400 leading-7">
                    Start with Fresh Jobs, save roles you like, apply directly, and when you return, OPT Radar will ask whether you applied and move it into Applied Jobs.
                  </p>

                  <div className="mt-8 grid gap-4 md:grid-cols-2">
                    <button onClick={() => setQuickFilter("fresh")} className="rounded-2xl border border-green-500/20 bg-green-500/10 p-6 text-left hover:bg-green-500/20">
                      <p className="text-xl font-bold text-green-300">Fresh Jobs</p>
                      <p className="mt-2 text-sm text-gray-300">New jobs from the last 24 hours.</p>
                    </button>

                    <button onClick={() => setQuickFilter("older")} className="rounded-2xl border border-gray-500/20 bg-gray-500/10 p-6 text-left hover:bg-gray-500/20">
                      <p className="text-xl font-bold text-gray-300">Older Jobs</p>
                      <p className="mt-2 text-sm text-gray-300">Jobs older than 24 hours.</p>
                    </button>

                    <button onClick={() => setQuickFilter("saved")} className="rounded-2xl border border-purple-500/20 bg-purple-500/10 p-6 text-left hover:bg-purple-500/20">
                      <p className="text-xl font-bold text-purple-300">Saved Jobs</p>
                      <p className="mt-2 text-sm text-gray-300">Roles you want to review later.</p>
                    </button>

                    <button onClick={() => setQuickFilter("applied")} className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-6 text-left hover:bg-emerald-500/20">
                      <p className="text-xl font-bold text-emerald-300">Applied Jobs</p>
                      <p className="mt-2 text-sm text-gray-300">Applications you confirmed after opening apply links.</p>
                    </button>
                  </div>
                </div>

                <div className="rounded-3xl border border-white/10 bg-[#0B1020] p-8">
                  <h3 className="text-2xl font-bold">How to use it</h3>
                  <div className="mt-6 space-y-4 text-gray-300">
                    <p>1. Open Fresh Jobs.</p>
                    <p>2. Save jobs you like.</p>
                    <p>3. Click Apply Direct.</p>
                    <p>4. Return and confirm if you applied.</p>
                    <p>5. Track everything in Saved and Applied Jobs.</p>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-6 rounded-2xl border border-white/10 bg-[#0B1020] p-5 shadow-xl">
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
                    <input className="rounded-xl border border-white/10 bg-white/5 p-3 outline-none placeholder:text-gray-500" placeholder="Job title" value={title} onChange={(e) => setTitle(e.target.value)} />
                    <input className="rounded-xl border border-white/10 bg-white/5 p-3 outline-none placeholder:text-gray-500" placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} />

                    <select className="rounded-xl border border-white/10 bg-white/5 p-3 outline-none" value={experience} onChange={(e) => setExperience(e.target.value)}>
                      <option value="">All Levels</option>
                      <option value="Entry Level">Entry Level</option>
                      <option value="Mid Level">Mid Level</option>
                      <option value="Senior">Senior</option>
                      <option value="Lead / Manager">Lead / Manager</option>
                      <option value="Experience not listed by employer">Not listed</option>
                    </select>

                    <select className="rounded-xl border border-white/10 bg-white/5 p-3 outline-none" value={category} onChange={(e) => setCategory(e.target.value)}>
                      <option value="">All Categories</option>
                      <option value="Data / Analytics">Data / Analytics</option>
                      <option value="Software / Engineering">Software / Engineering</option>
                      <option value="Cloud / DevOps">Cloud / DevOps</option>
                      <option value="Business / Product">Business / Product</option>
                      <option value="IT Support">IT Support</option>
                      <option value="Project / Operations">Project / Operations</option>
                      <option value="Other">Other</option>
                    </select>

                    <select className="rounded-xl border border-white/10 bg-white/5 p-3 outline-none" value={risk} onChange={(e) => setRisk(e.target.value)}>
                      <option value="">All OPT Risk</option>
                      <option value="Low Risk">Low Risk</option>
                      <option value="Medium Risk">Medium Risk</option>
                      <option value="High Risk">High Risk</option>
                    </select>

                    <select className="rounded-xl border border-white/10 bg-white/5 p-3 outline-none" value={view} onChange={(e) => setView(e.target.value)}>
                      <option value="all">All Jobs in Section</option>
                      <option value="fresh">Fresh — Last 24h</option>
                      <option value="older">Older Jobs</option>
                    </select>
                  </div>
                </div>

                <p className="mb-4 text-gray-400">
                  Showing <span className="font-semibold text-white">{filteredJobs.length}</span> jobs
                </p>

                <div className="grid gap-4">
                  {filteredJobs.map((job, index) => {
                    const confidence = job.apply_confidence ?? 50;
                    const isSaved = savedIds.includes(job.id);
                    const isApplied = appliedIds.includes(job.id);

                    return (
                      <article key={job.id || index} className="rounded-2xl border border-white/10 bg-[#0B1020] p-5 shadow-lg transition hover:border-blue-500/40">
                        <div className="flex flex-col gap-5 md:flex-row md:justify-between">
                          <div className="flex-1">
                            <div className="mb-3 flex flex-wrap gap-2">
                              <span className="rounded-full bg-green-500/15 px-3 py-1 text-xs font-medium text-green-300">{isFreshJob(job) ? "Fresh" : "Older"}</span>
                              <span className="rounded-full bg-blue-500/15 px-3 py-1 text-xs font-medium text-blue-300">Direct Employer</span>
                              {isSaved && <span className="rounded-full bg-purple-500/15 px-3 py-1 text-xs font-medium text-purple-300">Saved</span>}
                              {isApplied && <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-300">Applied</span>}
                              <span className={`rounded-full px-3 py-1 text-xs font-medium ${riskColor(job.opt_risk_level)}`}>{job.opt_risk_level || "OPT Risk Unknown"}</span>
                              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-gray-300">{job.apply_ease || "Standard Apply"}</span>
                            </div>

                            <h2 className="text-xl font-semibold">{job.title || "Untitled Job"}</h2>
                            <p className="mt-2 text-gray-300">{job.company || "Unknown Company"}</p>

                            <div className="mt-3 flex flex-wrap gap-3 text-sm text-gray-500">
                              <span>{job.location || "Location not listed"}</span>
                              <span>•</span>
                              <span>{formatDate(job.created_at)}</span>
                              <span>•</span>
                              <span>{job.role_category || "Other"}</span>
                              <span>•</span>
                              <span>{job.ats_platform || "Career Site"}</span>
                            </div>

                            <div className="mt-4 flex flex-wrap gap-2">
                              <span className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-300">{experienceText(job)}</span>
                              <span className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-300">Sponsorship Chance: {job.sponsorship_chance || "Unknown"}</span>
                              {job.opt_risk_reason && <span className="rounded-xl border border-yellow-500/20 bg-yellow-500/10 px-3 py-2 text-sm text-yellow-300">Note: {job.opt_risk_reason}</span>}
                            </div>
                          </div>

                          <div className="w-full shrink-0 md:w-48">
                            <div className={`mb-3 rounded-2xl border p-4 text-center ${confidenceColor(confidence)}`}>
                              <p className="text-sm">Apply Confidence</p>
                              <p className="mt-1 text-3xl font-bold">{confidence}%</p>
                            </div>

                            <button onClick={() => saveJob(job)} disabled={isSaved} className={isSaved ? "mb-3 block w-full rounded-xl border border-purple-500/20 bg-purple-500/10 px-5 py-3 text-center font-semibold text-purple-300" : "mb-3 block w-full rounded-xl border border-white/10 px-5 py-3 text-center font-semibold hover:bg-white/5"}>
                              {isSaved ? "Saved ✓" : "Save Job"}
                            </button>

                            <button onClick={() => {
                              localStorage.setItem("lastOpenedJob", JSON.stringify({ id: job.id, title: job.title, company: job.company }));
                              window.open(job.apply_link || "#", "_blank");
                            }} className={isApplied ? "block w-full rounded-xl bg-emerald-500/20 px-5 py-3 text-center font-semibold text-emerald-300" : "block w-full rounded-xl bg-white px-5 py-3 text-center font-semibold text-black hover:bg-gray-200"}>
                              {isApplied ? "Applied ✓" : "Apply Direct"}
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}

                  {filteredJobs.length === 0 && (
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center">
                      <p className="text-xl font-semibold">No jobs found</p>
                      <p className="mt-2 text-gray-400">Try another section or remove filters.</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
