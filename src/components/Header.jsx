
import { Link, useNavigate } from "react-router-dom";
import {
  BriefcaseIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";

function Header({ isScrolled, isAuthenticated, role }) {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/register");
  };
 const goToDashboard = () => {
  if (isAuthenticated()) {
    navigate("/dashboard");
  } else {
    navigate("/login");
  }
};

  return (
      <header className={`fixed top-0 left-0 w-full z-40 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/90 backdrop-blur-md shadow-lg py-2' 
          : 'bg-transparent py-4'
      }`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 hover:opacity-90 transition-opacity">
            {/* Logo Image from Django media folder */}
            <img 
              src="/media/logo/TalentMatch_ai%20logo.png"  // URL encoded space
              alt="TalentMatch AI Logo" 
              className="h-8 w-auto" 
              onError={(e) => {
                e.target.onerror = null; // Prevent infinite loop
                // Fallback to gradient logo if image doesn't exist
                e.target.style.display = 'none';
                const fallbackDiv = e.target.nextElementSibling;
                if (fallbackDiv) fallbackDiv.style.display = 'flex';
              }}
            />
            {/* Fallback gradient logo - hidden by default, shown only if image fails */}
            <div 
              className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg hidden items-center justify-center"
              style={{ display: 'none' }}
            >
              <BriefcaseIcon className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-700 to-purple-700 bg-clip-text text-transparent">
              TalentMatch AI
            </h1>
          </Link>

          {/* Navigation */}
          <nav className="hidden lg:flex items-center space-x-6">
            <a href="#features" className="text-gray-700 hover:text-indigo-600 font-medium transition text-sm">
              Features
            </a>
            <a href="#how-it-works" className="text-gray-700 hover:text-indigo-600 font-medium transition text-sm">
              How It Works
            </a>
            <a href="#testimonials" className="text-gray-700 hover:text-indigo-600 font-medium transition text-sm">
              Success Stories
            </a>
            <Link to="/about" className="text-gray-700 hover:text-indigo-600 font-medium transition text-sm">
              About
            </Link>
            {isAuthenticated() ? (
              <button
                onClick={goToDashboard}
                className="text-gray-700 hover:text-indigo-600 font-medium transition text-sm"
              >
                Dashboard
              </button>
            ) : (
              <Link to="/login" className="text-gray-700 hover:text-indigo-600 font-medium transition text-sm">
                Sign In
              </Link>
            )}
            <button
              onClick={handleGetStarted}
              className="px-4 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-indigo-200 transition-all flex items-center gap-1.5 text-sm"
            >
              Get Started
              <ArrowRightIcon className="w-3 h-3" />
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <button className="lg:hidden p-1.5 rounded-md bg-gray-100">
            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
            </svg>
          </button>
        </div>
      </header> 
  );
}

export default Header;