import React, { useEffect, useState } from "react";
import { getHRJobs } from "../services/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { BriefcaseIcon, UsersIcon, CalendarIcon, ChartBarIcon } from "@heroicons/react/24/outline";
import JobModal from "./JobModal";

const getJobStatus = (job) => {
  if (!job.application_deadline) return "unknown";

  const today = new Date().toISOString().split("T")[0];
  const deadline = job.application_deadline.split("T")[0];

  return deadline >= today ? "active" : "expired";
};
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

  .hr-wrap * { box-sizing: border-box; }
  .hr-wrap { font-family: 'DM Sans', sans-serif; min-height: 100vh; background: #f5f6ff; color: #1e1b3a; }

  /* Hero */
  .hr-hero {
    position: relative; overflow: hidden;
    background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 52%, #ede9fe 100%);
    padding: 40px 40px 72px; border-bottom: 1px solid #ddd6fe;
  }
  .hr-blob { position: absolute; border-radius: 50%; filter: blur(80px); opacity: .2; pointer-events: none; }
  .hr-blob--1 { width: 420px; height: 420px; background: radial-gradient(circle,#6366f1,transparent); top: -120px; left: -60px; animation: hr-drift 12s ease-in-out infinite alternate; }
  .hr-blob--2 { width: 260px; height: 260px; background: radial-gradient(circle,#8b5cf6,transparent); bottom: -60px; right: 8%; animation: hr-drift 16s ease-in-out infinite alternate-reverse; }
  @keyframes hr-drift { 0%{transform:translate(0,0)} 100%{transform:translate(22px,12px)} }
  .hr-grid { position: absolute; inset: 0; pointer-events: none; background-image: linear-gradient(rgba(99,102,241,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,.06) 1px,transparent 1px); background-size: 40px 40px; }

  .hr-hero-inner { position: relative; z-index: 1; max-width: 1100px; margin: 0 auto; }
  .hr-hero-title { font-family: 'Syne', sans-serif; font-size: clamp(22px,3.5vw,34px); font-weight: 800; color: #1e1b3a; margin: 0 0 6px; letter-spacing: -.3px; }
  .hr-hero-sub { font-size: 15px; color: #6b7280; margin: 0 0 24px; }
  .hr-hero-actions { display: flex; gap: 10px; }

  /* Stats strip */
  .hr-stats-strip { position: relative; z-index: 10; margin: -28px auto 0; max-width: 1100px; padding: 0 40px; }
  .hr-stats-inner { background: #fff; border: 1px solid #e0e7ff; border-radius: 14px; display: grid; grid-template-columns: repeat(4,1fr); box-shadow: 0 8px 32px rgba(99,102,241,.1); }
  .hr-stat-item { padding: 18px 20px; display: flex; align-items: center; gap: 14px; }
  .hr-stat-item:not(:last-child) { border-right: 1px solid #e0e7ff; }
  .hr-stat-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .hr-stat-icon svg { width: 20px; height: 20px; }
  .hr-stat-label { font-size: 11px; font-weight: 700; letter-spacing: .5px; text-transform: uppercase; color: #9ca3af; }
  .hr-stat-val { font-size: 22px; font-weight: 800; color: #1e1b3a; }

  /* Main */
  .hr-main { max-width: 1100px; margin: 0 auto; padding: 36px 40px 80px; }
  .hr-section-title { font-family: 'Syne', sans-serif; font-size: 20px; font-weight: 700; color: #1e1b3a; margin: 0 0 4px; }
  .hr-section-sub { font-size: 13px; color: #9ca3af; margin: 0 0 20px; }

  /* Cards grid */
  .hr-cards { display: grid; grid-template-columns: repeat(auto-fill,minmax(320px,1fr)); gap: 20px; }

  /* Job card */
  .hr-card { background: #fff; border: 1px solid #e8eaf6; border-radius: 16px; padding: 22px; cursor: pointer; transition: all .25s; animation: hr-in .4s ease both; }
  .hr-card:hover { border-color: #c7d2fe; box-shadow: 0 8px 32px rgba(99,102,241,.12); transform: translateY(-3px); }
  @keyframes hr-in { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  .hr-card-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px; }
  .hr-card-icon { width: 44px; height: 44px; border-radius: 12px; background: #eef2ff; display: flex; align-items: center; justify-content: center; transition: all .25s; }
  .hr-card:hover .hr-card-icon { background: linear-gradient(135deg,#4f46e5,#7c3aed); }
  .hr-card-icon svg { width: 22px; height: 22px; color: #6366f1; transition: color .25s; }
  .hr-card:hover .hr-card-icon svg { color: #fff; }
  .hr-status-pill { padding: 3px 10px; border-radius: 100px; font-size: 11px; font-weight: 700; }
  .hr-status-pill--active { background: #dcfce7; color: #15803d; }
  .hr-status-pill--expired { background: #fee2e2; color: #b91c1c; }
  .hr-card-title { font-family: 'Syne', sans-serif; font-size: 17px; font-weight: 700; color: #1e1b3a; margin: 0 0 6px; transition: color .2s; }
  .hr-card:hover .hr-card-title { color: #4f46e5; }
  .hr-card-desc { font-size: 13px; color: #6b7280; line-height: 1.6; margin-bottom: 16px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  .hr-card-footer { border-top: 1px solid #e8eaf6; padding-top: 14px; display: flex; justify-content: space-between; align-items: center; }
  .hr-card-apps { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #6b7280; font-weight: 500; }
  .hr-card-apps svg { width: 15px; height: 15px; color: #6366f1; }
  .hr-card-link { font-size: 13px; color: #4f46e5; font-weight: 600; display: flex; align-items: center; gap: 4px; transition: gap .2s; }
  .hr-card:hover .hr-card-link { gap: 7px; }

  /* Empty */
  .hr-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 80px 20px; background: #fff; border: 1px solid #e0e7ff; border-radius: 16px; text-align: center; }
  .hr-empty svg { width: 56px; height: 56px; color: #c7d2fe; margin-bottom: 16px; }
  .hr-empty-title { font-family: 'Syne',sans-serif; font-size: 22px; font-weight: 700; color: #1e1b3a; margin-bottom: 8px; }
  .hr-empty-sub { font-size: 14px; color: #9ca3af; margin-bottom: 24px; }

  /* Buttons */
  .hr-btn { display: inline-flex; align-items: center; gap: 8px; padding: 10px 20px; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; border: none; transition: all .2s; font-family: 'DM Sans',sans-serif; }
  .hr-btn--primary { background: linear-gradient(135deg,#4f46e5,#7c3aed); color: #fff; box-shadow: 0 6px 18px rgba(79,70,229,.25); }
  .hr-btn--primary:hover { transform: translateY(-2px); box-shadow: 0 10px 26px rgba(79,70,229,.35); }
  .hr-btn--outline { background: #fff; border: 1px solid #e0e7ff; color: #4b5563; }
  .hr-btn--outline:hover { border-color: #c7d2fe; color: #4f46e5; }

  /* Loading */
  .hr-loading { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 60vh; gap: 20px; }
  .hr-spinner { width: 44px; height: 44px; border: 3px solid #e0e7ff; border-top-color: #6366f1; border-radius: 50%; animation: hr-spin .8s linear infinite; }
  @keyframes hr-spin { to{transform:rotate(360deg)} }

  @media(max-width:900px){ .hr-stats-inner{grid-template-columns:repeat(2,1fr)} }
  @media(max-width:640px){ .hr-hero{padding:28px 16px 60px} .hr-stats-strip{padding:0 16px} .hr-main{padding:28px 16px 60px} .hr-stats-inner{grid-template-columns:1fr} .hr-stat-item:not(:last-child){border-right:none;border-bottom:1px solid #e0e7ff} }
`;


function HRAnalytics() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [showJobModal, setShowJobModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const { logout } = useAuth();
  

  useEffect(() => { fetchJobs(); }, []);


  const handleCreateJob = () => {
  setEditingJob(null);
  setShowJobModal(true);
};

  const handleJobModalClose = () => {
    setShowJobModal(false);
    setEditingJob(null);
  };

  const handleJobModalSuccess = () => {
    setShowJobModal(false);
    setEditingJob(null);
    fetchJobs(); // or refresh analytics
  };
  

  const fetchJobs = async () => {
    setLoading(true);
    try { const data = await getHRJobs(); setJobs(data); }
    catch (err) { console.error("Failed to fetch HR jobs:", err); }
    finally { setLoading(false); }
  };

  if (loading) return (
    <div className="hr-wrap"><style>{styles}</style>
      <div className="hr-loading"><div className="hr-spinner"/><p style={{color:"#6366f1",fontWeight:500}}>Loading analytics…</p></div>
    </div>
  );

  const totalApps = jobs.reduce((acc,job)=>acc+(job.applications?.length||0),0);
  const activeJobs = jobs.filter(j=>getJobStatus(j)==="active").length;
  const avgApps = jobs.length > 0 ? Math.round(totalApps/jobs.length) : 0;

  return (
    <div className="hr-wrap">
      <style>{styles}</style>

      {/* Hero */}
      <div className="hr-hero">
        <div className="hr-blob hr-blob--1"/><div className="hr-blob hr-blob--2"/><div className="hr-grid"/>
        <div className="hr-hero-inner">
          <h1 className="hr-hero-title">📊 HR Analytics Dashboard</h1>
          <p className="hr-hero-sub">Monitor your job postings and application insights.</p>
          <div className="hr-hero-actions">
            <button className="hr-btn hr-btn--primary" onClick={handleCreateJob}>📝 Create New Job</button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="hr-stats-strip">
        <div className="hr-stats-inner">
          <div className="hr-stat-item">
            <div className="hr-stat-icon" style={{background:"#eef2ff"}}><BriefcaseIcon style={{color:"#4f46e5"}}/></div>
            <div><div className="hr-stat-label">Total Jobs</div><div className="hr-stat-val">{jobs.length}</div></div>
          </div>
          <div className="hr-stat-item">
            <div className="hr-stat-icon" style={{background:"#f0fdf4"}}><UsersIcon style={{color:"#16a34a"}}/></div>
            <div><div className="hr-stat-label">Total Applications</div><div className="hr-stat-val">{totalApps}</div></div>
          </div>
          <div className="hr-stat-item">
            <div className="hr-stat-icon" style={{background:"#f5f3ff"}}><ChartBarIcon style={{color:"#7c3aed"}}/></div>
            <div><div className="hr-stat-label">Active Positions</div><div className="hr-stat-val">{activeJobs}</div></div>
          </div>
          <div className="hr-stat-item">
            <div className="hr-stat-icon" style={{background:"#fff7ed"}}><CalendarIcon style={{color:"#ea580c"}}/></div>
            <div><div className="hr-stat-label">Avg Apps / Job</div><div className="hr-stat-val">{avgApps}</div></div>
          </div>
        </div>
      </div>

      <div className="hr-main">
        {jobs.length === 0 ? (
          <div className="hr-empty">
            <BriefcaseIcon/>
            <h3 className="hr-empty-title">No Jobs Posted Yet</h3>
            <p className="hr-empty-sub">Start by creating your first job posting.</p>
            <button className="hr-btn hr-btn--primary" onClick={handleCreateJob}>
  📝 Create Your First Job
</button>
          </div>
        ) : (
          <>
            <h2 className="hr-section-title">Your Job Postings</h2>
            <p className="hr-section-sub">Click on any job to view detailed analytics and applications</p>
            <div className="hr-cards">
              {jobs.map((job, i) => {
                const status = getJobStatus(job);
                return (
                  <div key={job.id} className="hr-card" style={{animationDelay:`${i*50}ms`}} onClick={()=>navigate(`/hr/job/${job.id}`)}>
                    <div className="hr-card-top">
                      <div className="hr-card-icon"><BriefcaseIcon/></div>
                      <span className={`hr-status-pill ${status==="active"?"hr-status-pill--active":"hr-status-pill--expired"}`}>
                        {status === "active" ? "Active" : "Expired"}
                      </span>
                    </div>
                    <h3 className="hr-card-title">{job.title}</h3>
                    <p className="hr-card-desc">{job.description || "No description provided."}</p>
                    <div className="hr-card-footer">
                      <span className="hr-card-apps"><UsersIcon/>{job.applications?.length||0} Applications</span>
                      <span className="hr-card-link" onClick={e=>{e.stopPropagation();navigate(`/hr/job/${job.id}`);}}>View Details →</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
        {showJobModal && (
  <JobModal
    initialJob={editingJob}
    onClose={handleJobModalClose}
    onSuccess={handleJobModalSuccess}
  />
)}
      </div>
    </div>
  );
}

export default HRAnalytics;