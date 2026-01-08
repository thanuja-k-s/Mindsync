import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Nav.css';

const Nav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = localStorage.getItem('user');

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/auth');
  };

  if (!user) return null;

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">MindSync Diary</Link>
        <ul className="nav-links">
          <li><Link to="/journal" className={location.pathname === '/journal' || location.pathname === '/journaling' ? 'active' : ''}>Journaling</Link></li>
          <li><Link to="/insights" className={location.pathname === '/insights' ? 'active' : ''}>Insights</Link></li>
          <li><Link to="/goals" className={location.pathname === '/goals' ? 'active' : ''}>Goals</Link></li>
          <li><Link to="/settings" className={location.pathname === '/settings' ? 'active' : ''}>Settings</Link></li>
        </ul>
        <div className="nav-user">
          <span>Welcome, {user}</span>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </div>
    </nav>
  );
};

export default Nav;
