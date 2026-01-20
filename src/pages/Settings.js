import React, { useState, useEffect } from 'react';
import './Settings.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

const Settings = () => {
  const [userData, setUserData] = useState({ username: '', email: '' });
  const [editMode, setEditMode] = useState(null);
  const [formData, setFormData] = useState({ username: '', email: '' });
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const userId = localStorage.getItem('userId');
  const authToken = localStorage.getItem('authToken');

  useEffect(() => {
    if (!userId) {
      setMessage('User data not found');
      setLoading(false);
      return;
    }

    const fetchUserProfile = async () => {
      try {
        const response = await fetch(`${API_URL}/api/auth/profile/${userId}`, {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setUserData({
            username: data.username || '',
            email: data.email || ''
          });
          setFormData({
            username: data.username || '',
            email: data.email || ''
          });
        } else {
          setMessage('Failed to load user profile');
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setMessage('Error loading profile');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId, authToken]);

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    window.location.href = '/';
  };

  const handleEditClick = (field) => {
    setEditMode(field);
    setMessage('');
  };

  const handleCancel = () => {
    setEditMode(null);
    setFormData(userData);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleSaveUsername = async () => {
    if (!formData.username.trim()) {
      setMessage('Username cannot be empty');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/auth/profile/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ username: formData.username })
      });

      if (response.ok) {
        const updated = await response.json();
        setUserData({
          username: updated.username,
          email: updated.email
        });
        setEditMode(null);
        setMessage('✓ Username updated successfully');
        localStorage.setItem('username', updated.username);
        setTimeout(() => setMessage(''), 3000);
      } else {
        const error = await response.json();
        setMessage(error.error || 'Failed to update username');
      }
    } catch (err) {
      console.error('Error updating username:', err);
      setMessage('Error updating username');
    }
  };

  const handleSaveEmail = async () => {
    if (!formData.email.trim()) {
      setMessage('Email cannot be empty');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setMessage('Invalid email format');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/auth/profile/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ email: formData.email })
      });

      if (response.ok) {
        const updated = await response.json();
        setUserData({
          username: updated.username,
          email: updated.email
        });
        setEditMode(null);
        setMessage('✓ Email updated successfully');
        setTimeout(() => setMessage(''), 3000);
      } else {
        const error = await response.json();
        setMessage(error.error || 'Failed to update email');
      }
    } catch (err) {
      console.error('Error updating email:', err);
      setMessage('Error updating email');
    }
  };

  if (loading) {
    return (
      <div className="settings-container">
        <h2>Settings</h2>
        <p style={{ textAlign: 'center', color: '#9ca3af' }}>Loading...</p>
      </div>
    );
  }

  return (
    <div className="settings-container">
      <h2>Settings</h2>
      {message && <div className="message" style={{
        padding: '10px',
        marginBottom: '15px',
        borderRadius: '5px',
        backgroundColor: message.includes('✓') ? '#d4edda' : '#f8d7da',
        color: message.includes('✓') ? '#155724' : '#721c24',
        border: `1px solid ${message.includes('✓') ? '#c3e6cb' : '#f5c6cb'}`
      }}>
        {message}
      </div>}

      <div className="settings-section">
        <div className="setting-item">
          <div className="setting-label">
            <label>Username</label>
            <span className="setting-value">{userData.username}</span>
          </div>
          {editMode === 'username' ? (
            <div className="setting-edit">
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="Enter your username"
              />
              <div className="button-group">
                <button onClick={handleSaveUsername} className="btn-save">Save</button>
                <button onClick={handleCancel} className="btn-cancel">Cancel</button>
              </div>
            </div>
          ) : (
            <button onClick={() => handleEditClick('username')} className="btn-edit">Edit</button>
          )}
        </div>

        <div className="setting-item">
          <div className="setting-label">
            <label>Email</label>
            <span className="setting-value">{userData.email || 'Not set'}</span>
          </div>
          {editMode === 'email' ? (
            <div className="setting-edit">
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter your email"
              />
              <div className="button-group">
                <button onClick={handleSaveEmail} className="btn-save">Save</button>
                <button onClick={handleCancel} className="btn-cancel">Cancel</button>
              </div>
            </div>
          ) : (
            <button onClick={() => handleEditClick('email')} className="btn-edit">Edit</button>
          )}
        </div>
      </div>

      <div className="settings-footer">
        <p>Privacy: All data is encrypted and stored securely in our database.</p>
        <button onClick={logout} className="btn-logout">Logout</button>
      </div>
    </div>
  );
};

export default Settings;
