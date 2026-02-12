import React, { useEffect, useState } from "react";
import { checkResumeStatus, getStoredCareerInsights } from "../services/api";

function CareerInsightsPage() {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const status = await checkResumeStatus();
        if (!status.has_resume) {
          setError("Upload a resume to see career insights.");
          return;
        }
        // Use the NEW endpoint that gets data from database
        const response = await getStoredCareerInsights();
        if (response.success) {
          setInsights(response.career_insights);
        } else {
          setError(response.message || "Failed to load career insights.");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load career insights.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <p className="p-6">Loading career insights...</p>;
  if (error) return <p className="p-6 text-red-500">{error}</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Career Insights</h2>
      <p>{insights?.summary || "No insights available."}</p>
    </div>
  );
}

export default CareerInsightsPage;