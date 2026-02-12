import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  reviewCandidateAnswers,
  finalizeInterview,
  gradeCandidateAnswer,
} from "../services/interviewApi";

const HRReviewAnswers = () => {
  const { interviewId } = useParams();
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [expandedQuestion, setExpandedQuestion] = useState(null);
  const [interviewConfig, setInterviewConfig] = useState(null);
  const [interviewDetails, setInterviewDetails] = useState(null);

  useEffect(() => {
    const fetchAnswers = async () => {
      try {
        console.log("Fetching answers for interview:", interviewId);
        
        // First, get the organized answers view
        const data = await reviewCandidateAnswers(interviewId);
        console.log("Fetched answers data:", data);
        
        // Extract interview configuration from data
        if (data.interview) {
          setInterviewDetails(data.interview);
        }
        
        // Check if we have answers_by_category structure
        if (data.answers_by_category) {
          // Flatten the answers from categories
          const allAnswers = [];
          Object.values(data.answers_by_category).forEach(categoryAnswers => {
            allAnswers.push(...categoryAnswers);
          });
          
          // Process and validate answers data
          const processedAnswers = allAnswers.map(ans => ({
            id: ans.answer_id || ans.id,
            question_id: ans.question_id,
            question_text: ans.question_text || "No question text",
            question_type: ans.question_type?.code || ans.question_type || 'DESC',
            question_category: ans.category_name || "Uncategorized",
            answer_text: ans.candidate_answer?.text || ans.answer_text || "",
            selected_options: ans.candidate_answer?.selected_options || ans.selected_options || [],
            code_snippet: ans.candidate_answer?.code_snippet || ans.code_snippet || "",
            auto_score: ans.auto_score !== null ? Number(ans.auto_score) : null,
            hr_score: ans.hr_score !== null ? Number(ans.hr_score) : null,
            hr_feedback: ans.hr_feedback || "",
            question_points: ans.question_points || 10,
            time_taken_seconds: ans.time_taken || ans.time_taken_seconds || 0,
            needs_review: ans.needs_review || (ans.hr_score === null && (ans.question_type?.code !== 'MCQ' || ans.question_type !== 'MCQ')),
            correct_options: ans.correct_options || [],
            file_url: ans.candidate_answer?.file_url || null
          }));
          
          setAnswers(processedAnswers);
        } else if (Array.isArray(data)) {
          // If response is already an array
          const processedAnswers = data.map(ans => ({
            ...ans,
            question_points: Number(ans.question_points) || 10,
            auto_score: ans.auto_score !== null ? Number(ans.auto_score) : null,
            hr_score: ans.hr_score !== null ? Number(ans.hr_score) : null,
            selected_options: Array.isArray(ans.selected_options) ? ans.selected_options : [],
            correct_options: Array.isArray(ans.correct_options) ? ans.correct_options : [],
            question_type: ans.question_type?.code || ans.question_type || 'DESC'
          }));
          
          setAnswers(processedAnswers);
        } else if (data.answers) {
          // If we have an answers field
          const processedAnswers = data.answers.map(ans => ({
            ...ans,
            question_points: Number(ans.question_points) || 10,
            auto_score: ans.auto_score !== null ? Number(ans.auto_score) : null,
            hr_score: ans.hr_score !== null ? Number(ans.hr_score) : null,
            selected_options: Array.isArray(ans.selected_options) ? ans.selected_options : [],
            correct_options: Array.isArray(ans.correct_options) ? ans.correct_options : [],
            question_type: ans.question_type?.code || ans.question_type || 'DESC'
          }));
          
          setAnswers(processedAnswers);
        } else {
          console.warn("Unexpected response format:", data);
          setAnswers([]);
        }
        
      } catch (err) {
        console.error("Error fetching answers:", err);
        setAnswers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAnswers();
  }, [interviewId]);

  // Determine if auto-scoring is enabled
  const isAutoScoringEnabled = () => {
    // Check if any answer has auto_score
    const hasAutoScores = answers.some(ans => 
      ans.auto_score !== null && ans.auto_score !== undefined && ans.auto_score >= 0
    );
    
    return hasAutoScores;
  };

  // Determine scoring mode
  const getScoringMode = () => {
    const autoEnabled = isAutoScoringEnabled();
    
    if (autoEnabled) {
      // For now, allow HR override by default
      return "AUTO_WITH_OVERRIDE";
    }
    
    return "MANUAL_ONLY";
  };

  const handleScoreChange = (index, field, value) => {
    const updated = [...answers];
    
    if (field === "hr_score") {
      const maxPoints = updated[index].question_points || 10;
      let validatedValue = parseFloat(value);
      
      if (isNaN(validatedValue) || value === "") {
        validatedValue = null;
      } else {
        validatedValue = Math.min(Math.max(validatedValue, 0), maxPoints);
      }
      
      updated[index] = { ...updated[index], [field]: validatedValue };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    
    setAnswers(updated);
  };

  // Calculate totals
  const calculateTotals = () => {
    const scoringMode = getScoringMode();
    const isAutoOnly = scoringMode === "AUTO_ONLY";
    
    let totalAutoScore = 0;
    let totalHRScore = 0;
    let totalMaxPoints = 0;
    let mcqCount = 0;
    let descriptiveCount = 0;
    let mcqAutoScore = 0;
    let mcqHRScore = 0;
    let descriptiveAutoScore = 0;
    let descriptiveHRScore = 0;
    
    answers.forEach(ans => {
      const maxPoints = ans.question_points || 10;
      const autoScore = ans.auto_score || 0;
      // For auto-only mode, use auto_score as final score
      const hrScore = isAutoOnly ? autoScore : (ans.hr_score !== null ? ans.hr_score : autoScore);
      
      totalMaxPoints += maxPoints;
      totalAutoScore += autoScore;
      totalHRScore += hrScore;
      
      if (ans.question_type === 'MCQ') {
        mcqCount++;
        mcqAutoScore += autoScore;
        mcqHRScore += hrScore;
      } else {
        descriptiveCount++;
        descriptiveAutoScore += autoScore;
        descriptiveHRScore += hrScore;
      }
    });
    
    // Avoid division by zero
    const autoPercentage = totalMaxPoints > 0 ? (totalAutoScore / totalMaxPoints * 100) : 0;
    const hrPercentage = totalMaxPoints > 0 ? (totalHRScore / totalMaxPoints * 100) : 0;
    
    return {
      totalAutoScore: totalAutoScore.toFixed(2),
      totalHRScore: totalHRScore.toFixed(2),
      totalMaxPoints: totalMaxPoints.toFixed(2),
      autoPercentage: autoPercentage.toFixed(1),
      hrPercentage: hrPercentage.toFixed(1),
      mcqCount,
      descriptiveCount,
      mcqAutoScore: mcqAutoScore.toFixed(2),
      mcqHRScore: mcqHRScore.toFixed(2),
      descriptiveAutoScore: descriptiveAutoScore.toFixed(2),
      descriptiveHRScore: descriptiveHRScore.toFixed(2),
      hasQuestions: answers.length > 0,
      totalQuestions: answers.length,
      isAutoOnly,
      scoringMode,
    };
  };

  const totals = calculateTotals();

  const handleSave = async () => {
    const scoringMode = getScoringMode();
    
    // For auto-only mode, disable saving HR scores
    if (scoringMode === "AUTO_ONLY") {
      alert("Auto-scoring is enabled. HR scores cannot be modified in this mode.");
      return;
    }
    
    setSaving(true);
    try {
      // Filter answers that have HR scores or feedback
      const answersToSave = answers.filter(ans => 
        (ans.hr_score !== null && ans.hr_score !== undefined) || 
        (ans.hr_feedback && ans.hr_feedback.trim() !== "")
      );
      
      if (answersToSave.length === 0) {
        alert("No changes to save! Please enter scores or feedback.");
        return;
      }

      console.log("Saving answers:", answersToSave);
      
      const savePromises = answersToSave.map(ans => 
        gradeCandidateAnswer(ans.id, {
          score: ans.hr_score !== null ? ans.hr_score : 0,
          feedback: ans.hr_feedback || "",
        })
      );

      const results = await Promise.all(savePromises);
      console.log("Save results:", results);
      
      alert(`${answersToSave.length} score(s) and feedback saved successfully!`);
      
      // Refresh data
      const data = await reviewCandidateAnswers(interviewId);
      
      // Update answers based on the refreshed data
      if (data.answers_by_category) {
        const allAnswers = [];
        Object.values(data.answers_by_category).forEach(categoryAnswers => {
          allAnswers.push(...categoryAnswers);
        });
        
        const processedAnswers = allAnswers.map(ans => ({
          id: ans.answer_id || ans.id,
          question_text: ans.question_text || "No question text",
          question_type: ans.question_type?.code || ans.question_type || 'DESC',
          answer_text: ans.candidate_answer?.text || ans.answer_text || "",
          selected_options: ans.candidate_answer?.selected_options || ans.selected_options || [],
          auto_score: ans.auto_score !== null ? Number(ans.auto_score) : null,
          hr_score: ans.hr_score !== null ? Number(ans.hr_score) : null,
          hr_feedback: ans.hr_feedback || "",
          question_points: ans.question_points || 10,
        }));
        
        setAnswers(processedAnswers);
      }
      
    } catch (err) {
      console.error("Save error:", err);
      alert(`Failed to save scores: ${err.message || "Please try again."}`);
    } finally {
      setSaving(false);
    }
  };

  const handleFinalize = async () => {
    // Show confirmation dialog
    if (!window.confirm(
      "Are you sure you want to finalize this interview?\n\n" +
      "This will: \n• Calculate final scores\n• Mark interview as completed\n• Make results available to candidate\n\n" +
      "This action cannot be undone."
    )) {
      return;
    }
    
    setFinalizing(true);
    
    try {
      console.log("Finalizing interview...", interviewId);
      
      // Call the finalize API
      const result = await finalizeInterview(interviewId);
      
      console.log("Finalize result:", result);
      
      // Check if backend returned success
      if (result.success) {
        alert(`✅ Interview finalized successfully!\n\n` +
              `Final Score: ${result.result?.total_score || 0}/${result.result?.max_score || 0}\n` +
              `Percentage: ${result.result?.percentage || 0}%\n` +
              `Performance Level: ${result.result?.performance_level || 'N/A'}\n\n` +
              `The candidate can now view their results.`);
        
        // Refresh the page to show updated status
        window.location.reload();
      } else {
        alert(`❌ Finalization failed: ${result.message || 'Unknown error'}`);
      }
      
    } catch (err) {
      console.error("Finalize error:", err);
      
      // Show user-friendly error message
      let errorMessage = "Failed to finalize interview. Please try again.";
      
      if (err.message) {
        if (err.message.includes("Interview must be in progress")) {
          errorMessage = "❌ Cannot finalize: Interview must be in 'in_progress' status.";
        } else if (err.message.includes("not authorized") || err.message.includes("permission")) {
          errorMessage = "❌ You are not authorized to finalize this interview.";
        } else if (err.message.includes("not found")) {
          errorMessage = "❌ Interview not found.";
        } else if (err.message.includes("already completed")) {
          errorMessage = "❌ Interview is already completed.";
        } else {
          errorMessage = `❌ ${err.message}`;
        }
      }
      
      alert(errorMessage);
      
    } finally {
      setFinalizing(false);
    }
  };

  const toggleQuestionExpansion = (questionId) => {
    setExpandedQuestion(expandedQuestion === questionId ? null : questionId);
  };

  // Calculate individual question percentage
  const getQuestionPercentage = (score, maxPoints) => {
    if (!maxPoints || maxPoints === 0) return "0";
    const percentage = ((score || 0) / maxPoints * 100);
    return percentage.toFixed(0);
  };

  // Get question type display name
  const getQuestionTypeDisplay = (type) => {
    const typeMap = {
      'MCQ': 'Multiple Choice',
      'DESC': 'Descriptive',
      'DESCRIPTIVE': 'Descriptive',
      'CODE': 'Coding',
    };
    return typeMap[type] || type;
  };

  // Get scoring mode display
  const getScoringModeDisplay = () => {
    const mode = getScoringMode();
    const modeMap = {
      'AUTO_ONLY': 'Auto-scoring Only',
      'AUTO_WITH_OVERRIDE': 'Auto-scoring with HR Override',
      'MANUAL_ONLY': 'Manual HR Scoring',
    };
    return modeMap[mode] || mode;
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-lg text-gray-600">Loading candidate answers...</p>
      </div>
    </div>
  );
  
  if (!answers || answers.length === 0) return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mr-4">
            <span className="text-2xl text-yellow-600">📝</span>
          </div>
          <div>
            <h2 className="text-xl font-bold mb-1">No Answers Submitted</h2>
            <p className="text-gray-600">
              {interviewDetails ? 
                `The candidate (${interviewDetails.candidate_name || interviewDetails.candidate_email}) has not submitted any answers yet.` :
                "No answers available for this interview."
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  // Group answers by category
  const answersByCategory = answers.reduce((acc, answer) => {
    const category = answer.question_category || "Uncategorized";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(answer);
    return acc;
  }, {});

  return (
    <div className="p-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Candidate Evaluation
              {interviewDetails && (
                <span className="ml-3 text-sm font-normal text-gray-600">
                  for {interviewDetails.candidate_name || interviewDetails.candidate_email}
                </span>
              )}
            </h2>
            <p className="text-gray-600 mb-3">
              Review candidate responses and provide scores & feedback.
            </p>
            <div className="flex items-center space-x-4">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                totals.scoringMode === 'AUTO_ONLY' 
                  ? 'bg-green-100 text-green-800' 
                  : totals.scoringMode === 'AUTO_WITH_OVERRIDE'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-purple-100 text-purple-800'
              }`}>
                Mode: {getScoringModeDisplay()}
              </span>
              {interviewDetails && interviewDetails.status && (
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  interviewDetails.status === 'completed' 
                    ? 'bg-green-100 text-green-800' 
                    : interviewDetails.status === 'in_progress'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  Status: {interviewDetails.status.replace('_', ' ').toUpperCase()}
                </span>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Interview ID</p>
            <p className="font-mono text-gray-700 bg-gray-100 px-3 py-1 rounded">
              {interviewId?.substring(0, 8) || 'N/A'}...
            </p>
            {interviewDetails && interviewDetails.title && (
              <p className="text-sm text-gray-600 mt-2">{interviewDetails.title}</p>
            )}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Final Score Card */}
        <div className="bg-white rounded-xl shadow p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Final Score</p>
              <p className="text-2xl font-bold text-gray-900">
                {totals.totalHRScore}
                <span className="text-lg text-gray-500"> / {totals.totalMaxPoints}</span>
              </p>
              <p className={`text-sm font-medium ${
                parseFloat(totals.hrPercentage) >= 80 ? 'text-green-600' :
                parseFloat(totals.hrPercentage) >= 60 ? 'text-blue-600' :
                parseFloat(totals.hrPercentage) >= 40 ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {totals.hrPercentage}%
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl text-green-600">🏆</span>
            </div>
          </div>
        </div>
        
        {/* MCQ Score Card */}
        <div className="bg-white rounded-xl shadow p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">MCQ Score</p>
              <p className="text-2xl font-bold text-gray-900">
                {totals.mcqHRScore}
                <span className="text-sm text-gray-500 ml-1">
                  ({totals.mcqCount} {totals.mcqCount === 1 ? 'question' : 'questions'})
                </span>
              </p>
              <p className="text-sm text-blue-600">
                Auto: {totals.mcqAutoScore}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl text-blue-600">✓</span>
            </div>
          </div>
        </div>
        
        {/* Descriptive Score Card */}
        <div className="bg-white rounded-xl shadow p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Descriptive Score</p>
              <p className="text-2xl font-bold text-gray-900">
                {totals.descriptiveHRScore}
                <span className="text-sm text-gray-500 ml-1">
                  ({totals.descriptiveCount} {totals.descriptiveCount === 1 ? 'question' : 'questions'})
                </span>
              </p>
              <p className={`text-sm ${
                totals.descriptiveCount > 0 ? 'text-purple-600' : 'text-gray-500'
              }`}>
                {totals.descriptiveCount > 0 && isAutoScoringEnabled() 
                  ? 'Auto-scored' 
                  : totals.descriptiveCount > 0 
                  ? 'HR Evaluation Required' 
                  : 'No descriptive questions'}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl text-purple-600">✍️</span>
            </div>
          </div>
        </div>
        
        {/* Scoring Mode Card */}
        <div className="bg-white rounded-xl shadow p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Scoring Mode</p>
              <p className="text-lg font-bold text-gray-900">
                {getScoringModeDisplay()}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {answers.filter(a => a.hr_score !== null).length}/{answers.length} HR scored
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-2xl text-gray-600">
                {isAutoScoringEnabled() ? '🤖' : '👨‍💼'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Questions by Category */}
      {Object.entries(answersByCategory).map(([category, categoryAnswers]) => (
        <div key={category} className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mr-3"></div>
              <h3 className="text-xl font-bold text-gray-800">
                {category}
                <span className="ml-3 text-sm font-normal text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  {categoryAnswers.length} {categoryAnswers.length === 1 ? 'question' : 'questions'}
                </span>
              </h3>
            </div>
          </div>

          <div className="space-y-4">
            {categoryAnswers.map((ans, idx) => (
              <div 
                key={ans.id} 
                className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden"
              >
                {/* Question Header */}
                <div 
                  className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleQuestionExpansion(ans.id)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                            <span className="text-blue-600 font-bold">Q{idx + 1}</span>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 text-lg mb-1">
                              {ans.question_text}
                            </h4>
                            <div className="flex items-center space-x-3">
                              <span className={`px-2 py-1 rounded text-xs font-bold ${
                                ans.question_type === 'MCQ' 
                                  ? 'bg-blue-100 text-blue-800' 
                                  : 'bg-purple-100 text-purple-800'
                              }`}>
                                {getQuestionTypeDisplay(ans.question_type)}
                              </span>
                              <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs font-bold">
                                {ans.question_points || 10} points
                              </span>
                              {ans.needs_review && (
                                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-bold">
                                  Needs Review
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-gray-500 text-sm mb-1">
                            Click to {expandedQuestion === ans.id ? 'collapse' : 'expand'}
                          </div>
                          <span className="text-gray-400 text-lg">
                            {expandedQuestion === ans.id ? '▲' : '▼'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        {/* Auto Score */}
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-xs text-gray-500 mb-1">Auto Score</p>
                          <div className="flex items-center">
                            <span className={`text-xl font-bold ${
                              (ans.auto_score || 0) >= (ans.question_points * 0.8) ? 'text-green-600' :
                              (ans.auto_score || 0) >= (ans.question_points * 0.5) ? 'text-blue-600' :
                              'text-red-600'
                            }`}>
                              {ans.auto_score !== null ? ans.auto_score.toFixed(1) : "N/A"}
                            </span>
                            <span className="text-gray-500 ml-2">/ {ans.question_points || 10}</span>
                            {ans.auto_score !== null && (
                              <span className="ml-2 text-sm text-gray-500">
                                ({getQuestionPercentage(ans.auto_score, ans.question_points)}%)
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* HR Score - Always shown but editable based on mode */}
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <p className="text-xs text-gray-500 mb-1">HR Score</p>
                          <div className="flex items-center">
                            <input
                              type="number"
                              min="0"
                              max={ans.question_points || 10}
                              step="0.5"
                              value={ans.hr_score !== null ? ans.hr_score : ""}
                              onChange={(e) =>
                                handleScoreChange(
                                  answers.findIndex(a => a.id === ans.id),
                                  "hr_score",
                                  e.target.value
                                )
                              }
                              className="w-24 px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                              placeholder="Enter score"
                              disabled={getScoringMode() === "AUTO_ONLY"}
                            />
                            <span className="text-gray-500 ml-2">/ {ans.question_points || 10}</span>
                            {ans.hr_score !== null && (
                              <span className="ml-2 text-sm text-gray-500">
                                ({getQuestionPercentage(ans.hr_score, ans.question_points)}%)
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* Status */}
                        <div className="flex items-center justify-between p-3">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Status</p>
                            <p className={`text-sm font-medium ${
                              ans.hr_score !== null ? 'text-green-600' : 
                              ans.auto_score !== null ? 'text-blue-600' : 
                              'text-yellow-600'
                            }`}>
                              {ans.hr_score !== null ? 'HR Scored' : 
                               ans.auto_score !== null ? 'Auto Scored' : 
                               'Pending'}
                            </p>
                          </div>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleQuestionExpansion(ans.id);
                            }}
                            className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                          >
                            {expandedQuestion === ans.id ? 'Show Less' : 'Review Answer'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedQuestion === ans.id && (
                  <div className="border-t border-gray-200 p-6 bg-gray-50">
                    <div className="mb-6">
                      <div className="flex items-center mb-4">
                        <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                        <h5 className="font-bold text-gray-800">Answer Details</h5>
                      </div>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Candidate's Answer */}
                        <div className="bg-white p-4 rounded-lg border-2 border-blue-200">
                          <div className="flex items-center mb-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                              <span className="text-blue-600 font-bold">C</span>
                            </div>
                            <h6 className="font-bold text-blue-700">Candidate's Answer</h6>
                          </div>
                          <div className="bg-gray-50 p-4 rounded-lg min-h-[200px]">
                            {ans.answer_text ? (
                              <div className="prose prose-sm max-w-none">
                                <p className="text-gray-800 whitespace-pre-wrap">
                                  {ans.answer_text}
                                </p>
                              </div>
                            ) : ans.selected_options?.length > 0 ? (
                              <div className="space-y-2">
                                <p className="font-medium text-gray-700">Selected Options:</p>
                                {ans.selected_options.map((optIdx, i) => (
                                  <div key={i} className="p-2 bg-white border border-gray-300 rounded">
                                    <span className="font-medium">Option {optIdx + 1}</span>
                                    {ans.correct_options?.includes(optIdx) ? (
                                      <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">✓ Correct</span>
                                    ) : (
                                      <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded">✗ Incorrect</span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : ans.code_snippet ? (
                              <div>
                                <p className="font-medium text-gray-700 mb-2">Code Snippet:</p>
                                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-auto text-sm">
                                  {ans.code_snippet}
                                </pre>
                              </div>
                            ) : (
                              <div className="text-center py-8 text-gray-500">
                                <span className="text-3xl mb-2 block">📝</span>
                                No answer provided
                              </div>
                            )}
                          </div>
                        </div>

                        {/* HR Evaluation */}
                        <div className="bg-white p-4 rounded-lg border-2 border-purple-200">
                          <div className="flex items-center mb-3">
                            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-2">
                              <span className="text-purple-600 font-bold">HR</span>
                            </div>
                            <h6 className="font-bold text-purple-700">HR Evaluation</h6>
                          </div>
                          
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Score (0-{ans.question_points || 10})
                              </label>
                              <div className="flex items-center space-x-2">
                                <input
                                  type="number"
                                  min="0"
                                  max={ans.question_points || 10}
                                  step="0.5"
                                  value={ans.hr_score !== null ? ans.hr_score : ""}
                                  onChange={(e) =>
                                    handleScoreChange(
                                      answers.findIndex(a => a.id === ans.id),
                                      "hr_score",
                                      e.target.value
                                    )
                                  }
                                  className="flex-1 px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                  placeholder="Enter score"
                                  disabled={getScoringMode() === "AUTO_ONLY"}
                                />
                                <span className="text-gray-500">/ {ans.question_points || 10}</span>
                              </div>
                              {ans.hr_score !== null && (
                                <p className="text-xs text-gray-500 mt-1">
                                  Percentage: {getQuestionPercentage(ans.hr_score, ans.question_points)}%
                                </p>
                              )}
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Feedback for Candidate
                              </label>
                              <textarea
                                value={ans.hr_feedback || ""}
                                onChange={(e) =>
                                  handleScoreChange(
                                    answers.findIndex(a => a.id === ans.id),
                                    "hr_feedback",
                                    e.target.value
                                  )
                                }
                                className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                placeholder="Provide constructive feedback..."
                                rows="4"
                              />
                            </div>
                            
                            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                              <p className="text-sm font-medium text-yellow-800 mb-1">Scoring Guidelines:</p>
                              <ul className="text-xs text-yellow-700 space-y-1">
                                <li>• <strong>9-10 points:</strong> Excellent - comprehensive and accurate</li>
                                <li>• <strong>7-8 points:</strong> Good - mostly correct with minor issues</li>
                                <li>• <strong>5-6 points:</strong> Average - partially correct</li>
                                <li>• <strong>3-4 points:</strong> Needs improvement - basic understanding</li>
                                <li>• <strong>0-2 points:</strong> Poor - incorrect or irrelevant</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Action Panel */}
      <div className="mt-10 bg-gradient-to-r from-gray-50 to-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row justify-between items-center space-y-6 lg:space-y-0">
          <div>
            <h4 className="text-xl font-bold text-gray-900 mb-2">
              Ready to Finalize Interview
            </h4>
            <div className="space-y-2">
              <p className="text-gray-600">
                <span className="font-medium">Final Score:</span>{' '}
                <span className="text-2xl font-bold text-green-600">
                  {totals.totalHRScore}/{totals.totalMaxPoints}
                </span>{' '}
                ({totals.hrPercentage}%)
              </p>
              <div className="flex items-center space-x-4">
                {totals.mcqCount > 0 && (
                  <span className="text-sm text-gray-500">
                    MCQ: {totals.mcqHRScore} ({totals.mcqCount})
                  </span>
                )}
                {totals.descriptiveCount > 0 && (
                  <span className="text-sm text-gray-500">
                    Descriptive: {totals.descriptiveHRScore} ({totals.descriptiveCount})
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
            {/* Save button - always enabled except in auto-only mode */}
            {getScoringMode() !== "AUTO_ONLY" && (
              <button
                onClick={handleSave}
                disabled={saving}
                className={`px-8 py-3 rounded-xl font-bold transition-all ${
                  saving 
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md'
                }`}
              >
                {saving ? (
                  <>
                    <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2 inline-block"></span>
                    Saving...
                  </>
                ) : (
                  'Save All Changes'
                )}
              </button>
            )}
            
            {/* Finalize button - always enabled */}
            <button
              onClick={handleFinalize}
              disabled={finalizing || (interviewDetails?.status === 'completed')}
              className={`px-8 py-3 rounded-xl font-bold transition-all ${
                finalizing || interviewDetails?.status === 'completed'
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg'
              }`}
            >
              {finalizing ? (
                <>
                  <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2 inline-block"></span>
                  Finalizing...
                </>
              ) : interviewDetails?.status === 'completed' ? (
                'Already Finalized'
              ) : (
                <>
                  <span className="mr-2">✅</span>
                  Finalize Interview
                </>
              )}
            </button>
          </div>
        </div>
        
        {/* Progress Check */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-2 ${
                  answers.every(a => a.hr_score !== null) 
                    ? 'bg-green-500' 
                    : answers.some(a => a.hr_score !== null)
                    ? 'bg-yellow-500' 
                    : 'bg-gray-400'
                }`}></div>
                <span className="text-sm text-gray-700">
                  {answers.filter(a => a.hr_score !== null).length}/{answers.length} questions HR scored
                </span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-700">
                  {answers.filter(a => a.hr_feedback && a.hr_feedback.trim() !== "").length}/{answers.length} with feedback
                </span>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-xs text-gray-500">Status</p>
              <p className="font-medium text-gray-700">
                {interviewDetails?.status === 'completed' 
                  ? '✅ Interview Completed' 
                  : answers.every(a => a.hr_score !== null)
                  ? 'Ready to finalize' 
                  : 'Pending HR evaluation'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HRReviewAnswers;