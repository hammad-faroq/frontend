import React, { useState, useEffect } from "react";
import { listJobs, getAppliedJobs } from "../services/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  MagnifyingGlassIcon, MapPinIcon, BriefcaseIcon,
  ClockIcon, CurrencyDollarIcon, XMarkIcon,
  FunnelIcon, CheckCircleIcon,
} from "@heroicons/react/24/outline";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

  .jsj-wrap * { box-sizing: border-box; }
  .jsj-wrap { font-family: 'DM Sans', sans-serif; min-height: 100vh; background: #f5f6ff; color: #1e1b3a; }

  /* Hero */
  .jsj-hero {
    position: relative; overflow: hidden;
    background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 52%, #ede9fe 100%);
    padding: 40px 40px 72px; border-bottom: 1px solid #ddd6fe;
  }
  .jsj-blob { position: absolute; border-radius: 50%; filter: blur(80px); opacity: .2; pointer-events: none; }
  .jsj-blob--1 { width: 420px; height: 420px; background: radial-gradient(circle,#6366f1,transparent); top: -120px; left: -60px; animation: jsj-drift 12s ease-in-out infinite alternate; }
  .jsj-blob--2 { width: 260px; height: 260px; background: radial-gradient(circle,#10b981,transparent); bottom: -60px; right: 6%; animation: jsj-drift 16s ease-in-out infinite alternate-reverse; }
  @keyframes jsj-drift { 0%{transform:translate(0,0)} 100%{transform:translate(22px,12px)} }
  .jsj-grid-bg { position: absolute; inset: 0; pointer-events: none; background-image: linear-gradient(rgba(99,102,241,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,.06) 1px,transparent 1px); background-size: 40px 40px; }

  .jsj-hero-inner { position: relative; z-index: 1; max-width: 1100px; margin: 0 auto; }
  .jsj-hero-title { font-family: 'Syne', sans-serif; font-size: clamp(22px,3.5vw,34px); font-weight: 800; color: #1e1b3a; margin: 0 0 6px; letter-spacing: -.3px; }
  .jsj-hero-sub { font-size: 15px; color: #6b7280; margin: 0; }

  /* Stats strip */
  .jsj-stats-strip { position: relative; z-index: 10; margin: -24px auto 0; max-width: 1100px; padding: 0 40px; }
  .jsj-stats-inner { background: #fff; border: 1px solid #e0e7ff; border-radius: 14px; display: grid; grid-template-columns: repeat(3,1fr); box-shadow: 0 8px 32px rgba(99,102,241,.1); }
  .jsj-stat { padding: 16px 20px; display: flex; align-items: center; gap: 12px; }
  .jsj-stat:not(:last-child) { border-right: 1px solid #e0e7ff; }
  .jsj-stat-icon { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .jsj-stat-icon svg { width: 18px; height: 18px; }
  .jsj-stat-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .5px; color: #9ca3af; }
  .jsj-stat-val { font-size: 20px; font-weight: 800; color: #1e1b3a; }

  /* Main */
  .jsj-main { max-width: 1100px; margin: 0 auto; padding: 32px 40px 80px; }

  /* Filters */
  .jsj-filter-card { background: #fff; border: 1px solid #e0e7ff; border-radius: 14px; padding: 18px 20px; margin-bottom: 24px; box-shadow: 0 4px 16px rgba(99,102,241,.06); }
  .jsj-filter-grid { display: grid; grid-template-columns: 2fr 1fr 1fr auto; gap: 12px; align-items: end; }
  .jsj-field { display: flex; flex-direction: column; gap: 5px; }
  .jsj-field label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .5px; color: #9ca3af; }
  .jsj-input-wrap { position: relative; }
  .jsj-input-wrap svg { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); width: 14px; height: 14px; color: #9ca3af; pointer-events: none; }
  .jsj-input { width: 100%; padding: 9px 12px 9px 32px; border: 1px solid #e0e7ff; border-radius: 10px; font-family: 'DM Sans',sans-serif; font-size: 14px; color: #1e1b3a; background: #f5f6ff; outline: none; transition: all .2s; }
  .jsj-input:focus { border-color: #a5b4fc; background: #fff; }
  .jsj-select { width: 100%; padding: 9px 12px; border: 1px solid #e0e7ff; border-radius: 10px; font-family: 'DM Sans',sans-serif; font-size: 14px; color: #1e1b3a; background: #f5f6ff; outline: none; cursor: pointer; transition: all .2s; }
  .jsj-select:focus { border-color: #a5b4fc; background: #fff; }
  .jsj-clear-btn { display: inline-flex; align-items: center; gap: 6px; padding: 9px 14px; border-radius: 10px; font-size: 13px; font-weight: 600; cursor: pointer; background: #f5f6ff; border: 1px solid #e0e7ff; color: #6b7280; transition: all .2s; font-family: 'DM Sans',sans-serif; white-space: nowrap; }
  .jsj-clear-btn:hover { border-color: #c7d2fe; color: #4f46e5; }
  .jsj-clear-btn svg { width: 13px; height: 13px; }

  /* Section title */
  .jsj-section-title { font-family: 'Syne',sans-serif; font-size: 18px; font-weight: 700; color: #1e1b3a; margin: 0 0 16px; }

  /* Jobs grid */
  .jsj-jobs-grid { display: grid; grid-template-columns: repeat(auto-fill,minmax(340px,1fr)); gap: 20px; }

  /* Job card */
  .jsj-card { background: #fff; border: 1px solid #e8eaf6; border-radius: 16px; padding: 22px; transition: all .25s; animation: jsj-in .4s ease both; }
  .jsj-card:hover { border-color: #c7d2fe; box-shadow: 0 8px 28px rgba(99,102,241,.1); transform: translateY(-2px); }
  @keyframes jsj-in { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  .jsj-card-head { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; gap: 10px; }
  .jsj-card-icon { width: 44px; height: 44px; border-radius: 12px; background: #eef2ff; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .jsj-card-icon svg { width: 22px; height: 22px; color: #6366f1; }
  .jsj-applied-badge { display: inline-flex; align-items: center; gap: 4px; background: #dcfce7; border: 1px solid #bbf7d0; color: #15803d; padding: 3px 10px; border-radius: 100px; font-size: 11px; font-weight: 700; }
  .jsj-applied-badge svg { width: 12px; height: 12px; }
  .jsj-card-title { font-family: 'Syne',sans-serif; font-size: 17px; font-weight: 700; color: #1e1b3a; margin: 0 0 4px; }
  .jsj-card-company { font-size: 14px; color: #4f46e5; font-weight: 600; margin-bottom: 10px; }
  .jsj-card-chips { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 12px; }
  .jsj-chip { display: inline-flex; align-items: center; gap: 4px; background: rgba(99,102,241,.08); border: 1px solid rgba(99,102,241,.15); border-radius: 100px; padding: 3px 10px; font-size: 11px; color: #4f46e5; font-weight: 500; }
  .jsj-chip svg { width: 11px; height: 11px; }
  .jsj-card-desc { font-size: 13px; color: #6b7280; line-height: 1.6; margin-bottom: 16px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  .jsj-card-footer { display: flex; justify-content: space-between; align-items: center; gap: 8px; flex-wrap: wrap; }

  /* Buttons */
  .jsj-btn { display: inline-flex; align-items: center; gap: 6px; padding: 9px 16px; border-radius: 10px; font-size: 13px; font-weight: 600; cursor: pointer; border: none; transition: all .2s; font-family: 'DM Sans',sans-serif; }
  .jsj-btn--ghost { background: #f5f6ff; border: 1px solid #e0e7ff; color: #4f46e5; }
  .jsj-btn--ghost:hover { background: #eef2ff; }
  .jsj-btn--primary { background: linear-gradient(135deg,#4f46e5,#7c3aed); color: #fff; box-shadow: 0 4px 14px rgba(79,70,229,.2); }
  .jsj-btn--primary:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(79,70,229,.3); }

  /* Empty */
  .jsj-empty { grid-column: 1/-1; text-align: center; padding: 60px 20px; background: #fff; border: 1px solid #e0e7ff; border-radius: 16px; }
  .jsj-empty-emoji { font-size: 52px; margin-bottom: 14px; }
  .jsj-empty-title { font-family: 'Syne',sans-serif; font-size: 20px; font-weight: 700; color: #1e1b3a; margin-bottom: 8px; }
  .jsj-empty-sub { font-size: 14px; color: #9ca3af; }

  /* Modal */
  .jsj-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.4); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 50; padding: 20px; }
  .jsj-modal { background: #fff; border: 1px solid #e0e7ff; border-radius: 20px; box-shadow: 0 24px 72px rgba(99,102,241,.18); max-width: 640px; width: 100%; max-height: 90vh; overflow-y: auto; animation: jsj-modal-in .25s ease; }
  @keyframes jsj-modal-in { from{opacity:0;transform:scale(.96)} to{opacity:1;transform:scale(1)} }
  .jsj-modal-head { padding: 24px 24px 0; border-bottom: 1px solid #e0e7ff; padding-bottom: 18px; display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }
  .jsj-modal-title { font-family: 'Syne',sans-serif; font-size: 22px; font-weight: 800; color: #1e1b3a; margin: 0 0 4px; }
  .jsj-modal-company { font-size: 15px; color: #4f46e5; font-weight: 600; }
  .jsj-modal-close { width: 32px; height: 32px; border-radius: 50%; border: none; background: #f3f4f6; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 16px; color: #6b7280; transition: all .2s; flex-shrink: 0; }
  .jsj-modal-close:hover { background: #e0e7ff; color: #4f46e5; }
  .jsj-modal-body { padding: 20px 24px; }
  .jsj-modal-section-title { font-family: 'Syne',sans-serif; font-size: 15px; font-weight: 700; color: #1e1b3a; margin: 0 0 8px; }
  .jsj-modal-text { font-size: 14px; color: #4b5563; line-height: 1.75; white-space: pre-line; margin-bottom: 20px; }
  .jsj-skills-wrap { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 20px; }
  .jsj-skill-tag { background: #eef2ff; border: 1px solid #c7d2fe; color: #4f46e5; padding: 4px 12px; border-radius: 100px; font-size: 12px; font-weight: 600; }
  .jsj-modal-footer { padding: 16px 24px; border-top: 1px solid #e0e7ff; background: #f5f6ff; border-radius: 0 0 20px 20px; display: flex; justify-content: flex-end; gap: 10px; }

  /* Loading */
  .jsj-loading { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 60vh; gap: 20px; }
  .jsj-spinner { width: 44px; height: 44px; border: 3px solid #e0e7ff; border-top-color: #6366f1; border-radius: 50%; animation: jsj-spin .8s linear infinite; }
  @keyframes jsj-spin { to{transform:rotate(360deg)} }

  @media(max-width:900px){ .jsj-stats-inner{grid-template-columns:1fr} .jsj-stat:not(:last-child){border-right:none;border-bottom:1px solid #e0e7ff} .jsj-filter-grid{grid-template-columns:1fr 1fr} }
  @media(max-width:640px){ .jsj-hero{padding:28px 16px 60px} .jsj-stats-strip{padding:0 16px} .jsj-main{padding:28px 16px 60px} .jsj-jobs-grid{grid-template-columns:1fr} .jsj-filter-grid{grid-template-columns:1fr} }
`;

function JobSeekerJobs() {
  const { role } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedJob, setSelectedJob] = useState(null);
  const [filters, setFilters] = useState({ search: "", type: "all", location: "" });
  const navigate = useNavigate();

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [jobsData, appliedData] = await Promise.all([listJobs(), getAppliedJobs()]);
      setJobs(Array.isArray(jobsData) ? jobsData : []);
      setAppliedJobs(Array.isArray(appliedData) ? appliedData : []);
    } catch { setError("Failed to load jobs. Please try refreshing."); }
    finally { setLoading(false); }
  };

  const isApplied = (jobId) => appliedJobs.some(a => a.job_id === jobId);

  const filteredJobs = jobs.filter(job => {
    if (filters.search) {
      const s = filters.search.toLowerCase();
      if (!job.title?.toLowerCase().includes(s) && !job.company_name?.toLowerCase().includes(s) && !job.description?.toLowerCase().includes(s)) return false;
    }
    if (filters.type !== "all" && job.type !== filters.type) return false;
    if (filters.location && !job.location?.toLowerCase().includes(filters.location.toLowerCase())) return false;
    return true;
  });

  const appliedCount = jobs.filter(j=>isApplied(j.id)).length;

  if (loading) return (
    <div className="jsj-wrap"><style>{styles}</style>
      <div className="jsj-loading"><div className="jsj-spinner"/><p style={{color:"#6366f1",fontWeight:500}}>Loading jobs…</p></div>
    </div>
  );

  return (
    <div className="jsj-wrap">
      <style>{styles}</style>

      {/* Hero */}
      <div className="jsj-hero">
        <div className="jsj-blob jsj-blob--1"/><div className="jsj-blob jsj-blob--2"/><div className="jsj-grid-bg"/>
        <div className="jsj-hero-inner">
          <h1 className="jsj-hero-title">Browse Jobs</h1>
          <p className="jsj-hero-sub">Find your next career opportunity from {jobs.length} positions</p>
        </div>
      </div>

      {/* Stats */}
      <div className="jsj-stats-strip">
        <div className="jsj-stats-inner">
          <div className="jsj-stat">
            <div className="jsj-stat-icon" style={{background:"#eef2ff"}}><BriefcaseIcon style={{color:"#4f46e5"}}/></div>
            <div><div className="jsj-stat-label">Total Jobs</div><div className="jsj-stat-val">{jobs.length}</div></div>
          </div>
          <div className="jsj-stat">
            <div className="jsj-stat-icon" style={{background:"#f0fdf4"}}><CheckCircleIcon style={{color:"#16a34a"}}/></div>
            <div><div className="jsj-stat-label">Applied</div><div className="jsj-stat-val">{appliedCount}</div></div>
          </div>
          <div className="jsj-stat">
            <div className="jsj-stat-icon" style={{background:"#f5f3ff"}}><FunnelIcon style={{color:"#7c3aed"}}/></div>
            <div><div className="jsj-stat-label">Filtered</div><div className="jsj-stat-val">{filteredJobs.length}</div></div>
          </div>
        </div>
      </div>

      <div className="jsj-main">
        {/* Filters */}
        <div className="jsj-filter-card">
          <div className="jsj-filter-grid">
            <div className="jsj-field">
              <label>Search</label>
              <div className="jsj-input-wrap">
                <MagnifyingGlassIcon/>
                <input className="jsj-input" placeholder="Job title, company, or keywords" value={filters.search} onChange={e=>setFilters({...filters,search:e.target.value})}/>
              </div>
            </div>
            <div className="jsj-field">
              <label>Job Type</label>
              <select className="jsj-select" value={filters.type} onChange={e=>setFilters({...filters,type:e.target.value})}>
                <option value="all">All Types</option>
                <option value="full_time">Full-time</option>
                <option value="part_time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
                <option value="remote">Remote</option>
              </select>
            </div>
            <div className="jsj-field">
              <label>Location</label>
              <div className="jsj-input-wrap">
                <MapPinIcon/>
                <input className="jsj-input" placeholder="City or country" value={filters.location} onChange={e=>setFilters({...filters,location:e.target.value})}/>
              </div>
            </div>
            <button className="jsj-clear-btn" onClick={()=>setFilters({search:"",type:"all",location:""})}><XMarkIcon/>Clear</button>
          </div>
        </div>

        {/* Grid */}
        <h2 className="jsj-section-title">
          {filters.search||filters.location||filters.type!=="all" ? `${filteredJobs.length} result${filteredJobs.length!==1?"s":""} found` : "All Open Positions"}
        </h2>
        <div className="jsj-jobs-grid">
          {filteredJobs.length === 0 ? (
            <div className="jsj-empty">
              <div className="jsj-empty-emoji">💼</div>
              <h3 className="jsj-empty-title">No jobs found</h3>
              <p className="jsj-empty-sub">Try adjusting your filters or check back later</p>
            </div>
          ) : filteredJobs.map((job, i) => (
            <div key={job.id} className="jsj-card" style={{animationDelay:`${i*40}ms`}}>
              <div className="jsj-card-head">
                <div className="jsj-card-icon"><BriefcaseIcon/></div>
                {isApplied(job.id) && <span className="jsj-applied-badge"><CheckCircleIcon/>Applied</span>}
              </div>
              <h3 className="jsj-card-title">{job.title}</h3>
              <p className="jsj-card-company">{job.company_name}</p>
              <div className="jsj-card-chips">
                {job.location && <span className="jsj-chip"><MapPinIcon/>{job.location}</span>}
                {job.type && <span className="jsj-chip"><ClockIcon/>{job.type}</span>}
                {(job.salary||job.salary_range) && <span className="jsj-chip"><CurrencyDollarIcon/>{job.salary||job.salary_range}</span>}
              </div>
              <p className="jsj-card-desc">{job.description || "No description available."}</p>
              <div className="jsj-card-footer">
                <button className="jsj-btn jsj-btn--ghost" onClick={()=>setSelectedJob(job)}>View Details</button>
                {role?.toLowerCase() !== "hr" && (
                  <button className="jsj-btn jsj-btn--primary" onClick={()=>navigate(`/apply/${job.id}`)}>Apply Now</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedJob && (
        <div className="jsj-modal-overlay" onClick={()=>setSelectedJob(null)}>
          <div className="jsj-modal" onClick={e=>e.stopPropagation()}>
            <div className="jsj-modal-head">
              <div>
                <h2 className="jsj-modal-title">{selectedJob.title}</h2>
                <p className="jsj-modal-company">{selectedJob.company_name} · {selectedJob.location}</p>
              </div>
              <button className="jsj-modal-close" onClick={()=>setSelectedJob(null)}>✕</button>
            </div>
            <div className="jsj-modal-body">
              <div className="jsj-card-chips" style={{marginBottom:16}}>
                {selectedJob.type && <span className="jsj-chip"><ClockIcon/>{selectedJob.type}</span>}
                {(selectedJob.salary||selectedJob.salary_range) && <span className="jsj-chip"><CurrencyDollarIcon/>{selectedJob.salary||selectedJob.salary_range}</span>}
              </div>
              {selectedJob.description && (
                <>
                  <h3 className="jsj-modal-section-title">Job Description</h3>
                  <p className="jsj-modal-text">{selectedJob.description}</p>
                </>
              )}
              {selectedJob.requirements && (
                <>
                  <h3 className="jsj-modal-section-title">Requirements</h3>
                  <p className="jsj-modal-text">{selectedJob.requirements}</p>
                </>
              )}
              {selectedJob.skills && (
                <>
                  <h3 className="jsj-modal-section-title">Required Skills</h3>
                  <div className="jsj-skills-wrap">
                    {selectedJob.skills.split(',').map((s,i)=><span key={i} className="jsj-skill-tag">{s.trim()}</span>)}
                  </div>
                </>
              )}
            </div>
            <div className="jsj-modal-footer">
              <button className="jsj-btn jsj-btn--ghost" onClick={()=>setSelectedJob(null)}>Close</button>
              {role?.toLowerCase() !== "hr" && (
                <button className="jsj-btn jsj-btn--primary" onClick={()=>navigate(`/apply/${selectedJob.id}`)}>Apply Now</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default JobSeekerJobs;