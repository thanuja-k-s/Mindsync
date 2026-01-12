import React from 'react';
import { Link } from 'react-router-dom';
import './Landing.css';

export default function Landing() {
  return (
    <div className="landing">
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

      <section className="hero">
        <div className="container hero-inner">
          <h1>Design your mindful routine</h1>
          <p className="sub">Journaling, insights, and goals in a clean, privacy-first app.</p>
          <div className="actions">
            <Link to="/signup" className="btn cta">Get Started</Link>
            <Link to="/auth" className="btn ghost">I already have an account</Link>
          </div>
        </div>
      </section>

      <section className="features container">
        <div className="grid">
          <div className="panel">
            <h3>✍️ Journaling</h3>
            <p>Capture thoughts, attach files, and use voice transcription.</p>
          </div>
          <div className="panel">
            <h3>📊 Insights</h3>
            <p>Track mood trends and view summaries from your entries.</p>
          </div>
          <div className="panel">
            <h3>🎯 Goals</h3>
            <p>Set habits, monitor progress, and build streaks.</p>
          </div>
          <div className="panel">
            <h3>🔐 Private</h3>
            <p>Data stays on your device with local encryption.</p>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container">
          <p className="muted">© {new Date().getFullYear()} MindSync · All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
