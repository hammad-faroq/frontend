import React, { useEffect, useState } from "react";
import { checkResumeStatus, getStoredCertifications } from "../services/api";

function CertificationRecommendationsPage() {
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const status = await checkResumeStatus();
        if (!status.has_resume) {
          setError("Upload a resume to see recommended certifications.");
          return;
        }
        // Use the NEW endpoint that gets data from database
        const response = await getStoredCertifications();
        if (response.success) {
          setCerts(response.certifications);
        } else {
          setError(response.message || "Failed to fetch certifications.");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to fetch certifications.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <p className="p-6">Loading certifications...</p>;
  if (error) return <p className="p-6 text-red-500">{error}</p>;
  if (certs.length === 0) return <p className="p-6">No certifications recommended at this time.</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Recommended Certifications</h2>
      <div className="space-y-3">
        {certs.map((c, i) => (
          <div key={i} className="bg-white p-4 rounded shadow">
            <strong className="block text-lg">{c.name}</strong>
            {c.provider && <span className="text-gray-600">{c.provider}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

export default CertificationRecommendationsPage;