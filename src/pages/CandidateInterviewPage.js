import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getInterviewQuestions,
  submitAllAnswers,
  getInterviewResult
} from "../services/interviewApi";

function CandidateInterviewPage() {
  const { interviewId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [interview, setInterview] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [interviewCompleted, setInterviewCompleted] = useState(false);

  useEffect(() => {
    fetchInterviewData();
  }, [interviewId]);

  const fetchInterviewData = async () => {
    try {
      setLoading(true);
      
      // Check interview status first
      const interviewData = await getInterviewQuestions(interviewId);
      
      if (!interviewData.interview) {
        setError("Interview not found");
        return;
      }
      
      setInterview(interviewData.interview);
      
      // Check if interview is completed
      if (interviewData.interview.status === 'completed') {
        setInterviewCompleted(true);
        // Show results
        const result = await getInterviewResult(interviewId);
        setQuestions(result.questions || []);
        setAnswers(result.answers || {});
        return;
      }
      
      // Check if interview is submitted (waiting for review)
      if (interviewData.interview.status === 'submitted') {
        setError("Interview already submitted. Waiting for HR review.");
        return;
      }
      
      // Check if interview is scheduled
      if (interviewData.interview.status === 'scheduled') {
        // Check if it's time to start
        const scheduledTime = new Date(interviewData.interview.scheduled_date);
        const now = new Date();
        
        if (now < scheduledTime) {
          setError(`Interview starts at ${scheduledTime.toLocaleString()}`);
          return;
        }
        
        // It's time to start, but interview hasn't been started yet
        if (!interviewStarted) {
          // Show start button
          setQuestions(interviewData.assigned_questions || []);
          return;
        }
      }
      
      // If interview is in progress or started
      if (interviewData.interview.status === 'in_progress' || interviewStarted) {
        setInterviewStarted(true);
        setQuestions(interviewData.assigned_questions || []);
        
        // Calculate total time
        const totalTime = interviewData.interview.duration_minutes * 60;
        setTimeRemaining(totalTime);
      }
      
    } catch (err) {
      console.error("Error fetching interview:", err);
      setError("Failed to load interview. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const startInterview = () => {
    setInterviewStarted(true);
    // Start timer
    const totalTime = interview.duration_minutes * 60;
    setTimeRemaining(totalTime);
    
    // Start countdown
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleAutoSubmit = async () => {
    if (Object.keys(answers).length === 0) {
      toast.error("Time's up! No answers submitted.");
      return;
    }
    
    await submitAnswers();
  };

  const submitAnswers = async () => {
    if (!window.confirm("Are you sure you want to submit your answers? You cannot change them after submission.")) {
      return;
    }

    setSubmitting(true);
    try {
      // Prepare answers in correct format for API
      const formattedAnswers = questions.map(q => ({
        question_id: q.question?.id || q.id,
        answer_text: answers[q.question?.id || q.id] || "",
        selected_options: q.question_type?.code === 'MCQ' ? [] : undefined
      }));

      await submitAllAnswers(interviewId, formattedAnswers);
      toast.success("Answers submitted successfully! HR will review them.");
      navigate(`/interview/${interviewId}/result`);
      
    } catch (err) {
      console.error("Error submitting answers:", err);
      setError("Failed to submit answers. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-md max-w-md text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Interview Access Issue</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate("/interviews/upcoming")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Back to My Interviews
          </button>
        </div>
      </div>
    );
  }

  if (interviewCompleted) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Interview Completed</h1>
            <p className="text-gray-600 mb-6">Your interview has been completed and reviewed by HR.</p>
            <button
              onClick={() => navigate(`/interview/${interviewId}/result`)}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
            >
              View Results
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!interviewStarted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-md max-w-md w-full">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{interview?.title}</h1>
          
          <div className="space-y-4 mb-8">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Duration:</strong> {interview?.duration_minutes || 60} minutes
              </p>
              <p className="text-sm text-blue-800">
                <strong>Questions:</strong> {questions.length} questions
              </p>
            </div>
            
            <div className="p-4 bg-yellow-50 rounded-lg">
              <h3 className="font-medium text-yellow-800 mb-2">Instructions:</h3>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Answer all questions within the time limit</li>
                <li>• You cannot pause or restart the interview</li>
                <li>• Submit your answers before time runs out</li>
                <li>• No external help is allowed</li>
              </ul>
            </div>
          </div>
          
          <button
            onClick={startInterview}
            className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition text-lg font-medium"
          >
            Start Interview
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header with Timer */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{interview?.title}</h1>
              <p className="text-gray-600">Answer all questions before time runs out</p>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${
                timeRemaining < 300 ? 'text-red-600' : 'text-blue-600'
              }`}>
                {formatTime(timeRemaining)}
              </div>
              <div className="text-sm text-gray-500">Time Remaining</div>
            </div>
          </div>
        </div>

        {/* Questions List */}
        <div className="space-y-6">
          {questions.map((qSet, index) => {
            const question = qSet.question_details || qSet.question || qSet;
            const questionId = question.id;
            const answer = answers[questionId] || "";
            
            return (
              <div key={index} className="bg-white border rounded-xl p-6 shadow-sm">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        Question {index + 1}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        question.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                        question.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {question.difficulty || 'Medium'}
                      </span>
                      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded">
                        {question.points || 10} points
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {question.question_text}
                    </h3>
                  </div>
                  <div className="text-sm text-gray-500">
                    ⏱️ {question.time_limit_minutes || 5} min
                  </div>
                </div>

                {/* MCQ Options */}
                {question.question_type?.code === 'MCQ' && question.options && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-3">Select the correct option(s):</p>
                    <div className="space-y-2">
                      {question.options.map((option, idx) => {
                        const optionText = typeof option === 'object' ? option.text : option;
                        const optionKey = `${questionId}_${idx}`;
                        
                        return (
                          <div key={idx} className="flex items-center">
                            <input
                              type="checkbox"
                              id={optionKey}
                              checked={answer.includes(idx.toString())}
                              onChange={(e) => {
                                const currentAnswers = answer.split(',').filter(a => a !== '');
                                if (e.target.checked) {
                                  currentAnswers.push(idx.toString());
                                } else {
                                  const index = currentAnswers.indexOf(idx.toString());
                                  if (index > -1) currentAnswers.splice(index, 1);
                                }
                                handleAnswerChange(questionId, currentAnswers.join(','));
                              }}
                              className="h-4 w-4 text-blue-600"
                            />
                            <label htmlFor={optionKey} className="ml-3 text-gray-700">
                              {optionText}
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Descriptive Answer */}
                {(!question.question_type || question.question_type.code !== 'MCQ') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Answer:
                    </label>
                    <textarea
                      value={answer}
                      onChange={(e) => handleAnswerChange(questionId, e.target.value)}
                      rows={6}
                      className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Type your answer here..."
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      Be as detailed as possible. This answer will be reviewed by HR.
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Submit Button */}
        <div className="mt-8 bg-white border rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-gray-800">Ready to submit?</h3>
              <p className="text-sm text-gray-600">
                {Object.keys(answers).length} of {questions.length} questions answered
              </p>
            </div>
            <button
              onClick={submitAnswers}
              disabled={submitting}
              className={`px-8 py-3 rounded-lg transition ${
                submitting
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              {submitting ? "Submitting..." : "Submit Interview"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CandidateInterviewPage;
