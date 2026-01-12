import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import CryptoJS from 'crypto-js';
import './Signup.css';

const Auth = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
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

  const handleGoogleSignIn = () => {
    // Simulated Google Sign-In - In production, use actual Google OAuth
    const googleEmail = prompt('Enter your email for Google Sign-In:');
    if (!googleEmail) return;

    const users = JSON.parse(localStorage.getItem('users') || '{}');
    
    // Check if user exists with this email
    let existingUser = null;
    for (const user in users) {
      if (users[user].email === googleEmail) {
        existingUser = user;
        break;
      }
    }

    if (existingUser) {
      // User exists, log them in
      localStorage.setItem('user', existingUser);
      navigate('/journal');
    } else {
      // New user, create account
      const newUsername = googleEmail.split('@')[0] + '_' + Math.random().toString(36).substr(2, 5);
      const tempPassword = Math.random().toString(36).substr(2, 12);
      const hashed = CryptoJS.SHA256(newUsername + ':' + tempPassword).toString();
      
      users[newUsername] = {
        hash: hashed,
        email: googleEmail,
        name: googleEmail.split('@')[0],
        googleAuth: true
      };
      
      localStorage.setItem('users', JSON.stringify(users));
      localStorage.setItem('user', newUsername);
      alert(`Welcome! Your account has been created with username: ${newUsername}`);
      navigate('/journal');
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
            <div className="password-wrap">
              <input
                type={showPwd ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="eye"
                onClick={() => setShowPwd((s) => !s)}
                aria-label="Toggle password visibility"
                aria-pressed={showPwd}
              >
                {showPwd ? '🙈' : '👁️'}
              </button>
            </div>
          </label>
          <button className="btn-cta" onClick={login}>Log in</button>
          <div className="divider" style={{ textAlign: 'center', margin: '20px 0', color: '#888' }}>
            or
          </div>
          <button 
            className="btn-google" 
            onClick={handleGoogleSignIn}
            style={{
              width: '100%',
              padding: '10px',
              marginBottom: '15px',
              backgroundColor: '#fff',
              border: '1px solid #ddd',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <span style={{ fontSize: '18px' }}>🔐</span>
            Sign in with Google
          </button>
        </div>
        <p className="foot">Don't have an account? <Link to="/signup">Sign up</Link></p>
      </div>
    </div>
  );
};

export default Auth;
