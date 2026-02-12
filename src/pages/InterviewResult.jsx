import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getInterviewResult } from "../services/interviewApi";

const InterviewResult = () => {
  const { interviewId } = useParams();
  const [result, setResult] = useState(null);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const data = await getInterviewResult(interviewId);
        setResult(data);
      } catch (err) {
        console.error("Failed to fetch result:", err);
      }
    };
    fetchResult();
  }, [interviewId]);

  if (!result) return <p>Loading results...</p>;

  return (
    <div>
      <h2>Interview Result</h2>
      <p>Status: {result.status}</p>
      <p>Score: {result.score}</p>
    </div>
  );
};

export default InterviewResult;
