import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../services/api";
import toast from "react-hot-toast";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

  .reg-wrap * { box-sizing: border-box; }
  .reg-wrap { font-family: 'DM Sans', sans-serif; min-height: 100vh; background: #f5f6ff; color: #1e1b3a; display: flex; align-items: center; justify-content: center; padding: 40px 16px; position: relative; overflow: hidden; }

  /* Background blobs */
  .reg-blob { position: fixed; border-radius: 50%; filter: blur(100px); opacity: .15; pointer-events: none; z-index: 0; }
  .reg-blob--1 { width: 500px; height: 500px; background: radial-gradient(circle,#6366f1,transparent); top: -160px; left: -100px; animation: reg-drift 14s ease-in-out infinite alternate; }
  .reg-blob--2 { width: 380px; height: 380px; background: radial-gradient(circle,#10b981,transparent); bottom: -100px; right: -60px; animation: reg-drift 18s ease-in-out infinite alternate-reverse; }
  @keyframes reg-drift { 0%{transform:translate(0,0)} 100%{transform:translate(20px,14px)} }
  .reg-grid-bg { position: fixed; inset: 0; pointer-events: none; z-index: 0; background-image: linear-gradient(rgba(99,102,241,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,.05) 1px,transparent 1px); background-size: 40px 40px; }

  /* Card */
  .reg-card { position: relative; z-index: 1; background: #fff; border: 1px solid #e8eaf6; border-radius: 20px; padding: 40px 36px; width: 100%; max-width: 520px; box-shadow: 0 20px 60px rgba(99,102,241,.1); animation: reg-in .4s ease both; }
  @keyframes reg-in { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }

  /* Logo area */
  .reg-logo { display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 28px; }
  .reg-logo-icon { width: 40px; height: 40px; background: linear-gradient(135deg,#4f46e5,#7c3aed); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px; }
  .reg-logo-text { font-family: 'Syne',sans-serif; font-size: 20px; font-weight: 800; color: #1e1b3a; }

  .reg-title { font-family: 'Syne',sans-serif; font-size: 26px; font-weight: 800; color: #1e1b3a; text-align: center; margin: 0 0 6px; letter-spacing: -.3px; }
  .reg-title span { background: linear-gradient(90deg,#4f46e5,#7c3aed); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
  .reg-sub { text-align: center; font-size: 14px; color: #9ca3af; margin: 0 0 28px; }

  /* Fields */
  .reg-field-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .reg-field { display: flex; flex-direction: column; gap: 5px; margin-bottom: 0; }
  .reg-field--full { grid-column: 1 / -1; }
  .reg-field label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .5px; color: #9ca3af; }
  .reg-input { width: 100%; padding: 11px 14px; border: 1px solid #e0e7ff; border-radius: 10px; font-family: 'DM Sans',sans-serif; font-size: 14px; color: #1e1b3a; background: #f5f6ff; outline: none; transition: all .2s; }
  .reg-input:focus { border-color: #a5b4fc; background: #fff; box-shadow: 0 0 0 3px rgba(99,102,241,.08); }
  .reg-input:disabled { opacity: .6; cursor: not-allowed; }
  .reg-input--error { border-color: #fca5a5; background: #fff5f5; box-shadow: 0 0 0 3px rgba(239,68,68,.06); }
  .reg-select { width: 100%; padding: 11px 14px; border: 1px solid #e0e7ff; border-radius: 10px; font-family: 'DM Sans',sans-serif; font-size: 14px; color: #1e1b3a; background: #f5f6ff; outline: none; cursor: pointer; transition: all .2s; }
  .reg-select:focus { border-color: #a5b4fc; background: #fff; }
  .reg-select:disabled { opacity: .6; cursor: not-allowed; }
  .reg-error-text { color: #ef4444; font-size: 12px; margin-top: 2px; }
  .reg-help-text { color: #9ca3af; font-size: 11.5px; margin-top: 3px; }

  /* Role selector */
  .reg-role-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .reg-role-opt { border: 1.5px solid #e0e7ff; border-radius: 12px; padding: 12px 14px; cursor: pointer; transition: all .2s; text-align: center; background: #f5f6ff; }
  .reg-role-opt:hover { border-color: #a5b4fc; background: #eef2ff; }
  .reg-role-opt--active { border-color: #6366f1; background: #eef2ff; }
  .reg-role-opt input { display: none; }
  .reg-role-icon { font-size: 22px; margin-bottom: 4px; }
  .reg-role-title { font-size: 13px; font-weight: 600; color: #1e1b3a; }
  .reg-role-sub { font-size: 11px; color: #9ca3af; margin-top: 2px; }

  /* Submit */
  .reg-submit { width: 100%; padding: 13px; background: linear-gradient(135deg,#4f46e5,#7c3aed); color: #fff; border: none; border-radius: 12px; font-family: 'DM Sans',sans-serif; font-size: 15px; font-weight: 700; cursor: pointer; transition: all .2s; box-shadow: 0 4px 16px rgba(79,70,229,.25); margin-top: 24px; }
  .reg-submit:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(79,70,229,.35); }
  .reg-submit:disabled { opacity: .6; cursor: not-allowed; transform: none; }

  /* Bottom link */
  .reg-footer-text { text-align: center; font-size: 13.5px; color: #9ca3af; margin-top: 20px; }
  .reg-link { background: none; border: none; color: #6366f1; font-size: 13.5px; font-weight: 600; cursor: pointer; font-family: 'DM Sans',sans-serif; }
  .reg-link:hover { text-decoration: underline; color: #4f46e5; }

  /* Divider */
  .reg-divider { display: flex; align-items: center; gap: 12px; margin: 20px 0; }
  .reg-divider-line { flex: 1; height: 1px; background: #e0e7ff; }
  .reg-divider-text { font-size: 12px; color: #c4c7d6; font-weight: 600; }

  @media(max-width:480px){ .reg-card{padding:28px 18px} .reg-field-grid{grid-template-columns:1fr} .reg-role-grid{grid-template-columns:1fr} }
`;

const Register = () => {
  const [formData, setFormData] = useState({
    first_name: "", last_name: "", email: "", password: "",
    confirmPassword: "", role: "job_seeker",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (password) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/.test(password);
  const validateName = (name) => name.trim().length >= 2 && /^[a-zA-Z\s]+$/.test(name.trim());

  const validateForm = () => {
    const newErrors = {};
    if (!formData.first_name.trim()) newErrors.first_name = "First name is required";
    else if (!validateName(formData.first_name)) newErrors.first_name = "At least 2 letters only";
    if (!formData.last_name.trim()) newErrors.last_name = "Last name is required";
    else if (!validateName(formData.last_name)) newErrors.last_name = "At least 2 letters only";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!validateEmail(formData.email)) newErrors.email = "Enter a valid email address";
    if (!formData.password) newErrors.password = "Password is required";
    else if (!validatePassword(formData.password)) newErrors.password = "8+ chars, uppercase, lowercase & number";
    if (!formData.confirmPassword) newErrors.confirmPassword = "Please confirm your password";
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    if (!formData.role) newErrors.role = "Please select a role";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fix the errors below.");
      return;
    }
    setIsLoading(true);
    try {
      const apiData = {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        role: formData.role,
      };
      const response = await registerUser(apiData);
      if (response.message && response.message.includes("successfully")) {
        toast.success("🎉 Account created! Redirecting to login...");
        setFormData({ first_name:"", last_name:"", email:"", password:"", confirmPassword:"", role:"job_seeker" });
        setTimeout(() => navigate("/login"), 2000);
      } else {
        toast.error(response.error || "Registration failed. Please try again.");
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Network error. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="reg-wrap">
      <style>{styles}</style>
      <div className="reg-blob reg-blob--1"/>
      <div className="reg-blob reg-blob--2"/>
      <div className="reg-grid-bg"/>

      <div className="reg-card">
        {/* Logo */}
        <div className="reg-logo">
          <div className="reg-logo-icon">🚀</div>
          <span className="reg-logo-text">TalentMatch AI</span>
        </div>

        <h1 className="reg-title">Join <span>TalentMatch</span></h1>
        <p className="reg-sub">Create your account to get started</p>

        <form onSubmit={handleSubmit}>
          <div className="reg-field-grid">
            {/* First Name */}
            <div className="reg-field">
              <label>First Name *</label>
              <input
                className={`reg-input${errors.first_name ? " reg-input--error" : ""}`}
                type="text" name="first_name" placeholder="First name"
                value={formData.first_name} onChange={handleChange} disabled={isLoading}
              />
              {errors.first_name && <span className="reg-error-text">{errors.first_name}</span>}
            </div>

            {/* Last Name */}
            <div className="reg-field">
              <label>Last Name *</label>
              <input
                className={`reg-input${errors.last_name ? " reg-input--error" : ""}`}
                type="text" name="last_name" placeholder="Last name"
                value={formData.last_name} onChange={handleChange} disabled={isLoading}
              />
              {errors.last_name && <span className="reg-error-text">{errors.last_name}</span>}
            </div>

            {/* Email */}
            <div className="reg-field reg-field--full">
              <label>Email Address *</label>
              <input
                className={`reg-input${errors.email ? " reg-input--error" : ""}`}
                type="email" name="email" placeholder="you@example.com"
                value={formData.email} onChange={handleChange} disabled={isLoading}
              />
              {errors.email && <span className="reg-error-text">{errors.email}</span>}
            </div>

            {/* Password */}
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

            {/* Confirm Password */}
            <div className="reg-field">
              <label>Confirm Password *</label>
              <input
                className={`reg-input${errors.confirmPassword ? " reg-input--error" : ""}`}
                type="password" name="confirmPassword" placeholder="Confirm password"
                value={formData.confirmPassword} onChange={handleChange} disabled={isLoading}
              />
              {errors.confirmPassword && <span className="reg-error-text">{errors.confirmPassword}</span>}
            </div>

            {/* Role */}
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
            {isLoading ? "Creating Account..." : "Create Account →"}
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
      </div>
    </div>
  );
};

export default Register;