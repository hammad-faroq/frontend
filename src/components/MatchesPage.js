import React, { useState, useEffect, useCallback } from "react";
import { getSimilarJobs, getAppliedJobs } from "../services/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";
import toast from "react-hot-toast";
import {
  CheckCircleIcon, ExclamationTriangleIcon, ClockIcon,
  MapPinIcon, BuildingOfficeIcon, ArrowPathIcon,
  BriefcaseIcon, DocumentArrowUpIcon, EyeIcon,
  MagnifyingGlassIcon, FunnelIcon,
} from "@heroicons/react/24/outline";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

  .mp-wrap * { box-sizing: border-box; }
  .mp-wrap { font-family: 'DM Sans', sans-serif; min-height: 100vh; background: #f5f6ff; color: #1e1b3a; }

  /* Hero */
  .mp-hero {
    position: relative; overflow: hidden;
    background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 52%, #ede9fe 100%);
    padding: 40px 40px 72px; border-bottom: 1px solid #ddd6fe;
  }
  .mp-blob { position: absolute; border-radius: 50%; filter: blur(80px); opacity: .2; pointer-events: none; }
  .mp-blob--1 { width: 400px; height: 400px; background: radial-gradient(circle,#6366f1,transparent); top: -100px; left: -60px; animation: mp-drift 12s ease-in-out infinite alternate; }
  .mp-blob--2 { width: 260px; height: 260px; background: radial-gradient(circle,#10b981,transparent); bottom: -60px; right: 10%; animation: mp-drift 15s ease-in-out infinite alternate-reverse; }
  @keyframes mp-drift { 0%{transform:translate(0,0)} 100%{transform:translate(22px,12px)} }
  .mp-grid { position: absolute; inset: 0; pointer-events: none; background-image: linear-gradient(rgba(99,102,241,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,.06) 1px,transparent 1px); background-size: 40px 40px; }

  .mp-hero-inner { position: relative; z-index: 1; max-width: 1100px; margin: 0 auto; }
  .mp-hero-top { display: flex; flex-direction: column; gap: 8px; margin-bottom: 24px; }
  .mp-hero-title { font-family: 'Syne', sans-serif; font-size: clamp(22px,3.5vw,34px); font-weight: 800; color: #1e1b3a; margin: 0; letter-spacing: -.3px; }
  .mp-hero-sub { font-size: 15px; color: #6b7280; margin: 0; }
  .mp-hero-actions { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }

  /* Stats strip */
  .mp-stats-strip { position: relative; z-index: 10; margin: -28px auto 0; max-width: 1100px; padding: 0 40px; }
  .mp-stats-inner { background: #fff; border: 1px solid #e0e7ff; border-radius: 14px; display: grid; grid-template-columns: repeat(3,1fr); box-shadow: 0 8px 32px rgba(99,102,241,.1); }
  .mp-stat-item { padding: 18px 20px; display: flex; align-items: center; gap: 14px; }
  .mp-stat-item:not(:last-child) { border-right: 1px solid #e0e7ff; }
  .mp-stat-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .mp-stat-icon svg { width: 20px; height: 20px; }
  .mp-stat-label { font-size: 11px; font-weight: 700; letter-spacing: .5px; text-transform: uppercase; color: #9ca3af; }
  .mp-stat-val { font-size: 22px; font-weight: 800; color: #1e1b3a; }

  /* Main */
  .mp-main { max-width: 1100px; margin: 0 auto; padding: 36px 40px 80px; }

  /* Search/filter bar */
  .mp-filter-bar { background: #fff; border: 1px solid #e0e7ff; border-radius: 14px; padding: 16px 20px; margin-bottom: 24px; display: flex; flex-direction: column; gap: 14px; box-shadow: 0 4px 16px rgba(99,102,241,.06); }
  .mp-search-wrap { position: relative; flex: 1; }
  .mp-search-wrap svg { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); width: 16px; height: 16px; color: #9ca3af; }
  .mp-search-input { width: 100%; padding: 10px 14px 10px 38px; border: 1px solid #e0e7ff; border-radius: 10px; font-family: 'DM Sans',sans-serif; font-size: 14px; color: #1e1b3a; background: #f5f6ff; outline: none; transition: border-color .2s; }
  .mp-search-input:focus { border-color: #a5b4fc; background: #fff; }
  .mp-filter-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
  .mp-select { padding: 8px 12px; border: 1px solid #e0e7ff; border-radius: 10px; font-family: 'DM Sans',sans-serif; font-size: 13px; color: #4b5563; background: #f5f6ff; outline: none; cursor: pointer; transition: border-color .2s; }
  .mp-select:focus { border-color: #a5b4fc; }

  /* Banners */
  .mp-banner { border-radius: 14px; padding: 16px 20px; margin-bottom: 20px; display: flex; align-items: flex-start; gap: 12px; }
  .mp-banner--green { background: #f0fdf4; border: 1px solid #bbf7d0; }
  .mp-banner--red { background: #fef2f2; border: 1px solid #fecaca; }
  .mp-banner svg { width: 18px; height: 18px; flex-shrink: 0; margin-top: 2px; }
  .mp-banner p { margin: 0; font-size: 14px; }
  .mp-banner--green p { color: #15803d; }
  .mp-banner--red p { color: #b91c1c; }

  /* Section heading */
  .mp-section-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
  .mp-section-title { font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 700; color: #1e1b3a; margin: 0; }
  .mp-section-sub { font-size: 13px; color: #9ca3af; }

  /* Job cards grid */
  .mp-grid-cards { display: grid; grid-template-columns: repeat(auto-fill,minmax(320px,1fr)); gap: 20px; }

  /* Job card */
  .mp-card { background: #fff; border: 1px solid #e8eaf6; border-radius: 16px; overflow: hidden; transition: all .25s; animation: mp-in .4s ease both; }
  .mp-card:hover { border-color: #c7d2fe; box-shadow: 0 8px 32px rgba(99,102,241,.12); transform: translateY(-2px); }
  @keyframes mp-in { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  .mp-card-body { padding: 20px; }
  .mp-card-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; gap: 10px; }
  .mp-card-title { font-family: 'Syne', sans-serif; font-size: 16px; font-weight: 700; color: #1e1b3a; cursor: pointer; transition: color .2s; line-height: 1.3; }
  .mp-card-title:hover { color: #4f46e5; }
  .mp-match-pill { flex-shrink: 0; padding: 3px 10px; border-radius: 100px; font-size: 11px; font-weight: 700; }
  .mp-match-pill--green { background: #dcfce7; color: #15803d; }
  .mp-match-pill--yellow { background: #fef9c3; color: #92400e; }
  .mp-match-pill--orange { background: #ffedd5; color: #9a3412; }
  .mp-match-pill--red { background: #fee2e2; color: #b91c1c; }
  .mp-card-meta { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; margin-bottom: 14px; }
  .mp-card-meta-item { display: flex; align-items: center; gap: 4px; font-size: 12px; color: #6b7280; }
  .mp-card-meta-item svg { width: 13px; height: 13px; }

  /* Match bar */
  .mp-bar-wrap { margin-bottom: 14px; }
  .mp-bar-labels { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 5px; }
  .mp-bar-label { color: #6b7280; font-weight: 500; }
  .mp-bar-val { color: #1e1b3a; font-weight: 700; }
  .mp-bar-bg { width: 100%; height: 6px; background: #e0e7ff; border-radius: 100px; overflow: hidden; }
  .mp-bar-fill { height: 100%; border-radius: 100px; transition: width .6s ease; }
  .mp-bar-fill--green { background: linear-gradient(90deg,#10b981,#34d399); }
  .mp-bar-fill--yellow { background: linear-gradient(90deg,#f59e0b,#fbbf24); }
  .mp-bar-fill--orange { background: linear-gradient(90deg,#f97316,#fb923c); }
  .mp-bar-fill--red { background: linear-gradient(90deg,#ef4444,#f87171); }

  /* Card desc */
  .mp-card-desc { font-size: 13px; color: #6b7280; line-height: 1.6; margin-bottom: 16px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

  /* Card details */
  .mp-card-details { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 16px; padding: 12px; background: #f5f6ff; border-radius: 10px; }
  .mp-detail-label { font-size: 11px; color: #9ca3af; font-weight: 600; }
  .mp-detail-val { font-size: 13px; font-weight: 600; color: #1e1b3a; }

  /* Card actions */
  .mp-card-actions { display: flex; gap: 8px; }
  .mp-btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 9px 14px; border-radius: 10px; font-size: 13px; font-weight: 600; cursor: pointer; border: none; transition: all .2s; font-family: 'DM Sans',sans-serif; flex: 1; }
  .mp-btn svg { width: 14px; height: 14px; }
  .mp-btn--ghost { background: #f5f6ff; border: 1px solid #e0e7ff; color: #4f46e5; }
  .mp-btn--ghost:hover { background: #eef2ff; }
  .mp-btn--primary { background: linear-gradient(135deg,#4f46e5,#7c3aed); color: #fff; box-shadow: 0 4px 12px rgba(79,70,229,.2); }
  .mp-btn--primary:hover { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(79,70,229,.3); }
  .mp-btn--disabled { background: #f3f4f6; border: 1px solid #e5e7eb; color: #9ca3af; cursor: not-allowed; }
  .mp-btn--orange { background: linear-gradient(135deg,#f97316,#ea580c); color: #fff; }

  /* Empty state */
  .mp-empty { text-align: center; padding: 60px 20px; background: #fff; border: 1px solid #e0e7ff; border-radius: 16px; }
  .mp-empty-emoji { font-size: 52px; margin-bottom: 16px; }
  .mp-empty-title { font-family: 'Syne',sans-serif; font-size: 20px; font-weight: 700; color: #1e1b3a; margin-bottom: 8px; }
  .mp-empty-sub { font-size: 14px; color: #9ca3af; margin-bottom: 24px; max-width: 360px; margin-left: auto; margin-right: auto; }

  /* Tips */
  .mp-tips { margin-top: 32px; background: #eef2ff; border: 1px solid #c7d2fe; border-radius: 14px; padding: 20px 24px; }
  .mp-tips-title { font-family: 'Syne',sans-serif; font-size: 14px; font-weight: 700; color: #4f46e5; margin-bottom: 10px; display: flex; align-items: center; gap: 6px; }
  .mp-tips ul { margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 6px; }
  .mp-tips li { font-size: 13px; color: #4b5563; display: flex; gap: 8px; }
  .mp-tips li::before { content: "→"; color: #6366f1; }

  /* Header action buttons */
  .mp-action-btn { display: inline-flex; align-items: center; gap: 8px; padding: 9px 16px; border-radius: 10px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all .2s; font-family: 'DM Sans',sans-serif; border: none; }
  .mp-action-btn--outline { background: #fff; border: 1px solid #e0e7ff; color: #4b5563; }
  .mp-action-btn--outline:hover { border-color: #c7d2fe; color: #4f46e5; }
  .mp-action-btn--primary { background: linear-gradient(135deg,#4f46e5,#7c3aed); color: #fff; box-shadow: 0 4px 14px rgba(79,70,229,.25); }
  .mp-action-btn svg { width: 15px; height: 15px; }

  /* Loading */
  .mp-loading { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 60vh; gap: 20px; }
  .mp-spinner { width: 44px; height: 44px; border: 3px solid #e0e7ff; border-top-color: #6366f1; border-radius: 50%; animation: mp-spin .8s linear infinite; }
  @keyframes mp-spin { to{transform:rotate(360deg)} }

  @media(max-width:900px){ .mp-stats-inner{grid-template-columns:1fr} .mp-stat-item:not(:last-child){border-right:none;border-bottom:1px solid #e0e7ff} }
  @media(max-width:640px){ .mp-hero{padding:28px 16px 60px} .mp-stats-strip{padding:0 16px} .mp-main{padding:28px 16px 60px} .mp-grid-cards{grid-template-columns:1fr} }
`;

function MatchesPage() {
  const [matchedJobs, setMatchedJobs] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [applyingJobId, setApplyingJobId] = useState(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("score");
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const fetchMatchedJobs = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    setError(""); setSuccessMessage("");
    try {
      const [matchesRes, appliedRes] = await Promise.allSettled([getSimilarJobs(), getAppliedJobs()]);
      if (matchesRes.status === "fulfilled") {
        const response = matchesRes.value;
        const jobs = Array.isArray(response.matched_jobs) ? response.matched_jobs : Array.isArray(response) ? response : [];
        if (jobs.length > 0) {
          setMatchedJobs(jobs);
          if (isRefresh) { setSuccessMessage(`✅ Found ${jobs.length} matching jobs!`); setTimeout(() => setSuccessMessage(""), 3000); }
        } else {
          setError(response.message || "No matching jobs found."); setMatchedJobs([]);
        }
      } else { setError("Failed to fetch matched jobs."); setMatchedJobs([]); }
      if (appliedRes.status === "fulfilled") {
        const applied = Array.isArray(appliedRes.value.applied_jobs) ? appliedRes.value.applied_jobs : Array.isArray(appliedRes.value) ? appliedRes.value : [];
        setAppliedJobs(applied);
      } else setAppliedJobs([]);
    } catch { setError("Something went wrong while loading job matches."); setMatchedJobs([]); setAppliedJobs([]); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { fetchMatchedJobs(); }, [fetchMatchedJobs]);

  // FIXED: a.job?.id === job.job_id (applied jobs have job as nested object)
  const filteredAndSortedJobs = React.useMemo(() => {
    let filtered = matchedJobs.filter(job => {
      if (searchTerm) {
        const s = searchTerm.toLowerCase();
        return job.title?.toLowerCase().includes(s) || job.company?.toLowerCase().includes(s) || job.location?.toLowerCase().includes(s);
      }
      return true;
    });
    if (filter === "unapplied") filtered = filtered.filter(job => !appliedJobs.some(a => a.job?.id === job.job_id));
    else if (filter === "applied") filtered = filtered.filter(job => appliedJobs.some(a => a.job?.id === job.job_id));
    filtered.sort((a, b) => {
      const sA = a.score || a.match_score || 0, sB = b.score || b.match_score || 0;
      if (sortBy === "score") return sB - sA;
      if (sortBy === "title") return (a.title || "").localeCompare(b.title || "");
      return sB - sA;
    });
    return filtered;
  }, [matchedJobs, appliedJobs, filter, searchTerm, sortBy]);

  const getScoreClass = (pct) => pct >= 80 ? "green" : pct >= 50 ? "yellow" : pct >= 25 ? "orange" : "red";
  const getScoreLabel = (pct) => pct >= 80 ? "Excellent Match" : pct >= 50 ? "Good Match" : pct >= 25 ? "Fair Match" : "Low Match";

  // FIXED: a.job?.id === j.job_id
  const unappliedCount = matchedJobs.filter(j => !appliedJobs.some(a => a.job?.id === j.job_id)).length;
  const appliedCount = matchedJobs.filter(j => appliedJobs.some(a => a.job?.id === j.job_id)).length;

  if (loading) return (
    <div className="mp-wrap"><style>{styles}</style>
      <div className="mp-loading"><div className="mp-spinner" /><p style={{ color: "#6366f1", fontWeight: 500 }}>Finding your matches…</p></div>
    </div>
  );

  return (
    <div className="mp-wrap">
      <style>{styles}</style>

      {/* Hero */}
      <div className="mp-hero">
        <div className="mp-blob mp-blob--1" /><div className="mp-blob mp-blob--2" /><div className="mp-grid" />
        <div className="mp-hero-inner">
          <div className="mp-hero-top">
            <h1 className="mp-hero-title">Your Job Matches</h1>
            <p className="mp-hero-sub">Jobs tailored to your skills and experience</p>
          </div>
          <div className="mp-hero-actions">
            <button className="mp-action-btn mp-action-btn--outline" onClick={() => fetchMatchedJobs(true)} disabled={refreshing}>
              <ArrowPathIcon style={{ width: 15, height: 15, animation: refreshing ? "mp-spin .8s linear infinite" : undefined }} />{refreshing ? "Refreshing…" : "Refresh"}
            </button>
            <button className="mp-action-btn mp-action-btn--primary" onClick={() => navigate("/jobseeker/upload-resume")}>
              <DocumentArrowUpIcon />Upload Resume
            </button>
          </div>
        </div>
      </div>

      {/* Stats strip */}
      <div className="mp-stats-strip">
        <div className="mp-stats-inner">
          <div className="mp-stat-item">
            <div className="mp-stat-icon" style={{ background: "#eef2ff" }}><BriefcaseIcon style={{ color: "#4f46e5" }} /></div>
            <div><div className="mp-stat-label">Total Matches</div><div className="mp-stat-val">{matchedJobs.length}</div></div>
          </div>
          <div className="mp-stat-item">
            <div className="mp-stat-icon" style={{ background: "#f0fdf4" }}><CheckCircleIcon style={{ color: "#16a34a" }} /></div>
            <div><div className="mp-stat-label">Applied</div><div className="mp-stat-val">{appliedCount}</div></div>
          </div>
          <div className="mp-stat-item">
            <div className="mp-stat-icon" style={{ background: "#f5f3ff" }}><ClockIcon style={{ color: "#7c3aed" }} /></div>
            <div><div className="mp-stat-label">Available</div><div className="mp-stat-val">{unappliedCount}</div></div>
          </div>
        </div>
      </div>

      <div className="mp-main">
        {/* Filter bar */}
        <div className="mp-filter-bar">
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <div className="mp-search-wrap" style={{ flex: 1, minWidth: 200 }}>
              <MagnifyingGlassIcon />
              <input className="mp-search-input" placeholder="Search by title, company, or location…" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
            <div className="mp-filter-row">
              <FunnelIcon style={{ width: 16, height: 16, color: "#6b7280" }} />
              <select className="mp-select" value={filter} onChange={e => setFilter(e.target.value)}>
                <option value="all">All Jobs</option>
                <option value="unapplied">Not Applied</option>
                <option value="applied">Applied</option>
              </select>
              <select className="mp-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                <option value="score">Sort by Match</option>
                <option value="title">Sort by Title</option>
              </select>
            </div>
          </div>
        </div>

        {/* Messages */}
        {successMessage && (
          <div className="mp-banner mp-banner--green"><CheckCircleIcon style={{ color: "#16a34a" }} /><p>{successMessage}</p></div>
        )}
        {error && (
          <div className="mp-banner mp-banner--red">
            <ExclamationTriangleIcon style={{ color: "#dc2626" }} />
            <div>
              <p style={{ fontWeight: 600 }}>{error}</p>
              {error.includes("resume") && <button style={{ fontSize: 13, color: "#b91c1c", textDecoration: "underline", background: "none", border: "none", cursor: "pointer", marginTop: 4 }} onClick={() => navigate("/jobseeker/upload-resume")}>Upload your resume now →</button>}
            </div>
          </div>
        )}

        {/* Empty */}
        {filteredAndSortedJobs.length === 0 && !error && (
          <div className="mp-empty">
            <div className="mp-empty-emoji">📄</div>
            <h3 className="mp-empty-title">{searchTerm ? "No matching jobs found" : "No job matches yet"}</h3>
            <p className="mp-empty-sub">{searchTerm ? "Try a different search term or clear your filters." : "Upload your resume to get personalized job recommendations."}</p>
            <button className="mp-btn mp-btn--primary" style={{ width: "auto", padding: "10px 24px", margin: "0 auto" }} onClick={() => searchTerm ? (setSearchTerm(""), setFilter("all")) : navigate("/jobseeker/upload-resume")}>
              {searchTerm ? "Clear Filters" : <><DocumentArrowUpIcon />Upload Resume</>}
            </button>
          </div>
        )}

        {/* Cards */}
        {filteredAndSortedJobs.length > 0 && (
          <>
            <div className="mp-section-head">
              <h2 className="mp-section-title">Recommended for you ({filteredAndSortedJobs.length}){searchTerm && ` for "${searchTerm}"`}</h2>
              {filter !== "all" && <span className="mp-section-sub">{filter === "unapplied" ? "Unapplied only" : "Applied only"}</span>}
            </div>
            <div className="mp-grid-cards">
              {filteredAndSortedJobs.map((job, i) => {
                // FIXED: a.job?.id === job.job_id
                const isApplied = appliedJobs.some(a => a.job?.id === job.job_id);
                const isApplying = applyingJobId === job.job_id;
                const pct = Math.round((job.score || job.match_score || 0) * 100);
                const cls = getScoreClass(pct);
                return (
                  <div key={job.job_id} className="mp-card" style={{ animationDelay: `${i * 40}ms` }}>
                    <div className="mp-card-body">
                      <div className="mp-card-top">
                        <h3 className="mp-card-title" onClick={() => navigate(`/jobs/${job.job_id}`)}>{job.title}</h3>
                        <span className={`mp-match-pill mp-match-pill--${cls}`}>{pct}% Match</span>
                      </div>
                      <div className="mp-card-meta">
                        {job.company && <span className="mp-card-meta-item"><BuildingOfficeIcon />{job.company}</span>}
                        {job.location && <span className="mp-card-meta-item"><MapPinIcon />{job.location}</span>}
                      </div>
                      <div className="mp-bar-wrap">
                        <div className="mp-bar-labels">
                          <span className="mp-bar-label">{getScoreLabel(pct)}</span>
                          <span className="mp-bar-val">{pct}%</span>
                        </div>
                        <div className="mp-bar-bg"><div className={`mp-bar-fill mp-bar-fill--${cls}`} style={{ width: `${Math.min(pct, 100)}%` }} /></div>
                      </div>
                      {job.description && <p className="mp-card-desc">{job.description}</p>}
                      {(job.salary_range || job.type) && (
                        <div className="mp-card-details">
                          {job.salary_range && <div><div className="mp-detail-label">Salary</div><div className="mp-detail-val">{job.salary_range}</div></div>}
                          {job.type && <div><div className="mp-detail-label">Type</div><div className="mp-detail-val">{job.type}</div></div>}
                        </div>
                      )}
                      <div className="mp-card-actions">
                        <button className="mp-btn mp-btn--ghost" onClick={() => navigate(`/jobs/${job.job_id}`)}><EyeIcon />View</button>
                        <button
                          className={`mp-btn ${isApplied ? "mp-btn--disabled" : isApplying ? "mp-btn--orange" : "mp-btn--primary"}`}
                          disabled={isApplied || isApplying}
                          onClick={() => navigate(`/apply/${job.job_id}`)}
                        >
                          {isApplying ? <><ArrowPathIcon style={{ animation: "mp-spin .8s linear infinite" }} />Applying…</> : isApplied ? <><CheckCircleIcon />Applied</> : <><DocumentArrowUpIcon />Apply Now</>}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Tips */}
        {filteredAndSortedJobs.length > 0 && (
          <div className="mp-tips">
            <div className="mp-tips-title"><ExclamationTriangleIcon style={{ width: 16, height: 16 }} />Tips for better matches</div>
            <ul>
              <li>Update your resume with recent skills and experiences</li>
              <li>Apply to jobs with higher match scores first</li>
              <li>Complete your profile with all relevant information</li>
              <li>Check back regularly for new job postings</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default MatchesPage;