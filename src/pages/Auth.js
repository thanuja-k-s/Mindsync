import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Signup.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002';

const Auth = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const login = async () => {
    if (!username || !password) {
      setError('Please enter username and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();
      
      if (!response.ok) {
        setError(data.error || 'Login failed');
        setLoading(false);
        return;
      }

      // Store token and user info
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userId', data.user.id);
      localStorage.setItem('username', data.user.username);
      localStorage.setItem('user', data.user.username);
      
      navigate('/journal');
    } catch (err) {
      setError('Error: Unable to connect to server. Make sure backend is running on port 5001.');
      console.error('Login error:', err);
    }
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    // Simulated Google Sign-In - In production, use actual Google OAuth
    const googleEmail = prompt('Enter your email for Google Sign-In:');
    if (!googleEmail) return;

    setLoading(true);
    setError('');

    try {
      // Generate random username from email
      const newUsername = googleEmail.split('@')[0] + '_' + Math.random().toString(36).substr(2, 5);
      const tempPassword = Math.random().toString(36).substr(2, 12);

      // Try to sign up
      const response = await fetch(`${API_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: newUsername, email: googleEmail, password: tempPassword })
      });

      const data = await response.json();
      
      if (response.ok) {
        // New user created successfully
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('userId', data.user.id);
        localStorage.setItem('username', data.user.username);
        localStorage.setItem('user', data.user.username);
        alert(`Welcome! Your account has been created with username: ${data.user.username}`);
        navigate('/journal');
      } else {
        // User exists or other error
        setError(data.error || 'Google Sign-In failed');
      }
    } catch (err) {
      setError('Error: Unable to connect to server.');
      console.error('Google Sign-In error:', err);
    }
    setLoading(false);
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
          {error && <div className="error" style={{marginBottom: '15px'}}>{error}</div>}
          <button className="btn-cta" onClick={login} disabled={loading}>
            {loading ? 'Logging in...' : 'Log in'}
          </button>
          <div className="divider" style={{ textAlign: 'center', margin: '20px 0', color: '#888' }}>
            or
          </div>
          <button 
            className="btn-google" 
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            <span>🔐</span>
            {loading ? 'Signing in...' : 'Continue with Google'}
          </button>
        </div>
        <p className="foot">Don't have an account? <Link to="/signup">Sign up</Link></p>
      </div>
    </div>
  );
};

export default Auth;
