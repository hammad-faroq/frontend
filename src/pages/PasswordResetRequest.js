import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { requestPasswordReset } from "../services/api";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

  .prr-wrap * { box-sizing: border-box; }
  .prr-wrap { font-family: 'DM Sans', sans-serif; min-height: 100vh; background: #f5f6ff; color: #1e1b3a; display: flex; align-items: center; justify-content: center; padding: 40px 16px; position: relative; overflow: hidden; }

  .prr-blob { position: fixed; border-radius: 50%; filter: blur(100px); opacity: .15; pointer-events: none; z-index: 0; }
  .prr-blob--1 { width: 500px; height: 500px; background: radial-gradient(circle,#6366f1,transparent); top: -160px; left: -100px; animation: prr-drift 14s ease-in-out infinite alternate; }
  .prr-blob--2 { width: 380px; height: 380px; background: radial-gradient(circle,#10b981,transparent); bottom: -100px; right: -60px; animation: prr-drift 18s ease-in-out infinite alternate-reverse; }
  @keyframes prr-drift { 0%{transform:translate(0,0)} 100%{transform:translate(20px,14px)} }
  .prr-grid-bg { position: fixed; inset: 0; pointer-events: none; z-index: 0; background-image: linear-gradient(rgba(99,102,241,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,.05) 1px,transparent 1px); background-size: 40px 40px; }

  .prr-card { position: relative; z-index: 1; background: #fff; border: 1px solid #e8eaf6; border-radius: 20px; padding: 40px 36px; width: 100%; max-width: 440px; box-shadow: 0 20px 60px rgba(99,102,241,.1); animation: prr-in .4s ease both; }
  @keyframes prr-in { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }

  .prr-logo { display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 28px; }
  .prr-logo-icon { width: 40px; height: 40px; background: linear-gradient(135deg,#4f46e5,#7c3aed); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px; }
  .prr-logo-text { font-family: 'Syne',sans-serif; font-size: 20px; font-weight: 800; color: #1e1b3a; }

  .prr-title { font-family: 'Syne',sans-serif; font-size: 26px; font-weight: 800; color: #1e1b3a; text-align: center; margin: 0 0 6px; letter-spacing: -.3px; }
  .prr-title span { background: linear-gradient(90deg,#4f46e5,#7c3aed); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
  .prr-sub { text-align: center; font-size: 14px; color: #9ca3af; margin: 0 0 28px; line-height: 1.5; }

  .prr-field { display: flex; flex-direction: column; gap: 5px; margin-bottom: 16px; }
  .prr-field label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .5px; color: #9ca3af; }
  .prr-input { width: 100%; padding: 12px 14px; border: 1px solid #e0e7ff; border-radius: 10px; font-family: 'DM Sans',sans-serif; font-size: 14px; color: #1e1b3a; background: #f5f6ff; outline: none; transition: all .2s; }
  .prr-input:focus { border-color: #a5b4fc; background: #fff; box-shadow: 0 0 0 3px rgba(99,102,241,.08); }
  .prr-input:disabled { opacity: .6; cursor: not-allowed; }
  .prr-input--error { border-color: #fca5a5; background: #fff5f5; }
  .prr-error { color: #ef4444; font-size: 12px; margin-top: 2px; }

  .prr-submit { width: 100%; padding: 13px; background: linear-gradient(135deg,#4f46e5,#7c3aed); color: #fff; border: none; border-radius: 12px; font-family: 'DM Sans',sans-serif; font-size: 15px; font-weight: 700; cursor: pointer; transition: all .2s; box-shadow: 0 4px 16px rgba(79,70,229,.25); margin-top: 8px; }
  .prr-submit:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(79,70,229,.35); }
  .prr-submit:disabled { opacity: .6; cursor: not-allowed; transform: none; }

  .prr-msg { padding: 12px 14px; border-radius: 10px; margin-top: 16px; font-size: 13px; font-weight: 600; text-align: center; background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; }

  .prr-divider { display: flex; align-items: center; gap: 12px; margin: 20px 0; }
  .prr-divider-line { flex: 1; height: 1px; background: #e0e7ff; }

  .prr-footer { text-align: center; font-size: 13.5px; color: #9ca3af; margin-top: 20px; }
  .prr-link { background: none; border: none; color: #6366f1; font-size: 13px; font-weight: 600; cursor: pointer; font-family: 'DM Sans',sans-serif; padding: 0; }
  .prr-link:hover { color: #4f46e5; text-decoration: underline; }
  .prr-link:disabled { opacity: .6; cursor: not-allowed; }

  /* Success state */
  .prr-success-icon { font-size: 48px; text-align: center; margin-bottom: 16px; }
  .prr-success-title { font-family: 'Syne',sans-serif; font-size: 24px; font-weight: 800; color: #1e1b3a; text-align: center; margin: 0 0 8px; }
  .prr-success-title span { background: linear-gradient(90deg,#10b981,#059669); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
  .prr-success-sub { font-size: 14px; color: #9ca3af; text-align: center; margin: 0 0 24px; line-height: 1.6; }
  .prr-instructions { background: #f5f6ff; border: 1px solid #e0e7ff; border-radius: 12px; padding: 16px 20px; margin-bottom: 24px; }
  .prr-instructions h4 { font-family: 'Syne',sans-serif; font-size: 13px; font-weight: 700; color: #4f46e5; margin: 0 0 10px; text-transform: uppercase; letter-spacing: .5px; }
  .prr-instructions ol { margin: 0; padding-left: 18px; font-size: 13px; color: #6b7280; line-height: 1.8; }
  .prr-btn-row { display: flex; gap: 10px; }
  .prr-btn-primary { flex: 1; padding: 12px; background: linear-gradient(135deg,#4f46e5,#7c3aed); color: #fff; border: none; border-radius: 12px; font-family: 'DM Sans',sans-serif; font-size: 14px; font-weight: 700; cursor: pointer; transition: all .2s; box-shadow: 0 4px 16px rgba(79,70,229,.25); }
  .prr-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(79,70,229,.35); }
  .prr-btn-secondary { flex: 1; padding: 12px; background: #f5f6ff; color: #6366f1; border: 1px solid #e0e7ff; border-radius: 12px; font-family: 'DM Sans',sans-serif; font-size: 14px; font-weight: 700; cursor: pointer; transition: all .2s; }
  .prr-btn-secondary:hover { background: #e0e7ff; }
`;

function PasswordResetRequest() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const navigate = useNavigate();

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) { setError("Email is required"); return; }
    if (!validateEmail(email)) { setError("Please enter a valid email address"); return; }

    setIsLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await requestPasswordReset(email);
      if (response.ok) {
        setMessage("Password reset email sent successfully!");
        setEmailSent(true);
        setEmail("");
      } else {
        if (response.status === 404) {
          setError("No account found with this email address");
        } else {
          setError(response.error || "Failed to send reset email. Please try again.");
        }
      }
    } catch (error) {
      console.error("Password reset error:", error);
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setEmail(e.target.value);
    setError("");
    setMessage("");
    setEmailSent(false);
  };

  const handleTryAgain = () => {
    setEmail("");
    setMessage("");
    setError("");
    setEmailSent(false);
  };

  if (emailSent) {
    return (
      <div className="prr-wrap">
        <style>{styles}</style>
        <div className="prr-blob prr-blob--1"/>
        <div className="prr-blob prr-blob--2"/>
        <div className="prr-grid-bg"/>

        <div className="prr-card">
          <div className="prr-logo">
            <div className="prr-logo-icon">🚀</div>
            <span className="prr-logo-text">TalentMatch AI</span>
          </div>

          <div className="prr-success-icon">✅</div>
          <h2 className="prr-success-title">Email <span>Sent!</span></h2>
          <p className="prr-success-sub">
            We've sent a password reset link to your email. Check your inbox and follow the instructions.
          </p>

          <div className="prr-instructions">
            <h4>What to do next</h4>
            <ol>
              <li>Check your inbox (and spam folder)</li>
              <li>Look for an email from TalentMatch AI</li>
              <li>Click the password reset link</li>
              <li>Create your new password</li>
            </ol>
          </div>

          <div className="prr-btn-row">
            <button className="prr-btn-primary" onClick={() => navigate("/login")}>
              Back to Login
            </button>
            <button className="prr-btn-secondary" onClick={handleTryAgain}>
              Send Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="prr-wrap">
      <style>{styles}</style>
      <div className="prr-blob prr-blob--1"/>
      <div className="prr-blob prr-blob--2"/>
      <div className="prr-grid-bg"/>

      <div className="prr-card">
        <div className="prr-logo">
          <div className="prr-logo-icon">🚀</div>
          <span className="prr-logo-text">TalentMatch AI</span>
        </div>

        <h1 className="prr-title">Reset <span>Password</span></h1>
        <p className="prr-sub">Enter your email and we'll send you a reset link</p>

        <form onSubmit={handleSubmit}>
          <div className="prr-field">
            <label>Email Address *</label>
            <input
              className={`prr-input${error ? " prr-input--error" : ""}`}
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={handleInputChange}
              disabled={isLoading}
              autoFocus
            />
            {error && <span className="prr-error">{error}</span>}
          </div>

          <button
            type="submit"
            className="prr-submit"
            disabled={isLoading || !email.trim()}
          >
            {isLoading ? "Sending..." : "Send Reset Email →"}
          </button>

          {message && <div className="prr-msg">✅ {message}</div>}
        </form>

        <div className="prr-divider">
          <div className="prr-divider-line"/>
        </div>

        <p className="prr-footer">
          Remember your password?{" "}
          <button className="prr-link" onClick={() => navigate("/login")} disabled={isLoading}>
            Sign In
          </button>
          {" · "}
          <button className="prr-link" onClick={() => navigate("/register")} disabled={isLoading}>
            Create Account
          </button>
        </p>
      </div>
    </div>
  );
}

export default PasswordResetRequest;