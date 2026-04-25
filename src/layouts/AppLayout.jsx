import React, { useEffect, useState } from "react";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { Outlet } from "react-router-dom";

function AppLayout() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isAuthenticated = () => !!localStorage.getItem("token");
  const role = localStorage.getItem("user_role");

  return (
    <>
      <Header
        isScrolled={isScrolled}
        isAuthenticated={isAuthenticated}
        role={role}
      />

      {/* 🔥 THIS IS THE FIX */}
      <main className="pt-16">
        <Outlet />
      </main>

      <Footer />
    </>
  );
}

export default AppLayout;