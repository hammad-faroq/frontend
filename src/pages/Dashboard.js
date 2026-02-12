// src/components/Dashboard.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getDashboard, logoutUser } from "../services/api";

// Role Dashboards
import HRDashboard from "./HRDashboard";
import JobSeekerDashboard from "./JobSeekerDashboard";
import AdminDashboard from "./AdminDashboard";

// Reusable Components
import Sidebar from "../components/Sidebar";
import Header from "./Header";
import Loader from "./Loader";
import ErrorMessage from "./ErrorMessage";
import GlobalHeader from "./GlobalHeader";
import GlobalFooter from "./GlobalFooter";

function Dashboard() {
  const [userInfo, setUserInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const response = await getDashboard();

      if (response.ok) {
        setUserInfo(response);
        localStorage.setItem("user_role", response.role);
        localStorage.setItem("is_superuser", response.is_superuser || false);
      } else {
        setError("Failed to load dashboard data");

        if (response.status === 401) navigate("/login");
      }
    } catch (err) {
      setError(err.message);
      if (err.message.includes("Session expired")) {

        setTimeout(() => navigate("/login"), 2000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to logout?")) {
      try {
        await logoutUser();
        navigate("/login");

      } catch {

        navigate("/login");
      }
    }
  };


  const renderRoleDashboard = () => {
    if (!userInfo) return null;

    switch (userInfo.role) {
      case "hr":
        return <HRDashboard navigate={navigate} />;
      case "job_seeker":
        return <JobSeekerDashboard navigate={navigate} />;
      default:
        return <AdminDashboard navigate={navigate} />;

    }
  };

  if (isLoading) return <Loader />;
  if (error) return <ErrorMessage error={error} navigate={navigate} />;

  return (

    <div className="min-h-screen flex flex-col bg-gray-100">
      <GlobalHeader handleLogout={handleLogout} />
      <div className="flex flex-grow">
        <Sidebar handleLogout={handleLogout} navigate={navigate} />
        <main className="flex-1 p-6">
          <Header userInfo={userInfo} />
          {renderRoleDashboard()}
        </main>
      </div>
      <GlobalFooter />

    </div>
  );
}

export default Dashboard;


