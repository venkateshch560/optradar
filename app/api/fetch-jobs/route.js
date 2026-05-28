import { fetchGreenhouseJobs } from "@/lib/fetchGreenhouseJobs";
import { fetchLeverJobs } from "@/lib/fetchLeverJobs";
import { fetchAshbyJobs } from "@/lib/fetchAshbyJobs";
import { fetchSmartRecruitersJobs } from "@/lib/fetchSmartRecruitersJobs";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");

  if (secret !== process.env.CRON_SECRET) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const greenhouse = await fetchGreenhouseJobs();
    const lever = await fetchLeverJobs();
    const ashby = await fetchAshbyJobs();
    const smartrecruiters = await fetchSmartRecruitersJobs();

    return Response.json({
      success: true,
      message: "OPT Radar direct ATS jobs updated",
      saved_jobs: greenhouse + lever + ashby + smartrecruiters,
      sources: {
        greenhouse,
        lever,
        ashby,
        smartrecruiters,
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
