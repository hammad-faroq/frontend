import React, { useState, useEffect } from "react";
import { getJobDetail, applyToJob } from "../services/api";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ArrowLeftIcon, DocumentArrowUpIcon, BriefcaseIcon,
  MapPinIcon, CalendarIcon, CheckCircleIcon,
  PaperClipIcon, RocketLaunchIcon, ClockIcon,
} from "@heroicons/react/24/outline";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

  .ja-wrap * { box-sizing: border-box; }
  .ja-wrap { font-family: 'DM Sans', sans-serif; min-height: 100vh; background: #f5f6ff; color: #1e1b3a; }

  /* Hero */
  .ja-hero {
    position: relative; overflow: hidden;
    background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 52%, #ede9fe 100%);
    padding: 40px 40px 72px; border-bottom: 1px solid #ddd6fe;
  }
  .ja-blob { position: absolute; border-radius: 50%; filter: blur(80px); opacity: .2; pointer-events: none; }
  .ja-blob--1 { width: 400px; height: 400px; background: radial-gradient(circle,#6366f1,transparent); top: -100px; left: -60px; animation: ja-drift 12s ease-in-out infinite alternate; }
  .ja-blob--2 { width: 280px; height: 280px; background: radial-gradient(circle,#10b981,transparent); bottom: -80px; right: 10%; animation: ja-drift 15s ease-in-out infinite alternate-reverse; }
  .ja-blob--3 { width: 200px; height: 200px; background: radial-gradient(circle,#06b6d4,transparent); top: 30%; right: 25%; animation: ja-drift 18s ease-in-out infinite alternate; }
  @keyframes ja-drift { 0%{transform:translate(0,0) scale(1)} 100%{transform:translate(24px,14px) scale(1.06)} }
  .ja-grid { position: absolute; inset: 0; pointer-events: none; background-image: linear-gradient(rgba(99,102,241,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,.06) 1px,transparent 1px); background-size: 40px 40px; }

  .ja-hero-inner { position: relative; z-index: 1; max-width: 760px; margin: 0 auto; }

  .ja-back-btn { display: inline-flex; align-items: center; gap: 8px; color: #6b7280; font-size: 13px; font-weight: 500; cursor: pointer; background: #fff; border: 1px solid #e0e7ff; border-radius: 8px; padding: 7px 14px; margin-bottom: 28px; transition: all .2s; }
  .ja-back-btn:hover { color: #4f46e5; border-color: #c7d2fe; background: #f5f3ff; }
  .ja-back-btn svg { width: 15px; height: 15px; }

  .ja-badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(99,102,241,.12); border: 1px solid rgba(99,102,241,.3); color: #4f46e5; padding: 5px 14px; border-radius: 100px; font-size: 11px; font-weight: 700; letter-spacing: .6px; text-transform: uppercase; margin-bottom: 14px; }
  .ja-badge-dot { width: 6px; height: 6px; border-radius: 50%; background: #4f46e5; animation: ja-pulse 2s infinite; }
  @keyframes ja-pulse { 0%,100%{box-shadow:0 0 0 3px rgba(79,70,229,.2)} 50%{box-shadow:0 0 0 6px rgba(79,70,229,.06)} }

  .ja-hero-title { font-family: 'Syne', sans-serif; font-size: clamp(20px,3vw,30px); font-weight: 800; color: #1e1b3a; margin: 0 0 8px; letter-spacing: -.3px; }
  .ja-hero-title span { background: linear-gradient(90deg,#4f46e5,#7c3aed); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
  .ja-hero-meta { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
  .ja-hero-chip { display: inline-flex; align-items: center; gap: 5px; background: rgba(99,102,241,.1); border: 1px solid rgba(99,102,241,.2); border-radius: 100px; padding: 4px 12px; font-size: 12px; color: #4f46e5; font-weight: 500; }
  .ja-hero-chip svg { width: 12px; height: 12px; }

  /* Card area */
  .ja-card-wrap { max-width: 760px; margin: -36px auto 0; padding: 0 40px; position: relative; z-index: 10; }
  .ja-card { background: #fff; border: 1px solid #e0e7ff; border-radius: 20px; padding: 36px; box-shadow: 0 8px 40px rgba(99,102,241,.12); animation: ja-card-in .5s ease both; }
  @keyframes ja-card-in { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }

  .ja-section-label { font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 700; letter-spacing: .6px; text-transform: uppercase; color: #4f46e5; margin-bottom: 6px; }
  .ja-desc { font-size: 14px; color: #6b7280; line-height: 1.7; margin-bottom: 28px; display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden; }
  .ja-divider { height: 1px; background: #e0e7ff; margin: 24px 0; }

  /* File upload */
  .ja-upload-label { font-size: 14px; font-weight: 600; color: #4b5563; margin-bottom: 10px; display: block; }
  .ja-upload-zone { border: 2px dashed rgba(99,102,241,.35); border-radius: 14px; padding: 28px 20px; text-align: center; cursor: pointer; transition: all .2s; position: relative; background: rgba(99,102,241,.03); }
  .ja-upload-zone:hover, .ja-upload-zone--active { border-color: #6366f1; background: rgba(99,102,241,.07); }
  .ja-upload-zone--has-file { border-color: rgba(16,185,129,.5); background: rgba(16,185,129,.05); }
  .ja-upload-icon { width: 44px; height: 44px; border-radius: 12px; background: #eef2ff; display: flex; align-items: center; justify-content: center; margin: 0 auto 10px; color: #6366f1; }
  .ja-upload-icon svg { width: 22px; height: 22px; }
  .ja-upload-title { font-size: 14px; font-weight: 600; color: #1e1b3a; margin-bottom: 4px; }
  .ja-upload-sub { font-size: 12px; color: #9ca3af; }
  .ja-file-input { position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; height: 100%; }
  .ja-file-name { display: flex; align-items: center; gap: 8px; margin-top: 10px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 8px 12px; font-size: 13px; color: #15803d; }
  .ja-file-name svg { width: 15px; height: 15px; }

  /* Submit btn */
  .ja-submit-btn { width: 100%; padding: 14px; border-radius: 12px; border: none; cursor: pointer; font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 700; letter-spacing: .3px; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all .25s; margin-top: 24px; background: linear-gradient(135deg,#4f46e5,#7c3aed); color: #fff; box-shadow: 0 8px 24px rgba(79,70,229,.3); }
  .ja-submit-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 14px 36px rgba(79,70,229,.4); }
  .ja-submit-btn:disabled { opacity: .55; cursor: not-allowed; transform: none; }
  .ja-submit-btn svg { width: 18px; height: 18px; }

  .ja-spinner { width: 18px; height: 18px; border: 2px solid rgba(255,255,255,.4); border-top-color: #fff; border-radius: 50%; animation: ja-spin .7s linear infinite; }
  @keyframes ja-spin { to { transform: rotate(360deg); } }

  /* Tips */
  .ja-tips { margin-top: 24px; padding: 16px 18px; background: #eef2ff; border: 1px solid #c7d2fe; border-radius: 12px; }
  .ja-tips-title { font-size: 12px; font-weight: 700; color: #4f46e5; text-transform: uppercase; letter-spacing: .5px; margin-bottom: 8px; }
  .ja-tips-list { list-style: none; margin: 0; padding: 0; }
  .ja-tips-list li { font-size: 12.5px; color: #6b7280; margin-bottom: 5px; display: flex; align-items: flex-start; gap: 6px; line-height: 1.5; }
  .ja-tips-list li::before { content: "→"; color: #6366f1; flex-shrink: 0; }

  /* Loading */
  .ja-loading { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 60vh; gap: 20px; }
  .ja-loading-spinner { width: 44px; height: 44px; border: 3px solid #e0e7ff; border-top-color: #6366f1; border-radius: 50%; animation: ja-spin .8s linear infinite; }

  /* Success */
  .ja-success-wrap { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg,#eef2ff,#e0e7ff,#ede9fe); position: relative; overflow: hidden; }
  .ja-success-card { position: relative; z-index: 1; text-align: center; padding: 60px 40px; background: #fff; border: 1px solid #e0e7ff; border-radius: 24px; box-shadow: 0 20px 60px rgba(99,102,241,.15); max-width: 480px; width: 90%; animation: ja-card-in .5s ease both; }
  .ja-success-icon { width: 80px; height: 80px; border-radius: 50%; background: #f0fdf4; border: 2px solid #bbf7d0; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; }
  .ja-success-icon svg { width: 40px; height: 40px; color: #16a34a; }
  .ja-success-title { font-family: 'Syne', sans-serif; font-size: 28px; font-weight: 800; color: #1e1b3a; margin-bottom: 8px; }
  .ja-success-sub { color: #6b7280; font-size: 15px; margin-bottom: 32px; }
  .ja-success-sub strong { color: #4f46e5; }
  .ja-success-btns { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }

  .ja-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 12px 24px; border-radius: 12px; font-size: 14px; font-weight: 600; cursor: pointer; border: none; transition: all .2s; font-family: 'DM Sans', sans-serif; }
  .ja-btn--primary { background: linear-gradient(135deg,#4f46e5,#7c3aed); color: #fff; box-shadow: 0 6px 20px rgba(79,70,229,.25); }
  .ja-btn--primary:hover { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(79,70,229,.35); }
  .ja-btn--ghost { background: #f5f6ff; border: 1px solid #e0e7ff; color: #4f46e5; }
  .ja-btn--ghost:hover { background: #eef2ff; }

  .ja-bottom { padding-bottom: 80px; }

  @media(max-width:640px){ .ja-hero{padding:28px 16px 60px} .ja-card-wrap{padding:0 16px} .ja-card{padding:24px 18px} }
`;

function JobApplicationPage() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);
        const data = await getJobDetail(jobId);
        setJob(data);
      } catch {
        toast.error("Failed to load job details.");
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [jobId]);

  const handleFileChange = (file) => {
    if (!file) return;
    const allowed = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!allowed.includes(file.type)) { toast.error("Only PDF, DOC, or DOCX files are accepted."); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("File size must be under 5 MB."); return; }
    setSelectedFile(file);
  };

  const handleDrop = (e) => { e.preventDefault(); setDragActive(false); if (e.dataTransfer.files?.[0]) handleFileChange(e.dataTransfer.files[0]); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) { toast.error("Please upload your CV before applying."); return; }
    try {
      setSubmitting(true);
      const result = await applyToJob(jobId, selectedFile);
      if (result.status === "already_applied") {
        toast.error("You've already applied for this job.", { duration: 5000, icon: "⚠️" });
      } else if (result.status === "success") {
        toast.success("Application submitted! 🎉", { duration: 5000 });
        setSubmitted(true);
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } catch {
      toast.error("Failed to submit application. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="ja-wrap"><style>{styles}</style>
      <div className="ja-loading">
        <div className="ja-loading-spinner"/>
        <p style={{color:"#6366f1",fontSize:15,fontWeight:500}}>Loading application form…</p>
      </div>
    </div>
  );

  if (!job) return (
    <div className="ja-wrap"><style>{styles}</style>
      <div className="ja-loading" style={{flexDirection:"column",textAlign:"center"}}>
        <div style={{fontSize:48}}>😔</div>
        <h2 style={{fontFamily:"Syne,sans-serif",color:"#1e1b3a"}}>Job Not Found</h2>
        <button className="ja-btn ja-btn--ghost" style={{marginTop:16}} onClick={()=>navigate(-1)}>Go Back</button>
      </div>
    </div>
  );

  if (submitted) return (
    <div className="ja-wrap"><style>{styles}</style>
      <div className="ja-success-wrap">
        <div className="ja-blob ja-blob--1"/><div className="ja-blob ja-blob--2"/>
        <div className="ja-success-card">
          <div className="ja-success-icon"><CheckCircleIcon/></div>
          <h2 className="ja-success-title">Application Submitted!</h2>
          <p className="ja-success-sub">Your application for <strong>{job.title}</strong> at <strong>{job.company_name}</strong> is in.</p>
          <div className="ja-success-btns">
            <button className="ja-btn ja-btn--primary" onClick={()=>navigate("/jobseeker/applications")}>View Applications</button>
            <button className="ja-btn ja-btn--ghost" onClick={()=>navigate("/jobseeker/jobs")}>Browse More Jobs</button>
          </div>
        </div>
      </div>
    </div>
  );

  const deadlineLabel = job.application_deadline
    ? new Date(job.application_deadline).toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"}) : null;

  return (
    <div className="ja-wrap">
      <style>{styles}</style>

      <div className="ja-hero">
        <div className="ja-blob ja-blob--1"/><div className="ja-blob ja-blob--2"/><div className="ja-blob ja-blob--3"/><div className="ja-grid"/>
        <div className="ja-hero-inner">
          <button className="ja-back-btn" onClick={()=>navigate(-1)}><ArrowLeftIcon/>Back</button>
          <div className="ja-badge"><span className="ja-badge-dot"/>Job Application</div>
          <h1 className="ja-hero-title">Apply for <span>{job.title}</span></h1>
          <div className="ja-hero-meta">
            <span className="ja-hero-chip"><BriefcaseIcon/>{job.company_name}</span>
            {job.location && <span className="ja-hero-chip"><MapPinIcon/>{job.location}</span>}
            {deadlineLabel && <span className="ja-hero-chip"><CalendarIcon/>Deadline: {deadlineLabel}</span>}
            {(job.type||job.job_type) && <span className="ja-hero-chip"><ClockIcon/>{job.type||job.job_type}</span>}
          </div>
        </div>
      </div>

      <div className="ja-card-wrap">
        <div className="ja-card">
          {job.description && (
            <>
              <p className="ja-section-label">About the Role</p>
              <p className="ja-desc">{job.description}</p>
              <div className="ja-divider"/>
            </>
          )}

          <form onSubmit={handleSubmit}>
            <p className="ja-section-label">Upload Your CV</p>
            <label className="ja-upload-label">Accepted formats: PDF, DOC, DOCX · Max size: 5 MB</label>
            <div
              className={`ja-upload-zone${dragActive?" ja-upload-zone--active":""}${selectedFile?" ja-upload-zone--has-file":""}`}
              onDragEnter={(e)=>{e.preventDefault();setDragActive(true);}}
              onDragLeave={()=>setDragActive(false)}
              onDragOver={(e)=>e.preventDefault()}
              onDrop={handleDrop}
            >
              <input type="file" name="resume" accept=".pdf,.doc,.docx" className="ja-file-input" onChange={(e)=>handleFileChange(e.target.files?.[0])}/>
              {!selectedFile ? (
                <>
                  <div className="ja-upload-icon"><DocumentArrowUpIcon/></div>
                  <p className="ja-upload-title">Drag & drop your CV here</p>
                  <p className="ja-upload-sub">or click to browse files</p>
                </>
              ) : (
                <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:8}}>
                  <div style={{width:44,height:44,borderRadius:12,background:"#f0fdf4",display:"flex",alignItems:"center",justifyContent:"center",color:"#16a34a"}}>
                    <CheckCircleIcon style={{width:24,height:24}}/>
                  </div>
                  <p style={{fontSize:14,fontWeight:600,color:"#16a34a",margin:0}}>File ready to upload</p>
                  <p className="ja-upload-sub">Click to change file</p>
                </div>
              )}
            </div>
            {selectedFile && (
              <div className="ja-file-name">
                <PaperClipIcon/>
                {selectedFile.name}
                <span style={{marginLeft:"auto",fontSize:12,color:"#9ca3af"}}>{(selectedFile.size/1024).toFixed(0)} KB</span>
              </div>
            )}
            <button type="submit" className="ja-submit-btn" disabled={submitting}>
              {submitting ? <><div className="ja-spinner"/>Submitting…</> : <><RocketLaunchIcon style={{width:18,height:18}}/>Submit Application</>}
            </button>
          </form>

          <div className="ja-tips">
            <p className="ja-tips-title">💡 Tips for a strong application</p>
            <ul className="ja-tips-list">
              <li>Tailor your CV to match the job's required skills</li>
              <li>Use PDF format for best compatibility</li>
              <li>Keep your CV to 1–2 pages, focused and clear</li>
              <li>Double-check contact info before submitting</li>
            </ul>
          </div>
        </div>
      </div>
      <div className="ja-bottom"/>
    </div>
  );
}

export default JobApplicationPage;