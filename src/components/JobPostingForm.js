import React, { useState, useEffect } from 'react';
import API from "../services/api";

const JobPostingForm = ({ jobToEdit = null, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    application_deadline: '',
    company_name: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);

  // API Base URL
  const API_BASE_URL = API.JOBS;

  // Get authentication headers
  const getAuthHeaders = () => {
    // Get token from various possible storage locations
    const token = localStorage.getItem('token') || 
                  localStorage.getItem('authToken') || 
                  localStorage.getItem('access_token') ||
                  sessionStorage.getItem('token');
    
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Token ${token}`;
    }
    
    // Get CSRF token if available
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]');
    if (csrfToken) {
      headers['X-CSRFToken'] = csrfToken.value;
    }
    
    return headers;
  };

  // Simple API service methods
  const apiCall = async (url, options = {}) => {
    try {
      const response = await fetch(url, {
        headers: getAuthHeaders(),
        ...options,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ 
          error: `HTTP ${response.status}: ${response.statusText}` 
        }));
        throw new Error(error.error || error.detail || error.message || 'Something went wrong');
      }

      return response.json();
    } catch (error) {
      throw error;
    }
  };

  // Populate data if editing
  useEffect(() => {
    if (jobToEdit) {
      setFormData({
        title: jobToEdit.title || '',
        description: jobToEdit.description || '',
        application_deadline: jobToEdit.application_deadline || '',
        company_name: jobToEdit.company_name || ''
      });
    }
  }, [jobToEdit]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Job title is required';
    } else if (formData.title.length > 255) {
      newErrors.title = 'Title must be less than 255 characters';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Job description is required';
    }
    
    if (!formData.application_deadline) {
      newErrors.application_deadline = 'Application deadline is required';
    } else {
      const selectedDate = new Date(formData.application_deadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.application_deadline = 'Deadline cannot be in the past';
      }
    }
    
    if (formData.company_name && formData.company_name.length > 255) {
      newErrors.company_name = 'Company name must be less than 255 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setNotification(null);
    
    try {
      let result;
      if (jobToEdit) {
        result = await apiCall(`${API_BASE_URL}/${jobToEdit.id}/`, {
          method: 'PUT',
          body: JSON.stringify(formData),
        });
        setNotification({ type: 'success', message: 'Job updated successfully!' });
      } else {
        result = await apiCall(`${API_BASE_URL}/`, {
          method: 'POST',
          body: JSON.stringify(formData),
        });
        setNotification({ type: 'success', message: 'Job created successfully!' });
      }
      
      // Reset data if creating new job
      if (!jobToEdit) {
        setFormData({
          title: '',
          description: '',
          application_deadline: '',
          company_name: ''
        });
      }
      
      // Call success callback
      if (onSuccess) {
        setTimeout(() => onSuccess(result), 1500);
      }
      
    } catch (error) {
      console.error('API Error:', error);
      setNotification({ 
        type: 'error', 
        message: error.message || 'Failed to save job posting' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8 transition-all duration-300">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">
          {jobToEdit ? 'Edit Job Posting' : 'Create New Job Posting'}
        </h2>
        <p className="text-gray-600 mt-2">
          Fill in the details below to {jobToEdit ? 'update' : 'create'} a job posting
        </p>
      </div>

      {/* Notification */}
      {notification && (
        <div className={`mb-6 p-4 rounded-lg flex items-center transition-all duration-300 ${
          notification.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          <div className={`w-5 h-5 mr-2 flex-shrink-0 ${
            notification.type === 'success' ? 'text-green-600' : 'text-red-600'
          }`}>
            {notification.type === 'success' ? '✓' : '✗'}
          </div>
          {notification.message}
        </div>
      )}

      <div className="space-y-6">
        {/* Job Title */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Job Title *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              errors.title ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="e.g., Senior Frontend Developer"
            maxLength={255}
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">{errors.title}</p>
          )}
          <p className="text-gray-500 text-sm mt-1">
            {formData.title.length}/255 characters
          </p>
        </div>

        {/* Company Name */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Company Name
          </label>
          <input
            type="text"
            name="company_name"
            value={formData.company_name}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              errors.company_name ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="e.g., Tech Innovations Inc."
            maxLength={255}
          />
          {errors.company_name && (
            <p className="text-red-500 text-sm mt-1">{errors.company_name}</p>
          )}
        </div>

        {/* Job Description */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Job Description *
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={8}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-vertical ${
              errors.description ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Describe the job responsibilities, requirements, qualifications, and benefits..."
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">{errors.description}</p>
          )}
          <p className="text-gray-500 text-sm mt-1">
            Provide detailed information about the role, requirements, and what you offer
          </p>
        </div>

        {/* Application Deadline */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Application Deadline *
          </label>
          <input
            type="date"
            name="application_deadline"
            value={formData.application_deadline}
            onChange={handleInputChange}
            min={new Date().toISOString().split('T')[0]}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              errors.application_deadline ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.application_deadline && (
            <p className="text-red-500 text-sm mt-1">{errors.application_deadline}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          )}
          
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {jobToEdit ? 'Updating...' : 'Creating...'}
              </div>
            ) : (
              jobToEdit ? 'Update Job' : 'Create Job'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobPostingForm;