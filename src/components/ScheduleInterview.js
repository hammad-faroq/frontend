// src/components/ScheduleInterview.js
import React, { useState, useEffect } from 'react';
import { interviewApi } from '../services/interviewApi';
import { useNavigate } from 'react-router-dom';

function ScheduleInterview() {
  const [formData, setFormData] = useState({
    candidate: '',
    job: '',
    interview_type: 'video',
    scheduled_date: '',
    duration_minutes: 45,
    question_count: 10
  });
  
  const [candidates, setCandidates] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [candidatesLoading, setCandidatesLoading] = useState(true);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchCandidates();
    fetchJobs();
  }, []);

  const fetchCandidates = async () => {
    try {
      setCandidatesLoading(true);
      const data = await interviewApi.getCandidates();
      setCandidates(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching candidates:', err);
      setError('Failed to load candidates. Please try again.');
    } finally {
      setCandidatesLoading(false);
    }
  };

  const fetchJobs = async () => {
    try {
      setJobsLoading(true);
      const data = await interviewApi.getHRJobs();
      setJobs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError('Failed to load jobs. Please try again.');
    } finally {
      setJobsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'duration_minutes' || name === 'question_count' 
        ? parseInt(value) 
        : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.candidate || !formData.job || !formData.scheduled_date) {
      alert('Please fill in all required fields.');
      return;
    }

    if (new Date(formData.scheduled_date) < new Date()) {
      alert('Interview must be scheduled for a future time.');
      return;
    }

    setLoading(true);
    try {
      // Add current user as interviewer
      const interviewData = {
        ...formData,
        interviewer: parseInt(localStorage.getItem('user_id')) || 1
      };

      const result = await interviewApi.scheduleInterview(interviewData);
      alert('Interview scheduled successfully!');
      navigate('/interviews');
    } catch (err) {
      console.error('Error scheduling interview:', err);
      const errorMsg = err.response?.data?.error || 
                      err.response?.data?.detail || 
                      'Failed to schedule interview. Please try again.';
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 30); // Minimum 30 minutes from now
    return now.toISOString().slice(0, 16);
  };

  if (candidatesLoading || jobsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h3 className="text-2xl font-semibold text-gray-800">Schedule New Interview</h3>
        <p className="text-gray-600">Fill in the details to schedule an interview</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Candidate Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Candidate *
          </label>
          <select
            name="candidate"
            value={formData.candidate}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Choose a candidate</option>
            {candidates.map(candidate => (
              <option key={candidate.id} value={candidate.id}>
                {candidate.first_name} {candidate.last_name} ({candidate.email})
              </option>
            ))}
          </select>
          {candidates.length === 0 && (
            <p className="text-sm text-red-500 mt-1">
              No candidates available. Please add candidates first.
            </p>
          )}
        </div>

        {/* Job Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Job Position *
          </label>
          <select
            name="job"
            value={formData.job}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Choose a job</option>
            {jobs.map(job => (
              <option key={job.id} value={job.id}>
                {job.title} - {job.company_name}
              </option>
            ))}
          </select>
          {jobs.length === 0 && (
            <p className="text-sm text-red-500 mt-1">
              No jobs available. Please create jobs first.
            </p>
          )}
        </div>

        {/* Interview Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Interview Type
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {['video', 'audio', 'text', 'live'].map(type => (
              <label key={type} className="flex items-center">
                <input
                  type="radio"
                  name="interview_type"
                  value={type}
                  checked={formData.interview_type === type}
                  onChange={handleChange}
                  className="mr-2"
                />
                <span className="capitalize">{type}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Date and Time */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date & Time *
            </label>
            <input
              type="datetime-local"
              name="scheduled_date"
              value={formData.scheduled_date}
              onChange={handleChange}
              min={getMinDateTime()}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duration (minutes)
            </label>
            <select
              name="duration_minutes"
              value={formData.duration_minutes}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="30">30 minutes</option>
              <option value="45">45 minutes</option>
              <option value="60">60 minutes</option>
              <option value="90">90 minutes</option>
            </select>
          </div>
        </div>

        {/* Questions Count */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Number of Questions
          </label>
          <select
            name="question_count"
            value={formData.question_count}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="5">5 questions</option>
            <option value="10">10 questions</option>
            <option value="15">15 questions</option>
            <option value="20">20 questions</option>
          </select>
          <p className="text-sm text-gray-500 mt-1">
            AI will generate questions based on job requirements and candidate resume
          </p>
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <button
            type="button"
            onClick={() => navigate('/interviews')}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || candidates.length === 0 || jobs.length === 0}
            className={`px-6 py-2 rounded-lg text-white transition ${
              loading || candidates.length === 0 || jobs.length === 0
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? (
              <span className="flex items-center">
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                Scheduling...
              </span>
            ) : (
              'Schedule Interview'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ScheduleInterview;