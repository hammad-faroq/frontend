import React from "react";
import StatCard from "./StatCard";

function HRDashboardStats({ jobs = [], interviews = [] }) {
  // Ensure jobs and interviews are arrays
  const safeJobs = Array.isArray(jobs) ? jobs : [];
  const safeInterviews = Array.isArray(interviews) ? interviews : [];
  
  // Calculate stats with safe data
  const activeJobs = safeJobs.length;
  
  const scheduledInterviews = safeInterviews.filter(i => i.status === 'scheduled').length;
  const inProgressInterviews = safeInterviews.filter(i => i.status === 'in_progress').length;
  const submittedInterviews = safeInterviews.filter(i => i.status === 'submitted').length;
  const completedInterviews = safeInterviews.filter(i => i.status === 'completed').length;
  
  // Calculate total applications from jobs data
  const totalApplications = safeJobs.reduce(
    (acc, job) => acc + (job.applications_count || job.applications?.length || 0),
    0
  );

  return (
    <div className="grid md:grid-cols-6 gap-6 mb-8">
      <StatCard 
        title="Active Jobs" 
        value={activeJobs}
        icon="📊"
        color="blue"
      />
      <StatCard 
        title="Applications" 
        value={totalApplications}
        icon="📄"
        color="green"
      />
      <StatCard 
        title="Scheduled" 
        value={scheduledInterviews}
        icon="📅"
        color="blue"
      />
      <StatCard 
        title="In Progress" 
        value={inProgressInterviews}
        icon="⏳"
        color="purple"
      />
      <StatCard 
        title="For Review" 
        value={submittedInterviews}
        icon="📝"
        color="yellow"
      />
      <StatCard 
        title="Completed" 
        value={completedInterviews}
        icon="✅"
        color="green"
      />
    </div>
  );
}

export default HRDashboardStats;
