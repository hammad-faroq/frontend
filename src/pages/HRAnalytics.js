import React, { useEffect, useState } from "react";
import { getHRJobs } from "../services/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import { BriefcaseIcon, UsersIcon } from "@heroicons/react/24/outline";

function HRAnalytics() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { logout } = useAuth();

  // ✅ Logout handler
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // ✅ Fetch jobs on component mount
  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const data = await getHRJobs();
      setJobs(data);
    } catch (err) {
      console.error("Failed to fetch HR jobs:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Show loading spinner while data is fetched
  if (loading)
    return (
      <div className="flex min-h-screen">
        <Sidebar handleLogout={handleLogout} navigate={navigate} />
        <div className="flex-1 flex justify-center items-center h-screen text-gray-600 bg-gray-50">
          <div className="text-center">
            <div className="animate-spin h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-lg font-medium">Loading analytics...</p>
          </div>
        </div>
      </div>
    );

  return (
    <div className="flex min-h-screen">
      {/* Sidebar Section */}
      <Sidebar handleLogout={handleLogout} navigate={navigate} />

      {/* Main Dashboard */}
      <div className="flex-1 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 px-8 py-10">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <header className="mb-10">
            <h2 className="text-4xl font-bold text-gray-800 mb-2 flex items-center gap-3">
              📊 HR Analytics Dashboard
            </h2>
            <p className="text-gray-600 text-lg">
              Monitor your job postings and application insights.
            </p>
          </header>

          {/* No Jobs Case */}
          {jobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-96 text-center bg-white rounded-2xl shadow-lg border border-gray-200">
              <BriefcaseIcon className="h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-2xl font-semibold text-gray-700 mb-2">
                No Jobs Posted Yet
              </h3>
              <p className="text-gray-500 text-lg mb-6">
                Start by creating your first job posting.
              </p>
              <button
                onClick={() => navigate("/hr/create-job")}
                className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition font-medium"
              >
                📝 Create Your First Job
              </button>
            </div>
          ) : (
            <>
              {/* =======================================================
                  📈 STATS OVERVIEW SECTION
                  These cards calculate and display key HR metrics
              ======================================================= */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {/* 1️⃣ Total Jobs */}
                <StatCard
                  title="Total Jobs"
                  value={jobs.length}
                  icon={<BriefcaseIcon className="h-6 w-6 text-blue-600" />}
                  color="bg-blue-100"
                />

                {/* 2️⃣ Total Applications */}
                <StatCard
                  title="Total Applications"
                  // Count all applications across all jobs
                  value={jobs.reduce(
                    (acc, job) => acc + (job.applications?.length || 0),
                    0
                  )}
                  icon={<UsersIcon className="h-6 w-6 text-green-600" />}
                  color="bg-green-100"
                />

                {/* 3️⃣ Active Positions */}
                {/* ✅ Explanation:
                    Active jobs are those where the application deadline 
                    is still in the future (not expired yet). */}
                <StatCard
                  title="Active Positions"
                  value={
                    jobs.filter(
                      (job) => new Date(job.application_deadline) > new Date()
                    ).length
                  }
                  icon={<BriefcaseIcon className="h-6 w-6 text-purple-600" />}
                  color="bg-purple-100"
                />

                {/* 4️⃣ Avg Applications per Job */}
                {/* ✅ Explanation:
                    Take the total number of all applications 
                    and divide it by total number of jobs. */}
                <StatCard
                  title="Avg Applications/Job"
                  value={
                    jobs.length > 0
                      ? Math.round(
                          jobs.reduce(
                            (acc, job) =>
                              acc + (job.applications?.length || 0),
                            0
                          ) / jobs.length
                        )
                      : 0
                  }
                  icon={<UsersIcon className="h-6 w-6 text-orange-600" />}
                  color="bg-orange-100"
                />
              </div>

              {/* =======================================================
                  💼 JOB LISTINGS SECTION
                  Displays all jobs posted by the HR
              ======================================================= */}
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-800">
                  Your Job Postings
                </h3>
                <p className="text-gray-600">
                  Click on any job to view detailed analytics
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {jobs.map((job) => (
                  <div
                    key={job.id}
                    onClick={() => navigate(`/hr/job/${job.id}`)}
                    className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 cursor-pointer group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="bg-indigo-100 p-3 rounded-lg group-hover:bg-indigo-600 transition-colors">
                        <BriefcaseIcon className="h-6 w-6 text-indigo-600 group-hover:text-white transition-colors" />
                      </div>
                      <span className="text-xs px-3 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                        Active
                      </span>
                    </div>

                    <h3 className="text-xl font-semibold text-gray-800 mb-2 group-hover:text-indigo-600 transition-colors">
                      {job.title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-2 text-sm">
                      {job.description || "No description provided."}
                    </p>

                    <div className="border-t border-gray-100 pt-4 mt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <UsersIcon className="h-5 w-5" />
                          <span className="font-medium">
                            {job.applications?.length || 0} Applications
                          </span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/hr/job/${job.id}`);
                          }}
                          className="text-indigo-600 hover:text-indigo-800 font-semibold text-sm flex items-center gap-1"
                        >
                          View Details
                          <span className="group-hover:translate-x-1 transition-transform">
                            →
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* =======================================================
   📦 STAT CARD COMPONENT
   Used for displaying each statistic card (Jobs, Applications, etc.)
======================================================= */
function StatCard({ title, value, icon, color }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center gap-4">
        <div className={`p-4 rounded-xl ${color}`}>{icon}</div>
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-800">{value}</p>
        </div>
      </div>
    </div>
  );
}

export default HRAnalytics;
