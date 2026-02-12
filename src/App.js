// src/App.js - Update imports
import React from "react";
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
import HRReviewAnswers from "./pages/HRReviewAnswers";

// ---------------- Interview Question Management Pages ----------------
import HRAddInterviewQuestions from "./pages/HRAddInterviewQuestions";
import QuestionPreview from "./pages/QuestionPreview";
import ManageInterviewQuestions from "./pages/ManageInterviewQuestions";
import CandidateInterviewPage from "./pages/CandidateInterviewPage";
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

//------------------Profile ----------------------------
import Profile from "./components/Profile";

import SimilarJobs from "./pages/SimilarJobs";

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
        {/* Public pages */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/password-reset" element={<PasswordResetRequest />} />
        <Route path="/jobseeker/dashboard" element={<JobSeekerDashboard />} />
        <Route path="/jobseeker/jobs" element={<JobSeekerJobs />} />
        <Route path="/jobseeker/interviews" element={<JobSeekerInterviews />} />
        <Route path="/jobseeker/upload-resume" element={<JobSeekerUploadResume />} />
        <Route path="/jobseeker/profile" element={<JobSeekerProfile />} />
        <Route path="/jobseeker/applications" element={<JobSeekerApplications />} />
        <Route path="/jobseeker/analysis" element={<JobSeekerAnalysis />} />
        <Route path="/jobseeker/settings" element={<JobSeekerSettings />} />
        <Route path="/jobseeker/interview/:id" element={<JobSeekerInterviewDetail />} />    
        <Route path="/jobseeker/interview/:interviewId" element={<JobSeekerInterviewDetail />} />
        <Route path="/jobseeker/interview/:id/questions" element={<CandidateInterviewQuestions />} />
        <Route path="/jobseeker/interview/:interviewId/start" element={<CandidateInterviewStart />} />
        <Route path="/jobseeker/interview/:interviewId/questions" element={<CandidateInterviewQuestions />} />
        <Route path="/jobseeker/interview/:interviewId/result" element={<CandidateInterviewResult />} />
        <Route path="/jobseeker/interview-prep" element={<InterviewPreparation />} />
        <Route path="/jobseeker/similar-jobs" element={<SimilarJobs />} />

        <Route
          path="/password-reset-confirm/:uidb64/:token"
          element={<PasswordResetConfirm />}
        />
        <Route path="/account-status" element={<AccountStatus />} />

        {/* HR Routes */}
        <Route
          path="/hr/dashboard"
          element={
            <ProtectedRoute>
              <HRDashboardWrapper />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hr/analytics"
          element={
            <ProtectedRoute>
              <HRAnalytics />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hr/job/:jobId"
          element={
            <ProtectedRoute>
              <HRJobApplications />
            </ProtectedRoute>
          }
        />

        {/* ---------------- Interview Module HR Routes ---------------- */}
        <Route
          path="/hr/interviews/schedule"
          element={
            <ProtectedRoute>
              <ScheduleInterview />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hr/interview/:interviewId/review"
          element={
            <ProtectedRoute>
              <ReviewAnswers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hr/interview/:interviewId/finalize"
          element={
            <ProtectedRoute>
              <FinalizeInterview />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hr/interview/:interviewId/answers"
          element={
            <ProtectedRoute>
              <HRReviewAnswers />
            </ProtectedRoute>
          }
        />

        {/* ---------------- NEW: HR Interview Question Management Routes ---------------- */}
        <Route
          path="/hr/interview/:interviewId/add-questions"
          element={
            <ProtectedRoute>
              <HRAddInterviewQuestions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hr/interview/:interviewId/manage-questions"
          element={
            <ProtectedRoute>
              <ManageInterviewQuestions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hr/question/:questionId/preview"
          element={
            <ProtectedRoute>
              <QuestionPreview />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hr/interview/:interviewId/questions"
          element={
            <ProtectedRoute>
              <ManageInterviewQuestions />
            </ProtectedRoute>
          }
        />

        {/* Protected user areas */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/resume-upload"
          element={
            <ProtectedRoute>
              <ResumeUpload />
            </ProtectedRoute>
          }
        />
        <Route
          path="/jobs"
          element={
            <ProtectedRoute>
              <JobsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/jobs/:id"
          element={
            <ProtectedRoute>
              <JobDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/apply/:jobId"
          element={
            <ProtectedRoute>
              <JobApplicationPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/applications"
          element={
            <ProtectedRoute>
              <AppliedJobsPageWrapper />
            </ProtectedRoute>
          }
        />
        <Route
          path="/support"
          element={
            <ProtectedRoute>
              <Support />
            </ProtectedRoute>
          }
        />
        <Route
          path="/help"
          element={
            <ProtectedRoute>
              <Help />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Notification Route */}
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />

        {/* Job Seeker Routes */}
        <Route
          path="/jobseeker/dashboard"
          element={
            <ProtectedRoute allowedRoles={["job_seeker"]}>
              <JobSeekerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/matches"
          element={
            <ProtectedRoute>
              <MatchesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/interview/:interviewId/take"
          element={
            <ProtectedRoute>
              <CandidateInterviewPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hr/interview/:interviewId/start"
          element={
            <ProtectedRoute>
              <HRStartInterview />
            </ProtectedRoute>
          }
        />

        {/* ---------------- Interview Module Candidate Routes ---------------- */}
        <Route
          path="/interviews/upcoming"
          element={
            <ProtectedRoute>
              <UpcomingInterviews />
            </ProtectedRoute>
          }
        />
        <Route
          path="/interview/:interviewId"
          element={
            <ProtectedRoute>
              <InterviewPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/interview/:interviewId/result"
          element={
            <ProtectedRoute>
              <InterviewResult />
            </ProtectedRoute>
          }
        />
        <Route
          path="/preparation"
          element={
            <ProtectedRoute>
              <PreparationModules />
            </ProtectedRoute>
          }
        />
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
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
