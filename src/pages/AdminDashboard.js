import React from "react";

function AdminDashboard({ navigate }) {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">Admin Dashboard</h3>
      <div className="flex flex-wrap gap-3">
        <button onClick={() => navigate("/jobs")} className="btn-primary">📝 Manage All Jobs</button>
        <button className="btn-primary">⚙️ System Settings</button>
        <button className="btn-primary">📊 View Reports</button>
        <button className="btn-primary">👤 Manage Users</button>
      </div>
    </div>
  );
}

export default AdminDashboard;
