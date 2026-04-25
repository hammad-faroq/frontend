import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import NotificationPreferences from "../components/NotificationPreferences";
import API from "../services/api";

const BASE_URL = API.BASE_URL;
const getAuthHeaders = () => ({
  Authorization: `Token ${localStorage.getItem("token")}`,
  "Content-Type": "application/json",
});

function getBrowser() {
  const ua = navigator.userAgent;
  if (ua.includes("Chrome") && !ua.includes("Edg")) return "Google Chrome";
  if (ua.includes("Firefox")) return "Mozilla Firefox";
  if (ua.includes("Safari") && !ua.includes("Chrome")) return "Safari";
  if (ua.includes("Edg")) return "Microsoft Edge";
  if (ua.includes("Opera") || ua.includes("OPR")) return "Opera";
  return "Unknown Browser";
}

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

  .jss-wrap * { box-sizing: border-box; }
  .jss-wrap { font-family: 'DM Sans', sans-serif; min-height: 100vh; background: #f5f6ff; color: #1e1b3a; }

  .jss-hero { position: relative; overflow: hidden; background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 52%, #ede9fe 100%); padding: 40px 40px 72px; border-bottom: 1px solid #ddd6fe; }
  .jss-blob { position: absolute; border-radius: 50%; filter: blur(80px); opacity: .2; pointer-events: none; }
  .jss-blob--1 { width: 420px; height: 420px; background: radial-gradient(circle,#6366f1,transparent); top: -120px; left: -60px; animation: jss-drift 12s ease-in-out infinite alternate; }
  .jss-blob--2 { width: 260px; height: 260px; background: radial-gradient(circle,#10b981,transparent); bottom: -60px; right: 6%; animation: jss-drift 16s ease-in-out infinite alternate-reverse; }
  @keyframes jss-drift { 0%{transform:translate(0,0)} 100%{transform:translate(22px,12px)} }
  .jss-grid-bg { position: absolute; inset: 0; pointer-events: none; background-image: linear-gradient(rgba(99,102,241,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,.06) 1px,transparent 1px); background-size: 40px 40px; }
  .jss-hero-inner { position: relative; z-index: 1; max-width: 720px; margin: 0 auto; }
  .jss-hero-title { font-family: 'Syne', sans-serif; font-size: clamp(22px,3.5vw,34px); font-weight: 800; color: #1e1b3a; margin: 0 0 6px; letter-spacing: -.3px; }
  .jss-hero-sub { font-size: 15px; color: #6b7280; margin: 0; }

  .jss-stats-strip { position: relative; z-index: 10; margin: -24px auto 0; max-width: 720px; padding: 0 40px; }
  .jss-stats-inner { background: #fff; border: 1px solid #e0e7ff; border-radius: 14px; display: grid; grid-template-columns: repeat(3,1fr); box-shadow: 0 8px 32px rgba(99,102,241,.1); }
  .jss-stat { padding: 16px 20px; display: flex; align-items: center; gap: 12px; }
  .jss-stat:not(:last-child) { border-right: 1px solid #e0e7ff; }
  .jss-stat-icon { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 16px; }
  .jss-stat-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .5px; color: #9ca3af; }
  .jss-stat-val { font-size: 16px; font-weight: 800; color: #1e1b3a; }

  .jss-main { max-width: 720px; margin: 0 auto; padding: 32px 40px 80px; }

  .jss-tabs { display: flex; background: #fff; border-radius: 14px 14px 0 0; padding: 0 4px; border: 1px solid #e0e7ff; border-bottom: none; }
  .jss-tab { padding: 14px 20px; font-size: 13px; font-weight: 600; cursor: pointer; background: none; border: none; border-bottom: 2px solid transparent; color: #9ca3af; font-family: 'DM Sans',sans-serif; transition: all .2s; margin-bottom: -1px; }
  .jss-tab:hover { color: #4f46e5; }
  .jss-tab--active { color: #4f46e5; border-bottom-color: #4f46e5; }

  .jss-card { background: #fff; border: 1px solid #e0e7ff; border-top: none; border-radius: 0 0 16px 16px; padding: 28px; animation: jss-in .35s ease both; }
  @keyframes jss-in { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }

  .jss-form-title { font-family: 'Syne',sans-serif; font-size: 17px; font-weight: 700; color: #1e1b3a; margin-bottom: 4px; }
  .jss-form-sub { font-size: 13px; color: #9ca3af; margin-bottom: 20px; }

  .jss-field { margin-bottom: 16px; }
  .jss-field label { display: block; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .5px; color: #9ca3af; margin-bottom: 5px; }
  .jss-input-wrap { position: relative; }
  .jss-input { width: 100%; padding: 10px 52px 10px 14px; border: 1px solid #e0e7ff; border-radius: 10px; font-family: 'DM Sans',sans-serif; font-size: 14px; color: #1e1b3a; background: #f5f6ff; outline: none; transition: all .2s; }
  .jss-input:focus { border-color: #a5b4fc; background: #fff; box-shadow: 0 0 0 3px rgba(99,102,241,.08); }
  .jss-show-btn { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; font-size: 11px; font-weight: 700; color: #9ca3af; cursor: pointer; font-family: 'DM Sans',sans-serif; transition: color .15s; }
  .jss-show-btn:hover { color: #4f46e5; }
  .jss-match-msg { font-size: 12px; font-weight: 600; margin-top: -8px; margin-bottom: 14px; }
  .jss-match-msg--ok { color: #16a34a; }
  .jss-match-msg--err { color: #dc2626; }

  .jss-block { background: #f5f6ff; border: 1px solid #e0e7ff; border-radius: 12px; padding: 16px 20px; margin-bottom: 16px; }
  .jss-block-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .7px; color: #9ca3af; margin-bottom: 10px; }
  .jss-info-row { display: flex; justify-content: space-between; align-items: center; padding: 7px 0; border-bottom: 1px solid #f3f4f6; font-size: 13px; }
  .jss-info-row:last-child { border-bottom: none; }
  .jss-info-label { color: #9ca3af; display: flex; align-items: center; gap: 6px; }
  .jss-info-val { color: #1e1b3a; font-weight: 600; capitalize: true; }

  .jss-notif-row { display: flex; justify-content: space-between; align-items: center; padding: 14px 16px; border: 1px solid #e0e7ff; border-radius: 12px; margin-bottom: 10px; transition: border-color .2s; }
  .jss-notif-row:hover { border-color: #c7d2fe; }
  .jss-notif-icon { font-size: 20px; margin-right: 12px; }
  .jss-notif-label { font-size: 14px; font-weight: 600; color: #1e1b3a; }
  .jss-notif-sub { font-size: 12px; color: #9ca3af; }

  .jss-support-banner { display: flex; align-items: center; justify-content: space-between; gap: 12px; background: #eef2ff; border: 1px solid #c7d2fe; border-radius: 14px; padding: 16px 20px; }
  .jss-support-title { font-size: 14px; font-weight: 700; color: #1e1b3a; margin-bottom: 2px; }
  .jss-support-sub { font-size: 12px; color: #6366f1; }

  .jss-success-bar { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 12px 16px; margin-bottom: 20px; display: flex; align-items: center; gap: 10px; font-size: 14px; color: #15803d; font-weight: 600; animation: jss-in .3s ease both; }

  .jss-btn { display: inline-flex; align-items: center; gap: 6px; padding: 10px 20px; border-radius: 10px; font-size: 13px; font-weight: 600; cursor: pointer; border: none; transition: all .2s; font-family: 'DM Sans',sans-serif; }
  .jss-btn--ghost { background: #f5f6ff; border: 1px solid #e0e7ff; color: #4f46e5; }
  .jss-btn--ghost:hover { background: #eef2ff; }
  .jss-btn--primary { background: linear-gradient(135deg,#4f46e5,#7c3aed); color: #fff; box-shadow: 0 4px 14px rgba(79,70,229,.2); width:100%; justify-content:center; }
  .jss-btn--primary:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(79,70,229,.3); }
  .jss-btn--primary:disabled { opacity: .5; pointer-events: none; }

  @media(max-width:760px){ .jss-stats-inner{grid-template-columns:1fr} .jss-stat:not(:last-child){border-right:none;border-bottom:1px solid #e0e7ff} .jss-hero{padding:28px 16px 60px} .jss-stats-strip{padding:0 16px} .jss-main{padding:28px 16px 60px} }
`;

function Settings() {
  const [activeTab, setActiveTab] = useState("security");
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [passwords, setPasswords] = useState({ current_password: "", new_password: "", confirm_password: "" });
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
  const [submitting, setSubmitting] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (theme === "dark") { document.documentElement.classList.add("dark"); }
    else { document.documentElement.classList.remove("dark"); }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords(prev => ({ ...prev, [name]: value }));
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!passwords.current_password || !passwords.new_password || !passwords.confirm_password) {
      toast.error("All fields are required"); return;
    }
    if (passwords.new_password !== passwords.confirm_password) {
      toast.error("New passwords do not match"); return;
    }
    if (passwords.new_password.length < 8) {
      toast.error("Password must be at least 8 characters"); return;
    }
    if (passwords.current_password === passwords.new_password) {
      toast.error("New password must be different from current password"); return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${BASE_URL}/accounts/change-password/`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(passwords),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Failed to change password"); return; }
      if (data.token) { localStorage.setItem("token", data.token); }
      toast.success("Password changed successfully! ✅");
      setPasswords({ current_password: "", new_password: "", confirm_password: "" });
    } catch (err) {
      toast.error("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const TABS = [
    {id:"security", label:"🔒 Security"},
    {id:"preferences", label:"⚙️ Preferences"},
    {id:"notifications", label:"🔔 Notifications"},
  ];

  return (
    <div className="jss-wrap">
      <style>{styles}</style>

      {/* Hero */}
      <div className="jss-hero">
        <div className="jss-blob jss-blob--1"/><div className="jss-blob jss-blob--2"/><div className="jss-grid-bg"/>
        <div className="jss-hero-inner">
          <h1 className="jss-hero-title">Account Settings</h1>
          <p className="jss-hero-sub">Manage your security, preferences, and notifications</p>
        </div>
      </div>

      {/* Stats */}
      <div className="jss-stats-strip">
        <div className="jss-stats-inner">
          <div className="jss-stat">
            <div className="jss-stat-icon" style={{background:"#eef2ff"}}>🔒</div>
            <div><div className="jss-stat-label">Security</div><div className="jss-stat-val">Strong</div></div>
          </div>
          <div className="jss-stat">
            <div className="jss-stat-icon" style={{background:"#f0fdf4"}}>🔔</div>
            <div><div className="jss-stat-label">Notifications</div><div className="jss-stat-val">On</div></div>
          </div>
          <div className="jss-stat">
            <div className="jss-stat-icon" style={{background:"#f5f3ff"}}>🚀</div>
            <div><div className="jss-stat-label">Version</div><div className="jss-stat-val">v1.0.0</div></div>
          </div>
        </div>
      </div>

      <div className="jss-main">
        {/* Tabs */}
        <div className="jss-tabs">
          {TABS.map(t => (
            <button key={t.id} className={`jss-tab${activeTab===t.id?" jss-tab--active":""}`} onClick={()=>setActiveTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="jss-card">

          {/* ── Security ── */}
          {activeTab === "security" && (
            <div>
              <div className="jss-form-title">Change Password</div>
              <div className="jss-form-sub">Enter your current password to set a new one</div>

              <form onSubmit={handleChangePassword}>
                <PasswordField label="Current Password" name="current_password" value={passwords.current_password} show={showPasswords.current} onToggle={()=>setShowPasswords(p=>({...p,current:!p.current}))} onChange={handlePasswordChange} placeholder="Enter your current password"/>
                <PasswordField label="New Password" name="new_password" value={passwords.new_password} show={showPasswords.new} onToggle={()=>setShowPasswords(p=>({...p,new:!p.new}))} onChange={handlePasswordChange} placeholder="Min. 8 characters"/>
                <PasswordField label="Confirm New Password" name="confirm_password" value={passwords.confirm_password} show={showPasswords.confirm} onToggle={()=>setShowPasswords(p=>({...p,confirm:!p.confirm}))} onChange={handlePasswordChange} placeholder="Re-enter new password"/>

                {passwords.new_password && passwords.confirm_password && (
                  <div className={`jss-match-msg${passwords.new_password===passwords.confirm_password?" jss-match-msg--ok":" jss-match-msg--err"}`}>
                    {passwords.new_password===passwords.confirm_password ? "✅ Passwords match" : "❌ Passwords do not match"}
                  </div>
                )}
                <button type="submit" className="jss-btn jss-btn--primary" disabled={submitting}>
                  {submitting ? "Updating…" : "Update Password"}
                </button>
              </form>
            </div>
          )}

          {/* ── Preferences ── */}
          {activeTab === "preferences" && (
            <div>
              <div className="jss-form-title" style={{marginBottom:20}}>App Preferences</div>

              <div className="jss-block">
                <div className="jss-block-label">Account</div>
                {[
                  {emoji:"👤",label:"Role",val:localStorage.getItem("user_role")?.replace("_"," ")||"—"},
                  {emoji:"🪪",label:"Account ID",val:`#${localStorage.getItem("user_id")||"—"}`},
                  {emoji:"🔑",label:"Account Type",val:localStorage.getItem("is_superuser")==="true"?"Super Admin":"Standard"},
                ].map((r,i)=>(
                  <div className="jss-info-row" key={i}>
                    <span className="jss-info-label"><span>{r.emoji}</span>{r.label}</span>
                    <span className="jss-info-val">{r.val}</span>
                  </div>
                ))}
              </div>

              <div className="jss-block">
                <div className="jss-block-label">App Info</div>
                {[
                  {emoji:"🧠",label:"App Name",val:"TalentMatch AI"},
                  {emoji:"🚀",label:"Version",val:"v1.0.0"},
                  {emoji:"🛠️",label:"Environment",val:"Production"},
                  {emoji:"📅",label:"Last Login",val:new Date().toLocaleDateString("en-US",{weekday:"short",year:"numeric",month:"short",day:"numeric"})},
                ].map((r,i)=>(
                  <div className="jss-info-row" key={i}>
                    <span className="jss-info-label"><span>{r.emoji}</span>{r.label}</span>
                    <span className="jss-info-val">{r.val}</span>
                  </div>
                ))}
              </div>

              <div className="jss-block">
                <div className="jss-block-label">Device & Browser</div>
                {[
                  {emoji:"🌐",label:"Browser",val:getBrowser()},
                  {emoji:"💻",label:"Platform",val:navigator.platform||"Unknown"},
                  {emoji:"🌍",label:"Language",val:navigator.language||"en"},
                  {emoji:"🖥️",label:"Screen",val:`${window.screen.width} × ${window.screen.height}`},
                ].map((r,i)=>(
                  <div className="jss-info-row" key={i}>
                    <span className="jss-info-label"><span>{r.emoji}</span>{r.label}</span>
                    <span className="jss-info-val">{r.val}</span>
                  </div>
                ))}
              </div>

              <div className="jss-support-banner">
                <div>
                  <div className="jss-support-title">Need help?</div>
                  <div className="jss-support-sub">Our support team is here for you</div>
                </div>
                <button className="jss-btn jss-btn--ghost" onClick={()=>navigate("/support")}>Contact Support</button>
              </div>
            </div>
          )}

          {/* ── Notifications ── */}
          {activeTab === "notifications" && (
            <div>
              <div className="jss-form-title">Notification Preferences</div>
              <div className="jss-form-sub">Customize how you receive notifications from TalentMatch AI</div>

              {/* Real NotificationPreferences component from original */}
              <NotificationPreferences />

              <div style={{paddingTop:20,borderTop:"1px solid #e0e7ff",marginTop:8,display:"flex",gap:10}}>
                <button className="jss-btn jss-btn--ghost" onClick={()=>navigate("/notifications")}>View All Notifications</button>
                <button className="jss-btn jss-btn--ghost" onClick={()=>window.location.reload()}>Refresh</button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

function PasswordField({ label, name, value, show, onToggle, onChange, placeholder }) {
  return (
    <div className="jss-field">
      <label>{label}</label>
      <div className="jss-input-wrap">
        <input type={show?"text":"password"} name={name} value={value} onChange={onChange} placeholder={placeholder} className="jss-input"/>
        <button type="button" onClick={onToggle} className="jss-show-btn">{show?"Hide":"Show"}</button>
      </div>
    </div>
  );
}

export default Settings;