import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

function GlobalHeader({ handleLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Support", path: "/support" },
  ];

  return (
    <header className="w-full bg-white shadow-md py-4 px-6 flex justify-between items-center">
      {/* --- Brand / Logo --- */}
      <h1
        onClick={() => navigate("/")}
        className="text-2xl font-bold text-indigo-600 cursor-pointer hover:opacity-80 transition"
      >
        TalentMatch AI
      </h1>

      {/* --- Navigation --- */}
      <nav className="flex items-center space-x-6">
        {navItems.map((item) => (
          <button
            key={item.name}
            onClick={() => navigate(item.path)}
            className={`font-medium transition ${
              location.pathname === item.path
                ? "text-indigo-600 border-b-2 border-indigo-600"
                : "text-gray-700 hover:text-indigo-600"
            }`}
          >
            {item.name}
          </button>
        ))}

        {/* --- Logout Button --- */}
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-md text-white font-medium transition"
        >
          Logout
        </button>
      </nav>
    </header>
  );
}

export default GlobalHeader;
