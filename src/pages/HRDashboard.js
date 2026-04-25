import React, { useState, useEffect, useRef } from "react";
import HRDashboardStats from "./HRDashboardStats";
import HRJobsList from "./HRJobsList";
import HRInterviewsList from "./HRInterviewsList";
import JobModal from "./JobModal";
import InterviewModal from "./InterviewModal";
import ReviewModal from "./ReviewModal";
import { listJobs, getUserInfo } from "../services/api";
import { getHRJobs as fetchHRInterviews } from "../services/interviewApi";
import API from "../services/api";

/* ─────────────────────────── Typewriter Hook ─────────────────────────── */
function useTypewriter(phrases, { typingSpeed = 80, deletingSpeed = 45, pauseMs = 1800 } = {}) {
  const [displayed, setDisplayed] = useState("");
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = phrases[phraseIdx];
    let timeout;

    if (!deleting) {
      if (charIdx < current.length) {
        timeout = setTimeout(() => setCharIdx(i => i + 1), typingSpeed);
      } else {
        timeout = setTimeout(() => setDeleting(true), pauseMs);
      }
    } else {
      if (charIdx > 0) {
        timeout = setTimeout(() => setCharIdx(i => i - 1), deletingSpeed);
      } else {
        setDeleting(false);
        setPhraseIdx(i => (i + 1) % phrases.length);
      }
    }
    setDisplayed(current.slice(0, charIdx));
    return () => clearTimeout(timeout);
  }, [charIdx, deleting, phraseIdx, phrases, typingSpeed, deletingSpeed, pauseMs]);

  return displayed;
}

/* ─────────────────────── Animated Counter Hook ──────────────────────── */
function useCountUp(target, duration = 1200) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    if (target === 0) return;
    const start = performance.now();
    const step = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) ref.current = requestAnimationFrame(step);
    };
    ref.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(ref.current);
  }, [target, duration]);

  return count;
}

/* ─────────────────────────── Stat Card ──────────────────────────────── */
function AnimatedStatCard({ value, label, icon, accent, delay = 0 }) {
  const count = useCountUp(value, 1000);
  return (
    <div
      className="stat-card"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="stat-icon" style={{ background: accent + "22", color: accent }}>
        {icon}
      </div>
      <div className="stat-value" style={{ color: accent }}>{count}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

/* ─────────────────────────── Main Dashboard ─────────────────────────── */
function HRDashboard({ navigate }) {
  const [jobs, setJobs] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [showJobModal, setShowJobModal] = useState(false);
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedJobForInterview, setSelectedJobForInterview] = useState(null);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [editingJob, setEditingJob] = useState(null);
  const [mounted, setMounted] = useState(false);

  const typewriterText = useTypewriter([
    "Streamlining your recruitment pipeline",
    "Connecting talent with opportunity",
    "Empowering smarter hiring decisions",
    "Building teams that shape the future",
    "AI-powered candidate matching at scale",
  ]);

  useEffect(() => {
    fetchDashboardData();
    setTimeout(() => setMounted(true), 100);
  }, []);
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      // 🔥 USER INFO (same as jobseeker dashboard)
      if (token) {
        try {
          const res = await fetch(`${API.BASE_URL}/accounts/dashboard/`, {
            headers: {
              Authorization: `Token ${token}`,
              "Content-Type": "application/json",
            },
          });

          console.log("🔍 User API status:", res.status);

          if (res.ok) {
            const data = await res.json();
            console.log("✅ User API response:", data);

            setCurrentUser({
              name: data.first_name || data.name || "HR User",
              email: data.email || "",
            });
          } else {
            console.log("❌ User API failed");
            setCurrentUser({ name: "HR User", email: "hr@example.com" });
          }
        } catch (err) {
          console.log("❌ User fetch error:", err);
          setCurrentUser({ name: "HR User", email: "hr@example.com" });
        }
      }

      // 🔥 JOBS
      const jobsData = await listJobs();
      console.log("📦 Jobs data:", jobsData);
      setJobs(Array.isArray(jobsData) ? jobsData : []);

      // 🔥 INTERVIEWS
      const interviewsData = await fetchHRInterviews();
      console.log("📦 Interviews data:", interviewsData);
      setInterviews(Array.isArray(interviewsData) ? interviewsData : []);

    } catch (err) {
      console.log("❌ Dashboard error:", err);
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  const handleOpenScheduleInterview = (jobId) => {
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;
    setSelectedJobForInterview(job);
    setShowInterviewModal(true);
  };

  const handleEditJob = (job) => {
    setEditingJob({
      id: job.id,
      title: job.title || "",
      description: job.description || "",
      requirements: job.requirements || "",
      location: job.location || "",
      salary: job.salary || "",
      employment_type: job.employment_type || "",
      experience_level: job.experience_level || "",
      education_required: job.education_required || "",
      company_name: job.company_name || "",
      application_deadline: job.application_deadline || "",
      ranking_config: job.ranking_config || {
        cgpa_weight: 0, skills_weight: 0, experience_weight: 0,
        project_weight: 0, llm_weight: 0, bert_weight: 0,
        custom_model_weight: 0, shortlist_count: 10
      },
      ...job
    });
    setShowJobModal(true);
  };

  const handleCreateJob = () => { setEditingJob(null); setShowJobModal(true); };
  const handleJobModalClose = () => { setShowJobModal(false); setEditingJob(null); };
  const handleJobModalSuccess = () => { setShowJobModal(false); setEditingJob(null); fetchDashboardData(); };

  if (loading) return (
    <>
      <style>{dashboardStyles}</style>
      <div className="hr-loading">
        <div className="hr-spinner" />
        <p className="hr-loading-text">Loading your dashboard…</p>
      </div>
    </>
  );

  const activeJobs = jobs.filter(j => j.status === "active" || !j.status).length;
  const pendingInterviews = interviews.filter(i => i.status === "scheduled").length;
  const completedInterviews = interviews.filter(i => i.status === "completed").length;

  return (
    <>
      <style>{dashboardStyles}</style>

      {/* ── Hero Header ── */}
      <div className={`hr-hero ${mounted ? "hr-hero--visible" : ""}`}>
        {/* Mesh background blobs */}
        <div className="hr-blob hr-blob--1" />
        <div className="hr-blob hr-blob--2" />
        <div className="hr-blob hr-blob--3" />

        {/* Grid pattern overlay */}
        <div className="hr-grid-overlay" />

        <div className="hr-hero-inner">
          <div className="hr-hero-left">
            <div className="hr-badge">
              <span className="hr-badge-dot" />
              HR Manager Portal
            </div>

            <h1 className="hr-hero-title">
              Welcome back,{" "}
              <span className="hr-hero-name">
                {currentUser?.name?.split(" ")[0] || "HR"} 👋
              </span>
            </h1>

            {/* Typewriter line */}
            <div className="hr-typewriter-wrap">
              <span className="hr-typewriter-text">{typewriterText}</span>
              <span className="hr-cursor">|</span>
            </div>

            <p className="hr-hero-sub">
              Manage your jobs, interviews, and candidates all from one place.
            </p>

            {/* Quick action buttons */}
            <div className="hr-actions">
              <button onClick={handleCreateJob} className="hr-btn hr-btn--primary">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Post a Job
              </button>
              <button onClick={() => navigate("/jobs")} className="hr-btn hr-btn--ghost">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 3H8l-2 4h12z"/></svg>
                View All Jobs
              </button>
              <button onClick={() => navigate("/hr/analytics")} className="hr-btn hr-btn--ghost">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                Analytics
              </button>
            </div>
          </div>

          {/* Decorative right side illustration */}
          <div className="hr-hero-right">
            <div className="hr-illustration">
              <div className="hr-ill-circle hr-ill-circle--outer" />
              <div className="hr-ill-circle hr-ill-circle--mid" />
              <div className="hr-ill-circle hr-ill-circle--inner" />
              <div className="hr-ill-node hr-ill-node--1">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
              <div className="hr-ill-node hr-ill-node--2">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
              </div>
              <div className="hr-ill-node hr-ill-node--3">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              </div>
              <div className="hr-ill-node hr-ill-node--4">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
              </div>
              {/* Center icon */}
              <div className="hr-ill-center">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="hr-main">

        {/* Error banner */}
        {error && (
          <div className="hr-error">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            {error}
            <button onClick={fetchDashboardData} className="hr-error-retry">Retry</button>
          </div>
        )}

        {/* ── Quick Stats ── */}
        <div className="hr-stats-section">
          <h2 className="hr-section-title">
            <span className="hr-section-accent" />
            At a Glance
          </h2>
          <div className="hr-stats-grid">
            <AnimatedStatCard value={jobs.length} label="Total Jobs" accent="#6366f1"
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 3H8l-2 4h12z"/></svg>}
            />
            <AnimatedStatCard value={activeJobs} label="Active Listings" accent="#10b981" delay={100}
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>}
            />
            <AnimatedStatCard value={interviews.length} label="Total Interviews" accent="#f59e0b" delay={200}
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>}
            />
            <AnimatedStatCard value={pendingInterviews} label="Scheduled" accent="#8b5cf6" delay={300}
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>}
            />
            <AnimatedStatCard value={completedInterviews} label="Completed" accent="#06b6d4" delay={400}
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>}
            />
          </div>
        </div>

        {/* ── Jobs Section ── */}
        <div className="hr-section-wrap">
          <div className="hr-section-header">
            <h2 className="hr-section-title">
              <span className="hr-section-accent" style={{ background: "#10b981" }} />
              Job Listings
            </h2>
            <button onClick={handleCreateJob} className="hr-btn hr-btn--sm hr-btn--primary">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              New Job
            </button>
          </div>
          <div className="hr-card">
            <HRJobsList
              jobs={jobs}
              onEditJob={handleEditJob}
              onCreateJob={handleCreateJob}
              onViewJob={(jobId) => navigate(`/jobs/${jobId}`)}
              onScheduleInterview={handleOpenScheduleInterview}
              onDeleteJob={() => fetchDashboardData()}
            />
          </div>
        </div>

        {/* ── Interviews Section ── */}
        <div className="hr-section-wrap">
          <div className="hr-section-header">
            <h2 className="hr-section-title">
              <span className="hr-section-accent" style={{ background: "#f59e0b" }} />
              Interviews
            </h2>
          </div>
          <div className="hr-card">
            <HRInterviewsList
              interviews={interviews}
              onReviewInterview={(id) => { setSelectedInterview(id); setShowReviewModal(true); }}
              onFinalizeInterview={() => fetchDashboardData()}
              onAddQuestions={(id) => navigate(`/hr/interview/${id}/add-questions`)}
              onViewResult={(id) => navigate(`/hr/interview/${id}/answers`)}
              onMonitorInterview={(id) => navigate(`/interview/${id}/monitor`)}
              onEndInterview={() => fetchDashboardData()}
              onCancelInterview={() => fetchDashboardData()}
              onMarkNoShow={() => fetchDashboardData()}
              onRescheduleInterview={(jobId) => handleOpenScheduleInterview(jobId)}
            />
          </div>
        </div>

      </div>

      {/* ── Modals ── */}
      {showJobModal && (
        <JobModal initialJob={editingJob} onClose={handleJobModalClose} onSuccess={handleJobModalSuccess} />
      )}
      {showInterviewModal && selectedJobForInterview && (
        <InterviewModal
          job={selectedJobForInterview}
          onClose={() => { setShowInterviewModal(false); setSelectedJobForInterview(null); }}
          onSuccess={() => { setShowInterviewModal(false); setSelectedJobForInterview(null); fetchDashboardData(); }}
        />
      )}
      {showReviewModal && selectedInterview && (
        <ReviewModal
          interviewId={selectedInterview}
          onClose={() => { setShowReviewModal(false); setSelectedInterview(null); }}
          onFinalize={() => { setShowReviewModal(false); setSelectedInterview(null); fetchDashboardData(); }}
        />
      )}
    </>
  );
}

/* ─────────────────────────── Styles ─────────────────────────────────── */
const dashboardStyles = `
  /* ── Loading ── */
  .hr-loading {
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; min-height: 60vh; gap: 20px;
  }
  .hr-spinner {
    width: 44px; height: 44px;
    border: 3px solid #e0e7ff;
    border-top-color: #6366f1;
    border-radius: 50%;
    animation: hr-spin 0.8s linear infinite;
  }
  .hr-loading-text {
    color: #6366f1; font-size: 15px; font-weight: 500;
    letter-spacing: 0.3px;
  }
  @keyframes hr-spin { to { transform: rotate(360deg); } }

  /* ── Hero ── */
  .hr-hero {
    position: relative; overflow: hidden;
    background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
    padding: 56px 40px 64px;
    opacity: 0; transform: translateY(16px);
    transition: opacity 0.6s ease, transform 0.6s ease;
  }
  .hr-hero--visible { opacity: 1; transform: translateY(0); }

  /* Mesh blobs */
  .hr-blob {
    position: absolute; border-radius: 50%;
    filter: blur(80px); opacity: 0.35; pointer-events: none;
  }
  .hr-blob--1 {
    width: 500px; height: 500px;
    background: radial-gradient(circle, #6366f1, transparent);
    top: -160px; left: -80px;
    animation: hr-drift 12s ease-in-out infinite alternate;
  }
  .hr-blob--2 {
    width: 400px; height: 400px;
    background: radial-gradient(circle, #8b5cf6, transparent);
    bottom: -120px; right: 10%;
    animation: hr-drift 15s ease-in-out infinite alternate-reverse;
  }
  .hr-blob--3 {
    width: 300px; height: 300px;
    background: radial-gradient(circle, #06b6d4, transparent);
    top: 30%; right: 30%;
    animation: hr-drift 18s ease-in-out infinite alternate;
  }
  @keyframes hr-drift {
    0% { transform: translate(0,0) scale(1); }
    100% { transform: translate(30px,20px) scale(1.08); }
  }

  /* Grid overlay */
  .hr-grid-overlay {
    position: absolute; inset: 0; pointer-events: none;
    background-image:
      linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px);
    background-size: 40px 40px;
  }

  /* Hero inner layout */
  .hr-hero-inner {
    position: relative; z-index: 1;
    display: flex; align-items: center; gap: 48px; max-width: 1100px; margin: 0 auto;
  }
  .hr-hero-left { flex: 1; min-width: 0; }

  /* Badge */
  .hr-badge {
    display: inline-flex; align-items: center; gap: 8px;
    background: rgba(99,102,241,0.25);
    border: 1px solid rgba(99,102,241,0.5);
    color: #a5b4fc;
    padding: 5px 14px; border-radius: 100px;
    font-size: 12.5px; font-weight: 600;
    letter-spacing: 0.5px; text-transform: uppercase;
    margin-bottom: 20px;
  }
  .hr-badge-dot {
    width: 7px; height: 7px; border-radius: 50%;
    background: #6ee7b7;
    box-shadow: 0 0 0 3px rgba(110,231,183,0.3);
    animation: hr-pulse 2s infinite;
  }
  @keyframes hr-pulse {
    0%,100% { box-shadow: 0 0 0 3px rgba(110,231,183,0.3); }
    50% { box-shadow: 0 0 0 6px rgba(110,231,183,0.1); }
  }

  /* Title */
  .hr-hero-title {
    font-size: clamp(26px, 4vw, 40px);
    font-weight: 800; color: #fff;
    line-height: 1.2; margin: 0 0 16px;
    letter-spacing: -0.5px;
  }
  .hr-hero-name {
    background: linear-gradient(90deg, #a5b4fc, #67e8f9);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  /* Typewriter */
  .hr-typewriter-wrap {
    display: flex; align-items: center; gap: 2px;
    min-height: 32px; margin-bottom: 18px;
  }
  .hr-typewriter-text {
    font-size: 17px; color: #c7d2fe;
    font-weight: 400; letter-spacing: 0.2px;
  }
  .hr-cursor {
    color: #818cf8; font-size: 20px; font-weight: 300;
    animation: hr-blink 1s step-start infinite;
    line-height: 1;
  }
  @keyframes hr-blink { 0%,100% { opacity:1; } 50% { opacity:0; } }

  .hr-hero-sub {
    color: #94a3b8; font-size: 14.5px; margin-bottom: 32px; line-height: 1.6;
  }

  /* Action buttons */
  .hr-actions { display: flex; flex-wrap: wrap; gap: 12px; }

  .hr-btn {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 10px 20px; border-radius: 10px;
    font-size: 14px; font-weight: 600; cursor: pointer;
    border: none; transition: all 0.2s ease;
    letter-spacing: 0.2px; text-decoration: none;
  }
  .hr-btn--primary {
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    color: #fff;
    box-shadow: 0 4px 16px rgba(99,102,241,0.4);
  }
  .hr-btn--primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(99,102,241,0.5);
  }
  .hr-btn--ghost {
    background: rgba(255,255,255,0.08);
    color: #c7d2fe;
    border: 1px solid rgba(255,255,255,0.15);
    backdrop-filter: blur(4px);
  }
  .hr-btn--ghost:hover {
    background: rgba(255,255,255,0.14);
    transform: translateY(-2px);
  }
  .hr-btn--sm { padding: 7px 14px; font-size: 13px; border-radius: 8px; }

  /* Hero right: illustration */
  .hr-hero-right {
    flex-shrink: 0; width: 260px; height: 260px;
    display: flex; align-items: center; justify-content: center;
  }
  @media (max-width: 768px) { .hr-hero-right { display: none; } }

  .hr-illustration {
    position: relative; width: 220px; height: 220px;
  }
  .hr-ill-circle {
    position: absolute; border-radius: 50%;
    border: 1px solid rgba(165,180,252,0.2);
    top: 50%; left: 50%; transform: translate(-50%,-50%);
  }
  .hr-ill-circle--outer { width: 220px; height: 220px; animation: hr-rotate 30s linear infinite; }
  .hr-ill-circle--mid  { width: 160px; height: 160px; animation: hr-rotate 20s linear infinite reverse; }
  .hr-ill-circle--inner{ width: 96px;  height: 96px;  border-color: rgba(165,180,252,0.35); }
  @keyframes hr-rotate { to { transform: translate(-50%,-50%) rotate(360deg); } }

  .hr-ill-center {
    position: absolute; top: 50%; left: 50%;
    transform: translate(-50%,-50%);
    width: 68px; height: 68px;
    background: linear-gradient(135deg, rgba(99,102,241,0.6), rgba(139,92,246,0.6));
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    color: #e0e7ff;
    box-shadow: 0 0 30px rgba(99,102,241,0.4);
    backdrop-filter: blur(8px);
  }

  .hr-ill-node {
    position: absolute; width: 44px; height: 44px;
    background: rgba(30,27,75,0.8);
    border: 1px solid rgba(165,180,252,0.3);
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    color: #a5b4fc;
    backdrop-filter: blur(6px);
    animation: hr-node-float 4s ease-in-out infinite;
  }
  .hr-ill-node--1 { top:  0%;  left: 50%; transform: translate(-50%, 0); }
  .hr-ill-node--2 { top: 50%; right:  0%; transform: translate(0,-50%); animation-delay: 1s; }
  .hr-ill-node--3 { bottom: 0%; left: 50%; transform: translate(-50%,0); animation-delay: 2s; }
  .hr-ill-node--4 { top: 50%; left:  0%; transform: translate(0,-50%); animation-delay: 3s; }
  @keyframes hr-node-float {
    0%,100% { box-shadow: 0 0 12px rgba(99,102,241,0.3); }
    50% { box-shadow: 0 0 24px rgba(99,102,241,0.6); }
  }

  /* ── Main content area ── */
  .hr-main {
    max-width: 1100px; margin: 0 auto;
    padding: 40px 32px 80px;
  }

  /* ── Error banner ── */
  .hr-error {
    display: flex; align-items: center; gap: 10px;
    background: #fef2f2; border: 1px solid #fca5a5;
    color: #b91c1c; border-radius: 10px;
    padding: 12px 18px; margin-bottom: 28px;
    font-size: 14px; font-weight: 500;
  }
  .hr-error-retry {
    margin-left: auto; background: none; border: 1px solid #f87171;
    color: #b91c1c; cursor: pointer; border-radius: 6px;
    padding: 4px 12px; font-size: 13px; font-weight: 600;
    transition: background 0.15s;
  }
  .hr-error-retry:hover { background: #fee2e2; }

  /* ── Stats ── */
  .hr-stats-section { margin-bottom: 48px; }
  .hr-stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 16px; margin-top: 20px;
  }

  .stat-card {
    background: #fff;
    border: 1px solid #e8eaf6;
    border-radius: 16px;
    padding: 20px;
    display: flex; flex-direction: column; align-items: flex-start; gap: 10px;
    animation: hr-card-in 0.5s ease both;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  }
  .stat-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(0,0,0,0.08);
  }
  @keyframes hr-card-in {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .stat-icon {
    width: 40px; height: 40px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
  }
  .stat-value {
    font-size: 30px; font-weight: 800; line-height: 1;
    letter-spacing: -1px;
  }
  .stat-label {
    font-size: 12.5px; color: #94a3b8;
    font-weight: 600; letter-spacing: 0.3px; text-transform: uppercase;
  }

  /* ── Sections ── */
  .hr-section-wrap { margin-bottom: 40px; }
  .hr-section-header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 16px;
  }
  .hr-section-title {
    display: flex; align-items: center; gap: 10px;
    font-size: 18px; font-weight: 700; color: #1e293b; margin: 0;
  }
  .hr-section-accent {
    display: block; width: 4px; height: 20px;
    background: #6366f1; border-radius: 4px;
  }

  /* ── Content card ── */
  .hr-card {
    background: #fff;
    border: 1px solid #e8eaf6;
    border-radius: 16px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.04);
    overflow: hidden;
    transition: box-shadow 0.2s ease;
  }
  .hr-card:hover {
    box-shadow: 0 6px 24px rgba(0,0,0,0.07);
  }
`;

export default HRDashboard;