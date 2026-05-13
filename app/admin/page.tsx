import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ key?: string }>;
}) {
  const params = await searchParams;

  if (params.key !== process.env.ADMIN_KEY) {
    return (
      <main className="min-h-screen bg-[#050712] text-white flex items-center justify-center">
        <h1 className="text-4xl font-bold">Unauthorized</h1>
      </main>
    );
  }

  const { data: subscriptions } = await supabase
    .from("subscriptions")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: saved } = await supabase
    .from("saved_jobs")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: applied } = await supabase
    .from("applied_jobs")
    .select("*")
    .order("created_at", { ascending: false });

  const users = subscriptions || [];
  const savedJobs = saved || [];
  const appliedJobs = applied || [];

  const userRows = users.map((user: any) => {
    const email = user.user_email;

    const savedCount = savedJobs.filter(
      (item: any) => item.user_email === email
    ).length;

    const appliedCount = appliedJobs.filter(
      (item: any) => item.user_email === email
    ).length;

    return {
      email,
      active: user.active,
      status: user.status || "unknown",
      savedCount,
      appliedCount,
      createdAt: user.created_at,
    };
  });

  const activeUsers = users.filter((u: any) => u.active === true).length;
  const inactiveUsers = users.length - activeUsers;

  return (
    <main className="min-h-screen bg-[#050712] text-white">
      <div className="border-b border-white/10 bg-[#0B1020]">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <p className="text-sm font-semibold text-blue-300">
            OPT Radar Admin
          </p>

          <h1 className="mt-2 text-5xl font-bold">
            User Analytics
          </h1>

          <p className="mt-3 text-gray-400">
            Track users, subscriptions, saved jobs,
            and applied activity.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid gap-5 md:grid-cols-4">
          <Card title="Total Users" value={users.length} />

          <Card
            title="Active Paid Users"
            value={activeUsers}
          />

          <Card
            title="Inactive Users"
            value={inactiveUsers}
          />

          <Card
            title="Total Applied"
            value={appliedJobs.length}
          />
        </div>

        <div className="mt-8 rounded-3xl border border-white/10 bg-[#0B1020] p-6">
          <h2 className="text-2xl font-bold">
            User Performance
          </h2>

          <p className="mt-2 text-sm text-gray-400">
            See how each user is engaging with the platform.
          </p>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="border-b border-white/10 text-gray-400">
                <tr>
                  <th className="py-4 pr-4">Email</th>
                  <th className="py-4 pr-4">Subscription</th>
                  <th className="py-4 pr-4">Status</th>
                  <th className="py-4 pr-4">Saved Jobs</th>
                  <th className="py-4 pr-4">Applied Jobs</th>
                  <th className="py-4 pr-4">Joined</th>
                </tr>
              </thead>

              <tbody>
                {userRows.map((user: any) => (
                  <tr
                    key={user.email}
                    className="border-b border-white/5"
                  >
                    <td className="py-4 pr-4 font-medium">
                      {user.email}
                    </td>

                    <td className="py-4 pr-4">
                      <span
                        className={
                          user.active
                            ? "rounded-full bg-green-500/15 px-3 py-1 text-green-300"
                            : "rounded-full bg-red-500/15 px-3 py-1 text-red-300"
                        }
                      >
                        {user.active ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td className="py-4 pr-4 text-gray-300">
                      {user.status}
                    </td>

                    <td className="py-4 pr-4">
                      {user.savedCount}
                    </td>

                    <td className="py-4 pr-4">
                      {user.appliedCount}
                    </td>

                    <td className="py-4 pr-4 text-gray-400">
                      {user.createdAt
                        ? new Date(
                            user.createdAt
                          ).toLocaleDateString()
                        : "Unknown"}
                    </td>
                  </tr>
                ))}

                {userRows.length === 0 && (
                  <tr>
                    <td
                      className="py-8 text-gray-400"
                      colSpan={6}
                    >
                      No users yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <Activity
            title="Recent Saved Activity"
            rows={savedJobs.slice(0, 8)}
          />

          <Activity
            title="Recent Applied Activity"
            rows={appliedJobs.slice(0, 8)}
          />
        </div>
      </div>
    </main>
  );
}

function Card({
  title,
  value,
}: {
  title: string;
  value: number;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-[#0B1020] p-6">
      <p className="text-sm text-gray-400">
        {title}
      </p>

      <p className="mt-3 text-5xl font-bold">
        {value}
      </p>
    </div>
  );
}

function Activity({
  title,
  rows,
}: {
  title: string;
  rows: any[];
}) {
  return (
    <section className="rounded-3xl border border-white/10 bg-[#0B1020] p-6">
      <h2 className="text-2xl font-bold">
        {title}
      </h2>

      <div className="mt-5 space-y-3">
        {rows.length === 0 ? (
          <p className="text-gray-400">
            No activity yet.
          </p>
        ) : (
          rows.map((row: any, index: number) => (
            <div
              key={index}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
            >
              <p className="font-medium">
                {row.user_email}
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Job ID: {row.job_id} •{" "}
                {new Date(
                  row.created_at
                ).toLocaleString()}
              </p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
