# Hugging Face Proxy (MemoTalks)

This project includes an optional local proxy server to forward client requests to Hugging Face Inference API so your HF API key is not exposed to browsers.

Quick start (local development):

1. Copy the example env file and set your key:

```powershell
cd server
copy .env.example .env
# edit .env and set HF_API_KEY
```

2. Install and run the proxy server:

```bash
cd server
npm install
npm start
```

3. Run the React app (from repo root):

```bash
npm install
npm start
```

4. In `MemoTalks`, AI calls will be proxied to `http://localhost:3002/api/hf` by the client.

Security note: Keep your `.env` private and do not commit your `HF_API_KEY` to source control.
