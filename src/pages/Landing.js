import React from 'react';
import { Link } from 'react-router-dom';
import './Landing.css';

const features = [
  {
    icon: '✍️',
    title: 'Journaling',
    desc: 'Capture thoughts, attach files, and use voice transcription.'
  },
  {
    icon: '📊',
    title: 'Insights',
    desc: 'Track mood trends and view AI-powered summaries from your entries.'
  },
  {
    icon: '🎯',
    title: 'Goals',
    desc: 'Set habits, monitor progress, and build healthy streaks.'
  },
  {
    icon: '🔐',
    title: 'Private',
    desc: 'Data stays on your device with end-to-end local encryption.'
  },
];

export default function Landing() {
  return (
    <div className="landing">

      {/* ── Header ── */}
      <header className="landing-header">
        <div className="container header-inner">
          <div className="brand">
            <img src="/mindsync-logo.png" alt="MindSync Logo" className="brand-logo" />
            <span>MindSync</span>
          </div>
          <nav className="menu">
            <Link to="/auth" className="btn ghost">Login</Link>
            <Link to="/signup" className="btn cta">Sign Up</Link>
          </nav>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-badge">
            ✦ Your mindfulness companion
          </div>

          <h1>Design your<br />mindful routine</h1>

          <p className="sub">
            Journaling, AI insights, and goal tracking — all in a clean,&nbsp;privacy-first app built for your well-being.
          </p>

          <div className="actions">
            <Link to="/signup" className="btn cta">Get Started Free</Link>
            <Link to="/auth" className="btn ghost">I have an account</Link>
          </div>

          <div className="hero-stats">
            <div className="stat-chip">
              <strong>100%</strong>
              <span>Private</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-chip">
              <strong>AI</strong>
              <span>Powered</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-chip">
              <strong>∞</strong>
              <span>Entries</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-chip">
              <strong>Free</strong>
              <span>Forever</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="features container">
        <p className="section-label">Everything you need</p>
        <h2 className="section-title">Built for your mind</h2>
        <p className="section-sub">Four powerful tools, one seamless experience.</p>

        <div className="grid">
          {features.map((f) => (
            <div className="panel" key={f.title}>
              <div className="panel-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="footer">
        <div className="container">
          <p className="muted">© {new Date().getFullYear()} MindSync · All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}
