import React from 'react';
import './Footer.css';

export default function Footer() {
  const user = localStorage.getItem('user');

  if (!user) return null;

  return (
    <footer className="footer">
      <div className="footer-info">
        <p>&copy; 2026 MindSync. All rights reserved.</p>
      </div>
    </footer>
  );
}
