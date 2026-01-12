import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Auth from './pages/Auth';
import Landing from './pages/Landing';
import Signup from './pages/Signup';
import Journaling from './pages/Journaling';
import Insights from './pages/Insights';
import Entries from './pages/Entries';
import Goals from './pages/Goals';
import Reminders from './pages/Reminders';
import Settings from './pages/Settings';
import MemoTalks from './pages/MemoTalks';
import Sidebar from './components/Sidebar';
import SidebarToggle from './components/SidebarToggle';
import './App.css';

function AppInner() {
  const isLoggedIn = localStorage.getItem('user');
  const location = useLocation();
  const hideSidebarOn = ['/', '/auth', '/signup'];
  const showSidebar = isLoggedIn && !hideSidebarOn.includes(location.pathname);

  return (
      <div className={`App ${showSidebar ? 'layout-content' : ''}`}>
        {showSidebar && <Sidebar />}
        {showSidebar && <SidebarToggle />}
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/journal" element={<Journaling />} />
          <Route path="/journaling" element={<Journaling />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/entries" element={<Entries />} />
          <Route path="/goals" element={<Goals />} />
          <Route path="/reminders" element={<Reminders />} />
          <Route path="/sage" element={<MemoTalks />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </div>
  );
}

function App() {
  return (
    <Router>
      <AppInner />
    </Router>
  );
}

export default App;
