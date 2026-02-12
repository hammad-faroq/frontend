import React, { useState } from "react";
import { uploadResume } from "../services/resumeService";


function ResumeUpload() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [parsedData, setParsedData] = useState(null); // ✅ to store LLM parsed JSON

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setSuccess(false);
    setError("");
    setParsedData(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a file");
      return;
    }

    try {
      setLoading(true);
      const response = await uploadResume(file); // ✅ use service

      if (response.success) {
        setSuccess(true);
        setError("");
        setParsedData(response.parsed_resume); // ✅ show parsed JSON
      } else {
        setError(response.message || "Failed to upload resume");
        setSuccess(false);
        setParsedData(null);
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong while uploading");
      setSuccess(false);
      setParsedData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="resume-upload-container">
      <h2>Upload Your Resume</h2>
      <form onSubmit={handleSubmit}>
        <input type="file" accept=".pdf,.docx" onChange={handleFileChange} />
        <button type="submit" disabled={loading}>
          {loading ? "Parsing..." : "Upload"}
        </button>
      </form>

      {success && <p style={{ color: "green" }}>Resume uploaded successfully!</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {parsedData && (
        <div style={{ marginTop: "20px" }}>
          <h3>Parsed Resume JSON:</h3>
          <pre>{JSON.stringify(parsedData, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default ResumeUpload;
