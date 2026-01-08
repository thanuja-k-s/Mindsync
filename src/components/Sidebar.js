import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';

export default function Sidebar() {
  const location = useLocation();
  const [open, setOpen] = useState(true);
  const user = localStorage.getItem('user');
  if (!user) return null;

  const item = (to, label, emoji) => (
    <li className={location.pathname === to ? 'active' : ''}>
      <Link to={to} onClick={() => setOpen(false)}>
        <span className="icon" aria-hidden>{emoji}</span>
        <span className="text">{label}</span>
      </Link>
    </li>
  );

  return (
    <aside className={`sidebar ${open ? 'open' : ''}`}>      
      <div className="top">
        <div className="brand">🧠 MindSync</div>
        <button className="toggle" aria-label="Toggle sidebar" onClick={() => setOpen(!open)}>☰</button>
      </div>
      <nav className="nav">
        <ul>
          {item('/journal', 'Journaling', '✍️')}
          {item('/entries', 'Entries', '📚')}
          {item('/insights', 'Insights', '📊')}
          {item('/goals', 'Goals', '🎯')}
          {item('/settings', 'Settings', '⚙️')}
        </ul>
      </nav>
      <div className="foot">
        <div className="user">Signed in as <strong>{user}</strong></div>
      </div>
    </aside>
  );
}
