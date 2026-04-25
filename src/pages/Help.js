import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  QuestionMarkCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
  ChatBubbleLeftRightIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

  .hlp-wrap * { box-sizing: border-box; }
  .hlp-wrap { font-family: 'DM Sans', sans-serif; min-height: 100vh; background: #f5f6ff; color: #1e1b3a; }

  /* Hero */
  .hlp-hero {
    position: relative; overflow: hidden;
    background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 52%, #ede9fe 100%);
    padding: 48px 40px 72px; border-bottom: 1px solid #ddd6fe;
  }
  .hlp-blob { position: absolute; border-radius: 50%; filter: blur(80px); opacity: .2; pointer-events: none; }
  .hlp-blob--1 { width: 420px; height: 420px; background: radial-gradient(circle,#6366f1,transparent); top: -120px; left: -60px; animation: hlp-drift 12s ease-in-out infinite alternate; }
  .hlp-blob--2 { width: 280px; height: 280px; background: radial-gradient(circle,#10b981,transparent); bottom: -80px; right: 6%; animation: hlp-drift 16s ease-in-out infinite alternate-reverse; }
  @keyframes hlp-drift { 0%{transform:translate(0,0)} 100%{transform:translate(22px,12px)} }
  .hlp-grid-bg { position: absolute; inset: 0; pointer-events: none; background-image: linear-gradient(rgba(99,102,241,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,.06) 1px,transparent 1px); background-size: 40px 40px; }
  .hlp-hero-inner { position: relative; z-index: 1; max-width: 1100px; margin: 0 auto; }
  .hlp-badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(99,102,241,.12); border: 1px solid rgba(99,102,241,.3); color: #4f46e5; padding: 5px 14px; border-radius: 100px; font-size: 11px; font-weight: 700; letter-spacing: .6px; text-transform: uppercase; margin-bottom: 12px; }
  .hlp-badge-dot { width: 7px; height: 7px; border-radius: 50%; background: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,.2); animation: hlp-pulse 2s infinite; }
  @keyframes hlp-pulse { 0%,100%{box-shadow:0 0 0 3px rgba(99,102,241,.2)} 50%{box-shadow:0 0 0 6px rgba(99,102,241,.06)} }
  .hlp-hero-title { font-family: 'Syne', sans-serif; font-size: clamp(24px,3.5vw,38px); font-weight: 800; color: #1e1b3a; margin: 0 0 10px; letter-spacing: -.3px; }
  .hlp-hero-title span { background: linear-gradient(90deg,#4f46e5,#7c3aed); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
  .hlp-hero-sub { font-size: 15px; color: #6b7280; margin: 0 0 24px; }

  /* Search bar */
  .hlp-search-wrap { background: #fff; border: 1px solid #e0e7ff; border-radius: 14px; display: flex; align-items: center; gap: 10px; padding: 12px 18px; max-width: 560px; box-shadow: 0 8px 32px rgba(99,102,241,.1); }
  .hlp-search-icon { width: 18px; height: 18px; color: #6366f1; flex-shrink: 0; }
  .hlp-search-input { flex: 1; border: none; outline: none; font-family: 'DM Sans',sans-serif; font-size: 14px; color: #1e1b3a; background: transparent; }
  .hlp-search-input::placeholder { color: #9ca3af; }

  /* Main layout */
  .hlp-main { max-width: 1100px; margin: 0 auto; padding: 32px 40px 80px; display: grid; grid-template-columns: 1fr 300px; gap: 24px; }

  /* Cards */
  .hlp-card { background: #fff; border: 1px solid #e8eaf6; border-radius: 16px; padding: 24px; margin-bottom: 20px; transition: box-shadow .2s, border-color .2s; animation: hlp-in .4s ease both; }
  .hlp-card:hover { box-shadow: 0 8px 32px rgba(99,102,241,.08); border-color: #c7d2fe; }
  .hlp-card:last-child { margin-bottom: 0; }
  @keyframes hlp-in { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  .hlp-card-title { font-family: 'Syne',sans-serif; font-size: 20px; font-weight: 700; color: #1e1b3a; margin: 0 0 20px; display: flex; align-items: center; gap: 8px; }
  .hlp-card-title svg { width: 22px; height: 22px; color: #6366f1; }

  /* FAQ */
  .hlp-faq-item { border: 1px solid #e8eaf6; border-radius: 12px; overflow: hidden; margin-bottom: 10px; transition: border-color .2s; }
  .hlp-faq-item:hover { border-color: #c7d2fe; }
  .hlp-faq-btn { width: 100%; display: flex; justify-content: space-between; align-items: center; padding: 14px 18px; background: none; border: none; cursor: pointer; font-family: 'DM Sans',sans-serif; font-size: 14px; font-weight: 600; color: #1e1b3a; text-align: left; transition: background .15s; gap: 12px; }
  .hlp-faq-btn:hover { background: #f5f6ff; }
  .hlp-faq-chevron { width: 18px; height: 18px; color: #6366f1; flex-shrink: 0; transition: transform .25s; }
  .hlp-faq-chevron--open { transform: rotate(180deg); }
  .hlp-faq-answer { padding: 0 18px 14px; font-size: 13.5px; color: #6b7280; line-height: 1.7; border-top: 1px solid #f3f4f6; margin-top: 0; }

  /* Guide cards */
  .hlp-guides-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .hlp-guide-card { border: 1px solid #e8eaf6; border-radius: 12px; padding: 16px; transition: all .2s; cursor: pointer; }
  .hlp-guide-card:hover { border-color: #c7d2fe; background: #f5f6ff; transform: translateY(-2px); box-shadow: 0 6px 20px rgba(99,102,241,.08); }
  .hlp-guide-title { font-family: 'Syne',sans-serif; font-size: 14px; font-weight: 700; color: #4f46e5; margin: 0 0 6px; }
  .hlp-guide-sub { font-size: 12.5px; color: #6b7280; margin: 0; }

  /* Right column cards */
  .hlp-contact-row { display: flex; gap: 12px; margin-bottom: 14px; }
  .hlp-contact-icon { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .hlp-contact-label { font-size: 14px; font-weight: 600; color: #1e1b3a; margin: 0 0 2px; }
  .hlp-contact-val { font-size: 13px; color: #6b7280; margin: 0; }

  /* Buttons */
  .hlp-btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 10px 20px; border-radius: 10px; font-size: 13px; font-weight: 600; cursor: pointer; border: none; transition: all .2s; font-family: 'DM Sans',sans-serif; width: 100%; }
  .hlp-btn--primary { background: linear-gradient(135deg,#4f46e5,#7c3aed); color: #fff; box-shadow: 0 4px 14px rgba(79,70,229,.2); margin-bottom: 20px; }
  .hlp-btn--primary:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(79,70,229,.3); }

  /* Promo card */
  .hlp-promo { background: linear-gradient(135deg,#4f46e5,#7c3aed); border-radius: 16px; padding: 22px; color: #fff; margin-bottom: 20px; }
  .hlp-promo h3 { font-family: 'Syne',sans-serif; font-weight: 700; font-size: 17px; margin: 0 0 8px; }
  .hlp-promo p { color: rgba(255,255,255,.8); font-size: 13px; margin: 0 0 16px; }
  .hlp-promo-btn { width: 100%; background: #fff; color: #4f46e5; border: none; border-radius: 10px; padding: 10px; font-weight: 600; font-size: 13px; cursor: pointer; font-family: 'DM Sans',sans-serif; transition: background .2s; }
  .hlp-promo-btn:hover { background: #eef2ff; }

  /* Useful links */
  .hlp-link-btn { display: block; width: 100%; text-align: left; background: none; border: none; color: #4f46e5; font-size: 13.5px; font-weight: 600; font-family: 'DM Sans',sans-serif; cursor: pointer; padding: 8px 0; border-bottom: 1px solid #f3f4f6; transition: color .15s; }
  .hlp-link-btn:last-child { border-bottom: none; }
  .hlp-link-btn:hover { color: #7c3aed; text-decoration: underline; }

  @media(max-width:900px){ .hlp-main{grid-template-columns:1fr} .hlp-guides-grid{grid-template-columns:1fr} }
  @media(max-width:640px){ .hlp-hero{padding:32px 16px 60px} .hlp-main{padding:24px 16px 60px} }
`;

function Help() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [openFAQ, setOpenFAQ] = useState(0);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const faqs = [
    { question: "🔐 How do I reset my password?", answer: 'Go to the login page and click "Forgot Password?". Follow the instructions sent to your registered email.' },
    { question: "📄 How can I update my resume?", answer: 'Visit the Profile page and upload your latest resume under the "CV Upload" section.' },
    { question: "💼 How do I apply for a job?", answer: 'Open any job listing, review the details, and click "Apply Now" to submit your application.' },
    { question: "📊 Where can I see my dashboard stats?", answer: "Visit your Dashboard page to view applications, interviews, matches, and activity." },
    { question: "🧑‍💻 I found a bug. How do I report it?", answer: "Please email our support team at support@talentmatch.ai with screenshots and details." },
    { question: "🔔 Why am I not receiving notifications?", answer: "Please check notification settings in your profile and verify your email." },
  ];

  const filteredFAQs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="hlp-wrap">
      <style>{styles}</style>

      {/* Hero */}
      <div className="hlp-hero">
        <div className="hlp-blob hlp-blob--1"/><div className="hlp-blob hlp-blob--2"/><div className="hlp-grid-bg"/>
        <div className="hlp-hero-inner">
          <div className="hlp-badge"><span className="hlp-badge-dot"/>Support Center</div>
          <h1 className="hlp-hero-title">Help & <span>Support</span></h1>
          <p className="hlp-hero-sub">Find answers, guides, and support for TalentMatch AI.</p>
          <div className="hlp-search-wrap">
            <MagnifyingGlassIcon className="hlp-search-icon"/>
            <input
              className="hlp-search-input"
              type="text"
              placeholder="Search help topics..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="hlp-main">
        {/* Left column */}
        <div>
          {/* FAQ */}
          <div className="hlp-card">
            <h2 className="hlp-card-title">
              <QuestionMarkCircleIcon/>
              Frequently Asked Questions
            </h2>
            {filteredFAQs.length === 0 ? (
              <p style={{color:"#9ca3af",fontSize:14}}>No results for "{search}"</p>
            ) : (
              filteredFAQs.map((faq, index) => (
                <div key={index} className="hlp-faq-item">
                  <button
                    className="hlp-faq-btn"
                    onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                  >
                    <span>{faq.question}</span>
                    <ChevronDownIcon className={`hlp-faq-chevron${openFAQ === index ? " hlp-faq-chevron--open" : ""}`}/>
                  </button>
                  {openFAQ === index && (
                    <div className="hlp-faq-answer">{faq.answer}</div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Guides */}
          <div className="hlp-card">
            <h2 className="hlp-card-title">Quick Guides</h2>
            <div className="hlp-guides-grid">
              {[
                { title: "Resume Upload Guide", sub: "Learn how to upload your CV for job matching." },
                { title: "Job Application Guide", sub: "Step-by-step process for applying to jobs." },
                { title: "Dashboard Overview", sub: "Understand stats, interviews, and activity." },
                { title: "Profile Setup", sub: "Complete your profile to improve job matches." },
              ].map((g, i) => (
                <div key={i} className="hlp-guide-card">
                  <p className="hlp-guide-title">{g.title}</p>
                  <p className="hlp-guide-sub">{g.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div>
          {/* Contact card */}
          <div className="hlp-card">
            <h3 style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:17,color:"#1e1b3a",margin:"0 0 16px"}}>Contact Us</h3>
            <div className="hlp-contact-row">
              <div className="hlp-contact-icon" style={{background:"#eef2ff"}}>
                <EnvelopeIcon style={{width:18,height:18,color:"#6366f1"}}/>
              </div>
              <div>
                <p className="hlp-contact-label">Email</p>
                <p className="hlp-contact-val">support@talentmatch.ai</p>
              </div>
            </div>
            <div className="hlp-contact-row">
              <div className="hlp-contact-icon" style={{background:"#f0fdf4"}}>
                <PhoneIcon style={{width:18,height:18,color:"#16a34a"}}/>
              </div>
              <div>
                <p className="hlp-contact-label">Phone</p>
                <p className="hlp-contact-val">+1 (800) 555-0199</p>
              </div>
            </div>
            <div className="hlp-contact-row">
              <div className="hlp-contact-icon" style={{background:"#f5f3ff"}}>
                <ChatBubbleLeftRightIcon style={{width:18,height:18,color:"#7c3aed"}}/>
              </div>
              <div>
                <p className="hlp-contact-label">Live Chat</p>
                <p className="hlp-contact-val">Mon – Fri | 9 AM – 6 PM</p>
              </div>
            </div>
            <button className="hlp-btn hlp-btn--primary" onClick={() => navigate("/support")}>
              Contact Support
            </button>
          </div>

          {/* Immediate help promo */}
          <div className="hlp-promo">
            <h3>Need Immediate Help?</h3>
            <p>Our support team usually replies within 1 hour.</p>
            <button className="hlp-promo-btn" onClick={() => navigate("/support")}>
              Contact Support
            </button>
          </div>

          {/* Useful links */}
          <div className="hlp-card">
            <h3 style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:17,color:"#1e1b3a",margin:"0 0 14px"}}>Useful Links</h3>
            <button className="hlp-link-btn" onClick={() => navigate("/profile")}>→ Profile Settings</button>
            <button className="hlp-link-btn" onClick={() => navigate("/jobs")}>→ Browse Jobs</button>
            <button className="hlp-link-btn" onClick={() => navigate("/dashboard")}>→ Dashboard</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Help;