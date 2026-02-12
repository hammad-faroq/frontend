// src/pages/JobSeekerAnalysis.js
import React, { useState, useEffect } from "react";
import { getResumeAnalysis, logoutUser } from "../services/api";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

function JobSeekerAnalysis() {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate("/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  useEffect(() => {
    fetchAnalysis();
  }, []);

  const fetchAnalysis = async () => {
    try {
      setLoading(true);
      const data = await getResumeAnalysis();
      setAnalysis(data);
    } catch (err) {
      console.error("Error fetching analysis:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar handleLogout={handleLogout} navigate={navigate} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading analysis...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        {/* Sidebar */}
        <Sidebar handleLogout={handleLogout} navigate={navigate} />
        
        {/* Main Content */}
        <div className="flex-1 p-8 overflow-y-auto">
          <div className="mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Resume Analysis</h1>
              <p className="text-gray-600">Personalized career insights based on your resume</p>
            </div>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-12 text-center">
            <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">📊</span>
            </div>
            <h3 className="text-xl font-semibold text-yellow-800 mb-3">No Analysis Available</h3>
            <p className="text-yellow-600 mb-6">Upload your resume to get personalized career insights and recommendations.</p>
            <button
              onClick={() => navigate("/jobseeker/upload-resume")}
              className="px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium"
            >
              Upload Resume
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar handleLogout={handleLogout} navigate={navigate} />
      
      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        {/* Header */}
        <div className="mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Resume Analysis</h1>
            <p className="text-gray-600">Personalized career insights based on your resume</p>
          </div>
        </div>

        {/* Resume Summary */}
        {analysis.resume_summary && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Resume Summary</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Experience Level</h3>
                <p className="text-gray-800 text-lg">{analysis.resume_summary.experience_level || 'Not specified'}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Years of Experience</h3>
                <p className="text-gray-800 text-lg">{analysis.resume_summary.years_experience || 'Not specified'}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Last Updated</h3>
                <p className="text-gray-800 text-lg">
                  {analysis.resume_summary.last_updated ? 
                    new Date(analysis.resume_summary.last_updated).toLocaleDateString() : 
                    'Recently'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Skills */}
        {analysis.resume_summary?.primary_skills && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Skills Analysis</h2>
            <div className="mb-4">
              <h3 className="font-medium text-gray-700 mb-2">Primary Skills</h3>
              <div className="flex flex-wrap gap-2">
                {analysis.resume_summary.primary_skills.map((skill, index) => (
                  <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            {analysis.resume_summary.secondary_skills && analysis.resume_summary.secondary_skills.length > 0 && (
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Secondary Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {analysis.resume_summary.secondary_skills.slice(0, 10).map((skill, index) => (
                    <span key={index} className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Career Insights */}
        {analysis.career_insights?.suitable_roles && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Career Insights</h2>
            <div className="space-y-4">
              {analysis.career_insights.suitable_roles.map((role, idx) => (
                <div key={idx} className="border border-gray-100 rounded-xl p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-800">{role.role}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      role.match_score >= 80 ? "bg-green-100 text-green-800" :
                      role.match_score >= 60 ? "bg-yellow-100 text-yellow-800" :
                      "bg-red-100 text-red-800"
                    }`}>
                      {role.match_score}% Match
                    </span>
                  </div>
                  <p className="text-gray-600 mb-3">{role.reason}</p>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Growth: {role.growth_potential}</span>
                    <span>Timeline: {role.timeline}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Learning Path */}
        {analysis.learning_path?.learning_path && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Learning Path</h2>
            <div className="space-y-6">
              {analysis.learning_path.learning_path.map((phase, idx) => (
                <div key={idx} className="relative">
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-semibold mr-3">
                      {idx + 1}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 capitalize">{phase.phase}</h3>
                      <p className="text-sm text-gray-500">{phase.timeline}</p>
                    </div>
                  </div>
                  <div className="ml-11">
                    <div className="flex flex-wrap gap-2">
                      {phase.topics.map((topic, i) => (
                        <span key={i} className="bg-purple-50 text-purple-700 px-3 py-1 rounded-lg text-sm">
                          {topic}
                        </span>
                      ))}
                    </div>
                    {phase.description && (
                      <p className="text-gray-600 mt-2">{phase.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certifications */}
        {analysis.certifications && analysis.certifications.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Recommended Certifications</h2>
            <div className="space-y-3">
              {analysis.certifications.map((cert, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">{cert.name}</h3>
                    <p className="text-sm text-gray-600">{cert.issuer} • {cert.duration}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      cert.priority === "high" ? "bg-red-100 text-red-800" :
                      cert.priority === "medium" ? "bg-yellow-100 text-yellow-800" :
                      "bg-blue-100 text-blue-800"
                    }`}>
                      {cert.priority} priority
                    </span>
                    <span className="text-sm text-gray-500">{cert.cost}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default JobSeekerAnalysis;