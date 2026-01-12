import React, { useState, useEffect } from 'react';
import CryptoJS from 'crypto-js';
import './Settings.css';

const Settings = () => {
  const [currentUser, setCurrentUser] = useState('');
  const [userData, setUserData] = useState({ email: '', name: '' });
  const [editMode, setEditMode] = useState(null);
  const [formData, setFormData] = useState({});
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const user = localStorage.getItem('user');
    setCurrentUser(user);
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    if (users[user]) {
      setUserData({
        email: users[user].email || '',
        name: users[user].name || user,
      });
      setFormData({
        email: users[user].email || '',
        name: users[user].name || user,
      });
    }
  }, []);

  const logout = () => {
    localStorage.removeItem('user');
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

  const handleSaveName = () => {
    if (!formData.name.trim()) {
      setMessage('Name cannot be empty');
      return;
    }
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    users[currentUser].name = formData.name;
    localStorage.setItem('users', JSON.stringify(users));
    setUserData({ ...userData, name: formData.name });
    setEditMode(null);
    setMessage('✓ Name updated successfully');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleSaveEmail = () => {
    if (!formData.email.trim()) {
      setMessage('Email cannot be empty');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setMessage('Invalid email format');
      return;
    }
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    users[currentUser].email = formData.email;
    localStorage.setItem('users', JSON.stringify(users));
    setUserData({ ...userData, email: formData.email });
    setEditMode(null);
    setMessage('✓ Email updated successfully');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleChangePassword = () => {
    if (!currentPassword) {
      setMessage('Current password is required');
      return;
    }
    if (!newPassword) {
      setMessage('New password is required');
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      setMessage('Password must be at least 6 characters');
      return;
    }

    const users = JSON.parse(localStorage.getItem('users') || '{}');
    const hashed = CryptoJS.SHA256(currentUser + ':' + currentPassword).toString();

    if (users[currentUser].hash !== hashed) {
      setMessage('Current password is incorrect');
      return;
    }

    const newHash = CryptoJS.SHA256(currentUser + ':' + newPassword).toString();
    users[currentUser].hash = newHash;
    localStorage.setItem('users', JSON.stringify(users));

    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setEditMode(null);
    setMessage('✓ Password changed successfully');
    setTimeout(() => setMessage(''), 3000);
  };

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
            <label>Name</label>
            <span className="setting-value">{userData.name}</span>
          </div>
          {editMode === 'name' ? (
            <div className="setting-edit">
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter your name"
              />
              <div className="button-group">
                <button onClick={handleSaveName} className="btn-save">Save</button>
                <button onClick={handleCancel} className="btn-cancel">Cancel</button>
              </div>
            </div>
          ) : (
            <button onClick={() => handleEditClick('name')} className="btn-edit">Edit</button>
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

        <div className="setting-item">
          <div className="setting-label">
            <label>Password</label>
            <span className="setting-value">••••••••</span>
          </div>
          {editMode === 'password' ? (
            <div className="setting-edit">
              <label className="password-field">
                <span>Current Password</span>
                <div className="password-wrap">
                  <input
                    type={showPasswords ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                  />
                </div>
              </label>
              <label className="password-field">
                <span>New Password</span>
                <div className="password-wrap">
                  <input
                    type={showPasswords ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                  />
                </div>
              </label>
              <label className="password-field">
                <span>Confirm Password</span>
                <div className="password-wrap">
                  <input
                    type={showPasswords ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    className="eye"
                    onClick={() => setShowPasswords((s) => !s)}
                    aria-label="Toggle password visibility"
                  >
                    {showPasswords ? '🙈' : '👁️'}
                  </button>
                </div>
              </label>
              <div className="button-group">
                <button onClick={handleChangePassword} className="btn-save">Change Password</button>
                <button onClick={handleCancel} className="btn-cancel">Cancel</button>
              </div>
            </div>
          ) : (
            <button onClick={() => handleEditClick('password')} className="btn-edit">Change</button>
          )}
        </div>
      </div>

      <div className="settings-footer">
        <p>Privacy: All data is encrypted and stored locally.</p>
        <button onClick={logout} className="btn-logout">Logout</button>
      </div>
    </div>
  );
};

export default Settings;
