import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import CryptoJS from 'crypto-js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Insights = () => {
  const [entries, setEntries] = useState([]);
  const [moodData, setMoodData] = useState({});
  const [summary, setSummary] = useState('');
  const [weeklyChecks, setWeeklyChecks] = useState([false, false, false, false]);
  const [monthlyChecks, setMonthlyChecks] = useState([false, false, false, false]);

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) return;

    const encryptedEntries = JSON.parse(localStorage.getItem(`${user}_entries`) || '[]');
    const decryptedEntries = encryptedEntries.map(e => {
      try {
        const bytes = CryptoJS.AES.decrypt(e, 'secret-key');
        return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
      } catch {
        return null;
      }
    }).filter(e => e);

    setEntries(decryptedEntries);

    // Process mood data
    const moods = {};
    decryptedEntries.forEach(entry => {
      const date = new Date(entry.date).toDateString();
      moods[date] = moods[date] || { positive: 0, negative: 0, neutral: 0 };
      moods[date][entry.sentiment]++;
    });
    setMoodData(moods);

    // Generate summary
    const totalEntries = decryptedEntries.length;
    const avgSentiment = decryptedEntries.reduce((acc, e) => {
      if (e.sentiment === 'positive') return acc + 1;
      if (e.sentiment === 'negative') return acc - 1;
      return acc;
    }, 0) / totalEntries;
    setSummary(`You have ${totalEntries} entries. Average mood: ${avgSentiment > 0 ? 'Positive' : avgSentiment < 0 ? 'Negative' : 'Neutral'}`);
  }, []);

  const summarize = (days) => {
    const since = new Date();
    since.setDate(since.getDate() - days);
    const slice = entries.filter(e => new Date(e.date) >= since);
    const total = slice.length;
    const moodCounts = { positive:0, negative:0, neutral:0 };
    const tagCount = {};
    const daysActive = new Set();
    slice.forEach(e => {
      moodCounts[e.sentiment] = (moodCounts[e.sentiment]||0) + 1;
      (e.tags||[]).forEach(t => { tagCount[t] = (tagCount[t]||0)+1; });
      daysActive.add(new Date(e.date).toDateString());
    });
    const predominant = Object.entries(moodCounts).sort((a,b)=>b[1]-a[1])[0]?.[0] || 'neutral';
    const topTag = Object.entries(tagCount).sort((a,b)=>b[1]-a[1])[0]?.[0] || 'reflection';
    return { total, predominant, topTag, activeDays: daysActive.size };
  };

  const weekly = summarize(7);
  const monthly = summarize(30);

  const moodChartData = {
    labels: Object.keys(moodData),
    datasets: [
      {
        label: 'Positive',
        data: Object.values(moodData).map(d => d.positive),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
      {
        label: 'Negative',
        data: Object.values(moodData).map(d => d.negative),
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
      },
      {
        label: 'Neutral',
        data: Object.values(moodData).map(d => d.neutral),
        backgroundColor: 'rgba(255, 206, 86, 0.6)',
      },
    ],
  };

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
          {entries.slice(-5).length === 0 ? (
            <p>No entries yet. Start journaling to see insights!</p>
          ) : (
            entries.slice(-5).map(entry => (
              <div key={entry.id} className="card">
                <p>{entry.text.substring(0, 150)}...</p>
                {entry.files && entry.files.length > 0 && (
                  <div className="grid" style={{gridTemplateColumns:'repeat(3,1fr)', gap:'8px'}}>
                    {entry.files.slice(0,3).map((f, i) => (
                      <div key={i} className="media" style={{borderRadius:'10px', overflow:'hidden'}}>
                        {f.type?.startsWith('image/') ? (
                          <img alt={f.name} src={f.dataUrl} style={{width:'100%', height:'120px', objectFit:'cover'}} />
                        ) : f.type?.startsWith('video/') ? (
                          <video src={f.dataUrl} style={{width:'100%', height:'120px', objectFit:'cover'}} />
                        ) : null}
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex">
                  <small>{new Date(entry.date).toLocaleDateString()}</small>
                  <span className={`badge ${entry.sentiment}`}>
                    {entry.sentiment.charAt(0).toUpperCase() + entry.sentiment.slice(1)}
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
          <div className="card">
            <ul style={{listStyle:'none', padding:0, margin:0, display:'grid', gap:'10px'}}>
              {[
                `Entries this week: ${weekly.total}`,
                `Active days: ${weekly.activeDays}/7`,
                `Predominant mood: ${weekly.predominant}`,
                `Top topic: ${weekly.topTag}`,
              ].map((text, i) => (
                <li key={i} style={{display:'flex', alignItems:'center', gap:'10px'}}>
                  <input type="checkbox" checked={weeklyChecks[i]} onChange={() => setWeeklyChecks(prev => prev.map((v,idx)=> idx===i ? !v : v))} />
                  <span>{text}</span>
                </li>
              ))}
            </ul>
            {weeklyChecks.some(Boolean) && (
              <p className="muted" style={{marginTop:'10px'}}>Great job ticking your weekly wins! Keep leaning into the positive moments and write a quick reflection to capture them.</p>
            )}
          </div>
        </div>

        <div className="section">
          <div className="section-header">
            <div className="section-icon">🗓️</div>
            <h3>Monthly Summary</h3>
          </div>
          <div className="card">
            <ul style={{listStyle:'none', padding:0, margin:0, display:'grid', gap:'10px'}}>
              {[
                `Entries this month: ${monthly.total}`,
                `Active days: ${monthly.activeDays}/30`,
                `Prevailing mood: ${monthly.predominant}`,
                `Top topic: ${monthly.topTag}`,
              ].map((text, i) => (
                <li key={i} style={{display:'flex', alignItems:'center', gap:'10px'}}>
                  <input type="checkbox" checked={monthlyChecks[i]} onChange={() => setMonthlyChecks(prev => prev.map((v,idx)=> idx===i ? !v : v))} />
                  <span>{text}</span>
                </li>
              ))}
            </ul>
            {monthlyChecks.some(Boolean) && (
              <p className="muted" style={{marginTop:'10px'}}>Nice momentum this month! Celebrate the wins and set one tiny habit to amplify the positives next week.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Insights;
