// src/pages/JobSeekerAnalysis.js
import React, { useState, useEffect } from "react";
import { getResumeAnalysis, logoutUser } from "../services/api";
import { useNavigate } from "react-router-dom";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

  .ja-wrap * { box-sizing: border-box; }
  .ja-wrap { font-family: 'DM Sans', sans-serif; min-height: 100vh; background: #f5f6ff; color: #1e1b3a; }

  /* Hero */
  .ja-hero {
    position: relative; overflow: hidden;
    background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 52%, #ede9fe 100%);
    padding: 48px 40px 56px; border-bottom: 1px solid #ddd6fe;
  }
  .ja-blob { position: absolute; border-radius: 50%; filter: blur(80px); opacity: .2; pointer-events: none; }
  .ja-blob--1 { width: 420px; height: 420px; background: radial-gradient(circle,#6366f1,transparent); top: -120px; left: -60px; animation: ja-drift 12s ease-in-out infinite alternate; }
  .ja-blob--2 { width: 300px; height: 300px; background: radial-gradient(circle,#8b5cf6,transparent); bottom: -90px; right: 8%; animation: ja-drift 15s ease-in-out infinite alternate-reverse; }
  @keyframes ja-drift { 0%{transform:translate(0,0) scale(1)} 100%{transform:translate(24px,14px) scale(1.06)} }
  .ja-grid { position: absolute; inset: 0; pointer-events: none; background-image: linear-gradient(rgba(99,102,241,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,.06) 1px,transparent 1px); background-size: 40px 40px; }

  .ja-hero-inner { position: relative; z-index: 1; max-width: 1100px; margin: 0 auto; }
  .ja-badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(99,102,241,.12); border: 1px solid rgba(99,102,241,.3); color: #4f46e5; padding: 5px 14px; border-radius: 100px; font-size: 11px; font-weight: 700; letter-spacing: .6px; text-transform: uppercase; margin-bottom: 16px; }
  .ja-badge-dot { width: 7px; height: 7px; border-radius: 50%; background: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,.2); animation: ja-pulse 2s infinite; }
  @keyframes ja-pulse { 0%,100%{box-shadow:0 0 0 3px rgba(99,102,241,.2)} 50%{box-shadow:0 0 0 6px rgba(99,102,241,.06)} }
  .ja-hero-title { font-family: 'Syne', sans-serif; font-size: clamp(24px,3.5vw,38px); font-weight: 800; color: #1e1b3a; margin: 0 0 10px; letter-spacing: -.5px; }
  .ja-hero-title span { background: linear-gradient(90deg,#4f46e5,#7c3aed); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
  .ja-hero-sub { color: #6b7280; font-size: 14px; margin: 0; }

  /* Main */
  .ja-main { max-width: 1100px; margin: 0 auto; padding: 36px 40px 80px; }

  /* Card */
  .ja-card { background: #fff; border: 1px solid #e8eaf6; border-radius: 16px; padding: 24px 28px; margin-bottom: 20px; animation: ja-card-in .4s ease both; box-shadow: 0 4px 16px rgba(99,102,241,.06); }
  .ja-card:hover { box-shadow: 0 12px 40px rgba(99,102,241,.12); border-color: #c7d2fe; transition: box-shadow .2s, border-color .2s; }
  @keyframes ja-card-in { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }

  .ja-card-title { font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 700; color: #1e1b3a; margin: 0 0 20px; display: flex; align-items: center; gap: 10px; }
  .ja-card-title-icon { width: 36px; height: 36px; border-radius: 10px; background: linear-gradient(135deg,#eef2ff,#ede9fe); border: 1px solid #e0e7ff; display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; }

  /* Summary grid */
  .ja-summary-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; }
  .ja-summary-item { background: #f8f7ff; border: 1px solid #e0e7ff; border-radius: 12px; padding: 16px 18px; }
  .ja-summary-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .5px; color: #9ca3af; margin-bottom: 6px; }
  .ja-summary-val { font-size: 16px; font-weight: 700; color: #1e1b3a; }

  /* Skills */
  .ja-skills-section { margin-bottom: 16px; }
  .ja-skills-label { font-size: 13px; font-weight: 600; color: #4b5563; margin-bottom: 10px; }
  .ja-skills-wrap { display: flex; flex-wrap: wrap; gap: 8px; }
  .ja-skill-chip { display: inline-flex; align-items: center; background: #eef2ff; border: 1px solid #c7d2fe; border-radius: 100px; padding: 4px 12px; font-size: 12px; color: #4f46e5; font-weight: 500; }
  .ja-skill-chip--secondary { background: #f5f6ff; border-color: #e0e7ff; color: #6b7280; }

  /* Role cards */
  .ja-role-card { border: 1px solid #e8eaf6; border-radius: 12px; padding: 16px 18px; margin-bottom: 12px; transition: border-color .2s, box-shadow .2s; }
  .ja-role-card:hover { border-color: #c7d2fe; box-shadow: 0 4px 16px rgba(99,102,241,.08); }
  .ja-role-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; margin-bottom: 8px; flex-wrap: wrap; }
  .ja-role-name { font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 700; color: #1e1b3a; }
  .ja-match-badge { padding: 4px 12px; border-radius: 100px; font-size: 12px; font-weight: 700; flex-shrink: 0; }
  .ja-match--high { background: #dcfce7; color: #15803d; }
  .ja-match--mid  { background: #fef9c3; color: #92400e; }
  .ja-match--low  { background: #fef2f2; color: #dc2626; }
  .ja-role-reason { font-size: 13px; color: #6b7280; line-height: 1.6; margin-bottom: 10px; }
  .ja-role-meta { display: flex; gap: 12px; flex-wrap: wrap; }
  .ja-meta-chip { display: inline-flex; align-items: center; gap: 5px; background: #f5f3ff; border: 1px solid #ede9fe; border-radius: 100px; padding: 4px 10px; font-size: 12px; color: #7c3aed; font-weight: 500; }

  /* Learning path */
  .ja-phase { display: flex; gap: 16px; margin-bottom: 24px; position: relative; }
  .ja-phase:not(:last-child)::after { content:''; position:absolute; left: 19px; top: 40px; bottom: -24px; width: 2px; background: linear-gradient(to bottom,#c7d2fe,transparent); }
  .ja-phase-num { width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg,#4f46e5,#7c3aed); color: #fff; display: flex; align-items: center; justify-content: center; font-family: 'Syne',sans-serif; font-weight: 800; font-size: 15px; flex-shrink: 0; box-shadow: 0 4px 12px rgba(79,70,229,.25); }
  .ja-phase-body { flex: 1; }
  .ja-phase-title { font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 700; color: #1e1b3a; margin-bottom: 2px; text-transform: capitalize; }
  .ja-phase-timeline { font-size: 12px; color: #9ca3af; margin-bottom: 10px; }
  .ja-phase-topics { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 8px; }
  .ja-topic-chip { background: #f5f3ff; border: 1px solid #ede9fe; color: #7c3aed; padding: 4px 10px; border-radius: 8px; font-size: 12px; font-weight: 500; }
  .ja-phase-desc { font-size: 13px; color: #6b7280; line-height: 1.6; }

  /* Certs */
  .ja-cert-row { display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; border: 1px solid #e8eaf6; border-radius: 12px; margin-bottom: 10px; transition: border-color .2s, background .2s; }
  .ja-cert-row:hover { border-color: #c7d2fe; background: #fafafe; }
  .ja-cert-name { font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 700; color: #1e1b3a; margin-bottom: 2px; }
  .ja-cert-sub { font-size: 12px; color: #9ca3af; }
  .ja-cert-right { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
  .ja-priority-badge { padding: 3px 10px; border-radius: 100px; font-size: 11px; font-weight: 700; }
  .ja-priority--high   { background: #fef2f2; color: #dc2626; }
  .ja-priority--medium { background: #fef9c3; color: #92400e; }
  .ja-priority--low    { background: #dbeafe; color: #1d4ed8; }
  .ja-cert-cost { font-size: 13px; color: #6b7280; }

  /* Empty state */
  .ja-empty { background: #fff; border: 1px solid #e8eaf6; border-radius: 16px; padding: 64px 20px; text-align: center; box-shadow: 0 4px 16px rgba(99,102,241,.06); }
  .ja-empty-icon { font-size: 52px; margin-bottom: 16px; }
  .ja-empty-title { font-family: 'Syne', sans-serif; font-size: 20px; font-weight: 700; color: #1e1b3a; margin-bottom: 8px; }
  .ja-empty-sub { font-size: 14px; color: #9ca3af; margin-bottom: 24px; }
  .ja-btn { display: inline-flex; align-items: center; gap: 6px; padding: 10px 22px; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; border: none; font-family: 'DM Sans', sans-serif; transition: all .2s; }
  .ja-btn--primary { background: linear-gradient(135deg,#4f46e5,#7c3aed); color: #fff; box-shadow: 0 4px 14px rgba(79,70,229,.25); }
  .ja-btn--primary:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(79,70,229,.35); }

  /* Loading */
  .ja-loading { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 60vh; gap: 20px; }
  .ja-spinner { width: 44px; height: 44px; border: 3px solid #e0e7ff; border-top-color: #6366f1; border-radius: 50%; animation: ja-spin .8s linear infinite; }
  @keyframes ja-spin { to{transform:rotate(360deg)} }

  @media(max-width:768px){ .ja-summary-grid{grid-template-columns:1fr} }
  @media(max-width:640px){ .ja-hero{padding:36px 20px 48px} .ja-main{padding:28px 16px 60px} }
`;

function JobSeekerAnalysis() {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
      <div className="ja-wrap">
        <style>{styles}</style>
        <div className="ja-loading">
          <div className="ja-spinner" />
          <p style={{ color: "#6366f1", fontWeight: 500 }}>Loading analysis…</p>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="ja-wrap">
        <style>{styles}</style>
        <div className="ja-hero">
          <div className="ja-blob ja-blob--1" /><div className="ja-blob ja-blob--2" /><div className="ja-grid" />
          <div className="ja-hero-inner">
            <div className="ja-badge"><span className="ja-badge-dot" />Resume Analysis</div>
            <h1 className="ja-hero-title">Your <span>Career Insights</span></h1>
            <p className="ja-hero-sub">Personalized recommendations based on your resume</p>
          </div>
        </div>
        <div className="ja-main">
          <div className="ja-empty">
            <div className="ja-empty-icon">📊</div>
            <h3 className="ja-empty-title">No Analysis Available</h3>
            <p className="ja-empty-sub">Upload your resume to get personalized career insights and recommendations.</p>
            <button className="ja-btn ja-btn--primary" onClick={() => navigate("/jobseeker/upload-resume")}>
              Upload Resume
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ja-wrap">
      <style>{styles}</style>

      {/* Hero */}
      <div className="ja-hero">
        <div className="ja-blob ja-blob--1" /><div className="ja-blob ja-blob--2" /><div className="ja-grid" />
        <div className="ja-hero-inner">
          <div className="ja-badge"><span className="ja-badge-dot" />Resume Analysis</div>
          <h1 className="ja-hero-title">Your <span>Career Insights</span></h1>
          <p className="ja-hero-sub">Personalized recommendations based on your resume</p>
        </div>
      </div>

      <div className="ja-main">

        {/* Resume Summary */}
        {analysis.resume_summary && (
          <div className="ja-card" style={{ animationDelay: "0ms" }}>
            <h2 className="ja-card-title">
              <span className="ja-card-title-icon">📋</span>Resume Summary
            </h2>
            <div className="ja-summary-grid">
              <div className="ja-summary-item">
                <div className="ja-summary-label">Experience Level</div>
                <div className="ja-summary-val">{analysis.resume_summary.experience_level || "Not specified"}</div>
              </div>
              <div className="ja-summary-item">
                <div className="ja-summary-label">Years of Experience</div>
                <div className="ja-summary-val">{analysis.resume_summary.years_experience || "Not specified"}</div>
              </div>
              <div className="ja-summary-item">
                <div className="ja-summary-label">Last Updated</div>
                <div className="ja-summary-val">
                  {analysis.resume_summary.last_updated
                    ? new Date(analysis.resume_summary.last_updated).toLocaleDateString()
                    : "Recently"}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Skills */}
        {analysis.resume_summary?.primary_skills && (
          <div className="ja-card" style={{ animationDelay: "60ms" }}>
            <h2 className="ja-card-title">
              <span className="ja-card-title-icon">🛠️</span>Skills Analysis
            </h2>
            <div className="ja-skills-section">
              <div className="ja-skills-label">Primary Skills</div>
              <div className="ja-skills-wrap">
                {analysis.resume_summary.primary_skills.map((skill, index) => (
                  <span key={index} className="ja-skill-chip">{skill}</span>
                ))}
              </div>
            </div>
            {analysis.resume_summary.secondary_skills?.length > 0 && (
              <div className="ja-skills-section" style={{ marginBottom: 0 }}>
                <div className="ja-skills-label">Secondary Skills</div>
                <div className="ja-skills-wrap">
                  {analysis.resume_summary.secondary_skills.slice(0, 10).map((skill, index) => (
                    <span key={index} className="ja-skill-chip ja-skill-chip--secondary">{skill}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Career Insights */}
        {analysis.career_insights?.suitable_roles && (
          <div className="ja-card" style={{ animationDelay: "120ms" }}>
            <h2 className="ja-card-title">
              <span className="ja-card-title-icon">🎯</span>Career Insights
            </h2>
            {analysis.career_insights.suitable_roles.map((role, idx) => (
              <div key={idx} className="ja-role-card">
                <div className="ja-role-top">
                  <div className="ja-role-name">{role.role}</div>
                  <span className={`ja-match-badge ${
                    role.match_score >= 80 ? "ja-match--high" :
                    role.match_score >= 60 ? "ja-match--mid" : "ja-match--low"
                  }`}>{role.match_score} Match</span>
                </div>
                <p className="ja-role-reason">{role.reason}</p>
                <div className="ja-role-meta">
                  <span className="ja-meta-chip">📈 {role.growth_potential}</span>
                  <span className="ja-meta-chip">⏱ {role.timeline}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Learning Path */}
        {analysis.learning_path?.learning_path && (
          <div className="ja-card" style={{ animationDelay: "180ms" }}>
            <h2 className="ja-card-title">
              <span className="ja-card-title-icon">🗺️</span>Learning Path
            </h2>
            {analysis.learning_path.learning_path.map((phase, idx) => (
              <div key={idx} className="ja-phase">
                <div className="ja-phase-num">{idx + 1}</div>
                <div className="ja-phase-body">
                  <div className="ja-phase-title">{phase.phase}</div>
                  <div className="ja-phase-timeline">{phase.timeline}</div>
                  <div className="ja-phase-topics">
                    {phase.topics.map((topic, i) => (
                      <span key={i} className="ja-topic-chip">{topic}</span>
                    ))}
                  </div>
                  {phase.description && <p className="ja-phase-desc">{phase.description}</p>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Certifications */}
        {analysis.certifications?.length > 0 && (
          <div className="ja-card" style={{ animationDelay: "240ms" }}>
            <h2 className="ja-card-title">
              <span className="ja-card-title-icon">🏅</span>Recommended Certifications
            </h2>
            {analysis.certifications.map((cert, idx) => (
              <div key={idx} className="ja-cert-row">
                <div>
                  <div className="ja-cert-name">{cert.name}</div>
                  <div className="ja-cert-sub">{cert.issuer} · {cert.duration}</div>
                </div>
                <div className="ja-cert-right">
                  <span className={`ja-priority-badge ${
                    cert.priority === "high" ? "ja-priority--high" :
                    cert.priority === "medium" ? "ja-priority--medium" : "ja-priority--low"
                  }`}>{cert.priority} priority</span>
                  <span className="ja-cert-cost">{cert.cost}</span>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

export default JobSeekerAnalysis;