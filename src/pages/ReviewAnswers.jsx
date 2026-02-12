import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { reviewCandidateAnswers } from "../services/interviewApi";

const ReviewAnswers = () => {
  const { interviewId } = useParams();
  const [answers, setAnswers] = useState([]);

  useEffect(() => {
    const fetchAnswers = async () => {
      try {
        const data = await reviewCandidateAnswers(interviewId);
        setAnswers(data);
      } catch (err) {
        console.error("Failed to fetch answers:", err);
      }
    };
    fetchAnswers();
  }, [interviewId]);

  return (
    <div>
      <h2>Review Candidate Answers</h2>
      <ul>
        {answers.map((a) => (
          <li key={a.id}>
            {a.question}: {a.answer}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ReviewAnswers;
