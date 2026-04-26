import { useState, useEffect } from "react";
import { getAppliedJobs } from "../services/api";
import { useNavigate } from "react-router-dom";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

  .jsa-wrap * { box-sizing: border-box; }
  .jsa-wrap { font-family: 'DM Sans', sans-serif; min-height: 100vh; background: #f5f6ff; color: #1e1b3a; }

  /* ── Hero ── */
  .jsa-hero {
    position: relative; overflow: hidden;
    background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 52%, #ede9fe 100%);
    padding: 40px 40px 72px; border-bottom: 1px solid #ddd6fe;
  }
  .jsa-blob { position: absolute; border-radius: 50%; filter: blur(80px); opacity: .2; pointer-events: none; }
  .jsa-blob--1 { width: 420px; height: 420px; background: radial-gradient(circle,#6366f1,transparent); top: -120px; left: -60px; animation: jsa-drift 12s ease-in-out infinite alternate; }
  .jsa-blob--2 { width: 260px; height: 260px; background: radial-gradient(circle,#10b981,transparent); bottom: -60px; right: 6%; animation: jsa-drift 16s ease-in-out infinite alternate-reverse; }
  @keyframes jsa-drift { 0%{transform:translate(0,0)} 100%{transform:translate(22px,12px)} }
  .jsa-grid-bg { position: absolute; inset: 0; pointer-events: none; background-image: linear-gradient(rgba(99,102,241,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,.06) 1px,transparent 1px); background-size: 40px 40px; }
  .jsa-hero-inner { position: relative; z-index: 1; max-width: 1100px; margin: 0 auto; display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 16px; }
  .jsa-hero-title { font-family: 'Syne', sans-serif; font-size: clamp(22px,3.5vw,34px); font-weight: 800; color: #1e1b3a; margin: 0 0 6px; letter-spacing: -.3px; }
  .jsa-hero-sub { font-size: 15px; color: #6b7280; margin: 0; }
  .jsa-back-btn { display: inline-flex; align-items: center; gap: 6px; padding: 9px 16px; border-radius: 10px; font-size: 13px; font-weight: 600; cursor: pointer; border: 1px solid rgba(99,102,241,.3); background: rgba(99,102,241,.08); color: #4f46e5; font-family: 'DM Sans',sans-serif; transition: all .2s; text-decoration: none; }
  .jsa-back-btn:hover { background: rgba(99,102,241,.15); transform: translateY(-1px); }

  /* ── Stats strip ── */
  .jsa-stats-strip { position: relative; z-index: 10; margin: -24px auto 0; max-width: 1100px; padding: 0 40px; }
  .jsa-stats-inner { background: #fff; border: 1px solid #e0e7ff; border-radius: 14px; display: grid; grid-template-columns: repeat(3,1fr); box-shadow: 0 8px 32px rgba(99,102,241,.1); }
  .jsa-stat { padding: 16px 20px; display: flex; align-items: center; gap: 12px; }
  .jsa-stat:not(:last-child) { border-right: 1px solid #e0e7ff; }
  .jsa-stat-icon { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 16px; }
  .jsa-stat-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .5px; color: #9ca3af; }
  .jsa-stat-val { font-size: 20px; font-weight: 800; color: #1e1b3a; }

  /* ── Main ── */
  .jsa-main { max-width: 1100px; margin: 0 auto; padding: 32px 40px 80px; }
  .jsa-section-title { font-family: 'Syne',sans-serif; font-size: 18px; font-weight: 700; color: #1e1b3a; margin: 0 0 16px; }

  /* ── Table card ── */
  .jsa-table-card { background: #fff; border: 1px solid #e8eaf6; border-radius: 16px; overflow: hidden; animation: jsa-in .4s ease both; }
  @keyframes jsa-in { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }

  .jsa-table { width: 100%; border-collapse: collapse; }
  .jsa-thead { background: #f5f6ff; }
  .jsa-thead th { padding: 14px 20px; text-align: left; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .6px; color: #9ca3af; border-bottom: 1px solid #e0e7ff; white-space: nowrap; }
  .jsa-tbody tr { border-bottom: 1px solid #f3f4f6; transition: background .15s; }
  .jsa-tbody tr:last-child { border-bottom: none; }
  .jsa-tbody tr:hover { background: #fafbff; }
  .jsa-tbody td { padding: 16px 20px; font-size: 14px; vertical-align: middle; }

  /* ── Row elements ── */
  .jsa-job-icon { width: 38px; height: 38px; border-radius: 10px; background: linear-gradient(135deg,#eef2ff,#ede9fe); border: 1px solid #e0e7ff; display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; }
  .jsa-job-title { font-family: 'Syne',sans-serif; font-size: 14px; font-weight: 700; color: #1e1b3a; margin: 0 0 2px; }
  .jsa-job-company { font-size: 12px; color: #9ca3af; margin: 0; }
  .jsa-date { font-size: 13px; color: #6b7280; }

  /* ── Status badges ── */
  .jsa-badge { display: inline-flex; align-items: center; gap: 5px; padding: 4px 12px; border-radius: 100px; font-size: 11px; font-weight: 700; }
  .jsa-badge--submitted  { background: #eef2ff; color: #4f46e5; border: 1px solid #c7d2fe; }
  .jsa-badge--reviewed   { background: #fef9c3; color: #854d0e; border: 1px solid #fde68a; }
  .jsa-badge--shortlisted{ background: #f5f3ff; color: #6d28d9; border: 1px solid #ddd6fe; }
  .jsa-badge--accepted   { background: #dcfce7; color: #15803d; border: 1px solid #bbf7d0; }
  .jsa-badge--rejected   { background: #fee2e2; color: #b91c1c; border: 1px solid #fca5a5; }
  .jsa-badge--default    { background: #f3f4f6; color: #6b7280; border: 1px solid #e5e7eb; }

  /* ── Action button ── */
  .jsa-view-btn { display: inline-flex; align-items: center; gap: 6px; padding: 7px 14px; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; border: 1px solid #e0e7ff; background: #f5f6ff; color: #4f46e5; font-family: 'DM Sans',sans-serif; transition: all .2s; }
  .jsa-view-btn:hover { background: #eef2ff; border-color: #c7d2fe; transform: translateY(-1px); }

  /* ── Empty state ── */
  .jsa-empty { text-align: center; padding: 72px 20px; background: #fff; border: 1px solid #e8eaf6; border-radius: 16px; animation: jsa-in .4s ease both; }
  .jsa-empty-icon { width: 72px; height: 72px; border-radius: 50%; background: #eef2ff; display: flex; align-items: center; justify-content: center; font-size: 28px; margin: 0 auto 16px; }
  .jsa-empty-title { font-family: 'Syne',sans-serif; font-size: 20px; font-weight: 700; color: #1e1b3a; margin-bottom: 8px; }
  .jsa-empty-sub { font-size: 14px; color: #9ca3af; margin-bottom: 24px; }
  .jsa-browse-btn { display: inline-flex; align-items: center; gap: 6px; padding: 10px 22px; border-radius: 10px; font-size: 13px; font-weight: 600; cursor: pointer; border: none; background: linear-gradient(135deg,#4f46e5,#7c3aed); color: #fff; font-family: 'DM Sans',sans-serif; box-shadow: 0 4px 14px rgba(79,70,229,.2); transition: all .2s; }
  .jsa-browse-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(79,70,229,.3); }

  /* ── Loading ── */
  .jsa-loading { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 60vh; gap: 20px; }
  .jsa-spinner { width: 44px; height: 44px; border: 3px solid #e0e7ff; border-top-color: #6366f1; border-radius: 50%; animation: jsa-spin .8s linear infinite; }
  @keyframes jsa-spin { to{transform:rotate(360deg)} }

  /* ── Modal overlay ── */
  .jsa-overlay { position: fixed; inset: 0; background: rgba(15,23,42,.45); backdrop-filter: blur(6px); display: flex; align-items: center; justify-content: center; z-index: 50; padding: 20px; animation: jsa-fade-in .2s ease; }
  @keyframes jsa-fade-in { from{opacity:0} to{opacity:1} }

  /* ── Modal panel ── */
  .jsa-modal { background: #fff; border: 1px solid #e0e7ff; border-radius: 20px; box-shadow: 0 24px 72px rgba(99,102,241,.18); max-width: 640px; width: 100%; max-height: 90vh; overflow-y: auto; animation: jsa-modal-in .25s cubic-bezier(.34,1.56,.64,1); }
  @keyframes jsa-modal-in { from{opacity:0;transform:translateY(16px) scale(.97)} to{opacity:1;transform:translateY(0) scale(1)} }
  .jsa-modal::-webkit-scrollbar { width: 6px; }
  .jsa-modal::-webkit-scrollbar-thumb { background: #e0e7ff; border-radius: 10px; }

  .jsa-modal-header { padding: 24px 24px 20px; border-bottom: 1px solid #e0e7ff; display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; position: sticky; top: 0; background: #fff; z-index: 2; border-radius: 20px 20px 0 0; }
  .jsa-modal-title { font-family: 'Syne',sans-serif; font-size: 22px; font-weight: 800; color: #1e1b3a; margin: 0 0 4px; }
  .jsa-modal-company { font-size: 14px; color: #4f46e5; font-weight: 600; }
  .jsa-modal-close { width: 32px; height: 32px; border-radius: 50%; border: 1px solid #e0e7ff; background: #f5f6ff; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 16px; color: #6b7280; transition: all .2s; flex-shrink: 0; }
  .jsa-modal-close:hover { background: #fee2e2; border-color: #fca5a5; color: #dc2626; }

  .jsa-modal-chips { display: flex; flex-wrap: wrap; gap: 8px; padding: 16px 24px 0; }
  .jsa-modal-chip { display: inline-flex; align-items: center; gap: 4px; background: rgba(99,102,241,.08); border: 1px solid rgba(99,102,241,.15); border-radius: 100px; padding: 4px 12px; font-size: 12px; color: #4f46e5; font-weight: 500; }

  .jsa-modal-body { padding: 20px 24px; }
  .jsa-modal-section-title { font-family: 'Syne',sans-serif; font-size: 14px; font-weight: 700; color: #1e1b3a; margin: 0 0 8px; }
  .jsa-modal-text { font-size: 13.5px; color: #4b5563; line-height: 1.75; white-space: pre-line; margin-bottom: 20px; }
  .jsa-skill-wrap { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 20px; }
  .jsa-skill-tag { background: #eef2ff; border: 1px solid #c7d2fe; color: #4f46e5; padding: 4px 12px; border-radius: 100px; font-size: 12px; font-weight: 600; }

  .jsa-modal-footer { padding: 16px 24px; border-top: 1px solid #e0e7ff; background: #f5f6ff; border-radius: 0 0 20px 20px; display: flex; justify-content: flex-end; gap: 10px; }
  .jsa-btn-ghost { display: inline-flex; align-items: center; gap: 6px; padding: 9px 18px; border-radius: 10px; font-size: 13px; font-weight: 600; cursor: pointer; border: 1px solid #e0e7ff; background: #fff; color: #4f46e5; font-family: 'DM Sans',sans-serif; transition: all .2s; }
  .jsa-btn-ghost:hover { background: #eef2ff; }

  @media(max-width:900px){ .jsa-stats-inner{grid-template-columns:1fr} .jsa-stat:not(:last-child){border-right:none;border-bottom:1px solid #e0e7ff} }
  @media(max-width:640px){ .jsa-hero{padding:28px 16px 60px} .jsa-stats-strip{padding:0 16px} .jsa-main{padding:28px 16px 60px} .jsa-table-card{overflow-x:auto} }
`;

function getBadgeClass(status) {
  const s = (status || "").toLowerCase();
  if (s === "submitted")   return "jsa-badge jsa-badge--submitted";
  if (s === "reviewed")    return "jsa-badge jsa-badge--reviewed";
  if (s === "shortlisted") return "jsa-badge jsa-badge--shortlisted";
  if (s === "accepted")    return "jsa-badge jsa-badge--accepted";
  if (s === "rejected")    return "jsa-badge jsa-badge--rejected";
  return "jsa-badge jsa-badge--default";
}

function JobSeekerApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [selectedJob, setSelectedJob]   = useState(null);
  const navigate = useNavigate();

  useEffect(() => { fetchApplications(); }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const data = await getAppliedJobs();
      setApplications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching applications:", err);
    } finally {
      setLoading(false);
    }
  };

  /* ── derived stats ── */
  const total      = applications.length;
  const shortlisted = applications.filter(a => (a.status||"").toLowerCase() === "shortlisted").length;
  const accepted    = applications.filter(a => (a.status||"").toLowerCase() === "accepted").length;

  if (loading) return (
    <div className="jsa-wrap">
      <style>{styles}</style>
      <div className="jsa-loading">
        <div className="jsa-spinner"/>
        <p style={{color:"#6366f1",fontWeight:500}}>Loading applications…</p>
      </div>
    </div>
  );

  return (
    <div className="jsa-wrap">
      <style>{styles}</style>

      {/* ── Hero ── */}
      <div className="jsa-hero">
        <div className="jsa-blob jsa-blob--1"/><div className="jsa-blob jsa-blob--2"/><div className="jsa-grid-bg"/>
        <div className="jsa-hero-inner">
          <div>
            <h1 className="jsa-hero-title">My Applications</h1>
            <p className="jsa-hero-sub">{total} application{total !== 1 ? "s" : ""} submitted</p>
          </div>
          <button className="jsa-back-btn" onClick={() => navigate("/jobseeker/dashboard")}>
            ← Back to Dashboard
          </button>
        </div>
      </div>

      {/* ── Stats strip ── */}
      <div className="jsa-stats-strip">
        <div className="jsa-stats-inner">
          <div className="jsa-stat">
            <div className="jsa-stat-icon" style={{background:"#eef2ff"}}>📝</div>
            <div><div className="jsa-stat-label">Total Applied</div><div className="jsa-stat-val">{total}</div></div>
          </div>
          <div className="jsa-stat">
            <div className="jsa-stat-icon" style={{background:"#f5f3ff"}}>⭐</div>
            <div><div className="jsa-stat-label">Shortlisted</div><div className="jsa-stat-val">{shortlisted}</div></div>
          </div>
          <div className="jsa-stat">
            <div className="jsa-stat-icon" style={{background:"#f0fdf4"}}>✅</div>
            <div><div className="jsa-stat-label">Accepted</div><div className="jsa-stat-val">{accepted}</div></div>
          </div>
        </div>
      </div>

      {/* ── Main ── */}
      <div className="jsa-main">
        <h2 className="jsa-section-title">Application History</h2>

        {applications.length === 0 ? (
          <div className="jsa-empty">
            <div className="jsa-empty-icon">📝</div>
            <h3 className="jsa-empty-title">No applications yet</h3>
            <p className="jsa-empty-sub">You haven't applied to any jobs yet. Start applying to track your progress here.</p>
            <button className="jsa-browse-btn" onClick={() => navigate("/jobseeker/jobs")}>
              Browse Jobs
            </button>
          </div>
        ) : (
          <div className="jsa-table-card">
            <table className="jsa-table">
              <thead className="jsa-thead">
                <tr>
                  <th>Job</th>
                  <th>Applied Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody className="jsa-tbody">
                {applications.map((application) => {
                  const statusRaw = application.job?.status || application.status || "submitted";
                  return (
                    <tr key={application.id}>
                      {/* Job col */}
                      <td>
                        <div style={{display:"flex",alignItems:"center",gap:12}}>
                          <div className="jsa-job-icon">💼</div>
                          <div>
                            <p className="jsa-job-title">{application.job?.title || "—"}</p>
                            <p className="jsa-job-company">{application.company_name}</p>
                          </div>
                        </div>
                      </td>

                      {/* Date col */}
                      <td>
                        <span className="jsa-date">
                          {new Date(application.applied_at).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}
                        </span>
                      </td>

                      {/* Status col */}
                      <td>
                        <span className={getBadgeClass(statusRaw)}>
                          {statusRaw.charAt(0).toUpperCase() + statusRaw.slice(1)}
                        </span>
                      </td>

                      {/* Actions col */}
                      <td>
                        <button className="jsa-view-btn" onClick={() => setSelectedJob(application)}>
                          👁 View Job
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Job Detail Modal ── */}
      {selectedJob && (
        <div className="jsa-overlay" onClick={() => setSelectedJob(null)}>
          <div className="jsa-modal" onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div className="jsa-modal-header">
              <div>
                <h2 className="jsa-modal-title">{selectedJob.job?.title || "Job Details"}</h2>
                <p className="jsa-modal-company">
                  {selectedJob.company_name}
                  {selectedJob.job?.location ? ` · ${selectedJob.job.location}` : ""}
                </p>
              </div>
              <button className="jsa-modal-close" onClick={() => setSelectedJob(null)}>✕</button>
            </div>

            {/* Chips row */}
            <div className="jsa-modal-chips">
              {selectedJob.job?.location && (
                <span className="jsa-modal-chip">📍 {selectedJob.job.location}</span>
              )}
              {selectedJob.job?.application_deadline && (
                <span className="jsa-modal-chip">📅 Deadline: {selectedJob.job.application_deadline}</span>
              )}
              <span className={getBadgeClass(selectedJob.job?.status || selectedJob.status || "submitted")}>
                {(selectedJob.job?.status || selectedJob.status || "Submitted").charAt(0).toUpperCase()
                  + (selectedJob.job?.status || selectedJob.status || "Submitted").slice(1)}
              </span>
            </div>

            {/* Body */}
            <div className="jsa-modal-body">
              {selectedJob.job?.description && (
                <>
                  <h3 className="jsa-modal-section-title">Job Description</h3>
                  <p className="jsa-modal-text">{selectedJob.job.description}</p>
                </>
              )}

              {selectedJob.job?.requirements && (
                <>
                  <h3 className="jsa-modal-section-title">Requirements</h3>
                  <p className="jsa-modal-text">{selectedJob.job.requirements}</p>
                </>
              )}

              {selectedJob.job?.skills && (
                <>
                  <h3 className="jsa-modal-section-title">Required Skills</h3>
                  <div className="jsa-skill-wrap">
                    {selectedJob.job.skills.split(",").map((s, i) => (
                      <span key={i} className="jsa-skill-tag">{s.trim()}</span>
                    ))}
                  </div>
                </>
              )}

              {/* Application score summary if available */}
              {selectedJob.application && (
                <>
                  {/* <h3 className="jsa-modal-section-title">Your Application Score</h3>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))",gap:10,marginBottom:20}}> */}
                    {/* {[
                      {label:"Rank Score",val:selectedJob.application.rank_score},
                      {label:"LLM Score",val:selectedJob.application.groq_rank},
                      {label:"BERT Score",val:selectedJob.application.bert_similarity},
                    ].filter(s => s.val !== undefined && s.val !== null).map((s,i) => (
                      <div key={i} style={{background:"#f5f6ff",border:"1px solid #e0e7ff",borderRadius:10,padding:"10px 14px"}}>
                        <div style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:".5px",color:"#9ca3af",marginBottom:4}}>{s.label}</div>
                        <div style={{fontSize:20,fontWeight:800,color:"#4f46e5"}}>{Number(s.val).toFixed(1)}</div>
                      </div>
                    ))} */}
                  {/* </div> */}

                  {selectedJob.application.skills?.length > 0 && (
                    <>
                      <h3 className="jsa-modal-section-title">Detected Skills In Resume</h3>
                      <div className="jsa-skill-wrap" style={{marginBottom:20}}>
                        {selectedJob.application.skills.map((sk,i) => (
                          <span key={i} className="jsa-skill-tag">{sk}</span>
                        ))}
                      </div>
                    </>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            <div className="jsa-modal-footer">
              <button className="jsa-btn-ghost" onClick={() => setSelectedJob(null)}>Close</button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

export default JobSeekerApplications;