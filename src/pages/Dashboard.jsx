import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getDashboard, logoutUser } from "../services/api";
import {
  BriefcaseIcon,
  UserGroupIcon,
  ChartBarIcon,
  DocumentTextIcon,
  UserIcon,
  MagnifyingGlassIcon,
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
  QuestionMarkCircleIcon,
  BellIcon,
  CalendarIcon,
  CheckCircleIcon,
  ArrowRightCircleIcon,
} from "@heroicons/react/24/outline";

export default function Dashboard() {
  const [userInfo, setUserInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [notifications, setNotifications] = useState(3); // Example count
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getDashboard();
        if (res.ok) setUserInfo(res);
        else {
          setError("Failed to load dashboard data");
          if (res.status === 401) navigate("/login");
        }
      } catch (err) {
        setError(err.message);
        if (err.message.includes("Session expired"))
          setTimeout(() => navigate("/login"), 1500);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [navigate]);

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to log out?")) {
      try {
        await logoutUser();
      } finally {
        navigate("/login");
      }
    }
  };

  /* ---------- Loading ---------- */
  if (isLoading)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-indigo-100 rounded-full"></div>
          <div className="absolute top-0 left-0 w-20 h-20 border-4 border-t-indigo-600 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
        </div>
        <p className="mt-6 text-lg text-gray-600 font-medium">Preparing your dashboard...</p>
        <p className="mt-2 text-sm text-gray-500">Almost there!</p>
      </div>
    );

  /* ---------- Error ---------- */
  if (error)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-white text-center p-6">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Something went wrong</h2>
        <p className="text-gray-600 mb-6 max-w-md">{error}</p>
        <div className="flex gap-4">
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
          >
            Try Again
          </button>
          <button
            onClick={() => navigate("/login")}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
          >
            Back to Login
          </button>
        </div>
      </div>
    );

  const role = userInfo?.role || "";
  const firstName = userInfo?.first_name || "User";
  const email = userInfo?.email || "";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50">
      {/* ---------- Top Navigation ---------- */}
      <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg mr-3"></div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-700 to-purple-700 bg-clip-text text-transparent">
                  TalentMatch AI
                </h1>
              </div>
              <div className="hidden md:block ml-8 px-3 py-1 bg-indigo-50 rounded-full">
                <span className="text-sm font-medium text-indigo-700 capitalize">{role.replace('_', ' ')}</span>
              </div>
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-4">
              {/* Notifications */}
              <button 
                onClick={() => navigate("/notifications")}
                className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
              >
                <BellIcon className="w-5 h-5" />
                {notifications > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>
              
              {/* User Profile */}
              <div className="flex items-center gap-3">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium text-gray-900">{firstName}</p>
                  <p className="text-xs text-gray-500 truncate max-w-[180px]">{email}</p>
                </div>
                <div className="w-9 h-9 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {firstName.charAt(0).toUpperCase()}
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition font-medium text-sm"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ---------- Main Content ---------- */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Welcome back, {firstName}! 👋
          </h2>
          <p className="text-gray-600 text-lg">
            Here's what's happening with your account today.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              🎯 Active Account
            </span>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              📊 {role === 'hr' ? 'HR Portal' : 'Job Seeker Portal'}
            </span>
            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
              ⚡ Quick Actions
            </span>
          </div>
        </div>

        {/* Role Specific Dashboard */}
        <div className="mb-12">
          {role === "hr" && <HRDashboard />}
          {role === "job_seeker" && <JobSeekerDashboard />}
          {role !== "hr" && role !== "job_seeker" && <AdminDashboard />}
        </div>

        {/* Quick Stats */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Your Quick Stats</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              icon={<CalendarIcon className="w-6 h-6 text-blue-600" />}
              title="Recent Activity"
              value="12 activities"
              change="+2 from yesterday"
              color="blue"
            />
            <StatCard
              icon={<CheckCircleIcon className="w-6 h-6 text-green-600" />}
              title="Completion Rate"
              value="85%"
              change="+5% this month"
              color="green"
            />
            <StatCard
              icon={<ArrowRightCircleIcon className="w-6 h-6 text-purple-600" />}
              title="Next Steps"
              value="3 pending"
              change="Ready for action"
              color="purple"
            />
          </div>
        </div>

        {/* Quick Navigation */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900">Quick Navigation</h3>
            <button 
              onClick={() => navigate("/all-features")}
              className="text-indigo-600 hover:text-indigo-800 font-medium text-sm flex items-center gap-1"
            >
              View all features
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <NavCard
              icon={<UserIcon className="w-5 h-5" />}
              title="My Profile"
              description="Update your personal information"
              onClick={() => navigate("/profile")}
              color="indigo"
            />
            <NavCard
              icon={<Cog6ToothIcon className="w-5 h-5" />}
              title="Settings"
              description="Configure your preferences"
              onClick={() => navigate("/settings")}
              color="gray"
            />
            <NavCard
              icon={<QuestionMarkCircleIcon className="w-5 h-5" />}
              title="Help Center"
              description="Get support and guidance"
              onClick={() => navigate("/help")}
              color="blue"
            />
            <NavCard
              icon={<BellIcon className="w-5 h-5" />}
              title="Notifications"
              description={`${notifications} new updates`}
              onClick={() => navigate("/notifications")}
              color="red"
            />
          </div>
        </div>
      </main>

      {/* ---------- Footer ---------- */}
      <footer className="mt-16 border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <div className="flex items-center">
                <div className="w-6 h-6 bg-gradient-to-r from-indigo-600 to-purple-600 rounded mr-2"></div>
                <span className="font-bold text-gray-800">TalentMatch AI</span>
              </div>
              <p className="mt-2 text-sm text-gray-600">
                Intelligent recruitment platform powered by AI
              </p>
            </div>
            <div className="text-sm text-gray-600">
              © {new Date().getFullYear()} TalentMatch AI. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ---------- Sub-components ---------- */

function HRDashboard() {
  const navigate = useNavigate();
  
  const quickActions = [
    {
      icon: <BriefcaseIcon className="w-6 h-6" />,
      title: "Post New Job",
      description: "Create a new job listing",
      onClick: () => navigate("/hr/create-job"),
      color: "indigo"
    },
    {
      icon: <UserGroupIcon className="w-6 h-6" />,
      title: "View Candidates",
      description: "Review applications",
      onClick: () => navigate("/hr/applications"),
      color: "green"
    },
    {
      icon: <ChartBarIcon className="w-6 h-6" />,
      title: "Analytics",
      description: "View hiring insights",
      onClick: () => navigate("/hr/analytics"),
      color: "purple"
    },
    {
      icon: <ClipboardDocumentListIcon className="w-6 h-6" />,
      title: "Manage Jobs",
      description: "Edit or remove listings",
      onClick: () => navigate("/hr/jobs"),
      color: "blue"
    }
  ];

  return (
    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-6">HR Dashboard</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {quickActions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            className={`bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-${action.color}-300 transition-all text-left group`}
          >
            <div className={`w-12 h-12 rounded-lg bg-${action.color}-100 flex items-center justify-center mb-4 group-hover:bg-${action.color}-200 transition`}>
              <div className={`text-${action.color}-600`}>
                {action.icon}
              </div>
            </div>
            <h4 className="font-semibold text-gray-900 mb-1">{action.title}</h4>
            <p className="text-sm text-gray-600">{action.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

function JobSeekerDashboard() {
  const navigate = useNavigate();
  
  const quickActions = [
    {
      icon: <DocumentTextIcon className="w-6 h-6" />,
      title: "Build Resume",
      description: "Create or update your CV",
      onClick: () => navigate("/resume-builder"),
      color: "indigo"
    },
    {
      icon: <MagnifyingGlassIcon className="w-6 h-6" />,
      title: "Find Jobs",
      description: "Browse opportunities",
      onClick: () => navigate("/jobs"),
      color: "blue"
    },
    {
      icon: <BriefcaseIcon className="w-6 h-6" />,
      title: "My Applications",
      description: "Track your submissions",
      onClick: () => navigate("/my-applications"),
      color: "green"
    },
    {
      icon: <ChartBarIcon className="w-6 h-6" />,
      title: "Match Score",
      description: "View your profile strength",
      onClick: () => navigate("/profile-strength"),
      color: "purple"
    }
  ];

  return (
    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-6">Job Seeker Dashboard</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {quickActions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            className={`bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-${action.color}-300 transition-all text-left group`}
          >
            <div className={`w-12 h-12 rounded-lg bg-${action.color}-100 flex items-center justify-center mb-4 group-hover:bg-${action.color}-200 transition`}>
              <div className={`text-${action.color}-600`}>
                {action.icon}
              </div>
            </div>
            <h4 className="font-semibold text-gray-900 mb-1">{action.title}</h4>
            <p className="text-sm text-gray-600">{action.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

function AdminDashboard() {
  return (
    <div className="bg-white rounded-2xl shadow p-8">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          ["⚙️ System Settings", "Configure platform settings"],
          ["📊 View Reports", "Generate detailed reports"],
          ["👤 Manage Users", "Manage user accounts"]
        ].map(([title, desc]) => (
          <div key={title} className="bg-gray-50 p-6 rounded-xl hover:bg-gray-100 transition">
            <h4 className="font-semibold text-gray-900 mb-2">{title}</h4>
            <p className="text-sm text-gray-600">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, change, color }) {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-100',
    green: 'bg-green-50 border-green-100',
    purple: 'bg-purple-50 border-purple-100',
    red: 'bg-red-50 border-red-100',
    indigo: 'bg-indigo-50 border-indigo-100'
  };

  return (
    <div className={`${colorClasses[color]} border rounded-xl p-6`}>
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            {icon}
            <span className="text-sm font-medium text-gray-700">{title}</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
      <p className="mt-4 text-sm text-gray-600">{change}</p>
    </div>
  );
}

function NavCard({ icon, title, description, onClick, color }) {
  const colorClasses = {
    indigo: 'hover:border-indigo-300 hover:shadow-indigo-50',
    blue: 'hover:border-blue-300 hover:shadow-blue-50',
    green: 'hover:border-green-300 hover:shadow-green-50',
    red: 'hover:border-red-300 hover:shadow-red-50',
    gray: 'hover:border-gray-300 hover:shadow-gray-50'
  };

  return (
    <button
      onClick={onClick}
      className={`bg-white border border-gray-200 rounded-xl p-5 text-left shadow-sm hover:shadow-md transition-all ${colorClasses[color]}`}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 bg-gray-100 rounded-lg">
          {icon}
        </div>
        <h4 className="font-semibold text-gray-900">{title}</h4>
      </div>
      <p className="text-sm text-gray-600">{description}</p>
    </button>
  );
}