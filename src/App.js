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
import Header from './components/Header';
import Footer from './components/Footer';
import './App.css';

function AppInner() {
  const isLoggedIn = localStorage.getItem('user');
  const location = useLocation();
  const hideSidebarOn = ['/', '/auth', '/signup'];
  const showNav = isLoggedIn && !hideSidebarOn.includes(location.pathname);

  return (
      <div className={`App ${showNav ? 'with-header-footer' : ''}`}>
        {showNav && <Header />}
        <main className="main-content">
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
        </main>
        {showNav && <Footer />}
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
