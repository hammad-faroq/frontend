import React from "react";

function Header({ userInfo }) {
  return (
    <header className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-bold text-gray-800">
        Welcome, {userInfo?.first_name} 👋
      </h2>
      <p className="text-gray-600">
        Role: <strong>{userInfo?.role}</strong>
      </p>
    </header>
  );
}

export default Header;
