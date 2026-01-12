import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';

export default function Sidebar() {
  const location = useLocation();
  const [open, setOpen] = useState(true);
  const user = localStorage.getItem('user');

  const item = (to, label, emoji) => (
    <li className={location.pathname === to ? 'active' : ''}>
      <Link to={to}>
        <span className="icon" aria-hidden>{emoji}</span>
        <span className="text">{label}</span>
      </Link>
    </li>
  );

  // Reflect sidebar state on the body for layout padding control
  useEffect(() => {
    const body = document.body;
    if (open) {
      body.classList.add('sidebar-open');
    } else {
      body.classList.remove('sidebar-open');
    }
    return () => body.classList.remove('sidebar-open');
  }, [open]);

  // Listen for global events to open/toggle the sidebar (from floating button)
  useEffect(() => {
    const openHandler = () => setOpen(true);
    const toggleHandler = () => setOpen((v) => !v);
    window.addEventListener('sidebar:open', openHandler);
    window.addEventListener('sidebar:toggle', toggleHandler);
    return () => {
      window.removeEventListener('sidebar:open', openHandler);
      window.removeEventListener('sidebar:toggle', toggleHandler);
    };
  }, []);

  if (!user) return null;

  return (
    <>
    <aside className={`sidebar ${open ? 'open' : ''}`}>      
      <div className="top">
        <div className="brand">
          <img src="/mindsync-logo.png" alt="MindSync Logo" className="brand-logo" />
          <span>MindSync</span>
        </div>
        <button
          className="toggle"
          aria-label="Toggle sidebar"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          <span className="toggle-bars" aria-hidden>≡</span>
        </button>
      </div>
      <nav className="nav">
        <ul>
          {item('/journal', 'Journaling', '✍️')}
          {item('/entries', 'Entries', '📚')}
          {item('/insights', 'Insights', '📊')}
          {item('/goals', 'Goals', '🎯')}
          {item('/sage', 'MemoTalks', '💭')}
          {item('/reminders', 'Reminders', '⏰')}
          {item('/settings', 'Settings', '⚙️')}
        </ul>
      </nav>
      <div className="foot">
        <div className="user">Signed in as <strong>{user}</strong></div>
      </div>
    </aside>
    <div className={`sidebar-overlay ${open ? 'show' : ''}`} onClick={() => setOpen(false)} />
    </>
  );
}
