import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import CryptoJS from 'crypto-js';
import './Signup.css';

const Auth = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const login = () => {
    if (!username || !password) return;

    const users = JSON.parse(localStorage.getItem('users') || '{}');
    const record = users[username];
    const hashed = CryptoJS.SHA256(username + ':' + password).toString();
    if (record && record.hash === hashed) {
      localStorage.setItem('user', username);
      navigate('/journal');
    } else {
      alert('Invalid credentials. Please try again or sign up.');
    }
  };

  return (
    <div className="signup-page">
      <div className="bg-orb orb1" />
      <div className="bg-orb orb2" />
      <div className="card fade-in">
        <div className="card-head">
          <h2>Welcome back</h2>
          <p className="muted">Log in to continue your mindful journey.</p>
        </div>
        <div className="form">
          <label className="field">
            <span>Username</span>
            <input
              type="text"
              placeholder="e.g. alex"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </label>
          <label className="field">
            <span>Password</span>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <button className="btn-cta" onClick={login}>Log in</button>
        </div>
        <p className="foot">Don't have an account? <Link to="/signup">Sign up</Link></p>
      </div>
    </div>
  );
};

export default Auth;
