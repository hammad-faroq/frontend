import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { startInterview } from "../services/interviewApi";

function HRStartInterview() {
  const { interviewId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleStartInterview = async () => {
    if (!window.confirm("Are you sure you want to start this interview? The candidate will be notified.")) {
      return;
    }

    setLoading(true);
    try {
      // This API should change interview status to 'in_progress'
      await startInterview(interviewId);
      alert("Interview started successfully! Candidate can now begin.");
      navigate(`/hr/dashboard`);
    } catch (err) {
      console.error("Error starting interview:", err);
      setError("Failed to start interview. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🎯</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Start Interview</h2>
          <p className="text-gray-600 mt-2">You are about to start this interview session.</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-blue-800 mb-2">What happens next:</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Interview status will change to "In Progress"</li>
            <li>• Candidate will be notified to start</li>
            <li>• Timer will begin for the candidate</li>
            <li>• You can monitor progress from dashboard</li>
          </ul>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleCancel}
            disabled={loading}
            className="flex-1 bg-gray-200 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-300 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleStartInterview}
            disabled={loading}
            className="flex-1 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                Starting...
              </span>
            ) : (
              "Start Interview Now"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default HRStartInterview;
