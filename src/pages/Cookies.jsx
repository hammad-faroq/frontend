// src/pages/Cookies.jsx
import React from "react";

function Cookies() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-24">
      <h1 className="text-4xl font-bold text-gray-900 mb-6">
        Cookie Policy
      </h1>
      <p className="text-gray-600 mb-8">
        Effective Date: April 24, 2026
      </p>

      <div className="space-y-8 text-gray-700 leading-relaxed">
        <section>
          <h2 className="text-2xl font-semibold mb-3">1. What Are Cookies?</h2>
          <p>
            Cookies are small text files stored on your device when you visit a
            website. They help websites remember preferences, improve
            functionality, and enhance user experience.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">2. How We Use Cookies</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Keep users logged in securely.</li>
            <li>Remember settings and preferences.</li>
            <li>Analyze website traffic and performance.</li>
            <li>Improve navigation and usability.</li>
            <li>Protect against fraud and abuse.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">3. Types of Cookies We Use</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Essential Cookies:</strong> Required for core features.</li>
            <li><strong>Performance Cookies:</strong> Measure usage and speed.</li>
            <li><strong>Preference Cookies:</strong> Save your choices.</li>
            <li><strong>Security Cookies:</strong> Detect suspicious behavior.</li>
            <li><strong>Analytics Cookies:</strong> Understand engagement trends.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">4. Third-Party Cookies</h2>
          <p>
            Some trusted third-party tools may place cookies for analytics,
            authentication, integrations, or performance monitoring. These third
            parties manage their own privacy practices.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">5. Managing Cookies</h2>
          <p>
            You can manage or disable cookies through your browser settings.
            Please note that disabling certain cookies may impact website
            functionality and user experience.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">6. Updates</h2>
          <p>
            We may update this Cookie Policy periodically to reflect operational,
            technical, or legal changes.
          </p>
        </section>
      </div>
    </div>
  );
}

export default Cookies;