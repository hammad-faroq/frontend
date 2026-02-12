import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

function ManageInterviewQuestions() {
  const { interviewId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [interview, setInterview] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [selectedTab, setSelectedTab] = useState("assigned");

  useEffect(() => {
    fetchInterviewQuestions();
  }, [interviewId]);

  const fetchInterviewQuestions = async () => {
    try {
      setLoading(true);
      // This would be your API call
      // const data = await getInterviewQuestions(interviewId);
      // setInterview(data.interview);
      // setQuestions(data.questions);
      
      // Mock data for now
      setTimeout(() => {
        setInterview({
          id: interviewId,
          title: "Technical Interview for Data Scientist",
          status: "scheduled",
          candidate: { name: "John Doe", email: "john@example.com" },
          scheduled_date: "2024-01-15T10:00:00Z"
        });
        
        setQuestions([
          { id: 1, text: "Explain the difference between supervised and unsupervised learning.", type: "descriptive", difficulty: "medium" },
          { id: 2, text: "What is gradient descent?", type: "descriptive", difficulty: "hard" },
          { id: 3, text: "Which HTTP methods are idempotent?", type: "mcq", difficulty: "easy" }
        ]);
        
        setLoading(false);
      }, 1000);
      
    } catch (err) {
      console.error("Error fetching questions:", err);
      setLoading(false);
    }
  };

  const handleReorderQuestions = (newOrder) => {
    // Implement question reordering logic
    console.log("New order:", newOrder);
    setQuestions(newOrder);
  };

  const handleRemoveQuestion = (questionId) => {
    if (window.confirm("Are you sure you want to remove this question from the interview?")) {
      // Implement API call to remove question
      setQuestions(questions.filter(q => q.id !== questionId));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="text-blue-600 hover:text-blue-800 mb-4 flex items-center gap-2"
          >
            ← Back to Dashboard
          </button>
          
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Manage Interview Questions
              </h1>
              <p className="text-gray-600 mt-2">
                Interview: <span className="font-semibold">{interview?.title}</span>
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Candidate: {interview?.candidate?.name} ({interview?.candidate?.email})
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => navigate(`/hr/interview/${interviewId}/add-questions`)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
              >
                <span>➕</span>
                Add More Questions
              </button>
              <button
                onClick={() => navigate(`/interview/${interviewId}/preview`)}
                className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition"
              >
                Preview Interview
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              <button
                onClick={() => setSelectedTab("assigned")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === "assigned"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Assigned Questions ({questions.length})
              </button>
              <button
                onClick={() => setSelectedTab("settings")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === "settings"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Interview Settings
              </button>
              <button
                onClick={() => setSelectedTab("preview")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === "preview"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Candidate Preview
              </button>
            </nav>
          </div>
        </div>

        {/* Assigned Questions Tab */}
        {selectedTab === "assigned" && (
          <div className="bg-white border rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                Questions Assigned to This Interview
              </h2>
              <div className="text-sm text-gray-500">
                Drag to reorder • Click to edit
              </div>
            </div>

            {questions.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-4xl mb-4">📝</div>
                <p className="text-gray-600 mb-4">No questions assigned yet.</p>
                <button
                  onClick={() => navigate(`/hr/interview/${interviewId}/add-questions`)}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Add Questions
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {questions.map((question, index) => (
                  <div
                    key={question.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        {/* Order Handle */}
                        <div className="flex flex-col items-center mt-1">
                          <div className="w-8 h-8 flex items-center justify-center bg-gray-100 text-gray-600 rounded-full">
                            {index + 1}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">Drag</div>
                        </div>

                        {/* Question Content */}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className={`text-xs px-2 py-1 rounded ${
                              question.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                              question.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {question.difficulty}
                            </span>
                            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded">
                              {question.type}
                            </span>
                            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                              10 points
                            </span>
                          </div>
                          
                          <p className="text-gray-800 font-medium mb-2">
                            {question.text}
                          </p>
                          
                          <div className="text-sm text-gray-500">
                            Time limit: 5 minutes
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => {
                            // Navigate to question edit or preview
                            navigate(`/hr/question/${question.id}/preview`);
                          }}
                          className="text-blue-600 hover:text-blue-800 px-3 py-1 border border-blue-200 rounded hover:bg-blue-50"
                        >
                          Preview
                        </button>
                        <button
                          onClick={() => handleRemoveQuestion(question.id)}
                          className="text-red-600 hover:text-red-800 px-3 py-1 border border-red-200 rounded hover:bg-red-50"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Footer Actions */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  Total estimated time: {questions.length * 5} minutes
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => navigate(-1)}
                    className="bg-gray-200 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-300 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => alert("Questions saved successfully!")}
                    className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {selectedTab === "settings" && (
          <div className="bg-white border rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              Interview Settings
            </h2>
            {/* Settings form would go here */}
            <p className="text-gray-600">Interview settings configuration will be here.</p>
          </div>
        )}

        {/* Preview Tab */}
        {selectedTab === "preview" && (
          <div className="bg-white border rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              Candidate's View Preview
            </h2>
            {/* Candidate preview would go here */}
            <p className="text-gray-600">Preview of how candidates will see the interview.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ManageInterviewQuestions;
