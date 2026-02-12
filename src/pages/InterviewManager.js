// src/pages/InterviewManager.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

function InterviewManager({ navigate }) {
  const role = localStorage.getItem('role') || 'job_seeker';
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Interview Manager</h1>
            <p className="text-gray-600">Manage all your interview activities</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Quick Stats */}
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600">0</div>
              <div className="text-sm text-blue-800">Scheduled</div>
            </div>
            <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4">
              <div className="text-2xl font-bold text-yellow-600">0</div>
              <div className="text-sm text-yellow-800">In Progress</div>
            </div>
            <div className="bg-green-50 border border-green-100 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600">0</div>
              <div className="text-sm text-green-800">Completed</div>
            </div>
            <div className="bg-purple-50 border border-purple-100 rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-600">0</div>
              <div className="text-sm text-purple-800">Total</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 mb-8">
            <button
              onClick={() => navigate('/interviews')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              🎤 View All Interviews
            </button>
            
            {role === 'hr' && (
              <button
                onClick={() => navigate('/interview/schedule')}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
              >
                📅 Schedule New Interview
              </button>
            )}
            
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition"
            >
              ← Back to Dashboard
            </button>
          </div>

          {/* Info Cards */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-3">For Candidates</h3>
              <ul className="space-y-2 text-blue-700">
                <li>• View scheduled interviews</li>
                <li>• Join live interviews</li>
                <li>• Submit video/text responses</li>
                <li>• View feedback and scores</li>
                <li>• Improve with AI analysis</li>
              </ul>
            </div>
            
            {role === 'hr' && (
              <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-green-800 mb-3">For HR Managers</h3>
                <ul className="space-y-2 text-green-700">
                  <li>• Schedule interviews with candidates</li>
                  <li>• Generate AI-powered questions</li>
                  <li>• View candidate responses</li>
                  <li>• Analyze interview performance</li>
                  <li>• Make hiring decisions</li>
                </ul>
              </div>
            )}
          </div>

          {/* Upcoming Interviews Placeholder */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Interviews</h3>
            <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
              <div className="text-5xl mb-4">📅</div>
              <h4 className="text-lg font-semibold text-gray-700 mb-2">No interviews scheduled</h4>
              <p className="text-gray-500 mb-4">
                {role === 'hr' 
                  ? 'Schedule your first interview to get started.' 
                  : 'You don\'t have any interviews scheduled yet.'}
              </p>
              <button
                onClick={() => navigate('/interviews')}
                className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition"
              >
                Check for Interviews
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InterviewManager;