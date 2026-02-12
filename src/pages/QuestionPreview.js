
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

function QuestionPreview() {
  const { questionId } = useParams();
  const navigate = useNavigate();
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try to get from localStorage first
    const stored = localStorage.getItem('question_preview');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setQuestion(parsed);
        setLoading(false);
      } catch (err) {
        console.error("Error parsing stored question:", err);
        setLoading(false);
      }
    } else {
      // If not in localStorage, you could fetch from API
      setLoading(false);
    }
  }, [questionId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No question data found.</p>
          <button
            onClick={() => navigate(-1)}
            className="text-blue-600 hover:text-blue-800"
          >
            ← Go back
          </button>
        </div>
      </div>
    );
  }

  const isMCQ = question.question_type?.code === 'MCQ';
  const correctOptions = question.correct_option_indices || [];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="text-blue-600 hover:text-blue-800 mb-6 flex items-center gap-2"
          >
            ← Back to Questions
          </button>
          
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Question Preview
              </h1>
              <p className="text-gray-600 mt-2">
                Preview question details before assigning to interview
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => navigate(`/hr/question/${question.id}/edit`)}
                className="text-green-600 hover:text-green-800 px-4 py-2 border border-green-200 rounded hover:bg-green-50"
              >
                Edit Question
              </button>
              <button
                onClick={() => navigate(-1)}
                className="text-gray-600 hover:text-gray-800 px-4 py-2 border border-gray-200 rounded hover:bg-gray-50"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white border rounded-xl p-6 shadow-sm mb-8">
          {/* Basic Info */}
          <div className="flex flex-wrap gap-3 mb-6">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              question.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
              question.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
              question.difficulty === 'hard' ? 'bg-orange-100 text-orange-800' :
              'bg-red-100 text-red-800'
            }`}>
              {question.difficulty || 'Medium'} Difficulty
            </span>
            
            {question.category_name && (
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {question.category_name}
              </span>
            )}
            
            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
              {question.question_type?.name || "Question Type"}
            </span>
            
            <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
              {question.points || 10} Points
            </span>
            
            <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium">
              ⏱️ {question.time_limit_minutes || 5} minutes
            </span>
          </div>

          {/* Question Text */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Question</h3>
            <div className="prose max-w-none">
              <p className="text-gray-800 text-lg bg-gray-50 p-4 rounded-lg">
                {question.question_text}
              </p>
            </div>
          </div>

          {/* MCQ Options */}
          {isMCQ && question.options && question.options.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-700 mb-3">Multiple Choice Options</h3>
              <div className="space-y-3">
                {question.options.map((option, index) => {
                  const isCorrect = correctOptions.includes(index);
                  const optionText = typeof option === 'object' ? option.text : option;
                  
                  return (
                    <div
                      key={index}
                      className={`p-4 border rounded-lg flex items-start gap-3 ${
                        isCorrect
                          ? 'border-green-300 bg-green-50'
                          : 'border-gray-200'
                      }`}
                    >
                      <div className={`w-8 h-8 flex items-center justify-center rounded-full ${
                        isCorrect
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {String.fromCharCode(65 + index)} {/* A, B, C, D */}
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-800">{optionText}</p>
                        {isCorrect && (
                          <p className="text-sm text-green-600 mt-1 font-medium">
                            ✓ Correct Answer
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* HR Answer (For descriptive questions) */}
          {!isMCQ && question.hr_answer && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-700 mb-3">Expected Answer</h3>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-gray-800">{question.hr_answer}</p>
                {question.hr_answer_notes && (
                  <div className="mt-3 pt-3 border-t border-yellow-300">
                    <p className="text-sm font-medium text-gray-700 mb-2">Grading Notes:</p>
                    <p className="text-gray-600 text-sm">{question.hr_answer_notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tags */}
          {question.tags && question.tags.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-700 mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {question.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Question Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Created By</p>
                <p className="font-medium text-gray-800">
                  {question.created_by?.name || "HR User"}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Created At</p>
                <p className="font-medium text-gray-800">
                  {question.created_at ? new Date(question.created_at).toLocaleDateString() : "N/A"}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className="font-medium">
                  <span className={`px-2 py-1 rounded text-xs ${
                    question.is_active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {question.is_active ? 'Active' : 'Inactive'}
                  </span>
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Question ID</p>
                <p className="font-medium text-gray-800 text-sm">
                  {question.id}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
          >
            ← Back to Questions
          </button>
          
          <div className="flex gap-3">
            <button
              onClick={() => {
                // You would implement question editing here
                navigate(`/hr/question/${question.id}/edit`);
              }}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              Edit Question
            </button>
            <button
              onClick={() => {
                // Copy question ID or other functionality
                navigator.clipboard.writeText(question.id);
                alert("Question ID copied to clipboard!");
              }}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Copy Question ID
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuestionPreview;