// src/pages/JobSeekerInterviewDetail.js
import  { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { logoutUser } from "../services/api";
// Import the API functions
import { 
  startCandidateInterview, 
  getCandidateInterviewDetail,
  getCandidateInterviewQuestions,
  getUpcomingInterviews 
} from "../services/interviewApi";

function JobSeekerInterviewDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [joiningMeeting, setJoiningMeeting] = useState(false);
  const [startingInterview, setStartingInterview] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [upcomingInterviews, setUpcomingInterviews] = useState([]);

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate("/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  useEffect(() => {
    fetchInterviewDetails();
    loadUpcomingInterviews();
  }, [id]);

  const loadUpcomingInterviews = async () => {
    try {
      const interviews = await getUpcomingInterviews();
      setUpcomingInterviews(interviews);
    } catch (err) {
      console.error("Failed to load upcoming interviews:", err);
    }
  };

  const fetchInterviewDetails = async () => {
    try {
      setLoading(true);
      
      // If it's a test ID, use mock data
      if (id === 'test' || id === '1' || id === '2' || id === 'in_progress_test') {
        console.log("Using mock data for test ID:", id);
        setTimeout(() => {
          const mockInterviews = {
            '1': {
              id: 1,
              title: "Software Engineer Interview",
              job_title: "Full Stack Developer",
              company_name: "Tech Corp Inc.",
              status: "scheduled",
              scheduled_date: "2024-12-15T14:30:00Z",
              duration: "45 minutes",
              mode: "virtual",
              meeting_link: "https://meet.google.com/abc-defg-hij",
              meeting_platform: "Google Meet",
              interviewer_name: "Jane Smith",
              description: "Technical interview focusing on React, Node.js, and system design. Be prepared to discuss your previous projects and solve coding problems.",
              contact_person: "HR Department",
              contact_email: "hr@techcorp.com",
              contact_phone: "+1 (555) 123-4567",
              requirements: "Bring your laptop and have your development environment ready."
            },
            '2': {
              id: 2,
              title: "Product Manager Interview",
              job_title: "Senior Product Manager",
              company_name: "Innovate Solutions Ltd.",
              status: "completed",
              scheduled_date: "2024-12-10T10:00:00Z",
              duration: "60 minutes",
              mode: "virtual",
              meeting_link: "https://zoom.us/j/123456789",
              meeting_platform: "Zoom",
              interviewer_name: "John Davis",
              description: "Behavioral and product strategy interview. We'll discuss your experience with product development cycles, stakeholder management, and strategic thinking.",
              contact_person: "Talent Acquisition",
              contact_email: "talent@innovate.com",
              contact_phone: "+1 (555) 987-6543"
            },
            'test': {
              id: 'test',
              title: "Test Interview",
              job_title: "Test Position",
              company_name: "Test Company",
              status: "scheduled",
              scheduled_date: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
              duration: "30 minutes",
              mode: "virtual",
              meeting_link: "https://meet.google.com/test-interview",
              meeting_platform: "Google Meet",
              interviewer_name: "Test Interviewer",
              description: "This is a test interview for demonstration purposes.",
              contact_person: "Test HR",
              contact_email: "test@example.com",
              contact_phone: "+1 (555) 000-0000"
            },
            'in_progress_test': {
              id: 'in_progress_test',
              title: "Software Engineer Interview - In Progress",
              job_title: "Full Stack Developer",
              company_name: "Tech Corp Inc.",
              status: "in_progress",
              started_at: new Date().toISOString(),
              scheduled_date: new Date().toISOString(),
              duration: "45 minutes",
              mode: "virtual",
              meeting_link: "https://meet.google.com/abc-defg-hij",
              meeting_platform: "Google Meet",
              interviewer_name: "Jane Smith",
              description: "Technical interview in progress. Please continue answering the questions.",
              contact_person: "HR Department",
              contact_email: "hr@techcorp.com",
              contact_phone: "+1 (555) 123-4567",
              total_questions: 5,
              current_question: 2
            }
          };
          
          setInterview(mockInterviews[id] || mockInterviews['test']);
          
          // Add mock feedback for completed interview
          if (id === '2') {
            setFeedback({
              overall_score: 85,
              technical_skills: {
                "Product Strategy": 90,
                "Stakeholder Management": 85,
                "Agile Methodology": 80,
                "Data Analysis": 75
              },
              comments: "Excellent performance in the interview. Strong strategic thinking and communication skills. Demonstrated good understanding of product lifecycle. Would benefit from more technical depth in analytics.",
              recommendation: "hire"
            });
          }
          
          setLoading(false);
        }, 1000);
        return;
      }

      // ✅ USE THE API FUNCTION FOR REAL INTERVIEWS
      try {
        const data = await getCandidateInterviewDetail(id);
        console.log("Interview data received from API:", data);
        setInterview(data);
        
        if (data.status === 'completed') {
          fetchFeedback(data.id || id);
        }
        
        setLoading(false);
      } catch (apiError) {
        console.error("API error fetching interview:", apiError);
        
        // Fallback to fetch if API function fails
        try {
          await fetchWithEndpoints();
        } catch (fetchError) {
          setError("Failed to load interview. Please try again.");
          setLoading(false);
        }
      }

    } catch (err) {
      console.error("Error fetching interview:", err);
      setError("Failed to load interview. Please try refreshing the page.");
      setLoading(false);
    }
  };

  // Fallback function using fetch
  const fetchWithEndpoints = async () => {
    const token = localStorage.getItem("token");
    
    if (!token) {
      setError("Please login to continue");
      setLoading(false);
      return;
    }

    const endpoints = [
      `https://backendfyp-production-00a3.up.railway.app/api/interview/candidate/interviews/${id}/`,
      `https://backendfyp-production-00a3.up.railway.app/api/interviews/${id}/`,
      `https://backendfyp-production-00a3.up.railway.app/api/interviews/candidate/${id}/`,
      `https://backendfyp-production-00a3.up.railway.app/api/candidate/interviews/${id}/`,
      `https://backendfyp-production-00a3.up.railway.app/api/interview/${id}/`,
    ];

    let response = null;
    let lastError = null;
    let lastStatus = null;

    for (const endpoint of endpoints) {
      try {
        console.log("Trying endpoint:", endpoint);
        response = await fetch(endpoint, {
          headers: { 
            "Authorization": `Token ${token}`,
            "Content-Type": "application/json"
          },
        });

        console.log("Response status:", response.status);
        lastStatus = response.status;
        
        if (response.ok) {
          const data = await response.json();
          console.log("Interview data received:", data);
          setInterview(data);
          
          if (data.status === 'completed') {
            fetchFeedback(data.id || id);
          }
          setLoading(false);
          return;
        }
        
        lastError = response.status;
      } catch (err) {
        console.log("Endpoint failed:", endpoint, err);
        lastError = err.message;
      }
    }

    // If we get here, all endpoints failed
    if (lastStatus === 404) {
      setError(`Interview not found (ID: ${id}). The interview may have been cancelled or you don't have access.`);
    } else if (lastStatus === 403) {
      setError("You don't have permission to access this interview.");
    } else if (lastStatus === 401) {
      setError("Please login again to access this interview.");
    } else {
      setError("Failed to load interview details. Please try again later.");
    }
    setLoading(false);
  };

  const fetchFeedback = async (interviewId) => {
    try {
      const token = localStorage.getItem("token");
      
      const feedbackEndpoints = [
        `https://backendfyp-production-00a3.up.railway.app/api/interview/candidate/interviews/${interviewId}/feedback/`,
        `https://backendfyp-production-00a3.up.railway.app/api/interviews/${interviewId}/feedback/`,
        `https://backendfyp-production-00a3.up.railway.app/api/candidate/interviews/${interviewId}/feedback/`,
        `https://backendfyp-production-00a3.up.railway.app/api/interview/feedback/${interviewId}/`,
      ];

      for (const endpoint of feedbackEndpoints) {
        try {
          const response = await fetch(endpoint, {
            headers: { 
              "Authorization": `Token ${token}`,
              "Content-Type": "application/json"
            },
          });

          if (response.ok) {
            const feedbackData = await response.json();
            console.log("Feedback data received:", feedbackData);
            setFeedback(feedbackData);
            return;
          }
        } catch (err) {
          console.log("Feedback endpoint failed:", endpoint, err);
        }
      }
      
      console.log("No feedback endpoint worked, feedback might not be available");
    } catch (err) {
      console.error("Error fetching feedback:", err);
      // Don't show error for feedback - it's optional
    }
  };

  const handleStartInterview = async () => {
  if (!window.confirm("Are you ready to start the interview? Once started, you'll begin answering questions.")) {
    return;
  }

  try {
    setStartingInterview(true);
    
    console.log("Starting interview with ID:", id);
    
    // ✅ CHECK IF IT'S A TEST ID
    if (id === 'test' || id === '1' || id === '2' || id === 'in_progress_test') {
      console.log("Using mock API for test ID");
      
      // Mock the API response
      const mockResult = {
        success: true,
        message: "Interview started",
        interview: {
          id: id,
          status: 'in_progress',
          started_at: new Date().toISOString()
        },
        first_question_id: "mock-question-1",
        total_questions: 3,
        start_time: new Date().toISOString()
      };
      
      console.log("Mock interview started:", mockResult);
      
      // Update interview status
      if (interview) {
        setInterview({
          ...interview,
          status: 'in_progress',
          started_at: new Date().toISOString()
        });
      }
      
      // ✅ Navigate to the questions page
      navigate(`/jobseeker/interview/${id}/questions`);
      return;
    }
    
    // ✅ USE THE REAL API FUNCTION FOR REAL UUIDs
    const result = await startCandidateInterview(id);
    console.log("Interview started:", result);
    
    // Update interview status
    if (interview) {
      setInterview({
        ...interview,
        status: 'in_progress',
        started_at: new Date().toISOString()
      });
    }
    
    // ✅ Navigate to the new interview questions page
    navigate(`/jobseeker/interview/${id}/questions`);
    
  } catch (err) {
    console.error("Error starting interview:", err);
    console.error("Error details:", err.response?.data || err.message);
    
    // Fallback to direct fetch if API function fails
    try {
      const token = localStorage.getItem("token");
      console.log("Using token for fallback:", token ? "Yes (length: " + token.length + ")" : "No");
      
      const response = await fetch(`https://backendfyp-production-00a3.up.railway.app/api/interview/candidate/interview/${id}/start/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log("Fallback response status:", response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log("Interview started via fetch:", data);
        
        if (interview) {
          setInterview({
            ...interview,
            status: 'in_progress',
            started_at: new Date().toISOString()
          });
        }
        
        navigate(`/jobseeker/interview/${id}/questions`);
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Could not parse error response' }));
        console.error("Fallback error response:", errorData);
        alert(`Failed to start interview: ${errorData.error || 'Please try again'}`);
      }
    } catch (fetchError) {
      console.error("Fallback fetch error:", fetchError);
      alert("Failed to start interview. Please check your connection.");
    }
  } finally {
    setStartingInterview(false);
  }
};

  const handleJoinMeeting = () => {
    if (!interview?.meeting_link) {
      alert("Meeting link is not available. Please contact the interviewer.");
      return;
    }

    setJoiningMeeting(true);
    // Open meeting in new tab
    window.open(interview.meeting_link, '_blank', 'noopener,noreferrer');
    
    // Simulate joining process
    setTimeout(() => {
      setJoiningMeeting(false);
    }, 2000);
  };

  const handleReschedule = () => {
    if (window.confirm("Do you want to request a reschedule for this interview?")) {
      alert("Reschedule request sent to the interviewer. You will be notified once they respond.");
    }
  };

  const handleCancel = () => {
    if (window.confirm("Are you sure you want to cancel this interview? This action cannot be undone.")) {
      alert("Cancellation request sent. The interviewer will be notified.");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'TBD';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (err) {
      return 'Date format error';
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getOverallScoreColor = (score) => {
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const prepareForInterview = () => {
    if (window.confirm("Open interview preparation guide?")) {
      navigate("/jobseeker/interview-preparation");
    }
  };

  const downloadICS = () => {
    if (!interview?.scheduled_date) {
      alert("No interview date available to create calendar event.");
      return;
    }

    try {
      const startDate = new Date(interview.scheduled_date);
      const endDate = new Date(startDate.getTime() + 45 * 60000); // Add 45 minutes

      const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//TalentMatch//Interview//EN',
        'BEGIN:VEVENT',
        `SUMMARY:${interview.title}`,
        `DESCRIPTION:${interview.description || 'Interview scheduled via TalentMatch'}`,
        `DTSTART:${startDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
        `DTEND:${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
        `LOCATION:${interview.mode === 'virtual' ? interview.meeting_link || 'Online' : interview.location || 'TBD'}`,
        'END:VEVENT',
        'END:VCALENDAR'
      ].join('\n');

      const blob = new Blob([icsContent], { type: 'text/calendar' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `interview-${interview.id}.ics`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      alert("Calendar event downloaded. Import it to your calendar.");
    } catch (err) {
      console.error("Error creating ICS file:", err);
      alert("Failed to create calendar event.");
    }
  };

  // Check browser console for API debugging
  const checkConsoleForDetails = () => {
    alert("Please check your browser's Developer Tools (F12) → Console tab for detailed API call information and errors.");
  };

  // Navigate to interview questions page directly (for testing)
  const goToQuestionsPage = () => {
    navigate(`/jobseeker/interview/${id}/questions`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar handleLogout={handleLogout} navigate={navigate} />
        <div className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            <button
              onClick={() => navigate("/jobseeker/interviews")}
              className="flex items-center text-purple-600 hover:text-purple-800 mb-8"
            >
              <span className="mr-2">←</span> Back to Interviews
            </button>
            
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading interview details...</p>
              <p className="text-gray-400 text-sm mt-2">Interview ID: {id}</p>
              <p className="text-gray-400 text-xs mt-1">This may take a moment</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !interview) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar handleLogout={handleLogout} navigate={navigate} />
        <div className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            <button
              onClick={() => navigate("/jobseeker/interviews")}
              className="flex items-center text-purple-600 hover:text-purple-800 mb-8"
            >
              <span className="mr-2">←</span> Back to Interviews
            </button>
            
            <div className="bg-red-50 border border-red-200 rounded-2xl p-8">
              <div className="flex items-start mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                  <span className="text-2xl text-red-600">⚠️</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-red-800 mb-2">
                    {error || "Interview not found"}
                  </h3>
                  <div className="text-red-600 space-y-2">
                    <p>
                      Interview ID: <span className="font-mono bg-red-100 px-2 py-1 rounded text-sm">{id}</span>
                    </p>
                    <p className="text-sm">
                      This interview may have been cancelled, or you don't have permission to access it.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 space-y-3">
                <button
                  onClick={() => navigate("/jobseeker/interviews")}
                  className="w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Back to Interviews List
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Try Loading Again
                </button>
                <button
                  onClick={checkConsoleForDetails}
                  className="w-full px-6 py-3 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors font-medium"
                >
                  Check Console for Details
                </button>
              </div>
            </div>
            
            {/* Debug info (only in development) */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <h4 className="font-medium text-yellow-800 mb-2">Debug Information</h4>
                <div className="text-yellow-700 text-sm space-y-1">
                  <p>• Interview ID from URL: <code className="bg-yellow-100 px-1 rounded">{id}</code></p>
                  <p>• ID Type: {id.length > 10 ? "UUID" : "Numeric/Test ID"}</p>
                  <p>• Using mock data for IDs: test, 1, 2, in_progress_test</p>
                  <p>• Real UUIDs will try actual API endpoints</p>
                  <p>• Check browser console (F12) for API call details</p>
                  <p className="mt-2 font-medium">Test URLs:</p>
                  <ul className="ml-4 list-disc">
                    <li><a href="/jobseeker/interview/test" className="text-blue-600 hover:underline">/jobseeker/interview/test</a> - Test interview</li>
                    <li><a href="/jobseeker/interview/1" className="text-blue-600 hover:underline">/jobseeker/interview/1</a> - Scheduled interview mock</li>
                    <li><a href="/jobseeker/interview/2" className="text-blue-600 hover:underline">/jobseeker/interview/2</a> - Completed interview mock</li>
                    <li><a href="/jobseeker/interview/in_progress_test" className="text-blue-600 hover:underline">/jobseeker/interview/in_progress_test</a> - In Progress interview mock</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar handleLogout={handleLogout} navigate={navigate} />
      
      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-start justify-between">
              <div>
                <button
                  onClick={() => navigate("/jobseeker/interviews")}
                  className="flex items-center text-purple-600 hover:text-purple-800 mb-4"
                >
                  <span className="mr-2">←</span> Back to Interviews
                </button>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{interview.title}</h1>
                <div className="flex items-center gap-4 flex-wrap">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(interview.status)}`}>
                    {interview.status?.replace('_', ' ') || 'Scheduled'}
                  </span>
                  <span className="text-gray-600">{interview.job_title || interview.company_name}</span>
                  <span className="text-gray-400 text-sm">ID: {interview.id}</span>
                </div>
              </div>
              
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={downloadICS}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm flex items-center"
                  title="Add to Calendar"
                >
                  <span className="mr-2">📅</span> Add to Calendar
                </button>
                
                {interview.status === 'scheduled' && (
                  <>
                    <button
                      onClick={handleReschedule}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm"
                    >
                      Request Reschedule
                    </button>
                    <button
                      onClick={handleCancel}
                      className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 font-medium text-sm"
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - Interview Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Quick Info Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Interview Details</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Date & Time</label>
                      <p className="text-lg font-semibold text-gray-800">{formatDate(interview.scheduled_date || interview.scheduled_at)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Duration</label>
                      <p className="text-lg font-semibold text-gray-800">{interview.duration || '30 minutes'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Mode</label>
                      <p className="text-lg font-semibold text-gray-800">
                        {interview.mode === 'virtual' ? '🌐 Virtual' : 
                         interview.mode === 'in_person' ? '📍 In-Person' : 
                         interview.interview_type || 'Online'}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Interviewer</label>
                      <p className="text-lg font-semibold text-gray-800">
                        {interview.interviewer_name || 'To be assigned'}
                        {interview.interviewer_title && <span className="text-gray-600 text-sm block">{interview.interviewer_title}</span>}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Meeting Platform</label>
                      <p className="text-lg font-semibold text-gray-800">
                        {interview.meeting_platform || (interview.meeting_link?.includes('zoom') ? 'Zoom' : 
                          interview.meeting_link?.includes('teams') ? 'Microsoft Teams' : 
                          interview.meeting_link?.includes('meet') ? 'Google Meet' : 'Online Platform')}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Job Position</label>
                      <p className="text-lg font-semibold text-gray-800">{interview.job_title || 'Not specified'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  {interview.status === 'completed' ? 'Interview Summary' : 'Interview Description'}
                </h2>
                <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                  {interview.description || 'No description provided. This interview will focus on assessing your skills and experience for the position.'}
                </p>
                
                {interview.requirements && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h3 className="font-medium text-gray-700 mb-2">Requirements:</h3>
                    <p className="text-gray-600">{interview.requirements}</p>
                  </div>
                )}
              </div>

              {/* Start Interview Button (for scheduled interviews) */}
              {interview.status === 'scheduled' && (
                <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-6 text-white">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-2xl">🚀</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Ready to Start Interview?</h3>
                      <p className="text-green-100 text-sm">Begin your interview questions</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <p className="text-green-100">
                      Once you start, you'll answer a series of questions. Make sure you're in a quiet environment and ready to focus.
                    </p>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <span className="mr-2">⏱️</span>
                        <span>Time limit per question may apply</span>
                      </div>
                      <div className="flex items-center">
                        <span className="mr-2">📝</span>
                        <span>Prepare to answer technical and behavioral questions</span>
                      </div>
                      <div className="flex items-center">
                        <span className="mr-2">💾</span>
                        <span>Your answers will be saved automatically</span>
                      </div>
                    </div>
                    
                    <button
                      onClick={handleStartInterview}
                      disabled={startingInterview}
                      className="w-full py-3 bg-white text-green-600 rounded-lg hover:bg-green-50 font-semibold transition-colors flex items-center justify-center"
                    >
                      {startingInterview ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600 mr-2"></div>
                          Starting Interview...
                        </>
                      ) : (
                        'Start Interview Now'
                      )}
                    </button>

                    {/* Quick test button */}
                    <button
                      onClick={goToQuestionsPage}
                      className="w-full py-2 bg-green-800 text-green-100 rounded-lg hover:bg-green-900 font-medium text-sm"
                    >
                      🚀 Quick Test: Go to Questions Page
                    </button>
                    
                    <p className="text-green-200 text-xs text-center">
                      Note: You can also join the meeting first if this is a live interview
                    </p>
                  </div>
                </div>
              )}

              {/* Continue Interview Button (for in_progress interviews) */}
{interview.status === 'in_progress' && (
  <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white">
    <div className="flex items-center mb-4">
      <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mr-3">
        <span className="text-2xl">🚀</span>
      </div>
      <div>
        <h3 className="text-lg font-semibold">Continue Interview</h3>
        <p className="text-blue-100 text-sm">Questions are waiting</p>
      </div>
    </div>
    
    <div className="space-y-4">
      <p className="text-blue-100">
        Your interview is in progress. Click below to continue answering questions.
      </p>
      
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="bg-white/10 p-2 rounded text-center">
          <div className="font-bold">Status</div>
          <div className="text-blue-200">In Progress</div>
        </div>
        <div className="bg-white/10 p-2 rounded text-center">
          <div className="font-bold">Started At</div>
          <div className="text-blue-200">
            {interview.started_at ? new Date(interview.started_at).toLocaleTimeString() : 'Recently'}
          </div>
        </div>
      </div>
      
      {interview.total_questions && interview.current_question && (
        <div className="bg-white/10 p-3 rounded-lg">
          <div className="text-center mb-1">
            <span className="text-blue-200">Progress: </span>
            <span className="font-bold">
              Question {interview.current_question} of {interview.total_questions}
            </span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <div 
              className="bg-white h-2 rounded-full transition-all duration-300"
              style={{ width: `${(interview.current_question / interview.total_questions) * 100}%` }}
            ></div>
          </div>
        </div>
      )}
      
      <button
        onClick={() => {
          // Add check for test IDs
          if (id === 'test' || id === '1' || id === '2' || id === 'in_progress_test') {
            console.log("Navigating to questions page for test interview:", id);
          }
          navigate(`/jobseeker/interview/${id}/questions`);
        }}
        className="w-full py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 font-semibold transition-colors flex items-center justify-center"
      >
        Continue to Questions →
      </button>
      
      <p className="text-blue-200 text-xs text-center">
        Note: Your progress is automatically saved
      </p>
    </div>
  </div>
)}

              {/* Preparation Tips */}
              {interview.status === 'scheduled' && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">Preparation Tips</h2>
                    <button
                      onClick={prepareForInterview}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium text-sm"
                    >
                      View Full Guide
                    </button>
                  </div>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <span className="text-green-500 mr-3 mt-1">✓</span>
                      <span className="text-gray-700">Research the company and understand their products/services</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-3 mt-1">✓</span>
                      <span className="text-gray-700">Review the job description and prepare examples of relevant experience</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-3 mt-1">✓</span>
                      <span className="text-gray-700">Prepare questions to ask the interviewer about the role and team</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-3 mt-1">✓</span>
                      <span className="text-gray-700">Test your equipment (camera, microphone, internet) 15 minutes before</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-3 mt-1">✓</span>
                      <span className="text-gray-700">Find a quiet, well-lit space with a professional background</span>
                    </li>
                  </ul>
                </div>
              )}

              {/* Feedback Section (if completed) */}
              {interview.status === 'completed' && feedback && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Interview Feedback</h2>
                  
                  {feedback.overall_score && (
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-700">Overall Score</h3>
                          <p className="text-sm text-gray-600">Based on technical and soft skills assessment</p>
                        </div>
                        <span className={`px-4 py-2 rounded-full text-lg font-bold ${getOverallScoreColor(feedback.overall_score)}`}>
                          {feedback.overall_score}/100
                        </span>
                      </div>
                    </div>
                  )}

                  {feedback.technical_skills && (
                    <div className="mb-6">
                      <h3 className="font-medium text-gray-700 mb-3">Skills Assessment</h3>
                      <div className="space-y-3">
                        {Object.entries(feedback.technical_skills).map(([skill, score]) => (
                          <div key={skill} className="flex items-center justify-between">
                            <span className="text-gray-800">{skill}</span>
                            <div className="flex items-center gap-3">
                              <div className="w-32 bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${
                                    score >= 80 ? 'bg-green-500' :
                                    score >= 60 ? 'bg-yellow-500' :
                                    'bg-red-500'
                                  }`}
                                  style={{ width: `${score}%` }}
                                ></div>
                              </div>
                              <span className={`font-medium w-8 ${
                                score >= 80 ? 'text-green-600' :
                                score >= 60 ? 'text-yellow-600' :
                                'text-red-600'
                              }`}>
                                {score}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {feedback.comments && (
                    <div>
                      <h3 className="font-medium text-gray-700 mb-3">Interviewer Comments</h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-gray-700 whitespace-pre-line">{feedback.comments}</p>
                      </div>
                    </div>
                  )}

                  {feedback.recommendation && (
                    <div className="mt-6 p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium mr-3 ${
                          feedback.recommendation === 'hire' ? 'bg-green-100 text-green-800' :
                          feedback.recommendation === 'maybe' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {feedback.recommendation === 'hire' ? '✅ Recommended' :
                           feedback.recommendation === 'maybe' ? '⚠️ Under Consideration' :
                           '❌ Not Recommended'}
                        </span>
                        <span className="text-gray-700">
                          {feedback.recommendation === 'hire' ? 'You have been recommended for the next round!' :
                           feedback.recommendation === 'maybe' ? 'Decision pending - additional review needed' :
                           'Not selected for the next round'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Column - Actions & Meeting Info */}
            <div className="space-y-6">
              {/* Join Meeting Card */}
              {(interview.status === 'scheduled' || interview.status === 'in_progress') && (
                <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl p-6 text-white">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-2xl">🎤</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">
                        {interview.status === 'in_progress' ? 'Join Live Interview' : 'Ready to Join?'}
                      </h3>
                      <p className="text-purple-100 text-sm">
                        {interview.status === 'in_progress' ? 'Connect with interviewer' : 'Join the interview meeting'}
                      </p>
                    </div>
                  </div>
                  
                  {interview.meeting_link ? (
                    <>
                      <button
                        onClick={handleJoinMeeting}
                        disabled={joiningMeeting}
                        className="w-full py-3 bg-white text-purple-600 rounded-lg hover:bg-purple-50 font-semibold transition-colors flex items-center justify-center mb-3"
                      >
                        {joiningMeeting ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600 mr-2"></div>
                            Joining...
                          </>
                        ) : (
                          interview.status === 'in_progress' ? 'Join Live Meeting' : 'Join Meeting Now'
                        )}
                      </button>
                      
                      {interview.status === 'in_progress' && (
                        <p className="text-purple-200 text-sm text-center mb-3">
                          Connect with the interviewer to discuss your answers
                        </p>
                      )}
                    </>
                  ) : (
                    <div className="bg-white/10 p-4 rounded-lg mb-3">
                      <p className="text-sm text-purple-100">
                        {interview.status === 'in_progress' 
                          ? 'Meeting link not available. Please contact the interviewer.' 
                          : 'Meeting link will be provided closer to the interview time.'}
                      </p>
                    </div>
                  )}

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <span className="mr-2">⏰</span>
                      <span>Join 5 minutes early</span>
                    </div>
                    <div className="flex items-center">
                      <span className="mr-2">📹</span>
                      <span>Camera and mic ready</span>
                    </div>
                    <div className="flex items-center">
                      <span className="mr-2">🔗</span>
                      <span>Stable internet connection</span>
                    </div>
                  </div>

                  {interview.meeting_link && (
                    <div className="mt-4 pt-4 border-t border-purple-400/30">
                      <p className="text-sm text-purple-100 mb-2">Meeting Link:</p>
                      <p className="text-sm break-all bg-white/10 p-2 rounded font-mono">
                        {interview.meeting_link}
                      </p>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(interview.meeting_link);
                          alert('Meeting link copied to clipboard!');
                        }}
                        className="w-full mt-2 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 text-sm"
                      >
                        Copy Link
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Contact Information */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-800 mb-4">Contact Information</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center mb-1">
                      <span className="text-gray-500 mr-2">👤</span>
                      <label className="text-xs text-gray-500">Interview Coordinator</label>
                    </div>
                    <p className="text-gray-800">{interview.contact_person || 'HR Department'}</p>
                  </div>
                  <div>
                    <div className="flex items-center mb-1">
                      <span className="text-gray-500 mr-2">📧</span>
                      <label className="text-xs text-gray-500">Email</label>
                    </div>
                    <p className="text-gray-800 break-all">{interview.contact_email || 'hr@company.com'}</p>
                  </div>
                  <div>
                    <div className="flex items-center mb-1">
                      <span className="text-gray-500 mr-2">📞</span>
                      <label className="text-xs text-gray-500">Phone</label>
                    </div>
                    <p className="text-gray-800">{interview.contact_phone || 'Not provided'}</p>
                  </div>
                </div>
                
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="font-medium text-gray-700 mb-2">Need Help?</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Having technical issues or need to reschedule?
                  </p>
                  <button
                    onClick={() => alert(`Contact ${interview.contact_email || 'support'} for assistance`)}
                    className="w-full py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Contact Support
                  </button>
                </div>
              </div>

              {/* Interview Checklist */}
              {(interview.status === 'scheduled' || interview.status === 'in_progress') && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <h3 className="font-semibold text-gray-800 mb-4">
                    {interview.status === 'in_progress' ? 'Interview Progress' : 'Pre-Interview Checklist'}
                  </h3>
                  <div className="space-y-3">
                    {interview.status === 'in_progress' ? (
                      <>
                        <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                          <span className="text-gray-700">Interview Status</span>
                          <span className="font-bold text-blue-600">In Progress</span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                          <span className="text-gray-700">Questions Answered</span>
                          <span className="font-bold text-blue-600">
                            {interview.current_question || 0} / {interview.total_questions || '?'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                          <span className="text-gray-700">Time Elapsed</span>
                          <span className="font-bold text-blue-600">
                            {interview.started_at 
                              ? `${Math.floor((new Date() - new Date(interview.started_at)) / 60000)} min` 
                              : '--'}
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        <label className="flex items-center">
                          <input type="checkbox" className="rounded text-purple-600 mr-3" />
                          <span className="text-gray-700">Resume and notes prepared</span>
                        </label>
                        <label className="flex items-center">
                          <input type="checkbox" className="rounded text-purple-600 mr-3" />
                          <span className="text-gray-700">Camera and microphone tested</span>
                        </label>
                        <label className="flex items-center">
                          <input type="checkbox" className="rounded text-purple-600 mr-3" />
                          <span className="text-gray-700">Quiet environment secured</span>
                        </label>
                        <label className="flex items-center">
                          <input type="checkbox" className="rounded text-purple-600 mr-3" />
                          <span className="text-gray-700">Questions prepared for interviewer</span>
                        </label>
                        <label className="flex items-center">
                          <input type="checkbox" className="rounded text-purple-600 mr-3" />
                          <span className="text-gray-700">Backup internet connection available</span>
                        </label>
                      </>
                    )}
                  </div>
                  
                  {interview.status === 'scheduled' && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => {
                          const checkboxes = document.querySelectorAll('input[type="checkbox"]');
                          checkboxes.forEach(cb => cb.checked = true);
                          alert("All checklist items marked as complete!");
                        }}
                        className="w-full py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
                      >
                        Mark All Complete
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Quick Actions */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-800 mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  {interview.job_id && (
                    <button
                      onClick={() => navigate(`/jobseeker/application/${interview.job_id}`)}
                      className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center justify-between"
                    >
                      <span className="text-gray-800">View Job Application</span>
                      <span className="text-gray-400">→</span>
                    </button>
                  )}
                  <button
                    onClick={() => navigate("/jobseeker/profile")}
                    className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center justify-between"
                  >
                    <span className="text-gray-800">Update Profile</span>
                    <span className="text-gray-400">→</span>
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center justify-between"
                  >
                    <span className="text-gray-800">Print Details</span>
                    <span className="text-gray-400">🖨️</span>
                  </button>
                  
                  {/* Direct Questions Page Link for testing */}
                  {process.env.NODE_ENV === 'development' && (
                    <button
                      onClick={goToQuestionsPage}
                      className="w-full text-left p-3 border border-blue-200 rounded-lg hover:bg-blue-50 flex items-center justify-between"
                    >
                      <span className="text-blue-800">🚀 Go to Questions</span>
                      <span className="text-blue-400">→</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Upcoming Interviews */}
              {upcomingInterviews.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <h3 className="font-semibold text-gray-800 mb-4">Your Upcoming Interviews</h3>
                  <div className="space-y-3">
                    {upcomingInterviews.slice(0, 3).map(upcoming => (
                      <div
                        key={upcoming.id}
                        className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                        onClick={() => navigate(`/jobseeker/interview/${upcoming.id}`)}
                      >
                        <div className="font-medium text-gray-800">{upcoming.title}</div>
                        <div className="text-sm text-gray-600">
                          {new Date(upcoming.scheduled_date).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                  {upcomingInterviews.length > 3 && (
                    <button
                      onClick={() => navigate("/jobseeker/interviews")}
                      className="w-full mt-3 py-2 text-sm text-purple-600 hover:text-purple-800"
                    >
                      View All ({upcomingInterviews.length})
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Next Steps (for completed interviews) */}
          {interview.status === 'completed' && !feedback && (
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-2xl p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-blue-600 text-xl">⏳</span>
                </div>
                <div>
                  <h3 className="font-semibold text-blue-800">Feedback Pending</h3>
                  <p className="text-blue-600">
                    The interviewer is still preparing your feedback. Check back later or you'll be notified when it's ready.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Source indicator */}
          <div className="mt-6 text-center text-gray-400 text-sm">
            {id === 'test' || id === '1' || id === '2' || id === 'in_progress_test' ? (
              <p>📋 Displaying mock interview data for testing</p>
            ) : (
              <p>📡 Connected to live interview data via API</p>
            )}
          </div>

          {/* API Debug Info */}
          <div className="mt-6 bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm">
            <h4 className="font-medium text-gray-800 mb-2">API Information</h4>
            <div className="text-gray-600 space-y-1">
              <p>• Using API functions from: <code className="bg-gray-100 px-1 rounded">interviewApi.js</code></p>
              <p>• Start Interview Endpoint: <code className="bg-gray-100 px-1 rounded">/api/interview/candidate/interview/{id}/start/</code></p>
              <p>• Questions Page: <code className="bg-gray-100 px-1 rounded">/jobseeker/interview/{id}/questions</code></p>
              <p>• Current Status: <span className={`font-medium ${getStatusColor(interview.status)} px-2 py-1 rounded`}>
                {interview.status}
              </span></p>
            </div>
          </div>

          {/* Debug Section for Testing */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <h4 className="font-medium text-yellow-800 mb-2">Status Testing</h4>
              <div className="space-y-2">
                <p className="text-sm text-yellow-700">Current status: <strong>{interview.status}</strong></p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setInterview({...interview, status: 'scheduled'})}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
                  >
                    Set to "scheduled"
                  </button>
                  <button
                    onClick={() => setInterview({...interview, status: 'in_progress', started_at: new Date().toISOString()})}
                    className="px-3 py-1 bg-yellow-600 text-white rounded text-sm"
                  >
                    Set to "in_progress"
                  </button>
                  <button
                    onClick={() => setInterview({...interview, status: 'completed'})}
                    className="px-3 py-1 bg-green-600 text-white rounded text-sm"
                  >
                    Set to "completed"
                  </button>
                </div>
                <p className="text-xs text-yellow-600">
                  Interview ID: {id} | Questions Page: /jobseeker/interview/{id}/questions
                </p>
                <button
                  onClick={goToQuestionsPage}
                  className="w-full py-2 bg-yellow-600 text-white rounded font-medium"
                >
                  🚀 Test: Navigate to Questions Page
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default JobSeekerInterviewDetail;