// src/pages/CandidateInterviewQuestions.js
// ✅ FIXED: Security issue - removed correct answer display to candidate

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  getCandidateInterviewQuestions,
  getCandidateInterviewDetail,
  submitSingleAnswer,
  submitAllAnswers,
  getQuestionOptions,
} from "../services/interviewApi";

const isValidUUID = (value) => {
  if (['test', '1', '2', 'in_progress_test'].includes(value)) {
    return true;
  }
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
};

function CandidateInterviewQuestions() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [interviewInfo, setInterviewInfo] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [loadingOptions, setLoadingOptions] = useState({});
  const [optionsError, setOptionsError] = useState(null);
  const [submittedQuestions, setSubmittedQuestions] = useState(new Set());

  useEffect(() => {
    fetchInterviewData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, retryCount]);

  // Function to fetch options for MCQ questions
  const fetchOptionsForMCQQuestions = async (mcqQuestions) => {
    const optionsPromises = mcqQuestions.map(async (question) => {
      try {
        setLoadingOptions(prev => ({ ...prev, [question.id]: true }));
        
        let optionsData;
        try {
          optionsData = await getQuestionOptions(question.id);
          console.log(`Options data for ${question.id}:`, optionsData);
        } catch (apiError) {
          console.warn(`API error for options ${question.id}:`, apiError);
          throw apiError;
        }

        // Process options data - REMOVED correct indices from candidate view
        let options = [];

        if (optionsData) {
          const data = optionsData.data || optionsData;
          
          if (data.options && Array.isArray(data.options)) {
            // For candidate, only show the options, NOT which ones are correct
            options = data.options.map((option, index) => ({
              id: index,
              text: typeof option === 'object' 
                ? (option.text || option.option || option.value || JSON.stringify(option))
                : String(option)
            }));
          } else if (Array.isArray(data)) {
            options = data.map((option, index) => ({
              id: index,
              text: typeof option === 'object' 
                ? (option.text || option.option || option.value || JSON.stringify(option))
                : String(option)
            }));
          }
        }

        return {
          questionId: question.id,
          options,
          success: true
        };

      } catch (error) {
        console.error(`Failed to fetch options for ${question.id}:`, error);
        return {
          questionId: question.id,
          options: [],
          success: false,
          error: error.message
        };
      } finally {
        setLoadingOptions(prev => ({ ...prev, [question.id]: false }));
      }
    });

    const results = await Promise.allSettled(optionsPromises);
    
    return results.map(result => {
      if (result.status === 'fulfilled') {
        return result.value;
      }
      return {
        questionId: 'unknown',
        options: [],
        success: false,
        error: result.reason?.message || 'Unknown error'
      };
    });
  };

  const fetchInterviewData = async () => {
    try {
      setLoading(true);
      setApiError(null);
      setOptionsError(null);

      if (id === 'test' || id === '1' || id === '2' || id === 'in_progress_test') {
        console.log("Using mock data for test interview questions:", id);
        
        const mockInterviewData = {
          id: id,
          title: `Test Interview ${id}`,
          status: 'in_progress',
          started_at: new Date().toISOString(),
          job_title: 'Test Position',
          company_name: 'Test Company',
          description: 'This is a test interview for demonstration purposes.'
        };
        
        setInterviewInfo(mockInterviewData);
        
        let mockQuestions = [];
        
        if (id === 'in_progress_test') {
          mockQuestions = [
            {
              id: 'mock-question-1',
              question_text: "What is your greatest professional achievement?",
              question_type: 'DESC',
              category: 'Behavioral',
              difficulty: 'medium',
              points: 10,
              time_limit_minutes: 5,
              has_answer: true
            }
          ];
        } else {
          mockQuestions = [
            {
              id: 'mock-question-5',
              question_text: "What is HCI in Software?",
              question_type: 'MCQ',
              category: 'Domain Knowledge',
              difficulty: 'medium',
              points: 10,
              time_limit_minutes: 3,
              has_answer: false,
              options: [
                { id: 0, text: "Human-Computer Interaction" },
                { id: 1, text: "Hardware Configuration Interface" },
                { id: 2, text: "High Capacity Integration" },
                { id: 3, text: "Hypertext Content Interface" }
              ]
            }
          ];
        }
        
        setQuestions(mockQuestions);
        
        const initialAnswers = {};
        mockQuestions.forEach((q) => {
          initialAnswers[q.id] = q.question_type === 'MCQ' ? [] : "";
        });
        setAnswers(initialAnswers);
        
        setLoading(false);
        return;
      }

      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
        setApiError("Invalid interview link. Please use a valid interview link.");
        setLoading(false);
        return;
      }

      const interviewData = await getCandidateInterviewDetail(id);
      setInterviewInfo(interviewData);

      if (interviewData.status !== 'in_progress' && interviewData.status !== 'submitted') {
        setApiError("Interview is not in progress. Please start the interview first.");
        setLoading(false);
        return;
      }

      const questionsData = await getCandidateInterviewQuestions(id);
      console.log("API Response:", questionsData);

      if (!questionsData?.questions?.length) {
        setQuestions([]);
        setApiError("No questions assigned to this interview yet.");
        return;
      }

      const initialQuestions = questionsData.questions;
      const mcqQuestions = initialQuestions.filter(q => q.question_type === 'MCQ');
      
      setQuestions(initialQuestions);

      if (mcqQuestions.length > 0) {
        console.log(`Fetching options for ${mcqQuestions.length} MCQ questions...`);
        const optionsResults = await fetchOptionsForMCQQuestions(mcqQuestions);
        
        setQuestions(prevQuestions => 
          prevQuestions.map(q => {
            const optionsResult = optionsResults.find(r => r.questionId === q.id);
            if (optionsResult && q.question_type === 'MCQ') {
              return {
                ...q,
                options: optionsResult.options,
                optionsLoaded: optionsResult.success,
                optionsError: optionsResult.error
              };
            }
            return q;
          })
        );

        const failedOptions = optionsResults.filter(r => !r.success);
        if (failedOptions.length > 0) {
          setOptionsError(`Failed to load options for ${failedOptions.length} question(s).`);
        }
      }

      const initialAnswers = {};
      initialQuestions.forEach((q) => {
        initialAnswers[q.id] = q.question_type === 'MCQ' ? [] : "";
      });
      setAnswers(initialAnswers);

    } catch (err) {
      console.error("Failed to load interview questions:", err);
      const errorMessage = err?.response?.data?.error || err?.message || "Failed to load interview questions";
      setApiError(errorMessage);
      
      if (err?.response?.status === 404) {
        setApiError("Interview not found or you don't have access. Please start the interview from the interview details page.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    
    // Mark question as answered for UI feedback
    if (value && ((Array.isArray(value) && value.length > 0) || value.toString().trim() !== '')) {
      setSubmittedQuestions(prev => new Set([...prev, questionId]));
    }

    // Auto-save after delay
    clearTimeout(window.__saveTimer);
    window.__saveTimer = setTimeout(() => {
      saveAnswer(questionId, value);
    }, 1200);
  };

  const saveAnswer = async (questionId, answerValue) => {
    try {
      setSaving(true);
      
      const currentQuestion = questions.find(q => q.id === questionId);
      const isMCQ = currentQuestion?.question_type === 'MCQ';
      
      const answerData = {
        question_id: questionId,
        answer_text: isMCQ ? "" : (answerValue || ""),
        selected_options: isMCQ ? (Array.isArray(answerValue) ? answerValue : [answerValue].filter(Boolean)) : [],
        time_taken_seconds: Math.floor((Date.now() - window.questionStartTime) / 1000) || 0,
      };

      console.log("Saving answer:", answerData);
      await submitSingleAnswer(id, answerData);

    } catch (err) {
      console.error("Auto-save failed:", err);
      // Don't alert for auto-save failures to avoid interrupting the user
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitAll = async () => {
    if (!window.confirm("Are you sure you want to submit all answers and complete the interview? You cannot change answers after submission.")) return;

    try {
      setSaving(true);

      const payload = Object.entries(answers).map(([questionId, answerValue]) => {
        const question = questions.find(q => q.id === questionId);
        const isMCQ = question?.question_type === 'MCQ';
        
        return {
          question_id: questionId,
          answer_text: isMCQ ? "" : (answerValue || ""),
          selected_options: isMCQ ? (Array.isArray(answerValue) ? answerValue : [answerValue].filter(Boolean)) : [],
          time_taken_seconds: 0,
        };
      });

      console.log("Submitting all answers:", payload);
      const result = await submitAllAnswers(id, payload);
      console.log("Submit all result:", result);

      toast.success("Interview submitted successfully! You will be redirected to your interview dashboard.");
      
      navigate(`/jobseeker/interview/${id}/result`);

    } catch (err) {
      console.error("Submit all failed:", err);
      toast.error(err?.response?.data?.error || "Failed to submit interview. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleBackToInterview = () => {
    navigate(`/jobseeker/interview/${id}`);
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  const retryOptionsFetch = async (questionId) => {
    try {
      setLoadingOptions(prev => ({ ...prev, [questionId]: true }));
      const optionsData = await getQuestionOptions(questionId);
      
      setQuestions(prevQuestions => 
        prevQuestions.map(q => {
          if (q.id === questionId) {
            const data = optionsData.data || optionsData;
            const options = (data.options || []).map((option, index) => ({
              id: index,
              text: typeof option === 'object' 
                ? (option.text || option.option || option.value || JSON.stringify(option))
                : String(option)
            }));
            
            return {
              ...q,
              options,
              optionsLoaded: true,
              optionsError: null
            };
          }
          return q;
        })
      );
    } catch (error) {
      console.error("Failed to retry options fetch:", error);
    } finally {
      setLoadingOptions(prev => ({ ...prev, [questionId]: false }));
    }
  };

  const handleNextQuestion = () => {
    // Save current question before moving
    const currentQuestion = questions[currentQuestionIndex];
    if (currentQuestion) {
      saveAnswer(currentQuestion.id, answers[currentQuestion.id] || "");
    }
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex bg-gray-50">
        {/* <Sidebar /> */}
        <div className="flex-1 p-6 flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading interview questions...</p>
          <p className="text-gray-400 text-sm mt-2">This may take a moment</p>
        </div>
      </div>
    );
  }

  if (apiError) {
    return (
      <div className="min-h-screen flex bg-gray-50">
        {/* <Sidebar /> */}
        <div className="flex-1 p-6 max-w-4xl mx-auto">
          <button
            onClick={handleBackToInterview}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-6"
          >
            <span className="mr-2">←</span> Back to Interview Details
          </button>

          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <div className="flex items-start mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                <span className="text-red-600">⚠️</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-red-800 mb-2">Unable to Load Questions</h3>
                <div className="text-red-600">
                  <p>{apiError}</p>
                  <p className="text-sm mt-2">Interview ID: <code className="bg-red-100 px-2 py-1 rounded">{id}</code></p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 space-y-3">
              <button
                onClick={handleRetry}
                className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
              >
                Try Loading Again
              </button>
              <button
                onClick={handleBackToInterview}
                className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
              >
                Back to Interview Details
              </button>
              {apiError.includes("not in progress") && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                  <p className="text-blue-700 text-sm">
                    <strong>Note:</strong> You need to start the interview from the interview details page first.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const isMCQ = currentQuestion?.question_type === 'MCQ';
  const isLoadingOptions = loadingOptions[currentQuestion?.id];
  const hasOptionsError = currentQuestion?.optionsError;
  const hasOptions = currentQuestion?.options && currentQuestion.options.length > 0;
  const isQuestionAnswered = submittedQuestions.has(currentQuestion?.id) || 
    (answers[currentQuestion?.id] && (
      isMCQ 
        ? Array.isArray(answers[currentQuestion.id]) && answers[currentQuestion.id].length > 0
        : answers[currentQuestion.id].toString().trim() !== ''
    ));

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* <Sidebar /> */}

      <div className="flex-1 p-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={handleBackToInterview}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <span className="mr-2">←</span> Back to Interview
          </button>
          
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {interviewInfo?.title || "Interview Questions"}
              </h1>
              {interviewInfo?.company_name && (
                <p className="text-gray-600 mt-1">
                  {interviewInfo.company_name} • {interviewInfo.job_title}
                </p>
              )}
            </div>
            <div className="flex items-center space-x-4">
              {saving && (
                <span className="text-sm text-gray-500 flex items-center">
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></span>
                  Auto-saving...
                </span>
              )}
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                interviewInfo?.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                interviewInfo?.status === 'submitted' ? 'bg-green-100 text-green-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {interviewInfo?.status?.replace('_', ' ') || 'In Progress'}
              </span>
            </div>
          </div>
        </div>

        {/* Options error alert */}
        {optionsError && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center">
              <span className="text-yellow-600 mr-2">⚠️</span>
              <p className="text-yellow-700">{optionsError}</p>
            </div>
          </div>
        )}

        {/* Progress bar and question counter */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
            <span className="text-sm text-gray-600">
              {Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Questions sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Question list sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
              <h3 className="font-semibold text-gray-700 mb-3">Questions</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {questions.map((q, index) => (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQuestionIndex(index)}
                    className={`w-full text-left p-3 rounded-lg flex items-center justify-between ${
                      currentQuestionIndex === index
                        ? 'bg-blue-50 border border-blue-200'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                        currentQuestionIndex === index
                          ? 'bg-blue-100 text-blue-600'
                          : submittedQuestions.has(q.id) || (answers[q.id] && 
                            ((q.question_type === 'MCQ' && Array.isArray(answers[q.id]) && answers[q.id].length > 0) || 
                             (q.question_type !== 'MCQ' && answers[q.id].toString().trim() !== '')))
                          ? 'bg-green-100 text-green-600'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-medium text-gray-700 truncate max-w-[120px]">
                          {q.question_text.substring(0, 30)}...
                        </p>
                        <p className="text-xs text-gray-500">
                          {q.question_type === 'MCQ' ? 'Multiple Choice' : 'Descriptive'}
                        </p>
                      </div>
                    </div>
                    {submittedQuestions.has(q.id) || (answers[q.id] && 
                      ((q.question_type === 'MCQ' && Array.isArray(answers[q.id]) && answers[q.id].length > 0) || 
                       (q.question_type !== 'MCQ' && answers[q.id].toString().trim() !== ''))) ? (
                      <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                    ) : null}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main question area */}
          <div className="lg:col-span-3">
            {currentQuestion ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-semibold text-gray-800">
                      Question {currentQuestionIndex + 1}
                    </h2>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        currentQuestion.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                        currentQuestion.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {currentQuestion.difficulty || 'Medium'}
                      </span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                        {currentQuestion.points || 10} points
                      </span>
                      {isMCQ && isLoadingOptions && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium flex items-center">
                          <span className="animate-spin rounded-full h-3 w-3 border-b-2 border-yellow-800 mr-1"></span>
                          Loading...
                        </span>
                      )}
                      {isQuestionAnswered && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium flex items-center">
                          ✓ Answered
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-gray-800 text-lg mb-6 leading-relaxed">
                    {currentQuestion.question_text}
                  </p>
                  
                  <div className="text-sm text-gray-600">
                    <span className="inline-block bg-gray-100 px-3 py-1 rounded-full mr-2">
                      {currentQuestion.category || 'General'}
                    </span>
                    {currentQuestion.question_type === 'DESC' && (
                      <span className="inline-block bg-purple-100 text-purple-800 px-3 py-1 rounded-full">
                        Descriptive Answer
                      </span>
                    )}
                    {currentQuestion.question_type === 'MCQ' && (
                      <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full">
                        Multiple Choice
                      </span>
                    )}
                    {currentQuestion.time_limit_minutes && (
                      <span className="inline-block bg-orange-100 text-orange-800 px-3 py-1 rounded-full">
                        {currentQuestion.time_limit_minutes} min time limit
                      </span>
                    )}
                  </div>
                </div>

                {/* Answer area */}
                <div className="mb-8">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {currentQuestion.question_type === 'DESC' 
                      ? 'Your Answer' 
                      : 'Select your answer(s)'}
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  
                  {currentQuestion.question_type === 'DESC' ? (
                    <textarea
                      className="w-full h-64 border border-gray-300 rounded-lg p-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      value={answers[currentQuestion.id] || ""}
                      onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                      placeholder="Type your detailed answer here..."
                      rows={8}
                    />
                  ) : isMCQ ? (
                    <div className="space-y-3">
                      {isLoadingOptions ? (
                        <div className="p-6 text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                          <p className="text-gray-600">Loading answer options...</p>
                        </div>
                      ) : hasOptionsError ? (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                          <div className="flex items-start">
                            <span className="text-red-600 mr-2">❌</span>
                            <div>
                              <p className="text-red-700 font-medium">Failed to load options</p>
                              <p className="text-red-600 text-sm mt-1">{currentQuestion.optionsError}</p>
                              <button
                                onClick={() => retryOptionsFetch(currentQuestion.id)}
                                className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                              >
                                Try Again
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : hasOptions ? (
                        currentQuestion.options.map((option) => {
                          const isSelected = answers[currentQuestion.id]?.includes(option.id.toString());
                          
                          return (
                            <label 
                              key={option.id} 
                              className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
                                isSelected
                                  ? 'bg-blue-50 border-blue-300'
                                  : 'border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected || false}
                                onChange={(e) => {
                                  const currentAnswers = answers[currentQuestion.id] || [];
                                  let newAnswers;
                                  if (e.target.checked) {
                                    newAnswers = [...currentAnswers, option.id.toString()];
                                  } else {
                                    newAnswers = currentAnswers.filter(a => a !== option.id.toString());
                                  }
                                  handleAnswerChange(currentQuestion.id, newAnswers);
                                }}
                                className="h-5 w-5 text-blue-600 rounded"
                              />
                              <div className="ml-3">
                                <span className="text-gray-800">{option.text}</span>
                              </div>
                            </label>
                          );
                        })
                      ) : (
                        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <div className="flex items-start">
                            <span className="text-yellow-600 mr-2">⚠️</span>
                            <div>
                              <p className="text-yellow-700 font-medium">No options available</p>
                              <p className="text-yellow-600 text-sm mt-1">
                                Please contact support for assistance with this question.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>

                {/* Navigation buttons */}
                <div className="flex justify-between pt-4 border-t border-gray-200">
                  <button
                    onClick={handlePreviousQuestion}
                    disabled={currentQuestionIndex === 0}
                    className={`px-6 py-3 rounded-lg font-medium transition ${
                      currentQuestionIndex === 0
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    ← Previous
                  </button>

                  <div className="flex space-x-3">
                    {currentQuestionIndex === questions.length - 1 ? (
                      <button
                        onClick={handleSubmitAll}
                        disabled={saving}
                        className={`px-6 py-3 rounded-lg font-medium transition ${
                          saving
                            ? 'bg-gray-400 text-white cursor-not-allowed'
                            : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                      >
                        {saving ? (
                          <>
                            <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></span>
                            Submitting...
                          </>
                        ) : (
                          'Submit Interview'
                        )}
                      </button>
                    ) : (
                      <button
                        onClick={handleNextQuestion}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition"
                      >
                        Save & Next →
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl text-green-600">✓</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Interview Complete</h3>
                <p className="text-gray-600 mb-6">
                  You have answered all available questions.
                </p>
                <button
                  onClick={handleSubmitAll}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                >
                  Submit Final Answers
                </button>
              </div>
            )}

            {/* Submit section */}
            {questions.length > 0 && (
              <div className="mt-6 p-6 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-green-800 mb-1">Ready to submit?</h3>
                    <p className="text-green-700 text-sm">
                      You have answered {Object.values(answers).filter(a => 
                        Array.isArray(a) ? a.length > 0 : a.toString().trim() !== ''
                      ).length} of {questions.length} questions.
                    </p>
                  </div>
                  <button
                    onClick={handleSubmitAll}
                    disabled={saving}
                    className={`px-6 py-3 rounded-lg font-medium transition ${
                      saving
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-green-600 to-blue-600 text-white hover:from-green-700 hover:to-blue-700'
                    }`}
                  >
                    {saving ? (
                      <>
                        <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></span>
                        Submitting...
                      </>
                    ) : (
                      'Submit All Answers'
                    )}
                  </button>
                </div>
                <div className="mt-4 text-sm text-gray-600">
                  <p className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Answered questions: {Object.values(answers).filter(a => 
                      Array.isArray(a) ? a.length > 0 : a.toString().trim() !== ''
                    ).length}
                  </p>
                  <p className="flex items-center mt-1">
                    <span className="w-2 h-2 bg-gray-300 rounded-full mr-2"></span>
                    Remaining: {questions.length - Object.values(answers).filter(a => 
                      Array.isArray(a) ? a.length > 0 : a.toString().trim() !== ''
                    ).length}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CandidateInterviewQuestions;