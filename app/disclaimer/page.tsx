export default function DisclaimerPage() {
  return (
    <main className="min-h-screen bg-[#050712] text-white px-6 py-20">

      <div className="mx-auto max-w-4xl">

        <h1 className="text-5xl font-bold">
          Disclaimer
        </h1>

        <div className="mt-10 space-y-8 text-gray-300 leading-8">

          <p>
            OPT Radar is a job intelligence and aggregation platform.
          </p>

          <p>
            We do not create, post, sponsor, or guarantee any job opportunities listed on the platform.
          </p>

          <p>
            All job postings originate from publicly available employer career pages,
            ATS systems, or external job sources.
          </p>

          <p>
            Sponsorship insights, OPT risk analysis, apply confidence scores,
            and AI recommendations are automated informational estimates only.
          </p>

          <p>
            Users must independently verify all employer requirements,
            visa eligibility rules, and job application information.
          </p>

          <p>
            OPT Radar is not responsible for:
          </p>

          <ul className="list-disc pl-8 space-y-3">

            <li>Hiring decisions</li>
            <li>Rejected applications</li>
            <li>Employer actions</li>
            <li>Expired or removed jobs</li>
            <li>Sponsorship denials</li>
            <li>Visa outcomes</li>
            <li>Third-party platform issues</li>
            <li>Application losses or missed opportunities</li>

          </ul>

          <p>
            Use of the platform is entirely at the user's own discretion and responsibility.
          </p>

        </div>

      </div>

    </main>
  );
}