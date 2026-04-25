// src/pages/Security.jsx
import React from "react";

function Security() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-24">
      <h1 className="text-4xl font-bold text-gray-900 mb-6">
        Security
      </h1>
      <p className="text-gray-600 mb-8">
        Effective Date: April 24, 2026
      </p>

      <div className="space-y-8 text-gray-700 leading-relaxed">
        <section>
          <h2 className="text-2xl font-semibold mb-3">1. Our Commitment</h2>
          <p>
            TalentMatch AI is committed to protecting user data, employer
            information, resumes, communications, and platform operations through
            modern security controls and responsible practices.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">2. Data Protection</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Encrypted connections using HTTPS/SSL.</li>
            <li>Secure password storage and authentication methods.</li>
            <li>Access controls for internal systems.</li>
            <li>Routine backups and recovery procedures.</li>
            <li>Monitoring for suspicious activity.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">3. Account Security</h2>
          <p>
            Users should choose strong passwords, keep credentials private, log
            out from shared devices, and notify us of suspicious account access.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">4. Infrastructure Security</h2>
          <p>
            We use secure hosting environments, restricted administrative access,
            patch management practices, and operational monitoring to protect
            infrastructure resources.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">5. AI & Data Safety</h2>
          <p>
            Resume processing, analytics, and AI systems are designed with data
            handling safeguards, role-based access, and controlled usage
            practices.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">6. Incident Response</h2>
          <p>
            If a security issue is detected, we investigate promptly, mitigate
            impact, restore services, and notify affected parties where required.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">7. Responsible Disclosure</h2>
          <p>
            Security researchers who responsibly report vulnerabilities help us
            improve platform safety. Please contact us through official support
            channels.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">8. Continuous Improvement</h2>
          <p>
            Security is an ongoing process. We continuously review policies,
            systems, training, and controls to strengthen protection over time.
          </p>
        </section>
      </div>
    </div>
  );
}

export default Security;