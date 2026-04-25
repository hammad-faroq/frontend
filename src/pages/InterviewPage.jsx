import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getInterviewQuestions, submitInterviewAnswer } from "../services/interviewApi";
import toast from "react-hot-toast";

const InterviewPage = () => {
  const { interviewId } = useParams();
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const data = await getInterviewQuestions(interviewId);
        setQuestions(data);
      } catch (err) {
        console.error("Failed to load questions:", err);
      }
    };
    fetchQuestions();
  }, [interviewId]);

  const handleAnswerSubmit = async (questionId, answer) => {
    try {
      await submitInterviewAnswer(interviewId, questionId, answer);
      toast.success("Answer submitted!");
    } catch (err) {
      console.error("Failed to submit answer:", err);
    }
  };

  return (
    <div>
      <h2>Interview</h2>
      {questions.map((q) => (
        <div key={q.id}>
          <p>{q.text}</p>
          <input
            type="text"
            placeholder="Your answer"
            onBlur={(e) => handleAnswerSubmit(q.id, e.target.value)}
          />
        </div>
      ))}
    </div>
  );
};

export default InterviewPage;
