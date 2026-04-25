// src/App.js - Update imports
import { Toaster } from "react-hot-toast";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";

// ---------------- Pages ----------------
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import PasswordResetRequest from "./pages/PasswordResetRequest";
import PasswordResetConfirm from "./pages/PasswordResetConfirm";
import AccountStatus from "./pages/AccountStatus";
import About from "./pages/About";
import Contact from "./pages/Contact";
import ResumeUpload from "./pages/ResumeUpload";
import JobsPage from "./pages/JobsPage";
import JobDetail from "./pages/JobDetail";
import JobApplicationPage from "./components/JobApplicationPage";
import AppliedJobsPage from "./components/AppliedJobsPage";
import Support from "./pages/Support";
import Help from "./pages/Help";
import Settings from "./pages/Settings";
import ProfilePage from "./pages/ProfilePage";
import HRDashboard from "./pages/HRDashboard";
import HRAnalytics from "./pages/HRAnalytics";
import HRJobApplications from "./pages/HRJobApplications";

// ---------------- Job Seeker Pages ----------------
import JobSeekerDashboard from "./pages/JobSeekerDashboard";
import JobSeekerJobs from "./pages/JobSeekerJobs";
import JobSeekerInterviews from "./pages/JobSeekerInterviews";
import JobSeekerUploadResume from "./pages/JobSeekerUploadResume";
import JobSeekerProfile from "./pages/JobSeekerProfile";
import JobSeekerApplications from "./pages/JobSeekerApplications";
import JobSeekerAnalysis from "./pages/JobSeekerAnalysis";
import JobSeekerSettings from "./pages/JobSeekerSettings";
import JobSeekerInterviewDetail from "./pages/JobSeekerInterviewDetail";

// ---------------- Other Components ----------------
import MatchesPage from "./components/MatchesPage";
import NotificationsPage from "./pages/NotificationsPage";

// ---------------- Interview Pages ----------------
import UpcomingInterviews from "./pages/UpcomingInterviews";
import InterviewPage from "./pages/InterviewPage";
import PreparationModules from "./pages/PreparationModules";
import InterviewResult from "./pages/InterviewResult";
import ScheduleInterview from "./pages/ScheduleInterview";
import ReviewAnswers from "./pages/ReviewAnswers";
import FinalizeInterview from "./pages/FinalizeInterview";

// ---------------- Interview Question Management Pages ----------------
import HRStartInterview from "./pages/HRStartInterview";

import InterviewPreparation from "./pages/InterviewPreparation";

import CandidateInterviewStart from './pages/CandidateInterviewStart';
import CandidateInterviewQuestions from './pages/CandidateInterviewQuestions';
import CandidateInterviewResult from './pages/CandidateInterviewResult';
// 🔒 Auth Context & ProtectedRoute
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

// ✅ Notification Context
import { NotificationProvider } from "./context/NotificationContext";

// import Blog from "./pages/Blog";
import Demo from "./pages/Demo";
import Careers  from "./pages/Careers";
import Blog from "./pages/Blog";
// App.js import
import Pricing from "./pages/Pricing";
//------------------Profile ----------------------------
import Profile from "./components/Profile";
// App.js imports
import Terms from "./pages/Terms";
import Cookies from "./pages/Cookies";
import Security from "./pages/Security";
import Privacy from "./pages/Privacy";

import SimilarJobs from "./pages/SimilarJobs";
import MainLayout from "./layouts/MainLayout";
import AppLayout from "./layouts/AppLayout";

// ---------------- Wrappers ----------------
function AppliedJobsPageWrapper() {
  const navigate = useNavigate();
  return <AppliedJobsPage navigate={navigate} />;
}

function HRDashboardWrapper() {
  const navigate = useNavigate();
  return <HRDashboard navigate={navigate} />;
}

// ---------------- App Content ----------------
function AppContent() {
  return (
    <Router>
      <Routes>
        <Route path="/about" element={<About />} />

              {/* 🌐 ALL PAGES WITH TOP NAVBAR */}
      <Route element={<AppLayout />}>

        <Route path="/" element={<Home />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/password-reset" element={<PasswordResetRequest />} />
        <Route path="/password-reset-confirm/:uidb64/:token" element={<PasswordResetConfirm />} />
        <Route path="/account-status" element={<AccountStatus />} />

        <Route path="/demo" element={<Demo />} />
        <Route path="/careers" element={<Careers />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/cookies" element={<Cookies />} />
        <Route path="/security" element={<Security />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/pricing" element={<Pricing />} />

      </Route>

        <Route path="/hr/job/:jobId" element={<ProtectedRoute><HRJobApplications /></ProtectedRoute>} />
        {/* 🔥 MAIN LAYOUT WRAPPER (SIDEBAR AREA) */}
        <Route element={<MainLayout />}>

                  <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
        <Route path="/help" element={<Help />} />

          {/* USER CORE */}
          <Route path="/matches" element={<MatchesPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/support" element={<Support />} />
          

          {/* JOBS */}
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/jobs/:id" element={<JobDetail />} />
          <Route path="/apply/:jobId" element={<JobApplicationPage />} />
          <Route path="/applications" element={<AppliedJobsPageWrapper />} />
          <Route path="/resume-upload" element={<ResumeUpload />} />

          {/* JOB SEEKER */}
          <Route path="/jobseeker/dashboard" element={<JobSeekerDashboard />} />
          <Route path="/jobseeker/jobs" element={<JobSeekerJobs />} />
          <Route path="/jobseeker/applications" element={<JobSeekerApplications />} />
          <Route path="/jobseeker/profile" element={<JobSeekerProfile />} />
          <Route path="/jobseeker/settings" element={<JobSeekerSettings />} />
          <Route path="/jobseeker/analysis" element={<JobSeekerAnalysis />} />
          <Route path="/jobseeker/interviews" element={<JobSeekerInterviews />} />
          <Route path="/jobseeker/upload-resume" element={<JobSeekerUploadResume />} />
          <Route path="/jobseeker/similar-jobs" element={<SimilarJobs />} />

          {/* INTERVIEW */}
          <Route path="/interviews/upcoming" element={<UpcomingInterviews />} />
          <Route path="/interview/:interviewId" element={<InterviewPage />} />
          <Route path="/interview/:interviewId/result" element={<InterviewResult />} />
          <Route path="/preparation" element={<PreparationModules />} />

          <Route path="/jobseeker/interview-prep" element={<InterviewPreparation />} />
          <Route path="/jobseeker/interview/:interviewId/start" element={<CandidateInterviewStart />} />
          <Route path="/jobseeker/interview/:interviewId/questions" element={<CandidateInterviewQuestions />} />
          <Route path="/jobseeker/interview/:interviewId/result" element={<CandidateInterviewResult />} />

          {/* HR */}
          <Route path="/hr/dashboard" element={<ProtectedRoute><HRDashboardWrapper /></ProtectedRoute>} />
          <Route path="/hr/analytics" element={<ProtectedRoute><HRAnalytics /></ProtectedRoute>} />
          

          <Route path="/hr/interviews/schedule" element={<ProtectedRoute><ScheduleInterview /></ProtectedRoute>} />
          <Route path="/hr/interview/:interviewId/start" element={<ProtectedRoute><HRStartInterview /></ProtectedRoute>} />
          <Route path="/hr/interview/:interviewId/review" element={<ProtectedRoute><ReviewAnswers /></ProtectedRoute>} />
          <Route path="/hr/interview/:interviewId/finalize" element={<ProtectedRoute><FinalizeInterview /></ProtectedRoute>} />

        </Route>

      </Routes>
    </Router>
  );
}

// ---------------- Main App ----------------
function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <AppContent />

        {/* Toast system goes here (INSIDE providers) */}
        <Toaster
  position="top-center"
  toastOptions={{
    duration: 2500,

    // 🌟 BASE STYLE
    style: {
      width: "100%",
      maxWidth: "650px",
      padding: "16px 20px",
      borderRadius: "14px",
      fontSize: "15px",
      fontWeight: "500",
      lineHeight: "1.4",
      textAlign: "left",
    },

    // ✅ SUCCESS
    success: {
      style: {
        background: "#16a34a",
        color: "#fff",
      },
    },

    // ❌ ERROR
    error: {
      style: {
        background: "#dc2626",
        color: "#fff",
      },
    },
  }}
/>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
