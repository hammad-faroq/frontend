import React, { useState, useRef } from "react";
import { createJob, updateJob } from "../services/api";
import toast from "react-hot-toast";

// Default weights matching your backend defaults
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

  // Track if user has touched ranking fields
  const [rankingTouched, setRankingTouched] = useState(false);

  // Refs for scrolling to error fields
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
          cgpa_weight: (initialJob.ranking_config.cgpa_weight || 0.25) * 100,
          skills_weight: (initialJob.ranking_config.skills_weight || 0.25) * 100,
          experience_weight: (initialJob.ranking_config.experience_weight || 0.25) * 100,
          project_weight: (initialJob.ranking_config.project_weight || 0.25) * 100,
          llm_weight: (initialJob.ranking_config.llm_weight || 0.4) * 100,
          bert_weight: (initialJob.ranking_config.bert_weight || 0.3) * 100,
          custom_model_weight: (initialJob.ranking_config.custom_model_weight || 0.3) * 100,
          shortlist_count: initialJob.ranking_config.shortlist_count || 10
        }
      : { ...DEFAULT_RANKING }
  });

  // Track which fields have errors
  const [errors, setErrors] = useState({
    modelGroup: false,
    candidateGroup: false
  });

  const handleChange = (e) => {
    const { name, value, dataset } = e.target;

    if (dataset.rank) {
      setRankingTouched(true);
      setJobForm(prev => ({
        ...prev,
        ranking_config: {
          ...prev.ranking_config,
          [name]: value === "" ? "" : Number(value)
        }
      }));

      // Clear error when user edits
      if (["llm_weight", "bert_weight", "custom_model_weight"].includes(name)) {
        setErrors(prev => ({ ...prev, modelGroup: false }));
      }
      if (["cgpa_weight", "skills_weight", "experience_weight", "project_weight"].includes(name)) {
        setErrors(prev => ({ ...prev, candidateGroup: false }));
      }
    } else {
      setJobForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const validateRanking = () => {
    const r = jobForm.ranking_config;

    // If user never touched ranking, use defaults — skip validation
    if (!rankingTouched) return true;

    let valid = true;

    // Group 1: LLM + BERT + Custom Model must total 100
    const modelTotal = Number(r.llm_weight || 0) + Number(r.bert_weight || 0) + Number(r.custom_model_weight || 0);
    if (Math.round(modelTotal) !== 100) {
      toast.error(
        `⚠️ LLM + BERT + Custom Model weights must total 100. Currently: ${modelTotal}`,
        { duration: 4000 }
      );
      setErrors(prev => ({ ...prev, modelGroup: true }));
      modelGroupRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      valid = false;
    }

    // Group 2: CGPA + Skills + Experience + Project must total 100
    const candidateTotal =
      Number(r.cgpa_weight || 0) +
      Number(r.skills_weight || 0) +
      Number(r.experience_weight || 0) +
      Number(r.project_weight || 0);
    if (Math.round(candidateTotal) !== 100) {
      toast.error(
        `⚠️ CGPA + Skills + Experience + Project weights must total 100. Currently: ${candidateTotal}`,
        { duration: 4000 }
      );
      setErrors(prev => ({ ...prev, candidateGroup: true }));
      // Only scroll to candidate group if model group is fine
      if (valid) {
        candidateGroupRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      valid = false;
    }

    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const required = ["title", "company_name", "description", "location", "requirements", "application_deadline"];
    if (required.some((f) => !jobForm[f])) {
      toast.error("Please fill in all required fields.");
      return;
    }

    // Validate ranking if touched
    if (!validateRanking()) return;

    setSubmitting(true);
    try {
      const r = jobForm.ranking_config;

      // Convert percentages back to decimals for backend
      // If not touched, send backend defaults (null → backend uses its own defaults)
      const ranking_config = rankingTouched
        ? {
            cgpa_weight: Number(r.cgpa_weight) / 100,
            skills_weight: Number(r.skills_weight) / 100,
            experience_weight: Number(r.experience_weight) / 100,
            project_weight: Number(r.project_weight) / 100,
            llm_weight: Number(r.llm_weight) / 100,
            bert_weight: Number(r.bert_weight) / 100,
            custom_model_weight: Number(r.custom_model_weight) / 100,
            shortlist_count: Number(r.shortlist_count) || 10
          }
        : null; // Let backend use its own defaults

      const jobData = {
        title: jobForm.title,
        description: jobForm.description,
        requirements: jobForm.requirements,
        location: jobForm.location,
        company_name: jobForm.company_name,
        application_deadline: jobForm.application_deadline,
        ...(ranking_config && { ranking_config })
      };

      if (initialJob?.id) {
        await updateJob(initialJob.id, jobData);
        toast.success("Job updated successfully! ✅");
      } else {
        await createJob(jobData);
        toast.success("Job created successfully! ✅");
      }

      onSuccess();
    } catch (err) {
      console.error(err);
      toast.error(initialJob?.id ? "Failed to update job." : "Failed to create job.");
    } finally {
      setSubmitting(false);
    }
  };

  // Live totals for display
  const modelTotal =
    Number(jobForm.ranking_config.llm_weight || 0) +
    Number(jobForm.ranking_config.bert_weight || 0) +
    Number(jobForm.ranking_config.custom_model_weight || 0);

  const candidateTotal =
    Number(jobForm.ranking_config.cgpa_weight || 0) +
    Number(jobForm.ranking_config.skills_weight || 0) +
    Number(jobForm.ranking_config.experience_weight || 0) +
    Number(jobForm.ranking_config.project_weight || 0);

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h3 className="text-2xl font-semibold mb-6 text-gray-800 border-b pb-2">
            {initialJob?.id ? "Edit Job" : "Create New Job"}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Basic Fields */}
            <div>
              <label className="block text-sm font-medium mb-1">Job Title *</label>
              <input
                type="text"
                name="title"
                value={jobForm.title}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Senior Frontend Developer"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Company Name *</label>
              <input
                type="text"
                name="company_name"
                value={jobForm.company_name}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Your company name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Location *</label>
              <input
                type="text"
                name="location"
                value={jobForm.location}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Remote, New York, etc."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description *</label>
              <textarea
                name="description"
                value={jobForm.description}
                onChange={handleChange}
                rows="4"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe the role, responsibilities..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Requirements *</label>
              <textarea
                name="requirements"
                value={jobForm.requirements}
                onChange={handleChange}
                rows="4"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="List required skills, experience, qualifications..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Application Deadline *</label>
              <input
                type="date"
                name="application_deadline"
                value={jobForm.application_deadline}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            {/* ===== RANKING CONFIG ===== */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-medium text-gray-700">Ranking Configuration</h4>
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">Optional</span>
              </div>
              <p className="text-xs text-gray-500 mb-4">
                Leave as default or customize. Each group must total <strong>100</strong>.
              </p>

              {/* GROUP 1: Model Weights */}
              <div
                ref={modelGroupRef}
                className={`rounded-xl p-4 mb-4 border-2 transition-colors ${
                  errors.modelGroup
                    ? "border-red-400 bg-red-50"
                    : "border-gray-100 bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-gray-700">🤖 Model Weights</p>
                  {/* Live total indicator */}
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded-full ${
                      Math.round(modelTotal) === 100
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    Total: {modelTotal} / 100
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { name: "llm_weight", label: "LLM" },
                    { name: "bert_weight", label: "BERT" },
                    { name: "custom_model_weight", label: "Custom Model" }
                  ].map((field) => (
                    <div key={field.name}>
                      <label className="block text-xs font-medium mb-1 text-gray-600">{field.label}</label>
                      <input
                        type="number"
                        name={field.name}
                        data-rank="true"
                        value={jobForm.ranking_config[field.name]}
                        onChange={handleChange}
                        className={`w-full border rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.modelGroup ? "border-red-400" : "border-gray-300"
                        }`}
                        placeholder="0"
                        min="0"
                        max="100"
                        step="1"
                      />
                    </div>
                  ))}
                </div>
                {errors.modelGroup && (
                  <p className="text-xs text-red-600 mt-2 font-medium">
                    ⚠️ LLM + BERT + Custom Model must total exactly 100
                  </p>
                )}
              </div>

              {/* GROUP 2: Candidate Weights */}
              <div
                ref={candidateGroupRef}
                className={`rounded-xl p-4 mb-4 border-2 transition-colors ${
                  errors.candidateGroup
                    ? "border-red-400 bg-red-50"
                    : "border-gray-100 bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-gray-700">👤 Candidate Weights</p>
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded-full ${
                      Math.round(candidateTotal) === 100
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    Total: {candidateTotal} / 100
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { name: "cgpa_weight", label: "CGPA" },
                    { name: "skills_weight", label: "Skills" },
                    { name: "experience_weight", label: "Experience" },
                    { name: "project_weight", label: "Project" }
                  ].map((field) => (
                    <div key={field.name}>
                      <label className="block text-xs font-medium mb-1 text-gray-600">{field.label}</label>
                      <input
                        type="number"
                        name={field.name}
                        data-rank="true"
                        value={jobForm.ranking_config[field.name]}
                        onChange={handleChange}
                        className={`w-full border rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.candidateGroup ? "border-red-400" : "border-gray-300"
                        }`}
                        placeholder="0"
                        min="0"
                        max="100"
                        step="1"
                      />
                    </div>
                  ))}
                </div>
                {errors.candidateGroup && (
                  <p className="text-xs text-red-600 mt-2 font-medium">
                    ⚠️ CGPA + Skills + Experience + Project must total exactly 100
                  </p>
                )}
              </div>

              {/* Shortlist Count */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  🎯 Shortlist Count
                </label>
                <p className="text-xs text-gray-500 mb-2">How many top candidates to shortlist</p>
                <input
                  type="number"
                  name="shortlist_count"
                  data-rank="true"
                  value={jobForm.ranking_config.shortlist_count}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="10"
                  min="1"
                  max="100"
                  step="1"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className={`px-4 py-2 rounded-md text-white transition ${
                  submitting ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {submitting ? "Saving..." : initialJob?.id ? "Update Job" : "Create Job"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default JobModal;