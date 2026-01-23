import React, { useEffect, useMemo, useState } from 'react';
import './Entries.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const getMoodEmoji = (mood) => {
  const moodMap = {
    positive: '😊',
    negative: '😔',
    neutral: '😐',
    happy: '😄',
    sad: '😢',
    angry: '😠',
    excited: '🤩',
    calm: '😌'
  };
  return moodMap[mood] || '📝';
};



export default function Entries() {
  const [entries, setEntries] = useState([]);
  const [query, setQuery] = useState('');
  const [moodFilter, setMoodFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [streak, setStreak] = useState({ current: 0, longest: 0, lastEntryDate: null });
  const [fullscreenImage, setFullscreenImage] = useState(null);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchEntries = async () => {
      try {
        const response = await fetch(`${API_URL}/api/entries/user/${userId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data)) {
            setEntries(data);
          } else {
            setEntries(data.entries);
            setStreak(data.streak);
          }
        } else {
          console.error('Failed to fetch entries');
        }
      } catch (err) {
        console.error('Error fetching entries:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEntries();
  }, []);

  const filtered = useMemo(() => {
    let result = entries;
    
    if (moodFilter !== 'all') {
      result = result.filter(e => e.mood === moodFilter);
    }

    const q = query.trim().toLowerCase();
    if (q) {
      result = result.filter((e) =>
        (e.content || '').toLowerCase().includes(q) ||
        (e.title || '').toLowerCase().includes(q) ||
        (e.tags || []).some((t) => t.toLowerCase().includes(q))
      );
    }
    
    return result;
  }, [entries, query, moodFilter]);

  const stats = {
    total: entries.length,
    thisMonth: entries.filter(e => {
      const date = new Date(e.createdAt);
      const now = new Date();
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).length,
    moods: [...new Set(entries.map(e => e.mood))]
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getContentPreview = (content) => {
    return content.length > 160 ? content.substring(0, 160) + '...' : content;
  };

  if (loading) {
    return (
      <div className="main-content">
        <div style={{ textAlign: 'center', padding: '80px 20px', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div>
            <div style={{ 
              fontSize: '56px', 
              marginBottom: '24px',
              animation: 'bounce 2s infinite'
            }}>📔</div>
            <p style={{ fontSize: '18px', color: '#9ca3af', fontWeight: '500' }}>Loading your memories...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="entries-wrapper">
      <div className="entries-container">
        {/* Header */}
        <div className="entries-header">
          <div className="entries-header-content">
            <h1>📔 Your Journal Entries</h1>
            <p className="entries-header-subtitle">
              {entries.length} {entries.length === 1 ? 'entry' : 'entries'} logged • Keep your streak going! 🔥
            </p>
          </div>

          {/* Stats Grid */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-card-icon">📊</div>
              <div className="stat-card-value">{stats.total}</div>
              <div className="stat-card-label">Total Entries</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-icon">📅</div>
              <div className="stat-card-value">{stats.thisMonth}</div>
              <div className="stat-card-label">This Month</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-icon">🎭</div>
              <div className="stat-card-value">{stats.moods.length}</div>
              <div className="stat-card-label">Mood Types</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-icon">🔥</div>
              <div className="stat-card-value">{streak.current}</div>
              <div className="stat-card-label">Current Streak</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-icon">⭐</div>
              <div className="stat-card-value">{streak.longest}</div>
              <div className="stat-card-label">Best Streak</div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="entries-controls">
          <div className="entries-search">
            <input
              type="text"
              placeholder="Search by title, content, or tags..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="mood-filter">
            <button
              className={`mood-btn ${moodFilter === 'all' ? 'active' : ''}`}
              onClick={() => setMoodFilter('all')}
            >
              All Moods
            </button>
            {['happy', 'sad', 'calm', 'anxious'].map(mood => (
              <button
                key={mood}
                className={`mood-btn ${moodFilter === mood ? 'active' : ''}`}
                onClick={() => setMoodFilter(mood)}
              >
                {getMoodEmoji(mood)} {mood}
              </button>
            ))}
          </div>
        </div>

        {/* Entries List */}
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <div className="empty-state-text">
              {query || moodFilter !== 'all' ? 'No entries found' : 'No entries yet. Start journaling today!'}
            </div>
          </div>
        ) : (
          <div className="entries-list">
            {filtered.map((entry) => (
              <div
                key={entry._id}
                className="entry-card"
                onClick={() => setSelectedEntry(entry)}
              >
                <div className="entry-date">{formatDate(entry.createdAt)}</div>
                <div className={`entry-mood ${entry.mood || 'neutral'}`}>
                  {getMoodEmoji(entry.mood || 'neutral')} {entry.mood || 'neutral'}
                </div>
                <div className="entry-title">{entry.title || 'Untitled Entry'}</div>
                <div className="entry-preview">{getContentPreview(entry.content || '')}</div>
                {entry.tags && entry.tags.length > 0 && (
                  <div className="entry-tags">
                    {entry.tags.slice(0, 3).map((tag, i) => (
                      <span key={i} className="entry-tag">{tag}</span>
                    ))}
                    {entry.tags.length > 3 && (
                      <span className="entry-tag">+{entry.tags.length - 3} more</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {selectedEntry && (
          <div className="modal-overlay" onClick={() => setSelectedEntry(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setSelectedEntry(null)}>×</button>
              <h2 className="modal-title">{selectedEntry.title || 'Untitled Entry'}</h2>
              <p className="modal-date">{formatDate(selectedEntry.createdAt)}</p>
              <div className={`entry-mood ${selectedEntry.mood || 'neutral'}`}
                style={{ marginBottom: '16px' }}>
                {getMoodEmoji(selectedEntry.mood || 'neutral')} {selectedEntry.mood || 'neutral'}
              </div>
              <div className="modal-body">{selectedEntry.content || ''}</div>
              
              {/* Images */}
              {selectedEntry.images && selectedEntry.images.length > 0 && (
                <div className="modal-images-section">
                  <div className="modal-section-label">📷 Images</div>
                  <div className="modal-images-grid">
                    {selectedEntry.images.map((img, i) => (
                      <img
                        key={i}
                        src={img.dataUrl || img}
                        alt={`Entry ${i}`}
                        className="modal-image"
                        onClick={() => setFullscreenImage(img.dataUrl || img)}
                      />
                    ))}
                  </div>
                </div>
              )}
              
              {/* Files/Attachments */}
              {selectedEntry.files && selectedEntry.files.length > 0 && (
                <div className="modal-files-section">
                  <div className="modal-section-label">📎 Attachments</div>
                  <div className="modal-files-list">
                    {selectedEntry.files.map((file, i) => (
                      <div key={i} className="file-item">
                        <span className="file-icon">📄</span>
                        <span className="file-name">{file.name || `File ${i + 1}`}</span>
                        <a 
                          href={file.dataUrl || file}
                          download={file.name || `attachment-${i}`}
                          className="file-download"
                        >
                          ⬇️
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Fullscreen Image */}
        {fullscreenImage && (
          <div className="modal-overlay" onClick={() => setFullscreenImage(null)}>
            <img
              src={fullscreenImage}
              alt="Fullscreen"
              style={{
                maxWidth: '90vw',
                maxHeight: '90vh',
                borderRadius: '12px'
              }}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}
      </div>
    </div>
  );
}
