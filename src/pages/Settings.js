import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import NotificationPreferences from "../components/NotificationPreferences"; // ADD THIS IMPORT

function Settings() {
  const [activeTab, setActiveTab] = useState("profile");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    notifications: true,
    theme: localStorage.getItem("theme") || "light",
  });

  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Apply theme to the document body
  useEffect(() => {
    if (formData.theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", formData.theme);
  }, [formData.theme]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Settings saved successfully!");
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar handleLogout={handleLogout} navigate={navigate} />
      
      {/* Main Content */}
      <div className="flex-1 min-h-screen bg-gray-50 dark:bg-gray-900 py-16 px-6 transition-colors duration-300">
        <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-8 transition-all duration-300">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6 text-center">
            Account Settings
          </h1>

          {/* Tabs */}
          <div className="flex justify-center mb-8 space-x-6 border-b border-gray-200 dark:border-gray-700 pb-4">
            {["profile", "security", "preferences", "notifications"].map((tab) => ( // ADDED "notifications" TAB
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`font-medium capitalize ${
                  activeTab === tab
                    ? "text-indigo-600 border-b-2 border-indigo-600 pb-2"
                    : "text-gray-600 dark:text-gray-300 hover:text-indigo-500"
                }`}
              >
                {tab === "notifications" ? "🔔 Notifications" : tab} {/* ADDED ICON FOR NOTIFICATIONS TAB */}
              </button>
            ))}
          </div>

          {/* Profile Tab */}
          {activeTab === "profile" && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
                  Company
                </label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="TechNova Inc."
                />
              </div>
              <button
                type="submit"
                className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition"
              >
                Save Changes
              </button>
            </form>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  name="newPassword"
                  className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="New password"
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="Confirm new password"
                />
              </div>
              <button
                type="submit"
                className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition"
              >
                Update Password
              </button>
            </form>
          )}

          {/* Preferences Tab */}
          {activeTab === "preferences" && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex items-center justify-between">
                <label className="text-gray-700 dark:text-gray-300 font-medium">
                  Email Notifications
                </label>
                <input
                  type="checkbox"
                  name="notifications"
                  checked={formData.notifications}
                  onChange={handleChange}
                  className="w-5 h-5 accent-indigo-600"
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
                  Theme
                </label>
                <select
                  name="theme"
                  value={formData.theme}
                  onChange={handleChange}
                  className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </div>
              <button
                type="submit"
                className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition"
              >
                Save Preferences
              </button>
            </form>
          )}

          {/* Notifications Tab - ADD THIS NEW TAB */}
          {activeTab === "notifications" && (
            <div className="space-y-6">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
                  🔔 Notification Preferences
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Customize how you receive notifications from TalentMatch AI
                </p>
              </div>
              
              <NotificationPreferences />
              
              <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Quick Actions
                </h4>
                <div className="flex gap-3">
                  <button
                    onClick={() => navigate("/notifications")}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    View All Notifications
                  </button>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                  >
                    Refresh Notifications
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Settings;