import React from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const styles = `
  .hril-wrap { padding: 0; font-family: inherit; }

  .hril-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 20px 24px 16px;
    border-bottom: 1px solid #e8eaf6;
  }
  .hril-title {
    font-size: 16px; font-weight: 700; color: #1e293b; margin: 0;
    display: flex; align-items: center; gap: 10px;
  }
  .hril-title-accent {
    display: block; width: 4px; height: 18px;
    background: #f59e0b; border-radius: 4px;
  }
  .hril-count {
    font-size: 12.5px; color: #94a3b8; font-weight: 600;
    background: #f1f5f9; padding: 3px 12px;
    border-radius: 20px; border: 1px solid #e8eaf6;
  }

  /* Empty state */
  .hril-empty {
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; padding: 60px 20px; gap: 10px;
  }
  .hril-empty-icon {
    width: 60px; height: 60px; border-radius: 16px;
    background: #fef9c3;
    display: flex; align-items: center; justify-content: center;
    color: #f59e0b; margin-bottom: 6px;
  }
  .hril-empty-title { font-size: 15px; color: #1e293b; font-weight: 700; margin: 0; }
  .hril-empty-sub { font-size: 13px; color: #94a3b8; margin: 0; }

  /* Table — no overflow/scroll at all */
  .hril-table-wrap { }
  table.hril-table { width: 100%; border-collapse: collapse; }

  .hril-table thead tr {
    background: #f8faff;
    border-bottom: 2px solid #e8eaf6;
  }
  .hril-table th {
    padding: 12px 20px;
    text-align: left;
    font-size: 11px; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.5px;
    color: #6366f1; white-space: nowrap;
  }
  .hril-table tbody tr {
    border-bottom: 1px solid #f1f5f9;
    transition: background 0.15s;
  }
  .hril-table tbody tr:last-child { border-bottom: none; }
  .hril-table tbody tr:hover { background: #f8faff; }
  .hril-table td { padding: 16px 20px; vertical-align: middle; }

  /* Candidate cell */
  .hril-candidate-email {
    font-size: 14px; font-weight: 700; color: #1e293b; margin: 0 0 3px;
  }
  .hril-candidate-name {
    font-size: 12px; color: #64748b; margin: 0;
    display: flex; align-items: center; gap: 4px;
  }

  /* Job title */
  .hril-job-title {
    font-size: 13px; font-weight: 600; color: #475569;
    max-width: 160px; white-space: nowrap;
    overflow: hidden; text-overflow: ellipsis;
  }

  /* Type badge */
  .hril-type-badge {
    display: inline-flex; align-items: center; gap: 4px;
    background: #f3e8ff; color: #7c3aed;
    border: 1px solid #e9d5ff;
    padding: 3px 10px; border-radius: 20px;
    font-size: 11.5px; font-weight: 700;
    text-transform: capitalize;
  }

  /* Status badges */
  .hril-status {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 4px 10px; border-radius: 20px;
    font-size: 11.5px; font-weight: 700;
    white-space: nowrap;
  }
  .hril-status-dot {
    width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0;
  }
  .hril-status--scheduled   { background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; }
  .hril-status--scheduled .hril-status-dot { background: #3b82f6; }
  .hril-status--in_progress { background: #f3e8ff; color: #7c3aed; border: 1px solid #e9d5ff; }
  .hril-status--in_progress .hril-status-dot { background: #8b5cf6; animation: hril-pulse-dot 1.5s infinite; }
  .hril-status--submitted   { background: #fefce8; color: #a16207; border: 1px solid #fde68a; }
  .hril-status--submitted .hril-status-dot { background: #f59e0b; }
  .hril-status--completed   { background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0; }
  .hril-status--completed .hril-status-dot { background: #22c55e; }
  .hril-status--cancelled   { background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; }
  .hril-status--cancelled .hril-status-dot { background: #ef4444; }
  .hril-status--no_show     { background: #f8fafc; color: #64748b; border: 1px solid #e2e8f0; }
  .hril-status--no_show .hril-status-dot { background: #94a3b8; }

  @keyframes hril-pulse-dot {
    0%,100% { opacity: 1; } 50% { opacity: 0.3; }
  }

  .hril-ready-tag {
    display: flex; align-items: center; gap: 4px;
    font-size: 11px; color: #16a34a; font-weight: 600;
    margin-top: 5px;
  }

  /* Action buttons */
  .hril-actions { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }

  .hril-btn {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 6px 12px; border-radius: 8px;
    font-size: 12px; font-weight: 600;
    cursor: pointer; border: none;
    transition: all 0.2s ease;
    white-space: nowrap; font-family: inherit;
    letter-spacing: 0.2px;
  }
  .hril-btn svg { width: 12px; height: 12px; flex-shrink: 0; }
  .hril-btn:disabled {
    opacity: 0.45; cursor: not-allowed; transform: none !important;
    box-shadow: none !important;
  }

  .hril-btn--start {
    background: linear-gradient(135deg, #16a34a, #15803d);
    color: #fff; border: none;
    box-shadow: 0 3px 10px rgba(22,163,74,0.3);
  }
  .hril-btn--start:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 5px 16px rgba(22,163,74,0.4);
  }

  .hril-btn--disabled {
    background: #f1f5f9; color: #94a3b8;
    border: 1px solid #e2e8f0;
  }

  .hril-btn--monitor {
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    color: #fff; border: none;
    box-shadow: 0 3px 10px rgba(99,102,241,0.3);
  }
  .hril-btn--monitor:hover {
    transform: translateY(-1px);
    box-shadow: 0 5px 16px rgba(99,102,241,0.45);
  }

  .hril-btn--review {
    background: linear-gradient(135deg, #f59e0b, #d97706);
    color: #fff; border: none;
    box-shadow: 0 3px 10px rgba(245,158,11,0.3);
  }
  .hril-btn--review:hover {
    transform: translateY(-1px);
    box-shadow: 0 5px 16px rgba(245,158,11,0.4);
  }

  .hril-btn--questions {
    background: #f3e8ff; color: #7c3aed;
    border: 1px solid #e9d5ff;
  }
  .hril-btn--questions:hover {
    background: #ede9fe; transform: translateY(-1px);
  }

  .hril-btn--result {
    background: #f0fdf4; color: #16a34a;
    border: 1px solid #bbf7d0;
  }
  .hril-btn--result:hover {
    background: #dcfce7; transform: translateY(-1px);
  }

  .hril-btn--finalize {
    background: #f0fdf4; color: #15803d;
    border: 1px solid #bbf7d0;
  }
  .hril-btn--finalize:hover {
    background: #dcfce7; transform: translateY(-1px);
  }

  .hril-btn--reschedule {
    background: #fff7ed; color: #c2410c;
    border: 1px solid #fed7aa;
  }
  .hril-btn--reschedule:hover {
    background: #ffedd5; transform: translateY(-1px);
  }

  .hril-btn--cancel {
    background: #fef2f2; color: #dc2626;
    border: 1px solid #fecaca;
  }
  .hril-btn--cancel:hover {
    background: #fee2e2; transform: translateY(-1px);
  }

  .hril-btn--noshow {
    background: #f8fafc; color: #64748b;
    border: 1px solid #e2e8f0;
  }
  .hril-btn--noshow:hover {
    background: #f1f5f9; transform: translateY(-1px);
  }

  .hril-btn--end {
    background: #fef2f2; color: #dc2626;
    border: 1px solid #fecaca;
  }
  .hril-btn--end:hover {
    background: #fee2e2; transform: translateY(-1px);
  }

  /* Toast */
  .hril-toast-msg { font-size: 14px; font-weight: 600; color: #1e293b; margin: 0 0 14px; }
  .hril-toast-actions { display: flex; gap: 8px; }
  .hril-toast-yes {
    background: linear-gradient(135deg, #dc2626, #b91c1c);
    color: #fff; border: none; border-radius: 8px;
    padding: 7px 16px; font-size: 13px; font-weight: 600;
    cursor: pointer; font-family: inherit;
  }
  .hril-toast-no {
    background: #f1f5f9; color: #475569;
    border: 1px solid #e2e8f0; border-radius: 8px;
    padding: 7px 16px; font-size: 13px; font-weight: 600;
    cursor: pointer; font-family: inherit;
  }
`;

function HRInterviewsList({
  interviews = [],
  onReviewInterview,
  onFinalizeInterview,
  onAddQuestions,
  onViewResult,
  onMonitorInterview,
  onEndInterview,
  onCancelInterview,
  onMarkNoShow,
  onRescheduleInterview
}) {
  const navigate = useNavigate();
  const safeInterviews = Array.isArray(interviews) ? interviews : [];

  const getCandidateEmail = (interview) =>
    interview.candidate_email ||
    interview.candidate?.email ||
    interview.candidate_email_address ||
    "candidate@example.com";

  const getCandidateName = (interview) => {
    if (interview.candidate_name) return interview.candidate_name;
    if (interview.candidate) {
      const c = interview.candidate;
      if (c.first_name && c.last_name) return `${c.first_name} ${c.last_name}`;
      return c.email || "Candidate";
    }
    return interview.candidate_email || "Candidate";
  };

  const getJobTitle = (interview) =>
    interview.job_title || interview.job?.title || "Job Title";

  const formatStatus = (status) => ({
    scheduled: "Scheduled",
    in_progress: "In Progress",
    submitted: "Submitted",
    completed: "Completed",
    cancelled: "Cancelled",
    no_show: "No Show",
  }[status] || status);

  const canStartInterview = (interview) => {
    if (interview.status !== "scheduled") return false;
    const scheduledTime = new Date(interview.scheduled_date || interview.scheduled_time);
    const diff = scheduledTime - new Date();
    return diff <= 15 * 60 * 1000 && diff >= -30 * 60 * 1000;
  };

  const confirmToast = (message) =>
    new Promise((resolve) => {
      toast(
        (t) => (
          <div>
            <p className="hril-toast-msg">{message}</p>
            <div className="hril-toast-actions">
              <button className="hril-toast-yes" onClick={() => { toast.dismiss(t.id); resolve(true); }}>
                Yes, confirm
              </button>
              <button className="hril-toast-no" onClick={() => { toast.dismiss(t.id); resolve(false); }}>
                Cancel
              </button>
            </div>
          </div>
        ),
        { duration: Infinity }
      );
    });

  const handleCancel = async (interviewId) => {
    if (await confirmToast("Cancel this interview?")) {
      onCancelInterview(interviewId);
      toast.error("Interview cancelled.");
    }
  };

  const handleMarkNoShow = async (interviewId) => {
    if (await confirmToast("Mark this interview as No Show?")) {
      onMarkNoShow(interviewId);
      toast.error("Marked as No Show.");
    }
  };

  const Icon = {
    user: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    clock: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    play: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>,
    eye: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
    star: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
    check: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>,
    plus: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    cal: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    x: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    stop: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>,
    warn: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  };

  return (
    <>
      <style>{styles}</style>
      <div className="hril-wrap">

        {/* Header */}
        <div className="hril-header">
          <h4 className="hril-title">
            <span className="hril-title-accent" />
            Interviews Management
          </h4>
          <span className="hril-count">
            {safeInterviews.length} interview{safeInterviews.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Empty */}
        {safeInterviews.length === 0 ? (
          <div className="hril-empty">
            <div className="hril-empty-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="3" y="4" width="18" height="18" rx="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <p className="hril-empty-title">No interviews scheduled yet</p>
            <p className="hril-empty-sub">Schedule an interview from any job posting above</p>
          </div>
        ) : (
          <div className="hril-table-wrap">
            <table className="hril-table">
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Job Title</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {safeInterviews.map((interview) => {
                  const canStart = canStartInterview(interview);
                  const email = getCandidateEmail(interview);
                  const name = getCandidateName(interview);
                  const jobTitle = getJobTitle(interview);
                  const statusClass = `hril-status hril-status--${interview.status || "scheduled"}`;

                  return (
                    <tr key={interview.id}>

                      {/* Candidate */}
                      <td>
                        <p className="hril-candidate-email">{email}</p>
                        {name && name !== email && (
                          <p className="hril-candidate-name">
                            {Icon.user} {name}
                          </p>
                        )}
                      </td>

                      {/* Job */}
                      <td>
                        <span className="hril-job-title">{jobTitle}</span>
                      </td>

                      {/* Type */}
                      <td>
                        <span className="hril-type-badge">
                          {interview.interview_type || "technical"}
                        </span>
                      </td>

                      {/* Status */}
                      <td>
                        <span className={statusClass}>
                          <span className="hril-status-dot" />
                          {formatStatus(interview.status)}
                        </span>
                        {interview.status === "scheduled" && canStart && (
                          <div className="hril-ready-tag">
                            ⏰ Ready to start
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td>
                        <div className="hril-actions">

                          {/* SCHEDULED */}
                          {interview.status === "scheduled" && (<>
                            {canStart ? (
                              <button className="hril-btn hril-btn--start"
                                onClick={() => navigate(`/hr/interview/${interview.id}/start`)}>
                                {Icon.play} Start Now
                              </button>
                            ) : (
                              <button className="hril-btn hril-btn--disabled" disabled>
                                {Icon.clock} Not yet
                              </button>
                            )}
                            <button className="hril-btn hril-btn--questions"
                              onClick={() => navigate(`/hr/interview/${interview.id}/add-questions`)}>
                              {Icon.plus} Questions
                            </button>
                            <button className="hril-btn hril-btn--noshow"
                              onClick={() => handleMarkNoShow(interview.id)}>
                              {Icon.warn} No Show
                            </button>
                            <button className="hril-btn hril-btn--cancel"
                              onClick={() => handleCancel(interview.id)}>
                              {Icon.x} Cancel
                            </button>
                          </>)}

                          {/* IN PROGRESS */}
                          {interview.status === "in_progress" && (<>
                            <button className="hril-btn hril-btn--monitor"
                              onClick={() => navigate(`/hr/interview/${interview.id}/monitor`)}>
                              {Icon.eye} Monitor
                            </button>
                            <button className="hril-btn hril-btn--end"
                              onClick={() => onEndInterview(interview.id)}>
                              {Icon.stop} End
                            </button>
                          </>)}

                          {/* SUBMITTED */}
                          {interview.status === "submitted" && (<>
                            <button className="hril-btn hril-btn--review"
                              onClick={() => onReviewInterview(interview.id)}>
                              {Icon.star} Review
                            </button>
                            <button className="hril-btn hril-btn--finalize"
                              onClick={() => onFinalizeInterview(interview.id)}>
                              {Icon.check} Finalize
                            </button>
                          </>)}

                          {/* COMPLETED */}
                          {interview.status === "completed" && (
                            <button className="hril-btn hril-btn--result"
                              onClick={() => navigate(`/hr/interview/${interview.id}/answers`)}>
                              {Icon.eye} View Result
                            </button>
                          )}

                          {/* CANCELLED / NO SHOW */}
                          {(interview.status === "cancelled" || interview.status === "no_show") && (
                            <button className="hril-btn hril-btn--reschedule"
                              onClick={() => onRescheduleInterview(interview.job_id || interview.job?.id)}>
                              {Icon.cal} Re-schedule
                            </button>
                          )}

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

export default HRInterviewsList;