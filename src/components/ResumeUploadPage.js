import React, { useState, useEffect } from "react";

function ResumeUploadPage() {
  const [resumeUrl, setResumeUrl] = useState(null);
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchResume();
  }, []);

  const fetchResume = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://127.0.0.1:8000/api/jobs/resume/", {
        headers: { Authorization: `Token ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.resume_url) setResumeUrl(data.resume_url);
    } catch {
      setMessage("Failed to load resume.");
    }
  };

  const handleUpload = async () => {
    if (!file) return alert("Please choose a file.");
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("resume", file);

    try {
      const res = await fetch("http://127.0.0.1:8000/api/jobs/resume/", {
        method: "POST",
        headers: { Authorization: `Token ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setResumeUrl(data.resume_url);
        setMessage("✅ Resume uploaded successfully!");
      } else {
        setMessage(data.error || "Upload failed.");
      }
    } catch {
      setMessage("Network error. Try again.");
    }
  };

  const handleDelete = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://127.0.0.1:8000/api/jobs/resume/", {
        method: "DELETE",
        headers: { Authorization: `Token ${token}` },
      });
      if (res.ok) {
        setResumeUrl(null);
        setMessage("Resume deleted.");
      }
    } catch {
      setMessage("Error deleting resume.");
    }
  };

  return (
    <div className="p-6 bg-white shadow rounded-lg">
      <h2 className="text-2xl font-semibold mb-4">Resume Management</h2>

      {resumeUrl ? (
        <div className="mb-4">
          <p>📄 Current Resume: <a href={resumeUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline">View</a></p>
          <button onClick={handleDelete} className="btn-danger mt-2">🗑 Delete Resume</button>
        </div>
      ) : (
        <p>No resume uploaded yet.</p>
      )}

      <input
        type="file"
        accept=".pdf,.doc,.docx"
        onChange={(e) => setFile(e.target.files[0])}
        className="block mt-4"
      />
      <button onClick={handleUpload} className="btn-primary mt-2">
        {resumeUrl ? "Update Resume" : "Upload Resume"}
      </button>

      {message && <p className="mt-4 text-gray-700">{message}</p>}
    </div>
  );
}

export default ResumeUploadPage;
