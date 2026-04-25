import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  BriefcaseIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { logoutUser } from "../services/api";
import toast from "react-hot-toast";

function InnerHeader() {
  const location = useLocation();
  const navigate = useNavigate();

const handleLogout = () => {
  toast.custom(
    (t) => (
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-4 min-w-[320px]">
        <p className="text-sm font-semibold text-gray-800 mb-4">
          Are you sure you want to log out?
        </p>

        <div className="flex gap-2">
          {/* LOGOUT */}
          <button
            onClick={async () => {
              // 🔥 INSTANT CLOSE EVERYTHING
              toast.dismiss();

              const loadingId = toast.loading("Logging out...");

              try {
                await logoutUser();

                toast.dismiss(loadingId);
                toast.success("Logged out successfully 👋");

                setTimeout(() => {
                  navigate("/login");
                }, 800);

              } catch (err) {
                toast.dismiss(loadingId);
                toast.error("Logout failed");

                setTimeout(() => {
                  navigate("/login");
                }, 800);
              }
            }}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg text-sm font-semibold"
          >
            Logout
          </button>

          {/* CANCEL */}
          <button
            onClick={() => toast.dismiss()}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg text-sm font-semibold"
          >
            Cancel
          </button>
        </div>
      </div>
    ),
    { duration: Infinity }
  );
};

  const links = [
    { path: "/dashboard", label: "Dashboard" },
    { path: "/jobs", label: "Jobs" },
    { path: "/profile", label: "Profile" },
    { path: "/settings", label: "Settings" },
    { path: "/notifications", label: "Notifications" },
    { path: "/help", label: "Help" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
        {/* LEFT */}
        <Link
          to="/dashboard"
          className="flex items-center gap-3 hover:opacity-90 transition"
        >
          <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
            <BriefcaseIcon className="w-5 h-5 text-white" />
          </div>

          <div className="leading-tight">
            <span className="block text-lg font-bold bg-gradient-to-r from-indigo-700 to-purple-700 bg-clip-text text-transparent">
              TalentMatch AI
            </span>
            <span className="text-xs text-gray-500">
              Smart Hiring Platform
            </span>
          </div>
        </Link>

        {/* CENTER */}
        <nav className="hidden lg:flex items-center gap-2 bg-gray-100 rounded-xl p-1">
          {links.map((link) => {
            const active = location.pathname === link.path;

            return (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  active
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-gray-600 hover:text-indigo-600 hover:bg-white"
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* RIGHT */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/support")}
            className="hidden sm:block text-sm font-medium text-gray-600 hover:text-indigo-600 transition"
          >
            Support
          </button>

          <button
            onClick={handleLogout}
            className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all duration-200"
          >
            <ArrowRightOnRectangleIcon className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

export default InnerHeader;