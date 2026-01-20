import React, { useEffect, useMemo, useState } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

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

const getSentimentColor = (sentiment) => {
  const colors = {
    positive: '#10b981',
    negative: '#ef4444',
    neutral: '#6b7280'
  };
  return colors[sentiment] || '#6b7280';
};

export default function Entries() {
  const [entries, setEntries] = useState([]);
  const [query, setQuery] = useState('');
  const [moodFilter, setMoodFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState(null);

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
          setEntries(data);
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
    return content.length > 150 ? content.substring(0, 150) + '...' : content;
  };

  if (loading) {
    return (
      <div className="main-content">
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ 
            fontSize: '48px', 
            marginBottom: '20px',
            animation: 'spin 2s linear infinite'
          }}>⏳</div>
          <p style={{ fontSize: '18px', color: '#9ca3af' }}>Loading your memories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content">
      <div className="page-container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header Section */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <h1 style={{ margin: 0, fontSize: '36px' }}>📔 Your Journal Entries</h1>
          </div>
          
          {/* Stats */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
            gap: '16px',
            marginBottom: '30px'
          }}>
            <div style={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              padding: '20px',
              borderRadius: '12px',
              color: 'white',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{stats.total}</div>
              <div style={{ fontSize: '14px', opacity: 0.9 }}>Total Entries</div>
            </div>
            <div style={{ 
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              padding: '20px',
              borderRadius: '12px',
              color: 'white',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{stats.thisMonth}</div>
              <div style={{ fontSize: '14px', opacity: 0.9 }}>This Month</div>
            </div>
            <div style={{ 
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              padding: '20px',
              borderRadius: '12px',
              color: 'white',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{stats.moods.length}</div>
              <div style={{ fontSize: '14px', opacity: 0.9 }}>Mood Types</div>
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.05)',
          padding: '20px',
          borderRadius: '12px',
          marginBottom: '30px',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ marginBottom: '16px' }}>
            <input
              type="text"
              placeholder="🔍 Search by title, content, or tags..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                background: 'rgba(255, 255, 255, 0.05)',
                color: 'white',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Mood Filter */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setMoodFilter('all')}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                border: 'none',
                background: moodFilter === 'all' ? '#667eea' : 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: moodFilter === 'all' ? 'bold' : 'normal',
                transition: 'all 0.3s'
              }}
            >
              All Moods
            </button>
            {stats.moods.map(mood => (
              <button
                key={mood}
                onClick={() => setMoodFilter(mood)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '20px',
                  border: 'none',
                  background: moodFilter === mood ? '#667eea' : 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: moodFilter === mood ? 'bold' : 'normal',
                  transition: 'all 0.3s'
                }}
              >
                {getMoodEmoji(mood)} {mood}
              </button>
            ))}
          </div>
        </div>

        {/* Entries Grid */}
        {filtered.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '80px 20px',
            color: '#9ca3af'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>🔎</div>
            <p style={{ fontSize: '18px', marginBottom: '10px' }}>No entries found</p>
            <p style={{ fontSize: '14px', opacity: 0.7 }}>Try adjusting your search or mood filters</p>
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '24px'
          }}>
            {filtered.map((e) => (
              <article 
                key={e._id} 
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '16px',
                  padding: '24px',
                  backdropFilter: 'blur(10px)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%'
                }}
                onMouseEnter={(el) => el.currentTarget.style.transform = 'translateY(-4px)'}
                onMouseLeave={(el) => el.currentTarget.style.transform = 'translateY(0)'}
              >
                {/* Entry Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                  <div>
                    <div style={{ fontSize: '24px', marginBottom: '4px' }}>{getMoodEmoji(e.mood)}</div>
                    <small style={{ color: '#9ca3af', fontSize: '13px' }}>{formatDate(e.createdAt)}</small>
                  </div>
                  <div style={{
                    padding: '6px 12px',
                    background: getSentimentColor(e.sentiment),
                    color: 'white',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    textTransform: 'capitalize'
                  }}>
                    {e.sentiment || 'neutral'}
                  </div>
                </div>

                {/* Entry Title */}
                {e.title && (
                  <h3 style={{
                    margin: '0 0 12px 0',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    color: 'white',
                    lineHeight: '1.4'
                  }}>
                    {e.title}
                  </h3>
                )}

                {/* Entry Content Preview */}
                <p style={{
                  margin: '0 0 16px 0',
                  fontSize: '14px',
                  lineHeight: '1.6',
                  color: '#d1d5db',
                  flexGrow: 1
                }}>
                  {getContentPreview(e.content)}
                </p>

                {/* Images */}
                {e.images?.length > 0 && (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '8px',
                    marginBottom: '16px',
                    borderRadius: '8px',
                    overflow: 'hidden'
                  }}>
                    {e.images.slice(0, 4).map((img, idx) => (
                      <div key={idx} style={{ position: 'relative', overflow: 'hidden', borderRadius: '8px' }}>
                        <img 
                          alt={img.name} 
                          src={img.dataUrl} 
                          style={{
                            width: '100%',
                            height: '120px',
                            objectFit: 'cover',
                            transition: 'transform 0.3s',
                          }}
                          onMouseEnter={(el) => el.currentTarget.style.transform = 'scale(1.05)'}
                          onMouseLeave={(el) => el.currentTarget.style.transform = 'scale(1)'}
                        />
                        {e.images.length > 4 && idx === 3 && (
                          <div style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'rgba(0, 0, 0, 0.7)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '20px',
                            fontWeight: 'bold'
                          }}>
                            +{e.images.length - 4}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Files */}
                {e.files?.length > 0 && (
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '8px' }}>
                      📎 {e.files.length} attachment{e.files.length > 1 ? 's' : ''}
                    </div>
                  </div>
                )}

                {/* Tags */}
                {e.tags?.length > 0 && (
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: 'auto' }}>
                    {e.tags.slice(0, 3).map((tag, idx) => (
                      <span 
                        key={idx}
                        style={{
                          padding: '4px 10px',
                          background: 'rgba(102, 126, 234, 0.3)',
                          color: '#a5b4fc',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}
                      >
                        #{tag}
                      </span>
                    ))}
                    {e.tags.length > 3 && (
                      <span style={{
                        padding: '4px 10px',
                        color: '#9ca3af',
                        fontSize: '12px'
                      }}>
                        +{e.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
