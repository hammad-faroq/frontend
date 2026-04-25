import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import API from "../services/api";
import toast from "react-hot-toast";
import {
  listJobs,
  getAppliedJobs,
  getResumeAnalysis,
  getInterviewPreparation,
  generateMoreQuestions,
  sendMockInterviewMessage,
  getSimilarJobs
} from "../services/api";
import { useNavigate } from "react-router-dom";
import {
  ArrowPathIcon,
  DocumentArrowUpIcon,
  BriefcaseIcon,
  ChatBubbleLeftRightIcon,
  UserIcon,
  SparklesIcon,
  CheckCircleIcon,
  CalendarIcon,
  AcademicCapIcon,
  EyeIcon,
  BoltIcon,
  CpuChipIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";

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
function useCountUp(target, duration = 1000) {
  const [count, setCount] = useState(0);
  const rafRef = useRef(null);
  useEffect(() => {
    if (target === 0) { setCount(0); return; }
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setCount(Math.floor(e * target));
      if (p < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);
  return count;
}

/* ─────────────────────────── Stat Card ──────────────────────────────── */
function AnimatedStatCard({ value, label, subtitle, icon: Icon, accent, onClick, delay = 0 }) {
  const count = useCountUp(value, 900);
  return (
    <div className="js-stat-card" style={{ animationDelay: `${delay}ms` }} onClick={onClick}>
      <div className="js-stat-top">
        <div className="js-stat-texts">
          <p className="js-stat-label">{label}</p>
          <p className="js-stat-value" style={{ color: accent }}>{count}</p>
          <p className="js-stat-sub">{subtitle}</p>
        </div>
        <div className="js-stat-icon" style={{ background: accent + "22", color: accent }}>
          <Icon style={{ width: 28, height: 28 }} />
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────── Main Dashboard ─────────────────────────── */
function JobSeekerDashboard() {
  const [jobs, setJobs] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [interviewPrep, setInterviewPrep] = useState([]);
  const [loading, setLoading] = useState({ page: true, interviewPrep: false });
  const [error, setError] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [matchedJobs, setMatchedJobs] = useState([]);
  const [userName, setUserName] = useState("");
  const [lastUpdatedText, setLastUpdatedText] = useState("");
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();

  const typewriterText = useTypewriter([
    "Find your dream job today",
    "AI-powered career matching for you",
    "Land interviews with top companies",
    "Your next opportunity is one click away",
    "Prepare smarter. Interview better. Get hired.",
  ]);

  const fetchDashboardData = useCallback(async () => {
  try {
    setLoading((prev) => ({ ...prev, page: true }));
    setError("");

    const token = localStorage.getItem("token");

    if (!token) {
      setError("Please login to continue");
      return;
    }

    /* ---------------- USER INFO ---------------- */
    try {
      const res = await fetch(`${API.BASE_URL}/accounts/dashboard/`, {
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (res.ok) {
        const data = await res.json();
        setUserName(data.first_name || data.name || "");
      }
    } catch (err) {
      console.log(err);
    }

    /* ---------------- JOBS + APPLICATIONS ---------------- */
    const [jobsData, appliedData] = await Promise.all([
      listJobs().catch(() => []),
      getAppliedJobs().catch(() => []),
    ]);

    setJobs(Array.isArray(jobsData) ? jobsData : []);
    setAppliedJobs(Array.isArray(appliedData) ? appliedData : []);

    /* ---------------- ANALYSIS + MATCHES ---------------- */
    Promise.allSettled([
      getResumeAnalysis().catch(() => null),
      getSimilarJobs().catch(() => ({ matched_jobs: [] })),
    ]).then(([analysisResult, similarJobsResult]) => {
      if (analysisResult.status === "fulfilled") {
        setAnalysis(analysisResult.value || null);
      }

      if (similarJobsResult.status === "fulfilled") {
        setMatchedJobs(
          similarJobsResult.value.matched_jobs || []
        );
      }
    });

    /* ---------------- INTERVIEW PREP CACHE ---------------- */
    setLoading((prev) => ({ ...prev, interviewPrep: true }));

    try {
      const cachedData = localStorage.getItem(
        "interview_prep_cache"
      );

      const cacheTime = localStorage.getItem(
        "interview_prep_timestamp"
      );

      const age = cacheTime
        ? Date.now() - parseInt(cacheTime)
        : Infinity;

      const TWENTY_MINUTES = 1000 * 60 * 20;
      const THIRTY_MINUTES = 1000 * 60 * 30;

      /* PAGE LOAD:
         Use cache if under 30 mins */
      if (cachedData && age < THIRTY_MINUTES) {
        setInterviewPrep(JSON.parse(cachedData));
        updateLastUpdated();
      } else {
        const response = await getInterviewPreparation();

        if (response?.data) {
          setInterviewPrep(response.data);

          localStorage.setItem(
            "interview_prep_cache",
            JSON.stringify(response.data)
          );

          localStorage.setItem(
            "interview_prep_timestamp",
            Date.now().toString()
          );

          updateLastUpdated();
        }
      }

      /* AUTO REFRESH AFTER 20 MINUTES */
      if (age >= TWENTY_MINUTES) {
        const freshResponse =
          await getInterviewPreparation();

        if (freshResponse?.data) {
          setInterviewPrep(freshResponse.data);

          localStorage.setItem(
            "interview_prep_cache",
            JSON.stringify(freshResponse.data)
          );

          localStorage.setItem(
            "interview_prep_timestamp",
            Date.now().toString()
          );

          updateLastUpdated();
        }
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading((prev) => ({
        ...prev,
        interviewPrep: false,
      }));
    }

    setRefreshing(false);
  } catch (error) {
    console.log(error);
    setError("Failed to load dashboard");
  } finally {
    setLoading((prev) => ({
      ...prev,
      page: false,
    }));
  }
}, []);

  const updateLastUpdated = () => {
    const cacheTime = localStorage.getItem("interview_prep_timestamp");
    if (!cacheTime) { setLastUpdatedText("Never updated"); return; }
    const minutes = Math.floor((Date.now() - parseInt(cacheTime)) / 60000);
    setLastUpdatedText(minutes < 1 ? "Just now" : `${minutes} min ago`);
  };

  const refreshInterviewPrepOnly = async () => {
    setLoading(prev => ({ ...prev, interviewPrep: true }));
    try {
      const cached = localStorage.getItem("interview_prep_cache");
      const cacheTime = localStorage.getItem("interview_prep_timestamp");
      const age = cacheTime ? Date.now() - parseInt(cacheTime) : Infinity;
      if (cached) { setInterviewPrep(JSON.parse(cached)); updateLastUpdated(); }
      if (!cached || age >= 1000 * 60 * 30) {
        const response = await getInterviewPreparation();
        if (response?.data) {
          setInterviewPrep(response.data);
          localStorage.setItem("interview_prep_cache", JSON.stringify(response.data));
          localStorage.setItem("interview_prep_timestamp", Date.now().toString());
          updateLastUpdated();
        }
      }
    } catch (error) {} finally {
      setLoading(prev => ({ ...prev, interviewPrep: false }));
    }
  };

  const handleGenerateMoreQuestions = async (jobId) => {
    try {
      setInterviewPrep(prev => prev.map(p => p.job_id === jobId ? { ...p, generating: true } : p));
      const result = await generateMoreQuestions(jobId);
      if (result?.message === "More questions generated successfully") {
        if (result.new_questions) {
          setInterviewPrep(prev => prev.map(p => {
            if (p.job_id !== jobId) return p;
            return {
              ...p, generating: false, updated: true,
              interview_preparation: {
                ...p.interview_preparation,
                technical_questions: [...(p.interview_preparation?.technical_questions || []), ...(result.new_questions.technical_questions || [])],
                behavioral_questions: [...(p.interview_preparation?.behavioral_questions || []), ...(result.new_questions.behavioral_questions || [])]
              }
            };
          }));
          const t = result.new_questions.technical_questions?.length || 0;
          const b = result.new_questions.behavioral_questions?.length || 0;
          toast.success(`Generated ${t} technical and ${b} behavioral questions!`);
        } else {
          refreshInterviewPrepOnly();
          toast.success("Generated more interview questions!");
        }
      }
    } catch (error) {
      toast.error("Daily limit reached. Try again tomorrow.");
      setInterviewPrep(prev => prev.map(p => p.job_id === jobId ? { ...p, generating: false } : p));
    }
  };

  const handleMockInterview = (jobId) => {
    const job = interviewPrep.find(p => p.job_id === jobId);
    if (!job) return;
    let userAnswer = "";
    toast.custom((t) => (
      <div style={{ width: 360, background: "#fff", borderRadius: 16, boxShadow: "0 20px 60px rgba(0,0,0,.18)", border: "1px solid #e5e7eb", padding: 16 }}>
        <div style={{ marginBottom: 12 }}>
          <h3 style={{ margin: 0, fontWeight: 700, color: "#111827" }}>Mock Interview</h3>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "#6b7280" }}>{job.job_title} · {job.company}</p>
        </div>
        <textarea
          style={{ width: "100%", height: 120, padding: 12, borderRadius: 10, border: "1px solid #e5e7eb", background: "#f9fafb", fontSize: 13, color: "#1f2937", resize: "none", outline: "none", boxSizing: "border-box" }}
          placeholder="Type your answer here..."
          onChange={(e) => (userAnswer = e.target.value)}
        />
        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <button style={{ flex: 1, padding: "8px 0", borderRadius: 8, border: "1px solid #e5e7eb", background: "#f3f4f6", color: "#374151", cursor: "pointer", fontWeight: 600, fontSize: 13 }} onClick={() => toast.dismiss(t.id)}>Cancel</button>
          <button
            style={{ flex: 1, padding: "8px 0", borderRadius: 8, border: "none", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff", cursor: "pointer", fontWeight: 600, fontSize: 13 }}
            onClick={async () => {
              if (!userAnswer.trim()) { toast.error("Please write an answer"); return; }
              try {
                toast.loading("Sending...", { id: t.id });
                const response = await sendMockInterviewMessage(jobId, userAnswer);
                toast.dismiss(t.id);
                toast.success(response?.reply || "Response received!");
              } catch { toast.dismiss(t.id); toast.error("Failed to send message"); }
            }}
          >Send</button>
        </div>
      </div>
    ), { duration: Infinity });
  };

  useEffect(() => { fetchDashboardData(); setTimeout(() => setMounted(true), 100); }, [fetchDashboardData]);

  const quickActions = useMemo(() => [
    { title: "Upload Resume", desc: "Get personalized insights", icon: DocumentArrowUpIcon, accent: "#3b82f6", bg: "linear-gradient(135deg,#1d4ed8,#2563eb)", action: () => navigate("/jobseeker/upload-resume"), count: null },
    { title: "Browse Jobs", desc: "Find your next opportunity", icon: BriefcaseIcon, accent: "#10b981", bg: "linear-gradient(135deg,#059669,#10b981)", action: () => navigate("/jobseeker/jobs"), count: jobs.length },
    { title: "Job Matches", desc: "AI-powered recommendations", icon: SparklesIcon, accent: "#6366f1", bg: "linear-gradient(135deg,#4f46e5,#6366f1)", action: () => navigate("/matches"), count: matchedJobs.length },
    { title: "Interview Prep", desc: "AI-generated questions", icon: ChatBubbleLeftRightIcon, accent: "#8b5cf6", bg: "linear-gradient(135deg,#7c3aed,#8b5cf6)", action: () => navigate("/jobseeker/interview-prep"), count: interviewPrep.length },
    { title: "My Profile", desc: "View and edit profile", icon: UserIcon, accent: "#f59e0b", bg: "linear-gradient(135deg,#d97706,#f59e0b)", action: () => navigate("/profile"), count: null },
  ], [jobs.length, matchedJobs.length, interviewPrep.length, navigate]);

  const stats = useMemo(() => [
    { label: "Applied Jobs", value: appliedJobs.length, subtitle: "Total applications", icon: CheckCircleIcon, accent: "#3b82f6", link: "/jobseeker/applications" },
    { label: "Interviews", value: interviews.filter(i => i.status === "scheduled").length, subtitle: "Scheduled sessions", icon: CalendarIcon, accent: "#10b981", link: "/jobseeker/interviews" },
    { label: "Prep Sessions", value: interviewPrep.length, subtitle: "Jobs prepared for", icon: AcademicCapIcon, accent: "#8b5cf6", link: "/jobseeker/interview-prep" },
    { label: "Job Matches", value: matchedJobs.length, subtitle: "Personalized matches", icon: SparklesIcon, accent: "#6366f1", link: "/matches" },
  ], [appliedJobs.length, interviews, interviewPrep.length, matchedJobs.length]);

  const careerTips = [
    { icon: "🎯", title: "Tailor Your Resume", tip: "Customize for each job application to highlight relevant skills." },
    { icon: "🤝", title: "Network Actively", tip: "Connect with professionals on LinkedIn and attend industry events." },
    { icon: "📚", title: "Keep Learning", tip: "Take online courses to stay updated with the latest industry trends." },
    { icon: "💬", title: "Practice Interviews", tip: "Use our mock interview feature to build confidence before the real thing." },
  ];

  if (loading.page) return (
    <>
      <style>{jsStyles}</style>
      <div className="js-loading">
        <div className="js-spinner" />
        <p className="js-loading-text">Loading your dashboard…</p>
      </div>
    </>
  );

  if (error) return (
    <>
      <style>{jsStyles}</style>
      <div className="js-error-screen">
        <div className="js-error-icon">
          <ExclamationTriangleIcon style={{ width: 40, height: 40, color: "#dc2626" }} />
        </div>
        <h3 className="js-error-title">Something went wrong</h3>
        <p className="js-error-msg">{error}</p>
        <div className="js-error-btns">
          <button onClick={fetchDashboardData} className="js-btn js-btn--primary">Try Again</button>
          <button onClick={() => navigate("/login")} className="js-btn js-btn--outline">Back to Login</button>
        </div>
      </div>
    </>
  );

  const scheduledCount = interviews.filter(i => i.status === "scheduled").length;

  return (
    <>
      <style>{jsStyles}</style>

      {/* ── Hero Section ── */}
      <div className={`js-hero ${mounted ? "js-hero--visible" : ""}`}>
        <div className="js-blob js-blob--1" />
        <div className="js-blob js-blob--2" />
        <div className="js-blob js-blob--3" />
        <div className="js-grid-overlay" />

        <div className="js-hero-inner">
          <div className="js-hero-left">
            <div className="js-badge">
              <span className="js-badge-dot" />
              Job Seeker Portal
            </div>

            <h1 className="js-hero-title">
              Welcome back,{" "}
              <span className="js-hero-name">
                {userName ? userName.split(" ")[0] : "Explorer"} 👋
              </span>
            </h1>

            <div className="js-typewriter-wrap">
              <span className="js-typewriter-text">{typewriterText}</span>
              <span className="js-cursor">|</span>
            </div>

            <p className="js-hero-sub">
              Your AI-powered career hub — jobs, interviews, and insights all in one place.
            </p>

            <div className="js-hero-actions">
              <button onClick={() => navigate("/matches")} className="js-btn js-btn--primary">
                <SparklesIcon style={{ width: 16, height: 16 }} />
                View My Matches
              </button>
              <button onClick={() => navigate("/jobseeker/jobs")} className="js-btn js-btn--ghost">
                <BriefcaseIcon style={{ width: 16, height: 16 }} />
                Browse Jobs
              </button>
              <button
                onClick={() => { setRefreshing(true); fetchDashboardData(); }}
                disabled={refreshing}
                className="js-btn js-btn--ghost"
              >
                <ArrowPathIcon style={{ width: 16, height: 16, animation: refreshing ? "js-spin .8s linear infinite" : "none" }} />
                {refreshing ? "Refreshing…" : "Refresh"}
              </button>
            </div>
          </div>

          {/* Orbital illustration — career-themed nodes */}
          <div className="js-hero-right">
            <div className="js-illustration">
              <div className="js-ill-ring js-ring--outer" />
              <div className="js-ill-ring js-ring--mid" />
              <div className="js-ill-ring js-ring--inner" />
              <div className="js-ill-node js-node--1">
                <BriefcaseIcon style={{ width: 20, height: 20 }} />
              </div>
              <div className="js-ill-node js-node--2">
                <SparklesIcon style={{ width: 20, height: 20 }} />
              </div>
              <div className="js-ill-node js-node--3">
                <AcademicCapIcon style={{ width: 20, height: 20 }} />
              </div>
              <div className="js-ill-node js-node--4">
                <CheckCircleIcon style={{ width: 20, height: 20 }} />
              </div>
              <div className="js-ill-center">
                <UserIcon style={{ width: 34, height: 34 }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="js-main">

        {/* ── Stats Row ── */}
        <section className="js-section">
          <div className="js-section-header">
            <h2 className="js-section-title">
              <span className="js-section-accent" />
              Your Career Overview
            </h2>
            <span className="js-section-sub">Real-time metrics</span>
          </div>
          <div className="js-stats-grid">
            {stats.map((s, i) => (
              <AnimatedStatCard key={i} {...s} delay={i * 90} onClick={() => navigate(s.link)} />
            ))}
          </div>
        </section>

        {/* ── Quick Actions ── */}
        <section className="js-section">
          <div className="js-section-header">
            <h2 className="js-section-title">
              <span className="js-section-accent" style={{ background: "#10b981" }} />
              Quick Actions
            </h2>
            <span className="js-section-sub">Get started with these tools</span>
          </div>
          <div className="js-actions-grid">
            {quickActions.map((action, i) => (
              <button key={i} onClick={action.action} className="js-action-card" style={{ background: action.bg, animationDelay: `${i * 70}ms` }}>
                <div className="js-action-top">
                  <div className="js-action-icon">
                    <action.icon style={{ width: 20, height: 20 }} />
                  </div>
                  <div className="js-action-texts">
                    <div className="js-action-title-row">
                      <span className="js-action-title">{action.title}</span>
                      {action.count !== null && (
                        <span className="js-action-badge">{action.count}</span>
                      )}
                    </div>
                    <p className="js-action-desc">{action.desc}</p>
                  </div>
                </div>
                <div className="js-action-cta">
                  Get Started
                  <ChevronRightIcon style={{ width: 13, height: 13 }} />
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* ── Career Tips ── */}
        <section className="js-section">
          <div className="js-section-header">
            <h2 className="js-section-title">
              <span className="js-section-accent" style={{ background: "#f59e0b" }} />
              Career Tips
            </h2>
            <span className="js-section-sub">Boost your job search</span>
          </div>
          <div className="js-tips-grid">
            {careerTips.map((tip, i) => (
              <div key={i} className="js-tip-card" style={{ animationDelay: `${i * 80}ms` }}>
                <div className="js-tip-icon">{tip.icon}</div>
                <h3 className="js-tip-title">{tip.title}</h3>
                <p className="js-tip-body">{tip.tip}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Main Grid: Interview Prep + Upcoming ── */}
        <section className="js-section">
          <div className="js-two-col">

            {/* Interview Prep */}
            <div className="js-card js-card--large">
              <div className="js-card-header">
                <div>
                  <h2 className="js-card-title">Interview Preparation</h2>
                  <p className="js-card-sub">Practice with AI-generated questions</p>
                </div>
                <div className="js-card-actions">
                  <button onClick={refreshInterviewPrepOnly} disabled={loading.interviewPrep} className="js-icon-btn">
                    <ArrowPathIcon style={{ width: 15, height: 15, animation: loading.interviewPrep ? "js-spin .8s linear infinite" : "none" }} />
                    {loading.interviewPrep ? "Loading…" : "Refresh"}
                  </button>
                  <span className="js-timestamp">{lastUpdatedText}</span>
                  <button onClick={() => navigate("/jobseeker/interview-prep")} className="js-pill-btn" style={{ background: "#f3e8ff", color: "#7c3aed" }}>
                    <EyeIcon style={{ width: 14, height: 14 }} />
                    View All
                  </button>
                </div>
              </div>

              {interviewPrep.length === 0 ? (
                <div className="js-empty">
                  <div className="js-empty-icon" style={{ background: "#f3e8ff" }}>
                    <ChatBubbleLeftRightIcon style={{ width: 30, height: 30, color: "#7c3aed" }} />
                  </div>
                  <h3 className="js-empty-title">No Interview Preparation Yet</h3>
                  <p className="js-empty-desc">Start preparing by browsing jobs you're interested in</p>
                  <button onClick={() => navigate("/jobseeker/jobs")} className="js-btn js-btn--purple">
                    <MagnifyingGlassIcon style={{ width: 15, height: 15 }} />
                    Browse Jobs
                  </button>
                </div>
              ) : (
                <div className="js-prep-list">
                  {interviewPrep.slice(0, 3).map((prep) => (
                    <div key={prep.job_id} className="js-prep-item">
                      <div className="js-prep-header">
                        <div>
                          <h3 className="js-prep-role">{prep.job_title}</h3>
                          <p className="js-prep-company">{prep.company}</p>
                        </div>
                        <div className="js-prep-badges">
                          {prep.updated && <span className="js-badge-pill js-badge-pill--green">Updated</span>}
                          <span className="js-badge-pill js-badge-pill--blue">Prepared</span>
                        </div>
                      </div>
                      <div className="js-prep-counts">
                        <div className="js-count-box" style={{ background: "#eff6ff" }}>
                          <span className="js-count-val" style={{ color: "#2563eb" }}>{prep.interview_preparation?.technical_questions?.length || 0}</span>
                          <span className="js-count-label">Technical</span>
                        </div>
                        <div className="js-count-box" style={{ background: "#f5f3ff" }}>
                          <span className="js-count-val" style={{ color: "#7c3aed" }}>{prep.interview_preparation?.behavioral_questions?.length || 0}</span>
                          <span className="js-count-label">Behavioral</span>
                        </div>
                        <div className="js-count-box" style={{ background: "#f0fdf4" }}>
                          <span className="js-count-val" style={{ color: "#15803d" }}>
                            {(prep.interview_preparation?.technical_questions?.length || 0) + (prep.interview_preparation?.behavioral_questions?.length || 0)}
                          </span>
                          <span className="js-count-label">Total</span>
                        </div>
                      </div>
                      <div className="js-prep-btns">
                        <button onClick={() => handleGenerateMoreQuestions(prep.job_id)} disabled={prep.generating} className="js-prep-btn js-prep-btn--blue">
                          {prep.generating ? <><ArrowPathIcon style={{ width: 14, height: 14, animation: "js-spin .8s linear infinite" }} />Generating…</> : <><BoltIcon style={{ width: 14, height: 14 }} />Generate More</>}
                        </button>
                        <button onClick={() => handleMockInterview(prep.job_id)} className="js-prep-btn js-prep-btn--purple">
                          <CpuChipIcon style={{ width: 14, height: 14 }} />
                          Mock Interview
                        </button>
                      </div>
                    </div>
                  ))}
                  {loading.interviewPrep && (
                    <div className="js-updating">
                      <ArrowPathIcon style={{ width: 14, height: 14, animation: "js-spin .8s linear infinite" }} />
                      Updating…
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Upcoming Interviews */}
            <div className="js-card">
              <div className="js-card-header">
                <div>
                  <h2 className="js-card-title">Upcoming Interviews</h2>
                  <p className="js-card-sub">Scheduled sessions</p>
                </div>
                <button onClick={() => navigate("/jobseeker/interviews")} className="js-pill-btn" style={{ background: "#f0fdf4", color: "#15803d" }}>
                  <EyeIcon style={{ width: 14, height: 14 }} />
                  View All
                </button>
              </div>
              {scheduledCount === 0 ? (
                <div className="js-empty">
                  <div className="js-empty-icon" style={{ background: "#f0fdf4" }}>
                    <CalendarIcon style={{ width: 28, height: 28, color: "#15803d" }} />
                  </div>
                  <h3 className="js-empty-title">No Upcoming Interviews</h3>
                  <p className="js-empty-desc">Apply to jobs to get interview invitations</p>
                </div>
              ) : (
                <div className="js-interview-list">
                  {interviews.filter(i => i.status === "scheduled").map((interview, idx) => (
                    <div key={idx} className="js-interview-item">
                      <h4 className="js-interview-role">{interview.job_title || "Interview"}</h4>
                      <p className="js-interview-company">{interview.company || ""}</p>
                      {interview.scheduled_at && (
                        <div className="js-interview-time">
                          <ClockIcon style={{ width: 13, height: 13 }} />
                          {new Date(interview.scheduled_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── Bottom Grid ── */}
        <section className="js-section">
          <div className="js-two-col">

            {/* Recent Applications */}
            <div className="js-card">
              <div className="js-card-header">
                <div>
                  <h2 className="js-card-title">Recent Applications</h2>
                  <p className="js-card-sub">Track your job applications</p>
                </div>
                <button onClick={() => navigate("/jobseeker/applications")} className="js-pill-btn" style={{ background: "#eff6ff", color: "#1d4ed8" }}>
                  <EyeIcon style={{ width: 14, height: 14 }} />
                  View All
                </button>
              </div>
              {appliedJobs.length === 0 ? (
                <div className="js-empty">
                  <div className="js-empty-icon" style={{ background: "#eff6ff" }}>
                    <DocumentArrowUpIcon style={{ width: 28, height: 28, color: "#1d4ed8" }} />
                  </div>
                  <h3 className="js-empty-title">No Applications Yet</h3>
                  <p className="js-empty-desc">You haven't applied to any jobs yet</p>
                  <button onClick={() => navigate("/matches")} className="js-btn js-btn--primary">
                    <SparklesIcon style={{ width: 14, height: 14 }} />
                    Find Matched Jobs
                  </button>
                </div>
              ) : (
                <div className="js-app-list">
                  {[...appliedJobs]
                    .sort((a, b) => new Date(b.applied_at) - new Date(a.applied_at))
                    .slice(0, 4)
                    .map((application) => (
                      <div key={application.id} className="js-app-item">
                        <div className="js-app-info">
                          <h3 className="js-app-role">{application.job?.title || "Untitled Job"}</h3>
                          <div className="js-app-meta">
                            <span>{application.company_name || "Unknown"}</span>
                            <span>·</span>
                            <span>{new Date(application.applied_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <span className="js-status-badge" style={{
                          background: application.status === "submitted" ? "#eff6ff" :
                            application.status === "reviewed" ? "#fefce8" :
                            application.status === "accepted" ? "#f0fdf4" :
                            application.status === "rejected" ? "#fef2f2" : "#f3f4f6",
                          color: application.status === "submitted" ? "#1d4ed8" :
                            application.status === "reviewed" ? "#a16207" :
                            application.status === "accepted" ? "#15803d" :
                            application.status === "rejected" ? "#b91c1c" : "#374151"
                        }}>
                          {application.status || "Submitted"}
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Career Insights */}
            <div className="js-card">
              <div className="js-card-header js-analysis-header">
                <div>
                  <h2 className="js-card-title">Career Insights</h2>
                  <p className="js-card-sub">Based on your resume analysis</p>
                </div>
                {analysis && (
                  <button onClick={() => navigate("/jobseeker/analysis")} className="js-pill-btn" style={{ background: "#f0fdf4", color: "#15803d" }}>
                    <EyeIcon style={{ width: 14, height: 14 }} />
                    Full Analysis
                  </button>
                )}
              </div>
              {!analysis ? (
                <div className="js-empty">
                  <div className="js-empty-icon" style={{ background: "#f0fdf4" }}>
                    <DocumentArrowUpIcon style={{ width: 28, height: 28, color: "#15803d" }} />
                  </div>
                  <h3 className="js-empty-title">No Resume Analysis</h3>
                  <p className="js-empty-desc">Upload your resume to get personalized insights</p>
                  <button onClick={() => navigate("/jobseeker/upload-resume")} className="js-btn js-btn--green">
                    <DocumentArrowUpIcon style={{ width: 14, height: 14 }} />
                    Upload Resume
                  </button>
                </div>
              ) : analysis.career_insights?.suitable_roles ? (
                <div className="js-insights-list">
                  {analysis.career_insights.suitable_roles.slice(0, 3).map((role, idx) => (
                    <div key={idx} className="js-insight-item">
                      <div className="js-insight-top">
                        <h4 className="js-insight-role">{role.role}</h4>
                        <span className="js-match-badge" style={{
                          background: role.match_score >= 80 ? "#f0fdf4" : role.match_score >= 60 ? "#fefce8" : "#fef2f2",
                          color: role.match_score >= 80 ? "#15803d" : role.match_score >= 60 ? "#a16207" : "#b91c1c"
                        }}>{role.match_score} Match</span>
                      </div>
                      <p className="js-insight-reason">{role.reason}</p>
                      {role.skills && (
                        <div className="js-skill-tags">
                          {role.skills.slice(0, 3).map((skill, i) => (
                            <span key={i} className="js-skill-tag">{skill}</span>
                          ))}
                          {role.skills.length > 3 && <span className="js-skill-more">+{role.skills.length - 3} more</span>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="js-empty"><p className="js-empty-desc">No career insights available yet</p></div>
              )}
            </div>
          </div>
        </section>

        {/* ── Summary Banner ── */}
        <section className="js-section">
          <div className="js-summary-banner">
            <div className="js-blob js-blob--1" style={{ opacity: 0.25 }} />
            <div className="js-blob js-blob--2" style={{ opacity: 0.25 }} />
            <div className="js-grid-overlay" />
            <div className="js-summary-inner">
              <div className="js-summary-left">
                <h2 className="js-summary-title">Your Job Search Summary</h2>
                <p className="js-summary-sub">Keep up the momentum! 🚀</p>
              </div>
              <ChartBarIcon style={{ width: 40, height: 40, color: "rgba(165,180,252,.5)" }} />
            </div>
            <div className="js-summary-grid">
              {[
                { label: "Jobs Available", value: jobs.length, emoji: "💼" },
                { label: "You've Applied", value: appliedJobs.length, emoji: "✅" },
                { label: "Interviews Scheduled", value: scheduledCount, emoji: "📅" },
                { label: "Job Matches", value: matchedJobs.length, emoji: "⚡" },
              ].map((item, idx) => (
                <div key={idx} className="js-summary-card">
                  <div className="js-summary-emoji">{item.emoji}</div>
                  <div className="js-summary-val">{item.value}</div>
                  <div className="js-summary-label">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

      </div>
    </>
  );
}

/* ─────────────────────────── Styles ─────────────────────────────────── */
const jsStyles = `
  /* Loading */
  .js-loading { display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:60vh;gap:20px; }
  .js-spinner { width:44px;height:44px;border:3px solid #e0e7ff;border-top-color:#6366f1;border-radius:50%;animation:js-spin .8s linear infinite; }
  .js-loading-text { color:#6366f1;font-size:15px;font-weight:500; }
  @keyframes js-spin { to { transform:rotate(360deg); } }

  /* Error */
  .js-error-screen { display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:60vh;text-align:center;padding:24px; }
  .js-error-icon { width:72px;height:72px;background:#fee2e2;border-radius:50%;display:flex;align-items:center;justify-content:center;margin-bottom:20px; }
  .js-error-title { font-size:20px;font-weight:700;color:#111827;margin-bottom:8px; }
  .js-error-msg { color:#6b7280;font-size:14px;margin-bottom:24px; }
  .js-error-btns { display:flex;gap:12px; }

  /* Hero */
  .js-hero {
    position:relative;overflow:hidden;
    background:linear-gradient(135deg,#0f0c29 0%,#302b63 52%,#24243e 100%);
    padding:56px 40px 64px;
    opacity:0;transform:translateY(16px);
    transition:opacity .6s ease,transform .6s ease;
  }
  .js-hero--visible { opacity:1;transform:translateY(0); }

  .js-blob {
    position:absolute;border-radius:50%;
    filter:blur(80px);opacity:.38;pointer-events:none;
  }
  .js-blob--1 { width:480px;height:480px;background:radial-gradient(circle,#6366f1,transparent);top:-150px;left:-80px;animation:js-drift 12s ease-in-out infinite alternate; }
  .js-blob--2 { width:360px;height:360px;background:radial-gradient(circle,#10b981,transparent);bottom:-110px;right:8%;animation:js-drift 15s ease-in-out infinite alternate-reverse; }
  .js-blob--3 { width:260px;height:260px;background:radial-gradient(circle,#06b6d4,transparent);top:28%;right:28%;animation:js-drift 18s ease-in-out infinite alternate; }
  @keyframes js-drift { 0%{transform:translate(0,0) scale(1)}100%{transform:translate(28px,18px) scale(1.07)} }

  .js-grid-overlay {
    position:absolute;inset:0;pointer-events:none;
    background-image:linear-gradient(rgba(255,255,255,.04)1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.04)1px,transparent 1px);
    background-size:40px 40px;
  }

  .js-hero-inner { position:relative;z-index:1;display:flex;align-items:center;gap:48px;max-width:1100px;margin:0 auto; }
  .js-hero-left { flex:1;min-width:0; }

  .js-badge {
    display:inline-flex;align-items:center;gap:8px;
    background:rgba(16,185,129,.2);border:1px solid rgba(16,185,129,.45);
    color:#6ee7b7;padding:5px 14px;border-radius:100px;
    font-size:11px;font-weight:700;letter-spacing:.6px;text-transform:uppercase;margin-bottom:20px;
  }
  .js-badge-dot {
    width:7px;height:7px;border-radius:50%;background:#6ee7b7;
    box-shadow:0 0 0 3px rgba(110,231,183,.3);
    animation:js-pulse 2s infinite;
  }
  @keyframes js-pulse{0%,100%{box-shadow:0 0 0 3px rgba(110,231,183,.3)}50%{box-shadow:0 0 0 6px rgba(110,231,183,.08)}}

  .js-hero-title { font-size:clamp(26px,4vw,40px);font-weight:800;color:#fff;line-height:1.2;margin:0 0 16px;letter-spacing:-.5px; }
  .js-hero-name { background:linear-gradient(90deg,#6ee7b7,#67e8f9);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text; }

  .js-typewriter-wrap { display:flex;align-items:center;gap:2px;min-height:32px;margin-bottom:18px; }
  .js-typewriter-text { font-size:17px;color:#c7d2fe;font-weight:400; }
  .js-cursor { color:#6ee7b7;font-size:20px;font-weight:300;animation:js-blink 1s step-start infinite; }
  @keyframes js-blink{0%,100%{opacity:1}50%{opacity:0}}

  .js-hero-sub { color:#94a3b8;font-size:14.5px;margin-bottom:32px;line-height:1.6; }

  .js-hero-actions { display:flex;flex-wrap:wrap;gap:12px; }

  /* Buttons */
  .js-btn {
    display:inline-flex;align-items:center;gap:8px;
    padding:10px 20px;border-radius:10px;
    font-size:14px;font-weight:600;cursor:pointer;border:none;
    transition:all .2s ease;letter-spacing:.2px;
  }
  .js-btn--primary { background:linear-gradient(135deg,#059669,#10b981);color:#fff;box-shadow:0 4px 16px rgba(16,185,129,.4); }
  .js-btn--primary:hover { transform:translateY(-2px);box-shadow:0 8px 24px rgba(16,185,129,.5); }
  .js-btn--ghost { background:rgba(255,255,255,.08);color:#c7d2fe;border:1px solid rgba(255,255,255,.15); }
  .js-btn--ghost:hover { background:rgba(255,255,255,.14);transform:translateY(-2px); }
  .js-btn--outline { background:transparent;color:#374151;border:1px solid #d1d5db; }
  .js-btn--outline:hover { background:#f9fafb; }
  .js-btn--purple { background:linear-gradient(135deg,#7c3aed,#8b5cf6);color:#fff;box-shadow:0 4px 14px rgba(124,58,237,.35); }
  .js-btn--purple:hover { transform:translateY(-2px); }
  .js-btn--green { background:linear-gradient(135deg,#059669,#10b981);color:#fff; }
  .js-btn--green:hover { transform:translateY(-2px); }
  .js-btn:disabled { opacity:.5;cursor:not-allowed;transform:none!important; }

  /* Hero Right Illustration */
  .js-hero-right { flex-shrink:0;width:260px;height:260px;display:flex;align-items:center;justify-content:center; }
  @media(max-width:768px){.js-hero-right{display:none;}}

  .js-illustration { position:relative;width:220px;height:220px; }
  .js-ill-ring {
    position:absolute;border-radius:50%;
    border:1px solid rgba(110,231,183,.2);
    top:50%;left:50%;transform:translate(-50%,-50%);
  }
  .js-ring--outer { width:220px;height:220px;animation:js-rotate 30s linear infinite; }
  .js-ring--mid   { width:158px;height:158px;animation:js-rotate 20s linear infinite reverse; }
  .js-ring--inner { width:96px; height:96px; border-color:rgba(110,231,183,.4); }
  @keyframes js-rotate { to { transform:translate(-50%,-50%) rotate(360deg); } }

  .js-ill-center {
    position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
    width:68px;height:68px;border-radius:50%;
    background:linear-gradient(135deg,rgba(16,185,129,.6),rgba(6,182,212,.6));
    display:flex;align-items:center;justify-content:center;
    color:#d1fae5;box-shadow:0 0 30px rgba(16,185,129,.4);
  }

  .js-ill-node {
    position:absolute;width:44px;height:44px;border-radius:50%;
    background:rgba(15,12,41,.85);border:1px solid rgba(110,231,183,.3);
    display:flex;align-items:center;justify-content:center;color:#6ee7b7;
    animation:js-glow 4s ease-in-out infinite;
  }
  .js-node--1{top:0;left:50%;transform:translate(-50%,0);}
  .js-node--2{top:50%;right:0;transform:translate(0,-50%);animation-delay:.8s;}
  .js-node--3{bottom:0;left:50%;transform:translate(-50%,0);animation-delay:1.6s;}
  .js-node--4{top:50%;left:0;transform:translate(0,-50%);animation-delay:2.4s;}
  @keyframes js-glow{0%,100%{box-shadow:0 0 10px rgba(16,185,129,.3)}50%{box-shadow:0 0 22px rgba(16,185,129,.6)}}

  /* Main content */
  .js-main { max-width:1100px;margin:0 auto;padding:40px 32px 80px; }
  .js-section { margin-bottom:48px; }
  .js-section-header { display:flex;align-items:center;justify-content:space-between;margin-bottom:18px; }
  .js-section-title { display:flex;align-items:center;gap:10px;font-size:18px;font-weight:700;color:#1e293b;margin:0; }
  .js-section-accent { display:block;width:4px;height:20px;background:#6366f1;border-radius:4px; }
  .js-section-sub { font-size:13px;color:#94a3b8; }

  /* Stats */
  .js-stats-grid { display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px; }
  .js-stat-card {
    background:#fff;border:1px solid #e8eaf6;border-radius:16px;
    padding:20px;cursor:pointer;
    animation:js-card-in .5s ease both;
    transition:transform .2s,box-shadow .2s;
    box-shadow:0 2px 8px rgba(0,0,0,.04);
  }
  .js-stat-card:hover { transform:translateY(-4px);box-shadow:0 12px 32px rgba(0,0,0,.09); }
  @keyframes js-card-in { from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)} }
  .js-stat-top { display:flex;align-items:flex-start;justify-content:space-between;gap:12px; }
  .js-stat-texts { display:flex;flex-direction:column;gap:4px; }
  .js-stat-label { font-size:13px;color:#94a3b8;font-weight:600;letter-spacing:.3px;text-transform:uppercase; }
  .js-stat-value { font-size:32px;font-weight:800;line-height:1;letter-spacing:-1px; }
  .js-stat-sub { font-size:12px;color:#94a3b8; }
  .js-stat-icon { width:48px;height:48px;border-radius:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0; }

  /* Quick Actions */
  .js-actions-grid { display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:14px; }
  .js-action-card {
    border:none;border-radius:16px;padding:18px;cursor:pointer;text-align:left;
    animation:js-card-in .5s ease both;
    transition:transform .2s,box-shadow .2s;
    box-shadow:0 4px 16px rgba(0,0,0,.12);
  }
  .js-action-card:hover { transform:translateY(-4px) scale(1.02);box-shadow:0 12px 32px rgba(0,0,0,.2); }
  .js-action-top { display:flex;align-items:flex-start;gap:12px;margin-bottom:12px; }
  .js-action-icon {
    width:40px;height:40px;background:rgba(255,255,255,.2);border-radius:10px;
    display:flex;align-items:center;justify-content:center;flex-shrink:0;color:#fff;
  }
  .js-action-texts { flex:1;min-width:0; }
  .js-action-title-row { display:flex;align-items:center;justify-content:space-between;margin-bottom:4px; }
  .js-action-title { font-size:14px;font-weight:700;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis; }
  .js-action-badge { background:rgba(255,255,255,.3);color:#fff;font-size:11px;font-weight:700;padding:2px 8px;border-radius:100px;flex-shrink:0; }
  .js-action-desc { font-size:12px;color:rgba(255,255,255,.75);line-height:1.4; }
  .js-action-cta { display:flex;align-items:center;gap:5px;font-size:12px;color:rgba(255,255,255,.65);font-weight:600; }

  /* Tips */
  .js-tips-grid { display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px; }
  .js-tip-card {
    background:#fff;border:1px solid #e8eaf6;border-radius:16px;padding:20px;
    animation:js-card-in .5s ease both;
    transition:transform .2s,box-shadow .2s,border-color .2s;
    box-shadow:0 2px 8px rgba(0,0,0,.04);
  }
  .js-tip-card:hover { transform:translateY(-3px);box-shadow:0 10px 28px rgba(0,0,0,.08);border-color:#c7d2fe; }
  .js-tip-icon { font-size:28px;margin-bottom:10px; }
  .js-tip-title { font-size:14px;font-weight:700;color:#1e293b;margin-bottom:8px; }
  .js-tip-body { font-size:13px;color:#64748b;line-height:1.6; }

  /* Cards */
  .js-two-col { display:grid;grid-template-columns:2fr 1fr;gap:20px; }
  @media(max-width:900px){.js-two-col{grid-template-columns:1fr;}}
  .js-card { background:#fff;border:1px solid #e8eaf6;border-radius:16px;padding:24px;box-shadow:0 2px 12px rgba(0,0,0,.04);transition:box-shadow .2s; }
  .js-card:hover { box-shadow:0 6px 24px rgba(0,0,0,.07); }
  .js-card--large {}

  .js-card-header { display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:20px;flex-wrap:wrap; }
  .js-card-title { font-size:17px;font-weight:700;color:#1e293b;margin:0 0 4px; }
  .js-card-sub { font-size:13px;color:#94a3b8;margin:0; }
  .js-card-actions { display:flex;align-items:center;gap:8px;flex-wrap:wrap; }

  .js-icon-btn {
    display:inline-flex;align-items:center;gap:6px;
    padding:6px 12px;border-radius:8px;font-size:13px;font-weight:500;
    background:transparent;border:1px solid #e2e8f0;color:#64748b;cursor:pointer;
    transition:background .15s;
  }
  .js-icon-btn:hover { background:#f8fafc; }
  .js-icon-btn:disabled { opacity:.5;cursor:not-allowed; }

  .js-pill-btn {
    display:inline-flex;align-items:center;gap:6px;
    padding:6px 14px;border-radius:8px;font-size:13px;font-weight:600;
    border:none;cursor:pointer;transition:opacity .15s,transform .15s;
  }
  .js-pill-btn:hover { opacity:.85;transform:translateY(-1px); }

  .js-timestamp { font-size:12px;color:#94a3b8; }

  /* Empty state */
  .js-empty { display:flex;flex-direction:column;align-items:center;text-align:center;padding:32px 16px; }
  .js-empty-icon { width:58px;height:58px;border-radius:50%;display:flex;align-items:center;justify-content:center;margin-bottom:14px; }
  .js-empty-title { font-size:15px;font-weight:700;color:#374151;margin-bottom:6px; }
  .js-empty-desc { font-size:13px;color:#94a3b8;margin-bottom:18px;max-width:280px;line-height:1.6; }

  /* Interview prep */
  .js-prep-list { display:flex;flex-direction:column;gap:14px; }
  .js-prep-item { border:1px solid #f1f5f9;border-radius:12px;padding:16px;transition:background .15s; }
  .js-prep-item:hover { background:#fafbff; }
  .js-prep-header { display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px; }
  .js-prep-role { font-size:14px;font-weight:700;color:#1e293b;margin:0 0 3px; }
  .js-prep-company { font-size:12px;color:#94a3b8;margin:0; }
  .js-prep-badges { display:flex;gap:6px;flex-shrink:0; }
  .js-badge-pill { padding:3px 9px;border-radius:100px;font-size:11px;font-weight:700; }
  .js-badge-pill--green { background:#d1fae5;color:#065f46; }
  .js-badge-pill--blue { background:#dbeafe;color:#1d4ed8; }
  .js-prep-counts { display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:12px; }
  .js-count-box { border-radius:10px;padding:12px;text-align:center; }
  .js-count-val { display:block;font-size:20px;font-weight:800;line-height:1; }
  .js-count-label { display:block;font-size:11px;color:#64748b;font-weight:600;margin-top:4px; }
  .js-prep-btns { display:flex;gap:8px; }
  .js-prep-btn {
    flex:1;display:inline-flex;align-items:center;justify-content:center;gap:6px;
    padding:9px 14px;border-radius:9px;font-size:13px;font-weight:600;
    border:none;cursor:pointer;transition:background .15s,transform .15s;
  }
  .js-prep-btn:hover { transform:translateY(-1px); }
  .js-prep-btn:disabled { opacity:.5;cursor:not-allowed;transform:none!important; }
  .js-prep-btn--blue { background:#eff6ff;color:#1d4ed8; }
  .js-prep-btn--blue:hover { background:#dbeafe; }
  .js-prep-btn--purple { background:#f5f3ff;color:#7c3aed; }
  .js-prep-btn--purple:hover { background:#ede9fe; }

  .js-updating { display:flex;align-items:center;justify-content:center;gap:7px;font-size:13px;color:#94a3b8;padding:12px; }

  /* Upcoming interviews */
  .js-interview-list { display:flex;flex-direction:column;gap:10px; }
  .js-interview-item { padding:12px;border:1px solid #f1f5f9;border-radius:10px;transition:background .15s; }
  .js-interview-item:hover { background:#fafbff; }
  .js-interview-role { font-size:13px;font-weight:700;color:#1e293b;margin:0 0 3px; }
  .js-interview-company { font-size:12px;color:#94a3b8;margin:0; }
  .js-interview-time { display:flex;align-items:center;gap:5px;margin-top:6px;font-size:12px;color:#4f46e5;font-weight:600; }

  /* Applications */
  .js-app-list { display:flex;flex-direction:column;gap:8px; }
  .js-app-item { display:flex;align-items:center;justify-content:space-between;padding:12px 14px;border:1px solid #f1f5f9;border-radius:10px;transition:all .2s; }
  .js-app-item:hover { background:#f8faff;border-color:#e0e7ff; }
  .js-app-info { flex:1;min-width:0; }
  .js-app-role { font-size:13px;font-weight:700;color:#1e293b;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin:0 0 3px; }
  .js-app-meta { display:flex;gap:6px;font-size:12px;color:#94a3b8; }
  .js-status-badge { padding:4px 10px;border-radius:100px;font-size:11px;font-weight:700;flex-shrink:0;margin-left:12px; }

  /* Insights */
  .js-insights-list { display:flex;flex-direction:column;gap:10px; }
  .js-insight-item { padding:12px 14px;border:1px solid #f1f5f9;border-radius:10px;transition:background .15s; }
  .js-insight-item:hover { background:#fafbff; }
  .js-insight-top { display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px; }
  .js-insight-role { font-size:13px;font-weight:700;color:#1e293b;margin:0; }
  .js-match-badge { padding:3px 8px;border-radius:100px;font-size:11px;font-weight:700;flex-shrink:0; }
  .js-insight-reason { font-size:12px;color:#64748b;line-height:1.5;margin-bottom:8px; }
  .js-skill-tags { display:flex;flex-wrap:wrap;gap:5px; }
  .js-skill-tag { padding:3px 8px;background:#f1f5f9;color:#475569;font-size:11px;border-radius:100px;font-weight:600; }
  .js-skill-more { font-size:11px;color:#94a3b8;align-self:center; }

  /* Summary Banner */
  .js-summary-banner {
    position:relative;overflow:hidden;
    background:linear-gradient(135deg,#0f0c29 0%,#302b63 52%,#24243e 100%);
    border-radius:20px;padding:36px;
  }
  .js-summary-inner { position:relative;z-index:1;display:flex;align-items:center;justify-content:space-between;margin-bottom:24px; }
  .js-summary-title { font-size:20px;font-weight:800;color:#fff;margin:0 0 6px; }
  .js-summary-sub { font-size:14px;color:#a5b4fc;margin:0; }
  .js-summary-grid { position:relative;z-index:1;display:grid;grid-template-columns:repeat(4,1fr);gap:12px; }
  @media(max-width:600px){.js-summary-grid{grid-template-columns:repeat(2,1fr);}}
  .js-summary-card { background:rgba(255,255,255,.1);border-radius:14px;padding:16px;text-align:center;backdrop-filter:blur(6px);transition:background .2s; }
  .js-summary-card:hover { background:rgba(255,255,255,.16); }
  .js-summary-emoji { font-size:22px;margin-bottom:6px; }
  .js-summary-val { font-size:26px;font-weight:800;color:#fff;line-height:1; }
  .js-summary-label { font-size:12px;color:#a5b4fc;margin-top:4px; }
`;

export default JobSeekerDashboard;