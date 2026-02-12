import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";

function Help() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar handleLogout={handleLogout} navigate={navigate} />
      
      {/* Main Content */}
      <div className="flex-1 p-8 bg-gray-50 min-h-screen">
        <h2 className="text-3xl font-bold text-indigo-700 mb-6">
          Help & Support Center
        </h2>

        <p className="text-gray-700 mb-6">
          Welcome to the TalentMatch Help Center. Find answers to common
          questions or get in touch with our support team.
        </p>

        <div className="bg-white shadow rounded-lg p-6 space-y-4">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Frequently Asked Questions</h3>
          <ul className="space-y-3">
            <li>
              <strong>🔐 How do I reset my password?</strong>
              <p className="text-gray-600 ml-6">
                Go to the login page and click <em>"Forgot Password?"</em>. Follow
                the instructions sent to your registered email.
              </p>
            </li>
            <li>
              <strong>📄 How can I update my resume?</strong>
              <p className="text-gray-600 ml-6">
                Visit the <em>Profile</em> page and upload your latest resume under
                "CV Upload".
              </p>
            </li>
            <li>
              <strong>💼 How do I apply for a job?</strong>
              <p className="text-gray-600 ml-6">
                Click on a job title, review its details, and click
                <em> "Apply Now"</em> to upload your CV and submit.
              </p>
            </li>
            <li>
              <strong>🧑‍💻 I found a bug. How do I report it?</strong>
              <p className="text-gray-600 ml-6">
                You can report issues by emailing us at{" "}
                <a
                  href="mailto:support@talentmatch.ai"
                  className="text-indigo-600 underline"
                >
                  support@talentmatch.ai
                </a>
                .
              </p>
            </li>
          </ul>
        </div>

        <div className="mt-8 bg-indigo-50 border border-indigo-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-indigo-800 mb-2">
            Need more help?
          </h4>
          <p className="text-gray-700">
            Our support team is available Monday—Friday, 9 AM – 6 PM.
            <br />
            Email:{" "}
            <a
              href="mailto:support@talentmatch.ai"
              className="text-indigo-600 underline"
            >
              support@talentmatch.ai
            </a>{" "}
            or call <span className="font-semibold">+1 (800) 555-0199</span>.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Help;