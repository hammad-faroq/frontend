import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import InterviewService from '../services/interviewService';
import { getCandidateInterviewDetail, getUpcomingInterviews } from '../services/interviewApi';

const CandidateInterviewStart = () => {
  const { interviewId } = useParams();
  const navigate = useNavigate();
  
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState('');
  const [upcomingInterviews, setUpcomingInterviews] = useState([]);

  useEffect(() => {
    loadInterviewDetails();
    loadUpcomingInterviews();
    
    return () => {
      InterviewService.reset();
    };
  }, [interviewId]);

  const loadInterviewDetails = async () => {
    try {
      setLoading(true);
      const data = await getCandidateInterviewDetail(interviewId);
      setInterview(data);
      
      // Check if interview can be started
      if (data.status === 'completed') {
        navigate(`/jobseeker/interview/${interviewId}/result`);
      } else if (data.status === 'in_progress') {
        navigate(`/jobseeker/interview/${interviewId}/questions`);
      }
      
    } catch (err) {
      console.error('Failed to load interview:', err);
      setError(err.message || 'Failed to load interview details');
    } finally {
      setLoading(false);
    }
  };

  const loadUpcomingInterviews = async () => {
    try {
      const interviews = await getUpcomingInterviews();
      setUpcomingInterviews(interviews);
    } catch (err) {
      console.error('Failed to load upcoming interviews:', err);
    }
  };

  const handleStartInterview = async () => {
    if (!window.confirm('Are you ready to begin the interview? Make sure you are in a quiet environment and have enough time to complete it.')) {
      return;
    }

    try {
      setStarting(true);
      setError('');

      const result = await InterviewService.startInterview(interviewId);
      
      if (result.success) {
        // Navigate to questions page
        navigate(`/jobseeker/interview/${interviewId}/questions`);
      } else {
        setError('Failed to start interview. Please try again.');
      }
    } catch (err) {
      console.error('Start interview error:', err);
      setError(err.message || 'Failed to start interview. Please try again.');
    } finally {
      setStarting(false);
    }
  };

  const handleLogout = async () => {
    // Your logout logic here
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar handleLogout={handleLogout} navigate={navigate} />
        <div className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading interview details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !interview) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar handleLogout={handleLogout} navigate={navigate} />
        <div className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
              <h3 className="text-red-800 font-semibold text-lg mb-2">Error</h3>
              <p className="text-red-600">{error}</p>
              <button
                onClick={() => navigate('/jobseeker/interviews')}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Back to Interviews
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar handleLogout={handleLogout} navigate={navigate} />
      
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => navigate('/jobseeker/interviews')}
            className="flex items-center text-purple-600 hover:text-purple-800 mb-8"
          >
            <span className="mr-2">←</span> Back to Interviews
          </button>

          {/* Main Content */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Interview Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Interview Header */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                      {interview?.title || 'Interview Preparation'}
                    </h1>
                    <div className="flex items-center gap-4">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                        {interview?.status?.replace('_', ' ') || 'Scheduled'}
                      </span>
                      <span className="text-gray-600">{interview?.job_title}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Interview ID</div>
                    <div className="font-mono text-gray-800">{interviewId.substring(0, 8)}...</div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Estimated Duration
                      </label>
                      <p className="text-lg font-semibold text-gray-800">
                        {interview?.duration || '45-60 minutes'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Question Types
                      </label>
                      <p className="text-lg font-semibold text-gray-800">
                        Technical, Behavioral, Problem-solving
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Total Questions
                      </label>
                      <p className="text-lg font-semibold text-gray-800">
                        {interview?.total_questions || '10-15 questions'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Auto-Scoring
                      </label>
                      <p className="text-lg font-semibold text-gray-800">Enabled ✓</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Instructions</h2>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                      <span className="text-purple-600">1</span>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800 mb-1">Read Questions Carefully</h3>
                      <p className="text-gray-600">
                        Take time to understand each question before answering. You can flag questions to review later.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                      <span className="text-purple-600">2</span>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800 mb-1">Manage Your Time</h3>
                      <p className="text-gray-600">
                        Each question has a suggested time limit. Keep an eye on the timer to ensure you complete all questions.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                      <span className="text-purple-600">3</span>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800 mb-1">Save Your Answers</h3>
                      <p className="text-gray-600">
                        Answers are auto-saved, but you can also manually save. You can review and change answers before final submission.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                      <span className="text-purple-600">4</span>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800 mb-1">Final Submission</h3>
                      <p className="text-gray-600">
                        Once you submit all answers, you cannot change them. Make sure you're ready before final submission.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Technical Requirements */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Technical Requirements</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <span className="text-green-600 mr-2">✓</span>
                      <span className="font-medium text-gray-800">Stable Internet</span>
                    </div>
                    <p className="text-sm text-gray-600">Minimum 5 Mbps connection recommended</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <span className="text-green-600 mr-2">✓</span>
                      <span className="font-medium text-gray-800">Modern Browser</span>
                    </div>
                    <p className="text-sm text-gray-600">Chrome, Firefox, Edge, or Safari latest</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <span className="text-green-600 mr-2">✓</span>
                      <span className="font-medium text-gray-800">JavaScript Enabled</span>
                    </div>
                    <p className="text-sm text-gray-600">Required for interactive components</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <span className="text-green-600 mr-2">✓</span>
                      <span className="font-medium text-gray-800">Cookies Enabled</span>
                    </div>
                    <p className="text-sm text-gray-600">For session management and progress saving</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Start Interview */}
            <div className="space-y-6">
              {/* Start Interview Card */}
              <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl p-6 text-white">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-2xl">🚀</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Ready to Begin?</h3>
                    <p className="text-green-100 text-sm">Start your interview now</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-white/10 p-4 rounded-lg">
                    <p className="text-sm">
                      <span className="font-medium">Important:</span> Once started, the interview must be completed in one sitting. You cannot pause and resume later.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center">
                      <span className="mr-2">✅</span>
                      <span className="text-sm">All answers auto-saved</span>
                    </div>
                    <div className="flex items-center">
                      <span className="mr-2">✅</span>
                      <span className="text-sm">Timer for each question</span>
                    </div>
                    <div className="flex items-center">
                      <span className="mr-2">✅</span>
                      <span className="text-sm">Question navigation allowed</span>
                    </div>
                    <div className="flex items-center">
                      <span className="mr-2">✅</span>
                      <span className="text-sm">Final review before submission</span>
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-500/20 border border-red-400/30 p-3 rounded-lg">
                      <p className="text-sm text-red-100">{error}</p>
                    </div>
                  )}

                  <button
                    onClick={handleStartInterview}
                    disabled={starting}
                    className="w-full py-4 bg-white text-green-600 rounded-lg hover:bg-green-50 font-semibold text-lg transition-colors flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {starting ? (
                      <>
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mr-3"></div>
                        Starting Interview...
                      </>
                    ) : (
                      'Start Interview Now'
                    )}
                  </button>

                  <p className="text-green-200 text-xs text-center">
                    Estimated completion time: {interview?.duration || '45-60 minutes'}
                  </p>
                </div>
              </div>

              {/* Preparation Checklist */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-800 mb-4">Preparation Checklist</h3>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded text-purple-600 mr-3" />
                    <span className="text-gray-700">Quiet environment secured</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded text-purple-600 mr-3" />
                    <span className="text-gray-700">Phone on silent mode</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded text-purple-600 mr-3" />
                    <span className="text-gray-700">Notebook and pen ready</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded text-purple-600 mr-3" />
                    <span className="text-gray-700">Water/refreshments nearby</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded text-purple-600 mr-3" />
                    <span className="text-gray-700">Emergency contact informed</span>
                  </label>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="font-medium text-gray-700 mb-2">Need Help?</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Technical issues or questions before starting?
                  </p>
                  <button
                    onClick={() => navigate('/support')}
                    className="w-full py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Contact Support
                  </button>
                </div>
              </div>

              {/* Upcoming Interviews */}
              {upcomingInterviews.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <h3 className="font-semibold text-gray-800 mb-4">Your Upcoming Interviews</h3>
                  <div className="space-y-3">
                    {upcomingInterviews.slice(0, 3).map(interview => (
                      <div
                        key={interview.id}
                        className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                        onClick={() => navigate(`/jobseeker/interview/${interview.id}`)}
                      >
                        <div className="font-medium text-gray-800">{interview.title}</div>
                        <div className="text-sm text-gray-600">
                          {new Date(interview.scheduled_date).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                  {upcomingInterviews.length > 3 && (
                    <button
                      onClick={() => navigate('/jobseeker/interviews')}
                      className="w-full mt-3 py-2 text-sm text-purple-600 hover:text-purple-800"
                    >
                      View All ({upcomingInterviews.length})
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateInterviewStart;