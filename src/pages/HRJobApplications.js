import React, { useEffect, useState } from "react";
import { getJobApplications } from "../services/api";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeftIcon, DocumentTextIcon, EnvelopeIcon, UserIcon,
  StarIcon, AcademicCapIcon, FunnelIcon, EyeIcon, EyeSlashIcon, CalendarIcon,
} from "@heroicons/react/24/outline";
import { useRef } from "react";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

  .hrja-wrap * { box-sizing: border-box; }
  .hrja-wrap { font-family: 'DM Sans', sans-serif; min-height: 100vh; background: #f5f6ff; color: #1e1b3a; }

  /* Hero */
  .hrja-hero {
    position: relative; overflow: hidden;
    background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 52%, #ede9fe 100%);
    padding: 36px 40px 72px; border-bottom: 1px solid #ddd6fe;
  }
  .hrja-blob { position: absolute; border-radius: 50%; filter: blur(80px); opacity: .18; pointer-events: none; }
  .hrja-blob--1 { width: 380px; height: 380px; background: radial-gradient(circle,#6366f1,transparent); top: -100px; left: -60px; animation: hrja-drift 13s ease-in-out infinite alternate; }
  .hrja-blob--2 { width: 240px; height: 240px; background: radial-gradient(circle,#8b5cf6,transparent); bottom: -40px; right: 8%; animation: hrja-drift 17s ease-in-out infinite alternate-reverse; }
  @keyframes hrja-drift { 0%{transform:translate(0,0)} 100%{transform:translate(20px,10px)} }
  .hrja-grid { position: absolute; inset: 0; pointer-events: none; background-image: linear-gradient(rgba(99,102,241,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,.06) 1px,transparent 1px); background-size: 40px 40px; }

  .hrja-hero-inner { position: relative; z-index: 1; max-width: 1200px; margin: 0 auto; }
  .hrja-hero-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; flex-wrap: wrap; }

  .hrja-back-btn { display: inline-flex; align-items: center; gap: 8px; color: #6b7280; font-size: 13px; font-weight: 500; cursor: pointer; background: #fff; border: 1px solid #e0e7ff; border-radius: 8px; padding: 7px 14px; margin-bottom: 20px; transition: all .2s; }
  .hrja-back-btn:hover { color: #4f46e5; border-color: #c7d2fe; background: #f5f3ff; }
  .hrja-back-btn svg { width: 15px; height: 15px; }

  .hrja-title { font-family: 'Syne', sans-serif; font-size: clamp(18px,3vw,28px); font-weight: 800; color: #1e1b3a; margin: 0 0 6px; letter-spacing: -.3px; }
  .hrja-subtitle { font-size: 14px; color: #6b7280; margin: 0; }
  .hrja-deadline { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #9ca3af; margin-top: 6px; }
  .hrja-deadline svg { width: 14px; height: 14px; }

  /* Stats strip */
  .hrja-stats-strip { position: relative; z-index: 10; margin: -24px auto 0; max-width: 1200px; padding: 0 40px; }
  .hrja-stats-inner { background: #fff; border: 1px solid #e0e7ff; border-radius: 14px; display: grid; grid-template-columns: repeat(4,1fr); box-shadow: 0 8px 32px rgba(99,102,241,.1); }
  .hrja-stat { padding: 16px 20px; }
  .hrja-stat:not(:last-child) { border-right: 1px solid #e0e7ff; }
  .hrja-stat-label { font-size: 11px; font-weight: 700; letter-spacing: .5px; text-transform: uppercase; color: #9ca3af; margin-bottom: 4px; }
  .hrja-stat-val { font-size: 22px; font-weight: 800; color: #1e1b3a; }

  /* Main */
  .hrja-main { max-width: 1200px; margin: 0 auto; padding: 28px 40px 80px; }

  /* Filter card */
  .hrja-filter-card { background: #fff; border: 1px solid #e0e7ff; border-radius: 14px; padding: 20px 24px; margin-bottom: 20px; box-shadow: 0 4px 16px rgba(99,102,241,.06); }
  .hrja-filter-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; flex-wrap: wrap; margin-bottom: 14px; }
  .hrja-filter-label { font-family: 'Syne',sans-serif; font-size: 15px; font-weight: 700; color: #1e1b3a; margin-bottom: 3px; }
  .hrja-filter-sub { font-size: 13px; color: #9ca3af; }
  .hrja-filter-controls { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }
  .hrja-number-input { width: 120px; padding: 8px 12px; border: 1px solid #e0e7ff; border-radius: 10px; font-family: 'DM Sans',sans-serif; font-size: 14px; color: #1e1b3a; background: #f5f6ff; outline: none; transition: border-color .2s; }
  .hrja-number-input:focus { border-color: #a5b4fc; background: #fff; }
  .hrja-quick-btns { display: flex; gap: 8px; flex-wrap: wrap; }
  .hrja-qbtn { padding: 6px 14px; font-size: 12px; font-weight: 600; border-radius: 8px; cursor: pointer; border: none; transition: all .2s; font-family: 'DM Sans',sans-serif; }
  .hrja-qbtn--active { background: linear-gradient(135deg,#4f46e5,#7c3aed); color: #fff; }
  .hrja-qbtn--indigo { background: #eef2ff; border: 1px solid #c7d2fe; color: #4f46e5; }
  .hrja-qbtn--indigo:hover { background: #e0e7ff; }
  .hrja-qbtn--green { background: #f0fdf4; border: 1px solid #bbf7d0; color: #16a34a; }
  .hrja-qbtn--green:hover { background: #dcfce7; }

  /* Status banners */
  .hrja-banner { border-radius: 12px; padding: 14px 18px; margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
  .hrja-banner--blue { background: #eef2ff; border: 1px solid #c7d2fe; }
  .hrja-banner--green { background: #f0fdf4; border: 1px solid #bbf7d0; }
  .hrja-banner-left { display: flex; align-items: center; gap: 10px; }
  .hrja-banner-icon { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .hrja-banner-icon--blue { background: #e0e7ff; }
  .hrja-banner-icon--green { background: #dcfce7; }
  .hrja-banner-icon svg { width: 18px; height: 18px; }
  .hrja-banner-title { font-family: 'Syne',sans-serif; font-size: 14px; font-weight: 700; margin-bottom: 2px; }
  .hrja-banner-title--blue { color: #4f46e5; }
  .hrja-banner-title--green { color: #15803d; }
  .hrja-banner-sub { font-size: 12px; color: #9ca3af; }

  /* Buttons */
  .hrja-btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 10px; font-size: 13px; font-weight: 600; cursor: pointer; border: none; transition: all .2s; font-family: 'DM Sans',sans-serif; }
  .hrja-btn--primary { background: linear-gradient(135deg,#4f46e5,#7c3aed); color: #fff; box-shadow: 0 4px 12px rgba(79,70,229,.2); }
  .hrja-btn--primary:hover { transform: translateY(-1px); }
  .hrja-btn--ghost { background: #f5f6ff; border: 1px solid #e0e7ff; color: #4f46e5; }
  .hrja-btn--ghost:hover { background: #eef2ff; }
  .hrja-btn--green { background: #f0fdf4; border: 1px solid #bbf7d0; color: #16a34a; }
  .hrja-btn svg { width: 15px; height: 15px; }

  /* Table */
  .hrja-table-head { display: grid; grid-template-columns: 50px 1fr 1fr 100px 70px 70px 80px 80px 70px 140px; gap: 8px; align-items: center; background: #eef2ff; border: 1px solid #e0e7ff; border-radius: 12px 12px 0 0; padding: 12px 16px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .5px; color: #6366f1; }
  .hrja-table-body { background: #fff; border: 1px solid #e0e7ff; border-top: none; border-radius: 0 0 12px 12px; overflow: hidden; }
  .hrja-row { display: grid; grid-template-columns: 50px 1fr 1fr 100px 70px 70px 80px 80px 70px 140px; gap: 8px; align-items: center; padding: 14px 16px; border-bottom: 1px solid #f0f0ff; transition: background .15s; font-size: 13px; }
  .hrja-row:last-child { border-bottom: none; }
  .hrja-row:hover { background: #f5f6ff; }
  .hrja-row--even { background: #fafafe; }
  .hrja-row--even:hover { background: #f5f6ff; }

  .hrja-rank-badge { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 800; }
  .hrja-rank-1 { background: #fef9c3; color: #854d0e; }
  .hrja-rank-2 { background: #f3f4f6; color: #374151; }
  .hrja-rank-3 { background: #ffedd5; color: #9a3412; }
  .hrja-rank-n { background: #eef2ff; color: #4f46e5; }
  .hrja-shortlisted { font-size: 10px; color: #16a34a; font-weight: 700; margin-top: 2px; text-align: center; }

  .hrja-applicant-name { font-weight: 600; color: #1e1b3a; }
  .hrja-email { color: #6b7280; display: flex; align-items: center; gap: 4px; }
  .hrja-email svg { width: 13px; height: 13px; flex-shrink: 0; color: #c7d2fe; }
  .hrja-score { display: flex; align-items: center; gap: 4px; font-weight: 700; }
  .hrja-score svg { width: 14px; height: 14px; color: #f59e0b; }
  .hrja-score--main { color: #4f46e5; font-size: 14px; }
  .hrja-score--groq { color: #16a34a; }
  .hrja-score--bert { color: #6366f1; }
  .hrja-score--custom { color: #ec4899; }
  .hrja-score--hf { color: #7c3aed; }
  .hrja-score-null { color: #d1d5db; }
  .hrja-cgpa { display: flex; align-items: center; gap: 4px; color: #6b7280; }
  .hrja-cgpa svg { width: 14px; height: 14px; color: #a78bfa; }
  .hrja-actions { display: flex; gap: 6px; flex-wrap: wrap; }

  /* Empty */
  .hrja-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 20px; background: #fff; border: 1px solid #e0e7ff; border-radius: 14px; text-align: center; }
  .hrja-empty svg { width: 48px; height: 48px; color: #c7d2fe; margin-bottom: 14px; }
  .hrja-empty-text { font-size: 15px; color: #9ca3af; }

  /* Footer */
  .hrja-footer { margin-top: 20px; text-align: center; font-size: 13px; color: #9ca3af; }
  .hrja-footer a { color: #4f46e5; text-decoration: underline; cursor: pointer; background: none; border: none; font-size: 13px; }

  /* Modal */
  .hrja-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.4); display: flex; align-items: center; justify-content: center; z-index: 50; padding: 20px; }
  .hrja-modal { background: #fff; border: 1px solid #e0e7ff; border-radius: 20px; box-shadow: 0 24px 72px rgba(99,102,241,.2); max-width: 480px; width: 100%; padding: 28px; position: relative; animation: hrja-modal-in .25s ease; }
  @keyframes hrja-modal-in { from{opacity:0;transform:scale(.96)} to{opacity:1;transform:scale(1)} }
  .hrja-modal-close { position: absolute; top: 16px; right: 16px; width: 28px; height: 28px; border-radius: 50%; background: #f3f4f6; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 14px; color: #6b7280; transition: background .2s; }
  .hrja-modal-close:hover { background: #e0e7ff; color: #4f46e5; }
  .hrja-modal-title { font-family: 'Syne',sans-serif; font-size: 18px; font-weight: 800; color: #1e1b3a; margin: 0 0 18px; }
  .hrja-modal-row { margin-bottom: 12px; font-size: 14px; color: #4b5563; }
  .hrja-modal-row strong { color: #1e1b3a; }

  /* Loading */
  .hrja-loading { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 60vh; gap: 20px; }
  .hrja-spinner { width: 44px; height: 44px; border: 3px solid #e0e7ff; border-top-color: #6366f1; border-radius: 50%; animation: hrja-spin .8s linear infinite; }
  @keyframes hrja-spin { to{transform:rotate(360deg)} }

  @media(max-width:1100px){ .hrja-table-head,.hrja-row{display:block;} .hrja-table-head{display:none} }
  @media(max-width:640px){ .hrja-hero{padding:28px 16px 60px} .hrja-stats-strip{padding:0 16px} .hrja-main{padding:28px 16px 60px} .hrja-stats-inner{grid-template-columns:repeat(2,1fr)} }
`;

function HRJobApplications() {
  const { jobId } = useParams();
  const [applications, setApplications] = useState([]);
  const [allApplications, setAllApplications] = useState([]);
  const [jobTitle, setJobTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [showCount, setShowCount] = useState("");
  const [isFiltered, setIsFiltered] = useState(false);
  const [jobDeadline, setJobDeadline] = useState(null);
  const [shortlistCount, setShortlistCount] = useState(10);
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const intervalRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchApplications = async () => {
      setLoading(true);
      try {
        const data = await getJobApplications(jobId);
        setJobTitle(data.title || data.job_title || "Job");
        if (data.application_deadline) setJobDeadline(new Date(data.application_deadline));
        if (data.ranking_config?.shortlist_count) setShortlistCount(data.ranking_config.shortlist_count);
        let allApps = data.applications || [];
        allApps.sort((a,b)=>(b.rank_score??0)-(a.rank_score??0));
        setAllApplications(allApps); setApplications(allApps);
      } catch { setAllApplications([]); setApplications([]); }
      finally { setLoading(false); }
    };
    fetchApplications();
  }, [jobId]);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      getJobApplications(jobId).then(data => {
        const allApps = (data.applications||[]).sort((a,b)=>(b.rank_score??0)-(a.rank_score??0));
        setApplications(allApps); setAllApplications(allApps);
      }).catch(()=>{});
    }, 30000);
    return () => clearInterval(intervalRef.current);
  }, [jobId]);

  const applyFilter = (count) => {
    if (!count || isNaN(parseInt(count))) { setApplications(allApplications); setIsFiltered(false); return; }
    const n = parseInt(count); if (n <= 0) { setApplications([]); setIsFiltered(true); return; }
    setApplications(allApplications.slice(0,n)); setIsFiltered(true);
  };

  const showAll = () => { setApplications(allApplications); setShowCount(""); setIsFiltered(false); };

  const handleCountChange = (e) => { const v = e.target.value; setShowCount(v); applyFilter(v); };

  if (loading) return (
    <div className="hrja-wrap"><style>{styles}</style>
      <div className="hrja-loading"><div className="hrja-spinner"/><p style={{color:"#6366f1",fontWeight:500}}>Loading applications…</p></div>
    </div>
  );

  return (
    <div className="hrja-wrap">
      <style>{styles}</style>

      {/* Hero */}
      <div className="hrja-hero">
        <div className="hrja-blob hrja-blob--1"/><div className="hrja-blob hrja-blob--2"/><div className="hrja-grid"/>
        <div className="hrja-hero-inner">
          <button className="hrja-back-btn" onClick={()=>navigate("/hr/analytics")}><ArrowLeftIcon/>Back to Analytics</button>
          <div className="hrja-hero-top">
            <div>
              <h1 className="hrja-title">{jobTitle} — Applications</h1>
              <p className="hrja-subtitle">
                📊 <strong>{allApplications.length}</strong> total applicants · Showing <strong style={{color:isFiltered?"#4f46e5":"#16a34a"}}>{applications.length}</strong>
                {isFiltered && ` (Top ${showCount} Shortlisted)`}
              </p>
              {jobDeadline && (
                <div className="hrja-deadline"><CalendarIcon/>Deadline: {jobDeadline.toLocaleDateString()}</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="hrja-stats-strip">
        <div className="hrja-stats-inner">
          <div className="hrja-stat">
            <div className="hrja-stat-label">Total Applicants</div>
            <div className="hrja-stat-val">{allApplications.length}</div>
          </div>
          <div className="hrja-stat">
            <div className="hrja-stat-label">Showing</div>
            <div className="hrja-stat-val" style={{color:"#4f46e5"}}>{applications.length}</div>
          </div>
          <div className="hrja-stat">
            <div className="hrja-stat-label">Top Score</div>
            <div className="hrja-stat-val" style={{color:"#16a34a"}}>{allApplications[0]?.rank_score?.toFixed(1)||"0"}%</div>
          </div>
          <div className="hrja-stat">
            <div className="hrja-stat-label">Shortlist Count</div>
            <div className="hrja-stat-val" style={{color:"#7c3aed"}}>{shortlistCount}</div>
          </div>
        </div>
      </div>

      <div className="hrja-main">
        {/* Filter card */}
        <div className="hrja-filter-card">
          <div className="hrja-filter-top">
            <div>
              <div className="hrja-filter-label"><FunnelIcon style={{width:16,height:16,display:"inline",verticalAlign:"middle",marginRight:6}}/>Shortlist Filter</div>
              <div className="hrja-filter-sub">Job shortlist: <strong>{shortlistCount}</strong> · {allApplications.length} total applicants</div>
            </div>
            <div className="hrja-filter-controls">
              <input type="number" min="1" max={allApplications.length} value={showCount} onChange={handleCountChange} placeholder={`Default: ${shortlistCount}`} className="hrja-number-input"/>
              <button className="hrja-btn hrja-btn--primary" onClick={()=>applyFilter(showCount||shortlistCount)}><EyeIcon/>Apply</button>
              {isFiltered && <button className="hrja-btn hrja-btn--green" onClick={showAll}><EyeSlashIcon/>Show All</button>}
            </div>
          </div>
          <div className="hrja-quick-btns">
            <button className={`hrja-qbtn ${!isFiltered?"hrja-qbtn--active":"hrja-qbtn--green"}`} onClick={()=>{showAll();}}>All ({allApplications.length})</button>
            {[2,5,10,shortlistCount].filter((v,i,a)=>a.indexOf(v)===i).map(n=>(
              <button key={n} className="hrja-qbtn hrja-qbtn--indigo" onClick={()=>{const c=Math.min(n,allApplications.length);setShowCount(c.toString());setApplications(allApplications.slice(0,c));setIsFiltered(true);}}>Top {n}</button>
            ))}
          </div>
        </div>

        {/* Status banner */}
        {isFiltered ? (
          <div className="hrja-banner hrja-banner--blue">
            <div className="hrja-banner-left">
              <div className="hrja-banner-icon hrja-banner-icon--blue"><FunnelIcon style={{width:18,height:18,color:"#4f46e5"}}/></div>
              <div>
                <div className="hrja-banner-title hrja-banner-title--blue">Shortlist Mode Active</div>
                <div className="hrja-banner-sub">Showing top {showCount} of {allApplications.length} applicants</div>
              </div>
            </div>
            <button className="hrja-btn hrja-btn--ghost" onClick={showAll}>Show All {allApplications.length}</button>
          </div>
        ) : allApplications.length > 0 ? (
          <div className="hrja-banner hrja-banner--green">
            <div className="hrja-banner-left">
              <div className="hrja-banner-icon hrja-banner-icon--green"><EyeSlashIcon style={{width:18,height:18,color:"#16a34a"}}/></div>
              <div>
                <div className="hrja-banner-title hrja-banner-title--green">Showing All Applicants</div>
                <div className="hrja-banner-sub">{applications.length} applicants · Job shortlist: {shortlistCount}</div>
              </div>
            </div>
            <button className="hrja-btn hrja-btn--primary" onClick={()=>{const c=Math.min(shortlistCount,allApplications.length);setShowCount(c.toString());setApplications(allApplications.slice(0,c));setIsFiltered(true);}}>Apply Shortlist ({shortlistCount})</button>
          </div>
        ) : null}

        {/* Empty */}
        {allApplications.length === 0 ? (
          <div className="hrja-empty"><DocumentTextIcon/><p className="hrja-empty-text">No applications for this job yet.</p></div>
        ) : (
          <>
            {/* Table header — desktop only via CSS */}
            <div className="hrja-table-head">
              <div style={{textAlign:"center"}}>Rank</div>
              <div>Applicant</div>
              <div>Email</div>
              <div style={{textAlign:"center"}}>Final Score</div>
              <div style={{textAlign:"center"}}>Groq</div>
              <div style={{textAlign:"center"}}>BERT</div>
              <div style={{textAlign:"center"}}>Custom ML</div>
              <div style={{textAlign:"center"}}>HF Model</div>
              <div style={{textAlign:"center"}}>CGPA</div>
              <div style={{textAlign:"center"}}>Actions</div>
            </div>
            <div className="hrja-table-body">
              {applications.map((app, idx) => {
                const firstName = app.first_name || app.applicant?.first_name || "";
                const lastName = app.last_name || app.applicant?.last_name || "";
                const fullName = firstName||lastName ? `${firstName} ${lastName}`.trim() : app.applicant_name || "N/A";
                const email = app.applicant_email || app.applicant?.email || "N/A";
                const resumeUrl = app.resume_url || app.resume || null;
                const finalRank = app.rank_score ?? 0;
                const groqRank = app.groq_rank ?? 0;
                const bertScore = app.bert_similarity ?? 0;
                const customML = app.custom_model_score ?? 0;
                const gradioScore = app.gradio_match_score;
                const cgpa = app.cgpa ?? "N/A";
                const rankClass = idx===0?"hrja-rank-1":idx===1?"hrja-rank-2":idx===2?"hrja-rank-3":"hrja-rank-n";

                return (
                  <div key={app.id??idx} className={`hrja-row${idx%2!==0?" hrja-row--even":""}`}>
                    <div style={{display:"flex",flexDirection:"column",alignItems:"center"}}>
                      <div className={`hrja-rank-badge ${rankClass}`}>{idx+1}</div>
                      {isFiltered && idx < parseInt(showCount||0) && <div className="hrja-shortlisted">✓ Listed</div>}
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <UserIcon style={{width:16,height:16,color:"#6366f1",flexShrink:0}}/>
                      <span className="hrja-applicant-name">{fullName}</span>
                    </div>
                    <div className="hrja-email"><EnvelopeIcon/><span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{email}</span></div>
                    <div style={{textAlign:"center"}}>
                      {finalRank ? <span className="hrja-score hrja-score--main"><StarIcon/>{finalRank.toFixed(1)}%</span> : <span className="hrja-score-null">—</span>}
                    </div>
                    <div style={{textAlign:"center"}} className={groqRank?"hrja-score hrja-score--groq":"hrja-score-null"}>{groqRank?`${groqRank.toFixed(1)}%`:"—"}</div>
                    <div style={{textAlign:"center"}} className={bertScore?"hrja-score hrja-score--bert":"hrja-score-null"}>{bertScore?`${bertScore.toFixed(1)}%`:"—"}</div>
                    <div style={{textAlign:"center"}} className={customML?"hrja-score hrja-score--custom":"hrja-score-null"}>{customML?`${customML.toFixed(1)}%`:"—"}</div>
                    <div style={{textAlign:"center"}}>
                      <button className={`${gradioScore?"hrja-score hrja-score--hf":"hrja-score-null"}`} style={{background:"none",border:"none",cursor:"pointer",textDecoration:"underline",font:"inherit"}}
                        onClick={()=>{setSelectedAnalysis(app.gradio_analysis||{matching_analysis:"Analysis unavailable",description:"No description",score:0,recommendation:"Scores will be retried automatically."});setIsModalOpen(true);}}>
                        {gradioScore?`${gradioScore.toFixed(1)}%`:"Processing…"}
                      </button>
                    </div>
                    <div className="hrja-cgpa"><AcademicCapIcon/>{cgpa}</div>
                    <div className="hrja-actions">
                      {resumeUrl ? (
                        <a href={resumeUrl} target="_blank" rel="noopener noreferrer" className="hrja-btn hrja-btn--ghost" style={{fontSize:12,padding:"6px 10px"}}><DocumentTextIcon/>Resume</a>
                      ) : <span style={{fontSize:12,color:"#d1d5db"}}>No resume</span>}
                      <button className="hrja-btn hrja-btn--primary" style={{fontSize:12,padding:"6px 10px"}}
                        onClick={()=>navigate(`/hr/schedule-interview?candidate=${encodeURIComponent(fullName)}&email=${encodeURIComponent(email)}&jobId=${jobId}`)}>
                        Schedule
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="hrja-footer">
              {isFiltered ? (
                <p>Shortlisted {applications.length} · <button onClick={showAll}>View all {allApplications.length}</button></p>
              ) : (
                <p>Viewing all {applications.length} · <button onClick={()=>{const c=Math.min(shortlistCount,allApplications.length);setShowCount(c.toString());setApplications(allApplications.slice(0,c));setIsFiltered(true);}}>Apply shortlist ({shortlistCount})</button></p>
              )}
            </div>
          </>
        )}

        {/* Modal */}
        {isModalOpen && selectedAnalysis && (
          <div className="hrja-modal-overlay" onClick={()=>setIsModalOpen(false)}>
            <div className="hrja-modal" onClick={e=>e.stopPropagation()}>
              <button className="hrja-modal-close" onClick={()=>setIsModalOpen(false)}>✕</button>
              <h3 className="hrja-modal-title">Detailed Analysis</h3>
              <div className="hrja-modal-row"><strong>Matching Analysis:</strong> {selectedAnalysis.matching_analysis}</div>
              <div className="hrja-modal-row"><strong>Description:</strong> {selectedAnalysis.description}</div>
              <div className="hrja-modal-row"><strong>Score:</strong> {selectedAnalysis.score}</div>
              <div className="hrja-modal-row"><strong>Recommendation:</strong> {selectedAnalysis.recommendation}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default HRJobApplications;