import React, { useEffect, useState } from "react";
import { getRecommendationsForLatestResume } from "../api/api"; // adjust path

const RecommendationsPage = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      const data = await getRecommendationsForLatestResume();
      setRecommendations(data);
      setLoading(false);
    };

    fetchRecommendations();
  }, []);

  if (loading) return <div>Loading recommendations...</div>;

  if (recommendations.length === 0)
    return <div>🎯 No recommendations found.</div>;

  return (
    <div>
      <h2>Recommendations</h2>
      <ul>
        {recommendations.map((rec, idx) => (
          <li key={idx}>
            <strong>{rec.title || rec.name}</strong>
            {rec.description && <p>{rec.description}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RecommendationsPage;
