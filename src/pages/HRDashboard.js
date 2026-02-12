import React, { useState, useEffect } from "react";
import HRDashboardStats from "./HRDashboardStats";
import HRJobsList from "./HRJobsList";
import HRInterviewsList from "./HRInterviewsList";
import JobModal from "./JobModal";
import InterviewModal from "./InterviewModal";
import ReviewModal from "./ReviewModal";
import { 
  listJobs, 
  getUserInfo 
} from "../services/api";
import {
  getHRJobs as fetchHRInterviews,
} from "../services/interviewApi";

function HRDashboard({ navigate }) {
  const [jobs, setJobs] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [showJobModal, setShowJobModal] = useState(false);
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedJobForInterview, setSelectedJobForInterview] = useState(null);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [editingJob, setEditingJob] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");
      
      // Fetch jobs
      const jobsData = await listJobs();
      const validJobs = Array.isArray(jobsData) ? jobsData : [];
      setJobs(validJobs);
      
      // Fetch interviews
      const interviewsData = await fetchHRInterviews();
      const validInterviews = Array.isArray(interviewsData) ? interviewsData : [];
      setInterviews(validInterviews);
      
      // Get user info
      try {
        const userData = await getUserInfo();
        setCurrentUser(userData);
      } catch (userErr) {
        console.warn("Could not fetch user info:", userErr);
        setCurrentUser({ name: "HR User", email: "hr@example.com" });
      }
      
    } catch (err) {
      console.error("Dashboard data error:", err);
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenScheduleInterview = (jobId) => {
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;
    
    setSelectedJobForInterview(job);
    setShowInterviewModal(true);
  };

  const handleEditJob = (job) => {
    console.log("Editing job:", job);
    
    // Format job data for the modal
    const jobToEdit = {
      id: job.id,
      title: job.title || "",
      description: job.description || "",
      requirements: job.requirements || "",
      location: job.location || "",
      salary: job.salary || "",
      employment_type: job.employment_type || "",
      experience_level: job.experience_level || "",
      education_required: job.education_required || "",
      company_name: job.company_name || "",
      application_deadline: job.application_deadline || "",
      ranking_config: job.ranking_config || {
        cgpa_weight: 0,
        skills_weight: 0,
        experience_weight: 0,
        project_weight: 0,
        llm_weight: 0,
        bert_weight: 0,
        custom_model_weight: 0,
        shortlist_count: 10
      },
      ...job
    };
    
    setEditingJob(jobToEdit);
    setShowJobModal(true);
  };

  const handleCreateJob = () => {
    setEditingJob(null);
    setShowJobModal(true);
  };

  const handleJobModalClose = () => {
    setShowJobModal(false);
    setEditingJob(null);
  };

  const handleJobModalSuccess = () => {
    setShowJobModal(false);
    setEditingJob(null);
    fetchDashboardData();
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="bg-white shadow rounded-lg p-6 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-2xl font-semibold text-gray-800">HR Dashboard</h3>
          <p className="text-gray-600 mt-1">
            Welcome back, {currentUser?.name || "HR"}! 👋
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-500">
            Role: <span className="font-medium text-blue-600">HR Manager</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
          {error}
          <button 
            onClick={fetchDashboardData}
            className="ml-4 text-red-800 underline hover:text-red-900"
          >
            Retry
          </button>
        </div>
      )}

      {/* Actions Section */}
      <div className="flex flex-wrap gap-3 mb-8">
        <button
          onClick={handleCreateJob}
          className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
        >
          <span>📝</span>
          Create Job
        </button>

        <button
          onClick={() => navigate("/jobs")}
          className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition flex items-center gap-2"
        >
          <span>📋</span>
          View All Jobs
        </button>

        <button
          onClick={() => navigate("/hr/analytics")}
          className="bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition flex items-center gap-2"
        >
          <span>📊</span>
          Analytics
        </button>

        <button
          onClick={() => navigate("/hr/interview-analytics")}
          className="bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition flex items-center gap-2"
        >
          <span>🎯</span>
          Interview Analytics
        </button>
      </div>

      {/* Stats Section */}
      <HRDashboardStats jobs={jobs} interviews={interviews} />

      {/* Jobs List Section */}
      <HRJobsList 
        jobs={jobs}
        onEditJob={handleEditJob}
        onViewJob={(jobId) => navigate(`/jobs/${jobId}`)}
        onScheduleInterview={handleOpenScheduleInterview}
        onDeleteJob={() => fetchDashboardData()}
      />

      {/* Interviews Section */}
      <HRInterviewsList 
        interviews={interviews}
        onReviewInterview={(interviewId) => {
          setSelectedInterview(interviewId);
          setShowReviewModal(true);
        }}
        onFinalizeInterview={() => fetchDashboardData()}
        onAddQuestions={(interviewId) => navigate(`/hr/interview/${interviewId}/add-questions`)}
        onViewResult={(interviewId) => navigate(`/hr/interview/${interviewId}/answers`)}
        onMonitorInterview={(interviewId) => navigate(`/interview/${interviewId}/monitor`)}
        onEndInterview={() => fetchDashboardData()}
        onCancelInterview={() => fetchDashboardData()}
        onMarkNoShow={() => fetchDashboardData()}
        onRescheduleInterview={(jobId) => handleOpenScheduleInterview(jobId)}
      />

      {/* Modals */}
      {showJobModal && (
        <JobModal
          initialJob={editingJob}
          onClose={handleJobModalClose}
          onSuccess={handleJobModalSuccess}
        />
      )}

      {showInterviewModal && selectedJobForInterview && (
        <InterviewModal
          job={selectedJobForInterview}
          onClose={() => {
            setShowInterviewModal(false);
            setSelectedJobForInterview(null);
          }}
          onSuccess={() => {
            setShowInterviewModal(false);
            setSelectedJobForInterview(null);
            fetchDashboardData();
          }}
        />
      )}

      {showReviewModal && selectedInterview && (
        <ReviewModal
          interviewId={selectedInterview}
          onClose={() => {
            setShowReviewModal(false);
            setSelectedInterview(null);
          }}
          onFinalize={() => {
            setShowReviewModal(false);
            setSelectedInterview(null);
            fetchDashboardData();
          }}
        />
      )}
    </div>
  );
}

export default HRDashboard;