// StatCard.js
import React from "react";

function StatCard({ title, value, onClick }) {
  return (
    <div
      onClick={onClick}
      className="cursor-pointer bg-indigo-50 p-4 rounded shadow hover:shadow-lg transition text-center"
    >
      <h4 className="text-lg font-semibold text-gray-800">{title}</h4>
      <p className="text-2xl font-bold text-indigo-600">{value}</p>
    </div>
  );
}

export default StatCard;
