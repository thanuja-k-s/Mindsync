import React, { useEffect, useMemo, useState } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

export default function Entries() {
  const [entries, setEntries] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      setLoading(false);
      return;
    }

    // Fetch entries from backend
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
    const q = query.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter((e) =>
      (e.content || '').toLowerCase().includes(q) ||
      (e.tags || []).some((t) => t.toLowerCase().includes(q))
    );
  }, [entries, query]);

  if (loading) return <div className="main-content"><p>Loading entries...</p></div>;

  return (
    <div className="main-content">
      <div className="page-container">
        <h1>📚 All Entries</h1>
        <div className="form" style={{marginBottom:'20px'}}>
          <input
            type="text"
            placeholder="Search entries by text or tag..."
            value={query}
            onChange={(e)=>setQuery(e.target.value)}
          />
        </div>

        {filtered.length === 0 ? (
          <p className="muted">No matching entries.</p>
        ) : (
          <div className="grid">
            {filtered.map((e) => (
              <article key={e._id} className="card">
                <div className="flex" style={{justifyContent:'space-between', marginBottom:'12px'}}>
                  <small className="muted">{new Date(e.createdAt).toLocaleString()}</small>
                  <span className={`badge ${e.mood}`}>{e.mood}</span>
                </div>
                {e.title && <h3 style={{marginTop:'0'}}>{e.title}</h3>}
                <p style={{marginTop:'12px', marginBottom:'16px', lineHeight:'1.6'}}>{e.content}</p>
                
                {/* Display Images */}
                {e.images?.length > 0 && (
                  <div className="grid" style={{gridTemplateColumns:'repeat(2,1fr)', gap:'12px', marginBottom:'16px'}}>
                    {e.images.map((img, idx) => (
                      <div key={idx} className="media" style={{borderRadius:'10px', overflow:'hidden'}}>
                        <img alt={img.name} src={img.dataUrl} style={{width:'100%', height:'160px', objectFit:'cover'}} />
                      </div>
                    ))}
                  </div>
                )}

                {/* Display Other Files */}
                {e.files?.length > 0 && (
                  <div className="grid" style={{gridTemplateColumns:'repeat(2,1fr)', gap:'12px', marginBottom:'16px'}}>
                    {e.files.map((f, idx) => (
                      <div key={idx} className="media" style={{borderRadius:'10px', overflow:'hidden'}}>
                        {f.type?.startsWith('video/') ? (
                          <video controls src={f.dataUrl} style={{width:'100%', height:'160px', objectFit:'cover'}} />
                        ) : (
                          <a href={f.dataUrl} download={f.name} className="link">{f.name}</a>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {e.tags?.length > 0 && (
                  <div className="flex" style={{marginTop:'12px', gap:'8px', flexWrap:'wrap'}}>
                    {e.tags.map((t, i) => (
                      <span key={i} className="badge" style={{fontWeight:700}}>{t}</span>
                    ))}
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
