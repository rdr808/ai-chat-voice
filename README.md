# AI Chat with Voice Input

Fullstack app with:
- `frontend`: React + Vite UI
- `backend`: Node.js + Express API proxy for LLM requests
- optional voice input via Web Speech API

## 1) Setup

### Backend
```bash
cd backend
npm install
cp .env.example .env
```

Fill `.env`:
- `OPENAI_API_KEY`
- `OPENAI_BASE_URL` (default: `https://api.groq.com/openai/v1`)
- `OPENAI_MODEL` (default: `llama-3.1-8b-instant`)

### Frontend
```bash
cd frontend
npm install
cp .env.example .env
```

If backend runs on another URL, set `VITE_API_BASE_URL` in `frontend/.env`.

## 2) Run

Both services with one command (recommended):
```bash
cd ai-chat-voice
npm run dev
```

Or run separately:
```bash
cd backend
npm run dev
```

```bash
cd frontend
npm run dev
```

Open the frontend URL from Vite output.

## 3) What is implemented

- text prompt input
- send prompt to backend
- backend forwards request to Chat Completions API
- response rendered in UI
- loading indicator and readable errors
- microphone button with speech-to-text fallback checks

## 4) Voice input notes

- Web Speech API support differs by browser.
- For best compatibility use Chromium-based browsers.
- Microphone permission must be granted by the browser.

## 5) Quick test checklist

1. Enter text and click send -> assistant response appears.
2. Disconnect internet or set invalid API key -> error message appears, app does not crash.
3. Click microphone, speak phrase -> text appears in input.
4. Submit recognized text -> response appears.
