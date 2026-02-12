import React, { useState } from 'react';

const AnswerInput = ({ questionType, options = [], value, onChange }) => {
  const [localValue, setLocalValue] = useState(value);

  const handleInputChange = (field, newValue) => {
    const updated = { ...localValue, [field]: newValue };
    setLocalValue(updated);
    onChange(updated);
  };

  const handleOptionToggle = (option) => {
    const currentOptions = localValue.selected_options || [];
    const isSelected = currentOptions.includes(option);
    
    let newOptions;
    if (isSelected) {
      newOptions = currentOptions.filter(opt => opt !== option);
    } else {
      newOptions = [...currentOptions, option];
    }
    
    handleInputChange('selected_options', newOptions);
  };

  const handleSelectChange = (selectedOption) => {
    handleInputChange('selected_options', [selectedOption]);
  };

  // MCQ - Single Select
  if (questionType === 'MCQ' && options.length > 0) {
    return (
      <div className="space-y-3">
        {options.map((option, index) => (
          <div
            key={index}
            className={`p-4 border rounded-lg cursor-pointer transition-all ${
              (localValue.selected_options || []).includes(option)
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-300 hover:border-purple-300 hover:bg-purple-50/50'
            }`}
            onClick={() => handleSelectChange(option)}
          >
            <div className="flex items-center">
              <div className={`w-6 h-6 rounded-full border mr-3 flex items-center justify-center ${
                (localValue.selected_options || []).includes(option)
                  ? 'border-purple-500 bg-purple-500'
                  : 'border-gray-400'
              }`}>
                {(localValue.selected_options || []).includes(option) && (
                  <div className="w-3 h-3 rounded-full bg-white"></div>
                )}
              </div>
              <span className="text-gray-800">{option}</span>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // MCQ - Multiple Select
  if (questionType === 'MCQ_MULTI' && options.length > 0) {
    return (
      <div className="space-y-3">
        {options.map((option, index) => (
          <div
            key={index}
            className={`p-4 border rounded-lg cursor-pointer transition-all ${
              (localValue.selected_options || []).includes(option)
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-300 hover:border-purple-300 hover:bg-purple-50/50'
            }`}
            onClick={() => handleOptionToggle(option)}
          >
            <div className="flex items-center">
              <div className={`w-6 h-6 border rounded mr-3 flex items-center justify-center ${
                (localValue.selected_options || []).includes(option)
                  ? 'border-purple-500 bg-purple-500 text-white'
                  : 'border-gray-400'
              }`}>
                {(localValue.selected_options || []).includes(option) && '✓'}
              </div>
              <span className="text-gray-800">{option}</span>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Descriptive Answer
  if (questionType === 'DESC') {
    return (
      <div className="space-y-4">
        <textarea
          value={localValue.answer_text || ''}
          onChange={(e) => handleInputChange('answer_text', e.target.value)}
          className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none resize-none"
          placeholder="Type your answer here..."
        />
        <div className="flex justify-between text-sm text-gray-500">
          <span>{localValue.answer_text?.length || 0} characters</span>
          <span>Minimum recommended: 100 characters</span>
        </div>
      </div>
    );
  }

  // Coding Question
  if (questionType === 'CODE') {
    return (
      <div className="space-y-4">
        <div className="border border-gray-300 rounded-lg overflow-hidden">
          <div className="bg-gray-800 text-gray-200 px-4 py-2 font-mono text-sm">
            Code Editor
          </div>
          <textarea
            value={localValue.code_snippet || ''}
            onChange={(e) => handleInputChange('code_snippet', e.target.value)}
            className="w-full h-80 font-mono text-sm bg-gray-900 text-gray-100 p-4 focus:outline-none resize-none"
            placeholder="// Write your code here..."
            spellCheck="false"
          />
        </div>
        <div className="flex justify-between text-sm text-gray-500">
          <span>{localValue.code_snippet?.length || 0} characters</span>
          <span>Lines: {(localValue.code_snippet?.match(/\n/g) || []).length + 1}</span>
        </div>
      </div>
    );
  }

  // Default - Simple text input
  return (
    <textarea
      value={localValue.answer_text || ''}
      onChange={(e) => handleInputChange('answer_text', e.target.value)}
      className="w-full h-48 p-4 border border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none resize-none"
      placeholder="Enter your answer..."
    />
  );
};

export default AnswerInput;