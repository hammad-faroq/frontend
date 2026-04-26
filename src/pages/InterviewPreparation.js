// src/pages/InterviewPreparation.js
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  getInterviewPreparation,
  generateMoreQuestions,
  sendMockInterviewMessage,
  startMockInterview,
  submitMockInterviewAnswers,
  getMockInterviewResults,
  getMockInterviewProgress,
} from "../services/api";
import { useNavigate } from "react-router-dom";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

  .ip-wrap * { box-sizing: border-box; }
  .ip-wrap { font-family: 'DM Sans', sans-serif; min-height: 100vh; background: #f5f6ff; color: #1e1b3a; }

  /* ── Hero ── */
  .ip-hero {
    position: relative; overflow: hidden;
    background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 52%, #ede9fe 100%);
    padding: 40px 40px 64px; border-bottom: 1px solid #ddd6fe;
  }
  .ip-blob { position: absolute; border-radius: 50%; filter: blur(80px); opacity: .2; pointer-events: none; }
  .ip-blob--1 { width: 420px; height: 420px; background: radial-gradient(circle,#6366f1,transparent); top: -120px; left: -60px; animation: ip-drift 12s ease-in-out infinite alternate; }
  .ip-blob--2 { width: 280px; height: 280px; background: radial-gradient(circle,#10b981,transparent); bottom: -80px; right: 6%; animation: ip-drift 16s ease-in-out infinite alternate-reverse; }
  @keyframes ip-drift { 0%{transform:translate(0,0) scale(1)} 100%{transform:translate(22px,12px) scale(1.05)} }
  .ip-grid-bg { position: absolute; inset: 0; pointer-events: none; background-image: linear-gradient(rgba(99,102,241,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,.06) 1px,transparent 1px); background-size: 40px 40px; }
  .ip-hero-inner { position: relative; z-index: 1; max-width: 1200px; margin: 0 auto; display: flex; align-items: flex-end; justify-content: space-between; gap: 20px; flex-wrap: wrap; }
  .ip-badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(99,102,241,.12); border: 1px solid rgba(99,102,241,.3); color: #4f46e5; padding: 5px 14px; border-radius: 100px; font-size: 11px; font-weight: 700; letter-spacing: .6px; text-transform: uppercase; margin-bottom: 12px; }
  .ip-badge-dot { width: 7px; height: 7px; border-radius: 50%; background: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,.2); animation: ip-pulse 2s infinite; }
  @keyframes ip-pulse { 0%,100%{box-shadow:0 0 0 3px rgba(99,102,241,.2)} 50%{box-shadow:0 0 0 6px rgba(99,102,241,.06)} }
  .ip-hero-title { font-family: 'Syne', sans-serif; font-size: clamp(22px,3.5vw,36px); font-weight: 800; color: #1e1b3a; margin: 0 0 8px; letter-spacing: -.4px; }
  .ip-hero-title span { background: linear-gradient(90deg,#4f46e5,#7c3aed); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
  .ip-hero-sub { color: #6b7280; font-size: 14px; margin: 0; }
  .ip-hero-actions { display: flex; gap: 10px; flex-shrink: 0; }

  /* ── Buttons ── */
  .ip-btn { display: inline-flex; align-items: center; gap: 6px; padding: 10px 18px; border-radius: 10px; font-size: 13px; font-weight: 600; cursor: pointer; border: none; transition: all .2s; font-family: 'DM Sans',sans-serif; white-space: nowrap; }
  .ip-btn--primary { background: linear-gradient(135deg,#4f46e5,#7c3aed); color: #fff; box-shadow: 0 4px 14px rgba(79,70,229,.25); }
  .ip-btn--primary:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(79,70,229,.35); }
  .ip-btn--primary:disabled { opacity: .6; cursor: not-allowed; transform: none; }
  .ip-btn--ghost { background: #f5f6ff; border: 1px solid #e0e7ff; color: #4f46e5; }
  .ip-btn--ghost:hover { background: #eef2ff; transform: translateY(-1px); }
  .ip-btn--green { background: linear-gradient(135deg,#059669,#10b981); color: #fff; box-shadow: 0 4px 14px rgba(5,150,105,.2); }
  .ip-btn--green:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(5,150,105,.3); }
  .ip-btn--green:disabled { opacity: .6; cursor: not-allowed; transform: none; }
  .ip-btn--purple { background: linear-gradient(135deg,#7c3aed,#6366f1); color: #fff; box-shadow: 0 4px 14px rgba(124,58,237,.2); }
  .ip-btn--purple:hover { transform: translateY(-2px); }
  .ip-btn--gray { background: #f3f4f6; border: 1px solid #e5e7eb; color: #374151; }
  .ip-btn--gray:hover { background: #e5e7eb; }
  .ip-btn--sm { padding: 7px 14px; font-size: 12px; }
  .ip-btn--full { width: 100%; justify-content: center; }
  .ip-btn svg { width: 15px; height: 15px; flex-shrink: 0; }

  /* ── Main layout ── */
  .ip-main { max-width: 1200px; margin: 0 auto; padding: 32px 40px 80px; }

  /* ── Cards ── */
  .ip-card { background: #fff; border: 1px solid #e8eaf6; border-radius: 16px; padding: 24px; margin-bottom: 20px; transition: box-shadow .2s, border-color .2s; animation: ip-in .4s ease both; }
  .ip-card:hover { box-shadow: 0 8px 32px rgba(99,102,241,.08); border-color: #c7d2fe; }
  .ip-card:last-child { margin-bottom: 0; }
  @keyframes ip-in { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  .ip-card-title { font-family: 'Syne',sans-serif; font-size: 18px; font-weight: 700; color: #1e1b3a; margin: 0 0 4px; }
  .ip-card-sub { font-size: 13px; color: #6b7280; margin: 0; }

  /* ── Loading ── */
  .ip-loading { min-height: 60vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; }
  .ip-spinner { width: 44px; height: 44px; border: 3px solid #e0e7ff; border-top-color: #6366f1; border-radius: 50%; animation: ip-spin .8s linear infinite; }
  @keyframes ip-spin { to{transform:rotate(360deg)} }

  /* ── Empty state ── */
  .ip-empty { text-align: center; padding: 60px 20px; }
  .ip-empty-icon { width: 72px; height: 72px; background: linear-gradient(135deg,#eef2ff,#ede9fe); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; font-size: 28px; }
  .ip-empty-title { font-family: 'Syne',sans-serif; font-size: 20px; font-weight: 700; color: #1e1b3a; margin: 0 0 8px; }
  .ip-empty-sub { font-size: 14px; color: #9ca3af; margin: 0 0 24px; }

  /* ── List card (prep item) ── */
  .ip-list-card { background: #fff; border: 1px solid #e8eaf6; border-radius: 16px; padding: 22px 24px; margin-bottom: 14px; transition: transform .2s, box-shadow .2s, border-color .2s; animation: ip-in .4s ease both; }
  .ip-list-card:hover { transform: translateY(-3px); box-shadow: 0 12px 40px rgba(99,102,241,.12); border-color: #c7d2fe; }
  .ip-list-job-title { font-family: 'Syne',sans-serif; font-size: 18px; font-weight: 700; color: #1e1b3a; margin: 0 0 4px; }
  .ip-list-company { font-size: 13px; color: #6b7280; margin: 0 0 14px; }
  .ip-count-chip { display: inline-flex; align-items: center; gap: 8px; }
  .ip-count-badge { width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; }
  .ip-count-label { font-size: 13px; color: #6b7280; }

  /* ── Detail view: two-col grid ── */
  .ip-detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }

  /* ── Progress section ── */
  .ip-progress-card { background: #fff; border: 1px solid #e8eaf6; border-radius: 16px; padding: 24px; margin-bottom: 20px; }
  .ip-progress-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
  .ip-progress-stats { display: flex; gap: 20px; flex-wrap: wrap; }
  .ip-progress-stat { text-align: right; }
  .ip-progress-stat-val { font-family: 'Syne',sans-serif; font-size: 18px; font-weight: 800; }
  .ip-progress-stat-label { font-size: 11px; color: #9ca3af; font-weight: 600; text-transform: uppercase; letter-spacing: .4px; }

  .ip-sessions-banner { background: linear-gradient(135deg,#eef2ff,#ede9fe); border: 1px solid #c7d2fe; border-radius: 12px; padding: 16px 20px; margin-bottom: 20px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
  .ip-sessions-val { font-family: 'Syne',sans-serif; font-size: 32px; font-weight: 800; color: #4f46e5; }
  .ip-sessions-label { font-size: 12px; color: #6366f1; font-weight: 600; }

  .ip-bar-chart { display: flex; align-items: flex-end; height: 96px; gap: 6px; margin-bottom: 8px; }
  .ip-bar-wrap { flex: 1; display: flex; flex-direction: column; align-items: center; }
  .ip-bar { width: 100%; background: linear-gradient(to top,#4f46e5,#a5b4fc); border-radius: 6px 6px 0 0; transition: all .3s; cursor: pointer; position: relative; min-height: 6px; }
  .ip-bar:hover { background: linear-gradient(to top,#4338ca,#6366f1); }
  .ip-bar-tooltip { position: absolute; top: -28px; left: 50%; transform: translateX(-50%); background: #1e1b3a; color: #fff; font-size: 10px; font-weight: 700; padding: 3px 6px; border-radius: 6px; white-space: nowrap; opacity: 0; transition: opacity .2s; pointer-events: none; }
  .ip-bar:hover .ip-bar-tooltip { opacity: 1; }
  .ip-bar-idx { font-size: 10px; color: #9ca3af; margin-top: 4px; }

  .ip-progress-table { margin-top: 16px; }
  .ip-progress-table-head { display: flex; justify-content: space-between; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .5px; color: #9ca3af; padding-bottom: 8px; border-bottom: 1px solid #e0e7ff; margin-bottom: 8px; }
  .ip-progress-row { display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; border-radius: 10px; margin-bottom: 6px; transition: background .15s; }
  .ip-progress-row:hover { background: #f5f6ff; }
  .ip-score-pill { font-weight: 700; font-size: 13px; padding: 2px 10px; border-radius: 100px; }
  .ip-score--high { background: #dcfce7; color: #15803d; }
  .ip-score--mid { background: #fef3c7; color: #92400e; }
  .ip-score--low { background: #fee2e2; color: #991b1b; }

  /* ── Mock interview setup ── */
  .ip-setup-card { background: linear-gradient(135deg,#eef2ff,#ede9fe); border: 1px solid #c7d2fe; border-radius: 14px; padding: 20px; margin-bottom: 20px; }
  .ip-setup-title { font-family: 'Syne',sans-serif; font-size: 16px; font-weight: 700; color: #1e1b3a; margin: 0 0 14px; }
  .ip-setup-field { margin-bottom: 16px; }
  .ip-setup-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .5px; color: #6b7280; margin-bottom: 8px; display: block; }
  .ip-difficulty-btns { display: flex; gap: 8px; }
  .ip-difficulty-btn { flex: 1; padding: 8px; border-radius: 10px; border: 1.5px solid #e0e7ff; background: #fff; font-size: 13px; font-weight: 600; cursor: pointer; transition: all .2s; font-family: 'DM Sans',sans-serif; text-transform: capitalize; color: #374151; }
  .ip-difficulty-btn--active { border-color: #6366f1; background: #eef2ff; color: #4f46e5; }
  .ip-type-btns { display: flex; gap: 8px; flex-wrap: wrap; }
  .ip-type-btn { padding: 8px 14px; border-radius: 10px; border: 1.5px solid #e0e7ff; background: #fff; font-size: 13px; font-weight: 600; cursor: pointer; transition: all .2s; font-family: 'DM Sans',sans-serif; text-transform: capitalize; color: #374151; }
  .ip-type-btn--active { border-color: #6366f1; background: #eef2ff; color: #4f46e5; }
  .ip-range { width: 100%; accent-color: #6366f1; cursor: pointer; }
  .ip-range-labels { display: flex; justify-content: space-between; font-size: 11px; color: #9ca3af; margin-top: 4px; }

  /* ── Mock interview in progress ── */
  .ip-mock-card { background: #fff; border: 1.5px solid #c7d2fe; border-radius: 14px; padding: 20px; margin-bottom: 16px; }
  .ip-mock-q-wrap { border: 1px solid #e0e7ff; border-radius: 12px; padding: 16px; margin-bottom: 12px; }
  .ip-q-num { width: 30px; height: 30px; border-radius: 50%; background: linear-gradient(135deg,#eef2ff,#ede9fe); display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; color: #4f46e5; flex-shrink: 0; }
  .ip-q-text { font-size: 14px; font-weight: 600; color: #1e1b3a; margin-bottom: 10px; }
  .ip-q-textarea { width: 100%; border: 1px solid #e0e7ff; border-radius: 10px; padding: 12px 14px; font-family: 'DM Sans',sans-serif; font-size: 14px; color: #1e1b3a; background: #f5f6ff; outline: none; resize: vertical; min-height: 100px; transition: all .2s; }
  .ip-q-textarea:focus { border-color: #a5b4fc; background: #fff; box-shadow: 0 0 0 3px rgba(99,102,241,.08); }
  .ip-char-count { font-size: 11px; color: #9ca3af; text-align: right; margin-top: 4px; }

  /* ── Results ── */
  .ip-results-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
  .ip-result-score { text-align: center; }
  .ip-result-score-val { font-family: 'Syne',sans-serif; font-size: 36px; font-weight: 800; color: #059669; line-height: 1; }
  .ip-result-score-label { font-size: 12px; color: #6b7280; margin-top: 2px; }
  .ip-result-item { border: 1px solid #e8eaf6; border-radius: 12px; padding: 16px; margin-bottom: 12px; transition: box-shadow .2s; }
  .ip-result-item:hover { box-shadow: 0 4px 16px rgba(99,102,241,.08); }
  .ip-result-q { font-size: 14px; font-weight: 600; color: #1e1b3a; margin-bottom: 10px; }
  .ip-result-section-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .5px; margin-bottom: 6px; display: flex; align-items: center; gap: 5px; }
  .ip-answer-box { background: #f5f6ff; border: 1px solid #e0e7ff; border-radius: 10px; padding: 12px 14px; font-size: 13.5px; color: #374151; line-height: 1.65; white-space: pre-wrap; margin-bottom: 10px; }
  .ip-feedback-box { background: #eef2ff; border: 1px solid #c7d2fe; border-radius: 10px; padding: 12px 14px; font-size: 13.5px; color: #374151; line-height: 1.65; white-space: pre-wrap; }
  .ip-summary-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 10px; margin: 16px 0; }
  .ip-summary-cell { background: #f5f6ff; border: 1px solid #e0e7ff; border-radius: 10px; padding: 12px; text-align: center; }
  .ip-summary-val { font-family: 'Syne',sans-serif; font-size: 20px; font-weight: 800; }
  .ip-summary-label { font-size: 11px; color: #9ca3af; margin-top: 2px; }

  /* ── Tabs ── */
  .ip-tabs { display: flex; border-bottom: 1.5px solid #e0e7ff; margin-bottom: 20px; }
  .ip-tab { padding: 10px 16px; font-size: 13px; font-weight: 600; cursor: pointer; border: none; background: none; color: #9ca3af; border-bottom: 2px solid transparent; margin-bottom: -2px; transition: all .2s; font-family: 'DM Sans',sans-serif; }
  .ip-tab--active { color: #4f46e5; border-bottom-color: #4f46e5; }
  .ip-tab:hover:not(.ip-tab--active) { color: #374151; }

  /* ── Q items ── */
  .ip-q-item { border: 1px solid #e0e7ff; border-radius: 12px; padding: 14px 16px; margin-bottom: 10px; transition: border-color .2s, background .2s; }
  .ip-q-item:hover { border-color: #c7d2fe; background: #f5f6ff; }
  .ip-q-ideal { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 10px 12px; margin-top: 8px; font-size: 13px; color: #15803d; line-height: 1.6; }
  .ip-q-sample { background: #eef2ff; border: 1px solid #c7d2fe; border-radius: 8px; padding: 10px 12px; margin-top: 8px; font-size: 13px; color: #4f46e5; line-height: 1.6; }

  /* ── Chat ── */
  .ip-chat-modes { display: flex; gap: 8px; margin-bottom: 14px; flex-wrap: wrap; }
  .ip-chat-mode-btn { padding: 6px 12px; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; border: 1.5px solid #e0e7ff; background: #f5f6ff; color: #6b7280; transition: all .2s; font-family: 'DM Sans',sans-serif; }
  .ip-chat-mode-btn--active-blue { border-color: #6366f1; background: #eef2ff; color: #4f46e5; }
  .ip-chat-mode-btn--active-green { border-color: #10b981; background: #f0fdf4; color: #059669; }
  .ip-chat-mode-btn--active-purple { border-color: #7c3aed; background: #f5f3ff; color: #7c3aed; }
  .ip-chat-suggestions { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 14px; }
  .ip-chat-suggestion { font-size: 11.5px; background: #f5f6ff; border: 1px solid #e0e7ff; color: #374151; padding: 5px 10px; border-radius: 8px; cursor: pointer; transition: all .2s; font-family: 'DM Sans',sans-serif; }
  .ip-chat-suggestion:hover { background: #eef2ff; border-color: #c7d2fe; color: #4f46e5; }
  .ip-chat-box { height: 340px; overflow-y: auto; border: 1px solid #e0e7ff; border-radius: 12px; background: #f5f6ff; padding: 12px; margin-bottom: 12px; display: flex; flex-direction: column; gap: 10px; }
  .ip-chat-msg { padding: 10px 14px; border-radius: 12px; font-size: 13.5px; line-height: 1.6; white-space: pre-wrap; }
  .ip-chat-msg--user { background: linear-gradient(135deg,#eef2ff,#ede9fe); border: 1px solid #c7d2fe; margin-left: 40px; color: #1e1b3a; }
  .ip-chat-msg--ai { background: #fff; border: 1px solid #e0e7ff; margin-right: 40px; color: #1e1b3a; }
  .ip-chat-avatar { width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; flex-shrink: 0; }
  .ip-chat-input-row { display: flex; gap: 8px; }
  .ip-chat-input { flex: 1; border: 1px solid #e0e7ff; border-radius: 10px; padding: 10px 14px; font-family: 'DM Sans',sans-serif; font-size: 14px; color: #1e1b3a; background: #f5f6ff; outline: none; transition: all .2s; }
  .ip-chat-input:focus { border-color: #a5b4fc; background: #fff; box-shadow: 0 0 0 3px rgba(99,102,241,.08); }
  .ip-chat-input:disabled { opacity: .6; }
  .ip-typing-dots { display: flex; gap: 4px; align-items: center; padding: 8px 0; }
  .ip-typing-dot { width: 7px; height: 7px; border-radius: 50%; background: #a5b4fc; animation: ip-bounce .8s ease infinite; }
  .ip-typing-dot:nth-child(2) { animation-delay: .15s; }
  .ip-typing-dot:nth-child(3) { animation-delay: .3s; }
  @keyframes ip-bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-6px)} }

  /* ── Promo banner ── */
  .ip-mock-promo { background: linear-gradient(135deg,#eef2ff,#ede9fe); border: 1px solid #c7d2fe; border-radius: 12px; padding: 16px 20px; margin-bottom: 20px; display: flex; align-items: center; justify-content: space-between; gap: 14px; flex-wrap: wrap; }
  .ip-mock-promo-title { font-family: 'Syne',sans-serif; font-size: 15px; font-weight: 700; color: #1e1b3a; margin: 0 0 3px; }
  .ip-mock-promo-sub { font-size: 13px; color: #6b7280; margin: 0; }

  /* ── Section divider ── */
  .ip-divider { border: none; border-top: 1px solid #e0e7ff; margin: 20px 0; }

  /* ── Scrollable questions ── */
  .ip-q-scroll { max-height: 420px; overflow-y: auto; padding-right: 4px; }

  @media(max-width:900px){ .ip-detail-grid{grid-template-columns:1fr} }
  @media(max-width:640px){ .ip-hero{padding:28px 16px 52px} .ip-main{padding:24px 16px 60px} .ip-summary-grid{grid-template-columns:1fr} }
`;

// ── helpers ────────────────────────────────────────────────
const normalizeScore = (score) => {
  const num = Number(score);
  if (!num || isNaN(num)) return 0;
  return num > 10 ? num / 10 : num;
};

const BackIcon = () => (
  <svg style={{width:16,height:16}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
  </svg>
);
const SendIcon = () => (
  <svg style={{width:15,height:15}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
  </svg>
);
const PlusIcon = () => (
  <svg style={{width:15,height:15}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
  </svg>
);
const CheckIcon = () => (
  <svg style={{width:15,height:15}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
  </svg>
);
const PlayIcon = () => (
  <svg style={{width:15,height:15}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
  </svg>
);
const RefreshIcon = () => (
  <svg style={{width:15,height:15}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
  </svg>
);

// ─────────────────────────────────────────────────────────────
function InterviewPreparation() {
  const [preparations, setPreparations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedJob, setSelectedJob] = useState(null);
  const [activeTab, setActiveTab] = useState("technical");
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isChatting, setIsChatting] = useState(false);
  const [chatMode, setChatMode] = useState("interview");
  const navigate = useNavigate();

  const [mockInterviewSession, setMockInterviewSession] = useState(null);
  const [isStartingMockInterview, setIsStartingMockInterview] = useState(false);
  const [isSubmittingMockInterview, setIsSubmittingMockInterview] = useState(false);
  const [mockInterviewSettings, setMockInterviewSettings] = useState({ difficulty: "medium", interviewType: "technical", totalQuestions: 5 });
  const [userAnswers, setUserAnswers] = useState({});
  const [mockInterviewResults, setMockInterviewResults] = useState(null);
  const [showMockInterviewSetup, setShowMockInterviewSetup] = useState(false);
  const [showMockInterviewResults, setShowMockInterviewResults] = useState(false);
  const [mockInterviewProgress, setMockInterviewProgress] = useState({ job_id: null, job_title: "", sessions_completed: 0, progress_percentage: 0, progress: [] });
  const [isLoadingProgress, setIsLoadingProgress] = useState(false);

  const fetchInterviewPreparations = async () => {
    try {
      setLoading(true);
      const data = await getInterviewPreparation();
      setPreparations(data?.data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load interview preparations.");
    } finally {
      setLoading(false);
    }
  };

  const fetchMockInterviewProgress = async (jobId) => {
    if (!jobId) return;
    setIsLoadingProgress(true);
    try {
      const d = await getMockInterviewProgress(jobId);
      setMockInterviewProgress(d);
    } catch {
      setMockInterviewProgress({ job_id: jobId, job_title: "", sessions_completed: 0, progress_percentage: 0, progress: [] });
    } finally {
      setIsLoadingProgress(false);
    }
  };

  useEffect(() => { fetchInterviewPreparations(); }, []);
  useEffect(() => { if (selectedJob) fetchMockInterviewProgress(selectedJob.job_id); }, [selectedJob]);

  const handleGenerateMoreQuestions = async (jobId) => {
    try {
      const result = await generateMoreQuestions(jobId);
      toast.success(result.message || "Success");
      const updated = await getInterviewPreparation();
      setPreparations(updated.data);
      if (selectedJob?.job_id === jobId) {
        setSelectedJob(updated.data.find(p => p.job_id === jobId));
      }
    } catch (error) {
      toast.error(error?.response?.data?.error || error?.response?.data?.message || "Something went wrong");
    }
  };

  const handleStartAIChat = (prep, mode = "interview") => {
    setSelectedJob(prep);
    setChatMode(mode);
    const msgs = {
      interview: `Starting mock interview for ${prep.job_title} at ${prep.company}. You can ask me questions or I can ask you!`,
      feedback: `I'm here to provide feedback on your answers for the ${prep.job_title} position. Share your responses and I'll help improve them!`,
      questions: `Ask me anything about the ${prep.job_title} role at ${prep.company}.`,
    };
    setChatHistory([{ role: "assistant", content: msgs[mode] || `How can I help you prepare for your ${prep.job_title} interview?` }]);
    setChatMessage("");
    setMockInterviewSession(null);
    setMockInterviewResults(null);
    setShowMockInterviewSetup(false);
    setShowMockInterviewResults(false);
    setUserAnswers({});
  };

  const handleSendChat = async () => {
    if (!chatMessage.trim() || !selectedJob) return;
    const userMessage = chatMessage.trim();
    setChatMessage("");
    setIsChatting(true);
    const newHistory = [...chatHistory, { role: "user", content: userMessage }];
    setChatHistory(newHistory);
    try {
      const response = await sendMockInterviewMessage(selectedJob.job_id, userMessage);
      setChatHistory([...newHistory, { role: "assistant", content: response.reply }]);
    } catch (error) {
      const status = error?.status;
      const msg = error?.data?.error || error?.message || "Something went wrong.";
      setChatHistory([...newHistory, { role: "assistant", content: status === 429 ? `🚫 ${msg}` : `❌ ${msg}` }]);
    } finally {
      setIsChatting(false);
    }
  };

  const handleStartMockInterview = async () => {
    if (!selectedJob) return;
    setIsStartingMockInterview(true);
    try {
      const response = await startMockInterview({
        jobId: selectedJob.job_id,
        difficulty: mockInterviewSettings.difficulty,
        interviewType: mockInterviewSettings.interviewType,
        totalQuestions: mockInterviewSettings.totalQuestions,
      });
      if (response?.session_id) {
        const questionTexts = (response.questions || []).map(q =>
          typeof q === "string" ? q : q.question || q.text || "Question not available"
        );
        setMockInterviewSession({ sessionId: response.session_id, jobId: selectedJob.job_id, questions: questionTexts, rawQuestions: response.questions, currentQuestionIndex: 0 });
        setUserAnswers({});
        setMockInterviewResults(null);
        setShowMockInterviewSetup(false);
        setShowMockInterviewResults(false);
        toast.success(`✅ Mock interview started! Answer all ${mockInterviewSettings.totalQuestions} questions.`);
      } else throw new Error("Invalid response from server");
    } catch (error) {
      const status = error?.response?.status;
      const msg = error?.response?.data?.error || error?.message || "Something went wrong";
      toast.error(status === 429 ? `🚫 ${msg}` : `❌ ${msg}`);
    } finally {
      setIsStartingMockInterview(false);
    }
  };

  const handleAnswerChange = (idx, answer) => setUserAnswers(prev => ({ ...prev, [idx]: answer }));

  const handleSubmitMockInterview = async () => {
    if (!mockInterviewSession || Object.keys(userAnswers).length === 0) {
      toast.error("Please answer at least one question before submitting.");
      return;
    }
    setIsSubmittingMockInterview(true);
    try {
      const answersArray = Object.entries(userAnswers).map(([index, answer]) => ({ question_index: parseInt(index), answer }));
      const userInput = { jobId: mockInterviewSession.jobId, sessionId: mockInterviewSession.sessionId, answers: answersArray };
      const response = await submitMockInterviewAnswers(userInput);
      let transformedResults = { session_id: mockInterviewSession.sessionId, job_id: mockInterviewSession.jobId, results: [] };
      if (Array.isArray(response?.results)) transformedResults.results = response.results;
      else if (Array.isArray(response?.feedback)) transformedResults.results = response.feedback;
      else if (Array.isArray(response?.answers_feedback)) transformedResults.results = response.answers_feedback;
      else if (Array.isArray(response)) transformedResults.results = response;
      else {
        transformedResults.results = mockInterviewSession.questions.map((question, index) => ({
          question, answer: userAnswers[index] || "",
          feedback: response?.feedback?.[index] || "Feedback not available",
          score: response?.scores?.[index] || 0,
        }));
      }
      setMockInterviewResults(transformedResults);
      setShowMockInterviewResults(true);
      setMockInterviewSession(null);
      await fetchMockInterviewProgress(mockInterviewSession.jobId);
      toast.success("✅ Mock interview submitted! Check your results below.");
    } catch (error) {
      console.error(error);
      toast.error(`❌ Failed to submit mock interview: ${error.message}`);
    } finally {
      setIsSubmittingMockInterview(false);
    }
  };

  const getResultsData = () => {
    if (!mockInterviewResults) return [];
    if (Array.isArray(mockInterviewResults.results)) {
      return mockInterviewResults.results.map(item => ({
        question: item.question || item.question_text || "Question",
        answer: item.answer || item.user_answer || "",
        feedback: item.feedback || item.comment || item.analysis || "No feedback available",
        score: item.score || item.rating || 0,
      }));
    }
    if (Array.isArray(mockInterviewResults.feedback)) return mockInterviewResults.feedback;
    if (Array.isArray(mockInterviewResults.answers_feedback)) return mockInterviewResults.answers_feedback;
    if (Array.isArray(mockInterviewResults)) return mockInterviewResults;
    return [];
  };

  const calculateMockInterviewScore = () => {
    const results = getResultsData();
    if (!results.length) return 0;
    const avg = results.map(r => normalizeScore(r.score)).reduce((a, b) => a + b, 0) / results.length;
    return Math.round(avg * 10) / 10;
  };

  const calculateAverageProgressScore = () => {
    if (!mockInterviewProgress?.progress?.length) return 0;
    const scores = mockInterviewProgress.progress.map(s => normalizeScore(s.score_percentage));
    return Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10;
  };

  const calculateHighestScore = () => {
    if (!mockInterviewProgress?.progress?.length) return 0;
    return Math.round(Math.max(...mockInterviewProgress.progress.map(s => normalizeScore(s.score_percentage))) * 10) / 10;
  };

  const calculateImprovementPercentage = () => {
    if (!mockInterviewProgress?.progress?.length || mockInterviewProgress.progress.length < 2) return 0;
    const sorted = [...mockInterviewProgress.progress].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    const first = normalizeScore(sorted[0].score_percentage);
    const last = normalizeScore(sorted[sorted.length - 1].score_percentage);
    if (first === 0) return 0;
    return Math.round(((last - first) / first) * 100);
  };

  const formatDate = (ds) => new Date(ds).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

  const getModeSuggestions = () => ({
    interview: ["Ask me a technical question about this role", "Let's practice a behavioral question", "Start the interview with a common question", "Give me a scenario-based question"],
    feedback: ["Here's my answer to 'Tell me about yourself'...", "How can I improve this technical answer?", "Give me feedback on my STAR method response", "Is this salary negotiation approach good?"],
    questions: ["What skills are most important for this role?", "What questions should I ask the interviewer?", "Tell me about common challenges in this position", "What's the typical career path for this role?"],
  }[chatMode] || ["How can I best prepare for this interview?", "What are common mistakes to avoid?"]);

  const chatModeTitles = { interview: "🎤 Mock Interview", feedback: "📝 Get Feedback", questions: "❓ Ask Questions" };
  const getChatModeTitle = () => chatModeTitles[chatMode] || "AI Chat";

  const scoreClass = (s) => s >= 8 ? "ip-score--high" : s >= 6 ? "ip-score--mid" : "ip-score--low";

  // ── Loading ─────────────────────────────────────────────
  if (loading) return (
    <div className="ip-wrap"><style>{styles}</style>
      <div className="ip-loading">
        <div className="ip-spinner"/>
        <p style={{color:"#6366f1",fontWeight:600,fontFamily:"'DM Sans',sans-serif"}}>Loading interview preparations…</p>
      </div>
    </div>
  );

  // ── Main render ──────────────────────────────────────────
  return (
    <div className="ip-wrap">
      <style>{styles}</style>

      {/* Hero */}
      <div className="ip-hero">
        <div className="ip-blob ip-blob--1"/><div className="ip-blob ip-blob--2"/><div className="ip-grid-bg"/>
        <div className="ip-hero-inner">
          <div>
            <div className="ip-badge"><span className="ip-badge-dot"/>AI Interview Prep</div>
            <h1 className="ip-hero-title">Interview <span>Preparation</span></h1>
            <p className="ip-hero-sub">Prepare with AI-generated questions, mock interviews, and smart coaching</p>
          </div>
          <div className="ip-hero-actions">
            <button className="ip-btn ip-btn--ghost" onClick={() => navigate("/jobseeker/dashboard")}>
              <BackIcon/> Dashboard
            </button>
            <button className="ip-btn ip-btn--primary" onClick={() => navigate("/jobseeker/jobs")}>
              Browse Jobs
            </button>
          </div>
        </div>
      </div>

      <div className="ip-main">
        {error && (
          <div style={{background:"#fff5f5",border:"1px solid #fecaca",color:"#dc2626",padding:"12px 16px",borderRadius:12,marginBottom:20,fontSize:14}}>
            {error}
          </div>
        )}

        {/* ══ DETAIL VIEW ══════════════════════════════════ */}
        {selectedJob ? (
          <div className="ip-detail-grid">

            {/* LEFT col */}
            <div>
              {/* Progress card */}
              {mockInterviewProgress.progress?.length > 0 && (
                <div className="ip-progress-card">
                  <div className="ip-progress-header">
                    <div>
                      <h2 className="ip-card-title">📈 Mock Interview Progress</h2>
                      <p className="ip-card-sub">Track your improvement over time</p>
                    </div>
                    <div className="ip-progress-stats">
                      <div className="ip-progress-stat">
                        <div className="ip-progress-stat-val" style={{color:"#4f46e5"}}>{calculateAverageProgressScore()}/10</div>
                        <div className="ip-progress-stat-label">Average</div>
                      </div>
                      <div className="ip-progress-stat">
                        <div className="ip-progress-stat-val" style={{color:"#059669"}}>{calculateHighestScore().toFixed(1)}/10</div>
                        <div className="ip-progress-stat-label">Best</div>
                      </div>
                      {mockInterviewProgress.progress.length >= 2 && (
                        <div className="ip-progress-stat">
                          <div className="ip-progress-stat-val" style={{color: calculateImprovementPercentage() >= 0 ? "#059669" : "#dc2626"}}>
                            {calculateImprovementPercentage() >= 0 ? "+" : ""}{calculateImprovementPercentage()}%
                          </div>
                          <div className="ip-progress-stat-label">Improvement</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Sessions banner */}
                  <div className="ip-sessions-banner">
                    <div>
                      <p style={{fontFamily:"'Syne',sans-serif",fontWeight:700,color:"#1e1b3a",margin:"0 0 2px",fontSize:14}}>Sessions Completed</p>
                      <p style={{fontSize:13,color:"#6b7280",margin:0}}>Total mock interviews for this role</p>
                      <div style={{marginTop:10}}>
                        <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"#6b7280",marginBottom:4}}>
                          <span>Overall Progress</span><span>{Math.round(mockInterviewProgress.progress_percentage || 0)}%</span>
                        </div>
                        <div style={{background:"#e0e7ff",borderRadius:100,height:7,overflow:"hidden"}}>
                          <div style={{background:"linear-gradient(90deg,#4f46e5,#7c3aed)",height:"100%",width:`${Math.min(100,mockInterviewProgress.progress_percentage||0)}%`,transition:"width .4s"}}/>
                        </div>
                      </div>
                    </div>
                    <div style={{textAlign:"right"}}>
                      <div className="ip-sessions-val">{mockInterviewProgress.sessions_completed || mockInterviewProgress.progress.length}</div>
                      <div className="ip-sessions-label">sessions</div>
                    </div>
                  </div>

                  {/* Bar chart */}
                  <div className="ip-bar-chart">
                    {mockInterviewProgress.progress.map((session, index) => {
                      const score = normalizeScore(session.score_percentage);
                      return (
                        <div key={session.session_id} className="ip-bar-wrap">
                          <div className="ip-bar" style={{height:`${Math.max(6,score*10)}%`}}>
                            <div className="ip-bar-tooltip">{score.toFixed(1)}/10</div>
                          </div>
                          <div className="ip-bar-idx">{index+1}</div>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"#9ca3af",padding:"0 2px",marginBottom:16}}>
                    <span>Session 1</span><span>Session {mockInterviewProgress.progress.length}</span>
                  </div>

                  {/* Progress table */}
                  <div className="ip-progress-table">
                    <div className="ip-progress-table-head">
                      <span>Session</span><span>Date & Time</span><span>Score</span>
                    </div>
                    {isLoadingProgress ? (
                      <div style={{textAlign:"center",padding:"16px 0"}}>
                        <div className="ip-spinner" style={{width:28,height:28,margin:"0 auto 8px"}}/>
                        <p style={{color:"#9ca3af",fontSize:13}}>Loading progress…</p>
                      </div>
                    ) : mockInterviewProgress.progress.map((session, index) => {
                      const score = normalizeScore(session.score_percentage);
                      return (
                        <div key={session.session_id} className="ip-progress-row">
                          <span style={{fontSize:13,fontWeight:600,color:"#374151"}}>Session {index+1}</span>
                          <span style={{fontSize:13,color:"#6b7280"}}>{formatDate(session.date)}</span>
                          <span className={`ip-score-pill ${scoreClass(score)}`}>{score.toFixed(1)}/10</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Questions card */}
              <div className="ip-card">
                <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:20,gap:12,flexWrap:"wrap"}}>
                  <div>
                    <h2 className="ip-card-title">{selectedJob.job_title} · {selectedJob.company}</h2>
                    <p className="ip-card-sub">Interview Questions & Answers</p>
                  </div>
                  <button className="ip-btn ip-btn--ghost ip-btn--sm" onClick={() => { setSelectedJob(null); setMockInterviewSession(null); setMockInterviewResults(null); setShowMockInterviewSetup(false); setShowMockInterviewResults(false); }}>
                    <BackIcon/> Back to List
                  </button>
                </div>

                {/* Mock interview promo (shown when no active session) */}
                {!mockInterviewSession && !showMockInterviewResults && (
                  <div className="ip-mock-promo">
                    <div>
                      <p className="ip-mock-promo-title">🎯 Structured Mock Interview</p>
                      <p className="ip-mock-promo-sub">Take a timed mock interview with AI feedback on your answers</p>
                    </div>
                    <button className="ip-btn ip-btn--primary" onClick={() => setShowMockInterviewSetup(true)}>
                      <PlayIcon/> Start Mock Interview
                    </button>
                  </div>
                )}

                {/* Setup panel */}
                {showMockInterviewSetup && !mockInterviewSession && !showMockInterviewResults && (
                  <div className="ip-setup-card" style={{marginBottom:20}}>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
                      <h3 className="ip-setup-title" style={{margin:0}}>Configure Mock Interview</h3>
                      <button style={{background:"none",border:"none",cursor:"pointer",fontSize:16,color:"#9ca3af"}} onClick={() => setShowMockInterviewSetup(false)}>✕</button>
                    </div>
                    <div className="ip-setup-field">
                      <span className="ip-setup-label">Difficulty</span>
                      <div className="ip-difficulty-btns">
                        {["easy","medium","hard"].map(l => (
                          <button key={l} className={`ip-difficulty-btn${mockInterviewSettings.difficulty===l?" ip-difficulty-btn--active":""}`} onClick={() => setMockInterviewSettings(p => ({...p,difficulty:l}))}>{l}</button>
                        ))}
                      </div>
                    </div>
                    <div className="ip-setup-field">
                      <span className="ip-setup-label">Interview Type</span>
                      <div className="ip-type-btns">
                        {["technical","behavioral","mixed"].map(t => (
                          <button key={t} className={`ip-type-btn${mockInterviewSettings.interviewType===t?" ip-type-btn--active":""}`} onClick={() => setMockInterviewSettings(p => ({...p,interviewType:t}))}>{t}</button>
                        ))}
                      </div>
                    </div>
                    <div className="ip-setup-field">
                      <span className="ip-setup-label">Number of Questions: {mockInterviewSettings.totalQuestions}</span>
                      <input type="range" min="3" max="15" value={mockInterviewSettings.totalQuestions} onChange={e => setMockInterviewSettings(p => ({...p,totalQuestions:parseInt(e.target.value)}))} className="ip-range"/>
                      <div className="ip-range-labels"><span>3</span><span>9</span><span>15</span></div>
                    </div>
                    <button className="ip-btn ip-btn--primary ip-btn--full" onClick={handleStartMockInterview} disabled={isStartingMockInterview}>
                      {isStartingMockInterview ? <><div className="ip-spinner" style={{width:16,height:16,borderWidth:2}}/> Starting…</> : <><PlayIcon/> Start Mock Interview</>}
                    </button>
                  </div>
                )}

                {/* In-progress */}
                {mockInterviewSession && !showMockInterviewResults && (
                  <div className="ip-mock-card" style={{marginBottom:20}}>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16,flexWrap:"wrap",gap:8}}>
                      <h3 style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:15,color:"#4f46e5",margin:0}}>🎤 Mock Interview in Progress</h3>
                      <span style={{background:"#eef2ff",border:"1px solid #c7d2fe",color:"#4f46e5",padding:"4px 12px",borderRadius:100,fontSize:12,fontWeight:700}}>
                        {Object.keys(userAnswers).length}/{mockInterviewSession.questions.length} answered
                      </span>
                    </div>
                    <div className="ip-q-scroll">
                      {mockInterviewSession.questions.map((question, index) => (
                        <div key={index} className="ip-mock-q-wrap">
                          <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
                            <div className="ip-q-num">{index+1}</div>
                            <div style={{flex:1}}>
                              <p className="ip-q-text">{typeof question==="string"?question:question.question||question.text||"Question not available"}</p>
                              <textarea
                                value={userAnswers[index]||""}
                                onChange={e => handleAnswerChange(index,e.target.value)}
                                placeholder="Type your answer here…"
                                className="ip-q-textarea"
                              />
                              <div className="ip-char-count">{(userAnswers[index]||"").length} characters</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div style={{display:"flex",gap:10,marginTop:16}}>
                      <button className="ip-btn ip-btn--gray" style={{flex:1,justifyContent:"center"}} onClick={() => { setMockInterviewSession(null); setUserAnswers({}); }}>Cancel</button>
                      <button className="ip-btn ip-btn--green" style={{flex:1,justifyContent:"center"}} onClick={handleSubmitMockInterview} disabled={isSubmittingMockInterview||Object.keys(userAnswers).length===0}>
                        {isSubmittingMockInterview ? <><div className="ip-spinner" style={{width:14,height:14,borderWidth:2}}/> Submitting…</> : <><CheckIcon/> Submit ({Object.keys(userAnswers).length}/{mockInterviewSession.questions.length})</>}
                      </button>
                    </div>
                  </div>
                )}

                {/* Results */}
                {showMockInterviewResults && mockInterviewResults && (
                  <div style={{marginBottom:20}}>
                    <div className="ip-results-header">
                      <div>
                        <h3 style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:17,color:"#1e1b3a",margin:"0 0 4px"}}>📊 Mock Interview Results</h3>
                        <p style={{fontSize:13,color:"#6b7280",margin:0}}>Review your performance and AI feedback</p>
                      </div>
                      <div className="ip-result-score">
                        <div className="ip-result-score-val">{calculateMockInterviewScore()}/10</div>
                        <div className="ip-result-score-label">Overall Score</div>
                      </div>
                    </div>

                    <div className="ip-summary-grid">
                      <div className="ip-summary-cell">
                        <div className="ip-summary-val" style={{color:"#059669"}}>{getResultsData().filter(r=>(r.score||0)>=8).length}</div>
                        <div className="ip-summary-label">Excellent (8-10)</div>
                      </div>
                      <div className="ip-summary-cell">
                        <div className="ip-summary-val" style={{color:"#d97706"}}>{getResultsData().filter(r=>(r.score||0)>=6&&(r.score||0)<8).length}</div>
                        <div className="ip-summary-label">Good (6-8)</div>
                      </div>
                      <div className="ip-summary-cell">
                        <div className="ip-summary-val" style={{color:"#dc2626"}}>{getResultsData().filter(r=>(r.score||0)<6).length}</div>
                        <div className="ip-summary-label">Needs Work (&lt;6)</div>
                      </div>
                    </div>

                    <div className="ip-q-scroll">
                      {getResultsData().length > 0 ? getResultsData().map((result, index) => (
                        <div key={index} className="ip-result-item">
                          <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:10,gap:10}}>
                            <div style={{display:"flex",alignItems:"center",gap:8}}>
                              <div className="ip-q-num">Q{index+1}</div>
                              <p className="ip-result-q" style={{margin:0}}>{result.question||`Question ${index+1}`}</p>
                            </div>
                            <span className={`ip-score-pill ${scoreClass(normalizeScore(result.score))}`}>{normalizeScore(result.score).toFixed(1)}/10</span>
                          </div>
                          <div className="ip-result-section-label" style={{color:"#374151"}}><CheckIcon/> Your Answer</div>
                          <div className="ip-answer-box">{result.answer||userAnswers[index]||"No answer provided"}</div>
                          <div className="ip-result-section-label" style={{color:"#4f46e5"}}>🤖 AI Feedback</div>
                          <div className="ip-feedback-box">{result.feedback||"No detailed feedback available."}</div>
                        </div>
                      )) : (
                        <div style={{textAlign:"center",padding:"32px 20px",border:"1px solid #e0e7ff",borderRadius:12}}>
                          <div style={{fontSize:40,marginBottom:12}}>✅</div>
                          <h4 style={{fontFamily:"'Syne',sans-serif",fontWeight:700,color:"#1e1b3a",margin:"0 0 8px"}}>Submitted Successfully!</h4>
                          <p style={{fontSize:13,color:"#6b7280",margin:0}}>The AI is processing your responses. Check back soon for detailed feedback.</p>
                        </div>
                      )}
                    </div>

                    <div style={{display:"flex",gap:10,marginTop:16}}>
                      <button className="ip-btn ip-btn--gray" style={{flex:1,justifyContent:"center"}} onClick={() => { setShowMockInterviewResults(false); setMockInterviewResults(null); }}>Close Results</button>
                      <button className="ip-btn ip-btn--primary" style={{flex:1,justifyContent:"center"}} onClick={() => { setShowMockInterviewSetup(true); setShowMockInterviewResults(false); setMockInterviewResults(null); }}>
                        <RefreshIcon/> Try Again
                      </button>
                    </div>
                  </div>
                )}

                {/* Tabs */}
                <div className="ip-tabs">
                  <button className={`ip-tab${activeTab==="technical"?" ip-tab--active":""}`} onClick={() => setActiveTab("technical")}>
                    Technical ({selectedJob.interview_preparation?.technical_questions?.length||0})
                  </button>
                  <button className={`ip-tab${activeTab==="behavioral"?" ip-tab--active":""}`} onClick={() => setActiveTab("behavioral")}>
                    Behavioral ({selectedJob.interview_preparation?.behavioral_questions?.length||0})
                  </button>
                </div>

                <div className="ip-q-scroll">
                  {activeTab === "technical" ? (
                    selectedJob.interview_preparation?.technical_questions?.map((q, idx) => (
                      <div key={idx} className="ip-q-item">
                        <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
                          <div className="ip-q-num">{idx+1}</div>
                          <div style={{flex:1}}>
                            <p style={{fontWeight:600,color:"#1e1b3a",margin:"0 0 8px",fontSize:14}}>{q.question}</p>
                            <div className="ip-q-ideal"><strong>Ideal Answer:</strong> {q.ideal_answer}</div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    selectedJob.interview_preparation?.behavioral_questions?.map((q, idx) => (
                      <div key={idx} className="ip-q-item">
                        <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
                          <div className="ip-q-num" style={{background:"linear-gradient(135deg,#f5f3ff,#ede9fe)",color:"#7c3aed"}}>{idx+1}</div>
                          <div style={{flex:1}}>
                            <p style={{fontWeight:600,color:"#1e1b3a",margin:"0 0 8px",fontSize:14}}>{q.question}</p>
                            <div className="ip-q-sample"><strong>Sample Answer:</strong> {q.sample_answer}</div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <hr className="ip-divider"/>
                <button className="ip-btn ip-btn--primary ip-btn--full" onClick={() => handleGenerateMoreQuestions(selectedJob.job_id)}>
                  <PlusIcon/> Generate More Questions
                </button>
              </div>
            </div>

            {/* RIGHT col — Chat */}
            <div className="ip-card" style={{height:"fit-content",position:"sticky",top:24}}>
              <div style={{marginBottom:16}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
                  <h2 className="ip-card-title">AI Chat Assistant</h2>
                  <span style={{background:"#eef2ff",border:"1px solid #c7d2fe",color:"#4f46e5",padding:"3px 10px",borderRadius:100,fontSize:11,fontWeight:700}}>{getChatModeTitle()}</span>
                </div>
                <p className="ip-card-sub" style={{marginBottom:12}}>
                  {{interview:"Practice with AI — ask questions or I'll ask you!",feedback:"Share your answers and get AI-powered improvement tips.",questions:"Ask anything about this role, company, or interview process."}[chatMode]}
                </p>

                {/* Mode buttons */}
                <div className="ip-chat-modes">
                  {[
                    { mode:"interview", label:"🎤 Mock Interview", cls:"ip-chat-mode-btn--active-blue" },
                    { mode:"feedback",  label:"📝 Get Feedback",   cls:"ip-chat-mode-btn--active-green" },
                    { mode:"questions", label:"❓ Ask Questions",   cls:"ip-chat-mode-btn--active-purple" },
                  ].map(({mode,label,cls}) => (
                    <button key={mode} className={`ip-chat-mode-btn${chatMode===mode?" "+cls:""}`}
                      onClick={() => { setChatMode(mode); handleStartAIChat(selectedJob, mode); }}>
                      {label}
                    </button>
                  ))}
                </div>

                {/* Suggestions */}
                <p style={{fontSize:12,color:"#9ca3af",margin:"0 0 8px"}}>💡 Quick suggestions:</p>
                <div className="ip-chat-suggestions">
                  {getModeSuggestions().map((s, i) => (
                    <button key={i} className="ip-chat-suggestion" onClick={() => setChatMessage(s)}>{s}</button>
                  ))}
                </div>
              </div>

              {/* Chat messages */}
              <div className="ip-chat-box">
                {chatHistory.map((msg, idx) => (
                  <div key={idx} style={{display:"flex",gap:8,alignItems:"flex-start",flexDirection:msg.role==="user"?"row-reverse":"row"}}>
                    <div className="ip-chat-avatar" style={{background:msg.role==="user"?"linear-gradient(135deg,#4f46e5,#7c3aed)":"#374151",color:"#fff"}}>
                      {msg.role==="user"?"Y":"AI"}
                    </div>
                    <div className={`ip-chat-msg${msg.role==="user"?" ip-chat-msg--user":" ip-chat-msg--ai"}`}>{msg.content}</div>
                  </div>
                ))}
                {isChatting && (
                  <div style={{display:"flex",gap:8,alignItems:"flex-start"}}>
                    <div className="ip-chat-avatar" style={{background:"#374151",color:"#fff"}}>AI</div>
                    <div className="ip-chat-msg ip-chat-msg--ai">
                      <div className="ip-typing-dots">
                        <div className="ip-typing-dot"/><div className="ip-typing-dot"/><div className="ip-typing-dot"/>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat input */}
              <div className="ip-chat-input-row">
                <input
                  className="ip-chat-input"
                  type="text"
                  value={chatMessage}
                  onChange={e => setChatMessage(e.target.value)}
                  onKeyPress={e => e.key==="Enter" && handleSendChat()}
                  placeholder="Type your message…"
                  disabled={isChatting}
                />
                <button className="ip-btn ip-btn--primary" onClick={handleSendChat} disabled={!chatMessage.trim()||isChatting}>
                  {isChatting ? <div className="ip-spinner" style={{width:14,height:14,borderWidth:2}}/> : <SendIcon/>}
                </button>
              </div>
            </div>
          </div>

        ) : (
          /* ══ LIST VIEW ═══════════════════════════════════ */
          preparations.length === 0 ? (
            <div className="ip-card ip-empty">
              <div className="ip-empty-icon">💬</div>
              <h3 className="ip-empty-title">No Interview Preparations Yet</h3>
              <p className="ip-empty-sub">Apply to jobs to get AI-generated interview questions and coaching.</p>
              <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
                <button className="ip-btn ip-btn--primary" onClick={() => navigate("/jobseeker/jobs")}>Browse Jobs to Apply</button>
                <button className="ip-btn ip-btn--ghost" onClick={() => navigate("/jobseeker/dashboard")}>Back to Dashboard</button>
              </div>
            </div>
          ) : (
            preparations.map((prep, i) => (
              <div key={prep.job_id} className="ip-list-card" style={{animationDelay:`${i*50}ms`}}>
                <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:16,flexWrap:"wrap"}}>
                  <div style={{flex:1}}>
                    <h3 className="ip-list-job-title">{prep.job_title}</h3>
                    <p className="ip-list-company">{prep.company}</p>
                    <div style={{display:"flex",gap:16,flexWrap:"wrap"}}>
                      <div className="ip-count-chip">
                        <div className="ip-count-badge" style={{background:"#eef2ff",color:"#4f46e5"}}>{prep.interview_preparation?.technical_questions?.length||0}</div>
                        <span className="ip-count-label">Technical Questions</span>
                      </div>
                      <div className="ip-count-chip">
                        <div className="ip-count-badge" style={{background:"#f5f3ff",color:"#7c3aed"}}>{prep.interview_preparation?.behavioral_questions?.length||0}</div>
                        <span className="ip-count-label">Behavioral Questions</span>
                      </div>
                    </div>
                  </div>
                  <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                    <button className="ip-btn ip-btn--primary ip-btn--sm" onClick={() => setSelectedJob(prep)}>View Questions</button>
                    <button className="ip-btn ip-btn--green ip-btn--sm" onClick={() => handleGenerateMoreQuestions(prep.job_id)}><PlusIcon/> Generate More</button>
                    <button className="ip-btn ip-btn--purple ip-btn--sm" onClick={() => handleStartAIChat(prep,"interview")}>Chat with AI</button>
                  </div>
                </div>
              </div>
            ))
          )
        )}
      </div>
    </div>
  );
}

export default InterviewPreparation;