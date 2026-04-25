import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { confirmPasswordReset } from "../services/api";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

  .prc-wrap * { box-sizing: border-box; }
  .prc-wrap { font-family: 'DM Sans', sans-serif; min-height: 100vh; background: #f5f6ff; color: #1e1b3a; display: flex; align-items: center; justify-content: center; padding: 40px 16px; position: relative; overflow: hidden; }

  .prc-blob { position: fixed; border-radius: 50%; filter: blur(100px); opacity: .15; pointer-events: none; z-index: 0; }
  .prc-blob--1 { width: 500px; height: 500px; background: radial-gradient(circle,#6366f1,transparent); top: -160px; left: -100px; animation: prc-drift 14s ease-in-out infinite alternate; }
  .prc-blob--2 { width: 380px; height: 380px; background: radial-gradient(circle,#10b981,transparent); bottom: -100px; right: -60px; animation: prc-drift 18s ease-in-out infinite alternate-reverse; }
  @keyframes prc-drift { 0%{transform:translate(0,0)} 100%{transform:translate(20px,14px)} }
  .prc-grid-bg { position: fixed; inset: 0; pointer-events: none; z-index: 0; background-image: linear-gradient(rgba(99,102,241,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,.05) 1px,transparent 1px); background-size: 40px 40px; }

  .prc-card { position: relative; z-index: 1; background: #fff; border: 1px solid #e8eaf6; border-radius: 20px; padding: 40px 36px; width: 100%; max-width: 440px; box-shadow: 0 20px 60px rgba(99,102,241,.1); animation: prc-in .4s ease both; }
  @keyframes prc-in { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }

  .prc-logo { display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 28px; }
  .prc-logo-icon { width: 40px; height: 40px; background: linear-gradient(135deg,#4f46e5,#7c3aed); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px; }
  .prc-logo-text { font-family: 'Syne',sans-serif; font-size: 20px; font-weight: 800; color: #1e1b3a; }

  .prc-title { font-family: 'Syne',sans-serif; font-size: 26px; font-weight: 800; color: #1e1b3a; text-align: center; margin: 0 0 6px; letter-spacing: -.3px; }
  .prc-title span { background: linear-gradient(90deg,#4f46e5,#7c3aed); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
  .prc-sub { text-align: center; font-size: 14px; color: #9ca3af; margin: 0 0 28px; }

  .prc-field { display: flex; flex-direction: column; gap: 5px; margin-bottom: 16px; }
  .prc-field label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .5px; color: #9ca3af; }
  .prc-input { width: 100%; padding: 12px 14px; border: 1px solid #e0e7ff; border-radius: 10px; font-family: 'DM Sans',sans-serif; font-size: 14px; color: #1e1b3a; background: #f5f6ff; outline: none; transition: all .2s; }
  .prc-input:focus { border-color: #a5b4fc; background: #fff; box-shadow: 0 0 0 3px rgba(99,102,241,.08); }
  .prc-input:disabled { opacity: .6; cursor: not-allowed; }
  .prc-input--error { border-color: #fca5a5; background: #fff5f5; }
  .prc-error { color: #ef4444; font-size: 12px; margin-top: 2px; }
  .prc-hint { color: #c4c7d6; font-size: 11px; margin-top: 3px; }

  .prc-submit { width: 100%; padding: 13px; background: linear-gradient(135deg,#4f46e5,#7c3aed); color: #fff; border: none; border-radius: 12px; font-family: 'DM Sans',sans-serif; font-size: 15px; font-weight: 700; cursor: pointer; transition: all .2s; box-shadow: 0 4px 16px rgba(79,70,229,.25); margin-top: 8px; }
  .prc-submit:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(79,70,229,.35); }
  .prc-submit:disabled { opacity: .6; cursor: not-allowed; transform: none; }

  .prc-msg { padding: 12px 14px; border-radius: 10px; margin-top: 16px; font-size: 13px; font-weight: 600; text-align: center; }
  .prc-msg--success { background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; }
  .prc-msg--error { background: #fff5f5; color: #ef4444; border: 1px solid #fca5a5; }

  .prc-strength { background: #f5f6ff; border: 1px solid #e0e7ff; border-radius: 12px; padding: 14px 16px; margin-top: 16px; }
  .prc-strength-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .5px; color: #9ca3af; margin: 0 0 10px; }
  .prc-strength-checks { display: flex; flex-direction: column; gap: 5px; }
  .prc-check { font-size: 12px; display: flex; align-items: center; gap: 6px; }
  .prc-check--pass { color: #059669; }
  .prc-check--fail { color: #d1d5db; }
  .prc-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
  .prc-dot--pass { background: #059669; }
  .prc-dot--fail { background: #d1d5db; }

  .prc-divider { display: flex; align-items: center; gap: 12px; margin: 20px 0; }
  .prc-divider-line { flex: 1; height: 1px; background: #e0e7ff; }

  .prc-footer { text-align: center; font-size: 13.5px; color: #9ca3af; margin-top: 20px; }
  .prc-link { background: none; border: none; color: #6366f1; font-size: 13px; font-weight: 600; cursor: pointer; font-family: 'DM Sans',sans-serif; padding: 0; }
  .prc-link:hover { color: #4f46e5; text-decoration: underline; }
  .prc-link:disabled { opacity: .6; cursor: not-allowed; }

  /* Success state */
  .prc-success-icon { font-size: 48px; text-align: center; margin-bottom: 16px; }
  .prc-success-title { font-family: 'Syne',sans-serif; font-size: 24px; font-weight: 800; color: #1e1b3a; text-align: center; margin: 0 0 8px; }
  .prc-success-title span { background: linear-gradient(90deg,#10b981,#059669); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
  .prc-success-sub { font-size: 14px; color: #9ca3af; text-align: center; margin: 0 0 8px; line-height: 1.6; }
  .prc-countdown { font-size: 12px; color: #c4c7d6; text-align: center; margin-bottom: 24px; font-style: italic; }
  .prc-btn-primary { width: 100%; padding: 13px; background: linear-gradient(135deg,#4f46e5,#7c3aed); color: #fff; border: none; border-radius: 12px; font-family: 'DM Sans',sans-serif; font-size: 15px; font-weight: 700; cursor: pointer; transition: all .2s; box-shadow: 0 4px 16px rgba(79,70,229,.25); }
  .prc-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(79,70,229,.35); }
`;

function PasswordResetConfirm() {
  const [formData, setFormData] = useState({ password: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const navigate = useNavigate();
  const { uidb64, token } = useParams();

  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (!validatePassword(formData.password)) {
      newErrors.password = "Password must be at least 8 characters with uppercase, lowercase, and number";
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    setMessage("");
    try {
      const response = await confirmPasswordReset(uidb64, token, formData.password);
      if (response.ok) {
        setMessage("Password reset successful!");
        setResetSuccess(true);
        setTimeout(() => navigate("/login"), 3000);
      } else {
        if (response.status === 400) {
          setMessage(
            response.error?.includes("Invalid or expired")
              ? "This reset link has expired or is invalid. Please request a new one."
              : response.error || "Failed to reset password."
          );
        } else {
          setMessage("Failed to reset password. Please try again.");
        }
      }
    } catch (error) {
      console.error("Password reset confirm error:", error);
      setMessage("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const checks = [
    { label: "At least 8 characters", pass: formData.password.length >= 8 },
    { label: "Uppercase letter", pass: /[A-Z]/.test(formData.password) },
    { label: "Lowercase letter", pass: /[a-z]/.test(formData.password) },
    { label: "Number", pass: /\d/.test(formData.password) },
  ];

  if (resetSuccess) {
    return (
      <div className="prc-wrap">
        <style>{styles}</style>
        <div className="prc-blob prc-blob--1"/>
        <div className="prc-blob prc-blob--2"/>
        <div className="prc-grid-bg"/>
        <div className="prc-card">
          <div className="prc-logo">
            <div className="prc-logo-icon">🚀</div>
            <span className="prc-logo-text">TalentMatch AI</span>
          </div>
          <div className="prc-success-icon">🎉</div>
          <h2 className="prc-success-title">Password <span>Reset!</span></h2>
          <p className="prc-success-sub">Your password has been successfully updated. You can now sign in with your new credentials.</p>
          <p className="prc-countdown">Redirecting to login in 3 seconds...</p>
          <button className="prc-btn-primary" onClick={() => navigate("/login")}>
            Go to Login →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="prc-wrap">
      <style>{styles}</style>
      <div className="prc-blob prc-blob--1"/>
      <div className="prc-blob prc-blob--2"/>
      <div className="prc-grid-bg"/>

      <div className="prc-card">
        <div className="prc-logo">
          <div className="prc-logo-icon">🚀</div>
          <span className="prc-logo-text">TalentMatch AI</span>
        </div>

        <h1 className="prc-title">Set New <span>Password</span></h1>
        <p className="prc-sub">Enter your new password below</p>

        <form onSubmit={handleSubmit}>
          <div className="prc-field">
            <label>New Password *</label>
            <input
              className={`prc-input${errors.password ? " prc-input--error" : ""}`}
              type="password"
              name="password"
              placeholder="Enter your new password"
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
            />
            {errors.password && <span className="prc-error">{errors.password}</span>}
            <span className="prc-hint">8+ characters with uppercase, lowercase & number</span>
          </div>

          <div className="prc-field">
            <label>Confirm Password *</label>
            <input
              className={`prc-input${errors.confirmPassword ? " prc-input--error" : ""}`}
              type="password"
              name="confirmPassword"
              placeholder="Confirm your new password"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={isLoading}
            />
            {errors.confirmPassword && <span className="prc-error">{errors.confirmPassword}</span>}
          </div>

          {formData.password && (
            <div className="prc-strength">
              <p className="prc-strength-title">Password Strength</p>
              <div className="prc-strength-checks">
                {checks.map((c) => (
                  <div key={c.label} className={`prc-check ${c.pass ? "prc-check--pass" : "prc-check--fail"}`}>
                    <div className={`prc-dot ${c.pass ? "prc-dot--pass" : "prc-dot--fail"}`}/>
                    {c.label}
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            type="submit"
            className="prc-submit"
            disabled={isLoading || !formData.password || !formData.confirmPassword}
          >
            {isLoading ? "Resetting..." : "Reset Password →"}
          </button>

          {message && (
            <div className={`prc-msg ${message.includes("successful") ? "prc-msg--success" : "prc-msg--error"}`}>
              {message}
            </div>
          )}
        </form>

        <div className="prc-divider">
          <div className="prc-divider-line"/>
        </div>

        <p className="prc-footer">
          Remember your password?{" "}
          <button className="prc-link" onClick={() => navigate("/login")} disabled={isLoading}>
            Back to Login
          </button>
        </p>
      </div>
    </div>
  );
}

export default PasswordResetConfirm;