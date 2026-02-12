import React, { useState, useEffect } from "react";
import { getJobDetail, applyToJob } from "../services/api";
import { useParams, useNavigate } from "react-router-dom";

function JobApplicationPage() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchJob();
  }, [jobId]);

  const fetchJob = async () => {
    try {
      setLoading(true);
      const data = await getJobDetail(jobId);
      setJob(data);
    } catch {
      setMessage("Failed to load job details.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const file = e.target.resume.files[0];
    if (!file) {
      setMessage("Please select a CV file before applying.");
      return;
    }

    try {
      setSubmitting(true);
      const result = await applyToJob(jobId, file);

      if (result.status === "already_applied") {
        setMessage("⚠️ You’ve already applied for this job.");
      } else if (result.status === "success") {
        setMessage("✅ Application submitted successfully!");
      } else {
        setMessage("❌ Failed to apply. Try again later.");
      }
    } catch {
      setMessage("❌ Failed to apply.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return <p className="text-gray-500 animate-pulse">Loading job details...</p>;

  if (!job)
    return (
      <div className="text-center mt-10">
        <p className="text-red-500">{message || "Job not found."}</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
        >
          Back
        </button>
      </div>
    );

  return (
    <div className="max-w-2xl mx-auto bg-white shadow-md rounded-lg p-6 mt-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">{job.title}</h2>
      <p className="text-gray-600 mb-4">{job.location}</p>
      <p className="text-gray-700 mb-6">{job.description}</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 mb-1">Upload your CV:</label>
          <input
            type="file"
            name="resume"
            accept=".pdf,.doc,.docx"
            className="border rounded p-2 w-full"
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
        >
          {submitting ? "Submitting..." : "Submit Application"}
        </button>
      </form>

      {message && (
        <div
          className={`mt-4 text-center font-medium ${
            message.includes("✅")
              ? "text-green-600"
              : message.includes("⚠️")
              ? "text-yellow-600"
              : "text-red-600"
          }`}
        >
          {message}
        </div>
      )}

      <div className="text-center mt-6">
        <button
          onClick={() => navigate(-1)}
          className="text-blue-600 hover:underline"
        >
          ← Back to Jobs
        </button>
      </div>
    </div>
  );
}

export default JobApplicationPage;
