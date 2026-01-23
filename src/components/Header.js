import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Header.css';

export default function Header() {
  const location = useLocation();
  const user = localStorage.getItem('user');

  const navItem = (to, label, emoji) => (
    <li className={location.pathname === to ? 'active' : ''}>
      <Link to={to}>
        <span className="icon" aria-hidden>{emoji}</span>
        <span className="text">{label}</span>
      </Link>
    </li>
  );

  if (!user) return null;

  return (
    <header className="header">
      <div className="header-content">
        <div className="brand">
          <img src="/mindsync-logo.png" alt="MindSync Logo" className="brand-logo" />
          <span>MindSync</span>
        </div>
        <nav className="nav">
          <ul>
            {navItem('/journal', 'Journaling', '✍️')}
            {navItem('/entries', 'Entries', '📚')}
            {navItem('/insights', 'Insights', '📊')}
            {navItem('/goals', 'Goals', '🎯')}
            {navItem('/sage', 'MemoTalks', '💭')}
            {navItem('/reminders', 'Reminders', '⏰')}
            {navItem('/settings', 'Settings', '⚙️')}
          </ul>
        </nav>
        <div className="user-info">
          <span>Welcome, <strong>{user}</strong></span>
        </div>
      </div>
    </header>
  );
}
