// src/pages/JobSeekerUploadResume.js - Updated with Sidebar
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getResumeAnalysis } from "../services/api";
import Sidebar from "../components/Sidebar";
import { logoutUser } from "../services/api";

function JobSeekerUploadResume() {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [showAnalysisRedirect, setShowAnalysisRedirect] = useState(false);
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate("/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const handleUpload = async (file) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login first!");
      navigate("/login");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);
      const res = await fetch("http://localhost:8000/cv_manager/resume/upload/", {
        method: "POST",
        headers: { Authorization: `Token ${token}` },
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setUploadedFile(file);
        
        // Fetch analysis after upload
        try {
          const analysisData = await getResumeAnalysis();
          setAnalysis(analysisData);
          setShowAnalysisRedirect(true);
          
          // Auto-redirect to analysis page after 3 seconds
          setTimeout(() => {
            navigate("/jobseeker/analysis");
          }, 3000);
          
        } catch (analysisErr) {
          console.error("Failed to fetch analysis:", analysisErr);
        }
        
        alert("✅ Resume uploaded successfully! Your analysis has been updated.");
      } else {
        const errorData = await res.json();
        alert(`❌ Upload failed: ${errorData.error || "Please try again."}`);
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("❌ Upload error! Please check your connection.");
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.type === "application/pdf" || file.type.includes("word"))) {
      handleUpload(file);
    } else {
      alert("Please upload only PDF or Word documents.");
    }
  };

  const handleClick = () => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".pdf,.doc,.docx";
    fileInput.onchange = (e) => {
      const file = e.target.files[0];
      if (file) handleUpload(file);
    };
    fileInput.click();
  };

  const handleViewAnalysis = () => {
    navigate("/jobseeker/analysis");
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar handleLogout={handleLogout} navigate={navigate} />
      
      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        {/* Header */}
        <div className="mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Resume</h1>
            <p className="text-gray-600">Upload your resume to get personalized career insights and job matches</p>
          </div>
        </div>

        {/* Auto-redirect Notification */}
        {showAnalysisRedirect && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-blue-600 text-lg">⏱️</span>
                </div>
                <div>
                  <p className="font-medium text-blue-800">Resume analyzed successfully!</p>
                  <p className="text-sm text-blue-600">Redirecting to full analysis in 3 seconds...</p>
                </div>
              </div>
              <button
                onClick={handleViewAnalysis}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm"
              >
                View Now
              </button>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Upload Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Upload Your Resume</h2>
              
              <div
                className={`border-2 ${dragOver ? 'border-blue-500 bg-blue-50' : 'border-dashed border-blue-300'} rounded-xl p-8 text-center cursor-pointer transition-all duration-300`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleClick}
              >
                {uploading ? (
                  <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-blue-600 font-medium">Uploading Resume...</p>
                    <p className="text-gray-500 text-sm mt-2">Please wait while we process your file</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <p className="text-gray-700 font-medium mb-1">Drag & drop your resume here</p>
                    <p className="text-gray-500 text-sm mb-4">or click to browse files</p>
                    <p className="text-gray-400 text-xs">Supports PDF, DOC, DOCX (Max 5MB)</p>
                  </div>
                )}
              </div>

              {uploadedFile && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="font-medium text-green-800">Uploaded successfully!</p>
                        <p className="text-sm text-green-700">{uploadedFile.name} • {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setUploadedFile(null);
                        setAnalysis(null);
                        setShowAnalysisRedirect(false);
                      }}
                      className="text-green-700 hover:text-green-900 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}

              {/* Tips Section */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Tips for better results:</h3>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-600">Include all relevant work experience</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-600">List your technical skills and certifications</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-600">Mention your education and achievements</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-600">Use clear formatting and professional language</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Analysis Preview */}
            {analysis && (
              <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">Quick Analysis</h2>
                  <button
                    onClick={handleViewAnalysis}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm"
                  >
                    View Full Analysis
                  </button>
                </div>
                
                {analysis.resume_summary && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium text-gray-700 mb-2">Primary Skills Detected:</h3>
                      <div className="flex flex-wrap gap-2">
                        {analysis.resume_summary.primary_skills?.slice(0, 8).map((skill, index) => (
                          <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-700 mb-2">Experience Level:</h3>
                      <p className="text-gray-800">{analysis.resume_summary.experience_level || 'Not specified'}</p>
                    </div>
                    
                    {analysis.career_insights?.suitable_roles && (
                      <div>
                        <h3 className="font-medium text-gray-700 mb-2">Top Career Matches:</h3>
                        <div className="space-y-2">
                          {analysis.career_insights.suitable_roles.slice(0, 2).map((role, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2 border border-gray-100 rounded-lg">
                              <span className="text-gray-800">{role.role}</span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                role.match_score >= 80 ? "bg-green-100 text-green-800" :
                                role.match_score >= 60 ? "bg-yellow-100 text-yellow-800" :
                                "bg-red-100 text-red-800"
                              }`}>
                                {role.match_score}% match
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="pt-4 border-t border-gray-200">
                      <button
                        onClick={handleViewAnalysis}
                        className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 font-medium transition-all duration-300"
                      >
                        View Complete Analysis Report
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column - Benefits */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Why upload your resume?</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                    <span className="text-blue-600">🎯</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800">Personalized Job Matches</h4>
                    <p className="text-sm text-gray-600">Get job recommendations based on your skills</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                    <span className="text-green-600">📊</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800">Career Insights</h4>
                    <p className="text-sm text-gray-600">Understand your strengths and growth areas</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                    <span className="text-purple-600">🚀</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800">Faster Applications</h4>
                    <p className="text-sm text-gray-600">Apply to jobs with one click using your resume</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                    <span className="text-orange-600">💡</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800">Learning Path</h4>
                    <p className="text-sm text-gray-600">Get recommendations for skills to learn</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white">
              <h3 className="font-semibold mb-3">Need help with your resume?</h3>
              <p className="text-blue-100 mb-4">Create a professional resume with our built-in CV builder</p>
              <button
                onClick={() => window.open("http://localhost:8000/cv_manager/", "_blank")}
                className="w-full bg-white text-blue-600 font-medium py-2 rounded-lg hover:bg-blue-50 transition-colors"
              >
                Open CV Builder
              </button>
            </div>
            
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => navigate("/jobseeker/jobs")}
                  className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center"
                >
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-blue-600">💼</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Browse Jobs</p>
                    <p className="text-sm text-gray-600">Find new opportunities</p>
                  </div>
                </button>
                
                <button
                  onClick={() => navigate("/jobseeker/applications")}
                  className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center"
                >
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-green-600">📝</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">View Applications</p>
                    <p className="text-sm text-gray-600">Track your job applications</p>
                  </div>
                </button>
                
                {analysis && (
                  <button
                    onClick={handleViewAnalysis}
                    className="w-full text-left p-3 border border-blue-200 bg-blue-50 rounded-lg hover:bg-blue-100 flex items-center"
                  >
                    <div className="w-8 h-8 bg-blue-200 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-blue-700">📊</span>
                    </div>
                    <div>
                      <p className="font-medium text-blue-800">View Full Analysis</p>
                      <p className="text-sm text-blue-600">Complete career insights</p>
                    </div>
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

export default JobSeekerUploadResume;