// src/components/InterviewFeedback.js
import React, { useState, useEffect } from 'react';
import { interviewApi } from '../services/interviewApi';
import { useParams, useNavigate } from 'react-router-dom';

function InterviewFeedback() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState(null);
  const [interview, setInterview] = useState(null);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFeedbackData();
  }, [id]);

  const fetchFeedbackData = async () => {
    try {
      setLoading(true);
      const [feedbackData, interviewData, responsesData] = await Promise.all([
        interviewApi.getInterviewFeedback(id),
        interviewApi.getInterview(id),
        interviewApi.getInterviewResponses(id)
      ]);
      
      setFeedback(feedbackData);
      setInterview(interviewData);
      setResponses(Array.isArray(responsesData) ? responsesData : []);
    } catch (err) {
      console.error('Error fetching feedback:', err);
      setError('Failed to load feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getRecommendationColor = (recommendation) => {
    switch (recommendation) {
      case 'strong_yes':
        return 'bg-green-100 text-green-800';
      case 'yes':
        return 'bg-green-50 text-green-700';
      case 'maybe':
        return 'bg-yellow-100 text-yellow-800';
      case 'no':
        return 'bg-orange-100 text-orange-800';
      case 'strong_no':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRecommendationText = (recommendation) => {
    switch (recommendation) {
      case 'strong_yes':
        return 'Strong Yes';
      case 'yes':
        return 'Yes';
      case 'maybe':
        return 'Maybe';
      case 'no':
        return 'No';
      case 'strong_no':
        return 'Strong No';
      default:
        return recommendation;
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Error Loading Feedback</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchFeedbackData}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!feedback) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">📊</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-3">Feedback Not Available Yet</h3>
          <p className="text-gray-600 mb-6">
            The interview feedback is still being generated. Please check back later.
          </p>
          <button
            onClick={() => navigate('/interviews')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Interviews
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Interview Feedback</h1>
              <p className="text-gray-600">
                {interview?.job_title} • {formatDate(interview?.scheduled_date)}
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Overall Rating</div>
              <div className={`text-3xl font-bold ${getScoreColor(feedback.overall_rating * 100)}`}>
                {(feedback.overall_rating * 100).toFixed(1)}%
              </div>
              <div className={`mt-2 px-3 py-1 rounded-full text-sm font-semibold ${getRecommendationColor(feedback.recommendation)}`}>
                {getRecommendationText(feedback.recommendation)}
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Feedback */}
          <div className="lg:col-span-2 space-y-6">
            {/* Overall Score Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Performance Analysis</h2>
              
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-medium text-gray-700 mb-3">Strengths</h3>
                  <ul className="space-y-2">
                    {feedback.strengths?.map((strength, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">✓</span>
                        <span className="text-gray-700">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-700 mb-3">Areas for Improvement</h3>
                  <ul className="space-y-2">
                    {feedback.weaknesses?.map((weakness, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-red-500 mt-1">!</span>
                        <span className="text-gray-700">{weakness}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Improvement Suggestions */}
              <div>
                <h3 className="font-medium text-gray-700 mb-3">Improvement Suggestions</h3>
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                  <p className="text-gray-700">{feedback.improvement_suggestions}</p>
                </div>
              </div>
            </div>

            {/* Detailed Evaluation */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Detailed Evaluation</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Technical Evaluation</h3>
                  <p className="text-gray-700">{feedback.technical_evaluation}</p>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Communication Evaluation</h3>
                  <p className="text-gray-700">{feedback.communication_evaluation}</p>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Problem Solving</h3>
                  <p className="text-gray-700">{feedback.problem_solving_evaluation}</p>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Cultural Fit</h3>
                  <p className="text-gray-700">{feedback.cultural_fit_evaluation}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Individual Responses */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Question Responses</h3>
              <div className="space-y-3">
                {responses.map((response, index) => (
                  <div key={response.id} className="border border-gray-100 rounded-lg p-3 hover:bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        Q{index + 1}: {response.question_text?.substring(0, 30)}...
                      </span>
                      <div className="flex gap-2">
                        {response.sentiment_score && (
                          <span className={`text-xs px-2 py-1 rounded ${
                            response.sentiment_score > 0.7 ? 'bg-green-100 text-green-800' :
                            response.sentiment_score > 0.4 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            Sentiment: {(response.sentiment_score * 100).toFixed(0)}%
                          </span>
                        )}
                        {response.keyword_match_percentage && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            Keywords: {response.keyword_match_percentage.toFixed(0)}%
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {response.candidate_answer?.substring(0, 80)}...
                    </p>
                    {response.feedback && (
                      <p className="text-xs text-gray-500 mt-2 italic">
                        Feedback: {response.feedback}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/interviews')}
                  className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition"
                >
                  Back to Interviews
                </button>
                <button
                  onClick={() => window.print()}
                  className="w-full border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition"
                >
                  Print Feedback
                </button>
                {interview?.join_url && (
                  <button
                    onClick={() => window.open(interview.join_url, '_blank')}
                    className="w-full border border-blue-300 text-blue-600 py-2 rounded-lg hover:bg-blue-50 transition"
                  >
                    View Recording
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InterviewFeedback;