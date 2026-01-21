 import React, { useState, useRef, useEffect } from 'react';
import './MemoTalks.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const MemoTalks = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'memotalks',
      text: "Hello! I'm MemoTalks, your personal AI companion. I have access to your journal entries and can answer questions about your life, goals, and feelings. What would you like to talk about?"
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [userEntries, setUserEntries] = useState([]);
  const apiKeyLocal = localStorage.getItem('memotalks_api_key') || '';
  const proxyUrlLocal = localStorage.getItem('memotalks_hf_proxy') || '';
  const hfKeyLocal = localStorage.getItem('memotalks_hf_key') || '';
  const [proxyUrl, setProxyUrl] = useState(proxyUrlLocal);
  const [hfKey, setHfKey] = useState(hfKeyLocal);
  const [showSettings, setShowSettings] = useState(false);
  const messagesEndRef = useRef(null);

  // Load all user journal entries on component mount
  useEffect(() => {
    loadUserEntries();
  }, []);

  const loadUserEntries = () => {
    try {
      const entriesData = localStorage.getItem('entries');
      if (entriesData) {
        const entries = JSON.parse(entriesData);
        setUserEntries(entries);
        console.log('Loaded entries:', entries);
      }
    } catch (error) {
      console.error('Error loading entries:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Generate truly dynamic response using AI API
  const generateAIResponse = async (userQuestion) => {
    try {
      // Format user's journal entries as context
      const entriesContext = userEntries.length > 0 
        ? `User's Journal Entries:\n${userEntries.map((entry, idx) => 
            `Entry ${idx + 1} (${new Date(entry.date).toLocaleDateString()}): ${entry.text}`
          ).join('\n\n')}`
        : 'No journal entries available yet.';

      // Try OpenAI API if key is available (client-stored - optional/risky)
      if (apiKeyLocal) {
        return await generateWithOpenAI(userQuestion, entriesContext);
      }

      // Fallback: Use Hugging Face API (free, no key needed for inference)
      return await generateWithHuggingFace(userQuestion, entriesContext);
    } catch (error) {
      console.error('Error generating response:', error);
      return generateFallbackResponse(userQuestion);
    }
  };

  // Settings handlers: save proxy URL and optional client HF key
  const saveSettings = () => {
    try {
      if (proxyUrl && proxyUrl.length > 0) localStorage.setItem('memotalks_hf_proxy', proxyUrl);
      else localStorage.removeItem('memotalks_hf_proxy');

      if (hfKey && hfKey.length > 0) localStorage.setItem('memotalks_hf_key', hfKey);
      else localStorage.removeItem('memotalks_hf_key');

      alert('MemoTalks settings saved.');
      setShowSettings(false);
    } catch (err) {
      console.error('Error saving settings', err);
      alert('Unable to save settings. Check console for details.');
    }
  };

  const resetSettings = () => {
    setProxyUrl('');
    setHfKey('');
    localStorage.removeItem('memotalks_hf_proxy');
    localStorage.removeItem('memotalks_hf_key');
    alert('MemoTalks settings reset to defaults.');
    setShowSettings(false);
  };

  // Generate response using OpenAI API
  const generateWithOpenAI = async (userQuestion, entriesContext) => {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKeyLocal}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are MemoTalks, a compassionate AI companion who has read the user's journal entries. Your role is to:
1. Answer questions based on the user's journal content and personal context
2. Provide personalized insights about their life, goals, and feelings
3. Be empathetic, supportive, and non-judgmental
4. Keep responses concise (2-3 sentences)
5. Use appropriate emojis
6. Reference their actual experiences when relevant
7. If asked something not in their journal, provide general supportive guidance based on their patterns

${entriesContext}`
          },
          {
            role: 'user',
            content: userQuestion
          }
        ],
        temperature: 0.9,
        max_tokens: 250
      })
    });

    if (!response.ok) {
      throw new Error('OpenAI API Error');
    }

    const data = await response.json();
    return data.choices[0].message.content;
  };

  // Generate response using Hugging Face via local proxy (/api/hf)
  const generateWithHuggingFace = async (userQuestion, entriesContext) => {
    try {
      // Build concise prompt, truncate entries if needed
      const maxEntries = 10;
      const entriesList = userEntries.slice(-maxEntries).map((entry, idx) => `Entry ${userEntries.length - maxEntries + idx + 1}: ${entry.text}`);
      const snippet = entriesList.join('\n\n');

      const prompt = `You are MemoTalks, an empathetic AI companion who has read the user's journal. Use the journal context to answer the user's question concisely (2-3 sentences). Be supportive, non-judgmental, and reference the user's experiences when relevant.\n\nJournal Context:\n${snippet}\n\nUser Question: ${userQuestion}\n\nAnswer:`;

      // Determine endpoint: direct HF (client) if hfKey set, else proxyUrl or default backend
      let endpoint = `${API_URL}/api/hf`;
      const useDirect = hfKey && hfKey.length > 0;
      if (proxyUrl && proxyUrl.length > 0 && !useDirect) {
        endpoint = proxyUrl.replace(/\/+$/, '') + '/api/hf';
      }

      // If using direct client HF key, call HF inference endpoint directly
      if (useDirect) {
        const hfEndpoint = 'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1';
        const respDirect = await fetch(hfEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${hfKey}` },
          body: JSON.stringify({ inputs: prompt, parameters: { max_new_tokens: 300, temperature: 0.9 } })
        });
        if (!respDirect.ok) {
          const t = await respDirect.text();
          throw new Error(`HF direct error: ${respDirect.status} ${t}`);
        }
        const dataDirect = await respDirect.json();
        let responseTextDirect = '';
        if (Array.isArray(dataDirect) && dataDirect[0]?.generated_text) responseTextDirect = dataDirect[0].generated_text;
        else if (dataDirect.generated_text) responseTextDirect = dataDirect.generated_text;
        else responseTextDirect = JSON.stringify(dataDirect);
        responseTextDirect = responseTextDirect.replace(prompt, '').trim();
        return responseTextDirect || "I appreciate your question. Let's explore this together based on what you've shared. 💙";
      }

      // Call local proxy which forwards to Hugging Face (keeps key server-side)
      const resp = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, parameters: { max_new_tokens: 300, temperature: 0.9 } })
      });

      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(`Proxy Error: ${resp.status} ${text}`);
      }

      const data = await resp.json();
      // Extract generated text from common HF shapes
      let responseText = '';
      if (Array.isArray(data) && data[0]?.generated_text) responseText = data[0].generated_text;
      else if (data.generated_text) responseText = data.generated_text;
      else if (data[0] && data[0].generated_text) responseText = data[0].generated_text;
      else responseText = JSON.stringify(data);

      // Cleanup: remove echoed prompt if present
      responseText = responseText.replace(prompt, '').trim();
      if (!responseText) responseText = "I appreciate your question. Let's explore this together based on what you've shared. 💙";
      return responseText;
    } catch (error) {
      console.error('Hugging Face (proxy) Error:', error);
      throw error;
    }
  };

  // Fallback: Smart local response generator based on entries
  const generateFallbackResponse = (userQuestion) => {
    const lowerQuestion = userQuestion.toLowerCase();
    
    // Analyze emotional patterns from entries
    const emotions = {
      happy: userEntries.filter(e => ['happy', 'great', 'amazing', 'excited', 'proud', 'love'].some(w => e.text.toLowerCase().includes(w))).length,
      sad: userEntries.filter(e => ['sad', 'down', 'depressed', 'lonely', 'struggle', 'difficult'].some(w => e.text.toLowerCase().includes(w))).length,
      motivated: userEntries.filter(e => ['goal', 'achieve', 'progress', 'working', 'improve'].some(w => e.text.toLowerCase().includes(w))).length,
      anxious: userEntries.filter(e => ['anxious', 'worried', 'stressed', 'nervous', 'uncertain'].some(w => e.text.toLowerCase().includes(w))).length
    };

    // Build context-aware response
    const responses = [];

    if (lowerQuestion.includes('entry') || lowerQuestion.includes('journal') || lowerQuestion.includes('what')) {
      responses.push(
        `I've reviewed your ${userEntries.length} journal entries. I notice you've been experiencing a mix of emotions. What would you like to explore? 💭`,
        `Looking at your entries, I see themes of ${emotions.motivated > 0 ? 'growth and goals' : 'reflection'}, mixed with moments of vulnerability. How are you feeling right now? 💙`,
        `Your entries show someone who's actively reflecting on their life. What's the most important thing on your mind lately? 🌟`
      );
    }
    
    if (lowerQuestion.includes('pattern') || lowerQuestion.includes('notice') || lowerQuestion.includes('see')) {
      const topEmotion = Object.entries(emotions).reduce((a, b) => a[1] > b[1] ? a : b)[0];
      responses.push(
        `I notice your entries often touch on ${topEmotion} themes. That seems to be a significant part of your journey. Want to talk about it? 💭`,
        `From your entries, I see you're someone who reflects deeply. Your most recurring emotion seems to be ${topEmotion}. How's that affecting you now? 💙`,
        `Your pattern shows thoughtfulness and self-awareness. You're navigating ${emotions.motivated > 0 ? 'meaningful goals' : 'important life questions'}. What's your next step? 🚀`
      );
    }

    if (lowerQuestion.includes('progress') || lowerQuestion.includes('how am i')) {
      responses.push(
        `Based on your entries, you've shown consistent reflection and growth. What progress are you most proud of? 💪`,
        `I see growth in your entries from ${userEntries.length > 0 ? 'your early reflections' : 'the start'}. What area do you want to focus on next? 🎯`,
        `Your journey shows resilience. You're moving forward even when things are tough. How can I support you further? 💙`
      );
    }

    if (lowerQuestion.includes('goal') || lowerQuestion.includes('future') || lowerQuestion.includes('next')) {
      responses.push(
        `From your entries, I understand your aspirations. What's the most exciting goal you want to work toward? 🚀`,
        `Your entries reveal your dreams and values. What's one thing you want to achieve in the near future? 🎯`,
        `I see you're goal-oriented. What's blocking you from moving forward right now? 💪`
      );
    }

    if (lowerQuestion.includes('feel') || lowerQuestion.includes('emotion')) {
      responses.push(
        `Your entries show emotional depth. I notice ${emotions.happy > emotions.sad ? 'more positive' : 'some challenging'} moments. How are you genuinely feeling today? 💙`,
        `Emotions are complex, and your entries reflect that beautifully. What are you feeling most right now? 🌟`,
        `I sense vulnerability and strength in your entries. What emotion is taking up the most space in your heart today? 💭`
      );
    }

    // Default responses if no keyword matches
    if (responses.length === 0) {
      responses.push(
        `Based on everything you've shared in your journal, I'm here to help. What's really on your mind? 💙`,
        `Your entries give me insight into your world. Help me understand this question better - what are you really asking? 🤔`,
        `I've been reading your story through your entries. What would you like to talk about right now? 💭`,
        `Your journal reveals someone thoughtful and genuine. What would you like my perspective on? 🌟`
      );
    }

    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: input
    };

    setMessages(prev => [...prev, userMessage]);
    const userQuestion = input;
    setInput('');
    setLoading(true);

    // Simulate thinking delay
    setTimeout(async () => {
      try {
        const responseText = await generateAIResponse(userQuestion);
        const aiResponse = {
          id: Date.now() + 1,
          sender: 'memotalks',
          text: responseText
        };
        setMessages(prev => [...prev, aiResponse]);
      } catch (error) {
        const errorResponse = {
          id: Date.now() + 1,
          sender: 'memotalks',
          text: "I'm having trouble connecting to my AI service right now, but I've read your journal entries. Based on what you've shared, I'm here to support you. What's on your mind? 💙"
        };
        setMessages(prev => [...prev, errorResponse]);
      }
      setLoading(false);
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickPrompts = [
    { emoji: '📖', text: 'Tell me about my entries', message: 'Based on my journal entries, what patterns do you see in my life?' },
    { emoji: '🎯', text: 'How\'s my progress?', message: 'How am I progressing toward my goals based on my journal?' },
    { emoji: '💭', text: 'What do you notice?', message: 'What key themes or patterns do you notice in my journal entries?' },
    { emoji: '💪', text: 'Motivate me', message: 'Based on my journal, what should I focus on next?' }
  ];

  return (
    <div className="main-content">
      <div className="memotalks-container">
        <div className="memotalks-header">
          <div className="memotalks-title">
            <span className="memotalks-emoji">💭</span>
            <div>
              <h1>MemoTalks</h1>
              <p className="memotalks-subtitle">Your Personal AI Journal Companion</p>
            </div>
          </div>
          <p className="memotalks-intro">I've read all your journal entries and understand your journey. Ask me anything about your life, goals, feelings, or progress. Every response is personalized based on your actual experiences.</p>
          <div className="memotalks-settings-toggle">
            <button className="settings-button" onClick={() => setShowSettings(!showSettings)}>
              ⚙️ Settings
            </button>
          </div>
          {showSettings && (
            <div className="memotalks-settings">
              <div className="settings-row">
                <label>HF Proxy URL (recommended)</label>
                <input
                  type="text"
                  value={proxyUrl}
                  onChange={(e) => setProxyUrl(e.target.value)}
                  placeholder="http://localhost:3002"
                />
              </div>
              <div className="settings-row">
                <label>Direct Hugging Face API Key (optional)</label>
                <input
                  type="password"
                  value={hfKey}
                  onChange={(e) => setHfKey(e.target.value)}
                  placeholder="hf_xxx (only if you understand the risks)"
                />
              </div>
              <p className="settings-warning">Security: Storing an API key in the browser exposes it to others. Use a server-side proxy when possible.</p>
              <div className="settings-actions">
                <button className="save-settings" onClick={saveSettings}>Save</button>
                <button className="reset-settings" onClick={resetSettings}>Reset</button>
              </div>
            </div>
          )}
          {userEntries.length > 0 && (
            <p className="memotalks-info">📚 Analyzing {userEntries.length} journal entry(ies) for you...</p>
          )}
        </div>

        <div className="messages-container">
          {messages.length === 1 && (
            <div className="quick-prompts">
              <p className="prompts-label">Quick Start</p>
              <div className="prompts-grid">
                {quickPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    className="prompt-button"
                    onClick={() => {
                      setInput(prompt.message);
                    }}
                  >
                    <span className="prompt-emoji">{prompt.emoji}</span>
                    <span className="prompt-text">{prompt.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          
          <div className="messages">
            {messages.map((msg) => (
              <div key={msg.id} className={`message ${msg.sender}`}>
                <div className="message-content">
                  {msg.sender === 'memotalks' && <span className="memotalks-icon">💭</span>}
                  <p>{msg.text}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="message memotalks">
                <div className="message-content">
                  <span className="memotalks-icon">💭</span>
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="input-container">
          <div className="input-wrapper">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about your journal, goals, feelings, or progress... (Press Enter to send, Shift+Enter for new line)"
              className="message-input"
              rows="3"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="send-button"
            >
              {loading ? '...' : '✈️'}
            </button>
          </div>
          <p className="input-hint">💡 I've read your journal entries. Ask about your patterns, progress, feelings, or get personalized insights based on your actual life experiences.</p>
        </div>
      </div>
    </div>
  );
};

export default MemoTalks;
