import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from "react-hot-toast";
import InterviewService from '../services/interviewService';
import { getInterviewResult, getCandidateInterviewDetail } from '../services/interviewApi';

const CandidateInterviewResult = () => {
  const { interviewId } = useParams();
  const navigate = useNavigate();
  
  const [result, setResult] = useState(null);
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadResults();
    
    // Reset service after results are loaded
    return () => {
      InterviewService.reset();
    };
  }, [interviewId]);

  const loadResults = async () => {
    try {
      setLoading(true);
      
      // Load interview details
      const interviewDetail = await getCandidateInterviewDetail(interviewId);
      setInterview(interviewDetail);
      
      // Load results
      const resultData = await getInterviewResult(interviewId);
      setResult(resultData);
      
    } catch (err) {
      console.error('Failed to load results:', err);
      setError(err.message || 'Failed to load interview results');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    // Your logout logic here
    navigate('/login');
  };

  const downloadResults = () => {
    const dataStr = JSON.stringify(result, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = window.URL.createObjectURL(dataBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `interview-results-${interviewId}.json`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getRecommendationText = (recommendation) => {
    switch(recommendation) {
      case 'hire': return 'Highly Recommended';
      case 'maybe': return 'Under Consideration';
      case 'reject': return 'Not Selected';
      default: return 'Pending Review';
    }
  };

  const getRecommendationColor = (recommendation) => {
    switch(recommendation) {
      case 'hire': return 'bg-green-100 text-green-800 border-green-200';
      case 'maybe': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'reject': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        {/* <Sidebar handleLogout={handleLogout} navigate={navigate} /> */}
        <div className="flex-1 p-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading interview results...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        {/* <Sidebar handleLogout={handleLogout} navigate={navigate} /> */}
        <div className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
              <h3 className="text-red-800 font-semibold text-lg mb-2">Error</h3>
              <p className="text-red-600">{error}</p>
              <button
                onClick={() => navigate('/jobseeker/interviews')}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Back to Interviews
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* <Sidebar handleLogout={handleLogout} navigate={navigate} /> */}
      
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => navigate('/jobseeker/interviews')}
            className="flex items-center text-purple-600 hover:text-purple-800 mb-8"
          >
            <span className="mr-2">←</span> Back to Interviews
          </button>

          {/* Header */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Interview Results
                </h1>
                <div className="flex items-center gap-4">
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    Completed
                  </span>
                  <span className="text-gray-600">{interview?.title}</span>
                  <span className="text-gray-400 text-sm">
                    ID: {interviewId.substring(0, 8)}...
                  </span>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-sm text-gray-500">Completion Date</div>
                <div className="font-medium text-gray-800">
                  {interview?.completed_at 
                    ? new Date(interview.completed_at).toLocaleDateString() 
                    : new Date().toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* Overall Score */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white">
                <div className="text-center">
                  <div className="text-5xl font-bold mb-2">{result?.overall_score || 0}</div>
                  <div className="text-blue-100">Overall Score</div>
                  <div className="text-sm text-blue-200 mt-2">out of 100</div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-6 text-white">
                <div className="text-center">
                  <div className="text-5xl font-bold mb-2">
                    {result?.answers?.filter(a => a.auto_score || a.hr_score).length || 0}
                  </div>
                  <div className="text-purple-100">Questions Graded</div>
                  <div className="text-sm text-purple-200 mt-2">out of {result?.answers?.length || 0}</div>
                </div>
              </div>
              
              <div className={`rounded-xl p-6 border-2 ${getRecommendationColor(result?.recommendation)}`}>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2">
                    {getRecommendationText(result?.recommendation)}
                  </div>
                  <div className="text-gray-700">Recommendation</div>
                  <div className="text-sm text-gray-600 mt-2">
                    {result?.recommendation === 'hire' ? '✅ Proceed to next round' :
                     result?.recommendation === 'maybe' ? '⚠️ Additional review needed' :
                     '❌ Not selected'}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={downloadResults}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
              >
                📥 Download Results
              </button>
              <button
                onClick={() => window.print()}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
              >
                🖨️ Print Results
              </button>
              <button
                onClick={() => navigate('/jobseeker/profile')}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
              >
                Update Profile
              </button>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Score Breakdown */}
            <div className="lg:col-span-2 space-y-6">
              {/* Skills Assessment */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Skills Assessment</h2>
                <div className="space-y-6">
                  {result?.skill_scores && Object.entries(result.skill_scores).map(([skill, score]) => (
                    <div key={skill}>
                      <div className="flex justify-between mb-2">
                        <span className="font-medium text-gray-800">{skill}</span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(score)}`}>
                          {score}/100
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className={`h-3 rounded-full ${
                            score >= 80 ? 'bg-green-500' :
                            score >= 60 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${score}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Question-by-Question Results */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Question Results</h2>
                <div className="space-y-4">
                  {result?.answers?.map((answer, index) => (
                    <div 
                      key={answer.id} 
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <span className="text-sm text-gray-500">Question {index + 1}</span>
                          <h4 className="font-medium text-gray-800 mt-1">
                            {answer.question_text?.substring(0, 100)}...
                          </h4>
                        </div>
                        <div className="text-right">
                          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                            (answer.auto_score || answer.hr_score) >= 80 ? 'bg-green-100 text-green-800' :
                            (answer.auto_score || answer.hr_score) >= 60 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            Score: {answer.auto_score || answer.hr_score || 'Pending'}/100
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {answer.question_type}
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-gray-500 mb-1">Your Answer</div>
                          <div className="bg-gray-50 p-3 rounded text-gray-700">
                            {answer.answer_text || 
                             (answer.selected_options?.join(', ')) || 
                             answer.code_snippet || 
                             'No answer provided'}
                          </div>
                        </div>
                        
                        <div>
                          <div className="text-sm text-gray-500 mb-1">Feedback</div>
                          <div className="bg-blue-50 p-3 rounded text-gray-700">
                            {answer.hr_feedback || answer.auto_feedback || 'No feedback yet'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Summary & Next Steps */}
            <div className="space-y-6">
              {/* Performance Summary */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-800 mb-4">Performance Summary</h3>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-500">Time Taken</div>
                    <div className="font-medium text-gray-800">
                      {result?.total_time_minutes || '--'} minutes
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Questions Answered</div>
                    <div className="font-medium text-gray-800">
                      {result?.answers?.length || 0} questions
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Average Score</div>
                    <div className="font-medium text-gray-800">
                      {result?.average_score || '--'}/100
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Strongest Area</div>
                    <div className="font-medium text-gray-800">
                      {result?.strongest_skill || '--'}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Area for Improvement</div>
                    <div className="font-medium text-gray-800">
                      {result?.weakest_skill || '--'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Next Steps */}
              <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl p-6 text-white">
                <h3 className="text-lg font-semibold mb-4">Next Steps</h3>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <span className="mr-3">1</span>
                    <div>
                      <div className="font-medium">Review Your Results</div>
                      <div className="text-green-100 text-sm">
                        Understand your strengths and areas for improvement
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <span className="mr-3">2</span>
                    <div>
                      <div className="font-medium">Update Your Profile</div>
                      <div className="text-green-100 text-sm">
                        Add new skills and experiences based on feedback
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <span className="mr-3">3</span>
                    <div>
                      <div className="font-medium">Prepare for Next Round</div>
                      <div className="text-green-100 text-sm">
                        Use feedback to improve for future interviews
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <span className="mr-3">4</span>
                    <div>
                      <div className="font-medium">Apply to More Jobs</div>
                      <div className="text-green-100 text-sm">
                        Use your improved profile to find better opportunities
                      </div>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => navigate('/jobseeker/jobs')}
                  className="w-full mt-6 py-3 bg-white text-green-600 rounded-lg hover:bg-green-50 font-medium"
                >
                  Browse Jobs
                </button>
              </div>

              {/* Contact & Support */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-800 mb-4">Questions?</h3>
                <p className="text-gray-600 text-sm mb-4">
                  If you have questions about your results or need clarification, contact the recruiter.
                </p>
                <button
                  onClick={() => toast.success(`Contact: ${interview?.hr_email || 'recruiter@company.com'}`)}
                  className="w-full py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Contact Recruiter
                </button>
              </div>

              {/* Tips for Improvement */}
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
                <h3 className="font-semibold text-blue-800 mb-4">Tips for Improvement</h3>
                <ul className="text-blue-700 text-sm space-y-2">
                  <li className="flex items-start">
                    <span className="mr-2">📚</span>
                    <span>Review technical concepts in weaker areas</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">💬</span>
                    <span>Practice communication of complex ideas</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">⏱️</span>
                    <span>Work on time management during interviews</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">📝</span>
                    <span>Prepare more examples from past experiences</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Final Notes */}
          <div className="mt-8 bg-gray-50 border border-gray-200 rounded-2xl p-6">
            <h3 className="font-semibold text-gray-800 mb-2">Important Notes</h3>
            <ul className="text-gray-600 text-sm space-y-2">
              <li>• Your results are confidential and will be shared only with the hiring team</li>
              <li>• The HR team may contact you within 5-7 business days for next steps</li>
              <li>• You can use these results to prepare for future interviews</li>
              <li>• Keep a copy of these results for your records</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateInterviewResult;