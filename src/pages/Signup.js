import React, { useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import CryptoJS from 'crypto-js';
import './Signup.css';

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [showPwd, setShowPwd] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const strength = useMemo(() => {
    const p = form.password || '';
    let score = 0;
    if (p.length >= 6) score += 1;
    if (p.length >= 10) score += 1;
    if (/[A-Z]/.test(p)) score += 1;
    if (/[0-9]/.test(p)) score += 1;
    if (/[^A-Za-z0-9]/.test(p)) score += 1;
    const pct = Math.min(100, (score / 5) * 100);
    const label = pct < 40 ? 'Weak' : pct < 70 ? 'Medium' : 'Strong';
    return { pct, label };
  }, [form.password]);

  const handleSignup = (e) => {
    e.preventDefault();
    setError('');

    const username = form.username.trim();
    const password = form.password;
    const confirm = form.confirm;

    if (!username || !password || !confirm) {
      setError('Please fill all fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password should be at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    const users = JSON.parse(localStorage.getItem('users') || '{}');
    if (users[username]) {
      setError('Username already exists. Try logging in.');
      return;
    }

    const hash = CryptoJS.SHA256(username + ':' + password).toString();
    users[username] = { hash, createdAt: new Date().toISOString() };
    localStorage.setItem('users', JSON.stringify(users));

    // Auto-login
    localStorage.setItem('user', username);
    navigate('/journal');
  };

  return (
    <div className="signup-page">
      <div className="bg-orb orb1" />
      <div className="bg-orb orb2" />
      <div className="card fade-in">
        <div className="card-head">
          <h2>Create your account</h2>
          <p className="muted">Start journaling with privacy-first storage.</p>
        </div>
        <form onSubmit={handleSignup} className="form">
          <label className="field">
            <span>Username</span>
            <input
              type="text"
              name="username"
              placeholder="e.g. alex"
              autoComplete="username"
              value={form.username}
              onChange={onChange}
              required
            />
          </label>
          <label className="field">
            <span>Password</span>
            <div className="password-wrap">
              <input
                type={showPwd ? 'text' : 'password'}
                name="password"
                placeholder="••••••••"
                autoComplete="new-password"
                value={form.password}
                onChange={onChange}
                required
              />
              <button type="button" className="eye" onClick={() => setShowPwd((s) => !s)} aria-label="Toggle password visibility">
                {showPwd ? '🙈' : '👁️'}
              </button>
            </div>
            <div className="strength">
              <div className="bar" style={{ width: `${strength.pct}%` }} />
              <span className={`label ${strength.label.toLowerCase()}`}>{strength.label}</span>
            </div>
          </label>
          <label className="field">
            <span>Confirm password</span>
            <input
              type="password"
              name="confirm"
              placeholder="Repeat password"
              autoComplete="new-password"
              value={form.confirm}
              onChange={onChange}
              required
            />
          </label>
          {error && <div className="error">{error}</div>}
          <button type="submit" className="btn-cta">Create account</button>
        </form>
        <p className="foot">
          Already have an account? <Link to="/auth">Log in</Link>
        </p>
      </div>
    </div>
  );
}
