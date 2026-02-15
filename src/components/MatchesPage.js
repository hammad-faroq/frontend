import React, { useState, useEffect, useCallback } from "react";
import { getSimilarJobs, getAppliedJobs } from "../services/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  ArrowPathIcon,
  BriefcaseIcon,
  DocumentArrowUpIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";

function MatchesPage() {
  const [matchedJobs, setMatchedJobs] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [applyingJobId, setApplyingJobId] = useState(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [filter, setFilter] = useState("all"); // "all", "unapplied", "applied"
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("score"); // "score", "date", "title"

  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Memoized fetch function
  const fetchMatchedJobs = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError("");
    setSuccessMessage("");

    try {
      const [matchesRes, appliedRes] = await Promise.allSettled([
        getSimilarJobs(),
        getAppliedJobs(),
      ]);

      let hasJobs = false;

      // Handle matched jobs
      if (matchesRes.status === "fulfilled") {
        const response = matchesRes.value;
        const jobs = Array.isArray(response.matched_jobs)
          ? response.matched_jobs
          : Array.isArray(response)
          ? response
          : [];

        if (jobs.length > 0) {
          setMatchedJobs(jobs);
          hasJobs = true;
          
          if (isRefresh) {
            setSuccessMessage(`✅ Found ${jobs.length} matching jobs!`);
            setTimeout(() => setSuccessMessage(""), 3000);
          }
        } else {
          setError(response.message || "No matching jobs found.");
          setMatchedJobs([]);
        }
      } else {
        console.error("Matches fetch failed:", matchesRes.reason);
        setError("Failed to fetch matched jobs. Please try again.");
        setMatchedJobs([]);
      }

      // Handle applied jobs
      if (appliedRes.status === "fulfilled") {
        const applied = Array.isArray(appliedRes.value.applied_jobs)
          ? appliedRes.value.applied_jobs
          : Array.isArray(appliedRes.value)
          ? appliedRes.value
          : [];
        setAppliedJobs(applied);
      } else {
        console.error("Applied jobs fetch failed:", appliedRes.reason);
        setAppliedJobs([]);
      }

      // If no jobs found and not an error response, show helpful message
      if (!hasJobs && matchesRes.status === "fulfilled") {
        const response = matchesRes.value;
        if (response.message && response.message.includes("No resume")) {
          setError("Please upload your resume first to get job matches.");
        } else if (response.message && response.message.includes("No open")) {
          setError("No open positions available at the moment.");
        }
      }

    } catch (err) {
      console.error("Fetch error:", err);
      setError("Something went wrong while loading job matches.");
      setMatchedJobs([]);
      setAppliedJobs([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchMatchedJobs();
  }, [fetchMatchedJobs]);

  // Filter and sort jobs
  const filteredAndSortedJobs = React.useMemo(() => {
    let filtered = matchedJobs.filter(job => {
      // Apply search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          job.title?.toLowerCase().includes(searchLower) ||
          job.company?.toLowerCase().includes(searchLower) ||
          job.location?.toLowerCase().includes(searchLower) ||
          job.description?.toLowerCase().includes(searchLower)
        );
      }
      return true;
    });

    // Apply application status filter
    if (filter === "unapplied") {
      filtered = filtered.filter(job => 
        !appliedJobs.some(applied => applied.job_id === job.job_id)
      );
    } else if (filter === "applied") {
      filtered = filtered.filter(job => 
        appliedJobs.some(applied => applied.job_id === job.job_id)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const scoreA = a.score || a.match_score || 0;
      const scoreB = b.score || b.match_score || 0;

      switch (sortBy) {
        case "score":
          return scoreB - scoreA;
        case "title":
          return (a.title || "").localeCompare(b.title || "");
        case "date":
          // If you have a date field, use it
          return 0; // Default
        default:
          return scoreB - scoreA;
      }
    });

    return filtered;
  }, [matchedJobs, appliedJobs, filter, searchTerm, sortBy]);

  const handleApply = async (job) => {
    const token = localStorage.getItem("token") || localStorage.getItem("access_token");
    if (!token) {
      alert("Please login first!");
      navigate("/login");
      return;
    }

    // Check if already applied
    const isAlreadyApplied = appliedJobs.some((a) => a.job_id === job.job_id);
    if (isAlreadyApplied) {
      alert("You have already applied for this job!");
      return;
    }

    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".pdf,.doc,.docx";
    fileInput.className = "hidden";

    fileInput.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) {
        setApplyingJobId(null);
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert("File size exceeds 5MB limit.");
        setApplyingJobId(null);
        return;
      }

      // Validate file type
      const validTypes = ['.pdf', '.doc', '.docx'];
      const fileExt = '.' + file.name.split('.').pop().toLowerCase();
      if (!validTypes.includes(fileExt)) {
        alert("Please upload PDF, DOC, or DOCX files only.");
        setApplyingJobId(null);
        return;
      }

      const formData = new FormData();
      formData.append("resume", file);
      formData.append("job_id", job.job_id);

      try {
        setApplyingJobId(job.job_id);
        
        // Try the standard endpoint
        const endpoint = `https://backendfyp-production-00a3.up.railway.app/api/jobs/${job.job_id}/apply/`;
        
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { 
            "Authorization": `Token ${token}`,
          },
          body: formData,
        });
        
        if (res.ok) {
          const data = await res.json();
          alert(`✅ Applied successfully for ${job.title}`);
          
          // Refresh applied jobs list
          const updatedApplied = await getAppliedJobs();
          setAppliedJobs(Array.isArray(updatedApplied) ? updatedApplied : []);
          
          // Refresh matches to update UI
          fetchMatchedJobs(true);
        } else {
          const errorData = await res.json();
          alert(`❌ Application failed: ${errorData?.error || "Please try again"}`);
        }
      } catch (err) {
        console.error("Apply error:", err);
        alert("❌ Error applying for the job. Please try again.");
      } finally {
        setApplyingJobId(null);
        fileInput.remove();
      }
    };

    document.body.appendChild(fileInput);
    fileInput.click();
  };

  const handleRefresh = () => {
    fetchMatchedJobs(true);
  };

  const getMatchScoreColor = (score) => {
    if (score >= 80) return "bg-green-100 text-green-800";
    if (score >= 60) return "bg-yellow-100 text-yellow-800";
    if (score >= 40) return "bg-orange-100 text-orange-800";
    return "bg-red-100 text-red-800";
  };

  const getMatchScoreLabel = (score) => {
    if (score >= 80) return "Excellent Match";
    if (score >= 60) return "Good Match";
    if (score >= 40) return "Fair Match";
    return "Low Match";
  };

  const handleJobClick = (jobId) => {
    navigate(`/jobs/${jobId}`);
  };

  const unappliedCount = matchedJobs.filter(job => 
    !appliedJobs.some(applied => applied.job_id === job.job_id)
  ).length;

  const appliedCount = matchedJobs.filter(job => 
    appliedJobs.some(applied => applied.job_id === job.job_id)
  ).length;

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar handleLogout={handleLogout} navigate={navigate} />
        <div className="flex-1 min-h-screen bg-gray-50 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Your Job Matches</h1>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-xl shadow p-6 animate-pulse">
                  <div className="h-6 bg-gray-300 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/2 mb-3"></div>
                  <div className="h-4 bg-gray-300 rounded w-2/3 mb-6"></div>
                  <div className="h-10 bg-gray-300 rounded w-full"></div>
                </div>
              ))}
            </div>
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
      <div className="flex-1 min-h-screen p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Your Job Matches</h1>
                <p className="text-gray-600 mt-2">
                  Jobs tailored to your skills and experience
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 flex items-center gap-2 transition-colors"
                >
                  <ArrowPathIcon className={`h-5 w-5 ${refreshing ? "animate-spin" : ""}`} />
                  {refreshing ? "Refreshing..." : "Refresh"}
                </button>
                <button
                  onClick={() => navigate("/resume-upload")}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
                >
                  <DocumentArrowUpIcon className="h-5 w-5" />
                  Upload Resume
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-xl shadow p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <BriefcaseIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-500">Total Matches</p>
                    <p className="text-2xl font-bold">{matchedJobs.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircleIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-500">Applied Jobs</p>
                    <p className="text-2xl font-bold">{appliedCount}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <ClockIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-500">Available to Apply</p>
                    <p className="text-2xl font-bold">{unappliedCount}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="mb-6 bg-white rounded-xl shadow p-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search Input */}
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search jobs by title, company, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <FunnelIcon className="h-5 w-5 text-gray-500" />
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Jobs</option>
                    <option value="unapplied">Not Applied</option>
                    <option value="applied">Already Applied</option>
                  </select>
                </div>
                
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="score">Sort by Match Score</option>
                  <option value="title">Sort by Title</option>
                </select>
              </div>
            </div>
          </div>

          {/* Messages */}
          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center">
              <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
              <p className="text-green-700">{successMessage}</p>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mr-2" />
              <div className="flex-1">
                <p className="text-red-700 font-medium">{error}</p>
                {error.includes("No resume") && (
                  <button
                    onClick={() => navigate("/resume-upload")}
                    className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                  >
                    Upload your resume now →
                  </button>
                )}
              </div>
            </div>
          )}

          {/* No Jobs State */}
          {!loading && !error && filteredAndSortedJobs.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl shadow">
              <div className="text-6xl mb-4 text-gray-300">📄</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                {searchTerm ? "No matching jobs found" : "No job matches yet"}
              </h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                {searchTerm 
                  ? "Try a different search term or clear your filters."
                  : "Upload your resume to get personalized job recommendations based on your skills and experience."}
              </p>
              {searchTerm ? (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setFilter("all");
                  }}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 mx-auto"
                >
                  Clear Filters
                </button>
              ) : (
                <button
                  onClick={() => navigate("/resume-upload")}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 mx-auto"
                >
                  <DocumentArrowUpIcon className="h-5 w-5" />
                  Upload Resume
                </button>
              )}
            </div>
          )}

          {/* Job Cards */}
          {filteredAndSortedJobs.length > 0 && (
            <>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800">
                  Recommended for you ({filteredAndSortedJobs.length})
                  {searchTerm && ` for "${searchTerm}"`}
                </h2>
                <div className="text-sm text-gray-500">
                  {filter === "unapplied" && "Showing only unapplied jobs"}
                  {filter === "applied" && "Showing only applied jobs"}
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAndSortedJobs.map((job) => {
                  const isApplied = appliedJobs.some((a) => a.job_id === job.job_id);
                  const isApplying = applyingJobId === job.job_id;
                  const matchScore = job.score || job.match_score || 0;
                  const matchPercentage = Math.round(matchScore * 100);
                  
                  return (
                    <div
                      key={job.job_id}
                      className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200"
                    >
                      <div className="p-6">
                        {/* Job Header */}
                        <div className="mb-4">
                          <div className="flex justify-between items-start mb-3">
                            <div 
                              className="cursor-pointer hover:text-blue-600 transition-colors"
                              onClick={() => handleJobClick(job.job_id)}
                            >
                              <h3 className="font-bold text-lg text-gray-900 line-clamp-2">
                                {job.title}
                              </h3>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getMatchScoreColor(matchPercentage)}`}>
                              {matchPercentage}% Match
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            {job.company && (
                              <div className="flex items-center gap-1">
                                <BuildingOfficeIcon className="h-4 w-4" />
                                <span className="truncate">{job.company}</span>
                              </div>
                            )}
                            {job.location && (
                              <div className="flex items-center gap-1">
                                <MapPinIcon className="h-4 w-4" />
                                <span className="truncate">{job.location}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Match Details */}
                        <div className="mb-6">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">
                              {getMatchScoreLabel(matchPercentage)}
                            </span>
                            <span className="text-sm font-bold text-gray-900">
                              {matchPercentage}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                matchPercentage >= 80 ? "bg-green-500" :
                                matchPercentage >= 60 ? "bg-yellow-500" :
                                matchPercentage >= 40 ? "bg-orange-500" : "bg-red-500"
                              }`}
                              style={{ width: `${Math.min(matchPercentage, 100)}%` }}
                            ></div>
                          </div>
                          {job.source && (
                            <p className="text-xs text-gray-500 mt-2">
                              Powered by: {job.source}
                            </p>
                          )}
                        </div>

                        {/* Description Preview */}
                        {job.description && (
                          <div className="mb-6">
                            <p className="text-sm text-gray-600 line-clamp-3">
                              {job.description}
                            </p>
                          </div>
                        )}

                        {/* Job Details */}
                        <div className="grid grid-cols-2 gap-3 mb-6 text-sm">
                          {job.salary_range && (
                            <div>
                              <p className="text-gray-500">Salary</p>
                              <p className="font-medium text-gray-900">{job.salary_range}</p>
                            </div>
                          )}
                          {job.type && (
                            <div>
                              <p className="text-gray-500">Type</p>
                              <p className="font-medium text-gray-900">{job.type}</p>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3">
                          <button
                            onClick={() => handleJobClick(job.job_id)}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors"
                          >
                            <EyeIcon className="h-4 w-4" />
                            View Details
                          </button>
                          
                          <button
                            onClick={() => handleApply(job)}
                            disabled={isApplied || isApplying}
                            className={`flex-1 px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors ${
                              isApplied
                                ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                                : isApplying
                                ? "bg-yellow-500 text-white cursor-wait"
                                : "bg-blue-600 text-white hover:bg-blue-700"
                            }`}
                          >
                            {isApplying ? (
                              <>
                                <ArrowPathIcon className="h-4 w-4 animate-spin" />
                                Applying...
                              </>
                            ) : isApplied ? (
                              <>
                                <CheckCircleIcon className="h-4 w-4" />
                                Applied
                              </>
                            ) : (
                              <>
                                <DocumentArrowUpIcon className="h-4 w-4" />
                                Apply Now
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Tips Section */}
          {filteredAndSortedJobs.length > 0 && (
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                <ExclamationTriangleIcon className="h-5 w-5" />
                Tips for better matches:
              </h4>
              <ul className="text-blue-700 space-y-2">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Update your resume with recent skills and experiences</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Apply to jobs with higher match scores first</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Complete your profile with all relevant information</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Check back regularly for new job postings</span>
                </li>
              </ul>
            </div>
          )}

          {/* Pagination or Load More */}
          {filteredAndSortedJobs.length > 0 && filteredAndSortedJobs.length < matchedJobs.length && (
            <div className="mt-8 text-center">
              <button
                onClick={() => {
                  // In a real app, this would load more jobs
                  alert("Loading more jobs... (This would fetch more in a real application)");
                }}
                className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Load More Jobs
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MatchesPage;