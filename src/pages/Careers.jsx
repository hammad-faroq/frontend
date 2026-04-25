import React from "react";

export default function Careers() {
  const jobs = [
    {
      title: "Frontend Developer (React)",
      desc: "Build UI for AI-powered hiring platform using React and Tailwind.",
    },
    {
      title: "AI/ML Engineer",
      desc: "Work on resume matching, ranking algorithms, and AI recommendation system.",
    },
    {
      title: "Backend Developer (Django)",
      desc: "Develop APIs for jobs, users, authentication, and AI engine.",
    },
    {
      title: "Product Manager",
      desc: "Lead product design and improve AI recruitment experience.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-10">

      {/* HERO */}
      <h1 className="text-4xl font-bold text-center">
        Join TalentMatch AI
      </h1>

      <p className="text-center text-gray-600 mt-3">
        Build the future of AI-powered hiring with us
      </p>

      {/* JOB LIST */}
      <div className="mt-10 max-w-3xl mx-auto space-y-4">

        {jobs.map((job, index) => (
          <div key={index} className="p-5 bg-white rounded-xl shadow border">

            <h2 className="text-xl font-semibold">{job.title}</h2>

            <p className="text-gray-600 text-sm mt-1">
              {job.desc}
            </p>

            {/* NON-CLICKABLE TEXT (NOT BUTTON) */}
            <p className="mt-3 text-indigo-600 font-semibold text-sm">
              Login to apply for this job
            </p>

          </div>
        ))}

      </div>
    </div>
  );
}