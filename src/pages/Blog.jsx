import React from "react";

export default function Blog() {
  const posts = [
    {
      title: "How TalentMatch AI Uses AI to Match Candidates with Jobs",
      desc: "Learn how our AI analyzes resumes, skills, and job descriptions to find the perfect fit in seconds.",
      tag: "AI Matching",
    },
    {
      title: "The Future of Hiring: Why Traditional Recruitment is Broken",
      desc: "Discover why manual CV screening is outdated and how AI is fixing hiring inefficiencies.",
      tag: "Recruitment",
    },
    {
      title: "How to Optimize Your Resume for AI Hiring Systems",
      desc: "Tips to make your resume stand out in AI-based job screening platforms like TalentMatch.",
      tag: "Job Seekers",
    },
    {
      title: "Reducing Hiring Time by 70% with Automation",
      desc: "See how companies are saving time using automated screening, ranking, and candidate filtering.",
      tag: "HR Tools",
    },
    {
      title: "Top Skills AI Hiring Systems Look for in 2026",
      desc: "Understand what AI-driven recruitment platforms prioritize when ranking candidates.",
      tag: "Career Tips",
    },
    {
      title: "Inside TalentMatch AI: How Our Matching Engine Works",
      desc: "A behind-the-scenes look at our ML-based ranking system and job-candidate scoring model.",
      tag: "Technology",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">

      {/* HERO */}
      <div className="text-center py-16 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <h1 className="text-4xl font-bold">TalentMatch AI Blog</h1>
        <p className="mt-3 text-indigo-100 max-w-2xl mx-auto">
          Insights on AI-powered hiring, recruitment automation, resume optimization, and future of work.
        </p>
      </div>

      {/* FEATURED ARTICLE */}
      <div className="max-w-5xl mx-auto mt-10 px-6">
        <div className="bg-white shadow-lg rounded-2xl p-6 border">
          <span className="text-sm text-indigo-600 font-semibold">
            Featured
          </span>
          <h2 className="text-2xl font-bold mt-2">
            How AI is Transforming Recruitment in TalentMatch AI
          </h2>
          <p className="text-gray-600 mt-2">
            TalentMatch AI uses machine learning to automatically screen candidates,
            rank them based on skills, and match them with the most relevant job opportunities —
            reducing hiring time and improving accuracy.
          </p>
          <button className="mt-4 px-5 py-2 bg-indigo-600 text-white rounded-lg">
            Read More
          </button>
        </div>
      </div>

      {/* BLOG GRID */}
      <div className="max-w-6xl mx-auto px-6 py-12 grid md:grid-cols-3 gap-6">

        {posts.map((post, index) => (
          <div
            key={index}
            className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition"
          >
            <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded">
              {post.tag}
            </span>

            <h2 className="font-bold mt-3 text-lg">{post.title}</h2>

            <p className="text-gray-600 text-sm mt-2">
              {post.desc}
            </p>

            <button className="mt-4 text-indigo-600 font-semibold text-sm">
              Read More →
            </button>
          </div>
        ))}
      </div>

    </div>
  );
}