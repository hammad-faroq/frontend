import React, { useState, useEffect } from "react";
import { scheduleInterview } from "../services/interviewApi";
import toast from "react-hot-toast";

function InterviewModal({ job, onClose, onSuccess }) {
  const [submitting, setSubmitting] = useState(false);
  const [interviewForm, setInterviewForm] = useState({
    candidate_email: "",
    scheduled_time: "",
    duration_minutes: 30, // Default 30 minutes
    interview_type: "technical",
    title: `Interview for ${job?.title}`,
    description: ""
  });
  const [endTime, setEndTime] = useState("");

  // Calculate end time whenever scheduled time or duration changes
  useEffect(() => {
    if (interviewForm.scheduled_time) {
      const startTime = new Date(interviewForm.scheduled_time);
      const durationMs = parseInt(interviewForm.duration_minutes) * 60 * 1000;
      const endTime = new Date(startTime.getTime() + durationMs);
      
      // Format for display
      const formattedEndTime = endTime.toLocaleString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
      setEndTime(formattedEndTime);
    } else {
      setEndTime("");
    }
  }, [interviewForm.scheduled_time, interviewForm.duration_minutes]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInterviewForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDurationChange = (e) => {
    const value = parseInt(e.target.value) || 30;
    // Limit duration to reasonable values
    const clampedValue = Math.min(Math.max(value, 15), 240); // 15min to 4hrs
    
    setInterviewForm(prev => ({
      ...prev,
      duration_minutes: clampedValue
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!job?.id || !interviewForm.candidate_email || !interviewForm.scheduled_time) {
      toast.error("Job, Candidate Email, and Scheduled Time are required.");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(interviewForm.candidate_email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    // Duration validation
    const duration = parseInt(interviewForm.duration_minutes);
    if (isNaN(duration) || duration < 15 || duration > 240) {
      toast.error("Duration must be between 15 minutes and 4 hours.");
      return;
    }

    // Check if scheduled time is in the past
    const scheduledTime = new Date(interviewForm.scheduled_time);
    if (scheduledTime < new Date()) {
      toast.error("Scheduled time cannot be in the past.");
      return;
    }

    // Check if it's too far in the future (optional)
    const maxFutureDate = new Date();
    maxFutureDate.setMonth(maxFutureDate.getMonth() + 3); // 3 months max
    if (scheduledTime > maxFutureDate) {
      toast.error("Scheduled time cannot be more than 3 months in the future.");
      return;
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
      toast.error("Failed to schedule interview: " + (err.message || "Please check the candidate email and try again."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h3 className="text-2xl font-semibold mb-6 text-gray-800 border-b pb-2">
            Schedule Interview for {job?.title}
          </h3>

          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Job:</strong> {job?.title}
            </p>
            <p className="text-sm text-blue-800">
              <strong>Job ID:</strong> {job?.id}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Candidate Email *</label>
              <input
                type="email"
                name="candidate_email"
                value={interviewForm.candidate_email}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="jobseeker@example.com"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Enter the candidate's registered email address
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Interview Title</label>
              <input
                type="text"
                name="title"
                value={interviewForm.title}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder={`Interview for ${job?.title}`}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Scheduled Time *</label>
                <input
                  type="datetime-local"
                  name="scheduled_time"
                  value={interviewForm.scheduled_time}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  required
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Duration (minutes) *</label>
                <input
                  type="number"
                  name="duration_minutes"
                  value={interviewForm.duration_minutes}
                  onChange={handleDurationChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  min="15"
                  max="240"
                  step="5"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  15-240 minutes (2.5 min increments)
                </p>
              </div>
            </div>

            {/* Display end time */}
            {endTime && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm font-medium text-green-800">
                  Interview will end at:
                </p>
                <p className="text-sm text-green-700 mt-1">
                  {endTime}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  Total duration: {interviewForm.duration_minutes} minutes
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">Interview Type</label>
              <select
                name="interview_type"
                value={interviewForm.interview_type}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="technical">Technical</option>
                <option value="behavioral">Behavioral</option>
                <option value="hr">HR</option>
                <option value="panel">Panel</option>
                <option value="mixed">Mixed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description (Optional)</label>
              <textarea
                name="description"
                value={interviewForm.description}
                onChange={handleChange}
                rows="3"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Add any notes or instructions for the candidate..."
              />
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
                    ? "bg-orange-400 cursor-not-allowed"
                    : "bg-orange-600 hover:bg-orange-700"
                }`}
              >
                {submitting ? "Scheduling..." : "Schedule Interview"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default InterviewModal;