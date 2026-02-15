// src/pages/JobSeekerInterviews.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { logoutUser } from "../services/api";
import { manageCandidateInterviewFlow } from "../services/interviewApi";

function JobSeekerInterviews() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [resuming, setResuming] = useState(false);
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
    fetchInterviews();
  }, []);

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      if (!token) {
        setError("Please login to continue");
        setLoading(false);
        return;
      }

      const response = await fetch("https://backendfyp-production-00a3.up.railway.app/api/interview/candidate/upcoming-interviews/", {
        headers: { 
          "Authorization": `Token ${token}`,
          "Content-Type": "application/json"
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Fetched interviews:", data);
        setInterviews(data.upcoming_interviews || data || []);
      } else {
        setError("Failed to load interviews");
      }
    } catch (err) {
      console.error("Error fetching interviews:", err);
      setError("Failed to load interviews. Please try refreshing.");
    } finally {
      setLoading(false);
    }
  };

  const handleResumeInterview = async (interviewId) => {
    try {
      setResuming(interviewId);
      console.log(`Resuming interview ${interviewId}...`);
      
      // Check if interview is already in progress
      const status = await manageCandidateInterviewFlow(interviewId, 'get_status');
      console.log(`Interview ${interviewId} status:`, status);
      
      // Navigate to the interview page
      navigate(`/jobseeker/interview/${interviewId}`);
      
    } catch (err) {
      console.error("Error resuming interview:", err);
      alert(`Failed to resume interview: ${err.message || 'Please try again.'}`);
    } finally {
      setResuming(false);
    }
  };

  const handleStartInterview = async (interviewId) => {
    try {
      setResuming(interviewId);
      console.log(`Starting interview ${interviewId}...`);
      
      // Start the interview
      const result = await manageCandidateInterviewFlow(interviewId, 'start');
      console.log("Interview start result:", result);
      
      // Navigate to the interview page
      navigate(`/jobseeker/interview/${interviewId}`);
      
    } catch (err) {
      console.error("Error starting interview:", err);
      alert(`Failed to start interview: ${err.message || 'Please try again.'}`);
    } finally {
      setResuming(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'submitted': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusDisplay = (status) => {
    const statusMap = {
      'scheduled': 'Scheduled',
      'in_progress': 'In Progress',
      'submitted': 'Submitted for Review',
      'completed': 'Completed',
      'cancelled': 'Cancelled',
      'draft': 'Draft'
    };
    return statusMap[status] || status;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'TBD';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeRemaining = (scheduledDate) => {
    if (!scheduledDate) return null;
    const now = new Date();
    const scheduled = new Date(scheduledDate);
    const diffMs = scheduled - now;
    
    if (diffMs < 0) return "Started";
    
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 24) {
      return `Starts in ${Math.floor(diffHours / 24)} days`;
    } else if (diffHours > 0) {
      return `Starts in ${diffHours}h ${diffMinutes}m`;
    } else {
      return `Starts in ${diffMinutes} minutes`;
    }
  };

  const renderActionButton = (interview) => {
    if (interview.status === 'scheduled') {
      const timeRemaining = getTimeRemaining(interview.scheduled_date);
      
      // Check if it's time to start (15 minutes before scheduled time)
      const canStartEarly = () => {
        if (!interview.scheduled_date) return false;
        const now = new Date();
        const scheduled = new Date(interview.scheduled_date);
        const bufferMs = 15 * 60 * 1000; // 15 minutes in milliseconds
        return now >= (scheduled - bufferMs);
      };
      
      if (canStartEarly()) {
        return (
          <button
            onClick={() => handleStartInterview(interview.id)}
            disabled={resuming === interview.id}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm transition-colors shadow-sm disabled:bg-gray-400"
          >
            {resuming === interview.id ? 'Starting...' : 'Start Interview'}
          </button>
        );
      } else {
        return (
          <button
            disabled
            className="px-4 py-2 bg-gray-300 text-gray-600 rounded-lg font-medium text-sm cursor-not-allowed"
            title={timeRemaining || 'Not yet available'}
          >
            {timeRemaining || 'Not Available'}
          </button>
        );
      }
    }
    
    if (interview.status === 'in_progress') {
      return (
        <button
          onClick={() => handleResumeInterview(interview.id)}
          disabled={resuming === interview.id}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium text-sm transition-colors shadow-sm disabled:bg-purple-400"
        >
          {resuming === interview.id ? 'Loading...' : 'Continue Interview →'}
        </button>
      );
    }
    
    if (interview.status === 'submitted') {
      return (
        <button
          disabled
          className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg font-medium text-sm cursor-not-allowed"
        >
          Submitted for Review
        </button>
      );
    }
    
    if (interview.status === 'completed') {
      return (
        <button
          onClick={() => navigate(`/jobseeker/interview/${interview.id}/results`)}
          className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 font-medium text-sm transition-colors"
        >
          View Results
        </button>
      );
    }
    
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar handleLogout={handleLogout} navigate={navigate} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading interviews...</p>
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Interviews</h1>
            <p className="text-gray-600">Manage your scheduled interviews and view results</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8">
            <div className="flex items-center">
              <span className="text-red-500 mr-3">⚠️</span>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
            <div className="text-sm text-gray-500 mb-1">Total Interviews</div>
            <div className="text-2xl font-bold text-gray-900">{interviews.length}</div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
            <div className="text-sm text-gray-500 mb-1">In Progress</div>
            <div className="text-2xl font-bold text-yellow-600">
              {interviews.filter(i => i.status === 'in_progress').length}
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
            <div className="text-sm text-gray-500 mb-1">Upcoming</div>
            <div className="text-2xl font-bold text-blue-600">
              {interviews.filter(i => i.status === 'scheduled').length}
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
            <div className="text-sm text-gray-500 mb-1">Completed</div>
            <div className="text-2xl font-bold text-green-600">
              {interviews.filter(i => i.status === 'completed').length}
            </div>
          </div>
        </div>

        {/* Interviews Grid */}
        {interviews.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">🎤</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">No interviews scheduled</h3>
            <p className="text-gray-600 mb-6">You don't have any interviews scheduled yet. Keep applying to jobs!</p>
            <button
              onClick={() => navigate("/jobseeker/jobs")}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              Browse Jobs
            </button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-6">
            {interviews.map((interview) => (
              <div key={interview.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-300">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">{interview.title}</h3>
                    <p className="text-gray-600 mb-2">{interview.job_title || interview.company || interview.company_name}</p>
                    <div className="flex items-center gap-3 mb-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(interview.status)}`}>
                        {getStatusDisplay(interview.status)}
                      </span>
                      <span className="text-gray-500 text-sm">📍 {interview.mode || interview.interview_type || 'Online'}</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-semibold">
                    {interview.status === 'in_progress' ? '▶️' : 
                     interview.status === 'completed' ? '✅' : 
                     interview.status === 'submitted' ? '📤' : '🎯'}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Date & Time</p>
                    <p className="font-semibold text-gray-800">{formatDate(interview.scheduled_date || interview.scheduled_at)}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Duration</p>
                    <p className="font-semibold text-gray-800">{interview.duration_minutes || interview.duration || '30'} minutes</p>
                  </div>
                </div>
                
                {interview.description && (
                  <p className="text-gray-700 text-sm mb-4 line-clamp-2">
                    {interview.description}
                  </p>
                )}
                
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    ID: {interview.id.substring(0, 8)}...
                  </div>
                  {renderActionButton(interview)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default JobSeekerInterviews;