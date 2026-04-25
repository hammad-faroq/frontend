import { Link } from "react-router-dom";
import { BriefcaseIcon } from "@heroicons/react/24/outline";

function InnerFooter() {
  return (
    <footer className="bg-gray-900 text-white pt-10 pb-6 mt-auto">
      <div className="max-w-7xl mx-auto px-6">

        {/* TOP */}
        <div className="grid md:grid-cols-4 gap-8 mb-8">

          {/* LOGO */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                <BriefcaseIcon className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-bold">TalentMatch AI</h3>
            </div>
            <p className="text-gray-400 text-sm">
              Smart AI hiring platform for recruiters and candidates.
            </p>
          </div>

          {/* QUICK LINKS */}
          <div>
            <h4 className="font-semibold mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/dashboard" className="hover:text-white">Dashboard</Link></li>
              <li><Link to="/jobs" className="hover:text-white">Jobs</Link></li>
              <li><Link to="/profile" className="hover:text-white">Profile</Link></li>
              <li><Link to="/settings" className="hover:text-white">Settings</Link></li>
            </ul>
          </div>

          {/* SUPPORT */}
          <div>
            <h4 className="font-semibold mb-3">Support</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/help" className="hover:text-white">Help Center</Link></li>
              <li><Link to="/notifications" className="hover:text-white">Notifications</Link></li>
            </ul>
          </div>

          {/* SOCIAL */}
          <div>
            <h4 className="font-semibold mb-3">Connect</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="https://x.com" target="_blank" className="hover:text-white">Twitter</a></li>
              <li><a href="https://linkedin.com" target="_blank" className="hover:text-white">LinkedIn</a></li>
              <li><a href="https://github.com" target="_blank" className="hover:text-white">GitHub</a></li>
            </ul>
          </div>

        </div>

        {/* BOTTOM */}
        <div className="border-t border-gray-800 pt-5 text-center text-gray-500 text-xs">
          © {new Date().getFullYear()} TalentMatch AI — All rights reserved
        </div>
      </div>
    </footer>
  );
}

export default InnerFooter;