import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { 
  getInterviewQuestions, 
  assignQuestionsToInterview,
  fetchAllQuestions 
} from "../services/interviewApi";

function AddInterviewQuestions() {
  const { interviewId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const [interview, setInterview] = useState(null);
  const [availableQuestions, setAvailableQuestions] = useState([]);
  const [assignedQuestions, setAssignedQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  
  // Filters
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [questionTypeFilter, setQuestionTypeFilter] = useState("all");

  useEffect(() => {
    fetchInterviewData();
  }, [interviewId]);

  const fetchInterviewData = async () => {
    try {
      setLoading(true);
      setError("");
      
      // Fetch interview details and assigned questions
      const interviewData = await getInterviewQuestions(interviewId);
      
      if (interviewData.interview) {
        setInterview(interviewData.interview);
      }
      
      if (interviewData.assigned_questions) {
        setAssignedQuestions(interviewData.assigned_questions);
        // Pre-select already assigned questions
        const assignedIds = interviewData.assigned_questions.map(q => q.question?.id || q.id);
        setSelectedQuestions(assignedIds);
      }
      
      if (interviewData.available_questions) {
        setAvailableQuestions(interviewData.available_questions);
      } else {
        // Fallback: fetch all questions
        const allQuestions = await fetchAllQuestions();
        setAvailableQuestions(allQuestions);
      }
      
    } catch (err) {
      console.error("Error fetching interview data:", err);
      setError("Failed to load interview data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionSelect = (questionId) => {
    setSelectedQuestions(prev => {
      if (prev.includes(questionId)) {
        return prev.filter(id => id !== questionId);
      } else {
        return [...prev, questionId];
      }
    });
  };

  const handleSelectAll = (questionIds) => {
    setSelectedQuestions(prev => {
      const allSelected = questionIds.every(id => prev.includes(id));
      if (allSelected) {
        // Deselect all
        return prev.filter(id => !questionIds.includes(id));
      } else {
        // Select all
        const newSelected = [...prev];
        questionIds.forEach(id => {
          if (!newSelected.includes(id)) {
            newSelected.push(id);
          }
        });
        return newSelected;
      }
    });
  };

  const handleAssignQuestions = async () => {
    if (selectedQuestions.length === 0) {
      toast.error("Please select at least one question to assign.");
      return;
    }

    setSubmitting(true);
    setSuccess("");
    setError("");

    try {
      await assignQuestionsToInterview(interviewId, selectedQuestions);
      setSuccess(`${selectedQuestions.length} questions assigned successfully!`);
      
      // Refresh data
      fetchInterviewData();
      
      // Optional: redirect after delay
      setTimeout(() => {
        navigate(`/hr/interview/${interviewId}/manage`);
      }, 2000);
      
    } catch (err) {
      console.error("Error assigning questions:", err);
      setError("Failed to assign questions. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuestionPreview = (question) => {
    // Store question in localStorage for preview page
    localStorage.setItem('question_preview', JSON.stringify(question));
    navigate(`/hr/question/${question.id}/preview`);
  };

  // Filter available questions
  const filteredQuestions = availableQuestions.filter(question => {
    // Search filter
    if (searchTerm && !question.question_text?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Category filter
    if (categoryFilter !== "all" && question.category?.id !== categoryFilter) {
      return false;
    }
    
    // Difficulty filter
    if (difficultyFilter !== "all" && question.difficulty !== difficultyFilter) {
      return false;
    }
    
    // Question type filter
    if (questionTypeFilter !== "all" && question.question_type?.code !== questionTypeFilter) {
      return false;
    }
    
    return true;
  });

  // Get unique categories from available questions
  const categories = [...new Set(
    availableQuestions
      .map(q => q.category)
      .filter(cat => cat)
      .map(cat => ({ id: cat.id, name: cat.name }))
  )];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="text-blue-600 hover:text-blue-800 mb-4 flex items-center gap-2"
          >
            ← Back to Interviews
          </button>
          
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Add Questions to Interview
              </h1>
              <p className="text-gray-600 mt-2">
                Interview: <span className="font-semibold">{interview?.title || "Interview"}</span>
              </p>
              {interview?.categories && interview.categories.length > 0 && (
                <div className="mt-2 flex gap-2">
                  <span className="text-sm text-gray-500">Categories:</span>
                  <div className="flex flex-wrap gap-1">
                    {interview.categories.map((cat, idx) => (
                      <span key={idx} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="text-right">
              <div className="text-lg font-semibold text-gray-800">
                {selectedQuestions.length} questions selected
              </div>
              <div className="text-sm text-gray-500">
                Total available: {availableQuestions.length}
              </div>
            </div>
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-6">
            {success}
          </div>
        )}

        {/* Assigned Questions Section */}
        {assignedQuestions.length > 0 && (
          <div className="bg-white border rounded-xl p-5 mb-8 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Currently Assigned Questions ({assignedQuestions.length})
            </h2>
            <div className="space-y-3">
              {assignedQuestions.map((qSet, index) => {
                const question = qSet.question_details || qSet.question;
                return (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-800 rounded-full">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">
                            {question?.question_text || "Question"}
                          </p>
                          <div className="flex gap-2 mt-1">
                            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                              {question?.difficulty || "Medium"}
                            </span>
                            {question?.category_name && (
                              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                                {question.category_name}
                              </span>
                            )}
                            <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded">
                              {question?.question_type?.name || "Question"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleQuestionPreview(question)}
                      className="text-blue-600 hover:text-blue-800 text-sm px-3 py-1 border border-blue-200 rounded hover:bg-blue-50"
                    >
                      Preview
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Column - Filters */}
          <div className="lg:col-span-1">
            <div className="bg-white border rounded-xl p-5 shadow-sm sticky top-6">
              <h3 className="font-semibold text-gray-800 mb-4">Filters</h3>
              
              {/* Search */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Search Questions</label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Type question text..."
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Category Filter */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Difficulty Filter */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Difficulty</label>
                <select
                  value={difficultyFilter}
                  onChange={(e) => setDifficultyFilter(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Difficulties</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                  <option value="expert">Expert</option>
                </select>
              </div>

              {/* Question Type Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-1">Question Type</label>
                <select
                  value={questionTypeFilter}
                  onChange={(e) => setQuestionTypeFilter(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Types</option>
                  <option value="MCQ">Multiple Choice</option>
                  <option value="DESC">Descriptive</option>
                  <option value="CODE">Coding</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => {
                    const allIds = filteredQuestions.map(q => q.id);
                    handleSelectAll(allIds);
                  }}
                  className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition"
                >
                  Select/Unselect All Filtered
                </button>
                
                <button
                  onClick={handleAssignQuestions}
                  disabled={submitting || selectedQuestions.length === 0}
                  className={`w-full py-2 px-4 rounded-md transition ${
                    submitting || selectedQuestions.length === 0
                      ? "bg-blue-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                >
                  {submitting ? "Assigning..." : `Assign ${selectedQuestions.length} Questions`}
                </button>
              </div>

              {/* Selected Count */}
              <div className="mt-6 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800 font-medium">
                  📋 {selectedQuestions.length} questions selected
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Click on questions to select/deselect them
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Questions List */}
          <div className="lg:col-span-3">
            <div className="bg-white border rounded-xl p-5 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-800">
                  Available Questions ({filteredQuestions.length})
                </h3>
                <div className="text-sm text-gray-500">
                  Showing {filteredQuestions.length} of {availableQuestions.length}
                </div>
              </div>

              {filteredQuestions.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">📝</div>
                  <p className="text-gray-600">No questions found matching your filters.</p>
                  <button
                    onClick={() => {
                      setCategoryFilter("all");
                      setDifficultyFilter("all");
                      setSearchTerm("");
                      setQuestionTypeFilter("all");
                    }}
                    className="mt-3 text-blue-600 hover:text-blue-800"
                  >
                    Clear all filters
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredQuestions.map((question) => {
                    const isSelected = selectedQuestions.includes(question.id);
                    const isAssigned = assignedQuestions.some(
                      q => q.question?.id === question.id || q.question_details?.id === question.id
                    );

                    return (
                      <div
                        key={question.id}
                        className={`p-4 border rounded-lg transition-all cursor-pointer hover:shadow-md ${
                          isSelected
                            ? "border-blue-500 bg-blue-50"
                            : isAssigned
                            ? "border-green-300 bg-green-50"
                            : "border-gray-200"
                        }`}
                        onClick={() => handleQuestionSelect(question.id)}
                      >
                        <div className="flex items-start gap-4">
                          {/* Checkbox */}
                          <div className="flex items-center mt-1">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}}
                              className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                            />
                          </div>

                          {/* Question Content */}
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium text-gray-800">
                                  {question.question_text}
                                </p>
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {/* Category Badge */}
                                  {question.category_name && (
                                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                                      {question.category_name}
                                    </span>
                                  )}
                                  
                                  {/* Difficulty Badge */}
                                  <span className={`text-xs px-2 py-1 rounded ${
                                    question.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                                    question.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                    question.difficulty === 'hard' ? 'bg-orange-100 text-orange-800' :
                                    'bg-red-100 text-red-800'
                                  }`}>
                                    {question.difficulty || 'Medium'}
                                  </span>
                                  
                                  {/* Type Badge */}
                                  <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded">
                                    {question.question_type?.name || "Question"}
                                  </span>
                                  
                                  {/* Points */}
                                  <span className="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded">
                                    {question.points || 10} points
                                  </span>
                                </div>
                              </div>
                              
                              {/* Action Buttons */}
                              <div className="flex gap-2">
                                {isAssigned && (
                                  <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                                    Already Assigned
                                  </span>
                                )}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleQuestionPreview(question);
                                  }}
                                  className="text-blue-600 hover:text-blue-800 text-sm px-3 py-1 border border-blue-200 rounded hover:bg-blue-50"
                                >
                                  Preview
                                </button>
                              </div>
                            </div>
                            
                            {/* MCQ Options */}
                            {question.question_type?.code === 'MCQ' && question.options && (
                              <div className="mt-3 pl-6 border-l-2 border-gray-200">
                                <p className="text-sm text-gray-600 mb-2">Options:</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                  {question.options.map((option, idx) => (
                                    <div key={idx} className="text-sm text-gray-700">
                                      {typeof option === 'object' ? option.text : option}
                                      {question.correct_option_indices?.includes(idx) && (
                                        <span className="ml-2 text-xs text-green-600">✓ Correct</span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {/* Time Limit */}
                            <div className="mt-3 text-xs text-gray-500">
                              ⏱️ Time limit: {question.time_limit_minutes || 5} minutes
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            
            {/* Bottom Action Bar */}
            <div className="mt-6 bg-white border rounded-xl p-5 shadow-sm">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-semibold text-gray-800">Ready to assign questions?</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Selected questions will be added to the interview in the order they appear above.
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => navigate(-1)}
                    className="bg-gray-200 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-300 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAssignQuestions}
                    disabled={submitting || selectedQuestions.length === 0}
                    className={`px-6 py-2 rounded-md transition ${
                      submitting || selectedQuestions.length === 0
                        ? "bg-blue-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                    }`}
                  >
                    {submitting ? (
                      <span className="flex items-center gap-2">
                        <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                        Assigning...
                      </span>
                    ) : (
                      `Assign ${selectedQuestions.length} Questions`
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddInterviewQuestions;
