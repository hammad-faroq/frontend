
import React, { useState, useEffect } from 'react';
import JobPostingForm from './JobPostingForm';
import API from "../services/api";

const JobListComponent = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // API Base URL
  const API_BASE_URL = API.JOBS;

  // Simple API service methods
  const apiCall = async (url, options = {}) => {
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Network error' }));
        throw new Error(error.error || error.detail || 'Something went wrong');
      }

      // Handle delete responses
      if (response.status === 204) {
        return { success: true };
      }

      return response.json();
    } catch (error) {
      throw error;
    }
  };

  const loadJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      const jobsData = await apiCall(API_BASE_URL);
      // Handle both array and paginated response
      setJobs(Array.isArray(jobsData) ? jobsData : jobsData.results || []);
    } catch (err) {
      setError(err.message);
      console.error('Failed to load jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const handleDelete = async (jobId) => {
    try {
      await apiCall(`${API_BASE_URL}/${jobId}/`, {
        method: 'DELETE',
      });
      setJobs(prev => prev.filter(job => job.id !== jobId));
      setDeleteConfirm(null);
    } catch (err) {
      setError('Failed to delete job: ' + err.message);
    }
  };

  const handleFormSuccess = () => {
    setShowCreateForm(false);
    setEditingJob(null);
    loadJobs();
  };

  const filteredJobs = jobs.filter(job =>
    job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    if (!dateString) return 'No deadline';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isDeadlineSoon = (deadline) => {
    if (!deadline) return false;
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays >= 0;
  };

  const isDeadlinePassed = (deadline) => {
    if (!deadline) return false;
    return new Date(deadline) < new Date();
  };

  if (showCreateForm) {
    return (
      <JobPostingForm 
        onSuccess={handleFormSuccess}
        onCancel={() => setShowCreateForm(false)}
      />
    );
  }

  if (editingJob) {
    return (
      <JobPostingForm 
        jobToEdit={editingJob}
        onSuccess={handleFormSuccess}
        onCancel={() => setEditingJob(null)}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Job Postings</h1>
            <p className="text-gray-600 mt-1">Manage and view all job postings</p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            <span className="text-lg mr-2">+</span>
            Create Job
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            🔍
          </div>
          <input
            type="text"
            placeholder="Search jobs by title, company, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading jobs...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
          <button
            onClick={loadJobs}
            className="mt-2 text-red-600 hover:text-red-800 font-medium"
          >
            Try again
          </button>
        </div>
      )}

      {/* Jobs Grid */}
      {!loading && !error && (
        <>
          <div className="mb-4 text-sm text-gray-600">
            Showing {filteredJobs.length} of {jobs.length} jobs
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredJobs.map((job) => (
              <div
                key={job.id}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow p-6 border"
              >
                {/* Job Header */}
                <div className="mb-4">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                    {job.title}
                  </h3>
                  {job.company_name && (
                    <div className="flex items-center text-gray-600 mb-2">
                      <span className="text-sm mr-1">🏢</span>
                      <span className="text-sm">{job.company_name}</span>
                    </div>
                  )}
                </div>

                {/* Job Description Preview */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {job.description}
                </p>

                {/* Deadline */}
                <div className="mb-4">
                  <div className="flex items-center">
                    <span className="mr-1">📅</span>
                    <span 
                      className={`text-xs font-medium px-2 py-1 rounded-full ${
                        isDeadlinePassed(job.application_deadline)
                          ? 'bg-red-100 text-red-800'
                          : isDeadlineSoon(job.application_deadline)
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {isDeadlinePassed(job.application_deadline) 
                        ? 'Expired' 
                        : formatDate(job.application_deadline)
                      }
                    </span>
                  </div>
                </div>

                {/* Created Info */}
                <div className="text-xs text-gray-500 mb-4">
                  Created by: {job.created_by || 'Unknown'}
                  <br />
                  {formatDate(job.created_at)}
                </div>

                {/* Actions */}
                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setSelectedJob(job)}
                    className="flex items-center px-3 py-2 text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <span className="mr-1">👁️</span>
                    View
                  </button>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => setEditingJob(job)}
                      className="flex items-center px-3 py-2 text-green-600 hover:text-green-800 transition-colors"
                    >
                      <span className="mr-1">✏️</span>
                      Edit
                    </button>

                    <button
                      onClick={() => setDeleteConfirm(job)}
                      className="flex items-center px-3 py-2 text-red-600 hover:text-red-800 transition-colors"
                    >
                      <span className="mr-1">🗑️</span>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredJobs.length === 0 && !loading && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <div className="text-6xl mb-4">🏢</div>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'No jobs found' : 'No jobs yet'}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm 
                  ? 'Try adjusting your search terms'
                  : 'Get started by creating your first job posting'
                }
              </p>
              {!searchTerm && (
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  Create First Job
                </button>
              )}
            </div>
          )}
        </>
      )}

      {/* Job Detail Modal */}
      {selectedJob && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedJob(null)}
        >
          <div
            className="bg-white rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-gray-900">{selectedJob.title}</h2>
              <button
                onClick={() => setSelectedJob(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                ×
              </button>
            </div>

            {selectedJob.company_name && (
              <div className="flex items-center mb-4">
                <span className="mr-2">🏢</span>
                <span className="text-gray-600">{selectedJob.company_name}</span>
              </div>
            )}

            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
              <div className="text-gray-600 whitespace-pre-wrap">
                {selectedJob.description}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-semibold text-gray-700">Application Deadline:</span>
                <div className={`mt-1 px-2 py-1 rounded text-xs font-medium inline-block ${
                  isDeadlinePassed(selectedJob.application_deadline)
                    ? 'bg-red-100 text-red-800'
                    : isDeadlineSoon(selectedJob.application_deadline)
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-green-100 text-green-800'
                }`}>
                  {formatDate(selectedJob.application_deadline)}
                </div>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Created by:</span>
                <p className="text-gray-600 mt-1">{selectedJob.created_by || 'Unknown'}</p>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Created:</span>
                <p className="text-gray-600 mt-1">{formatDate(selectedJob.created_at)}</p>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Last Updated:</span>
                <p className="text-gray-600 mt-1">{formatDate(selectedJob.updated_at)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Job Posting</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{deleteConfirm.title}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm.id)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobListComponent;
