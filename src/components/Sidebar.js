import React from "react";
import { useLocation, Link } from "react-router-dom";
import { BriefcaseIcon } from "@heroicons/react/24/outline";

function Sidebar({ handleLogout, navigate }) {
  const location = useLocation();

  const links = [
    { path: "/dashboard", label: "🏠 Dashboard" },
    { path: "/jobs", label: "📋 Jobs" },
    { path: "/profile", label: "👤 Profile" },
    { path: "/settings", label: "⚙️ Settings" },
    { path: "/notifications", label: "🔔 Notifications" },
    { path: "/help", label: "❓ Help" },
  ];

  return (
    <aside className="w-64 bg-gray-800 text-white flex flex-col p-5 shadow-lg min-h-screen">
      
      {/* Logo + Name */}
      <Link
        to="/"
        className="flex items-center gap-3 mb-8 hover:opacity-90 transition"
      >
        <img
          src="/media/logo/TalentMatch_ai%20logo.png"
          alt="TalentMatch AI Logo"
          className="h-10 w-auto"
          onError={(e) => {
            e.target.style.display = "none";
            const fallback = e.target.nextElementSibling;
            if (fallback) fallback.style.display = "flex";
          }}
        />

        {/* Fallback Logo */}
        <div
          className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg hidden items-center justify-center"
          style={{ display: "none" }}
        >
          <BriefcaseIcon className="w-5 h-5 text-white" />
        </div>

        <div>
          <h1 className="text-lg font-bold leading-tight">
            TalentMatch AI
          </h1>
        </div>
      </Link>

      {/* Nav Links */}
      <nav className="flex flex-col gap-3">
        {links.map((link) => (
          <button
            key={link.path}
            onClick={() => navigate(link.path)}
            className={`text-left px-4 py-2 rounded-md font-medium transition ${
              location.pathname === link.path
                ? "bg-indigo-600 text-white"
                : "hover:bg-gray-700 hover:text-indigo-300 text-gray-300"
            }`}
          >
            {link.label}
          </button>
        ))}
      </nav>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="mt-auto bg-red-500 hover:bg-red-600 px-4 py-2 rounded-md text-white font-semibold transition"
      >
        🚪 Logout
      </button>
    </aside>
  );
}

export default Sidebar;