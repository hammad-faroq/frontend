import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BriefcaseIcon,
  ChartBarIcon,
  UserGroupIcon,
  RocketLaunchIcon,
  MagnifyingGlassIcon,
  CheckBadgeIcon,
  ArrowRightIcon,
  BuildingOfficeIcon,
  SparklesIcon,
  ShieldCheckIcon,
  ClockIcon,
  UserCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

function Home() {
  const navigate = useNavigate();
  const [role, setRole] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const userRole = localStorage.getItem("user_role");
    setRole(userRole);

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleGetStarted = () => {
    // if (role === "job_seeker") {
    //   navigate("/dashboard");
    // } else if (role === "hr") {
    //   navigate("/dashboard");
    // } else {
      navigate("/login");
    // }
  };

  const handleEmployerLogin = () => {
  if (isAuthenticated() && role === "hr") {
    navigate("/dashboard");
  } else {
    navigate("/login", { state: { role: "employer" } });
  }
};

  const handleLearnMore = (feature) => {
    setSelectedFeature(feature);
    setShowModal(true);
    document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedFeature(null);
    document.body.style.overflow = 'auto';
  };
  const isAuthenticated = () => {
    return !!localStorage.getItem("token");
  };
  const goToDashboard = () => {
  // if (isAuthenticated()) {
    navigate("/dashboard");
  // } else {
  //   navigate("/login");
  // }
};
  const features = [
    {
      icon: <SparklesIcon className="w-10 h-10" />,
      title: "AI-Powered Matching",
      description: "Advanced algorithms match candidates with perfect job opportunities.",
      color: "purple",
      details: "Our AI uses machine learning to analyze candidate profiles, job requirements, and company culture to find the perfect match. The system continuously learns from successful placements to improve accuracy.",
      benefits: [
        "95% match accuracy",
        "Reduces screening time by 80%",
        "Cultural fit analysis",
        "Skills gap identification"
      ]
    },
    {
      icon: <BriefcaseIcon className="w-10 h-10" />,
      title: "Smart Job Search",
      description: "Personalized job recommendations based on your skills and preferences.",
      color: "blue",
      details: "Get tailored job recommendations that match your skills, experience, and career goals. Our algorithm considers your preferences, location, salary expectations, and growth opportunities.",
      benefits: [
        "Personalized job feed",
        "Salary range matching",
        "Remote/onsite preferences",
        "Skill development suggestions"
      ]
    },
    {
      icon: <UserGroupIcon className="w-10 h-10" />,
      title: "Collaborative Hiring",
      description: "Multiple team members can review and shortlist candidates together.",
      color: "green",
      details: "Enable your entire hiring team to collaborate seamlessly. Share candidate profiles, leave feedback, vote on candidates, and make hiring decisions together in real-time.",
      benefits: [
        "Real-time collaboration",
        "Unified feedback system",
        "Candidate scoring",
        "Interview scheduling"
      ]
    },
    {
      icon: <ChartBarIcon className="w-10 h-10" />,
      title: "Real-Time Analytics",
      description: "Track hiring metrics and candidate engagement with detailed insights.",
      color: "orange",
      details: "Monitor your hiring pipeline with comprehensive dashboards and reports. Track key metrics like time-to-hire, cost-per-hire, candidate quality, and diversity statistics.",
      benefits: [
        "Live hiring dashboard",
        "Pipeline visualization",
        "Diversity reports",
        "Performance analytics"
      ]
    },
    {
      icon: <ShieldCheckIcon className="w-10 h-10" />,
      title: "Secure Platform",
      description: "Enterprise-grade security protecting your data and privacy.",
      color: "indigo",
      details: "Your data security is our top priority. We use bank-level encryption, comply with global data protection regulations, and ensure complete privacy for both candidates and employers.",
      benefits: [
        "GDPR & CCPA compliant",
        "End-to-end encryption",
        "Regular security audits",
        "Data anonymization"
      ]
    },
    {
      icon: <ClockIcon className="w-10 h-10" />,
      title: "Time Saving",
      description: "Reduce hiring time by 60% with automated screening and ranking.",
      color: "red",
      details: "Automate repetitive tasks like resume screening, initial assessments, and candidate ranking. Focus on interviewing the best candidates while our AI handles the screening process.",
      benefits: [
        "Automated resume parsing",
        "AI-powered screening",
        "Bulk candidate management",
        "Template responses"
      ]
    },
  ];

  const steps = [
    {
      icon: <UserCircleIcon className="w-8 h-8" />,
      step: "1. Create Profile",
      description: "Set up your profile with skills, experience, and preferences",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: <RocketLaunchIcon className="w-8 h-8" />,
      step: "2. AI Analysis",
      description: "Our AI analyzes your profile and matches with opportunities",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      icon: <MagnifyingGlassIcon className="w-8 h-8" />,
      step: "3. Smart Matching",
      description: "Receive personalized job matches based on your profile",
      gradient: "from-green-500 to-emerald-500",
    },
    {
      icon: <CheckBadgeIcon className="w-8 h-8" />,
      step: "4. Get Hired",
      description: "Connect with employers and land your dream job",
      gradient: "from-orange-500 to-red-500",
    },
  ];

  const testimonials = [
    {
      name: "Ali Khan",
      role: "HR Director, TechNova",
      text: "TalentMatch AI reduced our hiring time by 70%. The AI matching is incredibly accurate!",
      company: "TechNova",
      rating: 5,
    },
    {
      name: "Sarah Ahmed",
      role: "Software Engineer",
      text: "Found my dream job within 2 weeks! The platform understood exactly what I was looking for.",
      company: "Google",
      rating: 5,
    },
    {
      name: "Wajid Raza",
      role: "Recruitment Lead, FinSolve",
      text: "The collaborative features and analytics have transformed our hiring process completely.",
      company: "FinSolve",
      rating: 5,
    },
  ];

  // Modal Component
  const FeatureModal = () => {
    if (!selectedFeature) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${
                  selectedFeature.color === 'purple' ? 'from-purple-100 to-pink-100' : 
                  selectedFeature.color === 'blue' ? 'from-blue-100 to-cyan-100' :
                  selectedFeature.color === 'green' ? 'from-green-100 to-emerald-100' :
                  selectedFeature.color === 'orange' ? 'from-orange-100 to-red-100' :
                  selectedFeature.color === 'indigo' ? 'from-indigo-100 to-purple-100' :
                  'from-red-100 to-pink-100'
                } p-3`}>
                  <div className={`${
                    selectedFeature.color === 'purple' ? 'text-purple-600' : 
                    selectedFeature.color === 'blue' ? 'text-blue-600' :
                    selectedFeature.color === 'green' ? 'text-green-600' :
                    selectedFeature.color === 'orange' ? 'text-orange-600' :
                    selectedFeature.color === 'indigo' ? 'text-indigo-600' :
                    'text-red-600'
                  }`}>
                    {selectedFeature.icon}
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedFeature.title}</h2>
              </div>
              <button
                onClick={closeModal}
                className="p-2 rounded-lg hover:bg-gray-100 transition"
              >
                <XMarkIcon className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">Overview</h3>
                <p className="text-gray-600 leading-relaxed text-sm">{selectedFeature.details}</p>
              </div>
              
              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">Key Benefits</h3>
                <ul className="space-y-1.5">
                  {selectedFeature.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-center gap-3 text-gray-600 text-sm">
                      <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={handleGetStarted}
                    className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all text-sm"
                  >
                    Try It Now
                  </button>
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition text-sm"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Feature Modal */}
      {showModal && <FeatureModal />}


      {/* Hero Section */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-purple-50/30 to-pink-50/20"></div>
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white rounded-full shadow-sm mb-4">
              <SparklesIcon className="w-4 h-4 text-yellow-500" />
              <span className="text-xs font-medium text-gray-700">Trusted by 500+ companies</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
              Smarter Hiring,
              <span className="block bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Powered by AI
              </span>
            </h1>
            
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              Transform your hiring process with intelligent matching, real-time analytics, 
              and collaborative tools that connect the right talent with the right opportunities.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => navigate("/register")}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 text-sm"
              >
                Start Free Trial
                <ArrowRightIcon className="w-4 h-4" />
              </button>
              <button
                onClick={handleEmployerLogin}
                className="px-6 py-3 bg-white text-gray-700 font-semibold rounded-xl border-2 border-gray-200 hover:border-indigo-300 hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 text-sm"
              >
                <BuildingOfficeIcon className="w-4 h-4" />
                For Employers
              </button>
            </div>
            
            <p className="mt-4 text-xs text-gray-500">
              No credit card required • 14-day free trial
            </p>
          </div>
        </div>
      </section>

      {/* Trusted By */}
      <div className="py-6 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-gray-500 text-xs font-medium mb-4">Trusted by innovative companies</p>
          <div className="flex flex-wrap justify-center items-center gap-6 md:gap-8 opacity-60">
            {["TechNova", "FinSolve", "DataWorks", "CloudStack", "WebFlow", "AI Labs"].map((company) => (
              <div key={company} className="text-gray-700 font-semibold text-sm">
                {company}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section id="features" className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Everything You Need for
              <span className="block text-indigo-600">Modern Hiring</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Powerful features designed to streamline your hiring process and find perfect matches
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-lg hover:border-indigo-200 transition-all duration-300 cursor-pointer"
                onClick={() => handleLearnMore(feature)}
              >
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.color === 'purple' ? 'from-purple-100 to-pink-100' : 
                  feature.color === 'blue' ? 'from-blue-100 to-cyan-100' :
                  feature.color === 'green' ? 'from-green-100 to-emerald-100' :
                  feature.color === 'orange' ? 'from-orange-100 to-red-100' :
                  feature.color === 'indigo' ? 'from-indigo-100 to-purple-100' :
                  'from-red-100 to-pink-100'} p-2.5 mb-4 group-hover:scale-105 transition-transform duration-300`}
                >
                  <div className={`${feature.color === 'purple' ? 'text-purple-600' : 
                    feature.color === 'blue' ? 'text-blue-600' :
                    feature.color === 'green' ? 'text-green-600' :
                    feature.color === 'orange' ? 'text-orange-600' :
                    feature.color === 'indigo' ? 'text-indigo-600' :
                    'text-red-600'}`}
                  >
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{feature.description}</p>
                <div className="text-indigo-600 font-semibold flex items-center gap-1.5 group-hover:gap-2 transition-all text-sm">
                  Learn more
                  <ArrowRightIcon className="w-3 h-3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              How TalentMatch Works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Simple steps to find your perfect match or hire the best talent
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 h-full">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${step.gradient} p-2 mb-4`}>
                    <div className="text-white">
                      {step.icon}
                    </div>
                  </div>
                  <div className="text-xl font-bold text-gray-400 mb-1">0{index + 1}</div>
                  <h3 className="text-base font-bold text-gray-900 mb-2">{step.step}</h3>
                  <p className="text-gray-600 text-sm">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2">
                    <ArrowRightIcon className="w-6 h-6 text-gray-300" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Success Stories
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              See how companies and candidates are transforming their hiring journey
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="flex items-center gap-1.5 mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-700 text-sm italic mb-4 leading-relaxed">"{testimonial.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"></div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">{testimonial.name}</h4>
                    <p className="text-gray-600 text-xs">{testimonial.role}</p>
                    <p className="text-xs text-gray-500">{testimonial.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <div className="py-12 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <Stat number="500+" label="Companies" />
            <Stat number="50K+" label="Candidates" />
            <Stat number="10K+" label="Matches Made" />
            <Stat number="70%" label="Time Saved" />
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-8 text-center shadow-xl">
            <h2 className="text-3xl font-bold text-white mb-3">
              Ready to Transform Your Hiring?
            </h2>
            <p className="text-indigo-100 text-lg mb-6 max-w-2xl mx-auto">
              Join thousands of companies and candidates using TalentMatch AI to make smarter hiring decisions.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => navigate("/login")}
                className="px-6 py-3 bg-white text-indigo-600 font-bold rounded-lg hover:bg-gray-100 transition-all duration-300 hover:scale-105 shadow-md text-sm"
              >
                Start Free Trial
              </button>
              <button
                onClick={() => navigate("/demo")}
                className="px-6 py-3 bg-transparent border-2 border-white text-white font-bold rounded-lg hover:bg-white/10 transition-all duration-300 text-sm"
              >
                Request Demo
              </button>
            </div>
            <p className="mt-4 text-indigo-200 text-xs">
              No credit card required • 14-day free trial • Cancel anytime
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function Stat({ number, label }) {
  return (
    <div>
      <div className="text-3xl font-bold text-white mb-1">{number}</div>
      <div className="text-indigo-200 font-medium text-sm">{label}</div>
    </div>
  );
}

export default Home;