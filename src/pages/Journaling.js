import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Journaling.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002';

const Journaling = () => {
  const [entry, setEntry] = useState('');
  const [title, setTitle] = useState('');
  const [detectedMood, setDetectedMood] = useState('neutral');
  const [files, setFiles] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');
  const [error, setError] = useState('');
  const recognitionRef = useRef(null);
  const navigate = useNavigate();

  // Auto-detect mood based on keywords
  useEffect(() => {
    const detectMood = (text) => {
      const lowerText = text.toLowerCase();
      
      // Mood keyword mapping to valid enum values
      const happyWords = ['happy', 'excited', 'enjoyed', 'great', 'amazing', 'wonderful', 'fantastic', 'awesome', 'love', 'best', 'beautiful', 'grateful', 'blessed', 'proud', 'confident', 'thrilled', 'delighted', 'joyful', 'lucky', 'excellent', 'perfect', 'brilliant', 'incredible'];
      
      const sadWords = ['sad', 'depressed', 'miserable', 'lonely', 'devastated', 'hurt', 'disappointed'];
      
      const anxiousWords = ['anxious', 'worried', 'stressed', 'scared', 'nervous', 'afraid', 'concerned'];
      
      const calmWords = ['calm', 'peaceful', 'relaxed', 'serene', 'tranquil', 'quiet', 'still'];
      
      // Use word boundaries for more accurate matching
      const happyCount = happyWords.filter(word => new RegExp(`\\b${word}\\b`).test(lowerText)).length;
      const sadCount = sadWords.filter(word => new RegExp(`\\b${word}\\b`).test(lowerText)).length;
      const anxiousCount = anxiousWords.filter(word => new RegExp(`\\b${word}\\b`).test(lowerText)).length;
      const calmCount = calmWords.filter(word => new RegExp(`\\b${word}\\b`).test(lowerText)).length;
      
      // Return the mood with highest count
      const moods = { happy: happyCount, sad: sadCount, anxious: anxiousCount, calm: calmCount };
      const detectedMood = Object.keys(moods).reduce((a, b) => moods[a] > moods[b] ? a : b);
      
      if (moods[detectedMood] > 0) {
        return detectedMood;
      }
      return 'neutral';
    };

    const mood = detectMood(entry);
    setDetectedMood(mood);
  }, [entry]);

  const handleFileUpload = (e) => {
    const newFiles = Array.from(e.target.files || []);
    setFiles([...files, ...newFiles]);
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const startRecording = () => {
    if (!('webkitSpeechRecognition' in window)) {
      setError('Speech recognition not supported on your browser');
      return;
    }
    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsRecording(true);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setTranscription(transcript);
      setEntry(prev => prev + ' ' + transcript);
    };
    recognition.onerror = () => setError('Recording failed');
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

      const images = fileObjs.filter(f => f.type.startsWith('image/'));
      const otherFiles = fileObjs.filter(f => !f.type.startsWith('image/'));

      const entryData = {
        userId,
        title: title || 'Untitled Entry',
        content: entry,
        images,
        files: otherFiles,
        tags: generateTags(entry),
        mood: detectedMood,
        sentiment: detectedMood
      };

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

      setEntry('');
      setTitle('');
      setFiles([]);
      setTranscription('');
      setDetectedMood('neutral');
      setSaving(false);
      setSavedMsg('✓ Entry saved successfully!');
      setTimeout(() => setSavedMsg(''), 2000);
      setTimeout(() => navigate('/entries'), 800);
    } catch (err) {
      setError(err.message || 'Error saving entry. Make sure backend is running.');
      console.error('Save entry error:', err);
      setSaving(false);
    }
  };

  const generateTags = (text) => {
    const words = text.toLowerCase().split(/\s+/);
    return words.filter(w => w.length > 3).slice(0, 5);
  };

  return (
    <div className="journaling-wrapper">
      <div className="journaling-container">
        {/* Header Section */}
        <div className="journal-header">
          <div className="header-content">
            <h1>📔 My Journal</h1>
            <p className="header-subtitle">Capture your thoughts, feelings, and moments</p>
            <div className="mood-indicator">
              <span className={`mood-tag mood-${detectedMood}`}>
                {detectedMood === 'happy' ? '😊 Happy' : detectedMood === 'sad' ? '😢 Sad' : detectedMood === 'anxious' ? '😰 Anxious' : detectedMood === 'calm' ? '😌 Calm' : detectedMood === 'excited' ? '🤩 Excited' : '😐 Neutral'}
              </span>
            </div>
          </div>
        </div>

        {/* Messages */}
        {error && <div className="alert alert-error"><span>✕</span> {error}</div>}
        {savedMsg && <div className="alert alert-success"><span>✓</span> {savedMsg}</div>}

        {/* Main Content */}
        <div className="journal-content">
          {/* Input Panel */}
          <div className="input-panel">
            <div className="form-group">
              <label>Entry Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give your entry a title..."
                className="title-input"
              />
            </div>

            <div className="form-group">
              <label>Your Story</label>
              <textarea
                value={entry}
                onChange={(e) => setEntry(e.target.value)}
                placeholder="Write your thoughts, feelings, and experiences..."
                className="journal-textarea"
              />
              <div className="textarea-footer">
                <span className="word-count">{entry.length} characters</span>
                <span className="mood-display">
                  {detectedMood === 'positive' ? '😊' : detectedMood === 'negative' ? '😢' : '😐'}
                </span>
              </div>
            </div>

            {/* Voice Recording */}
            <div className="form-group">
              <label>Voice Recording</label>
              <div className="voice-section">
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`voice-btn ${isRecording ? 'recording' : ''}`}
                >
                  <span className={isRecording ? 'pulse' : ''}>🎤</span>
                  {isRecording ? 'Stop Recording' : 'Start Recording'}
                </button>
                {transcription && (
                  <div className="transcription">
                    <small>Last transcription:</small>
                    <p>{transcription}</p>
                  </div>
                )}
              </div>
            </div>

            {/* File Upload */}
            <div className="form-group">
              <label>Attachments</label>
              <div className="file-upload-area">
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  accept="image/*,video/*,.pdf,.doc,.docx"
                  className="file-input"
                  id="file-input"
                />
                <label htmlFor="file-input" className="file-label">
                  📎 Attach files (images, videos, documents)
                </label>
              </div>

              {files.length > 0 && (
                <div className="files-list">
                  <small className="files-title">Attached Files ({files.length})</small>
                  {files.map((f, i) => (
                    <div key={i} className="file-item">
                      <span className="file-icon">
                        {f.type.startsWith('image/') ? '🖼️' : f.type.includes('pdf') ? '📄' : '📎'}
                      </span>
                      <div className="file-info">
                        <span className="file-name">{f.name}</span>
                        <span className="file-size">{(f.size / 1024).toFixed(1)} KB</span>
                      </div>
                      <button
                        className="file-remove"
                        onClick={() => removeFile(i)}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Save Button */}
            <button
              onClick={saveEntry}
              disabled={saving}
              className="save-btn"
            >
              {saving ? '⏳ Saving...' : '💾 Save Entry'}
            </button>
          </div>
        </div>

        {/* Tips Section */}
        <div className="tips-section">
          <h3>✨ Journaling Tips</h3>
          <div className="tips-grid">
            <div className="tip-card">
              <span className="tip-icon">🎯</span>
              <h4>Be Specific</h4>
              <p>Use details and specific examples to make your entries more vivid and memorable.</p>
            </div>
            <div className="tip-card">
              <span className="tip-icon">💭</span>
              <h4>Free Writing</h4>
              <p>Don't worry about grammar or structure. Let your thoughts flow naturally.</p>
            </div>
            <div className="tip-card">
              <span className="tip-icon">🎨</span>
              <h4>Emotions Matter</h4>
              <p>Express your feelings openly. Your journal is a safe space for all emotions.</p>
            </div>
            <div className="tip-card">
              <span className="tip-icon">🔄</span>
              <h4>Regular Practice</h4>
              <p>Consistent journaling helps you understand yourself better over time.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Journaling;
