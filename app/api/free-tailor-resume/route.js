import { generateFreeTailoredResume, analyzeResumeMatch } from "@/lib/freeResumeTailor";

export async function POST(request) {
  try {
    const { resumeText, jobDescription } = await request.json();

    if (!resumeText || !jobDescription) {
      return Response.json(
        { error: "Resume text and job description are required" },
        { status: 400 }
      );
    }

    const analysis = analyzeResumeMatch(resumeText, jobDescription);
    const tailoredResume = generateFreeTailoredResume(resumeText, jobDescription);

    return Response.json({
      success: true,
      analysis,
      tailoredResume
    });
  } catch (error) {
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
