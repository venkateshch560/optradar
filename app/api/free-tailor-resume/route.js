import {
  analyzeResumeMatch,
  generateFreeTailoredResume
} from "@/lib/freeResumeTailor";

export async function POST(request) {
  const { resumeText, jobDescription } = await request.json();

  if (!resumeText || !jobDescription) {
    return Response.json(
      { success: false, error: "Resume and job description are required" },
      { status: 400 }
    );
  }

  return Response.json({
    success: true,
    analysis: analyzeResumeMatch(resumeText, jobDescription),
    tailoredResume: generateFreeTailoredResume(resumeText, jobDescription)
  });
}
