import React from "react";
import { useLocation } from "react-router-dom";

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
    <aside className="w-64 bg-gray-800 text-white flex flex-col p-5 shadow-lg">
      <h1 className="text-2xl font-bold mb-8 text-center tracking-wide">
        TalentMatch
      </h1>

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
