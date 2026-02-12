import React from "react";

function GlobalFooter() {
  return (
    <footer className="w-full bg-gray-200 border-t py-4 px-6 text-sm text-gray-600 flex justify-between">
      <p>&copy; {new Date().getFullYear()} TalentMatch AI. All rights reserved.</p>
      <div className="space-x-4">
        <a href="#privacy" className="hover:text-indigo-600">Privacy Policy</a>
        <a href="#terms" className="hover:text-indigo-600">Terms</a>
      </div>
    </footer>
  );
}

export default GlobalFooter;
