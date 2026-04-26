import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";
import {
  BellIcon, CheckCircleIcon, ExclamationCircleIcon,
  XCircleIcon, ChatBubbleLeftIcon, InformationCircleIcon,
  TrashIcon, EyeIcon, EyeSlashIcon, MagnifyingGlassIcon,
  FunnelIcon, EnvelopeIcon, ArrowPathIcon,
} from "@heroicons/react/24/outline";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

  .np-wrap * { box-sizing: border-box; }
  .np-wrap { font-family: 'DM Sans', sans-serif; min-height: 100vh; background: #f5f6ff; color: #1e1b3a; }

  /* Hero */
  .np-hero {
    position: relative; overflow: hidden;
    background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 52%, #ede9fe 100%);
    padding: 40px 40px 72px; border-bottom: 1px solid #ddd6fe;
  }
  .np-blob { position: absolute; border-radius: 50%; filter: blur(80px); opacity: .2; pointer-events: none; }
  .np-blob--1 { width: 400px; height: 400px; background: radial-gradient(circle,#6366f1,transparent); top: -100px; left: -60px; animation: np-drift 12s ease-in-out infinite alternate; }
  .np-blob--2 { width: 260px; height: 260px; background: radial-gradient(circle,#8b5cf6,transparent); bottom: -60px; right: 8%; animation: np-drift 15s ease-in-out infinite alternate-reverse; }
  @keyframes np-drift { 0%{transform:translate(0,0)} 100%{transform:translate(22px,12px)} }
  .np-grid { position: absolute; inset: 0; pointer-events: none; background-image: linear-gradient(rgba(99,102,241,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,.06) 1px,transparent 1px); background-size: 40px 40px; }

  .np-hero-inner { position: relative; z-index: 1; max-width: 1000px; margin: 0 auto; }
  .np-hero-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
  .np-hero-title { font-family: 'Syne', sans-serif; font-size: clamp(22px,3.5vw,34px); font-weight: 800; color: #1e1b3a; margin: 0 0 6px; letter-spacing: -.3px; }
  .np-hero-sub { font-size: 15px; color: #6b7280; margin: 0; }
  .np-hero-actions { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }

  /* Stats strip */
  .np-stats-strip { position: relative; z-index: 10; margin: -24px auto 0; max-width: 1000px; padding: 0 40px; }
  .np-stats-inner { background: #fff; border: 1px solid #e0e7ff; border-radius: 14px; display: grid; grid-template-columns: repeat(3,1fr); box-shadow: 0 8px 32px rgba(99,102,241,.1); }
  .np-stat { padding: 16px 20px; display: flex; align-items: center; gap: 14px; }
  .np-stat:not(:last-child) { border-right: 1px solid #e0e7ff; }
  .np-stat-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .np-stat-icon svg { width: 20px; height: 20px; }
  .np-stat-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .5px; color: #9ca3af; }
  .np-stat-val { font-size: 22px; font-weight: 800; color: #1e1b3a; }

  /* Main */
  .np-main { max-width: 1000px; margin: 0 auto; padding: 32px 40px 80px; }

  /* Filter bar */
  .np-filter-bar { background: #fff; border: 1px solid #e0e7ff; border-radius: 14px; padding: 16px 20px; margin-bottom: 20px; box-shadow: 0 4px 16px rgba(99,102,241,.06); display: flex; gap: 12px; flex-wrap: wrap; }
  .np-search-wrap { position: relative; flex: 1; min-width: 200px; }
  .np-search-wrap svg { position: absolute; left: 11px; top: 50%; transform: translateY(-50%); width: 15px; height: 15px; color: #9ca3af; }
  .np-search-input { width: 100%; padding: 9px 12px 9px 34px; border: 1px solid #e0e7ff; border-radius: 10px; font-family: 'DM Sans',sans-serif; font-size: 14px; color: #1e1b3a; background: #f5f6ff; outline: none; transition: all .2s; }
  .np-search-input:focus { border-color: #a5b4fc; background: #fff; }
  .np-filter-tabs { display: flex; gap: 6px; flex-wrap: wrap; }
  .np-tab { display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px; border-radius: 10px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all .2s; border: none; font-family: 'DM Sans',sans-serif; }
  .np-tab--active { background: linear-gradient(135deg,#4f46e5,#7c3aed); color: #fff; box-shadow: 0 4px 12px rgba(79,70,229,.2); }
  .np-tab--inactive { background: #f5f6ff; border: 1px solid #e0e7ff; color: #6b7280; }
  .np-tab--inactive:hover { border-color: #c7d2fe; color: #4f46e5; }
  .np-tab svg { width: 14px; height: 14px; }

  /* Notifications list */
  .np-list { background: #fff; border: 1px solid #e0e7ff; border-radius: 14px; overflow: hidden; box-shadow: 0 4px 16px rgba(99,102,241,.06); }
  .np-item { padding: 18px 20px; border-bottom: 1px solid #f0f0ff; transition: background .15s; display: flex; align-items: flex-start; gap: 14px; animation: np-in .3s ease both; }
  .np-item:last-child { border-bottom: none; }
  .np-item:hover { background: #fafafe; }
  .np-item--unread { background: #f5f6ff; }
  .np-item--unread:hover { background: #eef2ff; }
  @keyframes np-in { from{opacity:0;transform:translateX(-6px)} to{opacity:1;transform:translateX(0)} }

  .np-item-icon { width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .np-item-icon svg { width: 20px; height: 20px; }
  .np-item-body { flex: 1; min-width: 0; }
  .np-item-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; flex-wrap: wrap; margin-bottom: 4px; }
  .np-item-title { font-family: 'Syne',sans-serif; font-size: 15px; font-weight: 700; color: #1e1b3a; margin: 0; }
  .np-item-title--read { color: #6b7280; }
  .np-item-msg { font-size: 13px; color: #6b7280; line-height: 1.6; margin-bottom: 10px; }
  .np-item-meta { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  .np-cat-pill { padding: 2px 10px; border-radius: 100px; font-size: 11px; font-weight: 700; }
  .np-cat-job { background: #dbeafe; color: #1d4ed8; }
  .np-cat-application { background: #dcfce7; color: #15803d; }
  .np-cat-interview { background: #f3e8ff; color: #7c3aed; }
  .np-cat-system { background: #f3f4f6; color: #374151; }
  .np-cat-message { background: #e0e7ff; color: #4f46e5; }
  .np-cat-default { background: #f3f4f6; color: #6b7280; }
  .np-recipient-pill { background: #f5f6ff; border: 1px solid #e0e7ff; color: #9ca3af; padding: 2px 8px; border-radius: 100px; font-size: 11px; }
  .np-item-time { font-size: 12px; color: #9ca3af; white-space: nowrap; }
  .np-unread-dot { width: 8px; height: 8px; border-radius: 50%; background: #4f46e5; flex-shrink: 0; margin-top: 6px; }

  /* Item actions */
  .np-item-actions { display: flex; align-items: center; gap: 4px; flex-shrink: 0; }
  .np-action-btn { display: inline-flex; align-items: center; gap: 4px; padding: 5px 10px; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; border: none; transition: all .2s; font-family: 'DM Sans',sans-serif; }
  .np-action-btn--read { background: #eef2ff; color: #4f46e5; }
  .np-action-btn--read:hover { background: #e0e7ff; }
  .np-action-btn--delete { background: #fef2f2; color: #dc2626; }
  .np-action-btn--delete:hover { background: #fee2e2; }
  .np-action-btn svg { width: 13px; height: 13px; }

  /* Empty */
  .np-empty { padding: 60px 20px; text-align: center; }
  .np-empty-emoji { font-size: 52px; margin-bottom: 14px; }
  .np-empty-title { font-family: 'Syne',sans-serif; font-size: 20px; font-weight: 700; color: #1e1b3a; margin-bottom: 8px; }
  .np-empty-sub { font-size: 14px; color: #9ca3af; }

  /* Tips */
  .np-tips { margin-top: 24px; background: #eef2ff; border: 1px solid #c7d2fe; border-radius: 14px; padding: 20px 24px; }
  .np-tips-title { font-family: 'Syne',sans-serif; font-size: 14px; font-weight: 700; color: #4f46e5; margin-bottom: 10px; }
  .np-tips ul { margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 6px; }
  .np-tips li { font-size: 13px; color: #4b5563; display: flex; gap: 8px; }
  .np-tips li::before { content: "→"; color: #6366f1; }

  /* Error */
  .np-error { margin-top: 20px; padding: 14px 18px; background: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; display: flex; align-items: center; gap: 10px; }
  .np-error svg { width: 18px; height: 18px; color: #dc2626; flex-shrink: 0; }
  .np-error p { margin: 0; font-size: 14px; color: #b91c1c; }

  /* Buttons */
  .np-btn { display: inline-flex; align-items: center; gap: 6px; padding: 9px 16px; border-radius: 10px; font-size: 13px; font-weight: 600; cursor: pointer; border: none; transition: all .2s; font-family: 'DM Sans',sans-serif; }
  .np-btn--outline { background: #fff; border: 1px solid #e0e7ff; color: #4b5563; }
  .np-btn--outline:hover { border-color: #c7d2fe; color: #4f46e5; }
  .np-btn--primary { background: linear-gradient(135deg,#4f46e5,#7c3aed); color: #fff; box-shadow: 0 4px 14px rgba(79,70,229,.2); }
  .np-btn--green { background: linear-gradient(135deg,#16a34a,#15803d); color: #fff; box-shadow: 0 4px 14px rgba(22,163,74,.2); }
  .np-btn svg { width: 15px; height: 15px; }

  /* Loading */
  .np-loading { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 60vh; gap: 20px; }
  .np-spinner { width: 44px; height: 44px; border: 3px solid #e0e7ff; border-top-color: #6366f1; border-radius: 50%; animation: np-spin .8s linear infinite; }
  @keyframes np-spin { to{transform:rotate(360deg)} }

  @media(max-width:900px){ .np-stats-inner{grid-template-columns:1fr} .np-stat:not(:last-child){border-right:none;border-bottom:1px solid #e0e7ff} }
  @media(max-width:640px){ .np-hero{padding:28px 16px 60px} .np-stats-strip{padding:0 16px} .np-main{padding:28px 16px 60px} }
`;

function NotificationsPage() {
  const { notifications, loading, error, markAsRead, markAllAsRead, deleteNotification, fetchNotifications } = useNotifications();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => { fetchNotifications(); }, []);

  const filteredNotifications = notifications.filter(n => {
    if (filter === "unread" && n.read) return false;
    if (filter === "read" && !n.read) return false;
    if (search) {
      const s = search.toLowerCase();
      return n.title?.toLowerCase().includes(s) || n.message?.toLowerCase().includes(s) || n.category?.toLowerCase().includes(s);
    }
    return true;
  });

  const unreadCount = notifications.filter(n=>!n.read).length;
  const readCount = notifications.length - unreadCount;

  const getIcon = (type) => {
    const base = {width:20,height:20};
    switch(type) {
      case "success": return <CheckCircleIcon style={{...base,color:"#16a34a"}}/>;
      case "error": return <XCircleIcon style={{...base,color:"#dc2626"}}/>;
      case "warning": return <ExclamationCircleIcon style={{...base,color:"#d97706"}}/>;
      case "message": return <ChatBubbleLeftIcon style={{...base,color:"#4f46e5"}}/>;
      default: return <InformationCircleIcon style={{...base,color:"#6b7280"}}/>;
    }
  };

  const getIconBg = (type) => {
    switch(type) {
      case "success": return "#f0fdf4";
      case "error": return "#fef2f2";
      case "warning": return "#fffbeb";
      case "message": return "#eef2ff";
      default: return "#f5f6ff";
    }
  };

  const getCatClass = (cat) => {
    switch(cat?.toLowerCase()) {
      case "job": return "np-cat-job";
      case "application": return "np-cat-application";
      case "interview": return "np-cat-interview";
      case "system": return "np-cat-system";
      case "message": return "np-cat-message";
      default: return "np-cat-default";
    }
  };

  const formatTime = (d) => {
    if (!d) return "";
    try {
      const date = new Date(d), now = new Date();
      const mins = Math.floor((now-date)/60000), hrs = Math.floor(mins/60), days = Math.floor(hrs/24);
      if (mins < 60) return `${mins}m ago`;
      if (hrs < 24) return `${hrs}h ago`;
      if (days < 7) return `${days}d ago`;
      return date.toLocaleDateString();
    } catch { return ""; }
  };

  const handleRefresh = async () => { setIsRefreshing(true); await fetchNotifications(); setIsRefreshing(false); };

  if (loading && notifications.length === 0) return (
    <div className="np-wrap"><style>{styles}</style>
      <div className="np-loading"><div className="np-spinner"/><p style={{color:"#6366f1",fontWeight:500}}>Loading notifications…</p></div>
    </div>
  );

  return (
    <div className="np-wrap">
      <style>{styles}</style>

      {/* Hero */}
      <div className="np-hero">
        <div className="np-blob np-blob--1"/><div className="np-blob np-blob--2"/><div className="np-grid"/>
        <div className="np-hero-inner">
          <div className="np-hero-top">
            <div>
              <h1 className="np-hero-title">Notifications</h1>
              <p className="np-hero-sub">Stay updated with your latest activities</p>
            </div>
            <div className="np-hero-actions">
              <button className="np-btn np-btn--outline" onClick={handleRefresh} disabled={isRefreshing}>
                <ArrowPathIcon style={{width:15,height:15,animation:isRefreshing?"np-spin .8s linear infinite":undefined}}/>{isRefreshing?"Refreshing…":"Refresh"}
              </button>
              {/* {unreadCount > 0 && (
                <button className="np-btn np-btn--green" onClick={markAllAsRead}><CheckCircleIcon/>Mark All Read</button>
              )} */}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="np-stats-strip">
        <div className="np-stats-inner">
          <div className="np-stat">
            <div className="np-stat-icon" style={{background:"#eef2ff"}}><BellIcon style={{color:"#4f46e5"}}/></div>
            <div><div className="np-stat-label">Total</div><div className="np-stat-val">{notifications.length}</div></div>
          </div>
          <div className="np-stat">
            <div className="np-stat-icon" style={{background:"#fef2f2"}}><EnvelopeIcon style={{color:"#dc2626"}}/></div>
            <div><div className="np-stat-label">Unread</div><div className="np-stat-val" style={{color:"#dc2626"}}>{unreadCount}</div></div>
          </div>
          <div className="np-stat">
            <div className="np-stat-icon" style={{background:"#f0fdf4"}}><EyeIcon style={{color:"#16a34a"}}/></div>
            <div><div className="np-stat-label">Read</div><div className="np-stat-val" style={{color:"#16a34a"}}>{readCount}</div></div>
          </div>
        </div>
      </div>

      <div className="np-main">
        {/* Filter bar */}
        <div className="np-filter-bar">
          <div className="np-search-wrap">
            <MagnifyingGlassIcon/>
            <input className="np-search-input" placeholder="Search notifications…" value={search} onChange={e=>setSearch(e.target.value)}/>
          </div>
          <div className="np-filter-tabs">
            <button className={`np-tab ${filter==="all"?"np-tab--active":"np-tab--inactive"}`} onClick={()=>setFilter("all")}><FunnelIcon/>All</button>
            <button className={`np-tab ${filter==="unread"?"np-tab--active":"np-tab--inactive"}`} onClick={()=>setFilter("unread")}><EyeSlashIcon/>Unread ({unreadCount})</button>
            <button className={`np-tab ${filter==="read"?"np-tab--active":"np-tab--inactive"}`} onClick={()=>setFilter("read")}><EyeIcon/>Read ({readCount})</button>
          </div>
        </div>

        {/* Notifications list */}
        <div className="np-list">
          {filteredNotifications.length === 0 ? (
            <div className="np-empty">
              <div className="np-empty-emoji">📭</div>
              <h3 className="np-empty-title">{search ? "No matching notifications" : "No notifications yet"}</h3>
              <p className="np-empty-sub">{search ? "Try a different search term" : "Notifications will appear here when you have updates"}</p>
            </div>
          ) : filteredNotifications.map((n, i) => (
            <div key={n.id} className={`np-item${!n.read?" np-item--unread":""}`} style={{animationDelay:`${i*30}ms`}}>
              {!n.read && <div className="np-unread-dot"/>}
              <div className="np-item-icon" style={{background:getIconBg(n.notification_type)}}>{getIcon(n.notification_type)}</div>
              <div className="np-item-body">
                <div className="np-item-top">
                  <h3 className={`np-item-title${n.read?" np-item-title--read":""}`}>{n.title}</h3>
                  <div style={{display:"flex",alignItems:"center",gap:12,flexShrink:0}}>
                    <span className="np-item-time">{formatTime(n.created_at)}</span>
                    <div className="np-item-actions">
                      {!n.read && (
                        <button className="np-action-btn np-action-btn--read" onClick={()=>markAsRead(n.id)} title="Mark as read"><EyeIcon/></button>
                      )}
                      <button className="np-action-btn np-action-btn--delete" onClick={()=>deleteNotification(n.id)} title="Delete"><TrashIcon/></button>
                    </div>
                  </div>
                </div>
                <p className="np-item-msg">{n.message}</p>
                <div className="np-item-meta">
                  {n.category && <span className={`np-cat-pill ${getCatClass(n.category)}`}>{n.category}</span>}
                  {n.recipient_type && <span className="np-recipient-pill">{n.recipient_type}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="np-error"><ExclamationCircleIcon/><p>{error}</p></div>
        )}

        {/* Tips when empty */}
        {notifications.length === 0 && !loading && (
          <div className="np-tips">
            <div className="np-tips-title">💡 Tips for notifications</div>
            <ul>
              <li>Notifications appear when you apply for jobs</li>
              <li>You'll get updates about your applications</li>
              <li>Interview invitations will appear here</li>
              <li>System updates and announcements will be posted</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default NotificationsPage;