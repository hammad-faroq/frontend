// frontend/src/utils/userHelper.js

/**
 * Get current logged-in user information from localStorage
 */
export const getCurrentUser = () => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('user_role');
  
  if (!token) {
    return null;
  }
  
  return {
    token,
    role,
    isAuthenticated: !!token,
    isHR: role === 'hr',
    isJobSeeker: role === 'job_seeker'
  };
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

/**
 * Check if user is HR
 */
export const isHR = () => {
  return localStorage.getItem('user_role') === 'hr';
};

/**
 * Check if user is Job Seeker
 */
export const isJobSeeker = () => {
  return localStorage.getItem('user_role') === 'job_seeker';
};

/**
 * Get authentication headers for API calls
 */
export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Token ${token}`;
  }
  
  return headers;
};