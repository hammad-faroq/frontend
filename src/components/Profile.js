import React, { useState } from "react";
import toast from "react-hot-toast";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

  .jsp-wrap * { box-sizing: border-box; }
  .jsp-wrap { font-family: 'DM Sans', sans-serif; min-height: 100vh; background: #f5f6ff; color: #1e1b3a; }

  /* Hero */
  .jsp-hero {
    position: relative; overflow: hidden;
    background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 52%, #ede9fe 100%);
    padding: 40px 40px 72px; border-bottom: 1px solid #ddd6fe;
  }
  .jsp-blob { position: absolute; border-radius: 50%; filter: blur(80px); opacity: .2; pointer-events: none; }
  .jsp-blob--1 { width: 420px; height: 420px; background: radial-gradient(circle,#6366f1,transparent); top: -120px; left: -60px; animation: jsp-drift 12s ease-in-out infinite alternate; }
  .jsp-blob--2 { width: 260px; height: 260px; background: radial-gradient(circle,#10b981,transparent); bottom: -60px; right: 6%; animation: jsp-drift 16s ease-in-out infinite alternate-reverse; }
  @keyframes jsp-drift { 0%{transform:translate(0,0)} 100%{transform:translate(22px,12px)} }
  .jsp-grid-bg { position: absolute; inset: 0; pointer-events: none; background-image: linear-gradient(rgba(99,102,241,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,.06) 1px,transparent 1px); background-size: 40px 40px; }
  .jsp-hero-inner { position: relative; z-index: 1; max-width: 1100px; margin: 0 auto; display: flex; justify-content: space-between; align-items: flex-end; gap: 20px; flex-wrap: wrap; }
  .jsp-badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(99,102,241,.12); border: 1px solid rgba(99,102,241,.3); color: #4f46e5; padding: 5px 14px; border-radius: 100px; font-size: 11px; font-weight: 700; letter-spacing: .6px; text-transform: uppercase; margin-bottom: 12px; }
  .jsp-badge-dot { width: 7px; height: 7px; border-radius: 50%; background: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,.2); animation: jsp-pulse 2s infinite; }
  @keyframes jsp-pulse { 0%,100%{box-shadow:0 0 0 3px rgba(99,102,241,.2)} 50%{box-shadow:0 0 0 6px rgba(99,102,241,.06)} }
  .jsp-hero-title { font-family: 'Syne', sans-serif; font-size: clamp(22px,3.5vw,34px); font-weight: 800; color: #1e1b3a; margin: 0 0 6px; letter-spacing: -.3px; }
  .jsp-hero-title span { background: linear-gradient(90deg,#4f46e5,#7c3aed); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
  .jsp-hero-sub { font-size: 15px; color: #6b7280; margin: 0; }

  /* Stats strip */
  .jsp-stats-strip { position: relative; z-index: 10; margin: -24px auto 0; max-width: 1100px; padding: 0 40px; }
  .jsp-stats-inner { background: #fff; border: 1px solid #e0e7ff; border-radius: 14px; display: grid; grid-template-columns: repeat(3,1fr); box-shadow: 0 8px 32px rgba(99,102,241,.1); }
  .jsp-stat { padding: 16px 20px; display: flex; align-items: center; gap: 12px; }
  .jsp-stat:not(:last-child) { border-right: 1px solid #e0e7ff; }
  .jsp-stat-icon { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 16px; }
  .jsp-stat-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .5px; color: #9ca3af; }
  .jsp-stat-val { font-size: 20px; font-weight: 800; color: #1e1b3a; }

  /* Main layout */
  .jsp-main { max-width: 1100px; margin: 0 auto; padding: 32px 40px 80px; }
  .jsp-grid { display: grid; grid-template-columns: 300px 1fr; gap: 24px; }
  .jsp-section-title { font-family: 'Syne',sans-serif; font-size: 18px; font-weight: 700; color: #1e1b3a; margin: 0 0 20px; }

  /* Card */
  .jsp-card { background: #fff; border: 1px solid #e8eaf6; border-radius: 16px; padding: 24px; transition: box-shadow .2s, border-color .2s; animation: jsp-in .4s ease both; }
  .jsp-card:hover { box-shadow: 0 8px 32px rgba(99,102,241,.08); border-color: #c7d2fe; }
  @keyframes jsp-in { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }

  /* Avatar */
  .jsp-avatar-wrap { position: relative; width: 100px; height: 100px; margin: 0 auto 16px; }
  .jsp-avatar { width: 100px; height: 100px; border-radius: 50%; border: 3px solid #e0e7ff; display: flex; align-items: center; justify-content: center; font-family: 'Syne',sans-serif; font-size: 28px; font-weight: 800; color: #6366f1; background: linear-gradient(135deg,#eef2ff,#ede9fe); }
  .jsp-avatar-edit { position: absolute; bottom: 2px; right: 2px; width: 28px; height: 28px; background: linear-gradient(135deg,#4f46e5,#7c3aed); border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 12px; border: 2px solid #fff; }

  .jsp-profile-name { font-family: 'Syne',sans-serif; font-size: 20px; font-weight: 800; color: #1e1b3a; text-align: center; margin-bottom: 4px; }
  .jsp-profile-email { font-size: 13px; color: #9ca3af; text-align: center; margin-bottom: 16px; }
  .jsp-profile-role { display: inline-flex; align-items: center; gap: 4px; background: rgba(99,102,241,.08); border: 1px solid rgba(99,102,241,.15); border-radius: 100px; padding: 4px 12px; font-size: 11px; color: #4f46e5; font-weight: 600; margin-bottom: 20px; }

  /* Progress bar */
  .jsp-progress-bar-track { background: #e0e7ff; border-radius: 100px; height: 8px; overflow: hidden; margin-bottom: 6px; }
  .jsp-progress-bar-fill { height: 100%; background: linear-gradient(90deg,#4f46e5,#7c3aed); border-radius: 100px; transition: width .4s ease; }

  /* Info rows */
  .jsp-info-row { display: flex; justify-content: space-between; align-items: center; padding: 9px 0; border-bottom: 1px solid #f3f4f6; font-size: 13px; }
  .jsp-info-row:last-child { border-bottom: none; }
  .jsp-info-label { color: #9ca3af; }
  .jsp-info-val { color: #1e1b3a; font-weight: 600; }

  /* Email chip */
  .jsp-email-item { background: #f5f6ff; border: 1px solid #e0e7ff; border-radius: 12px; padding: 10px 14px; margin-bottom: 8px; }
  .jsp-email-badge { display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px; border-radius: 100px; font-size: 10px; font-weight: 700; }
  .jsp-email-badge--primary { background: #eef2ff; color: #4f46e5; }
  .jsp-email-badge--verified { background: #dcfce7; color: #15803d; }
  .jsp-email-badge--unverified { background: #fef9c3; color: #854d0e; }

  /* Form fields */
  .jsp-form-section { margin-bottom: 32px; }
  .jsp-form-section-title { font-family: 'Syne',sans-serif; font-size: 16px; font-weight: 700; color: #1e1b3a; margin-bottom: 16px; padding-bottom: 10px; border-bottom: 1px solid #e0e7ff; }
  .jsp-field-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .jsp-field { display: flex; flex-direction: column; gap: 5px; }
  .jsp-field label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .5px; color: #9ca3af; }
  .jsp-input { width: 100%; padding: 10px 14px; border: 1px solid #e0e7ff; border-radius: 10px; font-family: 'DM Sans',sans-serif; font-size: 14px; color: #1e1b3a; background: #f5f6ff; outline: none; transition: all .2s; }
  .jsp-input:focus { border-color: #a5b4fc; background: #fff; box-shadow: 0 0 0 3px rgba(99,102,241,.08); }
  .jsp-input:disabled { opacity: .6; cursor: not-allowed; }
  .jsp-textarea { resize: vertical; min-height: 90px; }
  .jsp-select { width: 100%; padding: 10px 14px; border: 1px solid #e0e7ff; border-radius: 10px; font-family: 'DM Sans',sans-serif; font-size: 14px; color: #1e1b3a; background: #f5f6ff; outline: none; cursor: pointer; transition: all .2s; }
  .jsp-select:focus { border-color: #a5b4fc; background: #fff; }
  .jsp-select:disabled { opacity: .6; cursor: not-allowed; }
  .jsp-char-count { font-size: 11px; color: #9ca3af; text-align: right; }

  /* Toggle */
  .jsp-toggle-row { display: flex; align-items: center; gap: 12px; padding: 14px 16px; background: #f5f6ff; border: 1px solid #e0e7ff; border-radius: 12px; }
  .jsp-toggle-label { font-size: 14px; color: #374151; flex: 1; font-weight: 500; }
  .jsp-toggle-sub { font-size: 12px; color: #9ca3af; margin-top: 2px; }

  /* Buttons */
  .jsp-btn { display: inline-flex; align-items: center; gap: 6px; padding: 10px 20px; border-radius: 10px; font-size: 13px; font-weight: 600; cursor: pointer; border: none; transition: all .2s; font-family: 'DM Sans',sans-serif; }
  .jsp-btn--ghost { background: #f5f6ff; border: 1px solid #e0e7ff; color: #4f46e5; }
  .jsp-btn--ghost:hover { background: #eef2ff; transform: translateY(-1px); }
  .jsp-btn--primary { background: linear-gradient(135deg,#4f46e5,#7c3aed); color: #fff; box-shadow: 0 4px 14px rgba(79,70,229,.2); }
  .jsp-btn--primary:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(79,70,229,.3); }

  /* Footer */
  .jsp-footer { max-width: 1100px; margin: 0 auto; padding: 0 40px 40px; display: flex; justify-content: space-between; align-items: center; font-size: 13px; color: #9ca3af; flex-wrap: wrap; gap: 8px; }
  .jsp-footer a { color: #6366f1; text-decoration: none; }
  .jsp-footer a:hover { text-decoration: underline; }

  @media(max-width:900px){ .jsp-stats-inner{grid-template-columns:1fr} .jsp-stat:not(:last-child){border-right:none;border-bottom:1px solid #e0e7ff} .jsp-grid{grid-template-columns:1fr} }
  @media(max-width:640px){ .jsp-hero{padding:28px 16px 60px} .jsp-stats-strip{padding:0 16px} .jsp-main{padding:28px 16px 60px} .jsp-field-grid{grid-template-columns:1fr} }
`;

const FIELDS = [
  {key:"first_name",label:"First Name",required:true},
  {key:"last_name",label:"Last Name",required:true},
  {key:"nick_name",label:"Nickname"},
  {key:"phone_number",label:"Phone Number",type:"tel"},
  {key:"country",label:"Country"},
  {key:"city",label:"City"},
  {key:"state",label:"State"},
  {key:"postal_code",label:"Postal Code"},
  {key:"job_title",label:"Job Title"},
  {key:"company",label:"Company"},
  {key:"industry",label:"Industry"},
  {key:"years_of_experience",label:"Years of Experience",type:"number"},
  {key:"highest_education",label:"Highest Education"},
  {key:"university",label:"University"},
  {key:"graduation_year",label:"Graduation Year",type:"number"},
];

function Profile() {
  const [editing, setEditing] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [user, setUser] = useState({
    first_name:"Alex",last_name:"Johnson",email:"alex@example.com",nick_name:"AJ",
    gender:"male",country:"United States",language:"en",time_zone:"PST",
    phone_number:"+1 555-0100",address:"123 Main St",city:"San Francisco",
    state:"CA",postal_code:"94105",job_title:"Senior Frontend Developer",
    company:"TechCorp",industry:"Information Technology",years_of_experience:"5",
    highest_education:"Bachelor's in CS",university:"UC Berkeley",graduation_year:"2019",
    bio:"Passionate frontend developer with 5 years of experience building scalable web apps.",
    is_public:true,role:"Job Seeker",created_at:"2023-01-15T00:00:00Z"
  });
  const profileCompletion = 78;

  const set = (k, v) => setUser(u => ({...u, [k]: v}));

  const handleSave = () => {
    setEditing(false);
    toast.success("✅ Profile updated successfully!");
  };

  const handleCancel = () => {
    setEditing(false);
    toast("Changes discarded.", { icon: "↩️" });
  };

  const handleAddEmail = () => {
    if (!newEmail.trim()) {
      toast.error("Please enter an email address.");
      return;
    }
    toast.success(`Verification sent to ${newEmail}`);
    setNewEmail("");
  };

  return (
    <div className="jsp-wrap">
      <style>{styles}</style>

      {/* Hero */}
      <div className="jsp-hero">
        <div className="jsp-blob jsp-blob--1"/><div className="jsp-blob jsp-blob--2"/><div className="jsp-grid-bg"/>
        <div className="jsp-hero-inner">
          <div>
            <div className="jsp-badge"><span className="jsp-badge-dot"/>My Account</div>
            <h1 className="jsp-hero-title">My <span>Profile</span></h1>
            <p className="jsp-hero-sub">Manage your personal and professional information</p>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:".5px",color:"#9ca3af",marginBottom:6}}>Profile Completion</div>
            <div style={{fontFamily:"'Syne',sans-serif",fontSize:32,fontWeight:800,color:"#4f46e5"}}>{profileCompletion}%</div>
          </div>
        </div>
      </div>

      {/* Stats strip */}
      <div className="jsp-stats-strip">
        <div className="jsp-stats-inner">
          <div className="jsp-stat">
            <div className="jsp-stat-icon" style={{background:"#eef2ff"}}>👤</div>
            <div><div className="jsp-stat-label">Account Status</div><div className="jsp-stat-val">Active</div></div>
          </div>
          <div className="jsp-stat">
            <div className="jsp-stat-icon" style={{background:"#f0fdf4"}}>✅</div>
            <div><div className="jsp-stat-label">Completion</div><div className="jsp-stat-val">{profileCompletion}%</div></div>
          </div>
          <div className="jsp-stat">
            <div className="jsp-stat-icon" style={{background:"#f5f3ff"}}>📅</div>
            <div><div className="jsp-stat-label">Member Since</div><div className="jsp-stat-val">Jan 2023</div></div>
          </div>
        </div>
      </div>

      <div className="jsp-main">
        <div className="jsp-grid">

          {/* Sidebar */}
          <div>
            {/* Avatar card */}
            <div className="jsp-card" style={{textAlign:"center",marginBottom:16}}>
              <div className="jsp-avatar-wrap">
                <div className="jsp-avatar">AJ</div>
                {editing && <div className="jsp-avatar-edit">📷</div>}
              </div>
              <div className="jsp-profile-name">{user.first_name} {user.last_name}</div>
              <div className="jsp-profile-email">{user.email}</div>
              <div style={{display:"flex",justifyContent:"center",marginBottom:20}}>
                <span className="jsp-profile-role">💼 {user.role}</span>
              </div>
              <div style={{marginBottom:4,display:"flex",justifyContent:"space-between",fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:".5px",color:"#9ca3af"}}>
                <span>Profile completeness</span><span style={{color:"#4f46e5"}}>{profileCompletion}%</span>
              </div>
              <div className="jsp-progress-bar-track"><div className="jsp-progress-bar-fill" style={{width:`${profileCompletion}%`}}/></div>
              <div style={{marginTop:20,display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap"}}>
                {!editing
                  ? <button className="jsp-btn jsp-btn--primary" onClick={()=>setEditing(true)}>✏️ Edit Profile</button>
                  : <>
                      <button className="jsp-btn jsp-btn--primary" onClick={handleSave}>💾 Save</button>
                      <button className="jsp-btn jsp-btn--ghost" onClick={handleCancel}>Cancel</button>
                    </>
                }
              </div>
            </div>

            {/* Account info card */}
            <div className="jsp-card" style={{marginBottom:16}}>
              <h3 className="jsp-section-title" style={{fontSize:14}}>Account Info</h3>
              <div className="jsp-info-row"><span className="jsp-info-label">Role</span><span className="jsp-info-val">{user.role}</span></div>
              <div className="jsp-info-row"><span className="jsp-info-label">Status</span><span className="jsp-info-val" style={{color:"#16a34a"}}>Active ●</span></div>
              <div className="jsp-info-row"><span className="jsp-info-label">Member Since</span><span className="jsp-info-val">Jan 15, 2023</span></div>
            </div>

            {/* Email management */}
            <div className="jsp-card">
              <h3 className="jsp-section-title" style={{fontSize:14}}>Email Addresses</h3>
              <div className="jsp-email-item">
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                  <div style={{fontSize:13,fontWeight:600,color:"#1e1b3a"}}>{user.email}</div>
                  <span className="jsp-email-badge jsp-email-badge--primary">Primary</span>
                </div>
                <span className="jsp-email-badge jsp-email-badge--verified">✓ Verified</span>
              </div>
              <div style={{display:"flex",gap:8,marginTop:12}}>
                <input
                  className="jsp-input"
                  style={{flex:1,fontSize:13}}
                  placeholder="New email address"
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                />
                <button className="jsp-btn jsp-btn--primary" style={{padding:"10px 14px"}} onClick={handleAddEmail}>Add</button>
              </div>
            </div>
          </div>

          {/* Right col — form */}
          <div className="jsp-card">
            {/* Personal info */}
            <div className="jsp-form-section">
              <div className="jsp-form-section-title">Personal Information</div>
              <div className="jsp-field-grid">
                {FIELDS.slice(0,8).map(f => (
                  <div className="jsp-field" key={f.key}>
                    <label>{f.label}{f.required && " *"}</label>
                    <input className="jsp-input" type={f.type||"text"} value={user[f.key]||""} onChange={e=>set(f.key,e.target.value)} disabled={!editing} placeholder={f.label}/>
                  </div>
                ))}
                <div className="jsp-field">
                  <label>Gender</label>
                  <select className="jsp-select" value={user.gender||""} onChange={e=>set("gender",e.target.value)} disabled={!editing}>
                    <option value="">Select Gender</option>
                    <option value="male">Male</option><option value="female">Female</option>
                    <option value="other">Other</option><option value="prefer_not_to_say">Prefer not to say</option>
                  </select>
                </div>
                <div className="jsp-field">
                  <label>Language</label>
                  <select className="jsp-select" value={user.language||"en"} onChange={e=>set("language",e.target.value)} disabled={!editing}>
                    <option value="en">English</option><option value="es">Spanish</option>
                    <option value="fr">French</option><option value="ur">Urdu</option>
                  </select>
                </div>
                <div className="jsp-field" style={{gridColumn:"1/-1"}}>
                  <label>Address</label>
                  <textarea className="jsp-input jsp-textarea" value={user.address||""} onChange={e=>set("address",e.target.value)} disabled={!editing} placeholder="Your full address"/>
                </div>
              </div>
            </div>

            {/* Professional info */}
            <div className="jsp-form-section">
              <div className="jsp-form-section-title">Professional Information</div>
              <div className="jsp-field-grid">
                {FIELDS.slice(8).map(f => (
                  <div className="jsp-field" key={f.key}>
                    <label>{f.label}</label>
                    <input className="jsp-input" type={f.type||"text"} value={user[f.key]||""} onChange={e=>set(f.key,e.target.value)} disabled={!editing} placeholder={f.label}/>
                  </div>
                ))}
              </div>
            </div>

            {/* Bio */}
            <div className="jsp-form-section">
              <div className="jsp-form-section-title">About Me</div>
              <div className="jsp-field">
                <label>Bio</label>
                <textarea className="jsp-input jsp-textarea" style={{minHeight:100}} value={user.bio||""} onChange={e=>set("bio",e.target.value)} disabled={!editing} placeholder="Tell us about yourself…" maxLength={500}/>
                <div className="jsp-char-count">{(user.bio||"").length}/500</div>
              </div>
            </div>

            {/* Privacy */}
            <div className="jsp-form-section" style={{marginBottom:0}}>
              <div className="jsp-form-section-title">Privacy Settings</div>
              <div className="jsp-toggle-row">
                <input type="checkbox" id="is_public" checked={user.is_public} onChange={e=>set("is_public",e.target.checked)} disabled={!editing} style={{width:16,height:16,accentColor:"#4f46e5"}}/>
                <div>
                  <label htmlFor="is_public" className="jsp-toggle-label">Make my profile public</label>
                  <div className="jsp-toggle-sub">When enabled, other users can view your basic profile information.</div>
                </div>
              </div>
            </div>

            {editing && (
              <div style={{display:"flex",justifyContent:"flex-end",gap:10,marginTop:24,paddingTop:20,borderTop:"1px solid #e0e7ff"}}>
                <button className="jsp-btn jsp-btn--ghost" onClick={handleCancel}>Cancel</button>
                <button className="jsp-btn jsp-btn--primary" onClick={handleSave}>💾 Save Changes</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="jsp-footer">
        <span>© {new Date().getFullYear()} TalentMatch AI. All rights reserved.</span>
        <div style={{display:"flex",gap:20}}>
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Use</a>
          <a href="#">Contact Us</a>
        </div>
      </div>
    </div>
  );
}

export default Profile;