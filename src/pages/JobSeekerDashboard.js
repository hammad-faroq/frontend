// src/pages/JobSeekerDashboard.js
import React, { useState, useEffect, useCallback } from "react";
import { 
  listJobs, 
  getAppliedJobs, 
  getResumeAnalysis,
  getInterviewPreparation,
  generateMoreQuestions,
  sendMockInterviewMessage,
  getSimilarJobs 
} from "../services/api";
import { useNavigate } from "react-router-dom";
import {
  ArrowPathIcon,
  DocumentArrowUpIcon,
  BriefcaseIcon,
  ChatBubbleLeftRightIcon,
  UserIcon,
  SparklesIcon,
  CheckCircleIcon,
  CalendarIcon,
  AcademicCapIcon,
  WrenchScrewdriverIcon,
  EyeIcon,
  BoltIcon,
  CpuChipIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/24/outline";

function JobSeekerDashboard() {
  const [jobs, setJobs] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [interviewPrep, setInterviewPrep] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [matchedJobs, setMatchedJobs] = useState([]);
  const navigate = useNavigate();

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      if (!token) {
        setError("Please login to continue");
        setLoading(false);
        return;
      }

      // Fetch all data in parallel
      const [jobsData, appliedData, analysisData, interviewPrepData, similarJobsData] = await Promise.all([
        listJobs().catch(err => {
          console.error("Error fetching jobs:", err);
          return [];
        }),
        getAppliedJobs().catch(err => {
          console.error("Error fetching applied jobs:", err);
          return [];
        }),
        getResumeAnalysis().catch(err => {
          console.error("Error fetching analysis:", err);
          return null;
        }),
        getInterviewPreparation().catch(err => {
          console.error("Error fetching interview preparation:", err);
          return { count: 0, data: [] };
        }),
        getSimilarJobs().catch(err => {
          console.error("Error fetching similar jobs:", err);
          return { matched_jobs: [] };
        })
      ]);

      // Normalize applied jobs
      const normalizedApplied = Array.isArray(appliedData)
        ? appliedData.map(job => ({
            id: job.id || job.job_id,
            job_title: job.title || job.job_title,
            company_name: job.company_name || job.company,
            applied_at: job.applied_at || job.submitted_at || new Date().toISOString(),
            status: job.status || 'submitted',
          }))
        : [];

      // Extract upcoming interviews from interview preparation data
      let upcomingInterviews = [];
      if (interviewPrepData && interviewPrepData.data && Array.isArray(interviewPrepData.data)) {
        upcomingInterviews = interviewPrepData.data.map(prep => ({
          id: prep.job_id,
          title: `Interview Prep: ${prep.job_title}`,
          company: prep.company,
          job_title: prep.job_title,
          status: 'scheduled',
          scheduled_date: new Date().toISOString(),
          preparation_data: prep.interview_preparation
        }));
      }

      // Try to fetch additional interviews
      let additionalInterviews = [];
      try {
        const response = await fetch("https://backendfyp-production-00a3.up.railway.app/api/interview/candidate/upcoming-interviews/", {
          headers: { 
            "Authorization": `Token ${token}`,
            "Content-Type": "application/json"
          },
        });

        if (response.ok) {
          const data = await response.json();
          additionalInterviews = data.upcoming_interviews || data || [];
        }
      } catch (interviewErr) {
        console.warn("Could not fetch additional interviews:", interviewErr);
      }

      // Set state
      setJobs(Array.isArray(jobsData) ? jobsData : []);
      setAppliedJobs(normalizedApplied);
      setAnalysis(analysisData || null);
      setInterviewPrep(interviewPrepData.data || []);
      setInterviews([...upcomingInterviews, ...additionalInterviews]);
      setMatchedJobs(similarJobsData.matched_jobs || []);
      
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to load dashboard data. Please try refreshing.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const handleGenerateMoreQuestions = async (jobId) => {
    try {
      setInterviewPrep(prev => prev.map(prep => 
        prep.job_id === jobId ? { ...prep, generating: true } : prep
      ));
      
      const result = await generateMoreQuestions(jobId);
      
      if (result?.message === "More questions generated successfully") {
        if (result.new_questions) {
          setInterviewPrep(prev => prev.map(prep => {
            if (prep.job_id === jobId) {
              const updatedPrep = { ...prep };
              
              if (result.new_questions.technical_questions) {
                updatedPrep.interview_preparation = {
                  ...updatedPrep.interview_preparation,
                  technical_questions: [
                    ...(updatedPrep.interview_preparation?.technical_questions || []),
                    ...result.new_questions.technical_questions
                  ]
                };
              }
              
              if (result.new_questions.behavioral_questions) {
                updatedPrep.interview_preparation = {
                  ...updatedPrep.interview_preparation,
                  behavioral_questions: [
                    ...(updatedPrep.interview_preparation?.behavioral_questions || []),
                    ...result.new_questions.behavioral_questions
                  ]
                };
              }
              
              return { ...updatedPrep, generating: false, updated: true };
            }
            return prep;
          }));
          
          const techCount = result.new_questions.technical_questions?.length || 0;
          const behavioralCount = result.new_questions.behavioral_questions?.length || 0;
          
          alert(`✅ Successfully generated ${techCount} technical and ${behavioralCount} behavioral questions!`);
        } else {
          await fetchDashboardData();
          alert("✅ Successfully generated more interview questions!");
        }
      }
    } catch (error) {
      console.error("Error generating more questions:", error);
      alert("❌ Failed to generate more questions. Please try again.");
      setInterviewPrep(prev => prev.map(prep => 
        prep.job_id === jobId ? { ...prep, generating: false } : prep
      ));
    }
  };

  const handleMockInterview = async (jobId) => {
    const job = interviewPrep.find(prep => prep.job_id === jobId);
    if (!job) return;
    
    const message = prompt(`Enter your message for the ${job.job_title} mock interview at ${job.company}:`);
    if (message) {
      try {
        const response = await sendMockInterviewMessage(jobId, message);
        alert(`🤖 Mock Interview Response:\n\n${response.reply}\n\n💡 Tip: Go to the Interview Preparation page for a full interactive mock interview session.`);
      } catch (error) {
        console.error("Error in mock interview:", error);
        alert("❌ Failed to get response from mock interview. Please try again.");
      }
    }
  };

  const refreshInterviewPrep = async () => {
    setRefreshing(true);
    try {
      const data = await getInterviewPreparation();
      if (data && data.data) {
        setInterviewPrep(data.data);
      }
    } catch (error) {
      console.error("Error refreshing interview prep:", error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const quickActions = [
    {
      title: "Upload Resume",
      description: "Get personalized insights and job matches",
      icon: DocumentArrowUpIcon,
      color: "from-blue-600 to-blue-700",
      action: () => navigate("/jobseeker/upload-resume"),
      count: null
    },
    {
      title: "Browse Jobs",
      description: "Find your next career opportunity",
      icon: BriefcaseIcon,
      color: "from-green-600 to-green-700",
      action: () => navigate("/jobseeker/jobs"),
      count: jobs.length
    },
    {
      title: "Job Matches",
      description: "Personalized job recommendations",
      icon: SparklesIcon,
      color: "from-indigo-600 to-indigo-700",
      action: () => navigate("/matches"),
      count: matchedJobs.length
    },
    {
      title: "Interview Prep",
      description: "Prepare with AI-generated questions",
      icon: ChatBubbleLeftRightIcon,
      color: "from-purple-600 to-purple-700",
      action: () => navigate("/jobseeker/interview-prep"),
      count: interviewPrep.length
    },
    {
      title: "Profile",
      description: "View and edit your profile",
      icon: UserIcon,
      color: "from-orange-600 to-orange-700",
      action: () => navigate("/jobseeker/profile"),
      count: null
    }
  ];

  const stats = [
    { 
      title: "Applied Jobs", 
      value: appliedJobs.length, 
      subtitle: "Total applications", 
      icon: CheckCircleIcon,
      color: "from-blue-500 to-blue-600",
      link: "/jobseeker/applications" 
    },
    { 
      title: "Upcoming Interviews", 
      value: interviews.filter(i => i.status === 'scheduled').length, 
      subtitle: "Scheduled interviews", 
      icon: CalendarIcon,
      color: "from-green-500 to-green-600",
      link: "/jobseeker/interviews" 
    },
    { 
      title: "Interview Prep", 
      value: interviewPrep.length, 
      subtitle: "Jobs prepared for", 
      icon: AcademicCapIcon,
      color: "from-purple-500 to-purple-600",
      link: "/jobseeker/interview-prep" 
    },
    { 
      title: "Skills Identified", 
      value: analysis?.resume_summary?.primary_skills?.length || "0", 
      subtitle: "From resume analysis", 
      icon: WrenchScrewdriverIcon,
      color: "from-orange-500 to-orange-600",
      link: "/jobseeker/skills" 
    },
    {
      title: "Job Matches",
      value: matchedJobs.length,
      subtitle: "Personalized matches",
      icon: SparklesIcon,
      color: "from-indigo-500 to-indigo-600",
      link: "/matches"
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-6"></div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Loading Dashboard</h3>
          <p className="text-gray-500">Fetching your personalized data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ExclamationTriangleIcon className="h-10 w-10 text-red-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-3">Something went wrong</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            <button 
              onClick={fetchDashboardData}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Try Again
            </button>
            <button 
              onClick={() => navigate("/login")}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Job Seeker Dashboard</h1>
              <p className="text-gray-600">Welcome back! Here's your personalized career overview</p>
            </div>
            <button
              onClick={fetchDashboardData}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              <ArrowPathIcon className="h-4 w-4" />
              Refresh Data
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Quick Actions</h2>
            <p className="text-sm text-gray-500">Get started with these tools</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className={`bg-gradient-to-r ${action.color} rounded-2xl p-5 text-white cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-[1.02] text-left group`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <action.icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-lg truncate">{action.title}</h3>
                      {action.count !== null && (
                        <span className="bg-white/30 text-white text-xs font-medium px-2 py-1 rounded-full">
                          {action.count}
                        </span>
                      )}
                    </div>
                    <p className="text-white/80 text-sm line-clamp-2">{action.description}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center text-white/70 text-sm group-hover:text-white transition-colors">
                  <span>Get Started</span>
                  <ChevronRightIcon className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Stats Overview */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Your Career Overview</h2>
            <p className="text-sm text-gray-500">Real-time metrics</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {stats.map((stat, index) => (
              <div
                key={index}
                onClick={() => navigate(stat.link)}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-lg transition-all duration-300 group hover:border-gray-300"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-500 text-sm font-medium mb-2 truncate">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-800 mb-1">{stat.value}</p>
                    <p className="text-gray-400 text-xs truncate">{stat.subtitle}</p>
                  </div>
                  <div className={`w-14 h-14 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center text-white ml-4 group-hover:scale-110 transition-transform`}>
                    <stat.icon className="h-7 w-7" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Interview Preparation */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 h-full">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">Interview Preparation</h2>
                  <p className="text-gray-500 text-sm">Practice with AI-generated questions</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={refreshInterviewPrep}
                    disabled={refreshing}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <ArrowPathIcon className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                    {refreshing ? "Refreshing..." : "Refresh"}
                  </button>
                  <button 
                    onClick={() => navigate("/jobseeker/interview-prep")}
                    className="flex items-center gap-2 px-4 py-2 text-sm bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg font-medium transition-colors"
                  >
                    <EyeIcon className="h-4 w-4" />
                    View All
                  </button>
                </div>
              </div>
              
              {interviewPrep.length === 0 ? (
                <div className="text-center py-10">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ChatBubbleLeftRightIcon className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">No Interview Preparation</h3>
                  <p className="text-gray-500 mb-4 max-w-md mx-auto">
                    Start preparing for interviews by selecting jobs you're interested in
                  </p>
                  <button 
                    onClick={() => navigate("/jobseeker/jobs")}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                  >
                    <MagnifyingGlassIcon className="h-4 w-4" />
                    Browse Jobs
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {interviewPrep.slice(0, 3).map((prep) => (
                    <div key={prep.job_id} className="border border-gray-100 rounded-xl p-4 hover:bg-gray-50 transition-colors group">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800 mb-1">{prep.job_title}</h3>
                          <p className="text-sm text-gray-600">{prep.company}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {prep.updated && (
                            <span className="text-xs font-medium bg-green-100 text-green-800 px-2 py-1 rounded animate-pulse">
                              Updated
                            </span>
                          )}
                          <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            Prepared
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-3 mb-4">
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <div className="text-lg font-bold text-blue-600">
                            {prep.interview_preparation?.technical_questions?.length || 0}
                          </div>
                          <div className="text-xs text-gray-600 font-medium">Tech Questions</div>
                        </div>
                        <div className="text-center p-3 bg-purple-50 rounded-lg">
                          <div className="text-lg font-bold text-purple-600">
                            {prep.interview_preparation?.behavioral_questions?.length || 0}
                          </div>
                          <div className="text-xs text-gray-600 font-medium">Behavioral</div>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <div className="text-lg font-bold text-green-600">
                            {(prep.interview_preparation?.technical_questions?.length || 0) + 
                             (prep.interview_preparation?.behavioral_questions?.length || 0)}
                          </div>
                          <div className="text-xs text-gray-600 font-medium">Total</div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleGenerateMoreQuestions(prep.job_id)}
                          disabled={prep.generating}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg font-medium transition-colors disabled:opacity-50"
                        >
                          {prep.generating ? (
                            <>
                              <ArrowPathIcon className="h-4 w-4 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <BoltIcon className="h-4 w-4" />
                              Generate More
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleMockInterview(prep.job_id)}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg font-medium transition-colors"
                        >
                          <CpuChipIcon className="h-4 w-4" />
                          Mock Interview
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Interviews */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 h-full">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Upcoming Interviews</h2>
                <p className="text-gray-500 text-sm">Scheduled sessions</p>
              </div>
              <button 
                onClick={() => navigate("/jobseeker/interviews")}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-50 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
              >
                <EyeIcon className="h-4 w-4" />
                View All
              </button>
            </div>
            
            {interviews.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CalendarIcon className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No Upcoming Interviews</h3>
                <p className="text-gray-500 mb-4">You don't have any interviews scheduled yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {interviews.slice(0, 4).map((interview) => (
                  <div key={interview.id} className="p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-800 line-clamp-2">{interview.title}</h3>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        interview.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                        interview.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {interview.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{interview.company || interview.company_name}</p>
                    {interview.scheduled_date && (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <CalendarIcon className="h-4 w-4" />
                        <span>
                          {new Date(interview.scheduled_date).toLocaleDateString()} at{' '}
                          {new Date(interview.scheduled_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Content Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Applied Jobs */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Recent Applications</h2>
                <p className="text-gray-500 text-sm">Track your job applications</p>
              </div>
              <button 
                onClick={() => navigate("/jobseeker/applications")}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg font-medium transition-colors"
              >
                <EyeIcon className="h-4 w-4" />
                View All
              </button>
            </div>
            
            {appliedJobs.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DocumentArrowUpIcon className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No Applications Yet</h3>
                <p className="text-gray-500 mb-4">You haven't applied to any jobs yet</p>
                <button 
                  onClick={() => navigate("/matches")}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <SparklesIcon className="h-4 w-4" />
                  Find Matched Jobs
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {appliedJobs.slice(0, 4).map((application) => (
                  <div key={application.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors group">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-800 mb-1 truncate">{application.job_title}</h3>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                        <span className="truncate">{application.company_name}</span>
                        <span className="text-gray-400">•</span>
                        <span>Applied: {new Date(application.applied_at).toLocaleDateString()}</span>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          application.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                          application.status === 'reviewed' ? 'bg-yellow-100 text-yellow-800' :
                          application.status === 'accepted' ? 'bg-green-100 text-green-800' :
                          application.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {application.status || 'Submitted'}
                        </span>
                      </div>
                    </div>
                    <button 
                      onClick={() => navigate(`/jobseeker/application/${application.id}`)}
                      className="ml-4 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors font-medium"
                    >
                      View
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Career Insights */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Career Insights</h2>
                <p className="text-gray-500 text-sm">Based on your resume analysis</p>
              </div>
              {analysis && (
                <button 
                  onClick={() => navigate("/jobseeker/analysis")}
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-green-50 text-green-700 hover:bg-green-100 rounded-lg font-medium transition-colors"
                >
                  <EyeIcon className="h-4 w-4" />
                  Full Analysis
                </button>
              )}
            </div>
            
            {!analysis ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DocumentArrowUpIcon className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No Resume Analysis</h3>
                <p className="text-gray-500 mb-4">Upload your resume to get personalized insights</p>
                <button 
                  onClick={() => navigate("/jobseeker/upload-resume")}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  <DocumentArrowUpIcon className="h-4 w-4" />
                  Upload Resume
                </button>
              </div>
            ) : analysis.career_insights?.suitable_roles ? (
              <div className="space-y-4">
                {analysis.career_insights.suitable_roles.slice(0, 3).map((role, idx) => (
                  <div key={idx} className="p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-gray-800">{role.role}</h4>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        role.match_score >= 80 ? "bg-green-100 text-green-800" :
                        role.match_score >= 60 ? "bg-yellow-100 text-yellow-800" :
                        "bg-red-100 text-red-800"
                      }`}>
                        {role.match_score}% Match
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{role.reason}</p>
                    {role.skills && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {role.skills.slice(0, 3).map((skill, skillIdx) => (
                          <span 
                            key={skillIdx} 
                            className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                          >
                            {skill}
                          </span>
                        ))}
                        {role.skills.length > 3 && (
                          <span className="px-2 py-1 text-gray-500 text-xs">
                            +{role.skills.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No career insights available yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default JobSeekerDashboard;