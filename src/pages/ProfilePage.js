import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  EnvelopeIcon,
  PencilSquareIcon,
  PhoneIcon,
  MapPinIcon,
  BriefcaseIcon,
  AcademicCapIcon,
} from "@heroicons/react/24/outline";
import API from "../services/api";

const BASE_URL = API.BASE_URL;

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

  .pp-wrap * { box-sizing: border-box; }
  .pp-wrap { font-family: 'DM Sans', sans-serif; min-height: 100vh; background: #f5f6ff; color: #1e1b3a; }

  .pp-hero {
    position: relative; overflow: hidden;
    background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 52%, #ede9fe 100%);
    padding: 40px 40px 72px; border-bottom: 1px solid #ddd6fe;
  }
  .pp-blob { position: absolute; border-radius: 50%; filter: blur(80px); opacity: .2; pointer-events: none; }
  .pp-blob--1 { width: 420px; height: 420px; background: radial-gradient(circle,#6366f1,transparent); top: -120px; left: -60px; animation: pp-drift 12s ease-in-out infinite alternate; }
  .pp-blob--2 { width: 260px; height: 260px; background: radial-gradient(circle,#10b981,transparent); bottom: -60px; right: 6%; animation: pp-drift 16s ease-in-out infinite alternate-reverse; }
  @keyframes pp-drift { 0%{transform:translate(0,0)} 100%{transform:translate(22px,12px)} }
  .pp-grid-bg { position: absolute; inset: 0; pointer-events: none; background-image: linear-gradient(rgba(99,102,241,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,.06) 1px,transparent 1px); background-size: 40px 40px; }
  .pp-hero-inner { position: relative; z-index: 1; max-width: 760px; margin: 0 auto; display: flex; justify-content: space-between; align-items: flex-end; gap: 20px; flex-wrap: wrap; }
  .pp-badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(99,102,241,.12); border: 1px solid rgba(99,102,241,.3); color: #4f46e5; padding: 5px 14px; border-radius: 100px; font-size: 11px; font-weight: 700; letter-spacing: .6px; text-transform: uppercase; margin-bottom: 12px; }
  .pp-badge-dot { width: 7px; height: 7px; border-radius: 50%; background: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,.2); animation: pp-pulse 2s infinite; }
  @keyframes pp-pulse { 0%,100%{box-shadow:0 0 0 3px rgba(99,102,241,.2)} 50%{box-shadow:0 0 0 6px rgba(99,102,241,.06)} }
  .pp-hero-title { font-family: 'Syne', sans-serif; font-size: clamp(22px,3.5vw,34px); font-weight: 800; color: #1e1b3a; margin: 0 0 6px; letter-spacing: -.3px; }
  .pp-hero-title span { background: linear-gradient(90deg,#4f46e5,#7c3aed); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
  .pp-hero-sub { font-size: 14px; color: #6b7280; margin: 0; }

  .pp-stats-strip { position: relative; z-index: 10; margin: -24px auto 0; max-width: 760px; padding: 0 40px; }
  .pp-stats-inner { background: #fff; border: 1px solid #e0e7ff; border-radius: 14px; display: grid; grid-template-columns: repeat(3,1fr); box-shadow: 0 8px 32px rgba(99,102,241,.1); }
  .pp-stat { padding: 14px 18px; display: flex; align-items: center; gap: 10px; }
  .pp-stat:not(:last-child) { border-right: 1px solid #e0e7ff; }
  .pp-stat-icon { width: 34px; height: 34px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 15px; }
  .pp-stat-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .5px; color: #9ca3af; }
  .pp-stat-val { font-size: 18px; font-weight: 800; color: #1e1b3a; }

  .pp-main { max-width: 760px; margin: 0 auto; padding: 32px 40px 80px; }

  .pp-card { background: #fff; border: 1px solid #e8eaf6; border-radius: 16px; padding: 24px; margin-bottom: 20px; transition: box-shadow .2s, border-color .2s; animation: pp-in .4s ease both; }
  .pp-card:hover { box-shadow: 0 8px 32px rgba(99,102,241,.08); border-color: #c7d2fe; }
  @keyframes pp-in { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }

  .pp-avatar-wrap { position: relative; width: 96px; height: 96px; margin: 0 auto 14px; }
  .pp-avatar-img { width: 96px; height: 96px; border-radius: 50%; object-fit: cover; border: 3px solid #e0e7ff; }
  .pp-avatar-initials { width: 96px; height: 96px; border-radius: 50%; background: linear-gradient(135deg,#4f46e5,#7c3aed); display: flex; align-items: center; justify-content: center; border: 3px solid #e0e7ff; font-family: 'Syne',sans-serif; font-size: 30px; font-weight: 800; color: #fff; }
  .pp-avatar-overlay { position: absolute; inset: 0; border-radius: 50%; background: rgba(0,0,0,.4); display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity .2s; cursor: pointer; }
  .pp-avatar-wrap:hover .pp-avatar-overlay { opacity: 1; }
  .pp-avatar-overlay span { color: #fff; font-size: 12px; font-weight: 600; }
  .pp-avatar-edit-btn { position: absolute; bottom: 2px; right: 2px; width: 26px; height: 26px; background: linear-gradient(135deg,#4f46e5,#7c3aed); border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid #fff; font-size: 11px; cursor: pointer; }

  .pp-name { font-family: 'Syne',sans-serif; font-size: 20px; font-weight: 800; color: #1e1b3a; text-align: center; margin: 0 0 4px; }
  .pp-email { font-size: 13px; color: #9ca3af; text-align: center; margin: 0 0 14px; }
  .pp-role-chip { display: inline-flex; align-items: center; gap: 4px; background: rgba(99,102,241,.08); border: 1px solid rgba(99,102,241,.15); border-radius: 100px; padding: 4px 12px; font-size: 11px; color: #4f46e5; font-weight: 600; }

  .pp-progress-track { background: #e0e7ff; border-radius: 100px; height: 7px; overflow: hidden; }
  .pp-progress-fill { height: 100%; background: linear-gradient(90deg,#4f46e5,#7c3aed); border-radius: 100px; transition: width .5s ease; }

  .pp-section-title { font-family: 'Syne',sans-serif; font-size: 16px; font-weight: 700; color: #1e1b3a; margin: 0 0 16px; padding-bottom: 10px; border-bottom: 1px solid #e0e7ff; display: flex; align-items: center; gap: 8px; }
  .pp-section-title svg { width: 16px; height: 16px; color: #6366f1; }

  .pp-info-row { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid #f3f4f6; }
  .pp-info-row:last-child { border-bottom: none; }
  .pp-info-icon { width: 32px; height: 32px; border-radius: 9px; background: #f5f6ff; border: 1px solid #e0e7ff; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .pp-info-icon svg { width: 14px; height: 14px; color: #6366f1; }
  .pp-info-label { font-size: 11px; color: #9ca3af; font-weight: 600; text-transform: uppercase; letter-spacing: .4px; margin: 0 0 1px; }
  .pp-info-val { font-size: 13.5px; color: #1e1b3a; font-weight: 500; margin: 0; }

  .pp-field { display: flex; flex-direction: column; gap: 5px; }
  .pp-field label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .5px; color: #9ca3af; }
  .pp-input { width: 100%; padding: 10px 14px; border: 1px solid #e0e7ff; border-radius: 10px; font-family: 'DM Sans',sans-serif; font-size: 14px; color: #1e1b3a; background: #f5f6ff; outline: none; transition: all .2s; }
  .pp-input:focus { border-color: #a5b4fc; background: #fff; box-shadow: 0 0 0 3px rgba(99,102,241,.08); }
  .pp-input:disabled { opacity: .6; cursor: not-allowed; }
  .pp-textarea { resize: vertical; min-height: 80px; }
  .pp-select { width: 100%; padding: 10px 14px; border: 1px solid #e0e7ff; border-radius: 10px; font-family: 'DM Sans',sans-serif; font-size: 14px; color: #1e1b3a; background: #f5f6ff; outline: none; cursor: pointer; transition: all .2s; }
  .pp-select:focus { border-color: #a5b4fc; background: #fff; }
  .pp-field-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .pp-field-grid--3 { grid-template-columns: 1fr 1fr 1fr; }

  .pp-sub-section { border-top: 1px solid #e0e7ff; padding-top: 18px; margin-top: 4px; }
  .pp-sub-title { font-size: 13px; font-weight: 700; color: #374151; margin: 0 0 14px; display: flex; align-items: center; gap: 6px; text-transform: uppercase; letter-spacing: .4px; }
  .pp-sub-title svg { width: 14px; height: 14px; color: #6366f1; }

  .pp-toggle-row { display: flex; align-items: center; gap: 12px; padding: 14px 16px; background: #f5f6ff; border: 1px solid #e0e7ff; border-radius: 12px; margin-top: 16px; }
  .pp-toggle-label { font-size: 14px; font-weight: 500; color: #374151; }
  .pp-toggle-sub { font-size: 12px; color: #9ca3af; }

  .pp-btn { display: inline-flex; align-items: center; gap: 6px; padding: 10px 20px; border-radius: 10px; font-size: 13px; font-weight: 600; cursor: pointer; border: none; transition: all .2s; font-family: 'DM Sans',sans-serif; }
  .pp-btn--ghost { background: #f5f6ff; border: 1px solid #e0e7ff; color: #4f46e5; }
  .pp-btn--ghost:hover { background: #eef2ff; transform: translateY(-1px); }
  .pp-btn--primary { background: linear-gradient(135deg,#4f46e5,#7c3aed); color: #fff; box-shadow: 0 4px 14px rgba(79,70,229,.2); }
  .pp-btn--primary:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(79,70,229,.3); }
  .pp-btn--primary:disabled { opacity: .6; cursor: not-allowed; transform: none; }
  .pp-btn--danger { background: #fff0f0; border: 1px solid #fecaca; color: #dc2626; }
  .pp-btn--danger:hover { background: #fee2e2; }

  .pp-loading { min-height: 100vh; background: #f5f6ff; display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 16px; font-family: 'DM Sans',sans-serif; }
  .pp-spinner { width: 44px; height: 44px; border: 3px solid #e0e7ff; border-top-color: #6366f1; border-radius: 50%; animation: pp-spin .8s linear infinite; }
  @keyframes pp-spin { to{transform:rotate(360deg)} }

  @media(max-width:700px){ .pp-stats-inner{grid-template-columns:1fr} .pp-stat:not(:last-child){border-right:none;border-bottom:1px solid #e0e7ff} .pp-field-grid{grid-template-columns:1fr} .pp-field-grid--3{grid-template-columns:1fr} .pp-hero{padding:28px 16px 60px} .pp-stats-strip{padding:0 16px} .pp-main{padding:28px 16px 60px} }
`;

const getAuthHeaders = () => ({ Authorization: `Token ${localStorage.getItem("token")}` });

const fetchProfile = async () => {
  const res = await fetch(`${BASE_URL}/profile/`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Failed to fetch profile");
  return res.json();
};

const updateProfileJSON = async (data) => {
  const res = await fetch(`${BASE_URL}/profile/`, {
    method: "PUT",
    headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) { const err = await res.json(); throw new Error(JSON.stringify(err)); }
  return res.json();
};

const updateProfileWithImage = async (data, imageFile) => {
  const formData = new FormData();
  Object.entries(data).forEach(([key, val]) => {
    if (val !== null && val !== undefined && val !== "") formData.append(key, val);
  });
  if (imageFile) formData.append("profile_picture", imageFile);
  const res = await fetch(`${BASE_URL}/profile/`, {
    method: "PUT", headers: getAuthHeaders(), body: formData,
  });
  if (!res.ok) { const err = await res.json(); throw new Error(JSON.stringify(err)); }
  return res.json();
};

const emptyForm = {
  first_name:"",last_name:"",nick_name:"",gender:"",country:"",language:"en",
  time_zone:"UTC",phone_number:"",address:"",city:"",state:"",postal_code:"",
  job_title:"",company:"",industry:"",years_of_experience:"",
  highest_education:"",university:"",graduation_year:"",bio:"",is_public:true,
};

const profileToForm = (p) => ({
  first_name: p.full_name?.split(" ")[0] || "",
  last_name: p.full_name?.split(" ").slice(1).join(" ") || "",
  nick_name: p.nick_name || "",
  gender: p.gender || "",
  country: p.country || "",
  language: p.language || "en",
  time_zone: p.time_zone || "UTC",
  phone_number: p.phone_number || "",
  address: p.address || "",
  city: p.city || "",
  state: p.state || "",
  postal_code: p.postal_code || "",
  job_title: p.job_title || "",
  company: p.company || "",
  industry: p.industry || "",
  years_of_experience: p.years_of_experience ?? "",
  highest_education: p.highest_education || "",
  university: p.university || "",
  graduation_year: p.graduation_year ?? "",
  bio: p.bio || "",
  is_public: p.is_public ?? true,
});

const calcCompletion = (p) => {
  if (!p) return 0;
  const fields = [p.nick_name, p.gender, p.country, p.phone_number, p.job_title, p.bio, p.profile_picture || p.google_picture_url]
  return Math.round((fields.filter(Boolean).length / fields.length) * 100);
};

function PpField({ label, children }) {
  return (
    <div className="pp-field">
      <label>{label}</label>
      {children}
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div className="pp-info-row">
      <div className="pp-info-icon"><Icon className="w-4 h-4" style={{width:14,height:14,color:"#6366f1"}}/></div>
      <div>
        <p className="pp-info-label">{label}</p>
        <p className="pp-info-val">{value}</p>
      </div>
    </div>
  );
}

function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchProfile();
        setProfile(data);
        setFormData(profileToForm(data));
      } catch (err) {
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const ext = file.name.split(".").pop().toLowerCase();
    if (!["jpg","jpeg","png","gif","webp"].includes(ext)) { toast.error("Invalid file type. Use JPG, PNG, GIF or WEBP"); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("Image too large. Max 5MB"); return; }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    setSubmitting(true);
    try {
      const result = avatarFile
        ? await updateProfileWithImage(formData, avatarFile)
        : await updateProfileJSON(formData);
      const updated = result.profile || result;
      setProfile(updated);
      setFormData(profileToForm(updated));
      setAvatarFile(null);
      setAvatarPreview(null);
      setEditing(false);
      toast.success("Profile updated successfully! ✅");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save. Please check your data and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData(profileToForm(profile));
    setAvatarFile(null);
    setAvatarPreview(null);
    setEditing(false);
  };

  const getAvatarSrc = () => {
  if (avatarPreview) return avatarPreview;
  if (profile?.profile_picture) {
    return profile.profile_picture.startsWith("http")
      ? profile.profile_picture
      : `${BASE_URL}${profile.profile_picture}`;
  }
  if (profile?.google_picture_url) return profile.google_picture_url; // ✅ add this
  return null;
};

  if (loading) {
    return (
      <div className="pp-loading">
        <style>{styles}</style>
        <div className="pp-spinner"/>
        <p style={{color:"#6366f1",fontWeight:600,fontFamily:"'DM Sans',sans-serif"}}>Loading your profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="pp-loading">
        <style>{styles}</style>
        <p style={{color:"#6b7280",marginBottom:12}}>Could not load profile</p>
        <button className="pp-btn pp-btn--primary" onClick={() => navigate("/dashboard")}>Go to Dashboard</button>
      </div>
    );
  }

  const avatarSrc = getAvatarSrc();
  const fullName = profile?.full_name?.trim() || profile?.email || "";
  const completion = calcCompletion(profile);

  return (
    <div className="pp-wrap">
      <style>{styles}</style>

      {/* Hero */}
      <div className="pp-hero">
        <div className="pp-blob pp-blob--1"/><div className="pp-blob pp-blob--2"/><div className="pp-grid-bg"/>
        <div className="pp-hero-inner">
          <div>
            <div className="pp-badge"><span className="pp-badge-dot"/>My Account</div>
            <h1 className="pp-hero-title">My <span>Profile</span></h1>
            <p className="pp-hero-sub">Manage your personal and professional information</p>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:".5px",color:"#9ca3af",marginBottom:4}}>Completion</div>
            <div style={{fontFamily:"'Syne',sans-serif",fontSize:32,fontWeight:800,color:"#4f46e5"}}>{completion}%</div>
          </div>
        </div>
      </div>

      {/* Stats strip */}
      <div className="pp-stats-strip">
        <div className="pp-stats-inner">
          <div className="pp-stat">
            <div className="pp-stat-icon" style={{background:"#eef2ff"}}>👤</div>
            <div><div className="pp-stat-label">Status</div><div className="pp-stat-val">Active</div></div>
          </div>
          <div className="pp-stat">
            <div className="pp-stat-icon" style={{background:"#f0fdf4"}}>✅</div>
            <div><div className="pp-stat-label">Completion</div><div className="pp-stat-val">{completion}%</div></div>
          </div>
          <div className="pp-stat">
            <div className="pp-stat-icon" style={{background:"#f5f3ff"}}>📅</div>
            <div><div className="pp-stat-label">Member Since</div><div className="pp-stat-val">
            {profile?.created_at 
              ? new Date(profile.created_at).getFullYear() 
              : "—"}
          </div></div>
          </div>
        </div>
      </div>

      <div className="pp-main">
        {/* Avatar card */}
        <div className="pp-card" style={{textAlign:"center"}}>
          <input type="file" id="avatarUpload" accept="image/*" style={{display:"none"}} onChange={handleImageUpload} disabled={!editing}/>
          <div className="pp-avatar-wrap" style={{margin:"0 auto 14px"}}
            onClick={() => editing && document.getElementById("avatarUpload").click()}
          >
            {avatarSrc
              ? <img src={avatarSrc} alt="Profile" className="pp-avatar-img"/>
              : <div className="pp-avatar-initials">{fullName?.charAt(0)?.toUpperCase() || "?"}</div>
            }
            {editing && (
              <>
                <div className="pp-avatar-overlay"><span>Change</span></div>
                <div className="pp-avatar-edit-btn">📷</div>
              </>
            )}
          </div>

          <p className="pp-name">{fullName}</p>
          <p className="pp-email">{profile.email}</p>
          <div style={{display:"flex",justifyContent:"center",marginBottom:20}}>
            <span className="pp-role-chip">
            {localStorage.getItem("user_role") === "hr" ? "🏢 HR" : "💼 Job Seeker"}
          </span>
          </div>

          <div style={{marginBottom:6,display:"flex",justifyContent:"space-between",fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:".5px",color:"#9ca3af"}}>
            <span>Profile completeness</span><span style={{color:"#4f46e5"}}>{completion}%</span>
          </div>
          <div className="pp-progress-track"><div className="pp-progress-fill" style={{width:`${completion}%`}}/></div>

          <div style={{marginTop:20,display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap"}}>
            {!editing
              ? <button className="pp-btn pp-btn--primary" onClick={() => setEditing(true)}>
                  <PencilSquareIcon style={{width:14,height:14}}/> Edit Profile
                </button>
              : <>
                  <button className="pp-btn pp-btn--primary" onClick={handleSave} disabled={submitting}>
                    {submitting ? "Saving..." : "💾 Save Changes"}
                  </button>
                  <button className="pp-btn pp-btn--ghost" onClick={handleCancel}>Cancel</button>
                </>
            }
          </div>
        </div>

        {/* Info / Edit card */}
        <div className="pp-card">
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
            <h3 style={{fontFamily:"'Syne',sans-serif",fontSize:17,fontWeight:700,color:"#1e1b3a",margin:0}}>Profile Information</h3>
            {!editing && (
              <button className="pp-btn pp-btn--ghost" onClick={() => setEditing(true)}>
                <PencilSquareIcon style={{width:14,height:14}}/> Edit
              </button>
            )}
          </div>

          {editing ? (
            <div style={{display:"flex",flexDirection:"column",gap:16}}>
              {/* Personal */}
              <div className="pp-field-grid">
                <PpField label="First Name">
                  <input name="first_name" value={formData.first_name} onChange={handleChange} className="pp-input" placeholder="First name"/>
                </PpField>
                <PpField label="Last Name">
                  <input name="last_name" value={formData.last_name} onChange={handleChange} className="pp-input" placeholder="Last name"/>
                </PpField>
                <PpField label="Nickname">
                  <input name="nick_name" value={formData.nick_name} onChange={handleChange} className="pp-input" placeholder="How should we call you?"/>
                </PpField>
                <PpField label="Phone Number">
                  <input name="phone_number" value={formData.phone_number} onChange={handleChange} className="pp-input" placeholder="+1 (555) 123-4567"/>
                </PpField>
                <PpField label="City">
                  <input name="city" value={formData.city} onChange={handleChange} className="pp-input" placeholder="New York"/>
                </PpField>
                <PpField label="Country">
                  <input name="country" value={formData.country} onChange={handleChange} className="pp-input" placeholder="USA"/>
                </PpField>
                <PpField label="Gender">
                  <select name="gender" value={formData.gender} onChange={handleChange} className="pp-select">
                    <option value="">Prefer not to say</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer_not_to_say">Prefer not to say</option>
                  </select>
                </PpField>
                <PpField label="Language">
                  <select name="language" value={formData.language} onChange={handleChange} className="pp-select">
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="zh">Chinese</option>
                    <option value="ar">Arabic</option>
                    <option value="hi">Hindi</option>
                    <option value="ur">Urdu</option>
                  </select>
                </PpField>
              </div>
              <PpField label="Bio">
                <textarea name="bio" value={formData.bio} onChange={handleChange} rows={3} placeholder="Tell us about yourself..." className="pp-input pp-textarea"/>
              </PpField>

              {/* Professional */}
              <div className="pp-sub-section">
                <p className="pp-sub-title"><BriefcaseIcon style={{width:14,height:14,color:"#6366f1"}}/>Professional Info</p>
                <div className="pp-field-grid">
                  <PpField label="Job Title"><input name="job_title" value={formData.job_title} onChange={handleChange} className="pp-input" placeholder="Software Engineer"/></PpField>
                  <PpField label="Company"><input name="company" value={formData.company} onChange={handleChange} className="pp-input" placeholder="Acme Corp"/></PpField>
                  <PpField label="Industry"><input name="industry" value={formData.industry} onChange={handleChange} className="pp-input" placeholder="Technology"/></PpField>
                  <PpField label="Years of Experience"><input type="number" name="years_of_experience" value={formData.years_of_experience} onChange={handleChange} className="pp-input" min="0" placeholder="3"/></PpField>
                </div>
              </div>

              {/* Education */}
              <div className="pp-sub-section">
                <p className="pp-sub-title"><AcademicCapIcon style={{width:14,height:14,color:"#6366f1"}}/>Education</p>
                <div className="pp-field-grid">
                  <PpField label="Highest Education"><input name="highest_education" value={formData.highest_education} onChange={handleChange} className="pp-input" placeholder="Bachelor's"/></PpField>
                  <PpField label="University"><input name="university" value={formData.university} onChange={handleChange} className="pp-input" placeholder="MIT"/></PpField>
                  <PpField label="Graduation Year"><input type="number" name="graduation_year" value={formData.graduation_year} onChange={handleChange} className="pp-input" placeholder="2020" min="1900" max="2035"/></PpField>
                </div>
              </div>

              {/* Privacy toggle */}
              <div className="pp-toggle-row">
                <input type="checkbox" id="is_public" name="is_public" checked={formData.is_public} onChange={handleChange} style={{width:16,height:16,accentColor:"#4f46e5"}}/>
                <div>
                  <label htmlFor="is_public" className="pp-toggle-label">Make my profile public</label>
                  <div className="pp-toggle-sub">When enabled, other users can view your basic profile information.</div>
                </div>
              </div>

              {/* Action buttons */}
              <div style={{display:"flex",gap:10,paddingTop:8,borderTop:"1px solid #e0e7ff",marginTop:4}}>
                <button className="pp-btn pp-btn--ghost" style={{flex:1,justifyContent:"center"}} onClick={handleCancel} disabled={submitting}>Cancel</button>
                <button className="pp-btn pp-btn--primary" style={{flex:1,justifyContent:"center"}} onClick={handleSave} disabled={submitting}>
                  {submitting ? "Saving..." : "💾 Save Changes"}
                </button>
              </div>
            </div>
          ) : (
            <div>
              <InfoRow icon={EnvelopeIcon} label="Email" value={profile.email}/>
              <InfoRow icon={PhoneIcon} label="Phone" value={profile.phone_number}/>
              <InfoRow icon={MapPinIcon} label="Location" value={[profile.city, profile.state, profile.country].filter(Boolean).join(", ")}/>
              <InfoRow icon={BriefcaseIcon} label="Job Title" value={profile.job_title}/>
              <InfoRow icon={BriefcaseIcon} label="Company" value={profile.company}/>
              <InfoRow icon={BriefcaseIcon} label="Industry" value={profile.industry}/>
              <InfoRow icon={AcademicCapIcon} label="Education" value={profile.highest_education}/>
              <InfoRow icon={AcademicCapIcon} label="University" value={profile.university}/>
              {profile.bio && (
                <div style={{paddingTop:14,borderTop:"1px solid #f3f4f6",marginTop:4}}>
                  <p className="pp-info-label" style={{marginBottom:6}}>Bio</p>
                  <p style={{fontSize:13.5,color:"#374151",lineHeight:1.7,margin:0}}>{profile.bio}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;