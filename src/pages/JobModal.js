import React, { useState, useRef } from "react";
import { createJob, updateJob } from "../services/api";
import toast from "react-hot-toast";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

  .jm-overlay {
    position: fixed; inset: 0;
    background: rgba(15, 23, 42, 0.55);
    backdrop-filter: blur(6px);
    display: flex; align-items: center; justify-content: center;
    z-index: 50; padding: 16px;
    animation: jm-fade-in 0.2s ease;
  }
  @keyframes jm-fade-in { from { opacity: 0; } to { opacity: 1; } }

  .jm-panel {
    background: #fff;
    border-radius: 20px;
    box-shadow: 0 24px 60px rgba(15,23,42,0.18), 0 4px 16px rgba(15,23,42,0.08);
    width: 100%; max-width: 540px;
    max-height: 90vh; overflow-y: auto;
    font-family: 'DM Sans', system-ui, sans-serif;
    animation: jm-slide-up 0.25s cubic-bezier(0.34,1.56,0.64,1);
  }
  @keyframes jm-slide-up {
    from { opacity: 0; transform: translateY(20px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }

  /* Scrollbar */
  .jm-panel::-webkit-scrollbar { width: 6px; }
  .jm-panel::-webkit-scrollbar-track { background: transparent; }
  .jm-panel::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }

  /* Header */
  .jm-header {
    padding: 24px 28px 20px;
    border-bottom: 1px solid #f1f5f9;
    display: flex; align-items: center; justify-content: space-between;
    position: sticky; top: 0; background: #fff; z-index: 2;
    border-radius: 20px 20px 0 0;
  }
  .jm-header-left { display: flex; align-items: center; gap: 12px; }
  .jm-header-icon {
    width: 40px; height: 40px; border-radius: 12px;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    display: flex; align-items: center; justify-content: center;
    color: #fff; flex-shrink: 0;
    box-shadow: 0 4px 12px rgba(99,102,241,0.3);
  }
  .jm-header-icon svg { width: 18px; height: 18px; }
  .jm-title { font-size: 17px; font-weight: 700; color: #1e293b; margin: 0; }
  .jm-subtitle { font-size: 12px; color: #94a3b8; margin: 2px 0 0; font-weight: 500; }
  .jm-close {
    width: 32px; height: 32px; border-radius: 8px;
    border: 1px solid #e8eaf6; background: #f8faff;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; color: #64748b;
    transition: all 0.15s;
  }
  .jm-close:hover { background: #fef2f2; border-color: #fecaca; color: #dc2626; }
  .jm-close svg { width: 14px; height: 14px; }

  /* Body */
  .jm-body { padding: 24px 28px 28px; }

  /* Section divider */
  .jm-section {
    margin-bottom: 20px;
  }
  .jm-section-label {
    font-size: 11px; font-weight: 700; letter-spacing: 0.6px;
    text-transform: uppercase; color: #6366f1;
    margin: 0 0 14px;
    display: flex; align-items: center; gap: 8px;
  }
  .jm-section-label::after {
    content: ''; flex: 1; height: 1px; background: #e8eaf6;
  }

  /* Field */
  .jm-field { margin-bottom: 14px; }
  .jm-label {
    display: block; font-size: 12.5px; font-weight: 600;
    color: #475569; margin-bottom: 6px;
  }
  .jm-label span { color: #f59e0b; margin-left: 2px; }

  .jm-input, .jm-textarea, .jm-select {
    width: 100%; border: 1.5px solid #e2e8f0;
    border-radius: 10px; padding: 10px 14px;
    font-size: 13.5px; color: #1e293b;
    font-family: 'DM Sans', system-ui, sans-serif;
    background: #fafbff;
    transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
    outline: none; box-sizing: border-box;
  }
  .jm-input:focus, .jm-textarea:focus, .jm-select:focus {
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99,102,241,0.12);
    background: #fff;
  }
  .jm-input::placeholder, .jm-textarea::placeholder { color: #c0cad8; }
  .jm-textarea { resize: vertical; min-height: 88px; line-height: 1.5; }
  .jm-select { cursor: pointer; appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
    background-repeat: no-repeat; background-position: right 14px center; padding-right: 36px;
  }

  .jm-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .jm-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }

  .jm-hint { font-size: 11.5px; color: #94a3b8; margin-top: 5px; }

  /* Ranking card */
  .jm-rank-card {
    border-radius: 12px; padding: 16px;
    border: 1.5px solid #e8eaf6; background: #f8faff;
    margin-bottom: 12px; transition: border-color 0.2s, background 0.2s;
  }
  .jm-rank-card--error { border-color: #fca5a5; background: #fff5f5; }

  .jm-rank-card-header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 12px;
  }
  .jm-rank-card-title {
    font-size: 13px; font-weight: 700; color: #334155;
    display: flex; align-items: center; gap: 6px;
  }
  .jm-total-badge {
    font-size: 11px; font-weight: 700;
    padding: 3px 10px; border-radius: 20px;
  }
  .jm-total-badge--ok { background: #dcfce7; color: #15803d; }
  .jm-total-badge--bad { background: #fee2e2; color: #dc2626; }

  .jm-rank-input {
    width: 100%; border: 1.5px solid #e2e8f0;
    border-radius: 8px; padding: 8px 10px;
    font-size: 13px; color: #1e293b;
    font-family: 'DM Mono', monospace;
    background: #fff; transition: border-color 0.15s, box-shadow 0.15s;
    outline: none; box-sizing: border-box; text-align: center;
  }
  .jm-rank-input:focus {
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99,102,241,0.12);
  }
  .jm-rank-input--error { border-color: #fca5a5; }
  .jm-rank-sublabel {
    font-size: 11px; font-weight: 600; color: #94a3b8;
    text-align: center; margin-top: 5px;
  }

  .jm-error-msg {
    font-size: 11.5px; color: #dc2626; font-weight: 600;
    margin-top: 10px; display: flex; align-items: center; gap: 5px;
  }

  /* Optional badge */
  .jm-optional-badge {
    font-size: 10.5px; font-weight: 700; letter-spacing: 0.3px;
    background: #f1f5f9; color: #94a3b8;
    border: 1px solid #e2e8f0;
    padding: 2px 8px; border-radius: 20px;
  }

  /* Ranking section header */
  .jm-rank-section-header {
    display: flex; align-items: center; gap: 10px; margin-bottom: 14px;
  }
  .jm-rank-section-title {
    font-size: 13px; font-weight: 700; color: #334155; margin: 0;
  }
  .jm-rank-desc { font-size: 12px; color: #94a3b8; margin: 0 0 16px; }

  /* Footer */
  .jm-footer {
    display: flex; justify-content: flex-end; gap: 10px;
    padding: 18px 28px 24px;
    border-top: 1px solid #f1f5f9;
  }

  .jm-btn {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 10px 20px; border-radius: 10px;
    font-size: 13.5px; font-weight: 600;
    cursor: pointer; border: none; font-family: inherit;
    transition: all 0.2s ease;
  }
  .jm-btn svg { width: 14px; height: 14px; }
  .jm-btn--cancel {
    background: #f1f5f9; color: #64748b;
    border: 1.5px solid #e2e8f0;
  }
  .jm-btn--cancel:hover { background: #e2e8f0; }

  .jm-btn--submit {
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    color: #fff;
    box-shadow: 0 4px 14px rgba(99,102,241,0.35);
  }
  .jm-btn--submit:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(99,102,241,0.45);
  }
  .jm-btn--submit:disabled {
    opacity: 0.5; cursor: not-allowed; transform: none;
    box-shadow: none;
  }
`;

const DEFAULT_RANKING = {
  cgpa_weight: 25,
  skills_weight: 25,
  experience_weight: 25,
  project_weight: 25,
  llm_weight: 40,
  bert_weight: 30,
  custom_model_weight: 30,
  shortlist_count: 10
};

function JobModal({ onClose, onSuccess, initialJob = null }) {
  const [submitting, setSubmitting] = useState(false);
  const [rankingTouched, setRankingTouched] = useState(false);
  const modelGroupRef = useRef(null);
  const candidateGroupRef = useRef(null);

  const [jobForm, setJobForm] = useState({
    title: initialJob?.title || "",
    company_name: initialJob?.company_name || "",
    description: initialJob?.description || "",
    location: initialJob?.location || "",
    requirements: initialJob?.requirements || "",
    application_deadline: initialJob?.application_deadline || "",
    ranking_config: initialJob?.ranking_config
      ? {
          cgpa_weight: initialJob.ranking_config.cgpa_weight || 25,
          skills_weight: initialJob.ranking_config.skills_weight || 25,
          experience_weight: initialJob.ranking_config.experience_weight || 25,
          project_weight: initialJob.ranking_config.project_weight || 25,
          llm_weight: initialJob.ranking_config.llm_weight || 40,
          bert_weight: initialJob.ranking_config.bert_weight || 30,
          custom_model_weight: initialJob.ranking_config.custom_model_weight || 30,
          shortlist_count: initialJob.ranking_config.shortlist_count || 10
        }
      : { ...DEFAULT_RANKING }
  });

  const [errors, setErrors] = useState({ modelGroup: false, candidateGroup: false });

  const handleChange = (e) => {
    const { name, value, dataset } = e.target;
    if (dataset.rank) {
      setRankingTouched(true);
      setJobForm(prev => ({
        ...prev,
        ranking_config: { ...prev.ranking_config, [name]: value === "" ? 0 : parseInt(value) }
      }));
      if (["llm_weight", "bert_weight", "custom_model_weight"].includes(name))
        setErrors(prev => ({ ...prev, modelGroup: false }));
      if (["cgpa_weight", "skills_weight", "experience_weight", "project_weight"].includes(name))
        setErrors(prev => ({ ...prev, candidateGroup: false }));
    } else {
      setJobForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const validateRanking = () => {
    const r = jobForm.ranking_config;
    if (!rankingTouched) return true;
    let valid = true;
    const modelTotal = Number(r.llm_weight || 0) + Number(r.bert_weight || 0) + Number(r.custom_model_weight || 0);
    if (Math.round(modelTotal) !== 100) {
      toast.error(`⚠️ LLM + BERT + Custom Model weights must total 100. Currently: ${modelTotal}`, { duration: 4000 });
      setErrors(prev => ({ ...prev, modelGroup: true }));
      modelGroupRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      valid = false;
    }
    const candidateTotal = Number(r.cgpa_weight || 0) + Number(r.skills_weight || 0) + Number(r.experience_weight || 0) + Number(r.project_weight || 0);
    if (Math.round(candidateTotal) !== 100) {
      toast.error(`⚠️ CGPA + Skills + Experience + Project weights must total 100. Currently: ${candidateTotal}`, { duration: 4000 });
      setErrors(prev => ({ ...prev, candidateGroup: true }));
      if (valid) candidateGroupRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      valid = false;
    }
    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const required = ["title", "company_name", "description", "location", "requirements", "application_deadline"];
    if (required.some((f) => !jobForm[f])) { toast.error("Please fill in all required fields."); return; }
    if (!validateRanking()) return;
    setSubmitting(true);
    try {
      const r = jobForm.ranking_config;
      const ranking_config = rankingTouched ? {
        cgpa_weight: parseInt(r.cgpa_weight || 0),
        skills_weight: parseInt(r.skills_weight || 0),
        experience_weight: parseInt(r.experience_weight || 0),
        project_weight: parseInt(r.project_weight || 0),
        llm_weight: parseInt(r.llm_weight || 0),
        bert_weight: parseInt(r.bert_weight || 0),
        custom_model_weight: parseInt(r.custom_model_weight || 0),
        shortlist_count: parseInt(r.shortlist_count || 10)
      } : null;
      const jobData = {
        title: jobForm.title, description: jobForm.description,
        requirements: jobForm.requirements, location: jobForm.location,
        company_name: jobForm.company_name, application_deadline: jobForm.application_deadline,
        ...(ranking_config && { ranking_config })
      };
      if (initialJob?.id) { await updateJob(initialJob.id, jobData); toast.success("Job updated successfully! ✅"); }
      else { await createJob(jobData); toast.success("Job created successfully! ✅"); }
      onSuccess();
    } catch (err) {
      console.error(err);
      toast.error(initialJob?.id ? "Failed to update job." : "Failed to create job.");
    } finally { setSubmitting(false); }
  };

  const modelTotal = Number(jobForm.ranking_config.llm_weight || 0) + Number(jobForm.ranking_config.bert_weight || 0) + Number(jobForm.ranking_config.custom_model_weight || 0);
  const candidateTotal = Number(jobForm.ranking_config.cgpa_weight || 0) + Number(jobForm.ranking_config.skills_weight || 0) + Number(jobForm.ranking_config.experience_weight || 0) + Number(jobForm.ranking_config.project_weight || 0);

  const isEdit = !!initialJob?.id;

  const BriefcaseIcon = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 3H8l-2 4h12z"/></svg>;
  const PencilIcon = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
  const XIcon = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
  const CheckIcon = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>;

  return (
    <>
      <style>{styles}</style>
      <div className="jm-overlay">
        <div className="jm-panel">

          {/* Header */}
          <div className="jm-header">
            <div className="jm-header-left">
              <div className="jm-header-icon">{isEdit ? PencilIcon : BriefcaseIcon}</div>
              <div>
                <p className="jm-title">{isEdit ? "Edit Job" : "Create New Job"}</p>
                <p className="jm-subtitle">{isEdit ? "Update job posting details" : "Fill in the details to post a new job"}</p>
              </div>
            </div>
            <button className="jm-close" onClick={onClose}>{XIcon}</button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="jm-body">

              {/* Basic Info */}
              <div className="jm-section">
                <p className="jm-section-label">Basic Information</p>

                <div className="jm-grid-2">
                  <div className="jm-field">
                    <label className="jm-label">Job Title <span>*</span></label>
                    <input type="text" name="title" value={jobForm.title} onChange={handleChange}
                      className="jm-input" placeholder="e.g., Senior Frontend Dev" required />
                  </div>
                  <div className="jm-field">
                    <label className="jm-label">Company Name <span>*</span></label>
                    <input type="text" name="company_name" value={jobForm.company_name} onChange={handleChange}
                      className="jm-input" placeholder="Your company" required />
                  </div>
                </div>

                <div className="jm-grid-2">
                  <div className="jm-field">
                    <label className="jm-label">Location <span>*</span></label>
                    <input type="text" name="location" value={jobForm.location} onChange={handleChange}
                      className="jm-input" placeholder="Remote, New York…" required />
                  </div>
                  <div className="jm-field">
                    <label className="jm-label">Application Deadline <span>*</span></label>
                    <input type="date" name="application_deadline" value={jobForm.application_deadline}
                      onChange={handleChange} className="jm-input" required
                      min={new Date().toISOString().split('T')[0]} />
                  </div>
                </div>

                <div className="jm-field">
                  <label className="jm-label">Description <span>*</span></label>
                  <textarea name="description" value={jobForm.description} onChange={handleChange}
                    className="jm-textarea" placeholder="Describe the role, responsibilities…" required />
                </div>

                <div className="jm-field">
                  <label className="jm-label">Requirements <span>*</span></label>
                  <textarea name="requirements" value={jobForm.requirements} onChange={handleChange}
                    className="jm-textarea" placeholder="Required skills, experience, qualifications…" required />
                </div>
              </div>

              {/* Ranking Config */}
              <div className="jm-section">
                <p className="jm-section-label">
                  Ranking Configuration
                  <span className="jm-optional-badge">Optional</span>
                </p>
                <p className="jm-rank-desc">Leave as default or customize. Each group must total 100.</p>

                {/* Model Weights */}
                <div ref={modelGroupRef} className={`jm-rank-card${errors.modelGroup ? " jm-rank-card--error" : ""}`}>
                  <div className="jm-rank-card-header">
                    <span className="jm-rank-card-title">🤖 Model Weights</span>
                    <span className={`jm-total-badge ${Math.round(modelTotal) === 100 ? "jm-total-badge--ok" : "jm-total-badge--bad"}`}>
                      {modelTotal} / 100
                    </span>
                  </div>
                  <div className="jm-grid-3">
                    {[
                      { name: "llm_weight", label: "LLM" },
                      { name: "bert_weight", label: "BERT" },
                      { name: "custom_model_weight", label: "Custom" }
                    ].map(f => (
                      <div key={f.name}>
                        <input type="number" name={f.name} data-rank="true"
                          value={jobForm.ranking_config[f.name]} onChange={handleChange}
                          className={`jm-rank-input${errors.modelGroup ? " jm-rank-input--error" : ""}`}
                          min="0" max="100" step="1" />
                        <p className="jm-rank-sublabel">{f.label}</p>
                      </div>
                    ))}
                  </div>
                  {errors.modelGroup && (
                    <p className="jm-error-msg">⚠️ LLM + BERT + Custom must total exactly 100</p>
                  )}
                </div>

                {/* Candidate Weights */}
                <div ref={candidateGroupRef} className={`jm-rank-card${errors.candidateGroup ? " jm-rank-card--error" : ""}`}>
                  <div className="jm-rank-card-header">
                    <span className="jm-rank-card-title">👤 Candidate Weights</span>
                    <span className={`jm-total-badge ${Math.round(candidateTotal) === 100 ? "jm-total-badge--ok" : "jm-total-badge--bad"}`}>
                      {candidateTotal} / 100
                    </span>
                  </div>
                  <div className="jm-grid-2">
                    {[
                      { name: "cgpa_weight", label: "CGPA" },
                      { name: "skills_weight", label: "Skills" },
                      { name: "experience_weight", label: "Experience" },
                      { name: "project_weight", label: "Project" }
                    ].map(f => (
                      <div key={f.name}>
                        <input type="number" name={f.name} data-rank="true"
                          value={jobForm.ranking_config[f.name]} onChange={handleChange}
                          className={`jm-rank-input${errors.candidateGroup ? " jm-rank-input--error" : ""}`}
                          min="0" max="100" step="1" />
                        <p className="jm-rank-sublabel">{f.label}</p>
                      </div>
                    ))}
                  </div>
                  {errors.candidateGroup && (
                    <p className="jm-error-msg">⚠️ CGPA + Skills + Experience + Project must total exactly 100</p>
                  )}
                </div>

                {/* Shortlist Count */}
                <div className="jm-rank-card">
                  <div className="jm-rank-card-header">
                    <span className="jm-rank-card-title">🎯 Shortlist Count</span>
                  </div>
                  <input type="number" name="shortlist_count" data-rank="true"
                    value={jobForm.ranking_config.shortlist_count} onChange={handleChange}
                    className="jm-rank-input" style={{ maxWidth: 120 }}
                    min="1" max="100" step="1" />
                  <p className="jm-hint" style={{ marginTop: 8 }}>Number of top candidates to shortlist</p>
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="jm-footer">
              <button type="button" className="jm-btn jm-btn--cancel" onClick={onClose}>
                {XIcon} Cancel
              </button>
              <button type="submit" className="jm-btn jm-btn--submit" disabled={submitting}>
                {submitting ? "Saving…" : (<>{CheckIcon} {isEdit ? "Update Job" : "Create Job"}</>)}
              </button>
            </div>
          </form>

        </div>
      </div>
    </>
  );
}

export default JobModal;