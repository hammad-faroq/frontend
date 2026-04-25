import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getJobDetail, checkApplicationStatus, applyToJob, getAppliedJobs } from "../services/api";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import {
  BriefcaseIcon, MapPinIcon, CalendarIcon, BuildingOfficeIcon,
  ExclamationTriangleIcon, CurrencyDollarIcon, ClockIcon,
  UserGroupIcon, DocumentTextIcon, CheckCircleIcon, ArrowLeftIcon,
  ShareIcon, BookmarkIcon, BookmarkSlashIcon, EyeIcon,
  RocketLaunchIcon, ChatBubbleLeftRightIcon, SparklesIcon,
} from "@heroicons/react/24/outline";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

  .jd-wrap * { box-sizing: border-box; }
  .jd-wrap { font-family: 'DM Sans', sans-serif; min-height: 100vh; background: #f5f6ff; color: #1e1b3a; }

  /* Hero */
  .jd-hero {
    position: relative; overflow: hidden;
    background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 52%, #ede9fe 100%);
    padding: 40px 40px 56px; border-bottom: 1px solid #ddd6fe;
  }
  .jd-blob { position: absolute; border-radius: 50%; filter: blur(80px); opacity: .2; pointer-events: none; }
  .jd-blob--1 { width: 400px; height: 400px; background: radial-gradient(circle,#6366f1,transparent); top: -100px; left: -60px; animation: jd-drift 12s ease-in-out infinite alternate; }
  .jd-blob--2 { width: 280px; height: 280px; background: radial-gradient(circle,#10b981,transparent); bottom: -80px; right: 10%; animation: jd-drift 15s ease-in-out infinite alternate-reverse; }
  @keyframes jd-drift { 0%{transform:translate(0,0)} 100%{transform:translate(22px,12px)} }
  .jd-grid { position: absolute; inset: 0; pointer-events: none; background-image: linear-gradient(rgba(99,102,241,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,.06) 1px,transparent 1px); background-size: 40px 40px; }

  .jd-hero-inner { position: relative; z-index: 1; max-width: 1100px; margin: 0 auto; }
  .jd-back-btn { display: inline-flex; align-items: center; gap: 8px; color: #6b7280; font-size: 13px; font-weight: 500; cursor: pointer; background: #fff; border: 1px solid #e0e7ff; border-radius: 8px; padding: 7px 14px; margin-bottom: 28px; transition: all .2s; }
  .jd-back-btn:hover { color: #4f46e5; border-color: #c7d2fe; background: #f5f3ff; }
  .jd-back-btn svg { width: 15px; height: 15px; }

  .jd-hero-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 20px; flex-wrap: wrap; }
  .jd-hero-left { display: flex; align-items: flex-start; gap: 18px; }
  .jd-company-icon { width: 64px; height: 64px; border-radius: 16px; flex-shrink: 0; background: linear-gradient(135deg,#eef2ff,#ede9fe); border: 1px solid #e0e7ff; display: flex; align-items: center; justify-content: center; color: #6366f1; box-shadow: 0 4px 16px rgba(99,102,241,.15); }
  .jd-job-title { font-family: 'Syne', sans-serif; font-size: clamp(20px,3vw,30px); font-weight: 800; color: #1e1b3a; margin: 0 0 6px; letter-spacing: -.3px; }
  .jd-company-name { font-size: 15px; color: #4f46e5; font-weight: 600; margin: 0 0 10px; }
  .jd-meta-chips { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  .jd-chip { display: inline-flex; align-items: center; gap: 5px; background: rgba(99,102,241,.1); border: 1px solid rgba(99,102,241,.2); border-radius: 100px; padding: 4px 12px; font-size: 12px; color: #4f46e5; font-weight: 500; }
  .jd-chip svg { width: 12px; height: 12px; }
  .jd-views { display: inline-flex; align-items: center; gap: 5px; font-size: 12px; color: #9ca3af; }
  .jd-views svg { width: 13px; height: 13px; }

  .jd-hero-right { display: flex; align-items: center; gap: 10px; }
  .jd-icon-btn { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; background: #fff; border: 1px solid #e0e7ff; color: #6b7280; cursor: pointer; transition: all .2s; }
  .jd-icon-btn:hover { border-color: #c7d2fe; color: #4f46e5; background: #f5f3ff; }
  .jd-icon-btn svg { width: 18px; height: 18px; }

  /* Stats strip */
  .jd-stats-strip { position: relative; z-index: 10; margin: -22px auto 0; max-width: 1100px; padding: 0 40px; }
  .jd-stats-inner { background: #fff; border: 1px solid #e0e7ff; border-radius: 14px; display: grid; grid-template-columns: repeat(3,1fr); box-shadow: 0 8px 32px rgba(99,102,241,.1); }
  .jd-stat-item { padding: 18px 20px; display: flex; flex-direction: column; gap: 4px; }
  .jd-stat-item:not(:last-child) { border-right: 1px solid #e0e7ff; }
  .jd-stat-label { font-size: 11px; font-weight: 700; letter-spacing: .5px; text-transform: uppercase; color: #9ca3af; display: flex; align-items: center; gap: 5px; }
  .jd-stat-label svg { width: 13px; height: 13px; }
  .jd-stat-val { font-size: 15px; font-weight: 700; color: #1e1b3a; }

  /* Main */
  .jd-main { max-width: 1100px; margin: 0 auto; padding: 36px 40px 80px; }
  .jd-layout { display: grid; grid-template-columns: 1fr 300px; gap: 24px; }
  @media(max-width:900px){ .jd-layout{grid-template-columns:1fr} }

  /* Banners */
  .jd-banner { border-radius: 14px; padding: 18px 20px; margin-bottom: 20px; display: flex; align-items: flex-start; gap: 14px; animation: jd-in .4s ease both; }
  .jd-banner--green { background: #f0fdf4; border: 1px solid #bbf7d0; }
  .jd-banner--red { background: #fef2f2; border: 1px solid #fecaca; }
  .jd-banner-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .jd-banner-icon--green { background: #dcfce7; }
  .jd-banner-icon--red { background: #fee2e2; }
  .jd-banner-icon svg { width: 20px; height: 20px; }
  .jd-banner-title { font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 700; margin: 0 0 4px; }
  .jd-banner-title--green { color: #15803d; }
  .jd-banner-title--red { color: #b91c1c; }
  .jd-banner-desc { font-size: 13px; margin: 0 0 12px; }
  .jd-banner-desc--green { color: #166534; }
  .jd-banner-desc--red { color: #991b1b; }
  .jd-banner-btns { display: flex; gap: 8px; flex-wrap: wrap; }
  @keyframes jd-in { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }

  /* Section cards */
  .jd-section { background: #fff; border: 1px solid #e8eaf6; border-radius: 16px; padding: 24px; margin-bottom: 16px; animation: jd-in .4s ease both; transition: border-color .2s, box-shadow .2s; }
  .jd-section:hover { border-color: #c7d2fe; box-shadow: 0 4px 20px rgba(99,102,241,.07); }
  .jd-section-header { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
  .jd-section-icon { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
  .jd-section-icon svg { width: 18px; height: 18px; }
  .jd-section-title { font-family: 'Syne', sans-serif; font-size: 17px; font-weight: 700; color: #1e1b3a; margin: 0; }
  .jd-section-body { font-size: 14px; color: #4b5563; line-height: 1.75; white-space: pre-line; }

  /* Sidebar */
  .jd-sidebar-card { background: #fff; border: 1px solid #e8eaf6; border-radius: 16px; padding: 20px; margin-bottom: 16px; animation: jd-in .4s ease both; }
  .jd-sidebar-title { font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 700; color: #1e1b3a; margin: 0 0 14px; }
  .jd-info-row { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; font-size: 13px; color: #4b5563; }
  .jd-info-row svg { width: 16px; height: 16px; color: #6366f1; flex-shrink: 0; }
  .jd-timeline-row { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 8px; }
  .jd-timeline-row span:first-child { color: #9ca3af; }
  .jd-timeline-row span:last-child { color: #1e1b3a; font-weight: 600; }
  .jd-deadline-pill { text-align: center; margin-top: 12px; padding: 8px; border-radius: 8px; font-size: 12px; font-weight: 700; }
  .jd-deadline-pill--green { background: #d1fae5; color: #065f46; }
  .jd-deadline-pill--orange { background: #fed7aa; color: #9a3412; }
  .jd-deadline-pill--red { background: #fee2e2; color: #b91c1c; }

  /* Quick stats */
  .jd-quick-stats { display: grid; grid-template-columns: repeat(3,1fr); gap: 10px; margin-bottom: 20px; }
  .jd-quick-stat { background: #fff; border: 1px solid #e8eaf6; border-radius: 12px; padding: 14px; text-align: center; }
  .jd-quick-stat-label { font-size: 11px; color: #9ca3af; font-weight: 600; text-transform: uppercase; margin-bottom: 4px; }
  .jd-quick-stat-val { font-size: 22px; font-weight: 800; color: #4f46e5; }

  /* Buttons */
  .jd-cta { display: flex; flex-direction: column; gap: 10px; }
  .jd-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 12px 20px; border-radius: 12px; font-size: 14px; font-weight: 600; cursor: pointer; border: none; transition: all .2s; font-family: 'DM Sans', sans-serif; width: 100%; }
  .jd-btn--primary { background: linear-gradient(135deg,#4f46e5,#7c3aed); color: #fff; box-shadow: 0 6px 20px rgba(79,70,229,.25); }
  .jd-btn--primary:hover { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(79,70,229,.35); }
  .jd-btn--orange { background: linear-gradient(135deg,#ea580c,#f97316); color: #fff; box-shadow: 0 6px 20px rgba(234,88,12,.2); }
  .jd-btn--orange:hover { transform: translateY(-2px); }
  .jd-btn--ghost { background: #f5f6ff; border: 1px solid #e0e7ff; color: #4f46e5; }
  .jd-btn--ghost:hover { background: #eef2ff; }
  .jd-btn--indigo { background: #eef2ff; border: 1px solid #c7d2fe; color: #4f46e5; }
  .jd-btn--indigo:hover { background: #e0e7ff; }
  .jd-btn-sm { width: auto; padding: 8px 14px; font-size: 13px; border-radius: 9px; }
  .jd-btn svg { width: 16px; height: 16px; }

  /* Share */
  .jd-share-wrap { position: relative; }
  .jd-share-menu { position: absolute; right: 0; top: 48px; width: 180px; background: #fff; border: 1px solid #e0e7ff; border-radius: 12px; overflow: hidden; z-index: 20; box-shadow: 0 8px 32px rgba(99,102,241,.15); }
  .jd-share-item { display: block; padding: 11px 16px; font-size: 13px; color: #4b5563; cursor: pointer; transition: background .15s; text-decoration: none; }
  .jd-share-item:hover { background: #f5f3ff; color: #4f46e5; }

  /* Loading */
  .jd-loading { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 60vh; gap: 20px; }
  .jd-spinner { width: 44px; height: 44px; border: 3px solid #e0e7ff; border-top-color: #6366f1; border-radius: 50%; animation: jd-spin .8s linear infinite; }
  @keyframes jd-spin { to{transform:rotate(360deg)} }

  @media(max-width:640px){ .jd-hero{padding:28px 16px 48px} .jd-stats-strip{padding:0 16px} .jd-stats-inner{grid-template-columns:1fr} .jd-stat-item:not(:last-child){border-right:none;border-bottom:1px solid #e0e7ff} .jd-main{padding:28px 16px 60px} }
`;

function JobDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [applying, setApplying] = useState(false);
  const [deadlinePassed, setDeadlinePassed] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [viewCount, setViewCount] = useState(0);
  const [applicationStatus, setApplicationStatus] = useState(null);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [appliedHistory, setAppliedHistory] = useState([]);
  const { role, user } = useAuth();

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const data = await getJobDetail(id);
        setJob(data);
        if (data.application_deadline) {
          const dl = new Date(data.application_deadline); dl.setHours(23,59,59,999);
          setDeadlinePassed(dl < new Date());
        }
        if (user) {
          try {
            const status = await checkApplicationStatus(id);
            setApplicationStatus(status);
            const applied = await getAppliedJobs();
            setAppliedHistory(Array.isArray(applied) ? applied.filter(j => j.job_id == id) : []);
          } catch {}
        }
        const bm = JSON.parse(localStorage.getItem("bookmarkedJobs") || "[]");
        setIsBookmarked(bm.includes(parseInt(id)));
        const viewKey = `viewed_job_${id}`;
        const views = JSON.parse(localStorage.getItem("jobViews") || "{}");
        if (!sessionStorage.getItem(viewKey)) {
          const updated = { ...views, [id]: (views[id] || 0) + 1 };
          localStorage.setItem("jobViews", JSON.stringify(updated));
          setViewCount(updated[id]);
          sessionStorage.setItem(viewKey, "true");
        } else { setViewCount(views[id] || 0); }
      } catch (err) { setError(err.message || "Failed to fetch job details."); }
      finally { setLoading(false); }
    };
    fetch();
  }, [id, user]);

  const formatDate = d => { if (!d) return "N/A"; return new Date(d).toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"}); };

  const getDeadlineStatus = () => {
    if (!job?.application_deadline) return null;
    const diff = Math.ceil((new Date(job.application_deadline) - new Date()) / 86400000);
    if (diff < 0) return { message: "Application closed", pill: "jd-deadline-pill--red" };
    if (diff === 0) return { message: "Closes today! ⚠️", pill: "jd-deadline-pill--orange" };
    if (diff <= 3) return { message: `Closes in ${diff} day${diff>1?"s":""} ⏳`, pill: "jd-deadline-pill--orange" };
    return { message: `Closes in ${diff} days ✅`, pill: "jd-deadline-pill--green" };
  };

  const getSalary = () => {
    if (!job?.salary_range) return "Not specified";
    const s = job.salary_range;
    if (typeof s === "string" && s.includes("-")) {
      const [a,b] = s.split("-").map(x=>x.trim());
      return `$${parseInt(a).toLocaleString()} – $${parseInt(b).toLocaleString()}`;
    }
    return s;
  };

  const toggleBookmark = () => {
    const bm = JSON.parse(localStorage.getItem("bookmarkedJobs") || "[]");
    const jid = parseInt(id);
    const updated = isBookmarked ? bm.filter(x=>x!==jid) : [...bm, jid];
    localStorage.setItem("bookmarkedJobs", JSON.stringify(updated));
    setIsBookmarked(!isBookmarked);
  };

  const copyLink = () => { navigator.clipboard.writeText(window.location.href); toast.success("Link copied!"); setShowShareMenu(false); };

  const isHR = role?.toLowerCase() === "hr";
  const hasApplied = applicationStatus?.applied || false;
  const deadlineStatus = getDeadlineStatus();

  if (loading) return <div className="jd-wrap"><style>{styles}</style><div className="jd-loading"><div className="jd-spinner"/><p style={{color:"#6366f1",fontWeight:500}}>Loading…</p></div></div>;
  if (error || !job) return (
    <div className="jd-wrap"><style>{styles}</style>
    <div className="jd-loading" style={{flexDirection:"column",textAlign:"center",gap:16}}>
      <div style={{fontSize:48}}>😔</div>
      <h2 style={{fontFamily:"Syne,sans-serif",color:"#1e1b3a",margin:0}}>Job Not Found</h2>
      <p style={{color:"#9ca3af",fontSize:14}}>{error}</p>
      <button className="jd-btn jd-btn--ghost" style={{width:"auto",padding:"10px 24px"}} onClick={()=>navigate(-1)}><ArrowLeftIcon style={{width:16,height:16}}/>Go Back</button>
    </div></div>
  );

  return (
    <div className="jd-wrap">
      <style>{styles}</style>

      <div className="jd-hero">
        <div className="jd-blob jd-blob--1"/><div className="jd-blob jd-blob--2"/><div className="jd-grid"/>
        <div className="jd-hero-inner">
          <button className="jd-back-btn" onClick={()=>navigate(-1)}><ArrowLeftIcon style={{width:15,height:15}}/>Back to Jobs</button>
          <div className="jd-hero-top">
            <div className="jd-hero-left">
              <div className="jd-company-icon"><BriefcaseIcon style={{width:28,height:28}}/></div>
              <div>
                <h1 className="jd-job-title">{job.title}</h1>
                <p className="jd-company-name">{job.company_name}</p>
                <div className="jd-meta-chips">
                  {job.location && <span className="jd-chip"><MapPinIcon/>{job.location}</span>}
                  {(job.type||job.job_type) && <span className="jd-chip"><ClockIcon/>{job.type||job.job_type}</span>}
                  <span className="jd-views"><EyeIcon style={{width:13,height:13}}/>{viewCount} views</span>
                </div>
              </div>
            </div>
            <div className="jd-hero-right">
              <div className="jd-share-wrap">
                <button className="jd-icon-btn" onClick={()=>setShowShareMenu(!showShareMenu)}><ShareIcon/></button>
                {showShareMenu && (
                  <div className="jd-share-menu">
                    <span className="jd-share-item" onClick={copyLink}>Copy Link</span>
                    <a className="jd-share-item" href={`mailto:?subject=${encodeURIComponent(job.title)}&body=${encodeURIComponent(window.location.href)}`}>Share via Email</a>
                  </div>
                )}
              </div>
              <button className="jd-icon-btn" onClick={toggleBookmark}>
                {isBookmarked ? <BookmarkSlashIcon style={{color:"#f59e0b"}}/> : <BookmarkIcon/>}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="jd-stats-strip">
        <div className="jd-stats-inner">
          <div className="jd-stat-item">
            <span className="jd-stat-label"><CurrencyDollarIcon/>Salary</span>
            <span className="jd-stat-val">{getSalary()}</span>
          </div>
          <div className="jd-stat-item">
            <span className="jd-stat-label"><CalendarIcon/>Deadline</span>
            <span className="jd-stat-val">{formatDate(job.application_deadline)}</span>
            {deadlineStatus && <span style={{fontSize:12,color: deadlineStatus.pill.includes("green")?"#15803d":"#c2410c"}}>{deadlineStatus.message}</span>}
          </div>
          <div className="jd-stat-item">
            <span className="jd-stat-label"><BuildingOfficeIcon/>Posted</span>
            <span className="jd-stat-val">{formatDate(job.created_at)}</span>
          </div>
        </div>
      </div>

      <div className="jd-main">
        {hasApplied && !deadlinePassed && (
          <div className="jd-banner jd-banner--green">
            <div className="jd-banner-icon jd-banner-icon--green"><CheckCircleIcon style={{color:"#16a34a"}}/></div>
            <div>
              <h3 className="jd-banner-title jd-banner-title--green">✅ You've Already Applied!</h3>
              <p className="jd-banner-desc jd-banner-desc--green">Submitted {appliedHistory[0]?.submitted_at ? `on ${formatDate(appliedHistory[0].submitted_at)}` : "previously"}.</p>
              <div className="jd-banner-btns">
                <button className="jd-btn jd-btn--ghost jd-btn-sm" onClick={()=>navigate("/applications")}><EyeIcon/>View Status</button>
                <button className="jd-btn jd-btn--indigo jd-btn-sm" onClick={()=>navigate(`/apply/${job.id}`)}><RocketLaunchIcon/>Apply Again</button>
              </div>
            </div>
          </div>
        )}
        {deadlinePassed && (
          <div className="jd-banner jd-banner--red">
            <div className="jd-banner-icon jd-banner-icon--red"><ExclamationTriangleIcon style={{color:"#dc2626"}}/></div>
            <div>
              <h3 className="jd-banner-title jd-banner-title--red">⚠️ Application Closed</h3>
              <p className="jd-banner-desc jd-banner-desc--red" style={{margin:0}}>Deadline passed on {formatDate(job.application_deadline)}.</p>
            </div>
          </div>
        )}

        {hasApplied && appliedHistory.length > 0 && (
          <div className="jd-quick-stats" style={{marginBottom:20}}>
            <div className="jd-quick-stat"><div className="jd-quick-stat-label">Submitted</div><div className="jd-quick-stat-val">{appliedHistory.length}</div></div>
            <div className="jd-quick-stat"><div className="jd-quick-stat-label">Last Applied</div><div style={{fontSize:14,fontWeight:700,color:"#1e1b3a"}}>{formatDate(appliedHistory[0].submitted_at)}</div></div>
            <div className="jd-quick-stat"><div className="jd-quick-stat-label">Status</div><div style={{fontSize:14,fontWeight:700,color:"#16a34a"}}>{appliedHistory[0].status||"Submitted"}</div></div>
          </div>
        )}

        <div className="jd-layout">
          <div>
            <div className="jd-section" style={{animationDelay:"80ms"}}>
              <div className="jd-section-header">
                <div className="jd-section-icon" style={{background:"#eff6ff"}}><DocumentTextIcon style={{color:"#3b82f6"}}/></div>
                <h2 className="jd-section-title">Job Description</h2>
              </div>
              <div className="jd-section-body">{job.description || <em style={{color:"#9ca3af"}}>No description provided.</em>}</div>
            </div>
            <div className="jd-section" style={{animationDelay:"140ms"}}>
              <div className="jd-section-header">
                <div className="jd-section-icon" style={{background:"#f0fdf4"}}><CheckCircleIcon style={{color:"#16a34a"}}/></div>
                <h2 className="jd-section-title">Requirements</h2>
              </div>
              <div className="jd-section-body">{job.requirements || <em style={{color:"#9ca3af"}}>No requirements specified.</em>}</div>
            </div>
            {job.responsibilities && (
              <div className="jd-section" style={{animationDelay:"200ms"}}>
                <div className="jd-section-header">
                  <div className="jd-section-icon" style={{background:"#f5f3ff"}}><SparklesIcon style={{color:"#7c3aed"}}/></div>
                  <h2 className="jd-section-title">Responsibilities</h2>
                </div>
                <div className="jd-section-body">{job.responsibilities}</div>
              </div>
            )}
            {job.benefits && (
              <div className="jd-section" style={{animationDelay:"260ms"}}>
                <div className="jd-section-header">
                  <div className="jd-section-icon" style={{background:"#fffbeb"}}><SparklesIcon style={{color:"#d97706"}}/></div>
                  <h2 className="jd-section-title">Benefits & Perks</h2>
                </div>
                <div className="jd-section-body">{job.benefits}</div>
              </div>
            )}
          </div>

          <div>
            <div className="jd-sidebar-card">
              <h3 className="jd-sidebar-title">Ready to Apply?</h3>
              <div className="jd-cta">
                {isHR ? (
                  <button className="jd-btn jd-btn--primary" onClick={()=>navigate(`/hr/job/${id}`)}><UserGroupIcon/>View Applications</button>
                ) : !deadlinePassed ? (
                  <>
                    <button className={`jd-btn ${deadlineStatus?.pill?.includes("orange")?"jd-btn--orange":"jd-btn--primary"}`} onClick={()=>navigate(`/apply/${job.id}`)}>
                      {hasApplied ? <><ChatBubbleLeftRightIcon/>Update Application</> : <><span>📝</span>Apply Now</>}
                    </button>
                    <button className="jd-btn jd-btn--ghost" onClick={()=>navigate("/jobseeker/jobs")}><ArrowLeftIcon/>Browse More Jobs</button>
                  </>
                ) : <p style={{textAlign:"center",color:"#9ca3af",fontSize:13}}>Applications are closed for this role.</p>}
              </div>
            </div>

            <div className="jd-sidebar-card">
              <h3 className="jd-sidebar-title">About the Company</h3>
              <div className="jd-info-row"><BuildingOfficeIcon/>{job.company_name||"N/A"}</div>
              {job.company_size && <div className="jd-info-row"><UserGroupIcon/>{job.company_size} employees</div>}
              {job.location && <div className="jd-info-row"><MapPinIcon/>{job.location}</div>}
              {job.company_website && <a href={job.company_website} target="_blank" rel="noopener noreferrer" style={{display:"flex",alignItems:"center",gap:8,color:"#4f46e5",fontSize:13,textDecoration:"none"}}>🌐 Company Website</a>}
            </div>

            <div className="jd-sidebar-card">
              <h3 className="jd-sidebar-title">Application Timeline</h3>
              <div className="jd-timeline-row"><span>Posted</span><span>{formatDate(job.created_at)}</span></div>
              <div className="jd-timeline-row"><span>Deadline</span><span>{formatDate(job.application_deadline)}</span></div>
              {deadlineStatus && <div className={`jd-deadline-pill ${deadlineStatus.pill}`}>{deadlineStatus.message}</div>}
            </div>

            <div className="jd-sidebar-card">
              <h3 className="jd-sidebar-title">Need Help?</h3>
              <p style={{fontSize:13,color:"#9ca3af",marginBottom:12}}>Our career advisors can help with your application.</p>
              <button className="jd-btn jd-btn--ghost" style={{fontSize:13}} onClick={()=>navigate("/support")}><ChatBubbleLeftRightIcon/>Contact Support</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default JobDetailPage;