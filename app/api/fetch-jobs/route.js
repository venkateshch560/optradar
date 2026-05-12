import { fetchJobs } from "@/lib/fetchJobs";

export async function GET(request) {
  const auth = request.headers.get("authorization");

  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const total = await fetchJobs();

    return Response.json({
      success: true,
      saved_jobs: total
    });
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: error.message
      },
      { status: 500 }
    );
  }
}