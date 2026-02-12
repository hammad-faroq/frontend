// src/services/jobService.js
const API_BASE_URL = 'http://localhost:8000/api/jobs';

class JobService {
  // Get authentication headers
  getHeaders() {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Token ${token}` }),
    };
  }

  // Handle API responses
  async handleResponse(response) {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(error.error || error.detail || 'Something went wrong');
    }
    return response.json();
  }

  // Get all job postings
  async getJobs(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${API_BASE_URL}/?${queryString}` : `${API_BASE_URL}/`;
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      throw error;
    }
  }

  // Get single job posting
  async getJob(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}/`, {
        method: 'GET',
        headers: this.getHeaders(),
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching job:', error);
      throw error;
    }
  }

  // Create new job posting
  async createJob(jobData) {
    try {
      const response = await fetch(`${API_BASE_URL}/`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(jobData),
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error creating job:', error);
      throw error;
    }
  }

  // Update job posting
  async updateJob(id, jobData) {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}/`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(jobData),
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error updating job:', error);
      throw error;
    }
  }

  // Delete job posting
  async deleteJob(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}/`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });
      
      if (response.status === 204) {
        return { success: true };
      }
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error deleting job:', error);
      throw error;
    }
  }

  // Search jobs (this will use your backend's filtering if implemented)
  async searchJobs(searchTerm) {
    return this.getJobs({ search: searchTerm });
  }
}

export default new JobService();