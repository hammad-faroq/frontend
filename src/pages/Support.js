import React from "react";
import GlobalHeader from "./GlobalHeader";
import GlobalFooter from "./GlobalFooter";

export default function Support() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Global Header */}
      <GlobalHeader />

      {/* Main Content */}
      <main className="flex-grow p-8">
        <h2 className="text-3xl font-bold text-indigo-700 mb-4">
          Support Center
        </h2>
        <p className="text-gray-700 leading-relaxed">
          Need help? Reach out to our support team at{" "}
          <a
            href="mailto:support@talentmatch.ai"
            className="text-indigo-600 underline"
          >
            support@talentmatch.ai
          </a>
          , or browse FAQs for quick answers.
        </p>
      </main>

      {/* Global Footer */}
      <GlobalFooter />
    </div>
  );
}