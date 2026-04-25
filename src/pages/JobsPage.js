import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listJobs } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { EyeIcon, MagnifyingGlassIcon, MapPinIcon, CalendarIcon, BriefcaseIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { getAppliedJobs } from "../services/api";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

  .jp-wrap * { box-sizing: border-box; }
  .jp-wrap { font-family: 'DM Sans', sans-serif; min-height: 100vh; background: #f5f6ff; color: #1e1b3a; }

  .jp-hero {
    position: relative; overflow: hidden;
    background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 52%, #ede9fe 100%);
    padding: 48px 40px 56px; border-bottom: 1px solid #ddd6fe;
  }
  .jp-blob { position: absolute; border-radius: 50%; filter: blur(80px); opacity: .2; pointer-events: none; }
  .jp-blob--1 { width: 420px; height: 420px; background: radial-gradient(circle,#6366f1,transparent); top: -120px; left: -60px; animation: jp-drift 12s ease-in-out infinite alternate; }
  .jp-blob--2 { width: 300px; height: 300px; background: radial-gradient(circle,#10b981,transparent); bottom: -90px; right: 8%; animation: jp-drift 15s ease-in-out infinite alternate-reverse; }
  @keyframes jp-drift { 0%{transform:translate(0,0) scale(1)} 100%{transform:translate(24px,14px) scale(1.06)} }
  .jp-grid { position: absolute; inset: 0; pointer-events: none; background-image: linear-gradient(rgba(99,102,241,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,.06) 1px,transparent 1px); background-size: 40px 40px; }

  .jp-hero-inner { position: relative; z-index: 1; max-width: 1100px; margin: 0 auto; }
  .jp-badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(99,102,241,.12); border: 1px solid rgba(99,102,241,.3); color: #4f46e5; padding: 5px 14px; border-radius: 100px; font-size: 11px; font-weight: 700; letter-spacing: .6px; text-transform: uppercase; margin-bottom: 16px; }
  .jp-badge-dot { width: 7px; height: 7px; border-radius: 50%; background: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,.2); animation: jp-pulse 2s infinite; }
  @keyframes jp-pulse { 0%,100%{box-shadow:0 0 0 3px rgba(99,102,241,.2)} 50%{box-shadow:0 0 0 6px rgba(99,102,241,.06)} }
  .jp-hero-title { font-family: 'Syne', sans-serif; font-size: clamp(24px,3.5vw,38px); font-weight: 800; color: #1e1b3a; margin: 0 0 10px; letter-spacing: -.5px; }
  .jp-hero-title span { background: linear-gradient(90deg,#4f46e5,#7c3aed); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
  .jp-hero-sub { color: #6b7280; font-size: 14px; margin: 0; }

  .jp-search-wrap { max-width: 1100px; margin: -28px auto 0; padding: 0 40px; position: relative; z-index: 10; }
  .jp-search-row { background: #fff; border: 1px solid #e0e7ff; border-radius: 16px; padding: 16px 20px; display: flex; gap: 12px; flex-wrap: wrap; box-shadow: 0 8px 32px rgba(99,102,241,.1); }
  .jp-input-wrap { flex: 1; min-width: 200px; position: relative; }
  .jp-input-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); width: 16px; height: 16px; color: #6366f1; pointer-events: none; }
  .jp-input { width: 100%; background: #f8f7ff; border: 1px solid #e0e7ff; border-radius: 10px; padding: 10px 14px 10px 36px; color: #1e1b3a; font-size: 14px; outline: none; font-family: 'DM Sans', sans-serif; transition: border-color .2s, box-shadow .2s; }
  .jp-input::placeholder { color: #9ca3af; }
  .jp-input:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,.1); }
  .jp-select { background: #f8f7ff; border: 1px solid #e0e7ff; border-radius: 10px; padding: 10px 14px; color: #1e1b3a; font-size: 14px; outline: none; font-family: 'DM Sans', sans-serif; cursor: pointer; min-width: 160px; transition: border-color .2s; }
  .jp-select:focus { border-color: #6366f1; }

  .jp-main { max-width: 1100px; margin: 0 auto; padding: 36px 40px 80px; }
  .jp-result-bar { display: flex; align-items: center; margin-bottom: 20px; }
  .jp-result-count { font-size: 13px; color: #9ca3af; }
  .jp-result-count span { color: #4f46e5; font-weight: 700; }

  .jp-card { background: #fff; border: 1px solid #e8eaf6; border-radius: 16px; padding: 22px 24px; margin-bottom: 14px; transition: transform .2s, box-shadow .2s, border-color .2s; animation: jp-card-in .4s ease both; }
  .jp-card:hover { transform: translateY(-3px); box-shadow: 0 12px 40px rgba(99,102,241,.12); border-color: #c7d2fe; }
  @keyframes jp-card-in { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }

  .jp-card-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-bottom: 12px; flex-wrap: wrap; }
  .jp-card-left { display: flex; align-items: flex-start; gap: 14px; }
  .jp-card-icon { width: 48px; height: 48px; border-radius: 12px; flex-shrink: 0; background: linear-gradient(135deg,#eef2ff,#ede9fe); border: 1px solid #e0e7ff; display: flex; align-items: center; justify-content: center; color: #6366f1; }
  .jp-card-title { font-family: 'Syne', sans-serif; font-size: 17px; font-weight: 700; color: #1e1b3a; margin: 0 0 4px; }
  .jp-card-company { font-size: 13px; color: #6b7280; margin: 0; }
  .jp-deadline { font-size: 12px; color: #9ca3af; display: flex; align-items: center; gap: 5px; white-space: nowrap; flex-shrink: 0; }
  .jp-deadline svg { width: 13px; height: 13px; }

  .jp-card-meta { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; flex-wrap: wrap; }
  .jp-meta-chip { display: inline-flex; align-items: center; gap: 5px; background: #f5f3ff; border: 1px solid #ede9fe; border-radius: 100px; padding: 4px 10px; font-size: 12px; color: #7c3aed; font-weight: 500; }
  .jp-meta-chip svg { width: 12px; height: 12px; }
  .jp-applied-tag { display: inline-flex; align-items: center; gap: 5px; background: #d1fae5; border: 1px solid #a7f3d0; color: #065f46; padding: 4px 10px; border-radius: 100px; font-size: 11px; font-weight: 700; }

  .jp-card-desc { font-size: 13.5px; color: #6b7280; line-height: 1.65; margin-bottom: 16px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

  .jp-btn-row { display: flex; gap: 8px; }
  .jp-btn { display: inline-flex; align-items: center; gap: 6px; padding: 9px 18px; border-radius: 10px; font-size: 13px; font-weight: 600; cursor: pointer; border: none; transition: all .2s; font-family: 'DM Sans', sans-serif; }
  .jp-btn--primary { background: linear-gradient(135deg,#4f46e5,#7c3aed); color: #fff; box-shadow: 0 4px 14px rgba(79,70,229,.25); }
  .jp-btn--primary:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(79,70,229,.35); }
  .jp-btn--ghost { background: #f5f6ff; border: 1px solid #e0e7ff; color: #4f46e5; }
  .jp-btn--ghost:hover { background: #eef2ff; transform: translateY(-2px); }
  .jp-btn--disabled { background: #f3f4f6; color: #9ca3af; border: 1px solid #e5e7eb; cursor: not-allowed; }
  .jp-btn svg { width: 14px; height: 14px; }

  .jp-empty { text-align: center; padding: 80px 20px; }
  .jp-empty-icon { font-size: 48px; margin-bottom: 16px; }
  .jp-empty-title { font-family: 'Syne', sans-serif; font-size: 20px; font-weight: 700; color: #1e1b3a; margin-bottom: 8px; }
  .jp-empty-sub { font-size: 14px; color: #9ca3af; }

  .jp-loading { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 60vh; gap: 20px; }
  .jp-spinner { width: 44px; height: 44px; border: 3px solid #e0e7ff; border-top-color: #6366f1; border-radius: 50%; animation: jp-spin .8s linear infinite; }
  @keyframes jp-spin { to{transform:rotate(360deg)} }

  @media(max-width:640px){ .jp-hero{padding:36px 20px 48px} .jp-search-wrap{padding:0 16px} .jp-main{padding:32px 16px 60px} .jp-search-row{flex-direction:column} }
`;

function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLocation, setFilterLocation] = useState("All");
  const { role } = useAuth();
  const navigate = useNavigate();
  const [appliedJobs, setAppliedJobs] = useState([]);

  useEffect(() => {
    getAppliedJobs().then(res => setAppliedJobs(res.applied_jobs || [])).catch(() => {});
  }, []);

  const isExpired = d => { if (!d) return false; const dl = new Date(d); dl.setHours(23,59,59,999); return dl < new Date(); };

  useEffect(() => {
    listJobs()
      .then(data => { const v = Array.isArray(data) ? data : []; setJobs(v); setFilteredJobs(v); })
      .catch(() => setError("Failed to fetch jobs."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let r = jobs.filter(j => !isExpired(j.application_deadline));
    if (searchTerm) r = r.filter(j => j.title.toLowerCase().includes(searchTerm.toLowerCase()) || j.company_name.toLowerCase().includes(searchTerm.toLowerCase()));
    if (filterLocation !== "All") r = r.filter(j => j.location === filterLocation);
    setFilteredJobs(r);
  }, [searchTerm, filterLocation, jobs]);

  const uniqueLocations = ["All", ...new Set(jobs.map(j => j.location).filter(Boolean))];

  if (loading) return <div className="jp-wrap"><style>{styles}</style><div className="jp-loading"><div className="jp-spinner"/><p style={{color:"#6366f1",fontWeight:500}}>Loading job listings…</p></div></div>;
  if (error) return <div className="jp-wrap"><style>{styles}</style><div className="jp-loading"><p style={{color:"#ef4444"}}>{error}</p></div></div>;

  return (
    <div className="jp-wrap">
      <style>{styles}</style>
      <div className="jp-hero">
        <div className="jp-blob jp-blob--1"/><div className="jp-blob jp-blob--2"/><div className="jp-grid"/>
        <div className="jp-hero-inner">
          <div className="jp-badge"><span className="jp-badge-dot"/>Job Board</div>
          <h1 className="jp-hero-title">Find Your <span>Dream Job</span></h1>
          <p className="jp-hero-sub">Browse {jobs.length} live opportunities and apply in seconds</p>
        </div>
      </div>

      <div className="jp-search-wrap">
        <div className="jp-search-row">
          <div className="jp-input-wrap">
            <MagnifyingGlassIcon className="jp-input-icon"/>
            <input type="text" placeholder="Search by title or company…" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="jp-input"/>
          </div>
          <select value={filterLocation} onChange={e => setFilterLocation(e.target.value)} className="jp-select">
            {uniqueLocations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
          </select>
        </div>
      </div>

      <div className="jp-main">
        <div className="jp-result-bar">
          <p className="jp-result-count">Showing <span>{filteredJobs.length}</span> job{filteredJobs.length !== 1 ? "s" : ""}</p>
        </div>
        {filteredJobs.length === 0 ? (
          <div className="jp-empty">
            <div className="jp-empty-icon">🔍</div>
            <h3 className="jp-empty-title">No matching jobs found</h3>
            <p className="jp-empty-sub">Try adjusting your search or location filter</p>
          </div>
        ) : (
          <ul style={{listStyle:"none",margin:0,padding:0}}>
            {filteredJobs.map((job, i) => (
              <li key={job.id} className="jp-card" style={{animationDelay:`${i*50}ms`}}>
                <div className="jp-card-top">
                  <div className="jp-card-left">
                    <div className="jp-card-icon"><BriefcaseIcon style={{width:22,height:22}}/></div>
                    <div>
                      <h3 className="jp-card-title">{job.title}</h3>
                      <p className="jp-card-company">{job.company_name}</p>
                    </div>
                  </div>
                  <div className="jp-deadline"><CalendarIcon/>{job.application_deadline ? `Deadline: ${job.application_deadline}` : "No deadline"}</div>
                </div>
                <div className="jp-card-meta">
                  {job.location && <span className="jp-meta-chip"><MapPinIcon/>{job.location}</span>}
                  {appliedJobs.includes(job.id) && <span className="jp-applied-tag">✓ Applied</span>}
                </div>
                <p className="jp-card-desc">{job.description}</p>
                {role?.toLowerCase() !== "hr" && (
                  <div className="jp-btn-row">
                    {appliedJobs.includes(job.id)
                      ? <button disabled className="jp-btn jp-btn--disabled">Already Applied</button>
                      : <button className="jp-btn jp-btn--primary" onClick={() => (window.location.href = `/apply/${job.id}`)}>Apply Now</button>
                    }
                    <button className="jp-btn jp-btn--ghost" onClick={() => navigate(`/jobs/${job.id}`)}>
                      <EyeIcon/>View Details<ChevronRightIcon style={{width:13,height:13}}/>
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default JobsPage;