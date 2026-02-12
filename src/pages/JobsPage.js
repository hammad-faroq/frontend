import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; 
import { listJobs } from "../services/api";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar"; 

function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLocation, setFilterLocation] = useState("All");
  const { role, logout } = useAuth(); 
  const navigate = useNavigate(); 
  
  console.log("✅ Current role from AuthContext:", role);

  
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const data = await listJobs();
        const validData = Array.isArray(data) ? data : [];
        setJobs(validData);
        setFilteredJobs(validData);
      } catch (err) {
        console.error(err);
        setError("⚠️ Failed to fetch jobs. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  // Search and filter
  useEffect(() => {
    let results = jobs;
    if (searchTerm) {
      results = results.filter(
        (job) =>
          job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.company_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (filterLocation !== "All") {
      results = results.filter((job) => job.location === filterLocation);
    }
    setFilteredJobs(results);
  }, [searchTerm, filterLocation, jobs]);

  if (loading)
    return (
      <div className="flex min-h-screen">
        <Sidebar handleLogout={handleLogout} navigate={navigate} />
        <div className="flex-1 p-8 text-center text-gray-500 animate-pulse">
          Loading job listings...
        </div>
      </div>
    );

  if (error)
    return (
      <div className="flex min-h-screen">
        <Sidebar handleLogout={handleLogout} navigate={navigate} />
        <div className="flex-1 p-8 text-center text-red-500 font-medium">{error}</div>
      </div>
    );

  // Collect unique locations for filtering
  const uniqueLocations = [
    "All",
    ...new Set(jobs.map((job) => job.location).filter(Boolean)),
  ];

  return (
    // ✅ Wrap everything in a flex container
    <div className="flex min-h-screen">
      {/* ✅ Add Sidebar */}
      <Sidebar handleLogout={handleLogout} navigate={navigate} />
      
      {/* ✅ Wrap your existing content in flex-1 div */}
      <div className="flex-1 min-h-screen bg-gray-50 p-6">
        <div className="max-w-5xl mx-auto bg-white shadow-md rounded-2xl p-6">
          <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">
            💼 Job Opportunities
          </h2>

          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <input
              type="text"
              placeholder="🔍 Search by title or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <select
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              {uniqueLocations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          {/* Job List */}
          {filteredJobs.length === 0 ? (
            <p className="text-center text-gray-500">No matching jobs found.</p>
          ) : (
            <ul className="space-y-5">
              {filteredJobs.map((job) => (
                <li
                  key={job.id}
                  className="border border-gray-200 rounded-xl p-5 hover:shadow-lg transition duration-200"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-indigo-700">
                        {job.title}
                      </h3>
                      <p className="text-gray-600">{job.company_name}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        📍 {job.location || "Location not specified"}
                      </p>
                    </div>
                    <p className="text-sm text-gray-400 mt-3 sm:mt-0">
                      Deadline: {job.application_deadline || "N/A"}
                    </p>
                  </div>
                  <p className="text-gray-700 mt-3 line-clamp-2">
                    {job.description}
                  </p>
                  {role?.toLowerCase() !== "hr" && (
                    <button
                      className="mt-4 px-5 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition"
                      onClick={() => (window.location.href = `/apply/${job.id}`)}
                    >
                      Apply Now
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default JobsPage;