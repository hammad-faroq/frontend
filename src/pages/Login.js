import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, googleAuth } from "../services/api";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { useGoogleLogin } from "@react-oauth/google";

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
  .lgn-submit:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(79,70,229,.35); }
  .lgn-submit:disabled { opacity: .6; cursor: not-allowed; transform: none; }

  .lgn-divider { display: flex; align-items: center; gap: 12px; margin: 20px 0; }
  .lgn-divider-line { flex: 1; height: 1px; background: #e0e7ff; }
  .lgn-divider-text { font-size: 12px; color: #c4c7d6; font-weight: 600; }

  .lgn-links { display: flex; justify-content: space-between; align-items: center; margin-top: 4px; }
  .lgn-link { background: none; border: none; color: #6366f1; font-size: 13px; font-weight: 600; cursor: pointer; font-family: 'DM Sans',sans-serif; padding: 0; }
  .lgn-link:hover { color: #4f46e5; text-decoration: underline; }
  .lgn-link:disabled { opacity: .6; cursor: not-allowed; }

  .lgn-footer { text-align: center; font-size: 13.5px; color: #9ca3af; margin-top: 20px; }

  /* ── Google Button — identical styling to Register page ── */
  .lgn-google-btn {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 13px 20px;
    background: #fff;
    border: 1.5px solid #e0e7ff;
    border-radius: 12px;
    font-family: 'DM Sans', sans-serif;
    font-size: 15px;
    font-weight: 600;
    color: #1e1b3a;
    cursor: pointer;
    transition: all .25s ease;
    box-shadow: 0 2px 8px rgba(99,102,241,.07);
    position: relative;
    overflow: hidden;
  }
  .lgn-google-btn::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(99,102,241,.05), rgba(124,58,237,.05));
    opacity: 0;
    transition: opacity .25s;
  }
  .lgn-google-btn:hover:not(:disabled) {
    border-color: #a5b4fc;
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(99,102,241,.18);
    color: #4f46e5;
  }
  .lgn-google-btn:hover:not(:disabled)::after { opacity: 1; }
  .lgn-google-btn:active:not(:disabled) { transform: translateY(0); box-shadow: 0 2px 8px rgba(99,102,241,.1); }
  .lgn-google-btn:disabled { opacity: .55; cursor: not-allowed; }
  .lgn-google-icon { width: 22px; height: 22px; flex-shrink: 0; position: relative; z-index: 1; }
  .lgn-google-label { position: relative; z-index: 1; }
  .lgn-google-spinner {
    width: 20px; height: 20px;
    border: 2.5px solid #e0e7ff;
    border-top-color: #6366f1;
    border-radius: 50%;
    animation: lgn-spin .7s linear infinite;
    flex-shrink: 0;
  }
  @keyframes lgn-spin { to { transform: rotate(360deg); } }
`;

function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
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

  // ── Google Login — same flow as Register ──────────────────
  const googleLogin = useGoogleLogin({
    flow: "implicit",
    scope: "openid email profile",
    onSuccess: async (tokenResponse) => {
      setIsGoogleLoading(true);
      try {
        const result = await googleAuth(tokenResponse.access_token);
        if (result.ok) {
          toast.success("Signed in with Google!");
          login(result.token, result.role, result.is_superuser);
          if (result.role === "hr") navigate("/hr/dashboard");
          else navigate("/jobseeker/dashboard");
        } else {
          toast.error(result.error || "Google sign-in failed. Please try again.");
        }
      } catch {
        toast.error("Network error. Please try again.");
      } finally {
        setIsGoogleLoading(false);
      }
    },
    onError: () => toast.error("Google sign-in was cancelled or failed."),
  });

  // ── Email/Password Login ──────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      const response = await loginUser(formData.email, formData.password);
      if (response.token) {
        login(response.token, response.role, response.is_superuser);
        localStorage.setItem("role", response.role); // ← make sure role is saved
        toast.success("Login successful! Redirecting...");
        setTimeout(() => {
          if (response.role === "hr") navigate("/hr/dashboard");
          else navigate("/jobseeker/dashboard");
        }, 100);
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

        {/* ── Google Button ── */}
        <button
          className="lgn-google-btn"
          onClick={() => googleLogin()}
          disabled={isLoading || isGoogleLoading}
          type="button"
        >
          {isGoogleLoading ? (
            <>
              <span className="lgn-google-spinner"/>
              <span className="lgn-google-label">Signing in...</span>
            </>
          ) : (
            <>
              <svg className="lgn-google-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="lgn-google-label">Continue with Google</span>
            </>
          )}
        </button>

        <div className="lgn-divider">
          <div className="lgn-divider-line"/>
          <span className="lgn-divider-text">OR</span>
          <div className="lgn-divider-line"/>
        </div>

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

          <button type="submit" className="lgn-submit" disabled={isLoading || isGoogleLoading}>
            {isLoading ? "Signing in..." : "Sign In →"}
          </button>
        </form>

        <p className="lgn-footer" style={{marginTop: 16}}>
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