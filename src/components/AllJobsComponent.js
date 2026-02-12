import React, { useState, useEffect } from 'react';
import { getCurrentUser, getAuthHeaders } from '../utils/userHelper';

const AllJobsComponent = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);
  const [applyingJob, setApplyingJob] = useState(null);
  const [cvFile, setCvFile] = useState(null);
  const [applySuccess, setApplySuccess] = useState(null);
  const [applyError, setApplyError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const API_BASE_URL = 'http://localhost:8000/api/jobs';
  const currentUser = getCurrentUser();

  useEffect(() => {
    loadAllJobs();
  }, []);

  const apiCall = async (url, options = {}) => {
    try {
      const response = await fetch(url, {
        headers: getAuthHeaders(),
        ...options,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Network error' }));
        throw new Error(error.error || error.detail || 'Something went wrong');
      }

      return response.json();
    } catch (error) {
      throw error;
    }
  };

  const loadAllJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      const jobsData = await apiCall(API_BASE_URL);
      setJobs(Array.isArray(jobsData) ? jobsData : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyClick = (job) => {
    setApplyingJob(job);
    setCvFile(null);
    setApplyError(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        setApplyError('Only PDF and DOC/DOCX files are allowed');
        setCvFile(null);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setApplyError('File size must be less than 5MB');
        setCvFile(null);
        return;
      }
      setCvFile(file);
      setApplyError(null);
    }
  };

  const handleApplySubmit = async () => {
    if (!cvFile) {
      setApplyError('Please select a CV file');
      return;
    }

    setIsSubmitting(true);
    setApplyError(null);

    try {
      const formData = new FormData();
      formData.append('cv', cvFile);

      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/${applyingJob.id}/apply/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Failed to apply' }));
        throw new Error(error.error || error.detail || 'Failed to apply');
      }

      const result = await response.json();
      setApplySuccess(`Successfully applied for ${applyingJob.title}`);
      setApplyingJob(null);
      setCvFile(null);
      
      setTimeout(() => setApplySuccess(null), 5000);
    } catch (err) {
      setApplyError(err.message);
    } finally {
      setIsSubmitting(false);
    }
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

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Browse All Jobs</h1>
            <p className="text-gray-600 mt-1">Explore available job opportunities</p>
          </div>
          {currentUser && currentUser.isHR && (
            <button
              onClick={() => window.location.href = '/jobs/my-jobs'}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
            >
              My Job Postings
            </button>
          )}
        </div>

        {applySuccess && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 flex items-center">
            <span className="mr-2">✓</span>
            {applySuccess}
          </div>
        )}

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

      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading jobs...</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="mb-4 text-sm text-gray-600">
            {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''} available
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredJobs.map((job) => (
              <div key={job.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow p-6 border">
                <div className="mb-4">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {job.title}
                  </h3>
                  {job.company_name && (
                    <div className="flex items-center text-gray-600 mb-2">
                      <span className="text-sm mr-1">🏢</span>
                      <span className="text-sm">{job.company_name}</span>
                    </div>
                  )}
                </div>

                <p className="text-gray-600 text-sm mb-4" style={{
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {job.description}
                </p>

                <div className="mb-4">
                  <div className="flex items-center">
                    <span className="mr-1">📅</span>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      isDeadlinePassed(job.application_deadline) ? 'bg-red-100 text-red-800' :
                      isDeadlineSoon(job.application_deadline) ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {isDeadlinePassed(job.application_deadline) ? 'Expired' : formatDate(job.application_deadline)}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setSelectedJob(job)}
                    className="flex items-center px-3 py-2 text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <span className="mr-1">👁️</span>
                    View
                  </button>

                  {currentUser && currentUser.isJobSeeker && !isDeadlinePassed(job.application_deadline) && (
                    <button
                      onClick={() => handleApplyClick(job)}
                      className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                    >
                      <span className="mr-1">📝</span>
                      Apply
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredJobs.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'No jobs found' : 'No jobs available'}
              </h3>
              <p className="text-gray-600">
                {searchTerm ? 'Try adjusting your search terms' : 'Check back later for new opportunities'}
              </p>
            </div>
          )}
        </>
      )}

      {/* Job Detail Modal */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedJob(null)}>
          <div className="bg-white rounded-xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-3xl font-bold text-gray-900">{selectedJob.title}</h2>
              <button onClick={() => setSelectedJob(null)} className="text-gray-400 hover:text-gray-600 text-3xl leading-none">×</button>
            </div>

            {selectedJob.company_name && (
              <div className="flex items-center mb-6 text-lg">
                <span className="mr-2">🏢</span>
                <span className="text-gray-700 font-medium">{selectedJob.company_name}</span>
              </div>
            )}

            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Job Description</h3>
              <div className="text-gray-700 whitespace-pre-wrap leading-relaxed bg-gray-50 p-6 rounded-lg border border-gray-200" style={{fontSize: '15px', lineHeight: '1.8'}}>
                {selectedJob.description}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 text-sm mb-8 bg-gray-50 p-6 rounded-lg">
              <div>
                <span className="font-semibold text-gray-700 text-base">Application Deadline:</span>
                <div className={`mt-2 px-3 py-2 rounded text-sm font-medium inline-block ${
                  isDeadlinePassed(selectedJob.application_deadline) ? 'bg-red-100 text-red-800' :
                  isDeadlineSoon(selectedJob.application_deadline) ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {formatDate(selectedJob.application_deadline)}
                </div>
              </div>
              <div>
                <span className="font-semibold text-gray-700 text-base">Posted:</span>
                <p className="text-gray-600 mt-2 text-sm">{formatDate(selectedJob.created_at)}</p>
              </div>
            </div>

            {currentUser && currentUser.isJobSeeker && !isDeadlinePassed(selectedJob.application_deadline) && (
              <div className="flex justify-end pt-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    handleApplyClick(selectedJob);
                    setSelectedJob(null);
                  }}
                  className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold text-lg"
                >
                  Apply for this Position
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Apply Modal with CV Upload */}
      {applyingJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-8 max-w-lg w-full">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Apply for Position</h3>
            <p className="text-gray-600 mb-6">
              Position: <span className="font-semibold text-gray-900">{applyingJob.title}</span>
            </p>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Upload Your CV/Resume *
              </label>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-600 file:mr-4 file:py-3 file:px-6 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer border border-gray-300 rounded-lg"
                disabled={isSubmitting}
              />
              <p className="text-xs text-gray-500 mt-2">
                Accepted formats: PDF, DOC, DOCX (Max 5MB)
              </p>
              {cvFile && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center">
                  <span className="text-green-700 mr-2">✓</span>
                  <span className="text-sm text-green-800 font-medium">{cvFile.name}</span>
                </div>
              )}
            </div>

            {applyError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
                {applyError}
              </div>
            )}

            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  setApplyingJob(null);
                  setCvFile(null);
                  setApplyError(null);
                }}
                className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors font-medium"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={handleApplySubmit}
                disabled={!cvFile || isSubmitting}
                className="px-8 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllJobsComponent;