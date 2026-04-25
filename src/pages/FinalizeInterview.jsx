import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { finalizeInterview } from "../services/interviewApi";
import toast from "react-hot-toast";

const FinalizeInterview = () => {
  const { interviewId } = useParams();
  const navigate = useNavigate();

  const handleFinalize = async () => {
    try {
      await finalizeInterview(interviewId);
      toast.success("Interview finalized!");
      navigate("/hr/dashboard");
    } catch (err) {
      console.error("Failed to finalize interview:", err);
    }
  };

  return (
    <div>
      <h2>Finalize Interview</h2>
      <button onClick={handleFinalize}>Finalize</button>
    </div>
  );
};

export default FinalizeInterview;
