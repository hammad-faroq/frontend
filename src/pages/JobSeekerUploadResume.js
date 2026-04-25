// src/pages/JobSeekerUploadResume.js - Restyled with Jobs page aesthetic
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getResumeAnalysis } from "../services/api";
import toast from "react-hot-toast";
import { logoutUser } from "../services/api";
import API from "../services/api";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

  .ur-wrap * { box-sizing: border-box; }
  .ur-wrap { font-family: 'DM Sans', sans-serif; min-height: 100vh; background: #f5f6ff; color: #1e1b3a; }

  /* Hero */
  .ur-hero {
    position: relative; overflow: hidden;
    background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 52%, #ede9fe 100%);
    padding: 48px 40px 56px; border-bottom: 1px solid #ddd6fe;
  }
  .ur-blob { position: absolute; border-radius: 50%; filter: blur(80px); opacity: .2; pointer-events: none; }
  .ur-blob--1 { width: 420px; height: 420px; background: radial-gradient(circle,#6366f1,transparent); top: -120px; left: -60px; animation: ur-drift 12s ease-in-out infinite alternate; }
  .ur-blob--2 { width: 300px; height: 300px; background: radial-gradient(circle,#10b981,transparent); bottom: -90px; right: 8%; animation: ur-drift 15s ease-in-out infinite alternate-reverse; }
  @keyframes ur-drift { 0%{transform:translate(0,0) scale(1)} 100%{transform:translate(24px,14px) scale(1.06)} }
  .ur-grid { position: absolute; inset: 0; pointer-events: none; background-image: linear-gradient(rgba(99,102,241,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,.06) 1px,transparent 1px); background-size: 40px 40px; }
  .ur-hero-inner { position: relative; z-index: 1; max-width: 1100px; margin: 0 auto; }
  .ur-badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(99,102,241,.12); border: 1px solid rgba(99,102,241,.3); color: #4f46e5; padding: 5px 14px; border-radius: 100px; font-size: 11px; font-weight: 700; letter-spacing: .6px; text-transform: uppercase; margin-bottom: 16px; }
  .ur-badge-dot { width: 7px; height: 7px; border-radius: 50%; background: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,.2); animation: ur-pulse 2s infinite; }
  @keyframes ur-pulse { 0%,100%{box-shadow:0 0 0 3px rgba(99,102,241,.2)} 50%{box-shadow:0 0 0 6px rgba(99,102,241,.06)} }
  .ur-hero-title { font-family: 'Syne', sans-serif; font-size: clamp(24px,3.5vw,38px); font-weight: 800; color: #1e1b3a; margin: 0 0 10px; letter-spacing: -.5px; }
  .ur-hero-title span { background: linear-gradient(90deg,#4f46e5,#7c3aed); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
  .ur-hero-sub { color: #6b7280; font-size: 14px; margin: 0; }

  /* Main layout */
  .ur-main { max-width: 1100px; margin: 0 auto; padding: 36px 40px 80px; }

  /* Redirect banner */
  .ur-redirect-banner {
    margin-bottom: 24px; padding: 16px 20px;
    background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 16px;
    display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap;
  }
  .ur-redirect-icon { width: 40px; height: 40px; background: #dbeafe; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0; }
  .ur-redirect-text p:first-child { font-weight: 600; color: #1e40af; margin: 0 0 2px; font-size: 14px; }
  .ur-redirect-text p:last-child { color: #3b82f6; font-size: 13px; margin: 0; }

  /* Cards */
  .ur-card { background: #fff; border: 1px solid #e8eaf6; border-radius: 16px; padding: 24px; margin-bottom: 16px; transition: transform .2s, box-shadow .2s, border-color .2s; }
  .ur-card:hover { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(99,102,241,.1); border-color: #c7d2fe; }
  .ur-card-title { font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 700; color: #1e1b3a; margin: 0 0 16px; }

  /* Drop zone */
  .ur-dropzone {
    border: 2px dashed #a5b4fc; border-radius: 14px; padding: 48px 24px;
    text-align: center; cursor: pointer; transition: all .25s;
  }
  .ur-dropzone:hover, .ur-dropzone--active { border-color: #4f46e5; background: #eef2ff; }
  .ur-drop-icon { width: 72px; height: 72px; background: linear-gradient(135deg,#eef2ff,#ede9fe); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; }
  .ur-drop-icon svg { width: 32px; height: 32px; color: #6366f1; }
  .ur-drop-title { font-family: 'Syne', sans-serif; font-size: 16px; font-weight: 700; color: #1e1b3a; margin: 0 0 6px; }
  .ur-drop-sub { color: #6b7280; font-size: 13px; margin: 0 0 12px; }
  .ur-drop-hint { color: #9ca3af; font-size: 12px; margin: 0; }

  /* Spinner */
  .ur-spinner-wrap { display: flex; flex-direction: column; align-items: center; gap: 12px; }
  .ur-spinner { width: 48px; height: 48px; border: 3px solid #e0e7ff; border-top-color: #6366f1; border-radius: 50%; animation: ur-spin .8s linear infinite; }
  @keyframes ur-spin { to{transform:rotate(360deg)} }
  .ur-spinner-text { color: #4f46e5; font-weight: 600; font-size: 15px; }
  .ur-spinner-sub { color: #9ca3af; font-size: 13px; }

  /* Uploaded file strip */
  .ur-file-strip { margin-top: 16px; padding: 14px 18px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; display: flex; align-items: center; justify-content: space-between; }
  .ur-file-info { display: flex; align-items: center; gap: 10px; }
  .ur-file-check { width: 20px; height: 20px; color: #16a34a; flex-shrink: 0; }
  .ur-file-name { font-weight: 600; color: #14532d; font-size: 14px; margin: 0 0 2px; }
  .ur-file-size { color: #16a34a; font-size: 12px; margin: 0; }
  .ur-file-remove { color: #16a34a; font-size: 13px; cursor: pointer; background: none; border: none; font-family: 'DM Sans', sans-serif; }
  .ur-file-remove:hover { color: #14532d; text-decoration: underline; }

  /* Tips */
  .ur-tips { margin-top: 24px; padding-top: 20px; border-top: 1px solid #e8eaf6; }
  .ur-tips-title { font-family: 'Syne', sans-serif; font-size: 16px; font-weight: 700; color: #1e1b3a; margin: 0 0 12px; }
  .ur-tip { display: flex; align-items: flex-start; gap: 8px; margin-bottom: 8px; color: #6b7280; font-size: 13.5px; }
  .ur-tip-check { color: #10b981; font-weight: 700; flex-shrink: 0; margin-top: 1px; }

  /* Analysis preview */
  .ur-analysis-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; flex-wrap: wrap; gap: 10px; }
  .ur-skill-chip { display: inline-flex; align-items: center; background: #ede9fe; border: 1px solid #ddd6fe; color: #7c3aed; padding: 4px 12px; border-radius: 100px; font-size: 12px; font-weight: 500; }
  .ur-role-row { display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; border: 1px solid #e8eaf6; border-radius: 10px; margin-bottom: 6px; }
  .ur-role-name { font-size: 14px; color: #1e1b3a; font-weight: 500; }
  .ur-match-badge { padding: 3px 10px; border-radius: 100px; font-size: 11px; font-weight: 700; }
  .ur-match--high { background: #d1fae5; color: #065f46; }
  .ur-match--mid { background: #fef3c7; color: #92400e; }
  .ur-match--low { background: #fee2e2; color: #991b1b; }

  /* Buttons */
  .ur-btn { display: inline-flex; align-items: center; gap: 6px; padding: 10px 20px; border-radius: 10px; font-size: 13px; font-weight: 600; cursor: pointer; border: none; transition: all .2s; font-family: 'DM Sans', sans-serif; }
  .ur-btn--primary { background: linear-gradient(135deg,#4f46e5,#7c3aed); color: #fff; box-shadow: 0 4px 14px rgba(79,70,229,.25); }
  .ur-btn--primary:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(79,70,229,.35); }
  .ur-btn--ghost { background: #f5f6ff; border: 1px solid #e0e7ff; color: #4f46e5; }
  .ur-btn--ghost:hover { background: #eef2ff; transform: translateY(-2px); }
  .ur-btn--full { width: 100%; justify-content: center; padding: 13px 20px; font-size: 14px; }

  /* Right column */
  .ur-benefits-list { display: flex; flex-direction: column; gap: 16px; }
  .ur-benefit { display: flex; align-items: flex-start; gap: 12px; }
  .ur-benefit-icon { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; }
  .ur-benefit-title { font-weight: 600; color: #1e1b3a; font-size: 14px; margin: 0 0 2px; }
  .ur-benefit-sub { color: #6b7280; font-size: 12.5px; margin: 0; }

  /* CV builder promo card */
  .ur-promo { background: linear-gradient(135deg,#4f46e5,#7c3aed); border-radius: 16px; padding: 22px; color: #fff; }
  .ur-promo h3 { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 16px; margin: 0 0 8px; }
  .ur-promo p { color: rgba(255,255,255,.8); font-size: 13px; margin: 0 0 16px; }
  .ur-promo-btn { width: 100%; background: #fff; color: #4f46e5; border: none; border-radius: 10px; padding: 10px; font-weight: 600; font-size: 13px; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: background .2s; }
  .ur-promo-btn:hover { background: #eef2ff; }

  /* Quick action buttons */
  .ur-action-btn { width: 100%; text-align: left; padding: 12px 14px; border: 1px solid #e0e7ff; background: #fff; border-radius: 12px; display: flex; align-items: center; gap: 12px; cursor: pointer; transition: all .2s; font-family: 'DM Sans', sans-serif; margin-bottom: 10px; }
  .ur-action-btn:hover { background: #f5f6ff; transform: translateY(-1px); border-color: #c7d2fe; }
  .ur-action-btn--active { background: #eef2ff; border-color: #c7d2fe; }
  .ur-action-icon { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; }
  .ur-action-title { font-weight: 600; color: #1e1b3a; font-size: 14px; margin: 0 0 2px; }
  .ur-action-sub { color: #6b7280; font-size: 12px; margin: 0; }

  /* Grid layout */
  .ur-grid-layout { display: grid; grid-template-columns: 1fr 320px; gap: 24px; }
  .ur-right-col { display: flex; flex-direction: column; gap: 16px; }

  @media(max-width: 900px) { .ur-grid-layout { grid-template-columns: 1fr; } }
  @media(max-width: 600px) { .ur-hero { padding: 36px 20px 48px; } .ur-main { padding: 28px 16px 60px; } }
`;

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
      toast.error("Please login first!");
      navigate("/login");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);
      const res = await fetch(`${API.BASE_URL}/cv_manager/resume/upload/`, {
        method: "POST",
        headers: { Authorization: `Token ${token}` },
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setUploadedFile(file);

        try {
          const analysisData = await getResumeAnalysis();
          setAnalysis(analysisData);
          setShowAnalysisRedirect(true);

          setTimeout(() => {
            navigate("/jobseeker/analysis");
          }, 3000);
        } catch (analysisErr) {
          console.error("Failed to fetch analysis:", analysisErr);
        }

        toast.success("✅ Resume uploaded successfully! Your analysis has been updated.");
      } else {
        const errorData = await res.json();
        toast.error(`❌ Upload failed: ${errorData.error || "Please try again."}`);
      }
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("❌ Upload error! Please check your connection.");
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
      toast.error("Please upload only PDF or Word documents.");
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
    <div className="ur-wrap">
      <style>{styles}</style>

      {/* Hero */}
      <div className="ur-hero">
        <div className="ur-blob ur-blob--1" />
        <div className="ur-blob ur-blob--2" />
        <div className="ur-grid" />
        <div className="ur-hero-inner">
          <div className="ur-badge">
            <span className="ur-badge-dot" />
            Resume Upload
          </div>
          <h1 className="ur-hero-title">
            Upload Your <span>Resume</span>
          </h1>
          <p className="ur-hero-sub">
            Get personalized career insights and job matches powered by AI
          </p>
        </div>
      </div>

      <div className="ur-main">

        {/* Auto-redirect Notification */}
        {showAnalysisRedirect && (
          <div className="ur-redirect-banner">
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div className="ur-redirect-icon">⏱️</div>
              <div className="ur-redirect-text">
                <p>Resume analyzed successfully!</p>
                <p>Redirecting to full analysis in 3 seconds...</p>
              </div>
            </div>
            <button onClick={handleViewAnalysis} className="ur-btn ur-btn--primary">
              View Now
            </button>
          </div>
        )}

        <div className="ur-grid-layout">

          {/* Left Column */}
          <div>

            {/* Upload Card */}
            <div className="ur-card">
              <h2 className="ur-card-title">Upload Your Resume</h2>

              <div
                className={`ur-dropzone${dragOver ? " ur-dropzone--active" : ""}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleClick}
              >
                {uploading ? (
                  <div className="ur-spinner-wrap">
                    <div className="ur-spinner" />
                    <p className="ur-spinner-text">Uploading Resume...</p>
                    <p className="ur-spinner-sub">Please wait while we process your file</p>
                  </div>
                ) : (
                  <>
                    <div className="ur-drop-icon">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <p className="ur-drop-title">Drag & drop your resume here</p>
                    <p className="ur-drop-sub">or click to browse files</p>
                    <p className="ur-drop-hint">Supports PDF, DOC, DOCX · Max 5MB</p>
                  </>
                )}
              </div>

              {uploadedFile && (
                <div className="ur-file-strip">
                  <div className="ur-file-info">
                    <svg className="ur-file-check" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="ur-file-name">Uploaded successfully!</p>
                      <p className="ur-file-size">
                        {uploadedFile.name} · {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    className="ur-file-remove"
                    onClick={() => {
                      setUploadedFile(null);
                      setAnalysis(null);
                      setShowAnalysisRedirect(false);
                    }}
                  >
                    Remove
                  </button>
                </div>
              )}

              {/* Tips */}
              <div className="ur-tips">
                <h3 className="ur-tips-title">Tips for better results</h3>
                {[
                  "Include all relevant work experience",
                  "List your technical skills and certifications",
                  "Mention your education and achievements",
                  "Use clear formatting and professional language",
                ].map((tip, i) => (
                  <div key={i} className="ur-tip">
                    <span className="ur-tip-check">✓</span>
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Analysis Preview */}
            {analysis && (
              <div className="ur-card">
                <div className="ur-analysis-header">
                  <h2 className="ur-card-title" style={{ margin: 0 }}>Quick Analysis</h2>
                  <button onClick={handleViewAnalysis} className="ur-btn ur-btn--primary">
                    View Full Analysis
                  </button>
                </div>

                {analysis.resume_summary && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <div>
                      <p style={{ fontWeight: 600, color: "#374151", fontSize: 14, marginBottom: 8 }}>
                        Primary Skills Detected
                      </p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {analysis.resume_summary.primary_skills?.slice(0, 8).map((skill, i) => (
                          <span key={i} className="ur-skill-chip">{skill}</span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p style={{ fontWeight: 600, color: "#374151", fontSize: 14, marginBottom: 4 }}>
                        Experience Level
                      </p>
                      <p style={{ color: "#1e1b3a", fontSize: 14 }}>
                        {analysis.resume_summary.experience_level || "Not specified"}
                      </p>
                    </div>

                    {analysis.career_insights?.suitable_roles && (
                      <div>
                        <p style={{ fontWeight: 600, color: "#374151", fontSize: 14, marginBottom: 8 }}>
                          Top Career Matches
                        </p>
                        {analysis.career_insights.suitable_roles.slice(0, 2).map((role, idx) => (
                          <div key={idx} className="ur-role-row">
                            <span className="ur-role-name">{role.role}</span>
                            <span className={`ur-match-badge ${
                              role.match_score >= 80 ? "ur-match--high"
                              : role.match_score >= 60 ? "ur-match--mid"
                              : "ur-match--low"
                            }`}>
                              {role.match_score}% match
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div style={{ paddingTop: 12, borderTop: "1px solid #e8eaf6" }}>
                      <button
                        onClick={handleViewAnalysis}
                        className="ur-btn ur-btn--primary ur-btn--full"
                      >
                        View Complete Analysis Report
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="ur-right-col">

            {/* Why upload */}
            <div className="ur-card">
              <h3 className="ur-card-title">Why upload your resume?</h3>
              <div className="ur-benefits-list">
                {[
                  { icon: "🎯", bg: "#eef2ff", title: "Personalized Job Matches", sub: "Get job recommendations based on your skills" },
                  { icon: "📊", bg: "#f0fdf4", title: "Career Insights", sub: "Understand your strengths and growth areas" },
                  { icon: "🚀", bg: "#faf5ff", title: "Faster Applications", sub: "Apply to jobs with one click using your resume" },
                  { icon: "💡", bg: "#fff7ed", title: "Learning Path", sub: "Get recommendations for skills to learn" },
                ].map((b, i) => (
                  <div key={i} className="ur-benefit">
                    <div className="ur-benefit-icon" style={{ background: b.bg }}>{b.icon}</div>
                    <div>
                      <p className="ur-benefit-title">{b.title}</p>
                      <p className="ur-benefit-sub">{b.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CV Builder promo */}
            <div className="ur-promo">
              <h3>Need help with your resume?</h3>
              <p>Create a professional resume with our built-in CV builder</p>
              <button
                className="ur-promo-btn"
                onClick={() => window.open(`${API.BASE_URL}/cv_manager/`, "_blank")}
              >
                Open CV Builder
              </button>
            </div>

            {/* Quick Actions */}
            <div className="ur-card">
              <h3 className="ur-card-title">Quick Actions</h3>

              <button onClick={handleViewAnalysis} className="ur-action-btn ur-action-btn--active">
                <div className="ur-action-icon" style={{ background: "#dbeafe" }}>📊</div>
                <div>
                  <p className="ur-action-title" style={{ color: "#1e40af" }}>View Analysis</p>
                  <p className="ur-action-sub" style={{ color: "#3b82f6" }}>
                    See your career insights &amp; recommendations
                  </p>
                </div>
              </button>

              <button onClick={() => navigate("/jobseeker/jobs")} className="ur-action-btn">
                <div className="ur-action-icon" style={{ background: "#ede9fe" }}>💼</div>
                <div>
                  <p className="ur-action-title">Browse Jobs</p>
                  <p className="ur-action-sub">Find new opportunities</p>
                </div>
              </button>

              <button onClick={() => navigate("/jobseeker/applications")} className="ur-action-btn">
                <div className="ur-action-icon" style={{ background: "#d1fae5" }}>📝</div>
                <div>
                  <p className="ur-action-title">View Applications</p>
                  <p className="ur-action-sub">Track your job applications</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default JobSeekerUploadResume;