import React from 'react';
import {
  EyeIcon,
  DocumentArrowUpIcon
} from "@heroicons/react/24/outline";

const CareerInsightsSection = ({ analysis, onNavigate }) => {
  if (!analysis) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Career Insights</h2>
            <p className="text-gray-500 text-sm">Based on your resume analysis</p>
          </div>
        </div>
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <DocumentArrowUpIcon className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No Resume Analysis</h3>
          <p className="text-gray-500 mb-4">Upload your resume to get personalized insights</p>
          <button 
            onClick={() => onNavigate("/jobseeker/upload-resume")}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            <DocumentArrowUpIcon className="h-4 w-4" />
            Upload Resume
          </button>
        </div>
      </div>
    );
  }

  if (!analysis.career_insights?.suitable_roles) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Career Insights</h2>
            <p className="text-gray-500 text-sm">Based on your resume analysis</p>
          </div>
          <button 
            onClick={() => onNavigate("/jobseeker/analysis")}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-green-50 text-green-700 hover:bg-green-100 rounded-lg font-medium transition-colors"
          >
            <EyeIcon className="h-4 w-4" />
            Full Analysis
          </button>
        </div>
        <div className="text-center py-8">
          <p className="text-gray-500">No career insights available yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Career Insights</h2>
          <p className="text-gray-500 text-sm">Based on your resume analysis</p>
        </div>
        <button 
          onClick={() => onNavigate("/jobseeker/analysis")}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-green-50 text-green-700 hover:bg-green-100 rounded-lg font-medium transition-colors"
        >
          <EyeIcon className="h-4 w-4" />
          Full Analysis
        </button>
      </div>
      
      <div className="space-y-4">
        {analysis.career_insights.suitable_roles.slice(0, 3).map((role, idx) => (
          <div key={idx} className="p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-semibold text-gray-800">{role.role}</h4>
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                role.match_score >= 80 ? "bg-green-100 text-green-800" :
                role.match_score >= 60 ? "bg-yellow-100 text-yellow-800" :
                "bg-red-100 text-red-800"
              }`}>
                {role.match_score}% Match
              </span>
            </div>
            <p className="text-sm text-gray-600 line-clamp-2">{role.reason}</p>
            {role.skills && (
              <div className="flex flex-wrap gap-1 mt-3">
                {role.skills.slice(0, 3).map((skill, skillIdx) => (
                  <span 
                    key={skillIdx} 
                    className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                  >
                    {skill}
                  </span>
                ))}
                {role.skills.length > 3 && (
                  <span className="px-2 py-1 text-gray-500 text-xs">
                    +{role.skills.length - 3} more
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default React.memo(CareerInsightsSection);   