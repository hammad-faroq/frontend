// src/components/InterviewDashboard.js
import React, { useState, useEffect } from 'react';
import { interviewApi } from '../services/interviewApi';
import { useNavigate } from 'react-router-dom';

function InterviewDashboard() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [debugInfo, setDebugInfo] = useState('');
  const [role, setRole] = useState(localStorage.getItem('role') || 'job_seeker');
  const navigate = useNavigate();

  useEffect(() => {
    fetchInterviews();
  }, []);

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      setError('');
      setDebugInfo('Fetching interviews...');
      
      // Check if user is authenticated
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      const userRole = localStorage.getItem('role');
      
      setDebugInfo(`User role: ${userRole}, Token exists: ${!!token}`);
      
      if (!token) {
        setError('Please login first to view interviews.');
        setLoading(false);
        return;
      }

      const data = await interviewApi.getInterviews();
      setDebugInfo(`Received ${Array.isArray(data) ? data.length : 0} interviews`);
      
      if (Array.isArray(data)) {
        setInterviews(data);
      } else {
        setInterviews([]);
        setDebugInfo(prev => prev + ' - API returned non-array response');
      }
    } catch (err) {
      console.error('Error fetching interviews:', err);
      
      let errorMessage = 'Failed to load interviews. Please try again.';
      let debugDetails = '';
      
      if (err.response) {
        // Server responded with error
        const { status, data } = err.response;
        errorMessage = `Server error (${status}): ${data?.detail || data?.error || 'Unknown error'}`;
        debugDetails = `Status: ${status}, Data: ${JSON.stringify(data)}`;
      } else if (err.request) {
        // No response received
        errorMessage = 'Cannot connect to server. Please check if backend is running.';
        debugDetails = 'No response received from server';
      } else {
        // Request setup error
        errorMessage = `Request error: ${err.message}`;
        debugDetails = `Request error: ${err.message}`;
      }
      
      setError(errorMessage);
      setDebugInfo(debugDetails);
      setInterviews([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'Invalid date';
    }
  };

  const handleStartInterview = async (interviewId) => {
    if (window.confirm('Are you ready to start this interview?')) {
      try {
        setDebugInfo('Starting interview...');
        await interviewApi.startInterview(interviewId);
        navigate(`/interview/${interviewId}/live`);
      } catch (err) {
        const errorMsg = err.response?.data?.detail || err.response?.data?.error || err.message;
        alert(`Failed to start interview: ${errorMsg}`);
        setDebugInfo(`Start interview failed: ${errorMsg}`);
      }
    }
  };

  const handleJoinInterview = (interviewId, joinUrl) => {
    if (joinUrl) {
      window.open(joinUrl, '_blank');
    } else {
      navigate(`/interview/${interviewId}/live`);
    }
  };

  const handleCancelInterview = async (interviewId) => {
    if (window.confirm('Are you sure you want to cancel this interview?')) {
      try {
        setDebugInfo('Cancelling interview...');
        await interviewApi.cancelInterview(interviewId);
        fetchInterviews();
        alert('Interview cancelled successfully.');
      } catch (err) {
        const errorMsg = err.response?.data?.detail || err.response?.data?.error || err.message;
        alert(`Failed to cancel interview: ${errorMsg}`);
      }
    }
  };

  const handleViewFeedback = (interviewId) => {
    navigate(`/interview/${interviewId}/feedback`);
  };

  const handleViewDetails = (interviewId) => {
    navigate(`/interview/${interviewId}`);
  };

  const createTestInterview = async () => {
    if (role === 'hr') {
      try {
        setDebugInfo('Creating test interview...');
        
        // Get first available candidate and job
        const [candidates, jobs] = await Promise.all([
          interviewApi.getCandidates(),
          interviewApi.getHRJobs()
        ]);
        
        if (!candidates.length || !jobs.length) {
          alert('Need at least one candidate and job to create test interview');
          return;
        }
        
        const testData = {
          candidate: candidates[0].id,
          interviewer: parseInt(localStorage.getItem('user_id') || '1'),
          job: jobs[0].id,
          interview_type: 'video',
          scheduled_date: new Date(Date.now() + 86400000).toISOString(),
          duration_minutes: 30,
          question_count: 3
        };
        
        const result = await interviewApi.scheduleInterview(testData);
        alert('Test interview created successfully!');
        fetchInterviews();
      } catch (err) {
        const errorMsg = err.response?.data?.detail || err.response?.data?.error || err.message;
        alert(`Failed to create test interview: ${errorMsg}`);
        setDebugInfo(`Create test failed: ${errorMsg}`);
      }
    } else {
      alert('Only HR users can create test interviews.');
    }
  };

  const testAPIConnection = async () => {
    try {
      setDebugInfo('Testing API connection...');
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      
      if (!token) {
        setDebugInfo('No token found');
        alert('Please login first');
        return;
      }
      
      const response = await fetch('https://backendfyp-production-00a3.up.railway.app/interview/interviews/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      setDebugInfo(`API Test - Status: ${response.status}, Data: ${JSON.stringify(data).substring(0, 100)}...`);
      alert(`API Test Result:\nStatus: ${response.status}\nData length: ${Array.isArray(data) ? data.length : 'N/A'}`);
    } catch (err) {
      setDebugInfo(`API Test failed: ${err.message}`);
      alert(`API Test failed: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600">Loading interviews...</p>
        {debugInfo && <p className="text-xs text-gray-500 mt-2">{debugInfo}</p>}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Error Loading Interviews</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            <button
              onClick={fetchInterviews}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Try Again
            </button>
            <button
              onClick={testAPIConnection}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
            >
              Test API Connection
            </button>
            {role === 'hr' && (
              <button
                onClick={createTestInterview}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                Create Test Interview
              </button>
            )}
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
            >
              Back to Dashboard
            </button>
          </div>
          
          {/* Debug Info Panel */}
          {process.env.NODE_ENV === 'development' && debugInfo && (
            <div className="mt-4 p-4 bg-gray-100 border border-gray-300 rounded-lg">
              <h4 className="font-semibold text-gray-700 mb-2">Debug Information:</h4>
              <pre className="text-xs text-gray-600 overflow-auto max-h-40">
                {JSON.stringify({
                  role,
                  tokenExists: !!(localStorage.getItem('access_token') || localStorage.getItem('token')),
                  user_id: localStorage.getItem('user_id'),
                  backendUrl: 'https://backendfyp-production-00a3.up.railway.app/api/interview/interviews/',
                  debugInfo
                }, null, 2)}
              </pre>
              <button
                onClick={() => {
                  console.log('LocalStorage:', localStorage);
                  console.log('Error details:', error);
                }}
                className="mt-2 text-xs text-blue-600 hover:text-blue-800"
              >
                Log to Console
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-2xl font-semibold text-gray-800">Interview Dashboard</h3>
          <p className="text-gray-600 text-sm mt-1">
            {role === 'hr' ? 'Manage interviews with candidates' : 'Your scheduled interviews'}
          </p>
        </div>
        <div className="flex gap-3">
          {role === 'hr' && (
            <>
              <button
                onClick={() => navigate('/interview/schedule')}
                className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
              >
                <span>📅</span>
                Schedule Interview
              </button>
              {process.env.NODE_ENV === 'development' && (
                <button
                  onClick={testAPIConnection}
                  className="bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition text-sm"
                >
                  Test API
                </button>
              )}
            </>
          )}
          <button
            onClick={fetchInterviews}
            className="bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition flex items-center gap-2"
          >
            <span>🔄</span>
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-600">
            {interviews.filter(i => i.status === 'scheduled').length}
          </div>
          <div className="text-sm text-blue-800">Scheduled</div>
        </div>
        <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4">
          <div className="text-2xl font-bold text-yellow-600">
            {interviews.filter(i => i.status === 'in_progress').length}
          </div>
          <div className="text-sm text-yellow-800">In Progress</div>
        </div>
        <div className="bg-green-50 border border-green-100 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-600">
            {interviews.filter(i => i.status === 'completed').length}
          </div>
          <div className="text-sm text-green-800">Completed</div>
        </div>
        <div className="bg-gray-50 border border-gray-100 rounded-lg p-4">
          <div className="text-2xl font-bold text-gray-600">{interviews.length}</div>
          <div className="text-sm text-gray-800">Total Interviews</div>
        </div>
      </div>

      {/* Interviews Table */}
      {interviews.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
          <div className="text-5xl mb-4">🎤</div>
          <h4 className="text-lg font-semibold text-gray-700 mb-2">No Interviews Found</h4>
          <p className="text-gray-500 mb-6">
            {role === 'hr' 
              ? 'Schedule your first interview to get started.' 
              : 'You don\'t have any interviews scheduled yet.'}
          </p>
          <div className="flex justify-center gap-3">
            {role === 'hr' && (
              <>
                <button
                  onClick={() => navigate('/interview/schedule')}
                  className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition"
                >
                  Schedule Interview
                </button>
                <button
                  onClick={createTestInterview}
                  className="bg-green-600 text-white py-2 px-6 rounded-lg hover:bg-green-700 transition"
                >
                  Create Test Interview
                </button>
              </>
            )}
            <button
              onClick={fetchInterviews}
              className="bg-gray-200 text-gray-700 py-2 px-6 rounded-lg hover:bg-gray-300 transition"
            >
              Refresh
            </button>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Position
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {role === 'hr' ? 'Candidate' : 'Interviewer'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {interviews.map((interview) => (
                <tr key={interview.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {interview.job_title || interview.job?.title || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {role === 'hr' 
                        ? (interview.candidate_name || interview.candidate?.email || 'N/A')
                        : (interview.interviewer_name || interview.interviewer?.email || 'N/A')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatDate(interview.scheduled_date)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {interview.duration_minutes || 30} minutes
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(interview.status)}`}>
                      {interview.status ? interview.status.replace('_', ' ').toUpperCase() : 'UNKNOWN'}
                    </span>
                    {interview.overall_score && (
                      <div className="text-xs text-gray-500 mt-1">
                        Score: {Math.round(interview.overall_score * 100)}%
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewDetails(interview.id)}
                        className="text-blue-600 hover:text-blue-900 p-1"
                        title="View Details"
                      >
                        👁️
                      </button>
                      
                      {interview.status === 'scheduled' && (
                        <>
                          {role === 'job_seeker' ? (
                            <button
                              onClick={() => handleStartInterview(interview.id)}
                              className="text-green-600 hover:text-green-900 p-1"
                              title="Start Interview"
                            >
                              ▶️
                            </button>
                          ) : (
                            <button
                              onClick={() => handleJoinInterview(interview.id, interview.join_url)}
                              className="text-green-600 hover:text-green-900 p-1"
                              title="Join Interview"
                            >
                              🔗
                            </button>
                          )}
                        </>
                      )}
                      
                      {interview.status === 'completed' && (
                        <button
                          onClick={() => handleViewFeedback(interview.id)}
                          className="text-purple-600 hover:text-purple-900 p-1"
                          title="View Feedback"
                        >
                          📊
                        </button>
                      )}
                      
                      {role === 'hr' && interview.status === 'scheduled' && (
                        <button
                          onClick={() => handleCancelInterview(interview.id)}
                          className="text-red-600 hover:text-red-900 p-1"
                          title="Cancel Interview"
                        >
                          ❌
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Debug Panel (only in development) */}
      {process.env.NODE_ENV === 'development' && debugInfo && (
        <div className="mt-6 p-4 bg-gray-100 border border-gray-300 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-semibold text-gray-700">Debug Information</h4>
            <button
              onClick={() => setDebugInfo('')}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Clear
            </button>
          </div>
          <div className="text-xs text-gray-600">
            <div className="mb-1">Status: {loading ? 'Loading...' : error ? 'Error' : 'Loaded'}</div>
            <div className="mb-1">Interviews: {interviews.length}</div>
            <div>Last action: {debugInfo}</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default InterviewDashboard;