import React, { useState } from "react";
import { createJob, updateJob } from "../services/api";

function JobModal({ onClose, onSuccess, initialJob = null }) {
  const [submitting, setSubmitting] = useState(false);
  const [jobForm, setJobForm] = useState({
    title: initialJob?.title || "",
    company_name: initialJob?.company_name || "",
    description: initialJob?.description || "",
    location: initialJob?.location || "",
    requirements: initialJob?.requirements || "",
    application_deadline: initialJob?.application_deadline || "",
    ranking_config: initialJob?.ranking_config || {
      cgpa_weight: 0,
      skills_weight: 0,
      experience_weight: 0,
      project_weight: 0,
      llm_weight: 0,
      bert_weight: 0,
      custom_model_weight: 0,
      shortlist_count: 10
    }
  });

  const handleChange = (e) => {
    const { name, value, dataset } = e.target;

    if (dataset.rank) {
      setJobForm(prev => ({
        ...prev,
        ranking_config: {
          ...prev.ranking_config,
          [name]: value === "" ? "" : Number(value) || 0
        }
      }));
    } else {
      setJobForm(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const required = [
      "title",
      "company_name",
      "description",
      "location",
      "requirements",
      "application_deadline",
    ];
    if (required.some((f) => !jobForm[f])) {
      alert("Please fill in all fields.");
      return;
    }

    setSubmitting(true);
    try {
      const jobData = {
        title: jobForm.title,
        description: jobForm.description,
        requirements: jobForm.requirements,
        location: jobForm.location,
        company_name: jobForm.company_name,
        application_deadline: jobForm.application_deadline,
        ranking_config: {
          cgpa_weight: Number(jobForm.ranking_config.cgpa_weight) || 0,
          skills_weight: Number(jobForm.ranking_config.skills_weight) || 0,
          experience_weight: Number(jobForm.ranking_config.experience_weight) || 0,
          project_weight: Number(jobForm.ranking_config.project_weight) || 0,
          llm_weight: Number(jobForm.ranking_config.llm_weight) || 0,
          bert_weight: Number(jobForm.ranking_config.bert_weight) || 0,
          custom_model_weight: Number(jobForm.ranking_config.custom_model_weight) || 0,
          shortlist_count: Number(jobForm.ranking_config.shortlist_count) || 10
        }
      };

      if (initialJob?.id) {
        await updateJob(initialJob.id, jobData);
        alert("Job updated successfully.");
      } else {
        await createJob(jobData);
        alert("Job created successfully.");
      }

      onSuccess();
    } catch (err) {
      console.error(err);
      alert(initialJob?.id ? "Failed to update job." : "Failed to create job.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h3 className="text-2xl font-semibold mb-6 text-gray-800 border-b pb-2">
            {initialJob?.id ? "Edit Job" : "Create New Job"}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
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

            {/* Ranking Config Section */}
            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-700 mb-3">Ranking Configuration (Optional)</h4>
              
              <div className="grid grid-cols-2 gap-4">
                {[
                  { name: "cgpa_weight", label: "CGPA Weight" },
                  { name: "skills_weight", label: "Skills Weight" },
                  { name: "experience_weight", label: "Experience Weight" },
                  { name: "project_weight", label: "Project Weight" },
                  { name: "llm_weight", label: "LLM Weight" },
                  { name: "bert_weight", label: "BERT Weight" },
                  { name: "custom_model_weight", label: "Custom Model Weight" },
                  { name: "shortlist_count", label: "Shortlist Count" }
                ].map((field) => (
                  <div key={field.name}>
                    <label className="block text-xs font-medium mb-1">{field.label}</label>
                    <input
                      type="number"
                      name={field.name}
                      data-rank="true"
                      value={jobForm.ranking_config[field.name]}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0"
                      min="0"
                      max="100"
                      step={field.name === 'shortlist_count' ? "1" : "0.1"}
                    />
                  </div>
                ))}
              </div>
            </div>

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
                  submitting
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
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
