import { fetchJobs } from "@/lib/fetchJobs";
import { fetchGreenhouseJobs } from "@/lib/fetchGreenhouseJobs";
import { fetchLeverJobs } from "@/lib/fetchLeverJobs";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");

  if (secret !== process.env.CRON_SECRET) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const greenhouse = await fetchGreenhouseJobs();
    const lever = await fetchLeverJobs();

    let jsearch = 0;

    try {
      jsearch = await fetchJobs();
    } catch (err) {
      console.log("JSEARCH SKIPPED:", err.message);
    }

    return Response.json({
      success: true,
      saved_jobs: greenhouse + lever + jsearch,
      sources: {
        greenhouse,
        lever,
        jsearch,
      },
    });
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
