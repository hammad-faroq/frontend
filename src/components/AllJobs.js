import React, { useState, useEffect } from "react";
import { listJobs, deleteJob } from "../services/api";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

function AllJobs({ user }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login"); // 🔐 redirect to login if not authenticated
      return;
    }
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const data = await listJobs();
      setJobs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching jobs:", err);
      setError("⚠️ Failed to load job listings.");
    } finally {
      setLoading(false);
    }
  };

  const handleViewJob = (jobId) => {
    navigate(`/jobs/${jobId}`); // 🔗 navigate to detailed JobApplicationPage
  };

  const handleDeleteJob = async (jobId) => {
    if (window.confirm("Are you sure you want to delete this job?")) {
      try {
        await deleteJob(jobId);
        fetchJobs();
      } catch (err) {
        console.error(err);
        toast.error("Failed to delete job.");
      }
    }
  };

  if (loading)
    return (
      <p className="text-gray-500 text-center mt-10 animate-pulse">
        Loading job listings...
      </p>
    );

  if (error)
    return <p className="text-center text-red-500 mt-10 font-medium">{error}</p>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        {user?.role === "hr" ? "Your Posted Jobs" : "Available Job Opportunities"}
      </h2>

      {jobs.length === 0 ? (
        <p className="text-gray-500 text-center">No jobs found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="bg-white shadow-md rounded-xl p-5 hover:shadow-lg transition relative"
            >
              <div
                className="cursor-pointer"
                onClick={() => handleViewJob(job.id)}
              >
                <h3 className="text-xl font-semibold text-gray-800 mb-1">
                  {job.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {job.company_name || "Unknown Company"}
                </p>
                <p className="text-gray-500 text-sm mb-2">
                  📍 {job.location || "Remote"}
                </p>
                <p className="text-xs text-gray-400">
                  Deadline:{" "}
                  {job.application_deadline
                    ? job.application_deadline
                    : "Not specified"}
                </p>
              </div>

              {user?.role === "hr" && (
                <button
                  onClick={() => handleDeleteJob(job.id)}
                  className="absolute top-2 right-3 text-red-500 hover:text-red-700 text-sm"
                  title="Delete Job"
                >
                  🗑️
                </button>
              )}

              <div className="mt-4 flex justify-between items-center">
                <button
                  onClick={() => handleViewJob(job.id)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View Details →
                </button>
                {user?.role === "hr" && (
                  <span className="text-xs text-gray-400">Posted by you</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AllJobs;
