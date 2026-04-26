import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser, sendOtp, verifyOtp } from "../services/api";
import toast from "react-hot-toast";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

  .reg-wrap * { box-sizing: border-box; }
  .reg-wrap { font-family: 'DM Sans', sans-serif; min-height: 100vh; background: #f5f6ff; color: #1e1b3a; display: flex; align-items: center; justify-content: center; padding: 40px 16px; position: relative; overflow: hidden; }

  .reg-blob { position: fixed; border-radius: 50%; filter: blur(100px); opacity: .15; pointer-events: none; z-index: 0; }
  .reg-blob--1 { width: 500px; height: 500px; background: radial-gradient(circle,#6366f1,transparent); top: -160px; left: -100px; animation: reg-drift 14s ease-in-out infinite alternate; }
  .reg-blob--2 { width: 380px; height: 380px; background: radial-gradient(circle,#10b981,transparent); bottom: -100px; right: -60px; animation: reg-drift 18s ease-in-out infinite alternate-reverse; }
  @keyframes reg-drift { 0%{transform:translate(0,0)} 100%{transform:translate(20px,14px)} }
  .reg-grid-bg { position: fixed; inset: 0; pointer-events: none; z-index: 0; background-image: linear-gradient(rgba(99,102,241,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,.05) 1px,transparent 1px); background-size: 40px 40px; }

  .reg-card { position: relative; z-index: 1; background: #fff; border: 1px solid #e8eaf6; border-radius: 20px; padding: 40px 36px; width: 100%; max-width: 520px; box-shadow: 0 20px 60px rgba(99,102,241,.1); animation: reg-in .4s ease both; }
  @keyframes reg-in { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }

  .reg-logo { display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 28px; }
  .reg-logo-icon { width: 40px; height: 40px; background: linear-gradient(135deg,#4f46e5,#7c3aed); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px; }
  .reg-logo-text { font-family: 'Syne',sans-serif; font-size: 20px; font-weight: 800; color: #1e1b3a; }

  .reg-title { font-family: 'Syne',sans-serif; font-size: 26px; font-weight: 800; color: #1e1b3a; text-align: center; margin: 0 0 6px; letter-spacing: -.3px; }
  .reg-title span { background: linear-gradient(90deg,#4f46e5,#7c3aed); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
  .reg-sub { text-align: center; font-size: 14px; color: #9ca3af; margin: 0 0 28px; }

  .reg-field-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .reg-field { display: flex; flex-direction: column; gap: 5px; margin-bottom: 0; }
  .reg-field--full { grid-column: 1 / -1; }
  .reg-field label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .5px; color: #9ca3af; }
  .reg-input { width: 100%; padding: 11px 14px; border: 1px solid #e0e7ff; border-radius: 10px; font-family: 'DM Sans',sans-serif; font-size: 14px; color: #1e1b3a; background: #f5f6ff; outline: none; transition: all .2s; }
  .reg-input:focus { border-color: #a5b4fc; background: #fff; box-shadow: 0 0 0 3px rgba(99,102,241,.08); }
  .reg-input:disabled { opacity: .6; cursor: not-allowed; }
  .reg-input--error { border-color: #fca5a5; background: #fff5f5; box-shadow: 0 0 0 3px rgba(239,68,68,.06); }
  .reg-error-text { color: #ef4444; font-size: 12px; margin-top: 2px; }
  .reg-help-text { color: #9ca3af; font-size: 11.5px; margin-top: 3px; }

  .reg-role-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .reg-role-opt { border: 1.5px solid #e0e7ff; border-radius: 12px; padding: 12px 14px; cursor: pointer; transition: all .2s; text-align: center; background: #f5f6ff; }
  .reg-role-opt:hover { border-color: #a5b4fc; background: #eef2ff; }
  .reg-role-opt--active { border-color: #6366f1; background: #eef2ff; }
  .reg-role-opt input { display: none; }
  .reg-role-icon { font-size: 22px; margin-bottom: 4px; }
  .reg-role-title { font-size: 13px; font-weight: 600; color: #1e1b3a; }
  .reg-role-sub { font-size: 11px; color: #9ca3af; margin-top: 2px; }

  .reg-submit { width: 100%; padding: 13px; background: linear-gradient(135deg,#4f46e5,#7c3aed); color: #fff; border: none; border-radius: 12px; font-family: 'DM Sans',sans-serif; font-size: 15px; font-weight: 700; cursor: pointer; transition: all .2s; box-shadow: 0 4px 16px rgba(79,70,229,.25); margin-top: 24px; }
  .reg-submit:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(79,70,229,.35); }
  .reg-submit:disabled { opacity: .6; cursor: not-allowed; transform: none; }

  .reg-footer-text { text-align: center; font-size: 13.5px; color: #9ca3af; margin-top: 20px; }
  .reg-link { background: none; border: none; color: #6366f1; font-size: 13.5px; font-weight: 600; cursor: pointer; font-family: 'DM Sans',sans-serif; }
  .reg-link:hover { text-decoration: underline; color: #4f46e5; }

  .reg-divider { display: flex; align-items: center; gap: 12px; margin: 20px 0; }
  .reg-divider-line { flex: 1; height: 1px; background: #e0e7ff; }
  .reg-divider-text { font-size: 12px; color: #c4c7d6; font-weight: 600; }

  /* ── OTP Screen ── */
  .otp-icon { font-size: 48px; text-align: center; margin-bottom: 12px; }
  .otp-email-badge { display: inline-flex; align-items: center; gap: 6px; background: #eef2ff; border: 1px solid #e0e7ff; border-radius: 20px; padding: 5px 14px; font-size: 13px; font-weight: 600; color: #4f46e5; margin: 0 auto 24px; }
  .otp-email-wrap { text-align: center; }

  .otp-boxes { display: flex; gap: 10px; justify-content: center; margin-bottom: 8px; }
  .otp-box { width: 52px; height: 58px; border: 1.5px solid #e0e7ff; border-radius: 12px; background: #f5f6ff; font-family: 'Syne',sans-serif; font-size: 24px; font-weight: 800; color: #1e1b3a; text-align: center; outline: none; transition: all .2s; caret-color: #6366f1; }
  .otp-box:focus { border-color: #6366f1; background: #fff; box-shadow: 0 0 0 3px rgba(99,102,241,.1); }
  .otp-box--error { border-color: #fca5a5; background: #fff5f5; animation: otp-shake .3s ease; }
  @keyframes otp-shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-4px)} 75%{transform:translateX(4px)} }
  .otp-box--filled { border-color: #a5b4fc; background: #fff; }

  .otp-timer { text-align: center; font-size: 13px; color: #9ca3af; margin-bottom: 20px; }
  .otp-timer strong { color: #ef4444; }
  .otp-timer--ok strong { color: #6366f1; }

  .otp-resend-row { text-align: center; margin-bottom: 4px; }
  .otp-resend-btn { background: none; border: none; color: #6366f1; font-size: 13px; font-weight: 600; cursor: pointer; font-family: 'DM Sans',sans-serif; padding: 0; }
  .otp-resend-btn:disabled { color: #d1d5db; cursor: not-allowed; }
  .otp-resend-btn:not(:disabled):hover { text-decoration: underline; }

  .otp-back-btn { background: none; border: 1px solid #e0e7ff; border-radius: 10px; color: #9ca3af; font-size: 13px; font-weight: 600; cursor: pointer; font-family: 'DM Sans',sans-serif; padding: 10px 18px; width: 100%; margin-top: 10px; transition: all .2s; }
  .otp-back-btn:hover { border-color: #a5b4fc; color: #6366f1; background: #f5f6ff; }

  .otp-progress { height: 3px; background: #e0e7ff; border-radius: 99px; margin-bottom: 28px; overflow: hidden; }
  .otp-progress-bar { height: 100%; background: linear-gradient(90deg,#4f46e5,#7c3aed); border-radius: 99px; transition: width 1s linear; }

  @media(max-width:480px){ .reg-card{padding:28px 18px} .reg-field-grid{grid-template-columns:1fr} .reg-role-grid{grid-template-columns:1fr} .otp-box{width:42px;height:52px;font-size:20px} }
`;

const OTP_LENGTH = 6;
const OTP_DURATION = 300; // 5 minutes in seconds

const Register = () => {
  const [step, setStep] = useState("form"); // "form" | "otp"
  const [formData, setFormData] = useState({
    first_name: "", last_name: "", email: "", password: "",
    confirmPassword: "", role: "job_seeker",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // OTP state
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [otpError, setOtpError] = useState("");
  const [otpShake, setOtpShake] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(OTP_DURATION);
  const [canResend, setCanResend] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const inputRefs = useRef([]);
  const timerRef = useRef(null);
  const navigate = useNavigate();

  // ── Timer ──────────────────────────────────────────────
  const startTimer = () => {
    clearInterval(timerRef.current);
    setSecondsLeft(OTP_DURATION);
    setCanResend(false);
    timerRef.current = setInterval(() => {
      setSecondsLeft(s => {
        if (s <= 1) {
          clearInterval(timerRef.current);
          setCanResend(true);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  };

  useEffect(() => () => clearInterval(timerRef.current), []);

  const formatTime = (s) => {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  // ── Form validation ────────────────────────────────────
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (p) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/.test(p);
  const validateName = (n) => n.trim().length >= 2 && /^[a-zA-Z\s]+$/.test(n.trim());

  const validateForm = () => {
    const e = {};
    if (!formData.first_name.trim()) e.first_name = "First name is required";
    else if (!validateName(formData.first_name)) e.first_name = "At least 2 letters only";
    if (!formData.last_name.trim()) e.last_name = "Last name is required";
    else if (!validateName(formData.last_name)) e.last_name = "At least 2 letters only";
    if (!formData.email.trim()) e.email = "Email is required";
    else if (!validateEmail(formData.email)) e.email = "Enter a valid email address";
    if (!formData.password) e.password = "Password is required";
    else if (!validatePassword(formData.password)) e.password = "8+ chars, uppercase, lowercase & number";
    if (!formData.confirmPassword) e.confirmPassword = "Please confirm your password";
    else if (formData.password !== formData.confirmPassword) e.confirmPassword = "Passwords do not match";
    if (!formData.role) e.role = "Please select a role";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  // ── Step 1: Submit form → send OTP ────────────────────
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) { toast.error("Please fix the errors below."); return; }
    setIsLoading(true);
    try {
      const response = await sendOtp(formData.email.trim().toLowerCase());
      if (response.ok) {
        toast.success("OTP sent to your email!");
        setStep("otp");
        setOtp(Array(OTP_LENGTH).fill(""));
        setOtpError("");
        startTimer();
        setTimeout(() => inputRefs.current[0]?.focus(), 100);
      } else {
        toast.error(response.error || "Failed to send OTP. Please try again.");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // ── OTP input handling ─────────────────────────────────
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // digits only
    const next = [...otp];
    next[index] = value.slice(-1); // one digit max
    setOtp(next);
    setOtpError("");

    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
    // Auto-submit when last box filled
    if (index === OTP_LENGTH - 1 && value) {
      const filled = [...next];
      if (filled.every(d => d !== "")) handleVerify(filled.join(""));
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && index > 0) inputRefs.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus();
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!text) return;
    const next = Array(OTP_LENGTH).fill("");
    text.split("").forEach((ch, i) => { next[i] = ch; });
    setOtp(next);
    inputRefs.current[Math.min(text.length, OTP_LENGTH - 1)]?.focus();
    if (text.length === OTP_LENGTH) handleVerify(text);
  };

  // ── Step 2: Verify OTP → register ─────────────────────
  const handleVerify = async (code) => {
    if (secondsLeft === 0) {
      setOtpError("OTP expired. Please request a new one.");
      triggerShake();
      return;
    }
    setIsVerifying(true);
    setOtpError("");
    try {
      const verifyResp = await verifyOtp(formData.email.trim().toLowerCase(), code);
      if (!verifyResp.ok) {
        setOtpError(verifyResp.error || "Invalid OTP. Please try again.");
        triggerShake();
        setIsVerifying(false);
        return;
      }
      // OTP correct → register user
      const apiData = {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        role: formData.role,
      };
      const regResp = await registerUser(apiData);
      if (regResp.message && regResp.message.includes("successfully")) {
        clearInterval(timerRef.current);
        toast.success("🎉 Account created! Redirecting to login...");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        toast.error(regResp.error || "Registration failed. Please try again.");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleVerifyClick = () => {
    const code = otp.join("");
    if (code.length < OTP_LENGTH) { setOtpError("Please enter all 6 digits."); return; }
    handleVerify(code);
  };

  const triggerShake = () => {
    setOtpShake(true);
    setTimeout(() => setOtpShake(false), 400);
  };

  // ── Resend OTP ─────────────────────────────────────────
  const handleResend = async () => {
    if (!canResend || isResending) return;
    setIsResending(true);
    setOtp(Array(OTP_LENGTH).fill(""));
    setOtpError("");
    try {
      const response = await sendOtp(formData.email.trim().toLowerCase());
      if (response.ok) {
        toast.success("New OTP sent!");
        startTimer();
        setTimeout(() => inputRefs.current[0]?.focus(), 100);
      } else {
        toast.error(response.error || "Failed to resend OTP.");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  // ── Render ─────────────────────────────────────────────
  return (
    <div className="reg-wrap">
      <style>{styles}</style>
      <div className="reg-blob reg-blob--1"/>
      <div className="reg-blob reg-blob--2"/>
      <div className="reg-grid-bg"/>

      <div className="reg-card">
        <div className="reg-logo">
          <div className="reg-logo-icon">🚀</div>
          <span className="reg-logo-text">TalentMatch AI</span>
        </div>

        {/* ── OTP Screen ── */}
        {step === "otp" ? (
          <>
            <h1 className="reg-title">Verify your <span>Email</span></h1>
            <p className="reg-sub">We sent a 6-digit code to your inbox</p>

            <div className="otp-email-wrap">
              <span className="otp-email-badge">📧 {formData.email}</span>
            </div>

            {/* Timer progress bar */}
            <div className="otp-progress">
              <div
                className="otp-progress-bar"
                style={{ width: `${(secondsLeft / OTP_DURATION) * 100}%` }}
              />
            </div>

            {/* 6 digit boxes */}
            <div className="otp-boxes">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={el => inputRefs.current[i] = el}
                  className={`otp-box${otpShake ? " otp-box--error" : ""}${digit ? " otp-box--filled" : ""}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleOtpChange(i, e.target.value)}
                  onKeyDown={e => handleOtpKeyDown(i, e)}
                  onPaste={i === 0 ? handleOtpPaste : undefined}
                  disabled={isVerifying || secondsLeft === 0}
                  autoComplete="one-time-code"
                />
              ))}
            </div>

            {otpError && (
              <p style={{textAlign:"center", color:"#ef4444", fontSize:"13px", margin:"6px 0 12px"}}>
                {otpError}
              </p>
            )}

            {/* Timer */}
            <p className={`otp-timer${secondsLeft > 60 ? " otp-timer--ok" : ""}`}>
              {secondsLeft > 0
                ? <>Code expires in <strong>{formatTime(secondsLeft)}</strong></>
                : <strong style={{color:"#ef4444"}}>Code expired</strong>
              }
            </p>

            {/* Verify button */}
            <button
              className="reg-submit"
              style={{marginTop:0}}
              onClick={handleVerifyClick}
              disabled={isVerifying || otp.join("").length < OTP_LENGTH || secondsLeft === 0}
            >
              {isVerifying ? "Verifying..." : "Verify & Create Account →"}
            </button>

            {/* Resend */}
            <div className="otp-resend-row" style={{marginTop:14}}>
              <span style={{fontSize:"13px", color:"#9ca3af"}}>Didn't get the code? </span>
              <button
                className="otp-resend-btn"
                onClick={handleResend}
                disabled={!canResend || isResending}
              >
                {isResending ? "Sending..." : canResend ? "Resend OTP" : `Resend in ${formatTime(secondsLeft)}`}
              </button>
            </div>

            {/* Back to form */}
            <button
              className="otp-back-btn"
              onClick={() => { clearInterval(timerRef.current); setStep("form"); setOtpError(""); }}
              disabled={isVerifying}
            >
              ← Edit my details
            </button>
          </>
        ) : (
          /* ── Registration Form ── */
          <>
            <h1 className="reg-title">Join <span>TalentMatch</span></h1>
            <p className="reg-sub">Create your account to get started</p>

            <form onSubmit={handleFormSubmit}>
              <div className="reg-field-grid">
                <div className="reg-field">
                  <label>First Name *</label>
                  <input
                    className={`reg-input${errors.first_name ? " reg-input--error" : ""}`}
                    type="text" name="first_name" placeholder="First name"
                    value={formData.first_name} onChange={handleChange} disabled={isLoading}
                  />
                  {errors.first_name && <span className="reg-error-text">{errors.first_name}</span>}
                </div>

                <div className="reg-field">
                  <label>Last Name *</label>
                  <input
                    className={`reg-input${errors.last_name ? " reg-input--error" : ""}`}
                    type="text" name="last_name" placeholder="Last name"
                    value={formData.last_name} onChange={handleChange} disabled={isLoading}
                  />
                  {errors.last_name && <span className="reg-error-text">{errors.last_name}</span>}
                </div>

                <div className="reg-field reg-field--full">
                  <label>Email Address *</label>
                  <input
                    className={`reg-input${errors.email ? " reg-input--error" : ""}`}
                    type="email" name="email" placeholder="you@example.com"
                    value={formData.email} onChange={handleChange} disabled={isLoading}
                  />
                  {errors.email && <span className="reg-error-text">{errors.email}</span>}
                </div>

                <div className="reg-field">
                  <label>Password *</label>
                  <input
                    className={`reg-input${errors.password ? " reg-input--error" : ""}`}
                    type="password" name="password" placeholder="Create a password"
                    value={formData.password} onChange={handleChange} disabled={isLoading}
                  />
                  {errors.password
                    ? <span className="reg-error-text">{errors.password}</span>
                    : <span className="reg-help-text">8+ chars, upper, lower & number</span>
                  }
                </div>

                <div className="reg-field">
                  <label>Confirm Password *</label>
                  <input
                    className={`reg-input${errors.confirmPassword ? " reg-input--error" : ""}`}
                    type="password" name="confirmPassword" placeholder="Confirm password"
                    value={formData.confirmPassword} onChange={handleChange} disabled={isLoading}
                  />
                  {errors.confirmPassword && <span className="reg-error-text">{errors.confirmPassword}</span>}
                </div>

                <div className="reg-field reg-field--full">
                  <label>I am a *</label>
                  {errors.role && <span className="reg-error-text">{errors.role}</span>}
                  <div className="reg-role-grid" style={{marginTop:4}}>
                    <div
                      className={`reg-role-opt${formData.role === "job_seeker" ? " reg-role-opt--active" : ""}`}
                      onClick={() => { if (!isLoading) setFormData(p => ({...p, role:"job_seeker"})); }}
                    >
                      <div className="reg-role-icon">🔍</div>
                      <div className="reg-role-title">Job Seeker</div>
                      <div className="reg-role-sub">Looking for opportunities</div>
                    </div>
                    <div
                      className={`reg-role-opt${formData.role === "hr" ? " reg-role-opt--active" : ""}`}
                      onClick={() => { if (!isLoading) setFormData(p => ({...p, role:"hr"})); }}
                    >
                      <div className="reg-role-icon">🏢</div>
                      <div className="reg-role-title">HR Professional</div>
                      <div className="reg-role-sub">Hiring candidates</div>
                    </div>
                  </div>
                </div>
              </div>

              <button type="submit" className="reg-submit" disabled={isLoading}>
                {isLoading ? "Sending OTP..." : "Continue →"}
              </button>
            </form>

            <div className="reg-divider">
              <div className="reg-divider-line"/>
              <span className="reg-divider-text">OR</span>
              <div className="reg-divider-line"/>
            </div>

            <p className="reg-footer-text">
              Already have an account?{" "}
              <button className="reg-link" onClick={() => navigate("/login")} disabled={isLoading}>
                Sign In
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default Register;