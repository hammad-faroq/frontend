import React, { useEffect, useState } from "react";
import { getJobApplications } from "../services/api";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeftIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  UserIcon,
  StarIcon,
  AcademicCapIcon,
  FunnelIcon,
  EyeIcon,
  EyeSlashIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";

function HRJobApplications() {
  const { jobId } = useParams();
  const [applications, setApplications] = useState([]);
  const [allApplications, setAllApplications] = useState([]);
  const [jobTitle, setJobTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [showCount, setShowCount] = useState("");
  const [isFiltered, setIsFiltered] = useState(false);
  const [jobDeadline, setJobDeadline] = useState(null);
  const [shortlistCount, setShortlistCount] = useState(10);
  const navigate = useNavigate();
  // const [jobs, setJobs] = useState([]);
  // const [loading, setLoading] = useState(true);
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);


  useEffect(() => {
    const fetchApplications = async () => {
      setLoading(true);
      try {
        const data = await getJobApplications(jobId);
        
        console.log("API Response:", data); // Debug log

        setJobTitle(data.title || data.job_title || "Job");
        
        // Get job deadline if available
        if (data.application_deadline) {
          setJobDeadline(new Date(data.application_deadline));
        }

        // Get shortlist count from ranking_config
        if (data.ranking_config?.shortlist_count) {
          setShortlistCount(data.ranking_config.shortlist_count);
        }

        // Get ALL applications from API response
        let allApps = data.applications || [];
        
        console.log("Number of applications received:", allApps.length); // Debug log
        
        // Sort descending by final rank (handle null/undefined)
        allApps.sort((a, b) => {
          const aScore = a.rank_score ?? 0;
          const bScore = b.rank_score ?? 0;
          return bScore - aScore; // Descending
        });

        // Store all applications
        setAllApplications(allApps);
        // Initially show ALL applications
        setApplications(allApps);
        
      } catch (err) {
        console.error("Error fetching applications:", err);
        setAllApplications([]);
        setApplications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [jobId]);

  // Poll backend for Gradio scores every 5 seconds
useEffect(() => {
  const interval = setInterval(() => {
    // Check if any application has gradio_match_score === null
    if (applications.some(app => app.gradio_match_score === null || app.gradio_match_score === undefined)) {
      getJobApplications(jobId).then((data) => {
        const allApps = data.applications || [];
        allApps.sort((a, b) => (b.rank_score ?? 0) - (a.rank_score ?? 0));
        setApplications(allApps);
        setAllApplications(allApps);
      }).catch(err => console.error("Failed to refresh Gradio scores:", err));
    }
  }, 5000); // poll every 5 seconds

  return () => clearInterval(interval); // cleanup on unmount
}, [applications, jobId]);


  // Function to filter applications based on entered count
  const filterApplications = () => {
    if (!showCount || showCount === "" || isNaN(parseInt(showCount))) {
      // If no valid count, show all
      setApplications(allApplications);
      setIsFiltered(false);
      return;
    }

    const count = parseInt(showCount);
    if (count <= 0) {
      setApplications([]);
      setIsFiltered(true);
      return;
    }

    // Show only the top N applications (shortlist)
    const filtered = allApplications.slice(0, count);
    setApplications(filtered);
    setIsFiltered(true);
  };

  // Function to show all applications
  const showAllApplications = () => {
    setApplications(allApplications);
    setShowCount("");
    setIsFiltered(false);
  };

  // Function to apply the job's shortlist count
  const applyJobShortlist = () => {
    if (allApplications.length > 0) {
      setShowCount(shortlistCount.toString());
      const filtered = allApplications.slice(0, shortlistCount);
      setApplications(filtered);
      setIsFiltered(true);
    }
  };

  // Function to handle input change and update filtered list immediately
  const handleShowCountChange = (e) => {
    const value = e.target.value;
    setShowCount(value);
    
    if (!value || value === "" || isNaN(parseInt(value))) {
      // If empty or invalid, show all
      setApplications(allApplications);
      setIsFiltered(false);
      return;
    }
    
    const count = parseInt(value);
    if (count <= 0) {
      setApplications([]);
      setIsFiltered(true);
      return;
    }
    
    // Automatically apply filter when typing
    const filtered = allApplications.slice(0, count);
    setApplications(filtered);
    setIsFiltered(true);
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-gray-600">
        <div className="animate-spin h-8 w-8 border-4 border-blue-400 border-t-transparent rounded-full mr-3" />
        <p className="text-lg font-medium">Loading applications...</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 px-4 sm:px-6 py-8 md:py-10">
      <div className="max-w-7xl mx-auto">
        {/* Header with Back Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/hr/analytics")}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl shadow-sm hover:bg-gray-100 transition"
            >
              <ArrowLeftIcon className="h-5 w-5 text-gray-700" />
              <span className="font-medium text-gray-700 hidden sm:inline">Back to Analytics</span>
            </button>
          </div>

          <div className="text-center sm:text-right">
            <h2 className="text-2xl sm:text-4xl font-bold text-gray-800 mb-2">
              {jobTitle} — Applications
            </h2>
            <p className="text-gray-500 text-sm sm:text-lg">
              📊 <span className="font-bold">Total Applicants:</span> {allApplications.length} 
              • 📋 <span className="font-bold">Showing:</span> <span className={isFiltered ? 'text-blue-600' : 'text-green-600'}>{applications.length}</span>
              {isFiltered && ` (Top ${showCount} Shortlisted)`}
            </p>
            {jobDeadline && (
              <div className="flex items-center justify-center sm:justify-end gap-2 text-sm text-gray-500 mt-1">
                <CalendarIcon className="h-4 w-4" />
                <span>Deadline: {jobDeadline.toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>

        {/* Filter Controls */}
        <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <FunnelIcon className="h-6 w-6 text-blue-600" />
              <div>
                <h3 className="font-semibold text-gray-800">Shortlist Filter</h3>
                <p className="text-sm text-gray-500">
                  Job shortlist count: <span className="font-bold">{shortlistCount}</span> • Showing all {allApplications.length} applicants
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max={allApplications.length}
                    value={showCount}
                    onChange={handleShowCountChange}
                    placeholder={`Default: ${shortlistCount}`}
                    className="w-full sm:w-48 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-400">
                    / {allApplications.length}
                  </div>
                </div>
                
                <button
                  onClick={() => {
                    if (!showCount || showCount === "") {
                      showAllApplications();
                    } else {
                      filterApplications();
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                >
                  <EyeIcon className="h-5 w-5" />
                  <span className="hidden sm:inline">Apply</span>
                </button>
              </div>

              {isFiltered ? (
                <button
                  onClick={showAllApplications}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
                >
                  <EyeSlashIcon className="h-5 w-5" />
                  <span className="hidden sm:inline">Show All</span>
                </button>
              ) : (
                <button
                  onClick={applyJobShortlist}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center gap-2"
                >
                  <FunnelIcon className="h-5 w-5" />
                  <span className="hidden sm:inline">Apply Job Shortlist</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2 mt-4">
            <button
              onClick={() => {
                setShowCount(allApplications.length.toString());
                setApplications(allApplications);
                setIsFiltered(false);
              }}
              className={`px-3 py-1.5 text-sm rounded-lg transition ${
                !isFiltered 
                  ? 'bg-green-600 text-white' 
                  : 'bg-green-50 text-green-700 hover:bg-green-100'
              }`}
            >
              Show All ({allApplications.length})
            </button>
            <button
              onClick={() => {
                const count = Math.min(shortlistCount, allApplications.length);
                setShowCount(count.toString());
                const filtered = allApplications.slice(0, count);
                setApplications(filtered);
                setIsFiltered(true);
              }}
              className="px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition"
            >
              Top {shortlistCount} (Job Shortlist)
            </button>
            <button
              onClick={() => {
                const count = Math.min(2, allApplications.length);
                setShowCount(count.toString());
                const filtered = allApplications.slice(0, count);
                setApplications(filtered);
                setIsFiltered(true);
              }}
              className="px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition"
            >
              Top 2
            </button>
            <button
              onClick={() => {
                const count = Math.min(5, allApplications.length);
                setShowCount(count.toString());
                const filtered = allApplications.slice(0, count);
                setApplications(filtered);
                setIsFiltered(true);
              }}
              className="px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition"
            >
              Top 5
            </button>
            <button
              onClick={() => {
                const count = Math.min(10, allApplications.length);
                setShowCount(count.toString());
                const filtered = allApplications.slice(0, count);
                setApplications(filtered);
                setIsFiltered(true);
              }}
              className="px-3 py-1.5 text-sm bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition"
            >
              Top 10
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        {allApplications.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-xl shadow-sm border">
              <div className="text-sm text-gray-500">Total Applicants</div>
              <div className="text-2xl font-bold text-gray-800">{allApplications.length}</div>
              <div className="text-xs text-gray-500 mt-1">
                All applications received
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border">
              <div className="text-sm text-gray-500">Currently Showing</div>
              <div className="text-2xl font-bold text-blue-600">{applications.length}</div>
              <div className="text-xs text-gray-500 mt-1">
                {isFiltered ? `Top ${showCount} shortlisted` : 'All applicants'}
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border">
              <div className="text-sm text-gray-500">Top Score</div>
              <div className="text-2xl font-bold text-green-600">
                {allApplications[0]?.rank_score?.toFixed(1) || "0"}%
              </div>
              <div className="text-xs text-gray-500 mt-1 truncate">
                Best candidate
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border">
              <div className="text-sm text-gray-500">Job Shortlist Count</div>
              <div className="text-2xl font-bold text-purple-600">{shortlistCount}</div>
              <div className="text-xs text-gray-500 mt-1">
                Configured for this job
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {allApplications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 bg-white border border-gray-200 rounded-2xl shadow-sm">
            <DocumentTextIcon className="h-12 w-12 text-gray-400 mb-3" />
            <p className="text-gray-500 text-lg">No applications for this job yet.</p>
          </div>
        ) : (
          <>
            {/* Status Banner */}
            {isFiltered ? (
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FunnelIcon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-blue-800">Shortlist Mode Active</p>
                      <p className="text-sm text-blue-600">
                        Showing top {showCount} of {allApplications.length} applicants
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={showAllApplications}
                    className="px-4 py-2 bg-white text-blue-700 border border-blue-300 rounded-lg hover:bg-blue-50 transition"
                  >
                    Show All {allApplications.length}
                  </button>
                </div>
              </div>
            ) : (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <EyeSlashIcon className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-green-800">Showing All Applicants</p>
                      <p className="text-sm text-green-600">
                        Viewing all {applications.length} applicants • Job shortlist: {shortlistCount}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={applyJobShortlist}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Apply Job Shortlist ({shortlistCount})
                  </button>
                </div>
              </div>
            )}

            {/* Table Header */}
            <div className="hidden md:grid grid-cols-12 gap-4 items-center text-sm font-semibold text-gray-600 bg-gray-100 rounded-t-2xl p-4">
              <div className="col-span-1 text-center">Rank</div>
              <div className="col-span-2">Applicant</div>
              <div className="col-span-2">Email</div>
              <div className="col-span-2 text-center">Final Score</div>
              <div className="col-span-1 text-center">Groq</div>
              <div className="col-span-1 text-center">BERT</div>
              <div className="col-span-1 text-center">Custom ML</div>

              {/* ✅ ADD THIS */}
              <div className="col-span-1 text-center">HF Model</div>

              <div className="col-span-1 text-center">CGPA</div>
              <div className="col-span-2 text-center">Actions</div>
            </div>


            {/* Applications List */}
            <div className="bg-white rounded-b-2xl shadow overflow-hidden">
              {applications.map((app, idx) => {
                const firstName = app.first_name || app.applicant?.first_name || "";
                const lastName = app.last_name || app.applicant?.last_name || "";
                const fullName = firstName || lastName
                  ? `${firstName} ${lastName}`.trim()
                  : app.applicant_name || "N/A";

                const email = app.applicant_email || app.applicant?.email || "N/A";
                const resumeUrl = app.resume_url || app.resume || null;

                const finalRank = app.rank_score ?? 0;
                const groqRank = app.groq_rank ?? 0;
                const bertScore = app.bert_similarity ?? 0;
                const customML = app.custom_model_score ?? 0;
                const gradioScore = app.gradio_match_score;
                const cgpa = app.cgpa ?? "N/A";

                const rowBg = idx % 2 === 0 ? "bg-white" : "bg-gray-50";

                return (
                  <div
                    key={app.id ?? idx}
                    className={`${rowBg} grid grid-cols-1 md:grid-cols-12 gap-4 items-center`}
                  >
                    {/* Rank Number */}
                    <div className="md:col-span-1 text-center">
                      <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold ${
                        idx === 0 ? 'bg-yellow-100 text-yellow-700' :
                        idx === 1 ? 'bg-gray-100 text-gray-700' :
                        idx === 2 ? 'bg-orange-100 text-orange-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {idx + 1}
                      </div>
                      {isFiltered && idx < parseInt(showCount || 0) && (
                        <div className="text-xs text-green-600 mt-1 font-medium">✓ Shortlisted</div>
                      )}
                    </div>

                    {/* Applicant */}
                    <div className="md:col-span-2 flex items-center gap-3">
                      <UserIcon className="h-6 w-6 text-blue-500 shrink-0" />
                      <div>
                        <div className="font-medium text-gray-800 truncate">{fullName}</div>
                        <div className="text-xs text-gray-500 md:hidden truncate mt-1">{email}</div>
                      </div>
                    </div>

                    {/* Email */}
                    <div className="md:col-span-2 hidden md:flex items-center gap-2 text-gray-600">
                      <EnvelopeIcon className="h-5 w-5 text-gray-400 shrink-0" />
                      <span className="truncate">{email}</span>
                    </div>

                    {/* Final Score */}
                    <div className="md:col-span-2 text-center font-semibold text-blue-700 flex justify-center items-center gap-1">
                      {finalRank ? (
                        <>
                          <StarIcon className="h-5 w-5 text-yellow-500" />
                          {finalRank.toFixed(1)}%
                        </>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </div>

                    {/* Groq Rank */}
                    <div className="md:col-span-1 text-center">
                      <div className={`font-medium ${groqRank ? 'text-green-600' : 'text-gray-400'}`}>
                        {groqRank ? `${groqRank.toFixed(1)}%` : "—"}
                      </div>
                    </div>

                    {/* BERT Similarity */}
                    <div className="md:col-span-1 text-center">
                      <div className={`font-medium ${bertScore ? 'text-indigo-600' : 'text-gray-400'}`}>
                        {bertScore ? `${bertScore.toFixed(1)}%` : "—"}
                      </div>
                    </div>

                    {/* Custom ML Score */}
                    <div className="md:col-span-1 text-center">
                      <div className={`font-medium ${customML ? 'text-pink-600' : 'text-gray-400'}`}>
                        {customML ? `${customML.toFixed(1)}%` : "—"}
                      </div>
                    </div>
                  {/* ✅ Gradio Score buttojn click functionality */}
                  <div className="md:col-span-1 text-center">
                  <button
                    onClick={() => {
                      setSelectedAnalysis(app.gradio_analysis || {
                        matching_analysis: "Analysis unavailable",
                        description: "No description",
                        score: 0,
                        recommendation: "Other analysis scores are available. Match score will be retried automatically."
                      });
                      setIsModalOpen(true);
                    }}
                    className={`font-medium ${
                      gradioScore ? 'text-purple-600' : 'text-gray-400'
                    } relative hover:underline hover:text-purple-800 hover:scale-105 transition-all duration-200 cursor-pointer`}
                    title="Click to view detailed analysis"
                  >
                    {gradioScore ? `${gradioScore.toFixed(1)}%` : 'Processing...'}
                  </button>
                </div>



                    {/* CGPA */}
                    <div className="md:col-span-1 flex justify-center items-center text-center text-gray-700 gap-1 h-full">
                    <AcademicCapIcon className="h-5 w-5 text-purple-500" />
                    <span>{cgpa}</span>
                  </div>


                    {/* Actions */}
                    <div className="md:col-span-2 flex flex-col sm:flex-row justify-center gap-2">
                      {resumeUrl ? (
                        <a
                          href={resumeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition text-sm"
                        >
                          <DocumentTextIcon className="h-4 w-4" />
                          <span>Resume</span>
                        </a>
                      ) : (
                        <span className="text-gray-400 px-3 py-2 text-sm">No resume</span>
                      )}
                      
                      <button
                        onClick={() => {
                          navigate(`/hr/schedule-interview?candidate=${encodeURIComponent(fullName)}&email=${encodeURIComponent(email)}&jobId=${jobId}`);
                        }}
                        className="px-3 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition text-sm"
                      >
                        Schedule
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Info Footer */}
            <div className="mt-6 text-center text-sm text-gray-500">
              {isFiltered ? (
                <p>
                  <span className="font-medium text-blue-600">Shortlisted {applications.length} applicants</span> 
                  {' • '}
                  <button 
                    onClick={showAllApplications}
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    View all {allApplications.length} applicants
                  </button>
                </p>
              ) : (
                <p>
                  <span className="font-medium text-green-600">Viewing all {applications.length} of {allApplications.length} applicants</span>
                  {' • '}
                  <button 
                    onClick={applyJobShortlist}
                    className="text-blue-600 hover:text-blue-800 underline ml-1"
                  >
                    Apply job shortlist ({shortlistCount})
                  </button>
                </p>
              )}
            </div>
            {/* ✅ Gradio Analysis Modal */}
            {isModalOpen && selectedAnalysis && (
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 relative">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 font-bold"
                  >
                    ✕
                  </button>
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Model  Detailed Analysis</h3>
                  <p><span className="font-semibold">Matching Analysis:</span> {selectedAnalysis.matching_analysis}</p>
                  <p className="mt-2"><span className="font-semibold">Description:</span> {selectedAnalysis.description}</p>
                  <p className="mt-2"><span className="font-semibold">Score:</span> {selectedAnalysis.score}</p>
                  <p className="mt-2"><span className="font-semibold">Recommendation:</span> {selectedAnalysis.recommendation}</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default HRJobApplications;