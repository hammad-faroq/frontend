import React from "react";

function ErrorMessage({ error, navigate }) {
  return (
    <div className="flex flex-col justify-center items-center h-screen bg-gray-100 text-center">
      <h2 className="text-xl font-bold text-red-600">Error</h2>
      <p className="mt-2">{error}</p>
      <button 
        onClick={() => navigate("/login")} 
        className="btn-primary mt-4">
        Back to Login
      </button>
    </div>
  );
}

export default ErrorMessage;
