import React from 'react';
import {
  ArrowPathIcon,
  EyeIcon,
  BoltIcon,
  CpuChipIcon,
  ChatBubbleLeftRightIcon,
  MagnifyingGlassIcon
} from "@heroicons/react/24/outline";

const InterviewPrepSection = ({ 
  interviewPrep, 
  onGenerateMore, 
  onMockInterview, 
  onRefresh, 
  refreshing,
  onViewAll 
}) => {
  if (interviewPrep.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 h-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Interview Preparation</h2>
            <p className="text-gray-500 text-sm">Practice with AI-generated questions</p>
          </div>
          <button 
            onClick={onRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <ArrowPathIcon className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
        <div className="text-center py-10">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ChatBubbleLeftRightIcon className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No Interview Preparation</h3>
          <p className="text-gray-500 mb-4 max-w-md mx-auto">
            Start preparing for interviews by selecting jobs you're interested in
          </p>
          <button 
            onClick={() => window.location.href = "/jobseeker/jobs"}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
          >
            <MagnifyingGlassIcon className="h-4 w-4" />
            Browse Jobs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Interview Preparation</h2>
          <p className="text-gray-500 text-sm">Practice with AI-generated questions</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={onRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <ArrowPathIcon className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
          <button 
            onClick={onViewAll}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg font-medium transition-colors"
          >
            <EyeIcon className="h-4 w-4" />
            View All
          </button>
        </div>
      </div>
      
      <div className="space-y-4">
        {interviewPrep.map((prep) => (
          <div key={prep.job_id} className="border border-gray-100 rounded-xl p-4 hover:bg-gray-50 transition-colors group">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800 mb-1">{prep.job_title}</h3>
                <p className="text-sm text-gray-600">{prep.company}</p>
              </div>
              <div className="flex items-center gap-2">
                {prep.updated && (
                  <span className="text-xs font-medium bg-green-100 text-green-800 px-2 py-1 rounded animate-pulse">
                    Updated
                  </span>
                )}
                <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  Prepared
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-lg font-bold text-blue-600">
                  {prep.interview_preparation?.technical_questions?.length || 0}
                </div>
                <div className="text-xs text-gray-600 font-medium">Tech Questions</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-lg font-bold text-purple-600">
                  {prep.interview_preparation?.behavioral_questions?.length || 0}
                </div>
                <div className="text-xs text-gray-600 font-medium">Behavioral</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-lg font-bold text-green-600">
                  {(prep.interview_preparation?.technical_questions?.length || 0) + 
                   (prep.interview_preparation?.behavioral_questions?.length || 0)}
                </div>
                <div className="text-xs text-gray-600 font-medium">Total</div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => onGenerateMore(prep.job_id)}
                disabled={prep.generating}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {prep.generating ? (
                  <>
                    <ArrowPathIcon className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <BoltIcon className="h-4 w-4" />
                    Generate More
                  </>
                )}
              </button>
              <button
                onClick={() => onMockInterview(prep.job_id)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg font-medium transition-colors"
              >
                <CpuChipIcon className="h-4 w-4" />
                Mock Interview
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default React.memo(InterviewPrepSection);