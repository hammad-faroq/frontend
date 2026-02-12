import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { 
  createInterviewQuestion, 
  createBulkInterviewQuestions,
  assignQuestionsToInterview, 
  getHRJobs,
  getInterviewDetail,
  getCategories,
  updateInterviewCategories
} from "../services/interviewApi";

// Default question structure
const DEFAULT_QUESTION = {
  question_text: "",
  question_type: "MCQ",
  grading_method: "MANUAL",
  options: [{ text: "", is_correct: false }, { text: "", is_correct: false }],
  expected_keywords: "",
  points: 10,
  difficulty: "medium",
  time_limit_minutes: 5
};

const BULK_TEMPLATE_JSON = `{
  "questions": [
    {
      "question_text": "Select correct HTTP methods",
      "question_type": 1,
      "points": 5,
      "options": ["GET", "POST", "DELETE", "CONNECT"],
      "correct_option_indices": [0, 2],
      "difficulty": "easy",
      "is_active": true,
      "category": 1
    },
    {
      "question_text": "Explain Django ORM and QuerySets",
      "question_type": 2,
      "points": 10,
      "keywords": ["django", "orm", "queryset"],
      "auto_score_enabled": true,
      "is_active": true,
      "category": 1
    }
  ]
}`;

const QUESTION_TYPES = { MCQ: "MCQ", DESCRIPTIVE: "DESCRIPTIVE" };
const GRADING_METHODS = { MANUAL: "MANUAL", AUTO: "AUTO" };
const INTERVIEW_STATUS = { STARTED: "started", UNKNOWN: "unknown", SCHEDULED: "scheduled", DRAFT: "draft" };
const QUESTION_TYPE_MAP = { MCQ: 1, DESCRIPTIVE: 2 };

function HRAddInterviewQuestions() {
  const { interviewId } = useParams();

  // Current question being edited
  const [currentQuestion, setCurrentQuestion] = useState(DEFAULT_QUESTION);
  
  // List of saved questions (ready to be submitted)
  const [savedQuestions, setSavedQuestions] = useState([]);
  
  const [interviewStatus, setInterviewStatus] = useState(INTERVIEW_STATUS.UNKNOWN);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [savingQuestion, setSavingQuestion] = useState(false);
  const [submittingAll, setSubmittingAll] = useState(false);
  const [interviewCategories, setInterviewCategories] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [updatingCategories, setUpdatingCategories] = useState(false);
  
  // Bulk upload states
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkText, setBulkText] = useState(BULK_TEMPLATE_JSON);
  const [bulkMode, setBulkMode] = useState("json");
  const [bulkProcessing, setBulkProcessing] = useState(false);
  const [bulkResults, setBulkResults] = useState(null);

  const isLocked = interviewStatus === INTERVIEW_STATUS.STARTED;
  const isMCQ = currentQuestion.question_type === QUESTION_TYPES.MCQ;
  const isAuto = currentQuestion.grading_method === GRADING_METHODS.AUTO;

  useEffect(() => {
    console.log("HRAddInterviewQuestions interviewId:", interviewId);
    loadAllData();
  }, [interviewId]);

  const loadAllData = useCallback(async () => {
    if (!interviewId) return;
    
    setLoading(true);
    try {
      const interviews = await getHRJobs();
      const interview = interviews.find(i => String(i.id) === String(interviewId));
      setInterviewStatus(interview?.status || INTERVIEW_STATUS.UNKNOWN);
      
      if (interviewId) {
        try {
          const interviewDetail = await getInterviewDetail(interviewId);
          console.log("Interview detail loaded:", interviewDetail);
          
          if (interviewDetail.categories && Array.isArray(interviewDetail.categories)) {
            setInterviewCategories(interviewDetail.categories);
            setSelectedCategories(interviewDetail.categories.map(cat => cat.id || cat));
          }
        } catch (catErr) {
          console.error("Error loading interview categories:", catErr);
        }
      }
      
      const categories = await getCategories();
      setAllCategories(categories);
      
    } catch (err) {
      console.error("Error loading data:", err);
      setInterviewStatus(INTERVIEW_STATUS.UNKNOWN);
    } finally {
      setLoading(false);
    }
  }, [interviewId]);

  // Current question handlers
  const handleChange = (field, value) => {
    setCurrentQuestion(prev => ({ ...prev, [field]: value }));
  };

  const handleOptionChange = (index, field, value) => {
    setCurrentQuestion(prev => {
      const options = [...prev.options];
      options[index] = { ...options[index], [field]: value };
      return { ...prev, options };
    });
  };

  const addOption = () => {
    if (currentQuestion.options.length < 6) {
      setCurrentQuestion(prev => ({ 
        ...prev, 
        options: [...prev.options, { text: "", is_correct: false }] 
      }));
    }
  };

  const removeOption = (index) => {
    if (currentQuestion.options.length > 2) {
      setCurrentQuestion(prev => {
        const options = [...prev.options];
        options.splice(index, 1);
        return { ...prev, options };
      });
    }
  };

  const handleCategoryToggle = (categoryId) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };

  const handleSaveCategories = async () => {
    if (!interviewId || selectedCategories.length === 0) {
      setError("Please select at least one category");
      return;
    }

    setUpdatingCategories(true);
    try {
      await updateInterviewCategories(interviewId, selectedCategories);
      
      const interviewDetail = await getInterviewDetail(interviewId);
      if (interviewDetail.categories && Array.isArray(interviewDetail.categories)) {
        setInterviewCategories(interviewDetail.categories);
      }
      
      setShowCategoryModal(false);
      setSuccess("Categories updated successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error updating categories:", err);
      setError(err.message || "Failed to update categories");
    } finally {
      setUpdatingCategories(false);
    }
  };

  // Validation
  const validateQuestion = (question) => {
    if (!question.question_text.trim()) return "Question text is required";
    
    if (question.question_type === "MCQ") {
      const validOptions = question.options.filter(o => o.text.trim());
      if (validOptions.length < 2) return "MCQ must have at least 2 valid options";
      
      const optionTexts = validOptions.map(o => o.text.trim().toLowerCase());
      const uniqueTexts = new Set(optionTexts);
      if (uniqueTexts.size !== optionTexts.length) {
        return "MCQ options must be unique";
      }
      
      if (question.grading_method === "AUTO") {
        const correctOptions = question.options.filter(o => o.is_correct);
        if (correctOptions.length === 0) return "Select at least one correct option for auto-grading";
      }
    }
    
    if (question.question_type === "DESCRIPTIVE" && question.grading_method === "AUTO" && !question.expected_keywords.trim()) {
      return "Expected keywords are required for auto-grading descriptive questions";
    }
    
    return null;
  };

  // Format question for API
  const formatQuestionForAPI = (question, categoryId) => {
    const payload = {
      question_text: question.question_text.trim(),
      question_type: QUESTION_TYPE_MAP[question.question_type],
      difficulty: question.difficulty,
      points: question.points,
      time_limit_minutes: question.time_limit_minutes,
      is_active: true,
      category: categoryId
    };

    if (question.question_type === "DESCRIPTIVE") {
      if (question.expected_keywords.trim()) {
        payload.keywords = question.expected_keywords
          .split(",")
          .map(k => k.trim())
          .filter(Boolean);
        payload.auto_score_enabled = question.grading_method === "AUTO";
      }
    }

    if (question.question_type === "MCQ") {
      payload.options = question.options.map(o => o.text.trim());
      
      if (question.grading_method === "AUTO") {
        const correctIndices = question.options
          .map((option, index) => option.is_correct ? index : -1)
          .filter(index => index !== -1);
        
        payload.correct_option_indices = correctIndices;
        payload.auto_score_enabled = true;
      } else {
        payload.correct_option_indices = [];
        payload.auto_score_enabled = false;
      }
      
      payload.keywords = [];
    }

    return payload;
  };

  // Save current question to the list
  const handleSaveQuestion = () => {
    if (isLocked || savingQuestion) return;

    const validationError = validateQuestion(currentQuestion);
    if (validationError) {
      setError(validationError);
      return;
    }

    // Create a copy of the current question with an ID
    const questionToSave = {
      ...currentQuestion,
      id: Date.now(), // Simple ID for local tracking
      savedAt: new Date().toLocaleTimeString()
    };

    // Add to saved questions
    setSavedQuestions(prev => [...prev, questionToSave]);
    
    // Show success message
    setSuccess(`Question "${currentQuestion.question_text.substring(0, 30)}..." saved!`);
    setTimeout(() => setSuccess(null), 2000);
    
    // Reset form for next question
    setCurrentQuestion(DEFAULT_QUESTION);
  };

  // Remove a saved question
  const handleRemoveSavedQuestion = (index) => {
    setSavedQuestions(prev => prev.filter((_, i) => i !== index));
  };

  // Submit all saved questions
  const handleSubmitAllQuestions = async () => {
    if (isLocked || submittingAll || savedQuestions.length === 0) return;

    if (!interviewId) {
      setError("Interview ID is missing!");
      return;
    }

    if (interviewCategories.length === 0) {
      setError("This interview has no categories. Please add categories first.");
      setShowCategoryModal(true);
      return;
    }

    setSubmittingAll(true);
    setError(null);

    try {
      let categoryId = null;
      if (interviewCategories.length > 0) {
        const firstCategory = interviewCategories[0];
        categoryId = firstCategory.id || firstCategory;
      }

      if (!categoryId) {
        throw new Error("No valid category found for this interview.");
      }

      // Format all saved questions
      const formattedQuestions = savedQuestions.map(q => formatQuestionForAPI(q, categoryId));
      console.log("Submitting all questions:", formattedQuestions);

      // Submit all questions at once
      const result = await createBulkInterviewQuestions(formattedQuestions);
      console.log("Bulk creation result:", result);

      if (result.success) {
        // Assign all created questions to interview
        if (result.questions && result.questions.length > 0) {
          const questionIds = result.questions.map(q => q.id);
          const assignmentRes = await assignQuestionsToInterview(interviewId, questionIds);
          console.log("Assignment response:", assignmentRes);

          if (assignmentRes.success) {
            const finalMessage = `Successfully created ${result.created} questions and assigned them to interview!`;
            setSuccess(finalMessage);
            setTimeout(() => setSuccess(null), 5000);
            
            // Clear saved questions
            setSavedQuestions([]);
          } else {
            throw new Error(`Created ${result.created} questions, but failed to assign: ${assignmentRes.message}`);
          }
        } else {
          throw new Error("No questions were created");
        }
      } else {
        throw new Error(result.error || "Bulk creation failed");
      }
      
    } catch (err) {
      console.error("Error in handleSubmitAllQuestions:", err);
      setError(err.message || "Failed to submit questions");
    } finally {
      setSubmittingAll(false);
    }
  };

  // Bulk upload handlers (simplified)
  const handleBulkUpload = async () => {
    if (bulkProcessing) return;
    
    setBulkProcessing(true);
    setError(null);
    setBulkResults(null);
    
    try {
      let parsedQuestions;
      
      if (bulkMode === "text") {
        // Simple CSV parsing
        const lines = bulkText.trim().split('\n');
        parsedQuestions = lines.slice(1).map(line => {
          const values = line.split(',').map(v => v.trim());
          return {
            question_text: values[0] || "",
            question_type: values[1] === "DESCRIPTIVE" ? 2 : 1,
            points: parseInt(values[2]) || 10,
            difficulty: values[3] || "medium",
            category: parseInt(values[8]) || 1,
            options: values[4] ? values[4].split('|') : [],
            correct_option_indices: values[5] ? values[5].split('|').map(Number) : [],
            keywords: values[6] ? values[6].split('|') : [],
            auto_score_enabled: values[7] === "true"
          };
        });
      } else {
        // JSON parsing
        const parsed = JSON.parse(bulkText);
        parsedQuestions = parsed.questions || parsed;
      }
      
      if (interviewCategories.length === 0) {
        setError("This interview has no categories. Please add categories first.");
        setShowBulkModal(false);
        setShowCategoryModal(true);
        return;
      }
      
      const firstCategoryId = interviewCategories[0]?.id || interviewCategories[0];
      const preparedQuestions = parsedQuestions.map(q => ({
        question_text: q.question_text || "",
        question_type: q.question_type,
        points: q.points || 10,
        difficulty: q.difficulty || "medium",
        is_active: true,
        category: q.category || firstCategoryId,
        time_limit_minutes: q.time_limit_minutes || 5,
        options: q.options || [],
        correct_option_indices: q.correct_option_indices || [],
        keywords: q.keywords || [],
        auto_score_enabled: q.auto_score_enabled || false
      }));
      
      const result = await createBulkInterviewQuestions(preparedQuestions);
      
      if (result.success) {
        setBulkResults({
          success: true,
          created: result.created,
          questions: result.questions
        });
        
        if (result.questions && result.questions.length > 0 && interviewId) {
          const questionIds = result.questions.map(q => q.id);
          try {
            await assignQuestionsToInterview(interviewId, questionIds);
            setSuccess(`Successfully created ${result.created} questions and assigned them to interview!`);
          } catch (assignErr) {
            console.error("Failed to assign questions:", assignErr);
            setSuccess(`Created ${result.created} questions, but failed to assign: ${assignErr.message}`);
          }
        } else {
          setSuccess(`Successfully created ${result.created} questions!`);
        }
        
        setTimeout(() => {
          setShowBulkModal(false);
          setSuccess(null);
          setBulkResults(null);
        }, 5000);
      } else {
        throw new Error(result.error || "Bulk creation failed");
      }
      
    } catch (err) {
      console.error("Bulk upload error:", err);
      setError(err.message || "Failed to process bulk upload");
    } finally {
      setBulkProcessing(false);
    }
  };

  const getStatusClass = () => {
    switch (interviewStatus) {
      case INTERVIEW_STATUS.STARTED: return "bg-red-100 text-red-800 border border-red-200";
      case INTERVIEW_STATUS.SCHEDULED: return "bg-yellow-100 text-yellow-800 border border-yellow-200";
      case INTERVIEW_STATUS.UNKNOWN: return "bg-gray-100 text-gray-800 border border-gray-200";
      default: return "bg-blue-50 text-blue-800 border border-blue-100";
    }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p className="mt-4 text-gray-600">Loading interview details...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Add Interview Questions</h1>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-600">Interview Status:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusClass()}`}>
                    {interviewStatus.toUpperCase()}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button 
                  className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  onClick={() => setShowBulkModal(true)}
                  disabled={isLocked}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                  </svg>
                  Bulk Upload
                </button>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center flex-wrap gap-3">
                <button 
                  className="inline-flex items-center px-3 py-2 border border-blue-600 text-blue-600 font-medium rounded-lg hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors"
                  onClick={() => setShowCategoryModal(true)}
                >
                  {interviewCategories.length === 0 ? (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Add Categories
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit Categories
                    </>
                  )}
                </button>
                
                {interviewCategories.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-600">Categories:</span>
                    <div className="flex flex-wrap gap-2">
                      {interviewCategories.map((cat, index) => (
                        <span key={cat.id || cat} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                          {cat.name || `Category ${index + 1}`}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="text-right">
                <div className="text-sm">
                  {isLocked ? (
                    <span className="inline-flex items-center text-red-600 font-medium">
                      <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Interview started - cannot add questions
                    </span>
                  ) : (
                    <span className="inline-flex items-center text-emerald-600 font-medium">
                      <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                      </svg>
                      Ready to add questions
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Alerts Section */}
          <div className="p-6 pt-0">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-red-400 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div className="text-sm text-red-700 whitespace-pre-wrap">{error}</div>
                </div>
              </div>
            )}
            
            {success && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-emerald-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-sm text-emerald-800">{success}</div>
                </div>
              </div>
            )}
            
            {interviewCategories.length === 0 && !loading && (
              <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-amber-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <div>
                      <div className="font-medium text-amber-800">No Categories Assigned</div>
                      <div className="text-sm text-amber-700 mt-1">Questions may fail to assign without categories. Please add categories to the interview first.</div>
                    </div>
                  </div>
                  <button 
                    className="inline-flex items-center px-4 py-2 bg-amber-600 text-white font-medium rounded-lg hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-colors whitespace-nowrap"
                    onClick={() => setShowCategoryModal(true)}
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Categories Now
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Current Question Form */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg mr-3">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Add New Question</h2>
                  <p className="text-sm text-gray-600">Fill in the details for a single question</p>
                </div>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Question Text */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Question Text <span className="text-red-500">*</span>
                </label>
                <textarea 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
                  rows={3}
                  value={currentQuestion.question_text} 
                  disabled={isLocked} 
                  onChange={e => handleChange("question_text", e.target.value)}
                  placeholder="Enter your question here..."
                />
              </div>

              {/* Question Type & Grading Method */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Question Type</label>
                  <select 
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
                    value={currentQuestion.question_type} 
                    disabled={isLocked} 
                    onChange={e => handleChange("question_type", e.target.value)}
                  >
                    <option value="MCQ">Multiple Choice (MCQ)</option>
                    <option value="DESCRIPTIVE">Descriptive / Essay</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Grading Method</label>
                  <select 
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
                    value={currentQuestion.grading_method} 
                    disabled={isLocked} 
                    onChange={e => handleChange("grading_method", e.target.value)}
                  >
                    <option value="MANUAL">Manual Grading</option>
                    <option value="AUTO">Auto Grading</option>
                  </select>
                </div>
              </div>

              {/* Points, Difficulty & Time */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Points</label>
                  <input 
                    type="number"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
                    value={currentQuestion.points} 
                    disabled={isLocked} 
                    onChange={e => handleChange("points", parseInt(e.target.value) || 10)}
                    min="1"
                    max="100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                  <select 
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
                    value={currentQuestion.difficulty} 
                    disabled={isLocked} 
                    onChange={e => handleChange("difficulty", e.target.value)}
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time (minutes)</label>
                  <input 
                    type="number"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
                    value={currentQuestion.time_limit_minutes} 
                    disabled={isLocked} 
                    onChange={e => handleChange("time_limit_minutes", parseInt(e.target.value) || 5)}
                    min="1"
                    max="60"
                  />
                </div>
              </div>

              {/* MCQ Options Section */}
              {isMCQ && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-700">Multiple Choice Options</label>
                    <button 
                      className="inline-flex items-center px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      onClick={addOption}
                      disabled={isLocked || currentQuestion.options.length >= 6}
                      type="button"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Add Option
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {currentQuestion.options.map((opt, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="flex-1">
                          <div className="flex rounded-lg overflow-hidden border border-gray-300 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
                            <span className="inline-flex items-center px-3 bg-gray-50 border-r border-gray-300 text-gray-700 font-medium">
                              {String.fromCharCode(65 + i)}
                            </span>
                            <input 
                              className="flex-1 px-3 py-2.5 border-0 focus:ring-0 disabled:bg-gray-50"
                              placeholder={`Option ${String.fromCharCode(65 + i)}`}
                              value={opt.text} 
                              disabled={isLocked} 
                              onChange={e => handleOptionChange(i, "text", e.target.value)}
                            />
                            {currentQuestion.options.length > 2 && (
                              <button 
                                className="px-3 py-2.5 text-gray-400 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                type="button"
                                onClick={() => removeOption(i)}
                                disabled={isLocked}
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            )}
                          </div>
                        </div>
                        {isAuto && (
                          <div className="flex items-center">
                            <input 
                              type="checkbox" 
                              className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                              id={`correct-${i}`}
                              checked={opt.is_correct} 
                              disabled={isLocked} 
                              onChange={e => handleOptionChange(i, "is_correct", e.target.checked)}
                            />
                            <label htmlFor={`correct-${i}`} className="ml-2 text-sm text-gray-700 whitespace-nowrap">
                              Correct
                            </label>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Descriptive Auto-grading Keywords */}
              {!isMCQ && isAuto && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expected Keywords for Auto-grading <span className="text-red-500">*</span>
                  </label>
                  <textarea 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
                    rows={2}
                    value={currentQuestion.expected_keywords} 
                    disabled={isLocked} 
                    onChange={e => handleChange("expected_keywords", e.target.value)}
                    placeholder="Enter keywords separated by commas (e.g., django, orm, queryset, authentication)"
                  />
                </div>
              )}

              {/* Save Button */}
              <div className="pt-6 border-t border-gray-200">
                <div className="text-center">
                  <button 
                    className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    disabled={isLocked || savingQuestion || interviewCategories.length === 0} 
                    onClick={handleSaveQuestion}
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Save Question to List
                  </button>
                  <p className="text-sm text-gray-500 mt-2">
                    Question will be saved locally. Submit all when ready.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Saved Questions List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-green-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 bg-emerald-100 rounded-lg mr-3">
                    <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Saved Questions</h2>
                    <p className="text-sm text-gray-600">{savedQuestions.length} question{savedQuestions.length !== 1 ? 's' : ''} ready for submission</p>
                  </div>
                </div>
                
                {savedQuestions.length > 0 && (
                  <button 
                    className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    onClick={handleSubmitAllQuestions}
                    disabled={isLocked || submittingAll || interviewCategories.length === 0}
                  >
                    {submittingAll ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                        </svg>
                        Submit All
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
            
            <div className="p-6">
              {savedQuestions.length === 0 ? (
                <div className="text-center py-12 px-4 border-2 border-dashed border-gray-300 rounded-xl">
                  <div className="mx-auto w-12 h-12 text-gray-400 mb-4">
                    <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Questions Saved Yet</h3>
                  <p className="text-gray-600">Add questions using the form on the left</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                  {savedQuestions.map((q, index) => (
                    <div 
                      key={q.id}
                      className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-3">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Q{index + 1}
                            </span>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {q.question_type === "MCQ" ? "MCQ" : "Descriptive"}
                            </span>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                              {q.difficulty}
                            </span>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                              {q.points} pts
                            </span>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              {q.grading_method}
                            </span>
                          </div>
                          
                          <p className="text-gray-900 font-medium mb-2 line-clamp-2">
                            {q.question_text}
                          </p>
                          
                          <div className="flex items-center text-sm text-gray-500">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Saved at {q.savedAt}
                          </div>
                          
                          {q.question_type === "MCQ" && (
                            <div className="mt-2 text-sm text-gray-500">
                              Options: {q.options.filter(o => o.text.trim()).length}
                              {q.grading_method === "AUTO" && ` • Correct: ${q.options.filter(o => o.is_correct).length}`}
                            </div>
                          )}
                        </div>
                        
                        <button 
                          className="ml-3 p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                          onClick={() => handleRemoveSavedQuestion(index)}
                          title="Remove question"
                          type="button"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {savedQuestions.length > 0 && (
                    <div className="pt-6 border-t border-gray-200">
                      <div className="text-center">
                        <button 
                          className="inline-flex items-center px-8 py-3 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          onClick={handleSubmitAllQuestions}
                          disabled={isLocked || submittingAll || interviewCategories.length === 0}
                        >
                          {submittingAll ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                              Submitting {savedQuestions.length} Question{savedQuestions.length !== 1 ? 's' : ''}...
                            </>
                          ) : (
                            <>
                              <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                              </svg>
                              Submit All {savedQuestions.length} Question{savedQuestions.length !== 1 ? 's' : ''}
                            </>
                          )}
                        </button>
                        <p className="text-sm text-gray-500 mt-2">
                          All questions will be created and assigned to this interview
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Upload Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <svg className="w-6 h-6 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                  </svg>
                  <h3 className="text-xl font-semibold text-gray-900">Bulk Upload Questions</h3>
                </div>
                <button 
                  type="button" 
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  onClick={() => setShowBulkModal(false)}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">JSON Input</label>
                  <textarea 
                    className="w-full h-64 px-4 py-3 font-mono text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    value={bulkText}
                    onChange={(e) => setBulkText(e.target.value)}
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    Enter questions in the exact format shown above
                  </p>
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
              <button 
                type="button" 
                className="px-5 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1 transition-colors disabled:opacity-50"
                onClick={() => setShowBulkModal(false)}
                disabled={bulkProcessing}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleBulkUpload}
                disabled={bulkProcessing || !bulkText.trim() || interviewCategories.length === 0}
              >
                {bulkProcessing ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Processing...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                    </svg>
                    Upload Questions
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center">
                <svg className="w-6 h-6 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                <h3 className="text-xl font-semibold text-gray-900">Select Interview Categories</h3>
              </div>
            </div>
            
            <div className="p-6 max-h-96 overflow-y-auto">
              <div className="space-y-3">
                {allCategories.map(category => (
                  <div key={category.id} className="flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <input
                      className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                      type="checkbox"
                      id={`category-${category.id}`}
                      checked={selectedCategories.includes(category.id)}
                      onChange={() => handleCategoryToggle(category.id)}
                    />
                    <label 
                      className="ml-3 text-gray-900 font-medium cursor-pointer flex-1"
                      htmlFor={`category-${category.id}`}
                    >
                      {category.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
              <button 
                type="button" 
                className="px-5 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1 transition-colors disabled:opacity-50"
                onClick={() => setShowCategoryModal(false)}
                disabled={updatingCategories}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleSaveCategories}
                disabled={selectedCategories.length === 0 || updatingCategories}
              >
                {updatingCategories ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Saving...
                  </span>
                ) : (
                  'Save Categories'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HRAddInterviewQuestions;