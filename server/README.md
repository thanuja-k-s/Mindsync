# MindSync Hugging Face Proxy

This small Express server proxies requests from the client to the Hugging Face Inference API so the HF API key is not exposed in the browser.

Setup

1. Copy `.env.example` to `.env` and set `HF_API_KEY`.

2. Install dependencies and run:

```bash
cd server
npm install
npm run start
```

3. The server listens on `http://localhost:3002` by default and exposes `POST /api/hf`.

API

POST /api/hf
- body: { prompt: string, parameters?: object }
- returns: JSON from the Hugging Face inference endpoint

Security

- Keep the `.env` file private. Never commit your HF API key to source control.

