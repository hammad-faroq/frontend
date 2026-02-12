import React from 'react';

const InterviewProgress = ({ 
  currentQuestion, 
  totalQuestions, 
  answeredQuestions = 0,
  onQuestionSelect 
}) => {
  const progressPercentage = totalQuestions > 0 
    ? Math.round((answeredQuestions / totalQuestions) * 100) 
    : 0;

  const getQuestionStatus = (index) => {
    if (index < answeredQuestions) return 'answered';
    if (index === currentQuestion) return 'current';
    return 'pending';
  };

  const renderQuestionDots = () => {
    return Array.from({ length: totalQuestions }).map((_, index) => {
      const status = getQuestionStatus(index);
      const isCurrent = index === currentQuestion;
      
      return (
        <button
          key={index}
          onClick={() => onQuestionSelect && onQuestionSelect(index)}
          className={`relative flex flex-col items-center ${isCurrent ? 'z-10' : ''}`}
          disabled={index > answeredQuestions}
        >
          <div className={`
            w-10 h-10 rounded-full flex items-center justify-center mb-1
            ${status === 'answered' ? 'bg-green-100 border-2 border-green-500' :
              status === 'current' ? 'bg-purple-100 border-2 border-purple-500' :
              'bg-gray-100 border-2 border-gray-300'}
            ${isCurrent ? 'ring-2 ring-purple-300 ring-offset-2' : ''}
          `}>
            <span className={`
              font-medium
              ${status === 'answered' ? 'text-green-700' :
                status === 'current' ? 'text-purple-700' :
                'text-gray-500'}
            `}>
              {index + 1}
            </span>
          </div>
          
          {isCurrent && (
            <div className="absolute top-12 text-xs font-medium text-purple-700 bg-purple-50 px-2 py-1 rounded">
              Current
            </div>
          )}
          
          {status === 'answered' && !isCurrent && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">✓</span>
            </div>
          )}
        </button>
      );
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Interview Progress</h3>
        <span className="text-sm font-medium text-gray-600">
          {answeredQuestions} of {totalQuestions} answered
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Completion</span>
          <span>{progressPercentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="h-3 rounded-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Question Navigation Dots */}
      <div className="relative">
        <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 -z-10"></div>
        <div 
          className="absolute top-5 left-0 h-1 bg-green-500 -z-10 transition-all duration-500"
          style={{ width: `${(answeredQuestions / totalQuestions) * 100}%` }}
        ></div>
        
        <div className="flex justify-between mb-8">
          {renderQuestionDots()}
        </div>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
          <span className="text-gray-600">Answered</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
          <span className="text-gray-600">Current</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-gray-300 mr-2"></div>
          <span className="text-gray-600">Pending</span>
        </div>
      </div>
    </div>
  );
};

export default InterviewProgress;