import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import CryptoJS from 'crypto-js';

const Journaling = () => {
  const [entry, setEntry] = useState('');
  const [files, setFiles] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');
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
    const user = localStorage.getItem('user');
    if (!user) return;

    setSaving(true);

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

    const newEntry = {
      id: Date.now(),
      text: entry,
      files: fileObjs,
      date: new Date().toISOString(),
      tags: generateTags(entry),
      sentiment: analyzeSentiment(entry)
    };

    // Encrypt and store
    const encrypted = CryptoJS.AES.encrypt(JSON.stringify(newEntry), 'secret-key').toString();
    const entries = JSON.parse(localStorage.getItem(`${user}_entries`) || '[]');
    entries.push(encrypted);
    localStorage.setItem(`${user}_entries`, JSON.stringify(entries));

    // Reset form
    setEntry('');
    setFiles([]);
    setTranscription('');
    setSaving(false);
    setSavedMsg('Entry saved successfully!');
    setTimeout(() => setSavedMsg(''), 2000);
    // Navigate to entries page to view the saved item
    setTimeout(() => navigate('/entries'), 500);
  };

  const generateTags = (text) => {
    // Mock keyword extraction
    const words = text.toLowerCase().split(' ');
    return words.filter(w => w.length > 3).slice(0, 5);
  };

  const analyzeSentiment = (text) => {
    // Mock sentiment analysis
    const positiveWords = ['happy', 'good', 'great', 'awesome'];
    const negativeWords = ['sad', 'bad', 'terrible', 'awful'];
    const words = text.toLowerCase().split(' ');
    const positiveCount = words.filter(w => positiveWords.includes(w)).length;
    const negativeCount = words.filter(w => negativeWords.includes(w)).length;
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  };

  return (
    <div className="journaling-container page-container">
      <h2>New Entry</h2>
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
