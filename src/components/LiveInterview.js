// src/components/LiveInterview.js
import React, { useState, useEffect, useRef } from 'react';
import { interviewApi } from '../services/interviewApi';
import { useParams, useNavigate } from 'react-router-dom';

function LiveInterview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [interview, setInterview] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [recording, setRecording] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [interviewCompleted, setInterviewCompleted] = useState(false);
  const [progress, setProgress] = useState({ answered: 0, total: 0 });
  
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    fetchInterviewData();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [id]);

  const fetchInterviewData = async () => {
    try {
      const [interviewData, questionsData] = await Promise.all([
        interviewApi.getInterview(id),
        interviewApi.getInterviewQuestions(id)
      ]);
      
      setInterview(interviewData);
      setQuestions(Array.isArray(questionsData) ? questionsData : []);
      setProgress({
        answered: 0,
        total: Array.isArray(questionsData) ? questionsData.length : 0
      });
      
      // If interview is not in progress, redirect
      if (interviewData.status !== 'in_progress') {
        if (interviewData.status === 'completed') {
          navigate(`/interview/${id}/feedback`);
        } else if (interviewData.status === 'scheduled') {
          // Auto-start if scheduled
          try {
            await interviewApi.startInterview(id);
            fetchInterviewData(); // Refresh data
          } catch (err) {
            alert('Failed to start interview: ' + err.message);
            navigate('/interviews');
          }
        } else {
          navigate('/interviews');
        }
      }
    } catch (err) {
      console.error('Error fetching interview data:', err);
      alert('Failed to load interview. Please try again.');
      navigate('/interviews');
    }
  };

  const startTimer = (seconds) => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    setTimeLeft(seconds);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleTimeUp = () => {
    alert('Time is up! Moving to next question.');
    handleNextQuestion();
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      mediaRecorderRef.current = new MediaRecorder(stream);
      const chunks = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        chunks.push(e.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        // In production, you would upload this blob to your server
        console.log('Video recorded:', blob);
        alert('Video recorded successfully! Submit your answer.');
      };

      mediaRecorderRef.current.start();
      setRecording(true);
    } catch (err) {
      console.error('Error accessing media devices:', err);
      alert('Could not access camera/microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      
      // Stop all tracks
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    }
  };

  const handleSubmitAnswer = async () => {
    if (!answer.trim() && !recording) {
      alert('Please provide an answer or record a video response.');
      return;
    }

    setSubmitting(true);
    try {
      const currentQuestion = questions[currentQuestionIndex];
      
      const responseData = {
        question_id: currentQuestion.id,
        answer_text: answer,
        response_time: currentQuestion.time_limit_seconds - timeLeft
        // video_url would be added here after uploading the video
      };

      const result = await interviewApi.submitResponse(id, responseData);
      
      // Update progress
      const newProgress = {
        answered: progress.answered + 1,
        total: progress.total
      };
      setProgress(newProgress);

      // Check if all questions answered
      if (newProgress.answered >= newProgress.total) {
        await handleCompleteInterview();
      } else {
        // Move to next question
        handleNextQuestion();
      }
    } catch (err) {
      console.error('Error submitting answer:', err);
      alert('Failed to submit answer. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setAnswer('');
      stopRecording();
      
      // Start timer for next question
      const nextQuestion = questions[currentQuestionIndex + 1];
      startTimer(nextQuestion.time_limit_seconds);
    }
  };

  const handleCompleteInterview = async () => {
    try {
      await interviewApi.completeInterview(id);
      setInterviewCompleted(true);
      alert('Interview completed successfully!');
      
      // Redirect to feedback after 2 seconds
      setTimeout(() => {
        navigate(`/interview/${id}/feedback`);
      }, 2000);
    } catch (err) {
      console.error('Error completing interview:', err);
      alert('Failed to complete interview. Please try again.');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!interview || !questions.length) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Live Interview</h2>
              <p className="text-gray-600">{interview.job_title}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm text-gray-500">Progress</div>
                <div className="font-semibold">
                  {progress.answered} / {progress.total} questions
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Time Remaining</div>
                <div className={`text-lg font-bold ${
                  timeLeft < 30 ? 'text-red-600' : 'text-green-600'
                }`}>
                  {formatTime(timeLeft)}
                </div>
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: `${(progress.answered / progress.total) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Question Panel */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </span>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    currentQuestion.difficulty_level === 'easy' ? 'bg-green-100 text-green-800' :
                    currentQuestion.difficulty_level === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {currentQuestion.difficulty_level.toUpperCase()}
                  </span>
                </div>
                <span className="text-sm text-gray-500">
                  {currentQuestion.question_type}
                </span>
              </div>

              <h3 className="text-lg font-medium text-gray-800 mb-4">
                {currentQuestion.question_text}
              </h3>

              {/* Answer Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Answer
                </label>
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Type your answer here..."
                  className="w-full h-48 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  disabled={recording}
                />
                <p className="text-sm text-gray-500 mt-2">
                  Tip: Be specific and provide examples to support your answer.
                </p>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  onClick={handleSubmitAnswer}
                  disabled={submitting || (!answer.trim() && !recording)}
                  className={`px-6 py-3 rounded-lg font-medium ${
                    submitting || (!answer.trim() && !recording)
                      ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {submitting ? (
                    <span className="flex items-center">
                      <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                      Submitting...
                    </span>
                  ) : (
                    'Submit Answer'
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Video Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Video Response
              </h3>
              
              <div className="aspect-video bg-black rounded-lg overflow-hidden mb-4">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-3">
                {!recording ? (
                  <button
                    onClick={startRecording}
                    className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2"
                  >
                    <span className="w-3 h-3 bg-white rounded-full"></span>
                    Start Recording
                  </button>
                ) : (
                  <button
                    onClick={stopRecording}
                    className="w-full bg-gray-800 text-white py-3 rounded-lg hover:bg-gray-900 transition flex items-center justify-center gap-2"
                  >
                    <span className="w-3 h-3 bg-white rounded-full"></span>
                    Stop Recording
                  </button>
                )}

                <button
                  onClick={handleNextQuestion}
                  className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition"
                >
                  Skip Question
                </button>

                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to end the interview?')) {
                      handleCompleteInterview();
                    }
                  }}
                  className="w-full border border-red-300 text-red-600 py-3 rounded-lg hover:bg-red-50 transition"
                >
                  End Interview
                </button>
              </div>

              {/* Instructions */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">Instructions</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Record your answer using the camera</li>
                  <li>• Speak clearly and maintain eye contact</li>
                  <li>• You can also type your answer</li>
                  <li>• Each question has a time limit</li>
                  <li>• Submit answer before moving to next question</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Interview Completed Message */}
        {interviewCompleted && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">✅</span>
              </div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-3">
                Interview Completed!
              </h3>
              <p className="text-gray-600 mb-6">
                Thank you for completing the interview. You'll be redirected to your feedback shortly.
              </p>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default LiveInterview;