import axios from "axios";
const IS_PRODUCTION = false;

const BASE_URL = IS_PRODUCTION
  ? "https://backendfyp-production-00a3.up.railway.app"
  : "http://127.0.0.1:8000";

const BASE_API_URL = `${BASE_URL}`;

// ---------------- SINGLE API OBJECT ----------------
const API = {
  BASE_URL,
  BASE_API_URL,

  AUTH: `${BASE_URL}`,
  JOBS: `${BASE_URL}/jobs`,
  CV: `${BASE_URL}/cv_manager`,
  INTERVIEW: `${BASE_URL}/interview`,
  BASE_JOBS_URL: `${BASE_URL}/jobs`,
  BASE_CV_URL: `${BASE_URL}/cv_manager`,
  BASE_INTERVIEW_URL: `${BASE_URL}/interview`
};

export default API;

/* ---------------- Utility: Auth Helpers ---------------- */
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    Authorization: token ? `Token ${token}` : "",
    "Content-Type": "application/json",
  };
};

// 🔐 Handle 401 or expired tokens automatically
const handleUnauthorized = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user_role");
  localStorage.removeItem("is_superuser");
  // window.location.href = "/login"; // redirect to login
};

// 🔐 Require auth before accessing secure pages
export const requireAuth = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "/login";
  }
};

/* ---------------- AUTH / ACCOUNTS ---------------- */

export const loginUser = async (email, password) => {
  try {
    const response = await fetch(`${BASE_API_URL}/accounts/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      // ✅ Store all essential info in localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("user_id", data.user_id);
      localStorage.setItem("user_role", data.role);
      localStorage.setItem("is_superuser", data.is_superuser);
    }

    return { ...data, status: response.status, ok: response.ok };
  } catch (error) {
    console.error("Login API error:", error);
    throw new Error("Network error. Please check your connection.");
  }
};

export const registerUser = async (userData) => {
  try {
    const response = await fetch(`${BASE_URL}/accounts/register/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    const data = await response.json();
    return { ...data, status: response.status, ok: response.ok };
  } catch (error) {
    console.error("Register API error:", error);
    throw new Error("Network error. Please check your connection.");
  }
};

export const checkAccountStatus = async (email) => {
  try {
    const response = await fetch(`${BASE_URL}/accounts/account-status/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await response.json();
    return { ...data, status: response.status, ok: response.ok };
  } catch (error) {
    console.error("Check status API error:", error);
    throw new Error("Network error. Please check your connection.");
  }
};

// ✅ Dashboard protected endpoint
export const getDashboard = async () => {
  try {
    const response = await fetch(`${BASE_URL}/accounts/dashboard/`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (response.status === 401) handleUnauthorized();

    const data = await response.json();
    return { ...data, status: response.status, ok: response.ok };
  } catch (error) {
    console.error("Dashboard API error:", error);
    throw error;
  }
};

// ✅ Logout API
export const logoutUser = async () => {
  const token = localStorage.getItem("token");

  try {
    if (token) {
      await fetch(`${BASE_URL}/accounts/logout/`, {
        method: "POST",
        headers: getAuthHeaders(),
      });
    }

    localStorage.removeItem("token");
    localStorage.removeItem("user_role");
    localStorage.removeItem("is_superuser");

    return { success: true };
  } catch (error) {
    localStorage.removeItem("token");
    localStorage.removeItem("user_role");
    localStorage.removeItem("is_superuser");

    return { success: false };
  }
};

export const requestPasswordReset = async (email) => {
  try {
    const response = await fetch(`${BASE_URL}/accounts/password-reset/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await response.json();
    return { ...data, status: response.status, ok: response.ok };
  } catch (error) {
    console.error("Password reset request API error:", error);
    throw new Error("Network error. Please check your connection.");
  }
};

export const confirmPasswordReset = async (uidb64, token, password) => {
  try {
    const response = await fetch(
      `${BASE_URL}/password-reset-confirm/${uidb64}/${token}/`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      }
    );
    const data = await response.json();
    return { ...data, status: response.status, ok: response.ok };
  } catch (error) {
    console.error("Password reset confirm API error:", error);
    throw new Error("Network error. Please check your connection.");
  }
};

/* ---------------- User Info ---------------- */
export const isAuthenticated = () => !!localStorage.getItem("token");

export const getUserInfo = () => ({
  token: localStorage.getItem("token"),
  role: localStorage.getItem("user_role"),
  isSuperuser: localStorage.getItem("is_superuser") === "true",
});

// ✅ Get logged-in user's profile
export const getUserProfile = async () => {
  try {
    const response = await fetch(`${BASE_URL}/profile/`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (response.status === 401) handleUnauthorized();
    return await response.json();
  } catch (error) {
    console.error("Error fetching profile:", error);
    throw error;
  }
};

/* ---------------- JOBS MODULE ---------------- */

export const listJobs = async () => {
  try {
    const response = await fetch(`${API.BASE_JOBS_URL}/list/`, {
      headers: getAuthHeaders(),
    });
    if (response.status === 401) handleUnauthorized();
    if (!response.ok) throw new Error("Failed to fetch jobs.");
    return await response.json();
  } catch (error) {
    console.error("Error fetching jobs:", error);
    throw error;
  }
};

export const createJob = async (jobData) => {
  try {
    const response = await fetch(`${API.BASE_JOBS_URL}/create/`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(jobData),
    });
    if (response.status === 401) handleUnauthorized();
    if (!response.ok) throw new Error("Failed to create job.");
    return await response.json();
  } catch (error) {
    console.error("createJob error:", error);
    throw error;
  }
};

export const getJobDetail = async (jobId) => {
  try {
    const response = await fetch(`${API.BASE_JOBS_URL}/${jobId}/`, {
      headers: getAuthHeaders(),
    });
    if (response.status === 401) handleUnauthorized();
    if (!response.ok) throw new Error("Failed to fetch job detail.");
    return await response.json();
  } catch (error) {
    console.error("getJobDetail error:", error);
    throw error;
  }
};

export const updateJob = async (jobId, jobData) => {
  try {
    const response = await fetch(`${API.BASE_JOBS_URL}/update/${jobId}/`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(jobData),
    });
    if (response.status === 401) handleUnauthorized();
    if (!response.ok) throw new Error("Failed to update job.");
    return await response.json();
  } catch (error) {
    console.error("Error updating job:", error);
    throw error;
  }
};

export const deleteJob = async (jobId) => {
  try {
    const response = await fetch(`${API.BASE_JOBS_URL}/delete/${jobId}/`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (response.status === 401) handleUnauthorized();
    if (response.status === 204) return { success: true };
    if (!response.ok) throw new Error("Failed to delete job.");
    return await response.json();
  } catch (error) {
    console.error("Error deleting job:", error);
    throw error;
  }
};

export const applyToJob = async (jobId, resumeFile) => {
  try {
    const formData = new FormData();
    formData.append("resume", resumeFile);
    const token = localStorage.getItem("token");

    const response = await fetch(`${API.BASE_JOBS_URL}/${jobId}/apply/`, {
      method: "POST",
      headers: { Authorization: token ? `Token ${token}` : "" },
      body: formData,
    });

    const data = await response.json();
    if (response.status === 401) handleUnauthorized();

    if (response.ok) return { ...data, status: "success" };
    if (response.status === 400 && data.error?.includes("already applied"))
      return { status: "already_applied", message: data.error };

    return { status: "error", message: data.error || "Failed to apply to job." };
  } catch (err) {
    console.error("Error applying to job:", err);
    return { status: "error", message: "Network error. Please try again." };
  }
};

export const getAppliedJobs = async () => {
  try {
    const response = await fetch(`${API.BASE_JOBS_URL}/applied/`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    if (response.status === 401) handleUnauthorized();
    if (!response.ok) throw new Error("Failed to fetch applied jobs.");
    return await response.json();
  } catch (error) {
    console.error("Error fetching applied jobs:", error);
    return [];
  }
};
// ---------------- HR ANALYTICS ----------------

// Fetch all jobs created by the current HR
export const getHRJobs = async () => {
  try {
    const response = await fetch(`${API.BASE_JOBS_URL}/list/`, {
      headers: getAuthHeaders(),
    });
    if (response.status === 401) handleUnauthorized();
    if (!response.ok) throw new Error("Failed to fetch HR jobs.");
    return await response.json();
  } catch (error) {
    console.error("Error fetching HR jobs:", error);
    throw error;
  }
};

// Fetch all applications for a specific job (HR only)
export const getJobApplications = async (jobId) => {
  try {
    const response = await fetch(`${API.BASE_JOBS_URL}/${jobId}/applications/`, {
      headers: getAuthHeaders(),
    });
    if (response.status === 401) handleUnauthorized();
    if (!response.ok) throw new Error("Failed to fetch job applications.");
    return await response.json();
  } catch (error) {
    console.error("Error fetching job applications:", error);
    throw error;
  }
};

export const getSimilarJobs = async (params = {}) => {
  const token = localStorage.getItem("token");
  try {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API.BASE_CV_URL}/similar-jobs/?${query}`, {
      method: "GET",
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (res.status === 401) handleUnauthorized();

    const data = await res.json();
    return { matched_jobs: data.matched_jobs || [], ...data };
  } catch (err) {
    console.error("Fetch similar jobs error:", err);
    return { matched_jobs: [], message: "Failed to fetch similar jobs." };
  }
};


// src/services/api.js

/* ---------------- Application Status ---------------- */
export const checkApplicationStatus = async (jobId) => {
  try {
    const response = await fetch(`${API.BASE_CV_URL}/check-application-status/${jobId}/`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    
    if (response.status === 401) handleUnauthorized();
    
    if (response.ok) {
      return await response.json();
    }
    
    // If the endpoint doesn't exist, fallback to checking from applied jobs
    if (response.status === 404) {
      console.log("Application status endpoint not found, using fallback");
      const appliedJobs = await getAppliedJobs();
      const applied = Array.isArray(appliedJobs) 
        ? appliedJobs.some(job => job.job_id === jobId)
        : false;
      return { applied, submitted_at: null };
    }
    
    throw new Error("Failed to check application status");
  } catch (error) {
    console.error("Error checking application status:", error);
    
    // Fallback: Check from getAppliedJobs
    try {
      const appliedJobs = await getAppliedJobs();
      const applied = Array.isArray(appliedJobs) 
        ? appliedJobs.some(job => job.job_id === jobId)
        : false;
      return { applied, submitted_at: null };
    } catch (fallbackError) {
      console.error("Fallback also failed:", fallbackError);
      return { applied: false };
    }
  }
};

export const getResumeAnalysis = async () => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("User not logged in");
  
  try {
    const res = await axios.get(`${API.BASE_CV_URL}/resume-analysis/`, {
      headers: { Authorization: `Token ${token}` },
    });
    return res.data;
  } catch (err) {
    console.error("Failed to fetch resume analysis:", err);
    return null;
  }
};





/* =========================================
   1️⃣ Fetch Interview Preparation (GET)
========================================= */
export const getInterviewPreparation = async () => {
  try {
    const response = await fetch(
      `${API.BASE_INTERVIEW_URL}/candidate/interview-preparation/`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      }
    );

    if (response.status === 401) handleUnauthorized();
    if (!response.ok) throw new Error("Failed to fetch interview preparation.");

    return await response.json();
  } catch (error) {
    console.error("Error fetching interview preparation:", error);
    return { count: 0, data: [] };
  }
};
export const generateMoreQuestions = async (jobId) => {
  try {
    const response = await fetch(
      `${API.BASE_INTERVIEW_URL}/candidate/interview-preparation/generate-more/`,
      {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ job_id: jobId }),
      }
    );

    if (response.status === 401) handleUnauthorized();

    const data = await response.json();

    if (!response.ok) {
      // IMPORTANT: throw backend message
      throw { response: { data } };
    }

    return data;
  } catch (error) {
    throw error; // IMPORTANT: don't swallow it
  }
};
export const sendMockInterviewMessage = async (jobId, message) => {
  const response = await fetch(
    `${API.BASE_INTERVIEW_URL}/candidate/interview-chat/`,
    {
      method: "POST",
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ job_id: jobId, message }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    // 🚨 attach full error info
    const error = new Error(data?.error || "Request failed");
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
};
export const startMockInterview = async (userInput) => {
  try {
    const payload = {
      job_id: userInput.jobId,
      difficulty: userInput.difficulty,
      interview_type: userInput.interviewType,
      total_questions: userInput.totalQuestions,
    };

    const response = await fetch(
      `${API.BASE_INTERVIEW_URL}/candidate/mock-interview/`,
      {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json(); // 🔥 ALWAYS READ JSON FIRST

    if (response.status === 401) handleUnauthorized();

    if (!response.ok) {
      // 🔥 THROW BACKEND MESSAGE
      throw { response: { data } };
    }

    return data;
  } catch (err) {
    throw err;
  }
};
export const submitMockInterviewAnswers = async (userInput) => {
  try {
    const payload = {
      job_id: userInput.jobId,
      session_id: userInput.sessionId,
      answers: userInput.answers,
    };

    const response = await fetch(
      `${API.BASE_INTERVIEW_URL}/candidate/mock-interview/`,
      {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();

    if (response.status === 401) handleUnauthorized();

    if (!response.ok) {
      throw { response: { data } };
    }

    return data;
  } catch (err) {
    throw err;
  }
};

// Fetch results of a mock interview session
export const getMockInterviewResults = async (sessionId) => {
  try {
    const response = await fetch(
      `${API.BASE_INTERVIEW_URL}/candidate/mock-interview-results/${sessionId}/`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      }
    );

    if (response.status === 401) handleUnauthorized();
    if (!response.ok) throw new Error("Failed to fetch mock interview results.");

    return await response.json(); // { completed, results: [...] }
  } catch (err) {
    console.error("getMockInterviewResults error:", err);
    return null;
  }
};

export const getMockInterviewProgress = async (jobId) => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("User not authenticated");
  }

  const res = await fetch(
    `${API.BASE_INTERVIEW_URL}/progress/${jobId}/`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
    }
  );

  // 🔒 Auth issues
  if (res.status === 401 || res.status === 403) {
    throw new Error("Unauthorized access");
  }

  // 📭 No progress yet
  if (res.status === 404) {
    return {
      job_id: jobId,
      job_title: "",
      sessions_completed: 0,
      progress_percentage: 0,
      progress: [],
    };
  }

  if (!res.ok) {
    throw new Error("Failed to fetch mock interview progress");
  }

  const data = await res.json();

  // 🛡️ Normalize response (safety for UI)
  return {
    job_id: data.job_id,
    job_title: data.job_title,
    sessions_completed: data.sessions_completed ?? 0,
    progress_percentage: Number(data.progress_percentage ?? 0),
    progress: Array.isArray(data.progress) ? data.progress : [],
  };
};
