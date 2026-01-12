require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

const HF_MODEL = process.env.HF_MODEL || 'mistralai/Mistral-7B-Instruct-v0.1';
const HF_KEY = process.env.HF_API_KEY;

if (!HF_KEY) {
  console.warn('Warning: HF_API_KEY not set. Set it in .env before running server.');
}

app.post('/api/hf', async (req, res) => {
  try {
    const { prompt, parameters } = req.body;
    if (!prompt) return res.status(400).json({ error: 'prompt is required' });

    const r = await fetch(`https://api-inference.huggingface.co/models/${HF_MODEL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${HF_KEY}`
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: parameters || { max_new_tokens: 300, temperature: 0.9 }
      })
    });

    const data = await r.json();
    if (!r.ok) return res.status(r.status).json(data);
    return res.json(data);
  } catch (err) {
    console.error('Proxy error:', err);
    return res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`HF proxy listening on port ${PORT}`));
