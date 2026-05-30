import { createClient } from "@supabase/supabase-js";
import DashboardClient from "./DashboardClient";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function DashboardPage() {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data: jobs } = await supabase
    .from("jobs")
    .select("*")
    .neq("opt_status", "Not Eligible")
    .eq("is_active", true)
    .gte("first_seen_at", sevenDaysAgo.toISOString())
    .order("first_seen_at", { ascending: false })
    .limit(1000);

  const { data: savedJobs } = await supabase.from("saved_jobs").select("*");
  const { data: appliedJobs } = await supabase.from("applied_jobs").select("*");

  return (
    <DashboardClient
      jobs={jobs || []}
      savedJobs={savedJobs || []}
      appliedJobs={appliedJobs || []}
    />
  );
}
