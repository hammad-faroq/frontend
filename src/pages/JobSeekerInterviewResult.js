// src/pages/JobSeekerInterviewResult.js
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { logoutUser } from "../services/api";
import { InterviewApi } from "../services/InterviewApi";

function JobSeekerInterviewResult() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [interview, setInterview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate("/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  useEffect(() => {
    fetchInterviewResult();
  }, [id]);

  const fetchInterviewResult = async () => {
    try {
      setLoading(true);
      const [interviewData, resultData] = await Promise.all([
        InterviewApi.getInterviewDetails(id),
        InterviewApi.getInterviewResult(id)
      ]);

      setInterview(interviewData);
      setResult(resultData);
    } catch (err) {
      console.error("Error fetching interview result:", err);
      setError("Failed to load interview results. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'completed':
        return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">Completed</span>;
      case 'in_progress':
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">In Progress</span>;
      case 'pending_review':
        return <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">Pending Review</span>;
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">Scheduled</span>;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar handleLogout={handleLogout} navigate={navigate} />
        <div className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            <button
              onClick={() => navigate(`/jobseeker/interview/${id}`)}
              className="flex items-center text-purple-600 hover:text-purple-800 mb-8"
            >
              <span className="mr-2">←</span> Back to Interview Details
            </button>
            
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading interview results...</p>
              <p className="text-gray-400 text-sm mt-2">Please wait while we fetch your results</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !interview) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar handleLogout={handleLogout} navigate={navigate} />
        <div className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            <button
              onClick={() => navigate("/jobseeker/interviews")}
              className="flex items-center text-purple-600 hover:text-purple-800 mb-8"
            >
              <span className="mr-2">←</span> Back to Interviews
            </button>
            
            <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">⚠️</span>
              </div>
              <h3 className="text-xl font-semibold text-red-800 mb-3">
                {error || "Results not available"}
              </h3>
              <p className="text-red-600 mb-6">
                The interview results are not available yet. Please check back later.
              </p>
              <button
                onClick={() => navigate(`/jobseeker/interview/${id}`)}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Back to Interview Details
              </button>
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
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate(`/jobseeker/interview/${id}`)}
              className="flex items-center text-purple-600 hover:text-purple-800 mb-4"
            >
              <span className="mr-2">←</span> Back to Interview Details
            </button>
            
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{interview.title}</h1>
                <div className="flex items-center gap-4">
                  {getStatusBadge(interview.status)}
                  <span className="text-gray-600">{interview.job_title || interview.company_name}</span>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-sm text-gray-500">Completed</div>
                <div className="text-lg font-semibold text-gray-800">
                  {formatDate(interview.completed_at || interview.updated_at)}
                </div>
              </div>
            </div>
          </div>

          {/* Overall Score Card */}
          {result?.overall_score !== undefined && (
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Overall Score</h2>
                  <p className="text-blue-100">
                    Based on your answers and interviewer assessment
                  </p>
                </div>
                <div className={`text-center ${getScoreBgColor(result.overall_score)} rounded-2xl p-6`}>
                  <div className={`text-5xl font-bold ${getScoreColor(result.overall_score)}`}>
                    {result.overall_score}
                  </div>
                  <div className={`text-lg font-semibold mt-1 ${getScoreColor(result.overall_score)}`}>
                    out of 100
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            {/* Skills Assessment */}
            {result?.skills_assessment && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Skills Assessment</h2>
                <div className="space-y-4">
                  {Object.entries(result.skills_assessment).map(([skill, score]) => (
                    <div key={skill}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium text-gray-700">{skill}</span>
                        <span className={`font-semibold ${getScoreColor(score)}`}>{score}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            score >= 80 ? 'bg-green-500' :
                            score >= 60 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${score}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Interview Details */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Interview Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Started At</label>
                  <p className="text-gray-800">{formatDate(interview.started_at)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Completed At</label>
                  <p className="text-gray-800">{formatDate(interview.completed_at)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Total Questions</label>
                  <p className="text-gray-800">{result?.total_questions || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Answered Questions</label>
                  <p className="text-gray-800">{result?.answered_questions || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Feedback Section */}
          {result?.feedback && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Interviewer Feedback</h2>
              <div className="space-y-4">
                {result.feedback.comments && (
                  <div>
                    <h3 className="font-medium text-gray-700 mb-2">Overall Comments</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-700 whitespace-pre-line">{result.feedback.comments}</p>
                    </div>
                  </div>
                )}

                {result.feedback.strengths && result.feedback.strengths.length > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-700 mb-2">Strengths</h3>
                    <div className="flex flex-wrap gap-2">
                      {result.feedback.strengths.map((strength, index) => (
                        <span key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                          {strength}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {result.feedback.improvements && result.feedback.improvements.length > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-700 mb-2">Areas for Improvement</h3>
                    <div className="flex flex-wrap gap-2">
                      {result.feedback.improvements.map((improvement, index) => (
                        <span key={index} className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
                          {improvement}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {result.feedback.recommendation && (
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium mr-3 ${
                        result.feedback.recommendation === 'hire' ? 'bg-green-100 text-green-800' :
                        result.feedback.recommendation === 'maybe' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {result.feedback.recommendation === 'hire' ? '✅ Recommended for Next Round' :
                         result.feedback.recommendation === 'maybe' ? '⚠️ Under Consideration' :
                         '❌ Not Selected'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Next Steps */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Next Steps</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                  <span className="text-blue-600">📞</span>
                </div>
                <h3 className="font-medium text-gray-800 mb-1">Follow-up Interview</h3>
                <p className="text-gray-600 text-sm">
                  You may be contacted for a follow-up interview within 3-5 business days.
                </p>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-3">
                  <span className="text-green-600">📊</span>
                </div>
                <h3 className="font-medium text-gray-800 mb-1">Skill Development</h3>
                <p className="text-gray-600 text-sm">
                  Check your profile for personalized skill improvement recommendations.
                </p>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                  <span className="text-purple-600">💼</span>
                </div>
                <h3 className="font-medium text-gray-800 mb-1">Browse More Jobs</h3>
                <p className="text-gray-600 text-sm">
                  Explore other opportunities that match your skills and experience.
                </p>
              </div>
            </div>
            
            <div className="mt-6 flex justify-center gap-3">
              <button
                onClick={() => navigate("/jobseeker/profile")}
                className="px-6 py-3 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 font-medium"
              >
                View Profile
              </button>
              <button
                onClick={() => navigate("/jobseeker/jobs")}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
              >
                Browse Jobs
              </button>
              <button
                onClick={() => navigate("/jobseeker/interviews")}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
              >
                Back to Interviews
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default JobSeekerInterviewResult;