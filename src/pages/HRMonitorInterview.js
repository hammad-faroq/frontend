import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

function HRMonitorInterview() {
  const { interviewId } = useParams();
  const navigate = useNavigate();
  const [interview, setInterview] = useState(null);
  const [candidateProgress, setCandidateProgress] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(0);

  useEffect(() => {
    // Fetch interview details and candidate progress
    const fetchData = async () => {
      // Implement API call to get interview monitoring data
      // This should return:
      // - Interview details
      // - Candidate progress (questions answered, time spent)
      // - Current status
    };

    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [interviewId]);

  const handleEndInterview = async () => {
    if (window.confirm("Are you sure you want to end this interview? This will automatically submit candidate's answers.")) {
      // Call API to end interview
      // This should change status to 'submitted'
      navigate(`/hr/dashboard`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <button
              onClick={() => navigate(-1)}
              className="text-blue-600 hover:text-blue-800 mb-4 flex items-center gap-2"
            >
              ← Back to Dashboard
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Monitor Interview</h1>
            <p className="text-gray-600">
              Candidate: {interview?.candidate_name} • Interview ID: {interviewId}
            </p>
          </div>
          <button
            onClick={handleEndInterview}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition"
          >
            End Interview
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Stats Cards */}
          <div className="bg-white border rounded-xl p-4">
            <h3 className="text-sm font-medium text-gray-500">Time Remaining</h3>
            <p className="text-2xl font-bold text-gray-900">{timeRemaining} min</p>
          </div>
          <div className="bg-white border rounded-xl p-4">
            <h3 className="text-sm font-medium text-gray-500">Questions Answered</h3>
            <p className="text-2xl font-bold text-gray-900">
              {candidateProgress.answered || 0} / {candidateProgress.total || 0}
            </p>
          </div>
          <div className="bg-white border rounded-xl p-4">
            <h3 className="text-sm font-medium text-gray-500">Status</h3>
            <p className="text-2xl font-bold text-green-600">In Progress</p>
          </div>
        </div>

        {/* Progress Details */}
        <div className="bg-white border rounded-xl p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Interview Progress</h2>
          {/* Show list of questions with candidate progress */}
        </div>
      </div>
    </div>
  );
}

export default HRMonitorInterview;
