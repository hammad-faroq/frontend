// src/pages/JobSeekerJobs.js
import React, { useState, useEffect } from "react";
import { listJobs, getAppliedJobs, logoutUser } from "../services/api";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

function JobSeekerJobs() {
  const [jobs, setJobs] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedJob, setSelectedJob] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    type: "all",
    location: ""
  });
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate("/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [jobsData, appliedData] = await Promise.all([
        listJobs(),
        getAppliedJobs()
      ]);
      
      setJobs(Array.isArray(jobsData) ? jobsData : []);
      setAppliedJobs(Array.isArray(appliedData) ? appliedData : []);
    } catch (err) {
      console.error("Error fetching jobs:", err);
      setError("Failed to load jobs. Please try refreshing.");
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (job) => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".pdf,.doc,.docx";

    fileInput.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const token = localStorage.getItem("token");
      if (!token) return alert("Please login first!");

      const formData = new FormData();
      formData.append("resume", file);

      try {
        const res = await fetch(`https://backendfyp-production-00a3.up.railway.app/api/jobs/${job.id}/apply/`, {
          method: "POST",
          headers: { Authorization: `Token ${token}` },
          body: formData,
        });

        if (res.ok) {
          alert(`✅ Successfully applied for ${job.title}!`);
          const appliedData = await getAppliedJobs();
          setAppliedJobs(Array.isArray(appliedData) ? appliedData : []);
        } else {
          const data = await res.json();
          alert(`❌ Application failed: ${data.error || "Please try again."}`);
        }
      } catch (err) {
        console.error("Application error:", err);
        alert("❌ Application error!");
      }
    };

    fileInput.click();
  };

  const isApplied = (jobId) => {
    return appliedJobs.some(applied => applied.job_id === jobId);
  };

  const filteredJobs = jobs.filter(job => {
    if (filters.search && !job.title.toLowerCase().includes(filters.search.toLowerCase()) && 
        !job.company_name.toLowerCase().includes(filters.search.toLowerCase()) &&
        !job.description.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    if (filters.type !== "all" && job.type !== filters.type) {
      return false;
    }
    if (filters.location && !job.location.toLowerCase().includes(filters.location.toLowerCase())) {
      return false;
    }
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar handleLogout={handleLogout} navigate={navigate} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading jobs...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar handleLogout={handleLogout} navigate={navigate} />
      
      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        {/* Header */}
        <div className="mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Jobs</h1>
            <p className="text-gray-600">Find your next career opportunity from {jobs.length} positions</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                placeholder="Job title, company, or keywords"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Job Type</label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={filters.type}
                onChange={(e) => setFilters({...filters, type: e.target.value})}
              >
                <option value="all">All Types</option>
                <option value="full_time">Full-time</option>
                <option value="part_time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
                <option value="remote">Remote</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <input
                type="text"
                placeholder="City or country"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={filters.location}
                onChange={(e) => setFilters({...filters, location: e.target.value})}
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setFilters({ search: "", type: "all", location: "" })}
                className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Jobs Grid */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {filteredJobs.length === 0 ? (
            <div className="col-span-2 text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">💼</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No jobs found</h3>
              <p className="text-gray-600">Try adjusting your filters or check back later</p>
            </div>
          ) : (
            filteredJobs.map((job) => (
              <div key={job.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-300">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">{job.title}</h3>
                    <p className="text-gray-600 mb-2">{job.company_name} • {job.location}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>💼 {job.type || "Full-time"}</span>
                      <span>💰 {job.salary || "Competitive"}</span>
                      <span>🕒 {job.posted_at || "Recently"}</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-semibold">
                    {job.company_name?.charAt(0) || "J"}
                  </div>
                </div>
                
                <p className="text-gray-700 text-sm mb-4 line-clamp-2">
                  {job.description || "No description available."}
                </p>
                
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => setSelectedJob(job)}
                    className="text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => handleApply(job)}
                    disabled={isApplied(job.id)}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                      isApplied(job.id) 
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                        : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                    }`}
                  >
                    {isApplied(job.id) ? "Applied ✓" : "Apply Now"}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Job Detail Modal */}
        {selectedJob && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-1">{selectedJob.title}</h2>
                    <p className="text-gray-600 text-lg">{selectedJob.company_name} • {selectedJob.location}</p>
                  </div>
                  <button 
                    onClick={() => setSelectedJob(null)}
                    className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
                  >
                    <span className="text-2xl text-gray-500">×</span>
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Job Description</h3>
                  <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                    {selectedJob.description || "No description provided."}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Requirements</h3>
                  <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                    {selectedJob.requirements || "No specific requirements listed."}
                  </p>
                </div>
                
                {selectedJob.skills && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Required Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedJob.skills.split(',').map((skill, index) => (
                        <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                          {skill.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
                <div className="flex justify-end gap-3">
                  <button 
                    onClick={() => setSelectedJob(null)}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Close
                  </button>
                  <button 
                    onClick={() => handleApply(selectedJob)}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
                  >
                    {isApplied(selectedJob.id) ? "Already Applied" : "Apply Now"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default JobSeekerJobs;