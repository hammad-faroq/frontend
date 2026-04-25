// src/pages/InterviewPreparation.js
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { 
  getInterviewPreparation, 
  generateMoreQuestions, 
  sendMockInterviewMessage,
  startMockInterview,
  submitMockInterviewAnswers,
  getMockInterviewResults,
  getMockInterviewProgress  // Add this import
} from "../services/api";
import { useNavigate } from "react-router-dom";
const normalizeScore = (score) => {
  const num = Number(score);
  if (!num || isNaN(num)) return 0;

  // assume 0–100 if > 10
  return num > 10 ? num / 10 : num;
};
function InterviewPreparation() {
  const [preparations, setPreparations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedJob, setSelectedJob] = useState(null);
  const [activeTab, setActiveTab] = useState("technical");
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isChatting, setIsChatting] = useState(false);
  const [chatMode, setChatMode] = useState("interview");
  const navigate = useNavigate();

  // New state for Mock Interview functionality
  const [mockInterviewSession, setMockInterviewSession] = useState(null);
  const [isStartingMockInterview, setIsStartingMockInterview] = useState(false);
  const [isSubmittingMockInterview, setIsSubmittingMockInterview] = useState(false);
  const [mockInterviewSettings, setMockInterviewSettings] = useState({
    difficulty: "medium",
    interviewType: "technical",
    totalQuestions: 5
  });
  const [userAnswers, setUserAnswers] = useState({});
  const [mockInterviewResults, setMockInterviewResults] = useState(null);
  const [showMockInterviewSetup, setShowMockInterviewSetup] = useState(false);
  const [showMockInterviewResults, setShowMockInterviewResults] = useState(false);
  
  // New state for progress tracking
  const [mockInterviewProgress, setMockInterviewProgress] = useState({
    job_id: null,
    job_title: "",
    sessions_completed: 0,
    progress_percentage: 0,
    progress: []
  });
  const [isLoadingProgress, setIsLoadingProgress] = useState(false);

  const fetchInterviewPreparations = async () => {
    try {
      setLoading(true);
      const data = await getInterviewPreparation();
      
      if (data && data.data) {
        setPreparations(data.data);
      } else {
        setPreparations([]);
      }
    } catch (err) {
      console.error("Error fetching interview preparations:", err);
      setError("Failed to load interview preparations. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch mock interview progress when a job is selected
  const fetchMockInterviewProgress = async (jobId) => {
    if (!jobId) return;
    
    setIsLoadingProgress(true);
    try {
      const progressData = await getMockInterviewProgress(jobId);
      setMockInterviewProgress(progressData);
    } catch (error) {
      console.error("Error fetching mock interview progress:", error);
      setMockInterviewProgress({
        job_id: jobId,
        job_title: "",
        sessions_completed: 0,
        progress_percentage: 0,
        progress: []
      });
    } finally {
      setIsLoadingProgress(false);
    }
  };

  useEffect(() => {
    fetchInterviewPreparations();
  }, []);

  // Fetch progress when selectedJob changes
  useEffect(() => {
    if (selectedJob) {
      fetchMockInterviewProgress(selectedJob.job_id);
    }
  }, [selectedJob]);

  // const handleGenerateMoreQuestions = async (jobId) => {
  //   try {
  //     const result = await generateMoreQuestions(jobId);
  //     if (result && result.message === "More questions generated successfully") {
  //       await fetchInterviewPreparations();
  //       alert("✅ More questions generated successfully!");
        
  //       if (selectedJob && selectedJob.job_id === jobId) {
  //         const updatedData = await getInterviewPreparation();
  //         const updatedPrep = updatedData.data?.find(p => p.job_id === jobId);
  //         if (updatedPrep) {
  //           setSelectedJob(updatedPrep);
  //         }
  //       }
  //     }
  //   } catch (error) {
  //     console.error("Error generating more questions:", error);
  //     alert("❌ Failed to generate more questions. Please try again.");
  //   }
  // };
const handleGenerateMoreQuestions = async (jobId) => {
  try {
    const result = await generateMoreQuestions(jobId);

    toast.success(result.message || "Success");

    // 🔥 FORCE REFRESH DATA
    const updated = await getInterviewPreparation(); 
    setPreparations(updated.data);

    // 🔥 also update selected job if open
    if (selectedJob?.job_id === jobId) {
      const updatedPrep = updated.data.find(p => p.job_id === jobId);
      setSelectedJob(updatedPrep);
    }

  } catch (error) {
    const msg =
      error?.response?.data?.error ||
      error?.response?.data?.message ||
      "Something went wrong";

    toast.error(msg);
  }
};
  const handleStartAIChat = (prep, mode = "interview") => {
    setSelectedJob(prep);
    setChatMode(mode);
    
    let initialMessage = "";
    switch (mode) {
      case "interview":
        initialMessage = `Starting mock interview for ${prep.job_title} at ${prep.company}. You can ask me questions or I can ask you!`;
        break;
      case "feedback":
        initialMessage = `I'm here to provide feedback on your answers for the ${prep.job_title} position. Share your responses and I'll help you improve them!`;
        break;
      case "questions":
        initialMessage = `Ask me anything about the ${prep.job_title} role at ${prep.company}. I can help with technical concepts, company research, or interview strategies!`;
        break;
      default:
        initialMessage = `How can I help you prepare for your ${prep.job_title} interview at ${prep.company}?`;
    }
    
    setChatHistory([
      {
        role: "assistant",
        content: initialMessage
      }
    ]);
    setChatMessage("");
    setMockInterviewSession(null);
    setMockInterviewResults(null);
    setShowMockInterviewSetup(false);
    setShowMockInterviewResults(false);
    setUserAnswers({});
  };

const handleSendChat = async () => {
  if (!chatMessage.trim() || !selectedJob) return;

  const userMessage = chatMessage.trim();
  setChatMessage("");
  setIsChatting(true);

  const newChatHistory = [
    ...chatHistory,
    { role: "user", content: userMessage }
  ];

  setChatHistory(newChatHistory);

  try {
    const response = await sendMockInterviewMessage(
      selectedJob.job_id,
      userMessage
    );

    setChatHistory([
      ...newChatHistory,
      { role: "assistant", content: response.reply }
    ]);

  } catch (error) {
    console.error("Error in AI chat:", error);

    const status = error?.status;   // ✅ FIXED
    const msg =
    error?.data?.error ||
    error?.message ||
    "Something went wrong. Please try again.";

    // ✅ HANDLE LIMIT ERRORS (IMPORTANT)
    if (status === 429) {
      setChatHistory([
        ...newChatHistory,
        {
          role: "assistant",
          content: `🚫 ${msg}`
        }
      ]);
      return;
    }

    // other errors
    setChatHistory([
      ...newChatHistory,
      {
        role: "assistant",
        content: `❌ ${msg}`
      }
    ]);

  } finally {
    setIsChatting(false);
  }
};
  // =============== MOCK INTERVIEW FUNCTIONS ===============
  
  const handleStartMockInterview = async () => {
    if (!selectedJob) return;
    
    setIsStartingMockInterview(true);
  //   if (mockInterviewProgress?.sessions_completed >= 3) {
  //     setIsStartingMockInterview(false); // important reset
  //     alert("🚫 Daily limit reached (3 interviews per day)");
  //     return;
  // }
    try {
      const userInput = {
        jobId: selectedJob.job_id,
        difficulty: mockInterviewSettings.difficulty,
        interviewType: mockInterviewSettings.interviewType,
        totalQuestions: mockInterviewSettings.totalQuestions
      };
      
      const response = await startMockInterview(userInput);
      
      if (response && response.session_id) {
        const questions = response.questions || [];
        
        const questionTexts = questions.map(q => {
          if (typeof q === 'string') return q;
          if (q && q.question) return q.question;
          if (q && q.text) return q.text;
          return "Question not available";
        });
        
        setMockInterviewSession({
          sessionId: response.session_id,
          jobId: selectedJob.job_id,
          questions: questionTexts,
          rawQuestions: questions,
          currentQuestionIndex: 0
        });
        setUserAnswers({});
        setMockInterviewResults(null);
        setShowMockInterviewSetup(false);
        setShowMockInterviewResults(false);
        toast.success(`✅ Mock interview started! Answer all ${mockInterviewSettings.totalQuestions} questions.`);
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("Error starting mock interview:", error);

      const status = error?.response?.status;
      const msg =
        error?.response?.data?.error ||
        error?.message ||
        "Something went wrong";

      if (status === 429) {
        toast.error("🚫 " + msg);
        return;
      }

      toast.error(`❌ ${msg}`);
    } finally {
      setIsStartingMockInterview(false);
    }
  };

  const handleAnswerChange = (questionIndex, answer) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }));
  };

  const handleSubmitMockInterview = async () => {
  if (!mockInterviewSession || Object.keys(userAnswers).length === 0) {
    toast.error("Please answer at least one question before submitting.");
    return;
  }
  
  setIsSubmittingMockInterview(true);
  try {
    const answersArray = Object.entries(userAnswers).map(([index, answer]) => ({
      question_index: parseInt(index),
      answer: answer
    }));
    
    const userInput = {
      jobId: mockInterviewSession.jobId,
      sessionId: mockInterviewSession.sessionId,
      answers: answersArray
    };
    
    console.log("Submitting answers:", userInput);
    const response = await submitMockInterviewAnswers(userInput);
    console.log("Submit API response:", response);
    
    if (response) {
      // Check different possible response formats
      let transformedResults = {
        session_id: mockInterviewSession.sessionId,
        job_id: mockInterviewSession.jobId,
        results: []
      };
      
      // Try to extract results from response
      if (Array.isArray(response.results)) {
        transformedResults.results = response.results;
      } else if (Array.isArray(response.feedback)) {
        transformedResults.results = response.feedback;
      } else if (Array.isArray(response.answers_feedback)) {
        transformedResults.results = response.answers_feedback;
      } else if (Array.isArray(response)) {
        transformedResults.results = response;
      } else if (response.session_id) {
        // Check for detailed results in response
        const detailedResults = response.results || response.feedback || response.answers_feedback;
        if (Array.isArray(detailedResults)) {
          transformedResults.results = detailedResults;
        } else {
          // Try to construct results from the original questions and user answers
          transformedResults.results = mockInterviewSession.questions.map((question, index) => ({
            question: question,
            answer: userAnswers[index] || "",
            feedback: response.feedback?.[index] || response.comment?.[index] || "Feedback not available",
            score: response.scores?.[index] || response.rating?.[index] || 0
          }));
        }
      }
      
      console.log("Transformed results:", transformedResults);
      setMockInterviewResults(transformedResults);
      setShowMockInterviewResults(true);
      setMockInterviewSession(null);
      
      // Refresh progress data after submission
      await fetchMockInterviewProgress(mockInterviewSession.jobId);
      
      toast.success("✅ Mock interview submitted! Check your results below.");
      
    } else {
      // Try to fetch results separately
      try {
        const results = await getMockInterviewResults(mockInterviewSession.sessionId);
        console.log("Fetched results:", results);
        
        if (results) {
          setMockInterviewResults(results);
          setShowMockInterviewResults(true);
          setMockInterviewSession(null);
          
          // Refresh progress data after submission
          await fetchMockInterviewProgress(mockInterviewSession.jobId);
          
          toast.success("✅ Mock interview submitted! Check your results below.");
        } else {
          // Create a basic results structure
          const basicResults = {
            session_id: mockInterviewSession.sessionId,
            job_id: mockInterviewSession.jobId,
            results: mockInterviewSession.questions.map((question, index) => ({
              question: question,
              answer: userAnswers[index] || "",
              feedback: "Your answers have been submitted successfully. Detailed feedback will be available soon.",
              score: 0
            }))
          };
          
          setMockInterviewResults(basicResults);
          setShowMockInterviewResults(true);
          setMockInterviewSession(null);
          
          // Refresh progress data after submission
          await fetchMockInterviewProgress(mockInterviewSession.jobId);
          
          toast.success("✅ Mock interview submitted! Check your results below.");
        }
      } catch (fetchError) {
        console.error("Error fetching results:", fetchError);
        
        // Create fallback results
        const fallbackResults = {
          session_id: mockInterviewSession.sessionId,
          job_id: mockInterviewSession.jobId,
          results: mockInterviewSession.questions.map((question, index) => ({
            question: question,
            answer: userAnswers[index] || "",
            feedback: "Your answers have been submitted. Check back later for detailed feedback.",
            score: 0
          }))
        };
        
        setMockInterviewResults(fallbackResults);
        setShowMockInterviewResults(true);
        setMockInterviewSession(null);
        
        // Still refresh progress even if detailed results aren't available
        await fetchMockInterviewProgress(mockInterviewSession.jobId);
        
        toast.success("✅ Answers submitted successfully! Check your progress tracking below.");
      }
    }
  } catch (error) {
    console.error("Error submitting mock interview:", error);
    toast.error(`❌ Failed to submit mock interview: ${error.message}`);
  } finally {
    setIsSubmittingMockInterview(false);
  }
};

  // const calculateMockInterviewScore = () => {
  //   if (!mockInterviewResults) return 0;
    
  //   const results = getResultsData();
    
  //   if (results.length === 0) return 0;
    
  //   const scores = results.map(r => r.score || 0);
  //   const average = scores.reduce((a, b) => a + b, 0) / scores.length;
  //   return Math.round(average * 10) / 10;
  // };
  const calculateMockInterviewScore = () => {
    if (!mockInterviewResults) return 0;

    const results = getResultsData();
    if (results.length === 0) return 0;

    const scores = results.map(r => normalizeScore(r.score));

    const average = scores.reduce((a, b) => a + b, 0) / scores.length;

    return Math.round(average * 10) / 10;
  };
  const getResultsData = () => {
    if (!mockInterviewResults) return [];
    
    if (Array.isArray(mockInterviewResults.results)) {
      return mockInterviewResults.results.map(item => ({
        question: item.question || item.question_text || "Question",
        answer: item.answer || item.user_answer || "",
        feedback: item.feedback || item.comment || item.analysis || "No feedback available",
        score: item.score || item.rating || 0
      }));
    } 
    
    if (Array.isArray(mockInterviewResults.feedback)) {
      return mockInterviewResults.feedback;
    }
    
    if (Array.isArray(mockInterviewResults.answers_feedback)) {
      return mockInterviewResults.answers_feedback;
    }
    
    if (Array.isArray(mockInterviewResults)) {
      return mockInterviewResults;
    }
    
    return [];
  };

  const extractQuestionText = (question) => {
    if (typeof question === 'string') return question;
    if (question && question.question) return question.question;
    if (question && question.text) return question.text;
    return "Question not available";
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calculate average progress score (converted to 0-10 scale)
  // const calculateAverageProgressScore = () => {
  //   if (!mockInterviewProgress.progress || mockInterviewProgress.progress.length === 0) return 0;
  //   const total = mockInterviewProgress.progress.reduce((sum, session) => sum + (session.score_percentage || 0), 0);
  //   const averagePercentage = total / mockInterviewProgress.progress.length;
  //   return Math.round((averagePercentage * 10) / 100 * 10) / 10; // Convert to 0-10 scale and round to 1 decimal
  // };
  const calculateAverageProgressScore = () => {
  if (!mockInterviewProgress?.progress?.length) return 0;

  const scores = mockInterviewProgress.progress.map(
    s => normalizeScore(s.score_percentage)
  );

  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;

  return Math.round(avg * 10) / 10;
};

  // Calculate highest score (converted to 0-10 scale)
  // const calculateHighestScore = () => {
  //   if (!mockInterviewProgress.progress || mockInterviewProgress.progress.length === 0) return 0;
  //   const highestPercentage = Math.max(...mockInterviewProgress.progress.map(session => session.score_percentage || 0));
  //   return Math.round((highestPercentage * 10) / 100 * 10) / 10; // Convert to 0-10 scale and round to 1 decimal
  // };
  const calculateHighestScore = () => {
  if (!mockInterviewProgress?.progress?.length) return 0;

  const scores = mockInterviewProgress.progress.map(
    s => normalizeScore(s.score_percentage)
  );

  return Math.round(Math.max(...scores) * 10) / 10;
};

  // Calculate improvement percentage
  const calculateImprovementPercentage = () => {
  if (!mockInterviewProgress?.progress?.length || mockInterviewProgress.progress.length < 2)
    return 0;

  const sorted = [...mockInterviewProgress.progress]
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

  const firstScore = normalizeScore(sorted[0].score_percentage);
  const lastScore = normalizeScore(sorted[sorted.length - 1].score_percentage);

  if (firstScore === 0) return 0;

  return Math.round(((lastScore - firstScore) / firstScore) * 100);
};

  const getChatModeTitle = () => {
    switch (chatMode) {
      case "interview": return "Mock Interview";
      case "feedback": return "Answer Feedback";
      case "questions": return "Q&A Session";
      default: return "AI Chat";
    }
  };

  const getChatModeDescription = () => {
    switch (chatMode) {
      case "interview":
        return "Practice with AI for your interview. I can ask you questions or you can ask me!";
      case "feedback":
        return "Get feedback on your answers. Share your responses and I'll help you improve them.";
      case "questions":
        return "Ask me anything about this role, company, or interview process.";
      default:
        return "Chat with AI to prepare for your interview.";
    }
  };

  const getModeSuggestions = () => {
    switch (chatMode) {
      case "interview":
        return [
          "Ask me a technical question about this role",
          "Let's practice a behavioral question",
          "Start the interview with a common question",
          "Give me a scenario-based question"
        ];
      case "feedback":
        return [
          "Here's my answer to 'Tell me about yourself'...",
          "How can I improve this technical answer?",
          "Give me feedback on my STAR method response",
          "Is this salary negotiation approach good?"
        ];
      case "questions":
        return [
          "What skills are most important for this role?",
          "What questions should I ask the interviewer?",
          "Tell me about common challenges in this position",
          "What's the typical career path for this role?"
        ];
      default:
        return [
          "How can I best prepare for this interview?",
          "What are common mistakes to avoid?",
          "Give me tips for negotiating salary",
          "How should I follow up after the interview?"
        ];
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading interview preparations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Back to Dashboard */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate("/jobseeker/dashboard")}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Dashboard
            </button>
            <button
              onClick={() => navigate("/jobseeker/jobs")}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse More Jobs
            </button>
          </div>
          
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Interview Preparation</h1>
            <p className="text-gray-600">Prepare for your interviews with AI-generated questions and coaching</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Main Content */}
        {selectedJob ? (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left: Interview Questions */}
            <div className="space-y-6">
              {/* Mock Interview Progress Graph - NEW SECTION */}
              {/* Mock Interview Progress Graph - NEW SECTION */}
{mockInterviewProgress.progress && mockInterviewProgress.progress.length > 0 && (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-800">📈 Mock Interview Progress</h2>
        <p className="text-gray-600 text-sm">Track your improvement over time</p>
      </div>
      <div className="flex gap-4">
        <div className="text-right">
          <div className="text-lg font-bold text-blue-600">
            {calculateAverageProgressScore()}/10
          </div>
          <div className="text-xs text-gray-500">Average Score</div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-green-600">
            {calculateHighestScore().toFixed(1)}/10
          </div>
          <div className="text-xs text-gray-500">Best Score</div>
        </div>
        {mockInterviewProgress.progress.length >= 2 && (
          <div className="text-right">
            <div className={`text-lg font-bold ${calculateImprovementPercentage() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {calculateImprovementPercentage() >= 0 ? '+' : ''}{calculateImprovementPercentage()}%
            </div>
            <div className="text-xs text-gray-500">Score Improvement</div>
          </div>
        )}
      </div>
    </div>
    
    {/* Sessions Completed */}
    <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-blue-800 mb-1">Sessions Completed</h3>
          <p className="text-blue-700 text-sm">Total mock interviews taken for this role</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-blue-600">{mockInterviewProgress.sessions_completed || mockInterviewProgress.progress.length}</div>
          <div className="text-sm text-blue-600">sessions</div>
        </div>
      </div>
      <div className="mt-3">
        <div className="flex justify-between text-sm text-blue-700 mb-1">
          <span>Overall Progress</span>
          <span>{Math.round(mockInterviewProgress.progress_percentage || 0)}%</span>
        </div>
        <div className="w-full bg-blue-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full h-2 transition-all duration-500"
            style={{ width: `${Math.min(100, mockInterviewProgress.progress_percentage || 0)}%` }}
          ></div>
        </div>
      </div>
    </div>
    
    {/* Progress Graph Visualization */}
    <div className="mb-6">
      <div className="flex items-end h-32 gap-2 mb-2">
        {mockInterviewProgress.progress.map((session, index) => {
          // Convert score_percentage (0-100) to 0-10 scale for bar height
          const normalizedScore = normalizeScore(session.score_percentage); // Convert to 0-10 scale
          const barHeight = Math.max(10, normalizedScore * 10); // Multiply by 10 to get percentage height
          
          return (
            <div key={session.session_id} className="flex-1 flex flex-col items-center">
              <div 
                className="w-full bg-gradient-to-t from-blue-500 to-blue-300 rounded-t-lg transition-all duration-300 hover:from-blue-600 hover:to-blue-400 cursor-pointer relative group"
                style={{ height: `${barHeight}%` }}
                title={`Session ${index + 1}\nScore: ${normalizedScore.toFixed(1)}/10\nDate: ${formatDate(session.date)}`}
              >
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 hidden group-hover:block bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                  {normalizedScore.toFixed(1)}/10
                </div>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {index + 1}
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex justify-between text-xs text-gray-500 px-1">
        <span>Session 1</span>
        <span>{mockInterviewProgress.progress.length} Sessions</span>
        <span>Session {mockInterviewProgress.progress.length}</span>
      </div>
    </div>
    
    {/* Progress Details Table */}
    <div className="space-y-3">
      <div className="flex justify-between text-sm font-medium text-gray-600 border-b pb-2">
        <span className="w-1/4">Session</span>
        <span className="w-1/2 text-center">Date & Time</span>
        <span className="w-1/4 text-right">Score</span>
      </div>
      
      {isLoadingProgress ? (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading progress...</p>
        </div>
      ) : (
        mockInterviewProgress.progress.map((session, index) => {
          const normalizedScore = normalizeScore(session.score_percentage);
          
          return (
            <div 
              key={session.session_id} 
              className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="w-1/4 text-gray-700 text-sm font-medium">
                Session {index + 1}
              </div>
              <div className="w-1/2 text-center text-sm text-gray-600">
                {formatDate(session.date)}
              </div>
              <div className="w-1/4 text-right">
                <span className={`font-semibold ${normalizedScore >= 8 ? 'text-green-600' : normalizedScore >= 6 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {normalizedScore.toFixed(1)}/10
                </span>
                <div className="text-xs text-gray-500">
                  ({normalizeScore(session.score_percentage).toFixed(1)}%)
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  </div>
)}

              {/* Main Interview Questions Panel */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">
                      {selectedJob.job_title} - {selectedJob.company}
                    </h2>
                    <p className="text-gray-600 text-sm">Interview Questions & Answers</p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedJob(null);
                      setMockInterviewSession(null);
                      setMockInterviewResults(null);
                      setShowMockInterviewSetup(false);
                      setShowMockInterviewResults(false);
                    }}
                    className="text-gray-600 hover:text-gray-800 flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to List
                  </button>
                </div>

                {/* Mock Interview Button */}
                {!mockInterviewSession && !showMockInterviewResults && (
                  <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-blue-800 mb-1">🎯 Structured Mock Interview</h3>
                        <p className="text-blue-700 text-sm">Take a timed mock interview with AI feedback</p>
                      </div>
                      <button
                        onClick={() => setShowMockInterviewSetup(true)}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-medium"
                      >
                        Start Mock Interview
                      </button>
                    </div>
                  </div>
                )}

                {/* Mock Interview Setup Modal */}
                {showMockInterviewSetup && !mockInterviewSession && !showMockInterviewResults && (
                  <div className="mb-6 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-800">Configure Mock Interview</h3>
                      <button
                        onClick={() => setShowMockInterviewSetup(false)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        ✕
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Difficulty Level
                        </label>
                        <div className="flex gap-2">
                          {["easy", "medium", "hard"].map(level => (
                            <button
                              key={level}
                              onClick={() => setMockInterviewSettings(prev => ({...prev, difficulty: level}))}
                              className={`flex-1 px-4 py-2 rounded-lg capitalize ${mockInterviewSettings.difficulty === level ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                            >
                              {level}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Interview Type
                        </label>
                        <div className="flex gap-2 flex-wrap">
                          {["technical", "behavioral", "mixed"].map(type => (
                            <button
                              key={type}
                              onClick={() => setMockInterviewSettings(prev => ({...prev, interviewType: type}))}
                              className={`px-4 py-2 rounded-lg capitalize ${mockInterviewSettings.interviewType === type ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                            >
                              {type}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Number of Questions: {mockInterviewSettings.totalQuestions}
                        </label>
                        <input
                          type="range"
                          min="3"
                          max="15"
                          value={mockInterviewSettings.totalQuestions}
                          onChange={(e) => setMockInterviewSettings(prev => ({...prev, totalQuestions: parseInt(e.target.value)}))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>3</span>
                          <span>9</span>
                          <span>15</span>
                        </div>
                      </div>

                      <button
                        onClick={handleStartMockInterview}
                        disabled={isStartingMockInterview}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-medium flex items-center justify-center gap-2"
                      >
                        {isStartingMockInterview ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Starting Interview...
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Start Mock Interview
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Mock Interview In Progress */}
                {mockInterviewSession && !showMockInterviewResults && (
                  <div className="mb-6 bg-white border border-blue-200 rounded-xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-blue-800">🎤 Mock Interview in Progress</h3>
                      <span className="text-sm font-medium bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                        Question {mockInterviewSession.currentQuestionIndex + 1} of {mockInterviewSession.questions.length}
                      </span>
                    </div>
                    
                    <div className="space-y-6">
                      {mockInterviewSession.questions.map((question, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start gap-3 mb-4">
                            <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="font-semibold">{index + 1}</span>
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-800 mb-2">
                                {extractQuestionText(question)}
                              </h4>
                              <textarea
                                value={userAnswers[index] || ""}
                                onChange={(e) => handleAnswerChange(index, e.target.value)}
                                placeholder="Type your answer here..."
                                className="w-full h-32 border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                              <div className="text-xs text-gray-500 mt-1">
                                {userAnswers[index]?.length || 0} characters
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 flex gap-3">
                      <button
                        onClick={() => {
                          setMockInterviewSession(null);
                          setUserAnswers({});
                        }}
                        className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                      >
                        Cancel Interview
                      </button>
                      <button
                        onClick={handleSubmitMockInterview}
                        disabled={isSubmittingMockInterview || Object.keys(userAnswers).length === 0}
                        className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all font-medium flex items-center justify-center gap-2"
                      >
                        {isSubmittingMockInterview ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Submitting...
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Submit Answers ({Object.keys(userAnswers).length}/{mockInterviewSession.questions.length})
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Mock Interview Results */}
                {showMockInterviewResults && mockInterviewResults && (
                  <div className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-xl font-semibold text-green-800">📊 Mock Interview Results</h3>
                        <p className="text-green-700">Review your performance and feedback</p>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-700">{calculateMockInterviewScore()}/10</div>
                        <div className="text-sm text-green-600">Overall Score</div>
                      </div>
                    </div>
                    

                    <div className="space-y-4">
                      {getResultsData().length > 0 ? (
                        getResultsData().map((result, index) => (
                          <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="font-semibold">Q{index + 1}</span>
                                  </div>
                                  <h4 className="font-medium text-gray-800">
                                    {result.question || `Question ${index + 1}`}
                                  </h4>
                                </div>
                              </div>
                              <div className="ml-4">
                                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${(result.score || 0) >= 8 ? 'bg-green-100 text-green-800' : (result.score || 0) >= 6 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                                  {result.score || 0}/10
                                </span>
                              </div>
                            </div>
                            
                            <div className="mb-4">
                              <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Your Answer:
                              </p>
                              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                                  {result.answer || userAnswers[index] || "No answer provided"}
                                </p>
                              </div>
                            </div>
                            
                            <div>
                              <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                </svg>
                                AI Feedback:
                              </p>
                              <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                                  {result.feedback || "No detailed feedback available yet. Your answers have been submitted successfully."}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
                          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <h4 className="text-lg font-semibold text-gray-800 mb-2">Mock Interview Submitted!</h4>
                          <p className="text-gray-600 mb-4">
                            Your answers have been submitted successfully. The AI is processing your responses and will provide detailed feedback soon.
                          </p>
                          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                            <p className="text-sm text-gray-700">
                              <strong>Session ID:</strong> #{mockInterviewResults.session_id}
                            </p>
                            <p className="text-sm text-gray-700">
                              <strong>Questions Answered:</strong> {mockInterviewSession?.questions?.length || Object.keys(userAnswers).length}
                            </p>
                          </div>
                          <p className="text-sm text-gray-500">
                            Check back later or refresh the page to see your detailed results and scores.
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-8 pt-6 border-t border-green-200">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="font-medium text-green-800">Performance Summary</h4>
                          <p className="text-sm text-green-700">Based on {getResultsData().length} evaluated questions</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-700">
                            {calculateMockInterviewScore().toFixed(1)}/10
                          </div>
                          <div className="text-sm text-green-600">Average Score</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
                          <div className="text-lg font-bold text-green-600">
                            {getResultsData().filter(r => (r.score || 0) >= 8).length}
                          </div>
                          <div className="text-xs text-gray-600">Excellent (8-10)</div>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
                          <div className="text-lg font-bold text-yellow-600">
                            {getResultsData().filter(r => (r.score || 0) >= 6 && (r.score || 0) < 8).length}
                          </div>
                          <div className="text-xs text-gray-600">Good (6-8)</div>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
                          <div className="text-lg font-bold text-red-600">
                            {getResultsData().filter(r => (r.score || 0) < 6).length}
                          </div>
                          <div className="text-xs text-gray-600">Needs Work (0-6)</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6 flex gap-3">
                      <button
                        onClick={() => {
                          setShowMockInterviewResults(false);
                          setMockInterviewResults(null);
                        }}
                        className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Close Results
                      </button>
                      <button
                        onClick={() => {
                          setShowMockInterviewSetup(true);
                          setShowMockInterviewResults(false);
                          setMockInterviewResults(null);
                        }}
                        className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Try Another Interview
                      </button>
                    </div>
                  </div>
                )}

                {/* Existing Tabs */}
                <div className="flex border-b border-gray-200 mb-6">
                  <button
                    className={`px-4 py-2 font-medium text-sm ${activeTab === "technical" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-600 hover:text-gray-800"}`}
                    onClick={() => setActiveTab("technical")}
                  >
                    Technical Questions ({selectedJob.interview_preparation?.technical_questions?.length || 0})
                  </button>
                  <button
                    className={`px-4 py-2 font-medium text-sm ${activeTab === "behavioral" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-600 hover:text-gray-800"}`}
                    onClick={() => setActiveTab("behavioral")}
                  >
                    Behavioral Questions ({selectedJob.interview_preparation?.behavioral_questions?.length || 0})
                  </button>
                </div>

                {/* Questions List */}
                <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2">
                  {activeTab === "technical" ? (
                    selectedJob.interview_preparation?.technical_questions?.map((q, idx) => (
                      <div key={idx} className="border border-gray-100 rounded-xl p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="font-semibold">Q{idx + 1}</span>
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-800 mb-2">{q.question}</h3>
                            <div className="bg-green-50 border border-green-100 rounded-lg p-3">
                              <p className="text-sm text-green-800">
                                <span className="font-medium">Ideal Answer:</span> {q.ideal_answer}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    selectedJob.interview_preparation?.behavioral_questions?.map((q, idx) => (
                      <div key={idx} className="border border-gray-100 rounded-xl p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="font-semibold">Q{idx + 1}</span>
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-800 mb-2">{q.question}</h3>
                            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                              <p className="text-sm text-blue-800">
                                <span className="font-medium">Sample Answer:</span> {q.sample_answer}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => handleGenerateMoreQuestions(selectedJob.job_id)}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Generate More Questions
                  </button>
                </div>
              </div>
            </div>

            {/* Right: AI Chat Assistant */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-xl font-semibold text-gray-800">AI Chat Assistant</h2>
                  <div className="flex gap-2">
                    <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {getChatModeTitle()}
                    </span>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-4">{getChatModeDescription()}</p>
                
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => {
                      setChatMode("interview");
                      handleStartAIChat(selectedJob, "interview");
                    }}
                    className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${chatMode === "interview" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                  >
                    🎤 Mock Interview
                  </button>
                  <button
                    onClick={() => {
                      setChatMode("feedback");
                      handleStartAIChat(selectedJob, "feedback");
                    }}
                    className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${chatMode === "feedback" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                  >
                    📝 Get Feedback
                  </button>
                  <button
                    onClick={() => {
                      setChatMode("questions");
                      handleStartAIChat(selectedJob, "questions");
                    }}
                    className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${chatMode === "questions" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                  >
                    ❓ Ask Questions
                  </button>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">💡 Quick suggestions:</p>
                  <div className="flex flex-wrap gap-2">
                    {getModeSuggestions().map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => setChatMessage(suggestion)}
                        className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="h-[350px] overflow-y-auto mb-4 space-y-4 p-2 border border-gray-100 rounded-lg bg-gray-50">
                {chatHistory.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg ${msg.role === "user" ? "bg-blue-50 ml-8" : "bg-white mr-8 border border-gray-200"}`}
                  >
                    <div className="flex items-start gap-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === "user" ? "bg-blue-600" : "bg-gray-700"}`}>
                        <span className="text-white text-xs font-medium">
                          {msg.role === "user" ? "Y" : "AI"}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-800 whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {isChatting && (
                  <div className="p-3 rounded-lg bg-white mr-8 border border-gray-200">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center">
                        <span className="text-white text-xs font-medium">AI</span>
                      </div>
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendChat()}
                  placeholder={`Type your message for ${getChatModeTitle().toLowerCase()}...`}
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isChatting}
                />
                <button
                  onClick={handleSendChat}
                  disabled={!chatMessage.trim() || isChatting}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  {isChatting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      Send
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* List View */
          <div className="space-y-6">
            {preparations.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-200">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">💬</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">No Interview Preparations</h3>
                <p className="text-gray-600 mb-6">You haven't prepared for any interviews yet.</p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => navigate("/jobseeker/jobs")}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Browse Jobs to Apply
                  </button>
                  <button
                    onClick={() => navigate("/jobseeker/dashboard")}
                    className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Back to Dashboard
                  </button>
                </div>
              </div>
            ) : (
              preparations.map((prep) => (
                <div key={prep.job_id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-800 mb-1">{prep.job_title}</h3>
                      <p className="text-gray-600 mb-3">{prep.company}</p>
                      <div className="flex flex-wrap gap-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                            <span className="font-semibold">{prep.interview_preparation?.technical_questions?.length || 0}</span>
                          </div>
                          <span className="text-sm text-gray-600">Technical Questions</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center">
                            <span className="font-semibold">{prep.interview_preparation?.behavioral_questions?.length || 0}</span>
                          </div>
                          <span className="text-sm text-gray-600">Behavioral Questions</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => setSelectedJob(prep)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View Questions
                      </button>
                      <button
                        onClick={() => handleGenerateMoreQuestions(prep.job_id)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Generate More
                      </button>
                      <button
                        onClick={() => handleStartAIChat(prep, "interview")}
                        className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        Chat with AI
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default InterviewPreparation;