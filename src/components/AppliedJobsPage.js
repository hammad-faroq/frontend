import React, { useEffect, useState } from "react";
import { getAppliedJobs } from "../services/api";

function AppliedJobsPage({ navigate }) {
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAppliedJobs();
  }, []);

  const fetchAppliedJobs = async () => {
    try {
      setLoading(true);
      const data = await getAppliedJobs();
      setAppliedJobs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("Failed to load applied jobs.");
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <p className="text-gray-500 text-center mt-10 animate-pulse">
        Loading your applied jobs...
      </p>
    );

  if (error)
    return (
      <p className="text-center text-red-600 mt-10">
        ❌ {error || "Something went wrong."}
      </p>
    );

  return (
    <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6 mt-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        Your Applied Jobs
      </h2>

      {appliedJobs.length === 0 ? (
        <p className="text-gray-600 text-center py-10">
          You haven’t applied to any jobs yet.
        </p>
      ) : (
        <ul className="divide-y divide-gray-200">
          {appliedJobs.map((job) => (
            <li
              key={job.id}
              className="py-4 flex justify-between items-center hover:bg-gray-50 px-3 rounded-lg transition"
            >
              <div>
                <p className="font-semibold text-gray-800">{job.title}</p>
                <p className="text-sm text-gray-600">
                  {job.company_name} — {job.location}
                </p>
                <p className="text-xs text-gray-500">
                  Applied on:{" "}
                  {job.applied_at
                    ? new Date(job.applied_at).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
              <button
                onClick={() => navigate(`/jobs/${job.id}`)}
                className="text-blue-600 hover:underline"
              >
                View Job
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default AppliedJobsPage;
