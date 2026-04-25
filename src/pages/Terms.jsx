// src/pages/Terms.jsx
import React from "react";

function Terms() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-24">
      <h1 className="text-4xl font-bold text-gray-900 mb-6">
        Terms of Service
      </h1>
      <p className="text-gray-600 mb-8">
        Effective Date: April 24, 2026
      </p>

      <div className="space-y-8 text-gray-700 leading-relaxed">
        <section>
          <h2 className="text-2xl font-semibold mb-3">1. Acceptance of Terms</h2>
          <p>
            By accessing or using TalentMatch AI, you agree to be bound by these
            Terms of Service. If you do not agree with these terms, you may not
            use our platform. These terms apply to all visitors, users,
            candidates, recruiters, employers, and organizations using our
            services.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">2. Our Services</h2>
          <p>
            TalentMatch AI provides AI-powered recruitment tools, candidate
            matching systems, resume analysis, analytics dashboards, employer
            hiring tools, and career support services. We may update, improve,
            suspend, or modify services at any time.
          </p>
          <p className="mt-3">
            Some features may require registration, verification, subscriptions,
            or additional permissions.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">3. User Accounts</h2>
          <p>
            You are responsible for maintaining the confidentiality of your
            account credentials. You agree to provide accurate information and
            keep your profile updated.
          </p>
          <ul className="list-disc pl-6 mt-3 space-y-2">
            <li>Do not share login credentials.</li>
            <li>Do not impersonate others.</li>
            <li>Notify us immediately of unauthorized access.</li>
            <li>You are responsible for activities under your account.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">4. Acceptable Use</h2>
          <p>You agree not to misuse the platform. Prohibited activities include:</p>
          <ul className="list-disc pl-6 mt-3 space-y-2">
            <li>Uploading false, misleading, or fraudulent information.</li>
            <li>Posting discriminatory or unlawful job listings.</li>
            <li>Attempting unauthorized access to systems or accounts.</li>
            <li>Uploading harmful code, malware, or malicious scripts.</li>
            <li>Scraping, copying, or abusing platform data.</li>
            <li>Harassing other users or violating privacy rights.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">5. Employer Responsibilities</h2>
          <p>
            Employers must ensure job postings are legitimate, lawful, and
            accurate. Employers are solely responsible for recruitment decisions,
            communication with candidates, and compliance with employment laws.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">6. Candidate Responsibilities</h2>
          <p>
            Candidates are responsible for providing truthful resumes,
            qualifications, certifications, and employment history. Misleading
            submissions may lead to suspension or account removal.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">7. AI Recommendations</h2>
          <p>
            Our AI tools provide automated suggestions, rankings, and matching
            recommendations based on available data. These outputs are advisory
            only and should not be considered guarantees, final hiring decisions,
            or legal determinations.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">8. Intellectual Property</h2>
          <p>
            All platform content, branding, software, design elements, logos,
            code, algorithms, and materials belong to TalentMatch AI or its
            licensors. Unauthorized reproduction or distribution is prohibited.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">9. Payments & Subscriptions</h2>
          <p>
            Certain services may require paid subscriptions. Fees, billing terms,
            renewals, and cancellations will be displayed before purchase unless
            otherwise agreed in writing.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">10. Termination</h2>
          <p>
            We may suspend or terminate accounts that violate these terms,
            threaten security, abuse services, or create legal risk. Users may
            stop using the platform at any time.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">11. Disclaimer</h2>
          <p>
            Services are provided on an “as is” and “as available” basis without
            warranties of any kind. We do not guarantee uninterrupted access,
            employment outcomes, or error-free operation.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">12. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, TalentMatch AI shall not be
            liable for indirect, incidental, special, or consequential damages
            arising from platform use.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">13. Changes to Terms</h2>
          <p>
            We may revise these Terms of Service periodically. Continued use of
            the platform after updates means acceptance of revised terms.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">14. Contact Us</h2>
          <p>
            For questions regarding these terms, contact the TalentMatch AI
            support team through the Contact page.
          </p>
        </section>
      </div>
    </div>
  );
}

export default Terms;