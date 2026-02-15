// import React from "react";

function Loader() {
  return (
    <div className="flex flex-col justify-center items-center h-screen bg-gray-100">
      <div className="w-10 h-10 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
      <p className="mt-3 text-gray-600">Loading dashboard...</p>
    </div>
  );
}

export default Loader;
