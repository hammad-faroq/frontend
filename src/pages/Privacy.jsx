import React from "react";

function Privacy() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <h1 className="text-4xl font-bold text-gray-900 mb-6">Privacy Policy</h1>

      <p className="text-gray-600 mb-6">
        TalentMatch AI values your privacy. We are committed to protecting your
        personal information and ensuring transparency in how we collect, use,
        and store data.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-3">Information We Collect</h2>
      <ul className="list-disc ml-6 text-gray-700 space-y-2">
        <li>Account details such as name, email, and password</li>
        <li>Resume, skills, work experience, and profile data</li>
        <li>Usage analytics to improve platform performance</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-3">How We Use Data</h2>
      <p className="text-gray-700">
        We use your data to provide job matching, improve recommendations,
        secure accounts, and enhance user experience.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-3">Data Security</h2>
      <p className="text-gray-700">
        We use encryption, secure authentication, and access controls to protect
        your data.
      </p>
    </div>
  );
}

export default Privacy;