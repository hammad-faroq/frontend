import React, { useState, useEffect } from 'react';
import AnswerInput from './AnswerInput';

const InterviewQuestionCard = ({ 
  question, 
  questionNumber, 
  totalQuestions,
  onAnswerChange,
  currentAnswer
}) => {
  const [answer, setAnswer] = useState(currentAnswer || {
    answer_text: '',
    selected_options: [],
    code_snippet: ''
  });
  const [timeSpent, setTimeSpent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (onAnswerChange) {
      onAnswerChange(question.id, answer);
    }
  }, [answer, question.id, onAnswerChange]);

  const handleAnswerChange = (newAnswer) => {
    setAnswer(prev => ({ ...prev, ...newAnswer }));
  };

  const getQuestionTypeLabel = (type) => {
    const types = {
      'MCQ': 'Multiple Choice',
      'DESC': 'Descriptive',
      'CODE': 'Coding'
    };
    return types[type] || type;
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Question Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4 text-white">
        <div className="flex justify-between items-center">
          <div>
            <span className="text-sm font-medium text-purple-100">
              Question {questionNumber} of {totalQuestions}
            </span>
            <h3 className="text-lg font-semibold mt-1">{question.category || 'General'}</h3>
          </div>
          <div className="text-right">
            <div className="text-sm text-purple-100">
              {getQuestionTypeLabel(question.question_type)}
            </div>
            <div className="text-xs text-purple-200 mt-1">
              ⏱️ {question.time_limit_minutes || 5} min limit
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs mb-1">
            <span>Time spent: {Math.floor(timeSpent / 60)}:{String(timeSpent % 60).padStart(2, '0')}</span>
            <span>Points: {question.points || 10}</span>
          </div>
          <div className="w-full bg-purple-400/30 rounded-full h-2">
            <div 
              className="bg-white h-2 rounded-full transition-all duration-1000"
              style={{ 
                width: `${Math.min((timeSpent / ((question.time_limit_minutes || 5) * 60)) * 100, 100)}%` 
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* Question Content */}
      <div className="p-6">
        <div className="mb-6">
          <h4 className="text-xl font-semibold text-gray-800 mb-3">Question:</h4>
          <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-line">
            {question.question_text}
          </p>
        </div>

        {/* Question Details */}
        {(question.difficulty || question.points) && (
          <div className="flex gap-4 mb-6">
            {question.difficulty && (
              <div className="flex items-center">
                <span className="text-gray-500 mr-2">📊</span>
                <span className={`font-medium ${
                  question.difficulty === 'hard' ? 'text-red-600' :
                  question.difficulty === 'medium' ? 'text-yellow-600' :
                  'text-green-600'
                }`}>
                  {question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}
                </span>
              </div>
            )}
            {question.points && (
              <div className="flex items-center">
                <span className="text-gray-500 mr-2">⭐</span>
                <span className="font-medium text-gray-700">
                  {question.points} point{question.points !== 1 ? 's' : ''}
                </span>
              </div>
            )}
            {question.time_limit_minutes && (
              <div className="flex items-center">
                <span className="text-gray-500 mr-2">⏰</span>
                <span className="font-medium text-gray-700">
                  {question.time_limit_minutes} minutes
                </span>
              </div>
            )}
          </div>
        )}

        {/* Answer Input */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Your Answer:</h4>
          <AnswerInput
            questionType={question.question_type}
            options={question.options || []}
            value={answer}
            onChange={handleAnswerChange}
          />
        </div>

        {/* Answer Statistics */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-sm text-gray-500">Time Spent</div>
              <div className="font-semibold text-gray-800">
                {Math.floor(timeSpent / 60)}:{String(timeSpent % 60).padStart(2, '0')}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Answer Length</div>
              <div className="font-semibold text-gray-800">
                {answer.answer_text?.length || answer.code_snippet?.length || 0} characters
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Auto-saved</div>
              <div className="font-semibold text-green-600">✓</div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        {question.question_type === 'CODE' && (
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <span className="text-blue-600 mr-2">💡</span>
              <span className="font-medium text-blue-800">Coding Instructions</span>
            </div>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• Write clean, readable code with proper indentation</li>
              <li>• Include comments for complex logic</li>
              <li>• Consider edge cases in your solution</li>
              <li>• Test your code with sample inputs</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewQuestionCard;