import axios from "axios";

// ---------------- Base URL ----------------
const BASE_API_URL = 'https://backendfyp-production-00a3.up.railway.app/api/interview';

// ---------------- Auth Helpers ----------------
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Token ${token}` : "",
  };
};

const handleUnauthorized = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user_role");
  window.location.href = "/login";
};

// ================= EMAIL NOTIFICATION FUNCTION =================
export const sendInterviewNotification = async (interviewId, candidateEmail, hrEmail) => {
  try {
    console.log("Sending interview notification emails:", { interviewId, candidateEmail, hrEmail });
    
    const res = await axios.post(
      `${BASE_API_URL}/hr/send-interview-notification/`,
      {
        interview_id: interviewId,
        candidate_email: candidateEmail,
        hr_email: hrEmail
      },
      { 
        headers: getAuthHeaders(),
        timeout: 10000
      }
    );
    
    console.log("Email notification sent successfully:", res.data);
    return res.data;
  } catch (err) {
    console.error("sendInterviewNotification error:", err.response?.data || err);
    
    // Don't throw error here - we don't want to block interview scheduling if email fails
    console.warn("Email notification failed, but interview was scheduled.");
    return { success: false, error: "Email notification failed" };
  }
};

// ================= SCHEDULE INTERVIEW WITH EMAIL NOTIFICATION =================
export const scheduleInterviewWithNotification = async (data) => {
  try {
    console.log("Scheduling interview with notification:", data);
    
    // First schedule the interview
    const res = await axios.post(
      `${BASE_API_URL}/hr/schedule-interview/`,
      data.interviewData,
      { 
        headers: getAuthHeaders(),
        timeout: 10000
      }
    );
    
    console.log("Interview scheduled successfully:", res.data);
    
    // Send email notifications if emails are provided
    if (data.candidateEmail && data.hrEmail) {
      try {
        await sendInterviewNotification(
          res.data.id || res.data.interview_id,
          data.candidateEmail,
          data.hrEmail
        );
        console.log("Interview scheduled and notifications sent!");
      } catch (emailErr) {
        console.warn("Interview scheduled but email notification failed:", emailErr);
        // Return success anyway since interview was scheduled
        return { 
          ...res.data, 
          email_notification_sent: false,
          email_error: emailErr.message
        };
      }
    }
    
    return { 
      ...res.data, 
      email_notification_sent: true 
    };
    
  } catch (err) {
    console.error("scheduleInterviewWithNotification error:", err.response?.data || err);
    
    if (err.response?.status === 401) {
      handleUnauthorized();
    }
    
    if (err.response?.data) {
      throw new Error(JSON.stringify(err.response.data));
    }
    
    throw err;
  }
};

// ================= BULK QUESTION CREATION =================
export const createBulkInterviewQuestions = async (questions) => {
  try {
    console.log("Creating bulk questions:", questions);
    
    const res = await axios.post(
      `${BASE_API_URL}/questions/bulk/`,
      { questions },
      { 
        headers: getAuthHeaders(),
        timeout: 10000
      }
    );
    
    console.log("Bulk creation successful:", res.data);
    return res.data;
  } catch (err) {
    console.error("createBulkInterviewQuestions error details:");
    console.error("Status:", err.response?.status);
    console.error("Data:", err.response?.data);
    console.error("Full error:", err);
    
    if (err.response?.status === 401) {
      handleUnauthorized();
    }
    
    // Re-throw the error with backend message
    if (err.response?.data) {
      throw new Error(JSON.stringify(err.response.data));
    }
    
    throw err;
  }
};

// ================= SINGLE QUESTION CREATION =================
export const createInterviewQuestion = async (questionData) => {
  try {
    console.log("Sending to create question:", questionData);
    
    const res = await axios.post(
      `${BASE_API_URL}/questions/`,
      questionData,
      { 
        headers: getAuthHeaders(),
        timeout: 10000
      }
    );
    
    console.log("Question creation response:", res.data);
    return res.data;
  } catch (err) {
    console.error("createInterviewQuestion error:", err.response?.data || err);
    
    if (err.response?.status === 401) {
      handleUnauthorized();
    }
    
    if (err.response?.data) {
      throw new Error(JSON.stringify(err.response.data));
    }
    
    throw err;
  }
};

// ================= GET UPCOMING INTERVIEWS FOR CANDIDATE =================
export const getUpcomingInterviews = async () => {
  try {
    const res = await axios.get(`${BASE_API_URL}/candidate/upcoming-interviews/`, {
      headers: getAuthHeaders(),
    });
    return res.data;
  } catch (err) {
    if (err.response?.status === 401) handleUnauthorized();
    console.error("getUpcomingInterviews error:", err);
    return [];
  }
};

// ================= QUESTION TYPES =================
export const getQuestionTypes = async () => {
  try {
    // Note: You might need to add an endpoint for this or get from existing data
    // For now, we'll assume the question_type field accepts IDs 1 for MCQ, 2 for Descriptive
    return [
      { id: 1, name: "MCQ", code: "MCQ", requires_answer_key: true },
      { id: 2, name: "Descriptive", code: "DESC", requires_answer_key: true }
    ];
  } catch (err) {
    console.error("getQuestionTypes error:", err);
    return [];
  }
};

// ---------------- HR APIs ----------------
export const getHRJobs = async () => {
  try {
    const res = await axios.get(`${BASE_API_URL}/interviews/`, {
      headers: getAuthHeaders(),
    });
    return res.data;
  } catch (err) {
    if (err.response?.status === 401) handleUnauthorized();
    console.error("getHRJobs error:", err);
    return [];
  }
};

// Keep original scheduleInterview for backward compatibility
export const scheduleInterview = async (data) => {
  try {
    const res = await axios.post(`${BASE_API_URL}/hr/schedule-interview/`, data, {
      headers: getAuthHeaders(),
    });
    return res.data;
  } catch (err) {
    if (err.response?.status === 401) handleUnauthorized();
    console.error("scheduleInterview error:", err);
    throw err;
  }
};

export const reviewCandidateAnswers = async (interviewId) => {
  try {
    const res = await axios.get(
      `${BASE_API_URL}/hr/interview/${interviewId}/answers/`,
      { headers: getAuthHeaders() }
    );
    return res.data;
  } catch (err) {
    if (err.response?.status === 401) handleUnauthorized();
    console.error("reviewCandidateAnswers error:", err);
    return [];
  }
};

// export const finalizeInterview = async (interviewId) => {
//   try {
//     const res = await axios.post(
//       `${BASE_API_URL}/hr/interview/${interviewId}/finalize/`,
//       {},
//       { headers: getAuthHeaders() }
//     );
//     return res.data;
//   } catch (err) {
//     if (err.response?.status === 401) handleUnauthorized();
//     console.error("finalizeInterview error:", err);
//     throw err;
//   }
// };

export const getHRAnalytics = async () => {
  try {
    const res = await axios.get(`${BASE_API_URL}/admin/analytics/`, {
      headers: getAuthHeaders(),
    });
    return res.data;
  } catch (err) {
    if (err.response?.status === 401) handleUnauthorized();
    console.error("getHRAnalytics error:", err);
    return {};
  }
};

// ---------------- Candidate APIs ----------------
export const getInterviewQuestions = async (interviewId) => {
  try {
    const res = await axios.get(
      `${BASE_API_URL}/hr/interview/${interviewId}/questions/`,
      { headers: getAuthHeaders() }
    );
    return res.data;
  } catch (err) {
    if (err.response?.status === 401) handleUnauthorized();
    console.error("getInterviewQuestions error:", err);
    return { assigned_questions: [], available_questions: [] };
  }
};

export const submitInterviewAnswer = async (interviewId, questionId, answer) => {
  try {
    const res = await axios.post(
      `${BASE_API_URL}/candidate/interview/${interviewId}/submit-answer/`,
      { question_id: questionId, answer },
      { headers: getAuthHeaders() }
    );
    return res.data;
  } catch (err) {
    if (err.response?.status === 401) handleUnauthorized();
    console.error("submitInterviewAnswer error:", err);
    throw err;
  }
};

export const submitAllAnswers = async (interviewId, answers) => {
  try {
    const res = await axios.post(
      `${BASE_API_URL}/candidate/interview/${interviewId}/submit-all/`,
      { answers },
      { headers: getAuthHeaders() }
    );
    return res.data;
  } catch (err) {
    if (err.response?.status === 401) handleUnauthorized();
    console.error("submitAllAnswers error:", err);
    throw err;
  }
};

export const getInterviewResult = async (interviewId) => {
  try {
    const res = await axios.get(
      `${BASE_API_URL}/candidate/interview/${interviewId}/result/`,
      { headers: getAuthHeaders() }
    );
    return res.data;
  } catch (err) {
    if (err.response?.status === 401) handleUnauthorized();
    console.error("getInterviewResult error:", err);
    return null;
  }
};

export const getPreparationModules = async () => {
  try {
    const res = await axios.get(`${BASE_API_URL}/preparation-modules/`, {
      headers: getAuthHeaders(),
    });
    return res.data;
  } catch (err) {
    if (err.response?.status === 401) handleUnauthorized();
    console.error("getPreparationModules error:", err);
    return [];
  }
};

export const startPreparationModule = async (moduleId) => {
  try {
    const res = await axios.post(
      `${BASE_API_URL}/candidate/preparation/${moduleId}/start/`,
      {},
      { headers: getAuthHeaders() }
    );
    return res.data;
  } catch (err) {
    if (err.response?.status === 401) handleUnauthorized();
    console.error("startPreparationModule error:", err);
    throw err;
  }
};

export const completePreparationModule = async (moduleId) => {
  try {
    const res = await axios.post(
      `${BASE_API_URL}/candidate/preparation/${moduleId}/complete/`,
      {},
      { headers: getAuthHeaders() }
    );
    return res.data;
  } catch (err) {
    if (err.response?.status === 401) handleUnauthorized();
    console.error("completePreparationModule error:", err);
    throw err;
  }
};

// export const gradeCandidateAnswer = async (answerId, data) => {
//   const token = localStorage.getItem("token");

//   const res = await fetch(
//     `http://127.0.0.1:8000/api/interview/hr/answer/${answerId}/grade/`,
//     {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: token ? `Token ${token}` : "",
//       },
//       body: JSON.stringify({
//         score: data.score,
//         feedback: data.feedback,
//       }),
//     }
//   );

//   if (!res.ok) {
//     const err = await res.json();
//     throw err;
//   }

//   return res.json();
// };

// export const fetchAllQuestions = async () => {
//   const token = localStorage.getItem("token");

//   const res = await fetch(
//     "http://127.0.0.1:8000/api/interview/questions/",
//     {
//       headers: {
//         Authorization: token ? `Token ${token}` : "",
//       },
//     }
//   );

//   if (!res.ok) throw await res.json();
//   return res.json();
// };

export const assignQuestionsToInterview = async (interviewId, questionIds) => {
  try {
    console.log("assignQuestionsToInterview called with:", { interviewId, questionIds });
    
    const payload = {
      questions: questionIds.map(id => ({ 
        question_id: String(id)
      }))
    };
    
    console.log("Assignment payload:", JSON.stringify(payload, null, 2));
    
    const res = await axios.put(
      `${BASE_API_URL}/hr/interview/${interviewId}/questions/`,
      payload,
      { 
        headers: getAuthHeaders(),
        timeout: 10000
      }
    );
    
    console.log("Assignment successful:", res.data);
    return res.data;
  } catch (err) {
    console.error("assignQuestionsToInterview error details:");
    console.error("Status:", err.response?.status);
    console.error("Data:", err.response?.data);
    console.error("Full error:", err);
    
    if (err.response?.status === 401) {
      handleUnauthorized();
    }
    
    if (err.response?.data) {
      throw new Error(JSON.stringify(err.response.data));
    }
    
    throw err;
  }
};

export const startInterview = async (interviewId) => {
  try {
    const res = await axios.post(
      `${BASE_API_URL}/hr/interview/${interviewId}/start/`,
      {},
      { headers: getAuthHeaders() }
    );
    return res.data;
  } catch (err) {
    if (err.response?.status === 401) handleUnauthorized();
    console.error("startInterview error:", err);
    throw err;
  }
};

export const getInterviewDetail = async (interviewId) => {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(
      `${BASE_API_URL}/${interviewId}/`,
      {
        method: "GET",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    if (response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user_role");
      window.location.href = "/login";
      return data;
    }

    if (!response.ok) {
      throw new Error(data.error || "Failed to fetch interview details");
    }

    return data;

  } catch (error) {
    console.error("Error fetching interview detail:", error);
    throw error;
  }
};

export const addInterviewQuestion = async (interviewId, questionData) => {
  try {
    const questionRes = await axios.post(`${BASE_API_URL}/questions/`, questionData, {
      headers: getAuthHeaders()
    });
    const questionId = questionRes.data.id;

    await new Promise(resolve => setTimeout(resolve, 50));

    await axios.put(
      `${BASE_API_URL}/hr/interview/${interviewId}/questions/`,
      { questions: [{ question_id: questionId }] },
      { headers: getAuthHeaders() }
    );

    return questionRes.data;
  } catch (err) {
    console.error("Failed to add question:", err.response?.data || err);
    throw err;
  }
};

export const getHRInterviewStatus = async (interviewId) => {
  try {
    const interviews = await getHRJobs();
    const interview = interviews.find(i => i.id === interviewId);
    return interview?.status || null;
  } catch (err) {
    console.error("getHRInterviewStatus error:", err);
    return null;
  }
};

export const getQuestionDetail = async (questionId) => {
  try {
    const res = await axios.get(
      `${BASE_API_URL}/questions/${questionId}/`,
      { headers: getAuthHeaders() }
    );
    return res.data;
  } catch (err) {
    console.error("getQuestionDetail error:", err.response?.data || err);
    throw err;
  }
};

export const getCategories = async () => {
  try {
    const res = await axios.get(
      `${BASE_API_URL}/categories/`,
      { headers: getAuthHeaders() }
    );
    return res.data;
  } catch (err) {
    console.error("getCategories error:", err.response?.data || err);
    return [];
  }
};

export const updateInterviewCategories = async (interviewId, categoryIds) => {
  try {
    const res = await axios.patch(
      `${BASE_API_URL}/interviews/${interviewId}/`,
      { categories: categoryIds },
      { headers: getAuthHeaders() }
    );
    return res.data;
  } catch (err) {
    console.error("updateInterviewCategories error:", err.response?.data || err);
    throw err;
  }
};


// ================= CANDIDATE INTERVIEW START =================
export const startCandidateInterview = async (interviewId) => {
  try {
    console.log("Candidate starting interview:", interviewId);
    
    const res = await axios.post(
      `${BASE_API_URL}/candidate/interview/${interviewId}/start/`,
      {},
      { 
        headers: getAuthHeaders(),
        timeout: 10000
      }
    );
    
    console.log("Interview started successfully:", res.data);
    return res.data;
  } catch (err) {
    console.error("startCandidateInterview error:", err.response?.data || err);
    
    if (err.response?.status === 401) {
      handleUnauthorized();
    }
    
    if (err.response?.data) {
      throw new Error(JSON.stringify(err.response.data));
    }
    
    throw err;
  }
};
// ================= GET CANDIDATE INTERVIEW QUESTIONS =================
export const getCandidateInterviewQuestions = async (interviewId) => {
  try {
    console.log("Fetching interview questions for:", interviewId);
    
    const res = await axios.get(
      `${BASE_API_URL}/candidate/interview/${interviewId}/questions/`,
      { 
        headers: getAuthHeaders(),
        timeout: 10000
      }
    );
    
    console.log("Interview questions fetched:", res.data);
    return res.data;
  } catch (err) {
    console.error("getCandidateInterviewQuestions error:", err.response?.data || err);
    
    if (err.response?.status === 401) {
      handleUnauthorized();
    }
    
    if (err.response?.data) {
      throw new Error(JSON.stringify(err.response.data));
    }
    
    throw err;
  }
};

// ================= SUBMIT SINGLE ANSWER =================
export const submitSingleAnswer = async (interviewId, answerData) => {
  try {
    console.log("Submitting single answer for interview:", interviewId);
    
    const res = await axios.post(
      `${BASE_API_URL}/candidate/interview/${interviewId}/submit-answer/`,
      answerData,
      { 
        headers: getAuthHeaders(),
        timeout: 15000
      }
    );
    
    console.log("Answer submitted successfully:", res.data);
    return res.data;
  } catch (err) {
    console.error("submitSingleAnswer error:", err.response?.data || err);
    
    if (err.response?.status === 401) {
      handleUnauthorized();
    }
    
    if (err.response?.data) {
      throw new Error(JSON.stringify(err.response.data));
    }
    
    throw err;
  }
};

// ================= SUBMIT BULK ANSWERS =================
export const submitBulkAnswers = async (interviewId, answers) => {
  try {
    console.log("Submitting bulk answers for interview:", interviewId);
    
    const res = await axios.post(
      `${BASE_API_URL}/candidate/interview/${interviewId}/submit-all/`,
      { answers },
      { 
        headers: getAuthHeaders(),
        timeout: 20000
      }
    );
    
    console.log("Bulk answers submitted successfully:", res.data);
    return res.data;
  } catch (err) {
    console.error("submitBulkAnswers error:", err.response?.data || err);
    
    if (err.response?.status === 401) {
      handleUnauthorized();
    }
    
    if (err.response?.data) {
      throw new Error(JSON.stringify(err.response.data));
    }
    
    throw err;
  }
};

// ================= GET CANDIDATE INTERVIEW STATUS =================
export const getCandidateInterviewStatus = async (interviewId) => {
  try {
    const interviews = await getUpcomingInterviews();
    const interview = interviews.find(i => i.id === interviewId);
    return interview?.status || null;
  } catch (err) {
    console.error("getCandidateInterviewStatus error:", err);
    return null;
  }
};


// ================= GET CANDIDATE INTERVIEW DETAILS =================
export const getCandidateInterviewDetail = async (interviewId) => {
  try {
    // Use the router-generated endpoint
    const res = await axios.get(  
      `${BASE_API_URL}/interviews/${interviewId}/`,  // ✅ This matches router.register
      { 
        headers: getAuthHeaders(),
        timeout: 5000
      }
    );
    
    return res.data;
  } catch (err) {
    console.error("getCandidateInterviewDetail error:", err.response?.data || err);
    
    if (err.response?.status === 401) {
      handleUnauthorized();
    }
    
    throw err;
  }
};

// ================= COMPLETE CANDIDATE INTERVIEW =================
// export const completeCandidateInterview = async (interviewId) => {
//   try {
//     // First, submit all answers (if any remaining)
//     const questions = await getCandidateInterviewQuestions(interviewId);
//     const answeredCount = questions.answered_count || 0;
//     const totalQuestions = questions.total_questions || 0;
    
//     if (answeredCount < totalQuestions) {
//       console.warn(`Interview has ${totalQuestions - answeredCount} unanswered questions`);
//     }
    
//     // The interview will be automatically marked as 'submitted' when all questions are answered
//     // Or you can call a specific endpoint if you have one
    
//     console.log("Interview completion process started");
//     return { success: true, message: "Interview completed successfully" };
//   } catch (err) {
//     console.error("completeCandidateInterview error:", err);
//     throw err;
//   }
// };

// ================= CANDIDATE INTERVIEW FLOW MANAGER =================
export const manageCandidateInterviewFlow = async (interviewId, action, data = null) => {
  try {
    let result;
    
    switch (action) {
      case 'start':
        result = await startCandidateInterview(interviewId);
        break;
        
      case 'get_questions':
        result = await getCandidateInterviewQuestions(interviewId);
        break;
        
      case 'submit_answer':
        if (!data) throw new Error("Answer data is required");
        result = await submitSingleAnswer(interviewId, data);
        break;
        
      case 'submit_all':
        if (!data || !Array.isArray(data)) {
          throw new Error("Answers array is required");
        }
        result = await submitBulkAnswers(interviewId, data);
        break;
        
      case 'get_status':
        result = await getCandidateInterviewStatus(interviewId);
        break;
        
      case 'get_detail':
        result = await getCandidateInterviewDetail(interviewId);
        break;
        
      case 'complete':
        result = await completeCandidateInterview(interviewId);
        break;
        
      default:
        throw new Error(`Unknown action: ${action}`);
    }
    
    return result;
  } catch (err) {
    console.error(`manageCandidateInterviewFlow error for action ${action}:`, err);
    throw err;
  }
};

// ================= TRACK INTERVIEW PROGRESS =================
export const trackInterviewProgress = async (interviewId) => {
  try {
    const [questions, detail] = await Promise.all([
      getCandidateInterviewQuestions(interviewId),
      getCandidateInterviewDetail(interviewId)
    ]);
    
    const progress = {
      interviewId,
      status: detail.status,
      title: detail.title || `Interview ${interviewId.substring(0, 8)}`,
      totalQuestions: questions.total_questions || 0,
      answeredCount: questions.answered_count || 0,
      progressPercentage: questions.total_questions ? 
        Math.round((questions.answered_count / questions.total_questions) * 100) : 0,
      startTime: detail.started_at,
      timeElapsed: detail.started_at ? 
        Math.floor((Date.now() - new Date(detail.started_at).getTime()) / 1000) : 0
    };
    
    return progress;
  } catch (err) {
    console.error("trackInterviewProgress error:", err);
    return null;
  }
};



// ================= GET QUESTION OPTIONS =================
export const getQuestionOptions = async (questionId) => {
  try {
    console.log(`Fetching options for question: ${questionId}`);
    
    // Try direct options endpoint first
    try {
      const res = await axios.get(
        `${BASE_API_URL}/questions/${questionId}/options/`,
        { 
          headers: getAuthHeaders(),
          timeout: 3000
        }
      );
      console.log(`Got options from options endpoint:`, res.data);
      return res.data;
    } catch (optionsErr) {
      console.log(`Options endpoint not found, trying question detail...`);
      
      // Fallback to question detail endpoint which might have options
      const res = await axios.get(
        `${BASE_API_URL}/questions/${questionId}/`,
        { 
          headers: getAuthHeaders(),
          timeout: 3000
        }
      );
      
      console.log(`Got question detail:`, res.data);
      
      // Extract options from question detail response
      const questionData = res.data;
      const options = questionData.options || [];
      const correctIndices = questionData.correct_option_indices || [];
      
      return {
        options: Array.isArray(options) ? options : [],
        correct_option_indices: Array.isArray(correctIndices) ? correctIndices : []
      };
    }
    
  } catch (err) {
    console.error(`getQuestionOptions error for question ${questionId}:`, err.response?.data || err);
    
    if (err.response?.status === 401) {
      handleUnauthorized();
    }
    
    // Return empty options if all fails
    console.warn(`Could not fetch options for question ${questionId}. Please ensure backend includes options in responses.`);
    return {
      options: [],
      correct_option_indices: []
    };
  }
};



// ================= FINALIZE INTERVIEW =================
export const finalizeInterview = async (interviewId) => {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(
      `${BASE_API_URL}/hr/interview/${interviewId}/finalize/`,
      {
        method: "POST",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    if (response.status === 401) {
      // Handle unauthorized
      localStorage.removeItem("token");
      localStorage.removeItem("user_role");
      window.location.href = "/login";
      return data;
    }

    if (response.status === 400) {
      // Check if interview is already completed
      if (data.error?.includes("already completed")) {
        return {
          success: false,
          message: "Interview is already completed",
          completed: true,
          error: data.error,
          existing_result: data.existing_result
        };
      }
    }

    if (!response.ok) {
      throw new Error(data.error || "Failed to finalize interview");
    }

    return {
      success: true,
      ...data
    };

  } catch (error) {
    console.error("Error finalizing interview:", error);
    throw error;
  }
};

// ================= GRADE CANDIDATE ANSWER =================
export const gradeCandidateAnswer = async (answerId, data) => {
  try {
    console.log(`Grading answer ${answerId}:`, data);

    const res = await axios.post(
      `${BASE_API_URL}/hr/answer/${answerId}/grade/`,
      {
        score: data.score,
        feedback: data.feedback,
      },
      {
        headers: getAuthHeaders(),
        timeout: 10000,
      }
    );

    console.log("Answer graded successfully:", res.data);
    return res.data;
  } catch (err) {
    console.error("gradeCandidateAnswer error:", err.response?.data || err);

    if (err.response?.status === 401) handleUnauthorized();

    if (err.response?.data) {
      throw new Error(JSON.stringify(err.response.data));
    }

    throw err;
  }
};

// ================= FETCH ALL QUESTIONS =================
export const fetchAllQuestions = async () => {
  try {
    console.log("Fetching all questions...");

    const res = await axios.get(`${BASE_API_URL}/questions/`, {
      headers: getAuthHeaders(),
      timeout: 10000,
    });

    console.log("Questions fetched successfully:", res.data);
    return res.data;
  } catch (err) {
    console.error("fetchAllQuestions error:", err.response?.data || err);

    if (err.response?.status === 401) handleUnauthorized();

    if (err.response?.data) {
      throw new Error(JSON.stringify(err.response.data));
    }

    throw err;
  }
};

// ================= COMPLETE CANDIDATE INTERVIEW =================
export const completeCandidateInterview = async (interviewId) => {
  try {
    console.log(`Completing interview ${interviewId}...`);

    // Call backend endpoint to mark interview as complete
    const res = await axios.post(
      `${BASE_API_URL}/candidate/interview/${interviewId}/complete/`,
      {},
      {
        headers: getAuthHeaders(),
        timeout: 15000,
      }
    );

    console.log("Interview completed successfully:", res.data);
    return res.data;
  } catch (err) {
    console.error("completeCandidateInterview error:", err.response?.data || err);

    if (err.response?.status === 401) handleUnauthorized();

    if (err.response?.data) {
      throw new Error(JSON.stringify(err.response.data));
    }

    throw err;
  }
};
