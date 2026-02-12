// src/pages/SimilarJobs.js
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  getSimilarJobs, 
  getResumeAnalysis, 
  listJobs,
  applyToJob,
  getAppliedJobs,
  checkApplicationStatus 
} from "../services/api";

function SimilarJobs() {
  const [similarJobs, setSimilarJobs] = useState([]);
  const [allJobs, setAllJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState(null);
  const [activeTab, setActiveTab] = useState("similar");
  const [appliedJobs, setAppliedJobs] = useState(new Set());
  const [applying, setApplying] = useState({});
  const [filters, setFilters] = useState({
    job_title: "",
    company: "",
    skills: "",
    location: ""
  });
  const navigate = useNavigate();

  // Fetch all data
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch data in parallel
      const [similarData, allJobsData, analysisData, appliedJobsList] = await Promise.all([
        getSimilarJobs().catch(() => ({ matched_jobs: [] })),
        listJobs().catch(() => []),
        getResumeAnalysis().catch(() => null),
        getAppliedJobs().catch(() => [])
      ]);

      // Set similar jobs
      const similarJobsData = similarData.matched_jobs || similarData || [];
      setSimilarJobs(similarJobsData);
      setAllJobs(Array.isArray(allJobsData) ? allJobsData : []);
      setAnalysis(analysisData);

      // Create set of applied job IDs
      const appliedIds = new Set(
        appliedJobsList.map(job => job.job_id || job.id).filter(id => id)
      );
      setAppliedJobs(appliedIds);

    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle job application
  const handleApply = async (jobId, jobTitle) => {
    if (appliedJobs.has(jobId)) {
      alert(`You have already applied for "${jobTitle}"`);
      return;
    }

    const resumeFile = prompt("Please upload your resume for this application. For now, please enter resume text or URL:");
    
    if (!resumeFile) {
      alert("Resume is required to apply for this job.");
      return;
    }

    // Create a mock file object
    const mockFile = new File(
      [resumeFile], 
      `resume_${jobId}.txt`, 
      { type: 'text/plain' }
    );

    try {
      setApplying(prev => ({ ...prev, [jobId]: true }));
      const result = await applyToJob(jobId, mockFile);
      
      if (result.status === "success") {
        alert(`Successfully applied to "${jobTitle}"!`);
        // Update applied jobs set
        setAppliedJobs(prev => new Set([...prev, jobId]));
      } else if (result.status === "already_applied") {
        alert(`You have already applied to "${jobTitle}"`);
        setAppliedJobs(prev => new Set([...prev, jobId]));
      } else {
        alert(`Failed to apply: ${result.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Apply error:", error);
      alert("Failed to apply. Please try again.");
    } finally {
      setApplying(prev => ({ ...prev, [jobId]: false }));
    }
  };

  // Filter jobs based on active tab and filters
  const getFilteredJobs = () => {
    const jobs = activeTab === "similar" ? similarJobs : allJobs;
    
    return jobs.filter(job => {
      const matchesTitle = !filters.job_title || 
        job.job_title?.toLowerCase().includes(filters.job_title.toLowerCase()) ||
        job.title?.toLowerCase().includes(filters.job_title.toLowerCase());
      
      const matchesCompany = !filters.company || 
        job.company?.toLowerCase().includes(filters.company.toLowerCase()) ||
        job.company_name?.toLowerCase().includes(filters.company.toLowerCase());
      
      const matchesLocation = !filters.location || 
        job.location?.toLowerCase().includes(filters.location.toLowerCase());
      
      const matchesSkills = !filters.skills || 
        job.required_skills?.some(skill => 
          skill.toLowerCase().includes(filters.skills.toLowerCase())
        ) ||
        job.skills?.some(skill => 
          skill.toLowerCase().includes(filters.skills.toLowerCase())
        );

      return matchesTitle && matchesCompany && matchesLocation && matchesSkills;
    });
  };

  // Get job title display
  const getJobTitle = (job) => job.job_title || job.title || "Untitled Position";
  
  // Get company name display
  const getCompanyName = (job) => job.company || job.company_name || "Unknown Company";

  // Get match score for similar jobs
  const getMatchScore = (job) => {
    if (activeTab !== "similar") return null;
    return job.match_score || job.match_percentage || null;
  };

  // Get matching skills for similar jobs
  const getMatchingSkills = (job) => {
    if (activeTab !== "similar") return [];
    return job.matching_skills || job.skills_matched || [];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Finding jobs that match your profile...</p>
        </div>
      </div>
    );
  }

  const filteredJobs = getFilteredJobs();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Job Recommendations</h1>
              <p className="text-gray-600">
                Discover jobs that match your skills and experience
              </p>
            </div>
            <button
              onClick={fetchData}
              className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <span>↻</span> Refresh
            </button>
          </div>

          {/* Tabs */}
          <div className="flex space-x-4 mb-6">
            <button
              onClick={() => setActiveTab("similar")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === "similar"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              Similar Jobs
              {similarJobs.length > 0 && (
                <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  {similarJobs.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("all")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              All Jobs
              {allJobs.length > 0 && (
                <span className="ml-2 bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
                  {allJobs.length}
                </span>
              )}
            </button>
          </div>

          {/* Filters */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job Title
                </label>
                <input
                  type="text"
                  placeholder="e.g., Software Engineer"
                  value={filters.job_title}
                  onChange={(e) => setFilters({...filters, job_title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company
                </label>
                <input
                  type="text"
                  placeholder="e.g., Google"
                  value={filters.company}
                  onChange={(e) => setFilters({...filters, company: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Skills
                </label>
                <input
                  type="text"
                  placeholder="e.g., Python, React"
                  value={filters.skills}
                  onChange={(e) => setFilters({...filters, skills: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  placeholder="e.g., Remote, New York"
                  value={filters.location}
                  onChange={(e) => setFilters({...filters, location: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Analysis Summary */}
        {analysis && analysis.resume_summary && activeTab === "similar" && (
          <div className="mb-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold mb-2">Your Profile Analysis</h2>
                <p className="text-blue-100">
                  Based on your resume, you have {analysis.resume_summary.primary_skills?.length || 0} primary skills
                  {analysis.resume_summary.experience_years && ` and ${analysis.resume_summary.experience_years} years of experience`}
                </p>
              </div>
              <Link
                to="/jobseeker/analysis"
                className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors"
              >
                View Full Analysis
              </Link>
            </div>
          </div>
        )}

        {/* Jobs Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Jobs List */}
          <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                {activeTab === "similar" ? "Jobs Matching Your Profile" : "All Available Jobs"}
                <span className="text-gray-600 text-sm font-normal ml-2">
                  ({filteredJobs.length} found)
                </span>
              </h2>
            </div>

            {filteredJobs.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-gray-200">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🔍</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">No jobs found</h3>
                <p className="text-gray-600 mb-4">
                  {activeTab === "similar" 
                    ? "Try uploading your resume or updating your profile to get better matches."
                    : "Try adjusting your filters or check back later for new opportunities."}
                </p>
                {activeTab === "similar" && (
                  <Link
                    to="/jobseeker/upload-resume"
                    className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Upload Resume
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredJobs.map((job) => {
                  const jobId = job.id || job.job_id;
                  const jobTitle = getJobTitle(job);
                  const companyName = getCompanyName(job);
                  const matchScore = getMatchScore(job);
                  const matchingSkills = getMatchingSkills(job);
                  const isApplied = appliedJobs.has(jobId);

                  return (
                    <div key={jobId} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-800">{jobTitle}</h3>
                            {isApplied && (
                              <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                                ✓ Applied
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                            <span className="font-medium">{companyName}</span>
                            {job.location && (
                              <span className="flex items-center gap-1">
                                📍 {job.location}
                              </span>
                            )}
                            {job.salary_range && (
                              <span className="text-green-600 font-medium">
                                💰 {job.salary_range}
                              </span>
                            )}
                          </div>
                          
                          {matchScore && (
                            <div className="mb-3">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium text-gray-700">Match Score</span>
                                <span className={`text-sm font-bold ${
                                  matchScore >= 80 ? "text-green-600" :
                                  matchScore >= 60 ? "text-yellow-600" :
                                  "text-red-600"
                                }`}>
                                  {matchScore}%
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${
                                    matchScore >= 80 ? "bg-green-500" :
                                    matchScore >= 60 ? "bg-yellow-500" :
                                    "bg-red-500"
                                  }`}
                                  style={{ width: `${Math.min(matchScore, 100)}%` }}
                                ></div>
                              </div>
                            </div>
                          )}

                          {matchingSkills.length > 0 && (
                            <div className="mb-4">
                              <p className="text-sm font-medium text-gray-700 mb-2">
                                Matching Skills:
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {matchingSkills.map((skill, idx) => (
                                  <span 
                                    key={idx} 
                                    className="bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1 rounded-full"
                                  >
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {job.required_skills && (
                            <div className="mb-4">
                              <p className="text-sm font-medium text-gray-700 mb-2">
                                Required Skills:
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {(Array.isArray(job.required_skills) ? job.required_skills : 
                                  typeof job.required_skills === 'string' ? 
                                  job.required_skills.split(',') : []
                                ).map((skill, idx) => (
                                  <span 
                                    key={idx} 
                                    className="bg-gray-100 text-gray-700 text-xs font-medium px-3 py-1 rounded-full"
                                  >
                                    {skill.trim()}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {job.description && (
                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                              {job.description.length > 200 
                                ? job.description.substring(0, 200) + '...'
                                : job.description
                              }
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span>Posted: {new Date(job.created_at || job.posted_date || Date.now()).toLocaleDateString()}</span>
                          {job.job_type && (
                            <span className="border-l border-gray-300 pl-2">
                              {job.job_type}
                            </span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => navigate(`/jobseeker/jobs/${jobId}`)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium px-4 py-2 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                          >
                            View Details
                          </button>
                          <button
                            onClick={() => handleApply(jobId, jobTitle)}
                            disabled={isApplied || applying[jobId]}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                              isApplied
                                ? "bg-green-100 text-green-800 cursor-not-allowed"
                                : "bg-blue-600 text-white hover:bg-blue-700"
                            }`}
                          >
                            {applying[jobId] ? (
                              <span className="flex items-center gap-2">
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                                Applying...
                              </span>
                            ) : isApplied ? (
                              "✓ Applied"
                            ) : (
                              "Apply Now"
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sidebar - Skills & Tips */}
          <div className="space-y-6">
            {/* Your Skills */}
            {analysis?.resume_summary?.primary_skills && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {analysis.resume_summary.primary_skills.map((skill, idx) => (
                    <span 
                      key={idx} 
                      className="bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-medium px-3 py-1.5 rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
                {analysis.resume_summary.experience_years && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <span className="font-semibold">Experience:</span> {analysis.resume_summary.experience_years} years
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Job Match Tips */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-100 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">💡 Job Match Tips</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <span className="text-purple-500">✓</span>
                  <span className="text-sm text-gray-700">
                    Jobs with <span className="font-semibold">80%+ match</span> are highly relevant
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500">✓</span>
                  <span className="text-sm text-gray-700">
                    Highlight skills that appear in multiple job descriptions
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500">✓</span>
                  <span className="text-sm text-gray-700">
                    Update your resume regularly for better matching
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500">✓</span>
                  <span className="text-sm text-gray-700">
                    Apply within 48 hours for best response rates
                  </span>
                </li>
              </ul>
              <button
                onClick={() => navigate("/jobseeker/upload-resume")}
                className="w-full mt-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2.5 rounded-lg font-medium hover:opacity-90 transition-opacity"
              >
                Update Resume for Better Matches
              </button>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Job Search</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Similar Jobs Found</span>
                  <span className="font-semibold text-blue-600">
                    {similarJobs.length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Jobs Available</span>
                  <span className="font-semibold text-gray-800">
                    {allJobs.length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Jobs Applied To</span>
                  <span className="font-semibold text-green-600">
                    {appliedJobs.size}
                  </span>
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Match Rate</span>
                    <span className="font-semibold text-purple-600">
                      {similarJobs.length > 0 
                        ? `${Math.round((similarJobs.length / allJobs.length) * 100)}%`
                        : "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SimilarJobs;