import React, { useState, useEffect } from 'react';

const InterviewTimer = ({ totalTimeMinutes = 60, onTimeUp, interviewId }) => {
  const [timeRemaining, setTimeRemaining] = useState(totalTimeMinutes * 60);
  const [isRunning, setIsRunning] = useState(true);

  useEffect(() => {
    if (!isRunning) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsRunning(false);
          if (onTimeUp) onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, onTimeUp]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${minutes}:${String(secs).padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    return ((totalTimeMinutes * 60 - timeRemaining) / (totalTimeMinutes * 60)) * 100;
  };

  const getTimeColor = () => {
    if (timeRemaining > totalTimeMinutes * 30) return 'text-green-600';
    if (timeRemaining > totalTimeMinutes * 15) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handlePause = () => {
    setIsRunning(!isRunning);
  };

  const saveTime = () => {
    // Save time to localStorage for recovery
    localStorage.setItem(`interview_time_${interviewId}`, JSON.stringify({
      remaining: timeRemaining,
      timestamp: Date.now()
    }));
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <span className="text-gray-700 font-medium mr-2">⏰ Interview Timer</span>
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
            ID: {interviewId?.substring(0, 8) || 'N/A'}
          </span>
        </div>
        <button
          onClick={handlePause}
          className={`px-3 py-1 rounded text-sm font-medium ${
            isRunning 
              ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' 
              : 'bg-green-100 text-green-800 hover:bg-green-200'
          }`}
        >
          {isRunning ? '⏸️ Pause' : '▶️ Resume'}
        </button>
      </div>

      <div className="mb-3">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Time Remaining</span>
          <span className={`font-bold ${getTimeColor()}`}>
            {formatTime(timeRemaining)}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="h-2 rounded-full transition-all duration-1000"
            style={{ 
              width: `${getProgressPercentage()}%`,
              backgroundColor: getTimeColor().replace('text-', 'bg-')
            }}
          ></div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="text-center p-2 bg-blue-50 rounded">
          <div className="text-blue-700 font-medium">Total Time</div>
          <div className="text-blue-900 font-bold">{totalTimeMinutes} min</div>
        </div>
        <div className="text-center p-2 bg-purple-50 rounded">
          <div className="text-purple-700 font-medium">Time Used</div>
          <div className="text-purple-900 font-bold">
            {formatTime(totalTimeMinutes * 60 - timeRemaining)}
          </div>
        </div>
      </div>

      <button
        onClick={saveTime}
        className="w-full mt-3 py-2 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
      >
        💾 Save Time Progress
      </button>
    </div>
  );
};

export default InterviewTimer;