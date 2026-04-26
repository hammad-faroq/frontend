import React from "react";
import { deleteJob } from "../services/api";
import toast from "react-hot-toast";

const styles = `
  .hrjl-wrap { padding: 0; }

  .hrjl-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 20px 24px 16px;
    border-bottom: 1px solid #f1f5f9;
  }
  .hrjl-title {
    font-size: 16px; font-weight: 700; color: #1e293b; margin: 0;
  }
  .hrjl-count {
    font-size: 13px; color: #94a3b8; font-weight: 500;
    background: #f1f5f9; padding: 3px 12px; border-radius: 20px;
  }

  /* Empty state */
  .hrjl-empty {
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; padding: 60px 20px; gap: 12px;
  }
  .hrjl-empty-icon {
    width: 56px; height: 56px; border-radius: 16px;
    background: #eef2ff;
    display: flex; align-items: center; justify-content: center;
    color: #6366f1; margin-bottom: 4px;
  }
  .hrjl-empty-text { font-size: 15px; color: #64748b; font-weight: 500; margin: 0; }
  .hrjl-empty-sub { font-size: 13px; color: #94a3b8; margin: 0; }

  /* Table */
  .hrjl-table-wrap { overflow-x: auto; }
  table.hrjl-table { width: 100%; border-collapse: collapse; }
  .hrjl-table thead tr {
    background: #f8faff;
    border-bottom: 2px solid #e0e7ff;
  }
  .hrjl-table th {
    padding: 12px 20px;
    text-align: left;
    font-size: 11px; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.5px;
    color: #6366f1;
    white-space: nowrap;
  }
  .hrjl-table tbody tr {
    border-bottom: 1px solid #f1f5f9;
    transition: background 0.15s;
  }
  .hrjl-table tbody tr:last-child { border-bottom: none; }
  .hrjl-table tbody tr:hover { background: #f8faff; }
  .hrjl-table td { padding: 16px 20px; vertical-align: middle; }

  /* Job title cell */
  .hrjl-job-title {
    font-size: 14px; font-weight: 700; color: #1e293b;
    margin: 0 0 3px; white-space: nowrap;
    overflow: hidden; text-overflow: ellipsis; max-width: 220px;
  }
  .hrjl-job-company {
    font-size: 12.5px; color: #64748b; margin: 0;
    display: flex; align-items: center; gap: 4px;
  }

  /* Location */
  .hrjl-location {
    font-size: 13px; color: #475569;
    display: flex; align-items: center; gap: 5px;
  }

  /* Apps badge */
  .hrjl-apps-badge {
    display: inline-flex; align-items: center; gap: 5px;
    background: #eef2ff; color: #4f46e5;
    padding: 4px 12px; border-radius: 20px;
    font-size: 12px; font-weight: 700;
    border: 1px solid #c7d2fe;
  }
  .hrjl-apps-badge--zero {
    background: #f1f5f9; color: #94a3b8;
    border-color: #e2e8f0;
  }

  /* Deadline */
  .hrjl-deadline { font-size: 13px; font-weight: 500; }
  .hrjl-deadline--expired { color: #dc2626; }
  .hrjl-deadline--active { color: #475569; }
  .hrjl-deadline-label {
    font-size: 11px; color: #94a3b8; display: block; margin-top: 2px;
  }

  /* Action buttons */
  .hrjl-actions { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }

  .hrjl-btn {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 6px 12px; border-radius: 8px;
    font-size: 12px; font-weight: 600;
    cursor: pointer; border: none;
    transition: all 0.18s ease;
    white-space: nowrap; font-family: inherit;
    text-decoration: none;
  }
  .hrjl-btn svg { width: 13px; height: 13px; flex-shrink: 0; }

  .hrjl-btn--view {
    background: #eef2ff; color: #4f46e5;
    border: 1px solid #c7d2fe;
  }
  .hrjl-btn--view:hover { background: #e0e7ff; transform: translateY(-1px); }

  .hrjl-btn--edit {
    background: #f0fdf4; color: #16a34a;
    border: 1px solid #bbf7d0;
  }
  .hrjl-btn--edit:hover { background: #dcfce7; transform: translateY(-1px); }

  .hrjl-btn--schedule {
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    color: #fff; border: none;
    box-shadow: 0 2px 8px rgba(99,102,241,0.25);
  }
  .hrjl-btn--schedule:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 16px rgba(99,102,241,0.4);
  }

  .hrjl-btn--delete {
    background: #fef2f2; color: #dc2626;
    border: 1px solid #fecaca;
  }
  .hrjl-btn--delete:hover { background: #fee2e2; transform: translateY(-1px); }

  /* Create first job btn */
  .hrjl-btn--primary {
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    color: #fff; border: none;
    padding: 10px 20px; font-size: 14px;
    box-shadow: 0 4px 12px rgba(99,102,241,0.3);
  }
  .hrjl-btn--primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(99,102,241,0.4);
  }

  /* Toast confirm */
  .hrjl-toast-msg { font-size: 14px; color: #1e293b; margin: 0 0 12px; font-weight: 500; }
  .hrjl-toast-actions { display: flex; gap: 8px; }
  .hrjl-toast-yes {
    background: #dc2626; color: #fff;
    border: none; border-radius: 7px;
    padding: 6px 16px; font-size: 13px; font-weight: 600;
    cursor: pointer; transition: background 0.15s;
  }
  .hrjl-toast-yes:hover { background: #b91c1c; }
  .hrjl-toast-no {
    background: #f1f5f9; color: #475569;
    border: none; border-radius: 7px;
    padding: 6px 16px; font-size: 13px; font-weight: 600;
    cursor: pointer; transition: background 0.15s;
  }
  .hrjl-toast-no:hover { background: #e2e8f0; }
`;

function HRJobsList({ jobs = [], onEditJob, onViewJob, onScheduleInterview, onDeleteJob, onCreateJob }) {

  const handleDeleteJob = async (jobId) => {
    const confirmed = await new Promise((resolve) => {
      toast(
        (t) => (
          <div>
            <p className="hrjl-toast-msg">Are you sure you want to delete this job?</p>
            <div className="hrjl-toast-actions">
              <button className="hrjl-toast-yes" onClick={() => { toast.dismiss(t.id); resolve(true); }}>
                Yes, Delete
              </button>
              <button className="hrjl-toast-no" onClick={() => { toast.dismiss(t.id); resolve(false); }}>
                Cancel
              </button>
            </div>
          </div>
        ),
        { duration: Infinity }
      );
    });

    if (!confirmed) return;

    try {
      await deleteJob(jobId);
      toast.success("Job deleted successfully");
      onDeleteJob(jobId);
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete job.");
    }
  };

  const safeJobs = Array.isArray(jobs) ? jobs : [];

  const isExpired = (deadline) => deadline && new Date(deadline) < new Date();

  return (
    <>
      <style>{styles}</style>
      <div className="hrjl-wrap">

        {/* Header */}
        <div className="hrjl-header">
          <h4 className="hrjl-title">My Job Posts</h4>
          <span className="hrjl-count">{safeJobs.length} job{safeJobs.length !== 1 ? "s" : ""}</span>
        </div>

        {/* Empty state */}
        {safeJobs.length === 0 ? (
          <div className="hrjl-empty">
            <div className="hrjl-empty-icon">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="2" y="7" width="20" height="14" rx="2"/>
                <path d="M16 3H8l-2 4h12z"/>
              </svg>
            </div>
            <p className="hrjl-empty-text">No job posts yet</p>
            <p className="hrjl-empty-sub">Create your first job listing to start receiving applications</p>
            <button onClick={onCreateJob} className="hrjl-btn hrjl-btn--primary" style={{marginTop: 8}}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Create First Job
            </button>
          </div>
        ) : (
          <div className="hrjl-table-wrap">
            <table className="hrjl-table">
              <thead>
                <tr>
                  <th>Job Title</th>
                  <th>Location</th>
                  <th>Applications</th>
                  <th>Deadline</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {safeJobs.map((job) => {
                  const appCount = job.applications_count ?? job.applications?.length ?? 0;
                  const expired = isExpired(job.application_deadline);

                  return (
                    <tr key={job.id}>

                      {/* Title */}
                      <td>
                        <p className="hrjl-job-title">{job.title}</p>
                        <p className="hrjl-job-company">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                          </svg>
                          {job.company_name || "—"}
                        </p>
                      </td>

                      {/* Location */}
                      <td>
                        <span className="hrjl-location">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                            <circle cx="12" cy="10" r="3"/>
                          </svg>
                          {job.location || "Remote"}
                        </span>
                      </td>

                      {/* Applications */}
                      <td>
                        <span className={`hrjl-apps-badge${appCount === 0 ? " hrjl-apps-badge--zero" : ""}`}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                            <circle cx="9" cy="7" r="4"/>
                          </svg>
                          {appCount} application{appCount !== 1 ? "s" : ""}
                        </span>
                      </td>

                      {/* Deadline */}
                      <td>
                        <span className={`hrjl-deadline ${expired ? "hrjl-deadline--expired" : "hrjl-deadline--active"}`}>
                          {job.application_deadline
                            ? new Date(job.application_deadline).toLocaleDateString()
                            : "No deadline"}
                        </span>
                        {expired && <span className="hrjl-deadline-label">Expired</span>}
                      </td>

                      {/* Actions */}
                      <td>
                        <div className="hrjl-actions">
                          <button onClick={() => onViewJob(job.id)} className="hrjl-btn hrjl-btn--view">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                              <circle cx="12" cy="12" r="3"/>
                            </svg>
                            View
                          </button>
                          <button onClick={() => onEditJob(job)} className="hrjl-btn hrjl-btn--edit">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                            Edit
                          </button>
                          <button onClick={() => onScheduleInterview(job.id)} className="hrjl-btn hrjl-btn--schedule">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="3" y="4" width="18" height="18" rx="2"/>
                              <line x1="16" y1="2" x2="16" y2="6"/>
                              <line x1="8" y1="2" x2="8" y2="6"/>
                              <line x1="3" y1="10" x2="21" y2="10"/>
                            </svg>
                            Schedule
                          </button>
                          <button onClick={() => handleDeleteJob(job.id)} className="hrjl-btn hrjl-btn--delete">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="3 6 5 6 21 6"/>
                              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                              <path d="M10 11v6M14 11v6"/>
                            </svg>
                            Delete
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

export default HRJobsList;