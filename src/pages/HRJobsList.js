import React from "react";
import { deleteJob } from "../services/api";

function HRJobsList({ jobs = [], onEditJob, onViewJob, onScheduleInterview, onDeleteJob }) {
  
  const handleDeleteJob = async (jobId) => {
    if (window.confirm("Are you sure you want to delete this job?")) {
      try {
        await deleteJob(jobId);
        onDeleteJob();
      } catch (err) {
        console.error(err);
        alert("Failed to delete job.");
      }
    }
  };

  const safeJobs = Array.isArray(jobs) ? jobs : [];

  return (
    <div className="bg-white border rounded-xl p-5 mb-8">
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-semibold text-lg text-gray-800">My Job Posts</h4>
        <span className="text-sm text-gray-500">
          {safeJobs.length} job{safeJobs.length !== 1 ? 's' : ''}
        </span>
      </div>
      
      {safeJobs.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p className="mb-3">You haven't posted any jobs yet</p>
          <button
            onClick={() => onEditJob()}
            className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"
          >
            Create your first job
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job Title</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applications</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deadline</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {safeJobs.map((job) => (
                <tr key={job.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{job.title}</p>
                      <p className="text-sm text-gray-500">{job.company_name}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-gray-700">{job.location || "Remote"}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {job.applications_count || job.applications?.length || 0} applications
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`text-sm ${new Date(job.application_deadline) < new Date() ? 'text-red-600' : 'text-gray-700'}`}>
                      {job.application_deadline ? new Date(job.application_deadline).toLocaleDateString() : "No deadline"}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => onViewJob(job.id)}
                        className="text-blue-600 hover:text-blue-800 text-sm px-3 py-1 border border-blue-200 rounded hover:bg-blue-50"
                      >
                        View
                      </button>
                      <button
                        onClick={() => onEditJob(job)}
                        className="text-green-600 hover:text-green-800 text-sm px-3 py-1 border border-green-200 rounded hover:bg-green-50"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onScheduleInterview(job.id)}
                        className="text-orange-600 hover:text-orange-800 text-sm px-3 py-1 border border-orange-200 rounded hover:bg-orange-50"
                      >
                        Schedule Interview
                      </button>
                      <button
                        onClick={() => handleDeleteJob(job.id)}
                        className="text-red-600 hover:text-red-800 text-sm px-3 py-1 border border-red-200 rounded hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default HRJobsList;
