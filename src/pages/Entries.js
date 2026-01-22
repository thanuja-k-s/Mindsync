import React, { useEffect, useMemo, useState } from 'react';

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

const getSentimentColor = (sentiment) => {
  const colors = {
    positive: '#10b981',
    negative: '#ef4444',
    neutral: '#6b7280'
  };
  return colors[sentiment] || '#6b7280';
};

const StatCard = ({ icon, value, label, gradient }) => (
  <div style={{ 
    background: gradient,
    padding: '12px 16px',
    borderRadius: '12px',
    color: 'white',
    textAlign: 'center',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    transition: 'all 0.3s ease',
    cursor: 'default',
    position: 'relative',
    overflow: 'hidden'
  }}
  onMouseEnter={(el) => {
    el.currentTarget.style.transform = 'translateY(-4px)';
    el.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.2)';
  }}
  onMouseLeave={(el) => {
    el.currentTarget.style.transform = 'translateY(0)';
    el.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
  }}>
    <div style={{
      position: 'absolute',
      top: '-50%',
      right: '-20%',
      width: '100px',
      height: '100px',
      background: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '50%',
      animation: 'float 6s ease-in-out infinite'
    }} />
    <div style={{ position: 'relative', zIndex: 1 }}>
      <div style={{ fontSize: '14px', marginBottom: '4px' }}>{icon}</div>
      <div style={{ fontSize: '22px', fontWeight: '800', marginBottom: '2px' }}>{value}</div>
      <div style={{ fontSize: '11px', opacity: 0.85, fontWeight: '500', letterSpacing: '0.3px' }}>{label}</div>
    </div>
  </div>
);

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
    <div className="main-content">
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px 16px' }}>
        {/* Header with Gradient Background */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%)',
          borderRadius: '16px',
          padding: '24px 20px',
          marginBottom: '24px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ fontSize: '32px', animation: 'pulse 3s ease-in-out infinite' }}>📔</div>
            <div>
              <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '800', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Your Journal Entries
              </h1>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#9ca3af', fontWeight: '500' }}>
                {entries.length} {entries.length === 1 ? 'entry' : 'entries'} logged • Keep your streak going! 🔥
              </p>
            </div>
          </div>
          
          {/* Stats Grid */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', 
            gap: '10px'
          }}>
            <StatCard 
              icon="📊" 
              value={stats.total} 
              label="Total Entries" 
              gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            />
            <StatCard 
              icon="📅" 
              value={stats.thisMonth} 
              label="This Month" 
              gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
            />
            <StatCard 
              icon="🎭" 
              value={stats.moods.length} 
              label="Mood Types" 
              gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
            />
            <StatCard 
              icon="🔥" 
              value={streak.current} 
              label="Current Streak" 
              gradient="linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
            />
            <StatCard 
              icon="⭐" 
              value={streak.longest} 
              label="Best Streak" 
              gradient="linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)"
            />
          </div>
        </div>

        {/* Search and Filter Section */}
        <div style={{ 
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)',
          padding: '16px',
          borderRadius: '14px',
          marginBottom: '28px',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
        }}>
          {/* Search Input */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#9ca3af', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
              🔍 Search
            </label>
            <input
              type="text"
              placeholder="Find by title, content, or tags..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '10px',
                border: '2px solid transparent',
                background: 'rgba(255, 255, 255, 0.08)',
                color: 'white',
                fontSize: '13px',
                fontWeight: '500',
                boxSizing: 'border-box',
                transition: 'all 0.3s ease',
                outline: 'none'
              }}
              onFocus={(e) => {
                e.currentTarget.style.background = 'rgba(102, 126, 234, 0.15)';
                e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.5)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.borderColor = 'transparent';
              }}
            />
          </div>

          {/* Mood Filter */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#9ca3af', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
              🎭 Mood Filter
            </label>
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'flex-start' }}>
              <button
                onClick={() => setMoodFilter('all')}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  border: moodFilter === 'all' ? '1.5px solid #667eea' : '1.5px solid transparent',
                  background: moodFilter === 'all' ? 'rgba(102, 126, 234, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                  color: moodFilter === 'all' ? '#a5b4fc' : '#d1d5db',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontWeight: moodFilter === 'all' ? '700' : '500',
                  transition: 'all 0.3s ease',
                  whiteSpace: 'nowrap',
                  flex: '0 0 auto'
                }}
                onMouseEnter={(e) => {
                  if (moodFilter !== 'all') {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (moodFilter !== 'all') {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  }
                }}
              >
                All
              </button>
              {stats.moods.map(mood => (
                <button
                  key={mood}
                  onClick={() => setMoodFilter(mood)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    border: moodFilter === mood ? '1.5px solid #667eea' : '1.5px solid transparent',
                    background: moodFilter === mood ? 'rgba(102, 126, 234, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                    color: moodFilter === mood ? '#a5b4fc' : '#d1d5db',
                    cursor: 'pointer',
                    fontSize: '11px',
                    fontWeight: moodFilter === mood ? '700' : '500',
                    transition: 'all 0.3s ease',
                    whiteSpace: 'nowrap',
                    flex: '0 0 auto'
                  }}
                  onMouseEnter={(e) => {
                    if (moodFilter !== mood) {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (moodFilter !== mood) {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                    }
                  }}
                >
                  {getMoodEmoji(mood)} <span style={{ marginLeft: '3px', textTransform: 'capitalize', fontSize: '11px' }}>{mood}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Entries Grid */}
        {filtered.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '100px 40px',
            color: '#9ca3af'
          }}>
            <div style={{ fontSize: '72px', marginBottom: '24px', animation: 'bounce 2s infinite' }}>🔎</div>
            <p style={{ fontSize: '20px', marginBottom: '10px', fontWeight: '600', color: '#d1d5db' }}>No entries found</p>
            <p style={{ fontSize: '15px', opacity: 0.7 }}>Try adjusting your search or mood filters</p>
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: '24px'
          }}>
            {filtered.map((e, idx) => (
              <article 
                key={e._id} 
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '18px',
                  padding: '28px',
                  backdropFilter: 'blur(10px)',
                  cursor: 'pointer',
                  transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
                  position: 'relative',
                  overflow: 'hidden',
                  animation: `slideIn 0.5s ease-out ${idx * 0.05}s both`
                }}
                onMouseEnter={(el) => {
                  el.currentTarget.style.transform = 'translateY(-12px)';
                  el.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.2)';
                  el.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.4)';
                }}
                onMouseLeave={(el) => {
                  el.currentTarget.style.transform = 'translateY(0)';
                  el.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.1)';
                  el.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                }}
              >
                {/* Decorative Background */}
                <div style={{
                  position: 'absolute',
                  top: '-100px',
                  right: '-100px',
                  width: '250px',
                  height: '250px',
                  background: 'radial-gradient(circle, rgba(102, 126, 234, 0.1) 0%, transparent 70%)',
                  borderRadius: '50%',
                  pointerEvents: 'none'
                }} />

                {/* Entry Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', position: 'relative', zIndex: 1 }}>
                  <div>
                    <div style={{ fontSize: '36px', marginBottom: '8px' }}>{getMoodEmoji(e.mood)}</div>
                    <small style={{ color: '#9ca3af', fontSize: '12px', fontWeight: '600', letterSpacing: '0.5px' }}>
                      {formatDate(e.createdAt)}
                    </small>
                  </div>
                  <div style={{
                    padding: '8px 14px',
                    background: getSentimentColor(e.sentiment),
                    color: 'white',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    boxShadow: `0 4px 12px ${getSentimentColor(e.sentiment)}40`
                  }}>
                    {e.sentiment || 'neutral'}
                  </div>
                </div>

                {/* Entry Title */}
                {e.title && (
                  <h3 style={{
                    margin: '0 0 12px 0',
                    fontSize: '18px',
                    fontWeight: '700',
                    color: 'white',
                    lineHeight: '1.5',
                    position: 'relative',
                    zIndex: 1
                  }}>
                    {e.title}
                  </h3>
                )}

                {/* Entry Content Preview */}
                <p style={{
                  margin: '0 0 20px 0',
                  fontSize: '14px',
                  lineHeight: '1.7',
                  color: '#d1d5db',
                  flexGrow: 1,
                  position: 'relative',
                  zIndex: 1
                }}>
                  {getContentPreview(e.content)}
                </p>

                {/* Images Grid */}
                {e.images?.length > 0 && (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '10px',
                    marginBottom: '20px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    position: 'relative',
                    zIndex: 1
                  }}>
                    {e.images.slice(0, 4).map((img, idx) => (
                      <div 
                        key={idx} 
                        style={{ 
                          position: 'relative', 
                          overflow: 'hidden', 
                          borderRadius: '10px', 
                          background: 'rgba(0, 0, 0, 0.3)',
                          cursor: 'pointer'
                        }}
                        onClick={() => setFullscreenImage(img.dataUrl)}
                      >
                        <img 
                          alt={img.name} 
                          src={img.dataUrl} 
                          style={{
                            width: '100%',
                            height: '140px',
                            objectFit: 'cover',
                            transition: 'transform 0.4s ease',
                          }}
                          onMouseEnter={(el) => el.currentTarget.style.transform = 'scale(1.08)'}
                          onMouseLeave={(el) => el.currentTarget.style.transform = 'scale(1)'}
                        />
                        <div style={{
                          position: 'absolute',
                          top: 0,
                          right: 0,
                          bottom: 0,
                          left: 0,
                          background: 'rgba(0, 0, 0, 0)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.3s ease',
                          opacity: 0
                        }}
                        onMouseEnter={(el) => {
                          el.currentTarget.style.background = 'rgba(0, 0, 0, 0.5)';
                          el.currentTarget.style.opacity = '1';
                        }}
                        onMouseLeave={(el) => {
                          el.currentTarget.style.background = 'rgba(0, 0, 0, 0)';
                          el.currentTarget.style.opacity = '0';
                        }}>
                          <div style={{ color: 'white', fontSize: '24px' }}>🔍</div>
                        </div>
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
                            fontWeight: '800',
                            backdropFilter: 'blur(4px)'
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
                  <div style={{ marginBottom: '18px', position: 'relative', zIndex: 1 }}>
                    <div style={{ 
                      fontSize: '12px', 
                      color: '#9ca3af', 
                      fontWeight: '600',
                      marginBottom: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      📎 {e.files.length} attachment{e.files.length > 1 ? 's' : ''}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {e.files.map((file, idx) => (
                        <a
                          key={idx}
                          href={file.dataUrl}
                          download={file.name}
                          style={{
                            padding: '8px 12px',
                            background: 'rgba(102, 126, 234, 0.15)',
                            border: '1px solid rgba(102, 126, 234, 0.3)',
                            borderRadius: '6px',
                            color: '#a5b4fc',
                            fontSize: '12px',
                            fontWeight: '500',
                            textDecoration: 'none',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(102, 126, 234, 0.3)';
                            e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.6)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(102, 126, 234, 0.15)';
                            e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.3)';
                          }}
                        >
                          📄 {file.name}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tags */}
                {e.tags?.length > 0 && (
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: 'auto', position: 'relative', zIndex: 1 }}>
                    {e.tags.slice(0, 3).map((tag, idx) => (
                      <span 
                        key={idx}
                        style={{
                          padding: '6px 12px',
                          background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.3) 0%, rgba(139, 92, 246, 0.2) 100%)',
                          color: '#a5b4fc',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: '600',
                          border: '1px solid rgba(102, 126, 234, 0.3)',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(el) => {
                          el.currentTarget.style.background = 'linear-gradient(135deg, rgba(102, 126, 234, 0.5) 0%, rgba(139, 92, 246, 0.4) 100%)';
                          el.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.6)';
                        }}
                        onMouseLeave={(el) => {
                          el.currentTarget.style.background = 'linear-gradient(135deg, rgba(102, 126, 234, 0.3) 0%, rgba(139, 92, 246, 0.2) 100%)';
                          el.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.3)';
                        }}
                      >
                        #{tag}
                      </span>
                    ))}
                    {e.tags.length > 3 && (
                      <span style={{
                        padding: '6px 12px',
                        color: '#9ca3af',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        +{e.tags.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Image Modal */}
      {fullscreenImage && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.95)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            backdropFilter: 'blur(10px)',
            animation: 'fadeIn 0.3s ease'
          }}
          onClick={() => setFullscreenImage(null)}
          onKeyDown={(e) => e.key === 'Escape' && setFullscreenImage(null)}
          tabIndex={0}
          autoFocus
        >
          {/* Close Button */}
          <button
            onClick={() => setFullscreenImage(null)}
            style={{
              position: 'absolute',
              top: '20px',
              right: '30px',
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              color: 'white',
              fontSize: '32px',
              cursor: 'pointer',
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease',
              zIndex: 10001,
              backdropFilter: 'blur(10px)'
            }}
            onMouseEnter={(el) => {
              el.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
              el.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(el) => {
              el.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
              el.currentTarget.style.transform = 'scale(1)';
            }}
          >
            ✕
          </button>

          {/* Image Container */}
          <div
            style={{
              position: 'relative',
              maxWidth: '90vw',
              maxHeight: '90vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
              animation: 'slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={fullscreenImage} 
              alt="fullscreen" 
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                display: 'block'
              }}
            />
          </div>

          {/* Info Text */}
          <div style={{
            position: 'absolute',
            bottom: '30px',
            left: '50%',
            transform: 'translateX(-50%)',
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '14px',
            textAlign: 'center',
            zIndex: 10001
          }}>
            <p style={{ margin: '0 0 8px 0' }}>Click outside or press ESC to close</p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
