import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getJobDetail, checkApplicationStatus, applyToJob, getAppliedJobs } from "../services/api";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import {
  BriefcaseIcon,
  MapPinIcon,
  CalendarIcon,
  BuildingOfficeIcon,
  ExclamationTriangleIcon,
  CurrencyDollarIcon,
  ClockIcon,
  UserGroupIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  ShareIcon,
  BookmarkIcon,
  BookmarkSlashIcon,
  EyeIcon,
  DocumentArrowUpIcon,
  PaperClipIcon,
  RocketLaunchIcon,
  ArrowPathIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";

function JobDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [applying, setApplying] = useState(false);
  const [quickApplying, setQuickApplying] = useState(false);
  const [deadlinePassed, setDeadlinePassed] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [viewCount, setViewCount] = useState(0);
  const [applicationStatus, setApplicationStatus] = useState(null);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showQuickApplyModal, setShowQuickApplyModal] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [applySuccess, setApplySuccess] = useState(false);
  const [appliedHistory, setAppliedHistory] = useState([]);

  const { role, logout, user } = useAuth();
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  useEffect(() => {
    const fetchJobDetail = async () => {
      try {
        setLoading(true);
        const data = await getJobDetail(id);
        setJob(data);
        
        // Check if deadline has passed
        if (data.application_deadline) {
          const deadline = new Date(data.application_deadline);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          deadline.setHours(23, 59, 59, 999);
          setDeadlinePassed(deadline < today);
        }
        
        // Check if user has already applied
        if (user) {
          try {
            const status = await checkApplicationStatus(id);
            setApplicationStatus(status);
            
            // Fetch application history
            const appliedJobs = await getAppliedJobs();
            const jobHistory = Array.isArray(appliedJobs) 
              ? appliedJobs.filter(job => job.job_id == id)
              : [];
            setAppliedHistory(jobHistory);
          } catch (err) {
            console.log("Could not fetch application status:", err);
          }
        }
        
        // Check if job is bookmarked
        const bookmarks = JSON.parse(localStorage.getItem('bookmarkedJobs') || '[]');
        setIsBookmarked(bookmarks.includes(parseInt(id)));
        
        // Simulate view count
        const views = JSON.parse(localStorage.getItem('jobViews') || '{}');
        const currentViews = views[id] || 0;
        setViewCount(currentViews + 1);
        views[id] = currentViews + 1;
        localStorage.setItem('jobViews', JSON.stringify(views));
        
      } catch (err) {
        console.error("Error fetching job:", err);
        setError(err.message || "Failed to fetch job details.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchJobDetail();
  }, [id, user, applySuccess]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "No deadline specified";
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    }
    
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return "No deadline";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleApply = async () => {
    if (!job || deadlinePassed) return;
    
    // For HR users, show analytics instead
    if (role && role.toLowerCase() === "hr") {
      navigate(`/hr/job/${id}`);
      return;
    }
    
    setApplying(true);
    try {
      navigate(`/apply/${job.id}`);
    } catch (err) {
      console.error(err);
    } finally {
      setApplying(false);
    }
  };

  const handleQuickApply = async () => {
    if (!job || deadlinePassed) return;
    
    // If no resume file selected, show file picker
    if (!resumeFile) {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.pdf,.doc,.docx';
      input.onchange = (e) => {
        if (e.target.files[0]) {
          setResumeFile(e.target.files[0]);
          setShowQuickApplyModal(true);
        }
      };
      input.click();
      return;
    }
    
    setQuickApplying(true);
    try {
      const result = await applyToJob(id, resumeFile);
      
      if (result.status === "success" || result.status === "already_applied") {
        setApplySuccess(true);
        setApplicationStatus({ applied: true });
        
        // Refresh application history
        const appliedJobs = await getAppliedJobs();
        const jobHistory = Array.isArray(appliedJobs) 
          ? appliedJobs.filter(job => job.job_id == id)
          : [];
        setAppliedHistory(jobHistory);
        
        // Close modal after success
        setTimeout(() => {
          setShowQuickApplyModal(false);
          setQuickApplying(false);
        }, 2000);
      }
    } catch (err) {
      console.error("Quick apply error:", err);
      alert("Failed to apply. Please try again.");
    } finally {
      setQuickApplying(false);
    }
  };

  const toggleBookmark = () => {
    const bookmarks = JSON.parse(localStorage.getItem('bookmarkedJobs') || '[]');
    const jobId = parseInt(id);
    
    if (isBookmarked) {
      const newBookmarks = bookmarks.filter(b => b !== jobId);
      localStorage.setItem('bookmarkedJobs', JSON.stringify(newBookmarks));
      setIsBookmarked(false);
    } else {
      bookmarks.push(jobId);
      localStorage.setItem('bookmarkedJobs', JSON.stringify(bookmarks));
      setIsBookmarked(true);
    }
  };

  const shareJob = () => {
    if (navigator.share) {
      navigator.share({
        title: job.title,
        text: `Check out this job opportunity: ${job.title} at ${job.company_name}`,
        url: window.location.href,
      });
    } else {
      setShowShareMenu(!showShareMenu);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Link copied to clipboard!");
    setShowShareMenu(false);
  };

  const getDeadlineStatus = () => {
    if (!job?.application_deadline) return null;
    
    const deadline = new Date(job.application_deadline);
    const today = new Date();
    const timeDiff = deadline.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    const hoursDiff = Math.ceil(timeDiff / (1000 * 3600));
    
    if (daysDiff < 0) {
      return {
        type: "expired",
        message: "Application deadline has passed",
        color: "red",
        icon: "⏰",
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
        textColor: "text-red-700"
      };
    } else if (daysDiff === 0) {
      return {
        type: "today",
        message: hoursDiff <= 24 ? "Closes today!" : "Closes in a few hours",
        color: "orange",
        icon: "⚠️",
        bgColor: "bg-orange-50",
        borderColor: "border-orange-200",
        textColor: "text-orange-700"
      };
    } else if (daysDiff <= 3) {
      return {
        type: "urgent",
        message: `Closes in ${daysDiff} day${daysDiff > 1 ? 's' : ''}`,
        color: "orange",
        icon: "⏳",
        bgColor: "bg-orange-50",
        borderColor: "border-orange-200",
        textColor: "text-orange-700"
      };
    } else if (daysDiff <= 7) {
      return {
        type: "soon",
        message: `Closes in ${daysDiff} days`,
        color: "yellow",
        icon: "📅",
        bgColor: "bg-yellow-50",
        borderColor: "border-yellow-200",
        textColor: "text-yellow-700"
      };
    } else {
      return {
        type: "active",
        message: `Closes in ${daysDiff} days`,
        color: "green",
        icon: "✅",
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
        textColor: "text-green-700"
      };
    }
  };

  const getSalaryRange = () => {
    if (!job.salary_range) return "Salary not specified";
    
    const salary = job.salary_range;
    if (typeof salary === 'string') {
      if (salary.includes('-')) {
        const [min, max] = salary.split('-').map(s => s.trim());
        return `$${parseInt(min).toLocaleString()} - $${parseInt(max).toLocaleString()}`;
      }
      return salary;
    }
    return "Salary not specified";
  };

  const deadlineStatus = getDeadlineStatus();
  const isHR = role && role.toLowerCase() === "hr";
  const hasApplied = applicationStatus?.applied || false;

  // Quick Apply Modal
  const QuickApplyModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">Quick Apply</h3>
          <button
            onClick={() => setShowQuickApplyModal(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        
        {applySuccess ? (
          <div className="text-center py-8">
            <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Application Submitted!</h4>
            <p className="text-gray-600 mb-4">
              Your application for "{job.title}" has been submitted successfully.
            </p>
            <button
              onClick={() => setShowQuickApplyModal(false)}
              className="w-full bg-indigo-600 text-white py-2 rounded-lg font-medium"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Resume File
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                {resumeFile ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <DocumentArrowUpIcon className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="font-medium text-gray-900">{resumeFile.name}</p>
                        <p className="text-sm text-gray-500">
                          {(resumeFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setResumeFile(null)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => document.getElementById('resume-upload').click()}
                    className="text-indigo-600 hover:text-indigo-800"
                  >
                    <DocumentArrowUpIcon className="h-8 w-8 mx-auto mb-2" />
                    <p>Click to upload resume</p>
                    <p className="text-sm text-gray-500 mt-1">PDF, DOC, DOCX (max 5MB)</p>
                  </button>
                )}
                <input
                  id="resume-upload"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={(e) => setResumeFile(e.target.files[0])}
                />
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cover Letter (Optional)
              </label>
              <textarea
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Briefly explain why you're a good fit for this position..."
                className="w-full border border-gray-300 rounded-lg p-3 h-32 resize-none"
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1 text-right">
                {coverLetter.length}/500 characters
              </p>
            </div>
            
            <button
              onClick={handleQuickApply}
              disabled={!resumeFile || quickApplying}
              className={`w-full py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2 ${
                !resumeFile || quickApplying
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600"
              }`}
            >
              {quickApplying ? (
                <>
                  <ArrowPathIcon className="h-5 w-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <RocketLaunchIcon className="h-5 w-5" />
                  Submit Application
                </>
              )}
            </button>
            
            <p className="text-xs text-gray-500 text-center mt-4">
              By submitting, you agree to our Terms and Privacy Policy
            </p>
          </>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar handleLogout={handleLogout} navigate={navigate} />
        <div className="flex-1 p-8 bg-gray-50">
          <div className="max-w-5xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="h-6 bg-gray-300 rounded w-24"></div>
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
                <div className="flex items-center gap-6">
                  <div className="h-20 w-20 bg-gray-300 rounded-xl"></div>
                  <div className="flex-1 space-y-4">
                    <div className="h-8 bg-gray-300 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                    <div className="flex gap-4">
                      <div className="h-6 bg-gray-300 rounded w-24"></div>
                      <div className="h-6 bg-gray-300 rounded w-32"></div>
                    </div>
                  </div>
                  <div className="h-12 bg-gray-300 rounded w-48"></div>
                </div>
              </div>
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-2xl p-6 shadow border border-gray-200">
                  <div className="h-6 bg-gray-300 rounded w-1/3 mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-300 rounded w-full"></div>
                    <div className="h-4 bg-gray-300 rounded w-5/6"></div>
                    <div className="h-4 bg-gray-300 rounded w-4/6"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen">
        <Sidebar handleLogout={handleLogout} navigate={navigate} />
        <div className="flex-1 flex justify-center items-center h-screen bg-gray-50">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-4">😔</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Job Not Found</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="space-y-3">
              <button
                onClick={() => navigate(-1)}
                className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition"
              >
                ← Go Back
              </button>
              <button
                onClick={() => navigate("/jobs")}
                className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition"
              >
                Browse Other Jobs
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!job) return null;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar handleLogout={handleLogout} navigate={navigate} />

      <div className="flex-1 p-4 md:p-6 lg:p-8">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 font-medium transition-colors group"
            >
              <ArrowLeftIcon className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
              Back to Jobs
            </button>
            
            <div className="flex items-center gap-3">
              <div className="relative">
                <button
                  onClick={shareJob}
                  className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  title="Share job"
                >
                  <ShareIcon className="h-5 w-5" />
                </button>
                
                {showShareMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                    <button
                      onClick={copyLink}
                      className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      Copy Link
                    </button>
                    <a
                      href={`mailto:?subject=${encodeURIComponent(job.title)}&body=${encodeURIComponent(`Check out this job: ${window.location.href}`)}`}
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      Share via Email
                    </a>
                  </div>
                )}
              </div>
              
              <button
                onClick={toggleBookmark}
                className="p-2 text-gray-500 hover:text-yellow-500 hover:bg-yellow-50 rounded-lg transition-colors"
                title={isBookmarked ? "Remove bookmark" : "Bookmark job"}
              >
                {isBookmarked ? (
                  <BookmarkSlashIcon className="h-5 w-5 text-yellow-500" />
                ) : (
                  <BookmarkIcon className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* Already Applied Banner */}
          {hasApplied && !deadlinePassed && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 shadow">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex-shrink-0">
                  <div className="p-3 bg-green-100 rounded-xl">
                    <CheckCircleIcon className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-green-800 mb-1">✅ You've Already Applied!</h3>
                  <p className="text-green-700 mb-3">
                    Your application was submitted {appliedHistory.length > 0 && appliedHistory[0].submitted_at 
                      ? `on ${formatDate(appliedHistory[0].submitted_at)}`
                      : "previously"}.
                  </p>
                  
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => setShowQuickApplyModal(true)}
                      className="px-4 py-2 bg-white border-2 border-green-600 text-green-600 rounded-lg font-medium hover:bg-green-50 transition-colors"
                    >
                      <RocketLaunchIcon className="h-4 w-4 inline mr-2" />
                      Apply Again
                    </button>
                    <button
                      onClick={() => navigate("/applications")}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                    >
                      <EyeIcon className="h-4 w-4 inline mr-2" />
                      View Application Status
                    </button>
                    <button
                      onClick={() => navigate("/profile")}
                      className="px-4 py-2 bg-transparent text-green-600 font-medium hover:text-green-800 transition-colors"
                    >
                      Update Profile
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Deadline Warning Banner */}
          {deadlinePassed && (
            <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-2xl p-6 shadow">
              <div className="flex items-start md:items-center gap-4">
                <div className="p-3 bg-red-100 rounded-xl flex-shrink-0">
                  <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-red-800">⚠️ Application Closed</h3>
                  <p className="text-red-600 mt-1">
                    The application deadline for this job has passed on {formatDateTime(job.application_deadline)}. 
                    You can no longer apply for this position.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Job Header */}
          <div className="bg-white shadow-lg rounded-2xl p-6 md:p-8 border border-gray-200">
            <div className="flex flex-col md:flex-row md:items-start gap-6">
              <div className="flex-shrink-0 bg-gradient-to-br from-indigo-100 to-purple-100 p-5 rounded-2xl">
                <BriefcaseIcon className="h-12 w-12 text-indigo-600" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                      {job.title || "N/A"}
                    </h1>
                    <div className="flex items-center flex-wrap gap-4 text-gray-600 mb-4">
                      <div className="flex items-center gap-2">
                        <BuildingOfficeIcon className="h-5 w-5" />
                        <span className="font-medium">{job.company_name || "N/A"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPinIcon className="h-5 w-5" />
                        <span>{job.location || "Remote"}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <EyeIcon className="h-4 w-4" />
                    <span>{viewCount} views</span>
                  </div>
                </div>

                {/* Job Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                      <CalendarIcon className="h-4 w-4" />
                      <span className="text-sm font-medium">Deadline</span>
                    </div>
                    <p className="font-semibold text-gray-900">
                      {formatDateTime(job.application_deadline)}
                    </p>
                    {deadlineStatus && (
                      <p className={`text-sm mt-1 ${deadlineStatus.textColor}`}>
                        {deadlineStatus.icon} {deadlineStatus.message}
                      </p>
                    )}
                  </div>
                  
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                      <CurrencyDollarIcon className="h-4 w-4" />
                      <span className="text-sm font-medium">Salary</span>
                    </div>
                    <p className="font-semibold text-gray-900">{getSalaryRange()}</p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                      <ClockIcon className="h-4 w-4" />
                      <span className="text-sm font-medium">Type</span>
                    </div>
                    <p className="font-semibold text-gray-900">
                      {job.type || job.job_type || "Full-time"}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  {isHR ? (
                    <button
                      onClick={() => navigate(`/hr/job/${id}`)}
                      className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition flex items-center justify-center gap-2"
                    >
                      <UserGroupIcon className="h-5 w-5" />
                      View Applications
                    </button>
                  ) : !deadlinePassed ? (
                    <>
                      <button
                        onClick={handleApply}
                        disabled={applying}
                        className={`flex-1 py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2 ${
                          applying
                            ? "bg-yellow-500 text-white cursor-wait"
                            : deadlineStatus?.type === 'today' || deadlineStatus?.type === 'urgent'
                            ? "bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600"
                            : "bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600"
                        }`}
                      >
                        {applying ? (
                          <>
                            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                            </svg>
                            Processing...
                          </>
                        ) : hasApplied ? (
                          <>
                            <ChatBubbleLeftRightIcon className="h-5 w-5" />
                            Update Application
                          </>
                        ) : (
                          "📝 Detailed Apply"
                        )}
                      </button>
                      
                      <button
                        onClick={() => setShowQuickApplyModal(true)}
                        disabled={quickApplying}
                        className={`px-6 py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2 ${
                          quickApplying
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600"
                        }`}
                      >
                        {quickApplying ? (
                          <>
                            <ArrowPathIcon className="h-5 w-5 animate-spin" />
                            Applying...
                          </>
                        ) : (
                          <>
                            <RocketLaunchIcon className="h-5 w-5" />
                            {hasApplied ? "Apply Again" : "Quick Apply"}
                          </>
                        )}
                      </button>
                    </>
                  ) : null}
                </div>

                {/* Application Tips */}
                {!deadlinePassed && hasApplied && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <p className="text-sm text-blue-700">
                      <strong>Tip:</strong> You can submit multiple applications. Each application will be reviewed separately.
                      Consider updating your resume or adding a new cover letter for better chances.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Stats for Applied Users */}
          {hasApplied && appliedHistory.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white shadow rounded-xl p-4">
                <p className="text-sm text-gray-500">Applications Submitted</p>
                <p className="text-2xl font-bold text-indigo-600">{appliedHistory.length}</p>
              </div>
              <div className="bg-white shadow rounded-xl p-4">
                <p className="text-sm text-gray-500">Last Applied</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatDate(appliedHistory[0].submitted_at)}
                </p>
              </div>
              <div className="bg-white shadow rounded-xl p-4">
                <p className="text-sm text-gray-500">Application Status</p>
                <p className="text-lg font-semibold text-green-600">
                  {appliedHistory[0].status || "Submitted"}
                </p>
              </div>
            </div>
          )}

          {/* Job Details Sections */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <div className="bg-white shadow rounded-2xl p-6 border border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <DocumentTextIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Job Description</h2>
                </div>
                <div className="prose prose-lg max-w-none text-gray-700">
                  {job.description ? (
                    <div className="whitespace-pre-line leading-relaxed">
                      {job.description}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">No description provided.</p>
                  )}
                </div>
              </div>

              <div className="bg-white shadow rounded-2xl p-6 border border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircleIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Requirements</h2>
                </div>
                <div className="prose prose-lg max-w-none text-gray-700">
                  {job.requirements ? (
                    <div className="whitespace-pre-line leading-relaxed">
                      {job.requirements}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">No requirements specified.</p>
                  )}
                </div>
              </div>

              {job.responsibilities && (
                <div className="bg-white shadow rounded-2xl p-6 border border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Responsibilities</h2>
                  <div className="whitespace-pre-line text-gray-700 leading-relaxed">
                    {job.responsibilities}
                  </div>
                </div>
              )}

              {job.benefits && (
                <div className="bg-white shadow rounded-2xl p-6 border border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Benefits & Perks</h2>
                  <div className="whitespace-pre-line text-gray-700 leading-relaxed">
                    {job.benefits}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="bg-white shadow rounded-2xl p-6 border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">About the Company</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <BuildingOfficeIcon className="h-5 w-5 text-gray-500" />
                    <span className="text-gray-700">{job.company_name || "N/A"}</span>
                  </div>
                  {job.company_size && (
                    <div className="flex items-center gap-3">
                      <UserGroupIcon className="h-5 w-5 text-gray-500" />
                      <span className="text-gray-700">{job.company_size} employees</span>
                    </div>
                  )}
                  {job.company_website && (
                    <a
                      href={job.company_website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-indigo-600 hover:text-indigo-800"
                    >
                      🌐 Company Website
                    </a>
                  )}
                </div>
              </div>

              <div className={`rounded-2xl p-6 border ${deadlineStatus?.bgColor || 'bg-indigo-50'} ${deadlineStatus?.borderColor || 'border-indigo-200'}`}>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Application Timeline</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Posted on</span>
                    <span className="font-semibold">{formatDate(job.created_at)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Deadline</span>
                    <span className="font-semibold">{formatDate(job.application_deadline)}</span>
                  </div>
                  <div className="pt-4 border-t border-gray-200">
                    <div className={`text-center font-semibold ${deadlineStatus?.textColor || 'text-indigo-700'}`}>
                      {deadlineStatus?.icon} {deadlineStatus?.message}
                    </div>
                  </div>
                </div>
              </div>

              {hasApplied ? (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Your Application Status</h3>
                  <p className="text-gray-600 mb-4">
                    Track your application progress and get updates.
                  </p>
                  <button
                    onClick={() => navigate("/applications")}
                    className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2"
                  >
                    <EyeIcon className="h-5 w-5" />
                    View Status
                  </button>
                </div>
              ) : (
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Looking for more?</h3>
                  <p className="text-gray-600 mb-4">
                    Discover other opportunities that match your profile.
                  </p>
                  <button
                    onClick={() => navigate("/matches")}
                    className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition"
                  >
                    View Your Matches
                  </button>
                </div>
              )}

              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-3">Need help applying?</h3>
                <p className="text-gray-600 mb-4 text-sm">
                  Our career advisors are here to help you with your application.
                </p>
                <button
                  onClick={() => navigate("/support")}
                  className="w-full text-indigo-600 font-medium hover:text-indigo-800 flex items-center gap-2"
                >
                  <ChatBubbleLeftRightIcon className="h-5 w-5" />
                  Contact Support →
                </button>
              </div>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl p-8 text-white">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-2xl font-bold mb-2">Ready to take the next step?</h3>
                <p className="text-indigo-100">
                  {deadlinePassed 
                    ? "This position is no longer accepting applications, but check out other opportunities!"
                    : hasApplied
                    ? "Want to strengthen your application? Consider applying again with updated materials."
                    : "Submit your application before the deadline."}
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                {deadlinePassed ? (
                  <button
                    onClick={() => navigate("/jobs")}
                    className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition"
                  >
                    Browse Other Jobs
                  </button>
                ) : hasApplied ? (
                  <>
                    <button
                      onClick={() => setShowQuickApplyModal(true)}
                      className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition"
                    >
                      Apply Again
                    </button>
                    <button
                      onClick={() => navigate("/resume-upload")}
                      className="bg-transparent border-2 border-white text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/10 transition"
                    >
                      Update Resume
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleApply}
                      disabled={applying}
                      className={`px-6 py-3 rounded-xl font-semibold transition ${
                        applying
                          ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                          : "bg-white text-indigo-600 hover:bg-gray-100"
                      }`}
                    >
                      {applying ? "Processing..." : "Detailed Apply"}
                    </button>
                    <button
                      onClick={() => setShowQuickApplyModal(true)}
                      className="bg-transparent border-2 border-white text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/10 transition"
                    >
                      Quick Apply
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Apply Modal */}
      {showQuickApplyModal && <QuickApplyModal />}
    </div>
  );
}

export default JobDetailPage;