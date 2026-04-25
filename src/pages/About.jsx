import React from "react";
import { Link } from "react-router-dom";
import {
  BriefcaseIcon,
  SparklesIcon,
  UsersIcon,
  LightBulbIcon,
  ScaleIcon,
  HeartIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";

export default function About() {
  // Leadership team data with image paths - 4 leaders only
  const leadershipTeam = [
    {
      name: "Ali Haider",
      role: "CEO & Founder",
      image: "/media/team/ali-haider.jpg",
      bio: "Former HR Director with 15+ years in talent acquisition. Founded TalentMatch AI to solve hiring inefficiencies.",
      linkedin: "https://www.linkedin.com/in/mian-ali-haider/",
      twitter: "https://twitter.com",
    },
    {
      name: "Hammad Farooq",
      role: "CTO",
      image: "/media/team/hammad-farooq.jpg",
      bio: "AI/ML expert with Masters in Data Science. Built the core matching algorithm.",
      linkedin: "https://www.linkedin.com/in/hammad-farooq13/",
      twitter: "https://x.com/Hammad_farooq13",
    },
    {
      name: "Wajid Ali",
      role: "Head of AI Research",
      image: "/media/team/wajid-ali.jpg",
      bio: "Lead researcher focusing on bias reduction and predictive analytics.",
      linkedin: "https://www.linkedin.com/in/wajid-ali-analytics/",
      twitter: "https://twitter.com",
    },
    {
      name: "Abdul Munaf",
      role: "Chief Product Officer",
      image: "/media/team/abdul-munaf.jpg",
      bio: "Product leader with experience at multiple tech unicorns. Focuses on user experience.",
      linkedin: "https://linkedin.com",
      twitter: "https://twitter.com",
    },
  ];

  const coreValues = [
    {
      icon: <LightBulbIcon className="w-10 h-10" />,
      title: "Innovation",
      description: "Pushing the boundaries of AI to create smarter hiring solutions that adapt and learn.",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: <ScaleIcon className="w-10 h-10" />,
      title: "Integrity",
      description: "Ensuring fairness, transparency, and ethical AI in every match we make.",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: <UsersIcon className="w-10 h-10" />,
      title: "Collaboration",
      description: "Working hand-in-hand with companies and candidates to achieve mutual success.",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: <HeartIcon className="w-10 h-10" />,
      title: "Empathy",
      description: "Understanding the human element in hiring and creating experiences that care.",
      color: "from-red-500 to-pink-500",
    },
  ];

  const milestones = [
    { year: "2025", event: "Company Founded", description: "Launched with vision to transform hiring" },
    { year: "2026", event: "AI Platform Launch", description: "Released first version of matching algorithm" },
    { year: "2027", event: "Series A Funding", description: "Raised $10M to expand team and features" },
    { year: "2028", event: "Global Expansion", description: "Expanded to 10+ countries worldwide" },
    { year: "Present", event: "Industry Leader", description: "Serving 500+ companies globally" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* ---------- Header ---------- */}
      <header className="fixed top-0 left-0 w-full bg-white/90 backdrop-blur-md shadow-sm z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 h-16">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
              <BriefcaseIcon className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-700 to-purple-700 bg-clip-text text-transparent">
              TalentMatch AI
            </h1>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-indigo-600 font-medium transition text-sm">
              Home
            </Link>
            <a href="#mission" className="text-gray-700 hover:text-indigo-600 font-medium transition text-sm">
              Mission
            </a>
            <a href="#team" className="text-gray-700 hover:text-indigo-600 font-medium transition text-sm">
              Team
            </a>
            <Link to="/contact" className="text-gray-700 hover:text-indigo-600 font-medium transition text-sm">
              Contact
            </Link>
            <Link to="/login" className="text-gray-700 hover:text-indigo-600 font-medium transition text-sm">
              Login
            </Link>
            <Link
              to="/register"
              className="px-4 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-indigo-200 transition-all flex items-center gap-1.5 text-sm"
            >
              Get Started
              <ArrowRightIcon className="w-3 h-3" />
            </Link>
          </nav>
        </div>
      </header>

      {/* ---------- Hero ---------- */}
      <section className="pt-24 pb-16 relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white rounded-full shadow-sm mb-6">
              <SparklesIcon className="w-4 h-4 text-yellow-500" />
              <span className="text-xs font-medium text-gray-700">Transforming Hiring Since 2025</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
              About
              <span className="block bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                TalentMatch AI
              </span>
            </h1>
            <p className="text-lg text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              We're revolutionizing the way companies find talent and candidates find opportunities. 
              Our AI-powered platform makes hiring smarter, faster, and more human.
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                to="/register"
                className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 text-sm"
              >
                Join Us Today
              </Link>
              <a
                href="#mission"
                className="px-6 py-2.5 bg-white text-gray-700 font-semibold rounded-xl border-2 border-gray-200 hover:border-indigo-300 hover:shadow-lg transition-all duration-300 text-sm"
              >
                Learn More
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Mission & Story ---------- */}
      <section id="mission" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Our <span className="text-indigo-600">Mission</span>
              </h2>
              <p className="text-base text-gray-600 mb-4 leading-relaxed">
                At TalentMatch AI, we believe that finding the right talent shouldn't be 
                a game of chance. We're on a mission to eliminate hiring friction and 
                build meaningful connections between exceptional talent and forward-thinking companies.
              </p>
              <p className="text-base text-gray-600 mb-6 leading-relaxed">
                Through cutting-edge AI and machine learning, we're creating a future 
                where every hire is the right hire, every opportunity is the perfect 
                fit, and the hiring process is as human as the connections it creates.
              </p>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center">
                  <BriefcaseIcon className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <div className="text-xl font-bold text-gray-900">500+</div>
                  <div className="text-gray-600 text-sm">Companies Trust Us</div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-2xl">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Our Story</h3>
              <p className="text-gray-600 mb-4 text-sm">
                Founded in 2025 by a team of HR veterans and AI engineers frustrated 
                with the broken hiring process, TalentMatch AI started as a simple idea: 
                what if technology could understand both candidates and companies 
                as well as a human would?
              </p>
              <p className="text-gray-600 text-sm">
                Today, we power hiring decisions for startups and Fortune 500 
                companies alike, helping them find not just qualified candidates, 
                but perfect matches that drive business success and create 
                lasting workplace satisfaction.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Core Values ---------- */}
      <section className="py-16 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Our <span className="text-indigo-600">Core Values</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {coreValues.map((value, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-lg hover:border-indigo-200 transition-all duration-300 group"
              >
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${value.color} p-2.5 mb-4 group-hover:scale-105 transition-transform duration-300`}>
                  <div className="text-white">
                    {value.icon}
                  </div>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{value.title}</h3>
                <p className="text-gray-600 text-sm">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Milestones Timeline ---------- */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Our <span className="text-indigo-600">Journey</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Key milestones in our mission to transform hiring
            </p>
          </div>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-indigo-500 to-purple-500"></div>
            
            <div className="space-y-10">
              {milestones.map((milestone, index) => (
                <div key={index} className={`relative flex items-center ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                  <div className={`w-1/2 ${index % 2 === 0 ? 'pr-10 text-right' : 'pl-10'}`}>
                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
                      <div className="text-xs font-semibold text-indigo-600 mb-1">{milestone.year}</div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">{milestone.event}</h3>
                      <p className="text-gray-600 text-sm">{milestone.description}</p>
                    </div>
                  </div>
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-5 h-5 bg-indigo-600 rounded-full border-3 border-white shadow-md"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Meet the Team ---------- */}
      <section id="team" className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Meet Our <span className="text-indigo-600">Leadership</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              The passionate team behind TalentMatch AI's vision
            </p>
          </div>
          
          {/* 4 leaders in one line */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {leadershipTeam.map((member, index) => (
              <div
                key={index}
                className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 group overflow-hidden"
              >
                {/* Team Member Image */}
                <div className="h-48 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=6366f1&color=ffffff&size=256`;
                    }}
                  />
                </div>
                
                {/* Team Member Info */}
                <div className="p-5">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{member.name}</h3>
                  <div className="text-indigo-600 font-semibold text-sm mb-3">{member.role}</div>
                  <p className="text-gray-600 text-sm mb-4">{member.bio}</p>
                  
                  {/* Social Links */}
                  <div className="flex gap-2">
                    <a
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 rounded-md bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-indigo-100 hover:text-indigo-600 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                    </a>
                    <a
                      href={member.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 rounded-md bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-blue-100 hover:text-blue-600 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.213c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Technology Stack ---------- */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Our <span className="text-indigo-600">Technology</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Powered by cutting-edge AI and machine learning
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <TechCard 
              title="Advanced Matching Algorithm"
              description="Proprietary AI that analyzes 200+ data points to find perfect matches"
              icon="🤖"
            />
            <TechCard 
              title="Bias Detection & Reduction"
              description="Ethical AI that identifies and mitigates unconscious bias in hiring"
              icon="⚖️"
            />
            <TechCard 
              title="Predictive Analytics"
              description="ML models that predict candidate success and retention rates"
              icon="📊"
            />
          </div>
        </div>
      </section>

      {/* ---------- Call to Action ---------- */}
      <section className="py-16 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Transform Your Hiring?
          </h2>
          <p className="text-lg text-indigo-100 mb-8 max-w-2xl mx-auto">
            Join 500+ companies already using TalentMatch AI to make smarter hiring decisions.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/register"
              className="px-6 py-3 bg-white text-indigo-600 font-bold rounded-lg hover:bg-gray-100 transition-all duration-300 hover:scale-105 shadow-md text-sm"
            >
              Start Free Trial
            </Link>
            <Link
              to="/contact"
              className="px-6 py-3 bg-transparent border-2 border-white text-white font-bold rounded-lg hover:bg-white/10 transition-all duration-300 text-sm"
            >
              Contact Sales
            </Link>
          </div>
          <p className="mt-6 text-indigo-200 text-xs">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>
      </section>

      <footer className="bg-gray-900 text-white py-10">
              <div className="max-w-7xl mx-auto px-6">
                <div className="grid md:grid-cols-4 gap-6 mb-8">
                  <div>
                    <div className="flex items-center space-x-2 mb-4">
                      <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                        <BriefcaseIcon className="w-4 h-4" />
                      </div>
                      <h3 className="text-xl font-bold">TalentMatch AI</h3>
                    </div>
                    <p className="text-gray-400 text-sm">
                      Transforming hiring with artificial intelligence and smart matching.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-base font-semibold mb-3">Product</h4>
                    <ul className="space-y-1.5 text-gray-400 text-sm">
                      <li><a href="#mission" className="hover:text-white transition">Mission</a></li>
                      <li><a href="#team" className="hover:text-white transition">Our Team</a></li>
                      <li><Link to="/pricing" className="hover:text-white transition">Pricing</Link></li>
                      <li><Link to="/demo" className="hover:text-white transition">Demo</Link></li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="text-base font-semibold mb-3">Company</h4>
                    <ul className="space-y-1.5 text-gray-400 text-sm">
                      <li><Link to="/about" className="hover:text-white transition">About Us</Link></li>
                      <li><Link to="/careers" className="hover:text-white transition">Careers</Link></li>
                      <li><Link to="/blog" className="hover:text-white transition">Blog</Link></li>
                      <li><Link to="/contact" className="hover:text-white transition">Contact</Link></li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="text-base font-semibold mb-3">Legal</h4>
                    <ul className="space-y-1.5 text-gray-400 text-sm">
                      <li><Link to="/privacy" className="hover:text-white transition">Privacy Policy</Link></li>
                      <li><Link to="/terms" className="hover:text-white transition">Terms of Service</Link></li>
                      <li><Link to="/cookies" className="hover:text-white transition">Cookie Policy</Link></li>
                      <li><Link to="/security" className="hover:text-white transition">Security</Link></li>
                    </ul>
                  </div>
                </div>
                
                <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row justify-between items-center">
                  <p className="text-gray-400 text-xs mb-3 md:mb-0">
                    © {new Date().getFullYear()} TalentMatch AI. All rights reserved.
                  </p>
                  <div className="flex space-x-4 text-sm">
              <a href="https://x.com/Hammad_farooq13" className="text-gray-400 hover:text-white transition">Twitter</a>
              <a href="https://www.linkedin.com/in/hammad-farooq13/" className="text-gray-400 hover:text-white transition">LinkedIn</a>
              <a href="https://github.com/hammad-faroq" className="text-gray-400 hover:text-white transition">GitHub</a>
              <a href="https://www.youtube.com/@TalentMatchAI" className="text-gray-400 hover:text-white transition">YouTube</a>
            </div>
                </div>
              </div>
            </footer>
    </div>
  );
}

/* ---------- Reusable Components ---------- */
function TechCard({ title, description, icon }) {
  return (
    <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border border-gray-200 hover:border-indigo-200 transition-all duration-300">
      <div className="text-3xl mb-4">{icon}</div>
      <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
}