import React from "react";
import { useNavigate } from "react-router-dom";

function HRInterviewsList({ 
  interviews = [], 
  onReviewInterview, 
  onFinalizeInterview,
  onAddQuestions,
  onViewResult,
  onMonitorInterview,
  onEndInterview,
  onCancelInterview,
  onMarkNoShow,
  onRescheduleInterview
}) {
  
  const navigate = useNavigate();
  const safeInterviews = Array.isArray(interviews) ? interviews : [];
  
  // Helper function to get candidate email from interview data
  const getCandidateEmail = (interview) => {
    // Try different possible field names
    return interview.candidate_email || 
           interview.candidate?.email || 
           interview.candidate_email_address || 
           "candidate@example.com"; // fallback
  };

  // Helper function to get candidate name
  const getCandidateName = (interview) => {
    if (interview.candidate_name) return interview.candidate_name;
    
    if (interview.candidate) {
      const candidate = interview.candidate;
      if (candidate.first_name && candidate.last_name) {
        return `${candidate.first_name} ${candidate.last_name}`;
      }
      return candidate.email || "Candidate";
    }
    
    return interview.candidate_email || "Candidate";
  };

  // Helper function to get job title
  const getJobTitle = (interview) => {
    return interview.job_title || 
           interview.job?.title || 
           "Job Title";
  };

  // Helper function to get formatted scheduled time
  const getFormattedTime = (interview) => {
    const time = interview.scheduled_date || 
                 interview.scheduled_time ||
                 interview.scheduled_date_time;
    
    if (!time) return "Not scheduled";
    
    try {
      return new Date(time).toLocaleString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (e) {
      return "Invalid date";
    }
  };

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    switch(status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-purple-100 text-purple-800';
      case 'submitted':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'no_show':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Format status display
  const formatStatus = (status) => {
    const statusMap = {
      'scheduled': 'Scheduled',
      'in_progress': 'In Progress',
      'submitted': 'Submitted for Review',
      'completed': 'Completed',
      'cancelled': 'Cancelled',
      'no_show': 'No Show'
    };
    return statusMap[status] || status;
  };

  // Check if interview can be started
  const canStartInterview = (interview) => {
    if (interview.status !== 'scheduled') return false;
    
    const scheduledTime = new Date(interview.scheduled_date || interview.scheduled_time);
    const now = new Date();
    const timeDiff = scheduledTime - now;
    
    // Can start interview 15 minutes before scheduled time up to 30 minutes after
    const canStartEarly = 15 * 60 * 1000; // 15 minutes
    const canStartLate = 30 * 60 * 1000; // 30 minutes
    
    return timeDiff <= canStartEarly && timeDiff >= -canStartLate;
  };

  // Check if "Add Questions" should be enabled
  const canAddQuestions = (interview) => {
    // Only allow adding questions to scheduled interviews (not in_progress)
    return interview.status === 'scheduled';
  };

  // Handle start interview
  const handleStartInterview = (interviewId) => {
    navigate(`/hr/interview/${interviewId}/start`);
  };

  // Handle cancel interview (frontend only)
  const handleCancel = (interviewId) => {
    if (window.confirm("Are you sure you want to cancel this interview?")) {
      onCancelInterview(interviewId);
      alert("Interview marked as cancelled (frontend only). Implement API for persistence.");
    }
  };

  // Handle mark as no show (frontend only)
  const handleMarkNoShow = (interviewId) => {
    if (window.confirm("Mark this interview as 'No Show'?")) {
      onMarkNoShow(interviewId);
      alert("Interview marked as no-show (frontend only). Implement API for persistence.");
    }
  };

  // Handle monitor interview
  const handleMonitorInterview = (interviewId) => {
    navigate(`/hr/interview/${interviewId}/monitor`);
  };

  // Handle add questions
  const handleAddQuestions = (interviewId) => {
    navigate(`/hr/interview/${interviewId}/add-questions`);
  };

  // Handle view result
  const handleViewResult = (interviewId) => {
    navigate(`/hr/interview/${interviewId}/answers`);
  };

  return (
    <div className="bg-white border rounded-xl p-5">
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-semibold text-lg text-gray-800">Interviews Management</h4>
        <span className="text-sm text-gray-500">
          Total: {safeInterviews.length} interview{safeInterviews.length !== 1 ? 's' : ''}
        </span>
      </div>
      
      {safeInterviews.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p className="mb-3">No interviews scheduled yet</p>
          <p className="text-sm">Schedule an interview from a job posting</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Candidate</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job Title</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scheduled Time</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {safeInterviews.map((interview) => {
                const canStart = canStartInterview(interview);
                const candidateEmail = getCandidateEmail(interview);
                const candidateName = getCandidateName(interview);
                const jobTitle = getJobTitle(interview);
                const formattedTime = getFormattedTime(interview);
                
                return (
                  <tr key={interview.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{candidateEmail}</p>
                        {candidateName && candidateName !== candidateEmail && (
                          <p className="text-sm text-gray-500">{candidateName}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-gray-700">{jobTitle}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-gray-700">{formattedTime}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 capitalize">
                        {interview.interview_type || "technical"}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(interview.status)}`}>
                        {formatStatus(interview.status)}
                      </span>
                      {interview.status === 'scheduled' && canStart && (
                        <div className="mt-1 text-xs text-green-600 font-medium">
                          ⏰ Ready to start
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-2 flex-wrap">
                        {/* SCHEDULED interviews */}
                        {interview.status === 'scheduled' && (
                          <>
                            {canStart ? (
                              <button
                                onClick={() => handleStartInterview(interview.id)}
                                className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition"
                              >
                                Start Now
                              </button>
                            ) : (
                              <button
                                disabled
                                className="bg-gray-300 text-gray-500 px-3 py-1 rounded text-sm cursor-not-allowed"
                              >
                                Not started yet
                              </button>
                            )}
                            <button
                              onClick={() => handleCancel(interview.id)}
                              className="text-red-600 hover:text-red-800 text-sm px-3 py-1 border border-red-200 rounded hover:bg-red-50"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleMarkNoShow(interview.id)}
                              className="text-gray-600 hover:text-gray-800 text-sm px-3 py-1 border border-gray-200 rounded hover:bg-gray-50"
                            >
                              Mark No Show
                            </button>
                            {canAddQuestions(interview) && (
                              <button
                                onClick={() => handleAddQuestions(interview.id)}
                                className="text-purple-600 hover:text-purple-800 text-sm px-3 py-1 border border-purple-200 rounded hover:bg-purple-50"
                              >
                                Add Questions
                              </button>
                            )}
                          </>
                        )}
                        
                        {/* IN PROGRESS interviews */}
                        {interview.status === 'in_progress' && (
                          <>
                            <button
                              onClick={() => handleMonitorInterview(interview.id)}
                              className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition"
                            >
                              Monitor
                            </button>
                            <button
                              onClick={() => onEndInterview(interview.id)}
                              className="text-red-600 hover:text-red-800 text-sm px-3 py-1 border border-red-200 rounded hover:bg-red-50"
                            >
                              End Interview
                            </button>
                            {/* Remove Add Questions from in_progress - should only be in scheduled */}
                          </>
                        )}
                        
                        {/* SUBMITTED interviews - need review */}
                        {interview.status === 'submitted' && (
                          <>
                            <button
                              onClick={() => onReviewInterview(interview.id)}
                              className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700 transition"
                            >
                              Review & Score
                            </button>
                            <button
                              onClick={() => onFinalizeInterview(interview.id)}
                              className="text-green-600 hover:text-green-800 text-sm px-3 py-1 border border-green-200 rounded hover:bg-green-50"
                            >
                              Finalize
                            </button>
                          </>
                        )}
                        
                        {/* COMPLETED interviews */}
                        {interview.status === 'completed' && (
                          <>
                            <button
                              onClick={() => handleViewResult(interview.id)}
                              className="text-green-600 hover:text-green-800 text-sm px-3 py-1 border border-green-200 rounded hover:bg-green-50"
                            >
                              View Result
                            </button>
                          </>
                        )}
                        
                        {/* CANCELLED or NO SHOW interviews */}
                        {(interview.status === 'cancelled' || interview.status === 'no_show') && (
                          <button
                            onClick={() => onRescheduleInterview(interview.job_id || interview.job?.id)}
                            className="text-orange-600 hover:text-orange-800 text-sm px-3 py-1 border border-orange-200 rounded hover:bg-orange-50"
                          >
                            Re-schedule
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default HRInterviewsList;