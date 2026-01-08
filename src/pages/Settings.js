import React from 'react';

const Settings = () => {
  const logout = () => {
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  return (
    <div className="settings-container">
      <h2>Settings</h2>
      <button onClick={logout}>Logout</button>
      <p>Privacy: All data is encrypted and stored locally.</p>
    </div>
  );
};

export default Settings;
