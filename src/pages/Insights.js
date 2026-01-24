import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002';

const Insights = () => {
  const [entries, setEntries] = useState([]);
  const [moodData, setMoodData] = useState({});
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(true);

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
          const entriesData = Array.isArray(data) ? data : data.entries || [];
          setEntries(entriesData);

          // Process mood data
          const moods = {};
          entriesData.forEach(entry => {
            const date = new Date(entry.createdAt).toDateString();
            moods[date] = moods[date] || { positive: 0, negative: 0, neutral: 0 };
            const mood = entry.mood || 'neutral';
            const sentiment = mood === 'happy' || mood === 'excited' || mood === 'calm' ? 'positive' 
                            : mood === 'sad' || mood === 'anxious' ? 'negative' 
                            : 'neutral';
            moods[date][sentiment]++;
          });
          setMoodData(moods);

          // Generate summary
          const totalEntries = entriesData.length;
          const avgSentiment = entriesData.reduce((acc, e) => {
            const mood = e.mood || 'neutral';
            if (mood === 'happy' || mood === 'excited' || mood === 'calm') return acc + 1;
            if (mood === 'sad' || mood === 'anxious') return acc - 1;
            return acc;
          }, 0) / (totalEntries || 1);
          setSummary(`You have ${totalEntries} entries. Average mood: ${avgSentiment > 0 ? 'Positive' : avgSentiment < 0 ? 'Negative' : 'Neutral'}`);
        }
      } catch (err) {
        console.error('Error fetching entries:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEntries();
  }, []);

  const generateRecommendations = (slice, days) => {
    const recommendations = [];
    const moodCounts = { positive: 0, negative: 0, neutral: 0 };
    const tagCount = {};
    const daysActive = new Set();
    const recentEntries = slice.slice(-5);
    
    slice.forEach(e => {
      const mood = e.mood || 'neutral';
      const sentiment = mood === 'happy' || mood === 'excited' || mood === 'calm' ? 'positive' 
                      : mood === 'sad' || mood === 'anxious' ? 'negative' 
                      : 'neutral';
      moodCounts[sentiment] = (moodCounts[sentiment] || 0) + 1;
      (e.tags || []).forEach(t => { tagCount[t] = (tagCount[t] || 0) + 1; });
      daysActive.add(new Date(e.createdAt).toDateString());
    });

    // Check recent negative streak
    const recentMoods = recentEntries.map(e => {
      const mood = e.mood || 'neutral';
      return mood === 'happy' || mood === 'excited' || mood === 'calm' ? 'positive' 
           : mood === 'sad' || mood === 'anxious' ? 'negative' 
           : 'neutral';
    });
    const negativeStreak = recentMoods.filter(m => m === 'negative').length;
    const positiveStreak = recentMoods.filter(m => m === 'positive').length;

    // Activity patterns
    const consistencyRate = (daysActive.size / days) * 100;
    
    // Generate personalized recommendations
    if (negativeStreak >= 2) {
      recommendations.push("💙 You've been feeling down lately. Try going for a walk, listening to your favorite music, or calling a friend. Small steps can make a big difference!");
    }
    
    if (positiveStreak >= 3) {
      recommendations.push("🌟 You're on a positive streak! Keep this momentum going. What made these days great? Do more of that!");
    }
    
    if (consistencyRate >= 80) {
      recommendations.push("🔥 Amazing consistency! You've been journaling regularly - this habit is building self-awareness and emotional intelligence.");
    } else if (consistencyRate < 30 && days === 7) {
      recommendations.push("📝 Try journaling daily for just 2 minutes. Even brief reflections can boost mood and clarity!");
    }
    
    // Tag-based insights
    if (tagCount['exercise'] >= 3 || tagCount['gym'] >= 3 || tagCount['workout'] >= 3) {
      recommendations.push("💪 You've been hitting the gym! Your consistency is impressive. Remember to fuel your body with protein-rich foods and stay hydrated!");
    }
    
    if (tagCount['work'] > tagCount['relaxation'] * 2) {
      recommendations.push("🧘 You've been focused on work. Don't forget to schedule some 'me time' - your mental health matters too!");
    }
    
    if (moodCounts.negative > moodCounts.positive && slice.length > 3) {
      recommendations.push("🌈 This period has been challenging. Consider: What's one small thing you can do today to care for yourself? You deserve kindness.");
    }
    
    if (moodCounts.positive > moodCounts.negative * 2) {
      recommendations.push("✨ Your positive energy is shining through! Keep celebrating the wins, big and small.");
    }

    // Default motivation if no specific patterns
    if (recommendations.length === 0) {
      recommendations.push("🌱 Keep nurturing your mental wellness journey. Every entry is a step toward greater self-understanding!");
    }
    
    return recommendations;
  };

  const summarize = (days) => {
    const since = new Date();
    since.setDate(since.getDate() - days);
    const slice = entries.filter(e => new Date(e.createdAt) >= since);
    const total = slice.length;
    const moodCounts = { positive:0, negative:0, neutral:0 };
    const tagCount = {};
    const daysActive = new Set();
    slice.forEach(e => {
      const mood = e.mood || 'neutral';
      const sentiment = mood === 'happy' || mood === 'excited' || mood === 'calm' ? 'positive' 
                      : mood === 'sad' || mood === 'anxious' ? 'negative' 
                      : 'neutral';
      moodCounts[sentiment] = (moodCounts[sentiment]||0) + 1;
      (e.tags||[]).forEach(t => { tagCount[t] = (tagCount[t]||0)+1; });
      daysActive.add(new Date(e.createdAt).toDateString());
    });
    const predominant = Object.entries(moodCounts).sort((a,b)=>b[1]-a[1])[0]?.[0] || 'neutral';
    const topTag = Object.entries(tagCount).sort((a,b)=>b[1]-a[1])[0]?.[0] || 'reflection';
    const recommendations = generateRecommendations(slice, days);
    return { total, predominant, topTag, activeDays: daysActive.size, recommendations, moodCounts };
  };

  if (loading) {
    return (
      <div className="main-content">
        <div className="page-container">
          <h1>📊 Insights</h1>
          <p style={{ textAlign: 'center', color: '#9ca3af' }}>Loading insights...</p>
        </div>
      </div>
    );
  }

  const weekly = summarize(7);
  const monthly = summarize(30);

  const getMoodEmoji = (mood) => {
    const moodMap = {
      happy: '😊',
      sad: '😔',
      anxious: '😰',
      calm: '😌',
      excited: '🤩',
      neutral: '😐'
    };
    return moodMap[mood] || '📝';
  };

  const getMoodSentiment = (mood) => {
    if (mood === 'happy' || mood === 'excited' || mood === 'calm') return 'positive';
    if (mood === 'sad' || mood === 'anxious') return 'negative';
    return 'neutral';
  };

  const moodChartData = {
    labels: Object.keys(moodData).slice(-30), // Last 30 days
    datasets: [
      {
        label: 'Positive',
        data: Object.values(moodData).slice(-30).map(d => d.positive),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
      {
        label: 'Negative',
        data: Object.values(moodData).slice(-30).map(d => d.negative),
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
      },
      {
        label: 'Neutral',
        data: Object.values(moodData).slice(-30).map(d => d.neutral),
        backgroundColor: 'rgba(255, 206, 86, 0.6)',
      },
    ],
  };

  if (entries.length === 0) {
    return (
      <div className="main-content">
        <div className="page-container">
          <h1>📊 Insights</h1>
          <div className="section" style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: '56px', marginBottom: '24px' }}>📭</div>
            <p style={{ fontSize: '18px', color: '#9ca3af' }}>No entries yet. Start journaling to see insights!</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content">
      <div className="page-container">
        <h1>📊 Insights</h1>

        <div className="section">
          <div className="card">
            <h3>📈 Summary</h3>
            <p>{summary}</p>
          </div>
        </div>

        <div className="section">
          <div className="section-header">
            <div className="section-icon">😊</div>
            <h3>Mood Trends</h3>
          </div>
          <div className="chart-container">
            <Bar data={moodChartData} />
          </div>
        </div>

        <div className="section">
          <div className="section-header">
            <div className="section-icon">💭</div>
            <h3>Recent Reflections</h3>
          </div>
          {entries.length === 0 ? (
            <p>No entries yet. Start journaling to see insights!</p>
          ) : (
            entries.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5).map(entry => (
              <div key={entry._id} className="card">
                <p>{entry.content.substring(0, 150)}...</p>
                {entry.images && entry.images.length > 0 && (
                  <div className="grid" style={{gridTemplateColumns:'repeat(3,1fr)', gap:'8px'}}>
                    {entry.images.slice(0,3).map((f, i) => (
                      <div key={i} className="media" style={{borderRadius:'10px', overflow:'hidden'}}>
                        <img alt={f.name} src={f.dataUrl} style={{width:'100%', height:'120px', objectFit:'cover'}} />
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex">
                  <small>{new Date(entry.createdAt).toLocaleDateString()}</small>
                  <span className={`badge ${getMoodSentiment(entry.mood || 'neutral')}`}>
                    {getMoodEmoji(entry.mood || 'neutral')} {entry.mood}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="section">
          <div className="section-header">
            <div className="section-icon">📅</div>
            <h3>Weekly Summary</h3>
          </div>
          <div className="card" style={{background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%)', border: '2px solid rgba(99, 102, 241, 0.3)'}}>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', marginBottom: '20px'}}>
              <div style={{background: 'rgba(255,255,255,0.95)', padding: '15px', borderRadius: '10px', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'}}>
                <div style={{fontSize: '28px', fontWeight: 'bold', color: '#6366f1'}}>{weekly.total}</div>
                <div style={{fontSize: '13px', color: '#1f2937', fontWeight: '500', marginTop: '5px'}}>Entries this week</div>
              </div>
              <div style={{background: 'rgba(255,255,255,0.95)', padding: '15px', borderRadius: '10px', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'}}>
                <div style={{fontSize: '28px', fontWeight: 'bold', color: '#8b5cf6'}}>{weekly.activeDays}/7</div>
                <div style={{fontSize: '13px', color: '#1f2937', fontWeight: '500', marginTop: '5px'}}>Active days</div>
              </div>
              <div style={{background: 'rgba(255,255,255,0.95)', padding: '15px', borderRadius: '10px', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'}}>
                <div style={{fontSize: '20px', fontWeight: 'bold', color: weekly.predominant === 'positive' ? '#10b981' : weekly.predominant === 'negative' ? '#ef4444' : '#f59e0b', textTransform: 'capitalize'}}>
                  {weekly.predominant === 'positive' ? '😊' : weekly.predominant === 'negative' ? '😔' : '😐'} {weekly.predominant}
                </div>
                <div style={{fontSize: '13px', color: '#1f2937', fontWeight: '500', marginTop: '5px'}}>Predominant mood</div>
              </div>
              <div style={{background: 'rgba(255,255,255,0.95)', padding: '15px', borderRadius: '10px', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'}}>
                <div style={{fontSize: '18px', fontWeight: 'bold', color: '#06b6d4'}}>#{weekly.topTag}</div>
                <div style={{fontSize: '13px', color: '#1f2937', fontWeight: '500', marginTop: '5px'}}>Top topic</div>
              </div>
            </div>
            
            {/* Mood breakdown */}
            <div style={{marginBottom: '20px', padding: '15px', background: 'rgba(255,255,255,0.95)', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'}}>
              <div style={{fontSize: '15px', fontWeight: '700', marginBottom: '12px', color: '#111827'}}>Mood Breakdown:</div>
              <div style={{display: 'flex', gap: '20px', fontSize: '14px', color: '#1f2937', fontWeight: '500', flexWrap: 'wrap'}}>
                <span>😊 Positive: <strong style={{color: '#10b981', fontSize: '16px'}}>{weekly.moodCounts.positive}</strong></span>
                <span>😐 Neutral: <strong style={{color: '#f59e0b', fontSize: '16px'}}>{weekly.moodCounts.neutral}</strong></span>
                <span>😔 Negative: <strong style={{color: '#ef4444', fontSize: '16px'}}>{weekly.moodCounts.negative}</strong></span>
              </div>
            </div>

            {/* Recommendations */}
            {weekly.recommendations && weekly.recommendations.length > 0 && (
              <div style={{background: 'rgba(255,255,255,0.95)', padding: '18px', borderRadius: '10px', borderLeft: '5px solid #6366f1', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'}}>
                <div style={{fontSize: '15px', fontWeight: '700', marginBottom: '12px', color: '#6366f1'}}>💡 Weekly Insights & Recommendations:</div>
                {weekly.recommendations.map((rec, i) => (
                  <div key={i} style={{padding: '12px', marginBottom: '8px', background: 'white', borderRadius: '8px', fontSize: '14px', lineHeight: '1.7', color: '#1f2937', border: '1px solid #e5e7eb'}}>
                    {rec}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="section">
          <div className="section-header">
            <div className="section-icon">🗓️</div>
            <h3>Monthly Summary</h3>
          </div>
          <div className="card" style={{background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.15) 0%, rgba(251, 146, 60, 0.15) 100%)', border: '2px solid rgba(236, 72, 153, 0.3)'}}>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', marginBottom: '20px'}}>
              <div style={{background: 'rgba(255,255,255,0.95)', padding: '15px', borderRadius: '10px', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'}}>
                <div style={{fontSize: '28px', fontWeight: 'bold', color: '#ec4899'}}>{monthly.total}</div>
                <div style={{fontSize: '13px', color: '#1f2937', fontWeight: '500', marginTop: '5px'}}>Entries this month</div>
              </div>
              <div style={{background: 'rgba(255,255,255,0.95)', padding: '15px', borderRadius: '10px', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'}}>
                <div style={{fontSize: '28px', fontWeight: 'bold', color: '#f97316'}}>{monthly.activeDays}/30</div>
                <div style={{fontSize: '13px', color: '#1f2937', fontWeight: '500', marginTop: '5px'}}>Active days</div>
              </div>
              <div style={{background: 'rgba(255,255,255,0.95)', padding: '15px', borderRadius: '10px', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'}}>
                <div style={{fontSize: '20px', fontWeight: 'bold', color: monthly.predominant === 'positive' ? '#10b981' : monthly.predominant === 'negative' ? '#ef4444' : '#f59e0b', textTransform: 'capitalize'}}>
                  {monthly.predominant === 'positive' ? '😊' : monthly.predominant === 'negative' ? '😔' : '😐'} {monthly.predominant}
                </div>
                <div style={{fontSize: '13px', color: '#1f2937', fontWeight: '500', marginTop: '5px'}}>Prevailing mood</div>
              </div>
              <div style={{background: 'rgba(255,255,255,0.95)', padding: '15px', borderRadius: '10px', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'}}>
                <div style={{fontSize: '18px', fontWeight: 'bold', color: '#14b8a6'}}>#{monthly.topTag}</div>
                <div style={{fontSize: '13px', color: '#1f2937', fontWeight: '500', marginTop: '5px'}}>Top topic</div>
              </div>
            </div>
            
            {/* Mood breakdown */}
            <div style={{marginBottom: '20px', padding: '15px', background: 'rgba(255,255,255,0.95)', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'}}>
              <div style={{fontSize: '15px', fontWeight: '700', marginBottom: '12px', color: '#111827'}}>Mood Breakdown:</div>
              <div style={{display: 'flex', gap: '20px', fontSize: '14px', color: '#1f2937', fontWeight: '500', flexWrap: 'wrap'}}>
                <span>😊 Positive: <strong style={{color: '#10b981', fontSize: '16px'}}>{monthly.moodCounts.positive}</strong></span>
                <span>😐 Neutral: <strong style={{color: '#f59e0b', fontSize: '16px'}}>{monthly.moodCounts.neutral}</strong></span>
                <span>😔 Negative: <strong style={{color: '#ef4444', fontSize: '16px'}}>{monthly.moodCounts.negative}</strong></span>
              </div>
            </div>

            {/* Recommendations */}
            {monthly.recommendations && monthly.recommendations.length > 0 && (
              <div style={{background: 'rgba(255,255,255,0.95)', padding: '18px', borderRadius: '10px', borderLeft: '5px solid #ec4899', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'}}>
                <div style={{fontSize: '15px', fontWeight: '700', marginBottom: '12px', color: '#ec4899'}}>💡 Monthly Insights & Recommendations:</div>
                {monthly.recommendations.map((rec, i) => (
                  <div key={i} style={{padding: '12px', marginBottom: '8px', background: 'white', borderRadius: '8px', fontSize: '14px', lineHeight: '1.7', color: '#1f2937', border: '1px solid #e5e7eb'}}>
                    {rec}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Insights;
