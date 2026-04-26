import React, { useState, useEffect } from "react";
import { scheduleInterview } from "../services/interviewApi";
import toast from "react-hot-toast";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

  .im-overlay {
    position: fixed; inset: 0;
    background: rgba(15, 23, 42, 0.55);
    backdrop-filter: blur(6px);
    display: flex; align-items: center; justify-content: center;
    z-index: 50; padding: 16px;
    animation: im-fade-in 0.2s ease;
  }
  @keyframes im-fade-in { from { opacity: 0; } to { opacity: 1; } }

  .im-panel {
    background: #fff;
    border-radius: 20px;
    box-shadow: 0 24px 60px rgba(15,23,42,0.18), 0 4px 16px rgba(15,23,42,0.08);
    width: 100%; max-width: 520px;
    max-height: 90vh; overflow-y: auto;
    font-family: 'DM Sans', system-ui, sans-serif;
    animation: im-slide-up 0.25s cubic-bezier(0.34,1.56,0.64,1);
  }
  @keyframes im-slide-up {
    from { opacity: 0; transform: translateY(20px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }

  .im-panel::-webkit-scrollbar { width: 6px; }
  .im-panel::-webkit-scrollbar-track { background: transparent; }
  .im-panel::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }

  /* Header */
  .im-header {
    padding: 24px 28px 20px;
    border-bottom: 1px solid #f1f5f9;
    display: flex; align-items: center; justify-content: space-between;
    position: sticky; top: 0; background: #fff; z-index: 2;
    border-radius: 20px 20px 0 0;
  }
  .im-header-left { display: flex; align-items: center; gap: 12px; }
  .im-header-icon {
    width: 40px; height: 40px; border-radius: 12px;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    display: flex; align-items: center; justify-content: center;
    color: #fff; flex-shrink: 0;
    box-shadow: 0 4px 12px rgba(99,102,241,0.3);
  }
  .im-header-icon svg { width: 18px; height: 18px; }
  .im-title { font-size: 17px; font-weight: 700; color: #1e293b; margin: 0; }
  .im-subtitle { font-size: 12px; color: #94a3b8; margin: 2px 0 0; font-weight: 500;
    max-width: 300px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .im-close {
    width: 32px; height: 32px; border-radius: 8px;
    border: 1px solid #e8eaf6; background: #f8faff;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; color: #64748b; transition: all 0.15s;
    flex-shrink: 0;
  }
  .im-close:hover { background: #fef2f2; border-color: #fecaca; color: #dc2626; }
  .im-close svg { width: 14px; height: 14px; }

  /* Job info banner */
  .im-job-banner {
    margin: 0 28px 0;
    padding: 12px 16px;
    background: linear-gradient(135deg, #f5f3ff, #ede9fe);
    border: 1px solid #ddd6fe;
    border-radius: 12px;
    display: flex; align-items: center; gap: 10px;
    margin-top: 20px;
  }
  .im-job-banner-icon {
    width: 32px; height: 32px; border-radius: 8px;
    background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .im-job-banner-icon svg { width: 14px; height: 14px; }
  .im-job-banner-title { font-size: 13px; font-weight: 700; color: #3730a3; margin: 0; }
  .im-job-banner-id { font-size: 11.5px; color: #6366f1; margin: 2px 0 0;
    font-family: 'DM Mono', monospace; }

  /* Body */
  .im-body { padding: 20px 28px 24px; }

  .im-section-label {
    font-size: 11px; font-weight: 700; letter-spacing: 0.6px;
    text-transform: uppercase; color: #6366f1;
    margin: 0 0 14px;
    display: flex; align-items: center; gap: 8px;
  }
  .im-section-label::after {
    content: ''; flex: 1; height: 1px; background: #e8eaf6;
  }

  /* Fields */
  .im-field { margin-bottom: 14px; }
  .im-label {
    display: block; font-size: 12.5px; font-weight: 600;
    color: #475569; margin-bottom: 6px;
  }
  .im-label span { color: #6366f1; margin-left: 2px; }

  .im-input, .im-textarea, .im-select {
    width: 100%; border: 1.5px solid #e2e8f0;
    border-radius: 10px; padding: 10px 14px;
    font-size: 13.5px; color: #1e293b;
    font-family: 'DM Sans', system-ui, sans-serif;
    background: #fafbff; transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
    outline: none; box-sizing: border-box;
  }
  .im-input:focus, .im-textarea:focus, .im-select:focus {
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99,102,241,0.12);
    background: #fff;
  }
  .im-input::placeholder, .im-textarea::placeholder { color: #c0cad8; }
  .im-textarea { resize: vertical; min-height: 80px; line-height: 1.5; }
  .im-select {
    cursor: pointer; appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
    background-repeat: no-repeat; background-position: right 14px center; padding-right: 36px;
  }

  .im-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .im-hint { font-size: 11.5px; color: #94a3b8; margin-top: 5px; }

  /* End time card */
  .im-endtime-card {
    background: linear-gradient(135deg, #f0fdf4, #dcfce7);
    border: 1.5px solid #bbf7d0;
    border-radius: 12px; padding: 14px 16px;
    margin-bottom: 14px;
    display: flex; align-items: flex-start; gap: 10px;
  }
  .im-endtime-icon {
    width: 30px; height: 30px; border-radius: 8px;
    background: #22c55e; color: #fff; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
  }
  .im-endtime-icon svg { width: 14px; height: 14px; }
  .im-endtime-label { font-size: 11.5px; font-weight: 700; color: #15803d; margin: 0 0 3px; }
  .im-endtime-value { font-size: 13px; color: #166534; font-weight: 600; margin: 0; }
  .im-endtime-dur { font-size: 11px; color: #16a34a; margin: 4px 0 0;
    font-family: 'DM Mono', monospace; }

  /* Footer */
  .im-footer {
    display: flex; justify-content: flex-end; gap: 10px;
    padding: 18px 28px 24px;
    border-top: 1px solid #f1f5f9;
  }

  .im-btn {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 10px 20px; border-radius: 10px;
    font-size: 13.5px; font-weight: 600;
    cursor: pointer; border: none; font-family: inherit;
    transition: all 0.2s ease;
  }
  .im-btn svg { width: 14px; height: 14px; }
  .im-btn--cancel {
    background: #f1f5f9; color: #64748b; border: 1.5px solid #e2e8f0;
  }
  .im-btn--cancel:hover { background: #e2e8f0; }
  .im-btn--submit {
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    color: #fff; box-shadow: 0 4px 14px rgba(99,102,241,0.35);
  }
  .im-btn--submit:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(99,102,241,0.45);
  }
  .im-btn--submit:disabled {
    opacity: 0.5; cursor: not-allowed; transform: none; box-shadow: none;
  }
`;

function InterviewModal({ job, onClose, onSuccess }) {
  const [submitting, setSubmitting] = useState(false);
  const [interviewForm, setInterviewForm] = useState({
    candidate_email: "",
    scheduled_time: "",
    duration_minutes: 30,
    interview_type: "technical",
    title: `Interview for ${job?.title}`,
    description: ""
  });
  const [endTime, setEndTime] = useState("");

  useEffect(() => {
    if (interviewForm.scheduled_time) {
      const startTime = new Date(interviewForm.scheduled_time);
      const durationMs = parseInt(interviewForm.duration_minutes) * 60 * 1000;
      const end = new Date(startTime.getTime() + durationMs);
      setEndTime(end.toLocaleString('en-US', {
        weekday: 'short', month: 'short', day: 'numeric',
        year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true
      }));
    } else {
      setEndTime("");
    }
  }, [interviewForm.scheduled_time, interviewForm.duration_minutes]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInterviewForm(prev => ({ ...prev, [name]: value }));
  };

  const handleDurationChange = (e) => {
    const value = parseInt(e.target.value) || 30;
    const clampedValue = Math.min(Math.max(value, 15), 240);
    setInterviewForm(prev => ({ ...prev, duration_minutes: clampedValue }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!job?.id || !interviewForm.candidate_email || !interviewForm.scheduled_time) {
      toast.error("Job, Candidate Email, and Scheduled Time are required."); return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(interviewForm.candidate_email)) {
      toast.error("Please enter a valid email address."); return;
    }
    const duration = parseInt(interviewForm.duration_minutes);
    if (isNaN(duration) || duration < 15 || duration > 240) {
      toast.error("Duration must be between 15 minutes and 4 hours."); return;
    }
    const scheduledTime = new Date(interviewForm.scheduled_time);
    if (scheduledTime < new Date()) {
      toast.error("Scheduled time cannot be in the past."); return;
    }
    const maxFutureDate = new Date();
    maxFutureDate.setMonth(maxFutureDate.getMonth() + 3);
    if (scheduledTime > maxFutureDate) {
      toast.error("Scheduled time cannot be more than 3 months in the future."); return;
    }
    setSubmitting(true);
    try {
      const interviewData = {
        job_id: job.id,
        candidate_email: interviewForm.candidate_email.trim().toLowerCase(),
        scheduled_date: scheduledTime.toISOString(),
        duration_minutes: duration,
        interview_type: interviewForm.interview_type,
        title: interviewForm.title || `Interview for ${job?.title}`,
        description: interviewForm.description || ""
      };
      await scheduleInterview(interviewData);
      toast.success("Interview scheduled successfully!");
      onSuccess();
    } catch (err) {
      console.error("Schedule interview error:", err);
      toast.error(
  "Failed to schedule interview: " +
  (
    err?.response?.data?.error ||
    err?.response?.data?.message ||
    err?.message ||
    "Please check the candidate email and try again."
  )
);
    } finally { setSubmitting(false); }
  };

  const CalIcon = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
  const XIcon = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
  const CheckIcon = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>;
  const BriefcaseIcon = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 3H8l-2 4h12z"/></svg>;
  const ClockIcon = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;

  return (
    <>
      <style>{styles}</style>
      <div className="im-overlay">
        <div className="im-panel">

          {/* Header */}
          <div className="im-header">
            <div className="im-header-left">
              <div className="im-header-icon">{CalIcon}</div>
              <div>
                <p className="im-title">Schedule Interview</p>
                <p className="im-subtitle">for {job?.title}</p>
              </div>
            </div>
            <button className="im-close" onClick={onClose}>{XIcon}</button>
          </div>

          {/* Job Banner */}
          <div className="im-job-banner">
            <div className="im-job-banner-icon">{BriefcaseIcon}</div>
            <div>
              <p className="im-job-banner-title">{job?.title}</p>
              <p className="im-job-banner-id">Job ID: {job?.id}</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="im-body">
              <p className="im-section-label">Interview Details</p>

              <div className="im-field">
                <label className="im-label">Candidate Email <span>*</span></label>
                <input type="email" name="candidate_email" value={interviewForm.candidate_email}
                  onChange={handleChange} className="im-input"
                  placeholder="jobseeker@example.com" required />
                <p className="im-hint">Enter the candidate's registered email address</p>
              </div>

              <div className="im-field">
                <label className="im-label">Interview Title</label>
                <input type="text" name="title" value={interviewForm.title}
                  onChange={handleChange} className="im-input"
                  placeholder={`Interview for ${job?.title}`} />
              </div>

              <div className="im-grid-2">
                <div className="im-field">
                  <label className="im-label">Scheduled Time <span>*</span></label>
                  <input type="datetime-local" name="scheduled_time"
                    value={interviewForm.scheduled_time} onChange={handleChange}
                    className="im-input" required
                    min={new Date().toISOString().slice(0, 16)} />
                </div>
                <div className="im-field">
                  <label className="im-label">Duration (minutes) <span>*</span></label>
                  <input type="number" name="duration_minutes"
                    value={interviewForm.duration_minutes} onChange={handleDurationChange}
                    className="im-input" min="15" max="240" step="5" required />
                  <p className="im-hint">15 – 240 min</p>
                </div>
              </div>

              {/* End time card */}
              {endTime && (
                <div className="im-endtime-card">
                  <div className="im-endtime-icon">{ClockIcon}</div>
                  <div>
                    <p className="im-endtime-label">Interview ends at</p>
                    <p className="im-endtime-value">{endTime}</p>
                    <p className="im-endtime-dur">Duration: {interviewForm.duration_minutes} min</p>
                  </div>
                </div>
              )}

              <div className="im-field">
                <label className="im-label">Interview Type</label>
                <select name="interview_type" value={interviewForm.interview_type}
                  onChange={handleChange} className="im-select">
                  <option value="technical">Technical</option>
                  <option value="behavioral">Behavioral</option>
                  <option value="hr">HR</option>
                  <option value="panel">Panel</option>
                  <option value="mixed">Mixed</option>
                </select>
              </div>

              <div className="im-field">
                <label className="im-label">Description (Optional)</label>
                <textarea name="description" value={interviewForm.description}
                  onChange={handleChange} className="im-textarea"
                  placeholder="Add notes or instructions for the candidate…" />
              </div>
            </div>

            {/* Footer */}
            <div className="im-footer">
              <button type="button" className="im-btn im-btn--cancel" onClick={onClose}>
                {XIcon} Cancel
              </button>
              <button type="submit" className="im-btn im-btn--submit" disabled={submitting}>
                {submitting ? "Scheduling…" : (<>{CheckIcon} Schedule Interview</>)}
              </button>
            </div>
          </form>

        </div>
      </div>
    </>
  );
}

export default InterviewModal;