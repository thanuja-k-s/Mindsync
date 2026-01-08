import React, { useEffect, useMemo, useState } from 'react';
import CryptoJS from 'crypto-js';

export default function Entries() {
  const [entries, setEntries] = useState([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) return;
    const encryptedEntries = JSON.parse(localStorage.getItem(`${user}_entries`) || '[]');
    const decryptedEntries = encryptedEntries.map((e) => {
      try {
        const bytes = CryptoJS.AES.decrypt(e, 'secret-key');
        return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
      } catch {
        return null;
      }
    }).filter(Boolean);
    // newest first
    decryptedEntries.sort((a,b) => new Date(b.date) - new Date(a.date));
    setEntries(decryptedEntries);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter((e) =>
      (e.text || '').toLowerCase().includes(q) ||
      (e.tags || []).some((t) => t.toLowerCase().includes(q))
    );
  }, [entries, query]);

  return (
    <div className="main-content">
      <div className="page-container">
        <h1>📚 All Entries</h1>
        <div className="form" style={{marginBottom:'12px'}}>
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
          <div className="grid" style={{gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))'}}>
            {filtered.map((e) => (
              <article key={e.id} className="card">
                <div className="flex" style={{justifyContent:'space-between'}}>
                  <small className="muted">{new Date(e.date).toLocaleString()}</small>
                  <span className={`badge ${e.sentiment}`}>{e.sentiment}</span>
                </div>
                <p style={{marginTop:'8px'}}>{e.text}</p>
                {e.files?.length > 0 && (
                  <div className="grid" style={{gridTemplateColumns:'repeat(2,1fr)', gap:'8px', marginTop:'8px'}}>
                    {e.files.map((f, idx) => (
                      <div key={idx} className="media" style={{borderRadius:'10px', overflow:'hidden'}}>
                        {f.type?.startsWith('image/') ? (
                          <img alt={f.name} src={f.dataUrl} style={{width:'100%', height:'160px', objectFit:'cover'}} />
                        ) : f.type?.startsWith('video/') ? (
                          <video controls src={f.dataUrl} style={{width:'100%', height:'160px', objectFit:'cover'}} />
                        ) : (
                          <a href={f.dataUrl} download={f.name} className="link">{f.name}</a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {e.tags?.length > 0 && (
                  <div className="flex" style={{marginTop:'8px'}}>
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
