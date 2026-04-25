import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/api";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

  .lgn-wrap * { box-sizing: border-box; }
  .lgn-wrap { font-family: 'DM Sans', sans-serif; min-height: 100vh; background: #f5f6ff; color: #1e1b3a; display: flex; align-items: center; justify-content: center; padding: 40px 16px; position: relative; overflow: hidden; }

  .lgn-blob { position: fixed; border-radius: 50%; filter: blur(100px); opacity: .15; pointer-events: none; z-index: 0; }
  .lgn-blob--1 { width: 500px; height: 500px; background: radial-gradient(circle,#6366f1,transparent); top: -160px; left: -100px; animation: lgn-drift 14s ease-in-out infinite alternate; }
  .lgn-blob--2 { width: 380px; height: 380px; background: radial-gradient(circle,#10b981,transparent); bottom: -100px; right: -60px; animation: lgn-drift 18s ease-in-out infinite alternate-reverse; }
  @keyframes lgn-drift { 0%{transform:translate(0,0)} 100%{transform:translate(20px,14px)} }
  .lgn-grid-bg { position: fixed; inset: 0; pointer-events: none; z-index: 0; background-image: linear-gradient(rgba(99,102,241,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,.05) 1px,transparent 1px); background-size: 40px 40px; }

  .lgn-card { position: relative; z-index: 1; background: #fff; border: 1px solid #e8eaf6; border-radius: 20px; padding: 40px 36px; width: 100%; max-width: 440px; box-shadow: 0 20px 60px rgba(99,102,241,.1); animation: lgn-in .4s ease both; }
  @keyframes lgn-in { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }

  .lgn-logo { display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 28px; }
  .lgn-logo-icon { width: 40px; height: 40px; background: linear-gradient(135deg,#4f46e5,#7c3aed); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px; }
  .lgn-logo-text { font-family: 'Syne',sans-serif; font-size: 20px; font-weight: 800; color: #1e1b3a; }

  .lgn-title { font-family: 'Syne',sans-serif; font-size: 26px; font-weight: 800; color: #1e1b3a; text-align: center; margin: 0 0 6px; letter-spacing: -.3px; }
  .lgn-title span { background: linear-gradient(90deg,#4f46e5,#7c3aed); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
  .lgn-sub { text-align: center; font-size: 14px; color: #9ca3af; margin: 0 0 28px; }

  .lgn-field { display: flex; flex-direction: column; gap: 5px; margin-bottom: 16px; }
  .lgn-field label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .5px; color: #9ca3af; }
  .lgn-input { width: 100%; padding: 12px 14px; border: 1px solid #e0e7ff; border-radius: 10px; font-family: 'DM Sans',sans-serif; font-size: 14px; color: #1e1b3a; background: #f5f6ff; outline: none; transition: all .2s; }
  .lgn-input:focus { border-color: #a5b4fc; background: #fff; box-shadow: 0 0 0 3px rgba(99,102,241,.08); }
  .lgn-input:disabled { opacity: .6; cursor: not-allowed; }
  .lgn-input--error { border-color: #fca5a5; background: #fff5f5; }
  .lgn-error { color: #ef4444; font-size: 12px; margin-top: 2px; }

  .lgn-submit { width: 100%; padding: 13px; background: linear-gradient(135deg,#4f46e5,#7c3aed); color: #fff; border: none; border-radius: 12px; font-family: 'DM Sans',sans-serif; font-size: 15px; font-weight: 700; cursor: pointer; transition: all .2s; box-shadow: 0 4px 16px rgba(79,70,229,.25); margin-top: 8px; }
  .lgn-submit:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(79,70,229,.35); }
  .lgn-submit:disabled { opacity: .6; cursor: not-allowed; transform: none; }

  .lgn-divider { display: flex; align-items: center; gap: 12px; margin: 20px 0; }
  .lgn-divider-line { flex: 1; height: 1px; background: #e0e7ff; }
  .lgn-divider-text { font-size: 12px; color: #c4c7d6; font-weight: 600; }

  .lgn-links { display: flex; justify-content: space-between; align-items: center; margin-top: 4px; }
  .lgn-link { background: none; border: none; color: #6366f1; font-size: 13px; font-weight: 600; cursor: pointer; font-family: 'DM Sans',sans-serif; padding: 0; }
  .lgn-link:hover { color: #4f46e5; text-decoration: underline; }
  .lgn-link:disabled { opacity: .6; cursor: not-allowed; }

  .lgn-footer { text-align: center; font-size: 13.5px; color: #9ca3af; margin-top: 20px; }
`;

function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!validateEmail(formData.email)) newErrors.email = "Please enter a valid email address";
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";
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
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      const response = await loginUser(formData.email, formData.password);
      if (response.token) {
        login(response.token, response.role, response.is_superuser);
        toast.success("Login successful! Redirecting...");
        setTimeout(() => navigate("/dashboard"), 100);
      } else {
        if (response.locked) {
          toast.error(response.error || "Account locked due to multiple failed attempts.");
        } else {
          toast.error(response.error || "Invalid credentials. Try again.");
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Network error. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="lgn-wrap">
      <style>{styles}</style>
      <div className="lgn-blob lgn-blob--1"/>
      <div className="lgn-blob lgn-blob--2"/>
      <div className="lgn-grid-bg"/>

      <div className="lgn-card">
        <div className="lgn-logo">
          <div className="lgn-logo-icon">🚀</div>
          <span className="lgn-logo-text">TalentMatch AI</span>
        </div>

        <h1 className="lgn-title">Welcome <span>Back</span></h1>
        <p className="lgn-sub">Sign in to your account to continue</p>

        <form onSubmit={handleSubmit}>
          <div className="lgn-field">
            <label>Email Address *</label>
            <input
              className={`lgn-input${errors.email ? " lgn-input--error" : ""}`}
              type="email" name="email" placeholder="you@example.com"
              value={formData.email} onChange={handleChange} disabled={isLoading}
            />
            {errors.email && <span className="lgn-error">{errors.email}</span>}
          </div>

          <div className="lgn-field">
            <label>Password *</label>
            <input
              className={`lgn-input${errors.password ? " lgn-input--error" : ""}`}
              type="password" name="password" placeholder="Enter your password"
              value={formData.password} onChange={handleChange} disabled={isLoading}
            />
            {errors.password && <span className="lgn-error">{errors.password}</span>}
          </div>

          <div className="lgn-links">
            <span/>
            <button type="button" className="lgn-link" onClick={() => navigate("/password-reset")} disabled={isLoading}>
              Forgot Password?
            </button>
          </div>

          <button type="submit" className="lgn-submit" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign In →"}
          </button>
        </form>

        <div className="lgn-divider">
          <div className="lgn-divider-line"/>
          <span className="lgn-divider-text">OR</span>
          <div className="lgn-divider-line"/>
        </div>

        <p className="lgn-footer">
          Don't have an account?{" "}
          <button className="lgn-link" onClick={() => navigate("/register")} disabled={isLoading}>
            Create Account
          </button>
        </p>
      </div>
    </div>
  );
}

export default Login;