import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

const Journaling = () => {
  const [entry, setEntry] = useState('');
  const [files, setFiles] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');
  const [error, setError] = useState('');
  const recognitionRef = useRef(null);
  const navigate = useNavigate();

  const handleFileUpload = (e) => {
    setFiles([...files, ...Array.from(e.target.files || [])]);
  };

  const startRecording = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Speech recognition not supported');
      return;
    }
    // eslint-disable-next-line no-undef
    const recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsRecording(true);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setTranscription(transcript);
      setEntry(prev => prev + ' ' + transcript);
    };
    recognition.onend = () => setIsRecording(false);

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const saveEntry = async () => {
    const userId = localStorage.getItem('userId');
    const user = localStorage.getItem('user');
    
    if (!userId || !user) {
      setError('Please log in first');
      return;
    }

    if (!entry.trim()) {
      setError('Please write something before saving');
      return;
    }

    setSaving(true);
    setError('');

    try {
      // Convert files to data URLs for storage
      const fileObjs = await Promise.all(
        files.map(
          (f) =>
            new Promise((resolve) => {
              const reader = new FileReader();
              reader.onload = () =>
                resolve({
                  name: f.name,
                  type: f.type,
                  size: f.size,
                  dataUrl: reader.result,
                });
              reader.readAsDataURL(f);
            })
        )
      );

      // Separate images from other files
      const images = fileObjs.filter(f => f.type.startsWith('image/'));
      const otherFiles = fileObjs.filter(f => !f.type.startsWith('image/'));

      const entryData = {
        userId,
        content: entry,
        images,
        files: otherFiles,
        tags: generateTags(entry),
        mood: analyzeSentiment(entry),
        sentiment: analyzeSentiment(entry)
      };

      // Send to backend API
      const response = await fetch(`${API_URL}/api/entries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(entryData)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save entry');
      }

      // Reset form
      setEntry('');
      setFiles([]);
      setTranscription('');
      setSaving(false);
      setSavedMsg('Entry saved successfully!');
      setTimeout(() => setSavedMsg(''), 2000);
      // Navigate to entries page to view the saved item
      setTimeout(() => navigate('/entries'), 500);
    } catch (err) {
      setError(err.message || 'Error saving entry. Make sure backend is running.');
      console.error('Save entry error:', err);
      setSaving(false);
    }
  };

  const generateTags = (text) => {
    // Mock keyword extraction
    const words = text.toLowerCase().split(/\s+/);
    return words.filter(w => w.length > 3).slice(0, 5);
  };

  const analyzeSentiment = (text) => {
    // Mock sentiment analysis
    const positiveWords = ['happy', 'good', 'great', 'awesome', 'love', 'wonderful', 'amazing'];
    const negativeWords = ['sad', 'bad', 'terrible', 'awful', 'hate', 'horrible', 'disgusting'];
    const words = text.toLowerCase().split(/\s+/);
    const positiveCount = words.filter(w => positiveWords.includes(w)).length;
    const negativeCount = words.filter(w => negativeWords.includes(w)).length;
    if (positiveCount > negativeCount) return 'happy';
    if (negativeCount > positiveCount) return 'sad';
    return 'neutral';
  };

  return (
    <div className="journaling-container page-container">
      <h2>New Entry</h2>
      {error && <div className="error" style={{marginBottom:'15px'}}>{error}</div>}
      <textarea
        value={entry}
        onChange={(e) => setEntry(e.target.value)}
        placeholder="Write your thoughts..."
      />
      <div>
        <input type="file" multiple onChange={handleFileUpload} accept="image/*,video/*,.pdf,.doc,.docx" />
        <div className="grid" style={{marginTop:'10px'}}>
          {files.map((f, i) => (
            <div key={i} className="card" style={{padding:'8px'}}>
              <small>{f.name}</small>
            </div>
          ))}
        </div>
      </div>
      <div>
        <button onClick={isRecording ? stopRecording : startRecording}>
          {isRecording ? 'Stop Recording' : 'Start Voice Recording'}
        </button>
        {transcription && <p>Transcription: {transcription}</p>}
      </div>
      <button onClick={saveEntry} disabled={saving}>{saving ? 'Saving...' : 'Save Entry'}</button>
      {savedMsg && <p className="badge positive" style={{marginTop:'10px'}}>{savedMsg}</p>}
    </div>
  );
};

export default Journaling;
