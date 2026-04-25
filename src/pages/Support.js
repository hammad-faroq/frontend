import React, { useState } from "react";
import {
  EnvelopeIcon,
  PhoneIcon,
  ChatBubbleLeftRightIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  LifebuoyIcon,
  ClockIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

  .support-wrap * { box-sizing: border-box; }
  .support-wrap { font-family: 'DM Sans', sans-serif; min-height: 100vh; background: #f5f6ff; color: #1e1b3a; }

  /* Hero */
  .support-hero {
    position: relative; overflow: hidden;
    background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 52%, #ede9fe 100%);
    padding: 40px 40px 56px; border-bottom: 1px solid #ddd6fe;
  }
  .support-blob { position: absolute; border-radius: 50%; filter: blur(80px); opacity: .2; pointer-events: none; }
  .support-blob--1 { width: 420px; height: 420px; background: radial-gradient(circle,#6366f1,transparent); top: -120px; left: -60px; animation: support-drift 12s ease-in-out infinite alternate; }
  .support-blob--2 { width: 260px; height: 260px; background: radial-gradient(circle,#10b981,transparent); bottom: -60px; right: 6%; animation: support-drift 16s ease-in-out infinite alternate-reverse; }
  @keyframes support-drift { 0%{transform:translate(0,0)} 100%{transform:translate(22px,12px)} }
  .support-grid-bg { position: absolute; inset: 0; pointer-events: none; background-image: linear-gradient(rgba(99,102,241,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,.06) 1px,transparent 1px); background-size: 40px 40px; }

  .support-hero-inner { position: relative; z-index: 1; max-width: 1100px; margin: 0 auto; }
  .support-hero-header { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
  .support-hero-icon { width: 40px; height: 40px; color: #4f46e5; }
  .support-hero-title { font-family: 'Syne', sans-serif; font-size: clamp(22px,3.5vw,34px); font-weight: 800; color: #1e1b3a; margin: 0; letter-spacing: -.3px; }
  .support-hero-sub { font-size: 15px; color: #6b7280; margin: 12px 0 20px; max-width: 600px; }

  /* Search */
  .support-search { position: relative; max-width: 640px; }
  .support-search svg { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); width: 18px; height: 18px; color: #9ca3af; }
  .support-search input { width: 100%; padding: 14px 18px 14px 46px; border: 1px solid #e0e7ff; border-radius: 12px; font-family: 'DM Sans',sans-serif; font-size: 14px; color: #1e1b3a; background: #fff; outline: none; transition: all .2s; box-shadow: 0 4px 16px rgba(99,102,241,.08); }
  .support-search input:focus { border-color: #a5b4fc; box-shadow: 0 6px 24px rgba(99,102,241,.12); }

  /* Main */
  .support-main { max-width: 1100px; margin: 0 auto; padding: 32px 40px 80px; display: grid; grid-template-columns: 2fr 1fr; gap: 24px; }

  /* Card */
  .support-card { background: #fff; border: 1px solid #e0e7ff; border-radius: 16px; padding: 24px; box-shadow: 0 4px 16px rgba(99,102,241,.06); }
  .support-card-title { font-family: 'Syne',sans-serif; font-size: 20px; font-weight: 700; color: #1e1b3a; margin: 0 0 20px; }

  /* FAQ */
  .support-faq-item { border: 1px solid #e8eaf6; border-radius: 12px; overflow: hidden; margin-bottom: 12px; transition: all .2s; }
  .support-faq-item:hover { border-color: #c7d2fe; }
  .support-faq-btn { width: 100%; display: flex; justify-content: space-between; align-items: center; padding: 16px 18px; text-align: left; background: none; border: none; cursor: pointer; font-family: 'DM Sans',sans-serif; font-size: 14px; font-weight: 600; color: #1e1b3a; transition: all .2s; }
  .support-faq-btn:hover { background: #f9fafb; }
  .support-faq-icon { width: 18px; height: 18px; color: #9ca3af; transition: transform .2s; flex-shrink: 0; margin-left: 12px; }
  .support-faq-icon.open { transform: rotate(180deg); }
  .support-faq-answer { padding: 0 18px 16px; font-size: 13px; color: #6b7280; line-height: 1.7; }

  /* Topics Grid */
  .support-topics { display: grid; grid-template-columns: repeat(2,1fr); gap: 12px; }
  .support-topic { padding: 14px 16px; border: 1px solid #e8eaf6; border-radius: 12px; font-size: 13px; font-weight: 600; color: #4f46e5; cursor: pointer; transition: all .2s; background: #fff; }
  .support-topic:hover { border-color: #c7d2fe; background: #eef2ff; transform: translateY(-1px); }

  /* Contact */
  .support-contact-item { display: flex; gap: 12px; align-items: flex-start; padding: 14px 0; }
  .support-contact-item:not(:last-child) { border-bottom: 1px solid #f3f4f6; }
  .support-contact-icon { width: 20px; height: 20px; margin-top: 2px; flex-shrink: 0; }
  .support-contact-label { font-size: 13px; font-weight: 600; color: #1e1b3a; margin: 0 0 2px; }
  .support-contact-value { font-size: 13px; color: #6b7280; }

  /* Hours Card */
  .support-hours { display: flex; gap: 12px; align-items: flex-start; }
  .support-hours svg { width: 20px; height: 20px; color: #f59e0b; flex-shrink: 0; }
  .support-hours-title { font-size: 14px; font-weight: 700; color: #1e1b3a; margin: 0 0 4px; }
  .support-hours-text { font-size: 13px; color: #6b7280; line-height: 1.6; }

  /* CTA Card */
  .support-cta { background: linear-gradient(135deg, #4f46e5, #7c3aed); color: #fff; border: none; }
  .support-cta-header { display: flex; gap: 12px; align-items: center; margin-bottom: 12px; }
  .support-cta-header svg { width: 24px; height: 24px; }
  .support-cta-title { font-size: 16px; font-weight: 700; margin: 0; }
  .support-cta-text { font-size: 13px; color: rgba(255,255,255,.9); line-height: 1.6; margin-bottom: 16px; }
  .support-cta-btn { width: 100%; padding: 10px 18px; background: #fff; color: #4f46e5; border: none; border-radius: 10px; font-family: 'DM Sans',sans-serif; font-size: 13px; font-weight: 700; cursor: pointer; transition: all .2s; }
  .support-cta-btn:hover { background: #f9fafb; transform: translateY(-1px); }

  /* Sidebar */
  .support-sidebar { display: flex; flex-direction: column; gap: 20px; }

  @media(max-width:900px){ .support-main{grid-template-columns:1fr; gap:20px} .support-topics{grid-template-columns:1fr} }
  @media(max-width:640px){ .support-hero{padding:28px 16px 44px} .support-main{padding:28px 16px 60px} }
`;

export default function Support() {
  const [search, setSearch] = useState("");
  const [openFAQ, setOpenFAQ] = useState(0);

  const faqs = [
    {
      question: "How do I contact support?",
      answer:
        "You can email us anytime at support@talentmatch.ai or use live chat during support hours.",
    },
    {
      question: "What are your support hours?",
      answer:
        "Our support team is available Monday to Friday from 9:00 AM to 6:00 PM.",
    },
    {
      question: "How quickly do you respond?",
      answer:
        "Most email requests receive a reply within 1–3 business hours.",
    },
    {
      question: "Can I report a technical issue?",
      answer:
        "Yes. Please send screenshots, steps to reproduce, and your browser/device details.",
    },
    {
      question: "Do you provide job application help?",
      answer:
        "Yes. We can guide you with profile setup, resume upload, and platform usage.",
    },
  ];

  const filteredFAQs = faqs.filter((faq) =>
    faq.question.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="support-wrap">
      <style>{styles}</style>

      {/* Hero Section */}
      <div className="support-hero">
        <div className="support-blob support-blob--1"/>
        <div className="support-blob support-blob--2"/>
        <div className="support-grid-bg"/>
        
        <div className="support-hero-inner">
          <div className="support-hero-header">
            <LifebuoyIcon className="support-hero-icon" />
            <h1 className="support-hero-title">Support Center</h1>
          </div>
          <p className="support-hero-sub">
            Need help with TalentMatch AI? We're here to assist you with
            technical issues, account support, and platform guidance.
          </p>

          {/* Search */}
          <div className="support-search">
            <MagnifyingGlassIcon />
            <input
              type="text"
              placeholder="Search support topics..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="support-main">
        {/* Left Column */}
        <div>
          {/* FAQ Section */}
          <div className="support-card" style={{marginBottom: 24}}>
            <h2 className="support-card-title">Frequently Asked Questions</h2>

            <div>
              {filteredFAQs.map((faq, index) => (
                <div key={index} className="support-faq-item">
                  <button
                    onClick={() =>
                      setOpenFAQ(openFAQ === index ? null : index)
                    }
                    className="support-faq-btn"
                  >
                    <span>{faq.question}</span>
                    <ChevronDownIcon
                      className={`support-faq-icon ${openFAQ === index ? 'open' : ''}`}
                    />
                  </button>

                  {openFAQ === index && (
                    <div className="support-faq-answer">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Help Categories */}
          <div className="support-card">
            <h2 className="support-card-title">Popular Support Topics</h2>

            <div className="support-topics">
              {[
                "Account & Login Help",
                "Resume Upload Issues",
                "Job Applications",
                "Interview Scheduling",
                "Dashboard Problems",
                "Notifications & Alerts",
              ].map((item, index) => (
                <div key={index} className="support-topic">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="support-sidebar">
          {/* Contact Card */}
          <div className="support-card">
            <h2 className="support-card-title">Contact Us</h2>

            <div>
              <div className="support-contact-item">
                <EnvelopeIcon className="support-contact-icon" style={{color: '#4f46e5'}} />
                <div>
                  <p className="support-contact-label">Email</p>
                  <p className="support-contact-value">
                    support@talentmatch.ai
                  </p>
                </div>
              </div>

              <div className="support-contact-item">
                <PhoneIcon className="support-contact-icon" style={{color: '#16a34a'}} />
                <div>
                  <p className="support-contact-label">Phone</p>
                  <p className="support-contact-value">
                    +1 (800) 555-0199
                  </p>
                </div>
              </div>

              <div className="support-contact-item">
                <ChatBubbleLeftRightIcon className="support-contact-icon" style={{color: '#7c3aed'}} />
                <div>
                  <p className="support-contact-label">Live Chat</p>
                  <p className="support-contact-value">
                    Monday – Friday
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Hours Card */}
          <div className="support-card">
            <div className="support-hours">
              <ClockIcon />
              <div>
                <h3 className="support-hours-title">Support Hours</h3>
                <p className="support-hours-text">
                  Monday – Friday<br />
                  9:00 AM – 6:00 PM
                </p>
              </div>
            </div>
          </div>

          {/* CTA Card */}
          <div className="support-card support-cta">
            <div className="support-cta-header">
              <GlobeAltIcon />
              <h3 className="support-cta-title">Need Urgent Help?</h3>
            </div>

            <p className="support-cta-text">
              Our team typically responds within 1 hour during business time.
            </p>

            <button className="support-cta-btn">
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}