import React, { useState, useEffect } from "react";
import { reviewCandidateAnswers, finalizeInterview } from "../services/interviewApi";
import toast from "react-hot-toast";

function ReviewModal({ interviewId, onClose, onFinalize }) {
  const [candidateAnswers, setCandidateAnswers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnswers = async () => {
      try {
        const answers = await reviewCandidateAnswers(interviewId);
        setCandidateAnswers(Array.isArray(answers) ? answers : []);
      } catch (err) {
        console.error("Review interview error:", err);
        toast.error("Failed to load candidate answers.");
      } finally {
        setLoading(false);
      }
    };

    fetchAnswers();
  }, [interviewId]);

  const handleFinalize = async () => {
    if (!window.confirm("Are you sure you want to finalize this interview? This cannot be undone.")) {
      return;
    }

    try {
      await finalizeInterview(interviewId);
      toast.success("Interview finalized successfully!");
      onFinalize();
    } catch (err) {
      console.error("Finalize interview error:", err);
      toast.error("Failed to finalize interview.");
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl p-6">
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6 border-b pb-2">
            <h3 className="text-2xl font-semibold text-gray-800">
              Candidate Answers Review
            </h3>
            <button
              onClick={handleFinalize}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
            >
              Finalize Interview
            </button>
          </div>

          {candidateAnswers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No answers submitted yet.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {candidateAnswers.map((answer, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-gray-800">
                      Question {index + 1}
                    </h4>
                    <span className="text-sm px-2 py-1 rounded bg-blue-100 text-blue-800">
                      Score: {answer.score || 'Not scored'}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-3">{answer.question_text}</p>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-gray-800">{answer.answer_text}</p>
                  </div>
                  {answer.feedback && (
                    <div className="mt-3 p-3 bg-yellow-50 border-l-4 border-yellow-400">
                      <p className="text-gray-700">
                        <strong>Feedback:</strong> {answer.feedback}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
            <button
              onClick={onClose}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReviewModal;
