# AEGIS

### Professional Voice Operations Console

> Speak. Understand. Reason. Respond.  
> A modular voice agent built the long way — so every layer is intentional.

**AEGIS** is a full-stack voice assistant that turns spoken language into intelligent speech again. It is not a black-box demo wrapped around a single realtime API. It is a deliberate pipeline: microphone capture, local speech recognition, cloud reasoning, local synthesis, and browser playback — each owned by a service you can inspect, swap, or harden.

Built as a learning-grade system with production instincts.

---

## Why this exists

Most voice agents hide the hard parts. AEGIS does the opposite.

It starts from the smallest honest unit of a voice system:

```text
🎤 Audio → ASR → LLM → TTS → 🔊 Speaker
```

No WebRTC on day one. No Realtime shortcuts. No magic.

When streaming, VAD, barge-in, tools, and observability arrive later, they arrive as upgrades to a pipeline you already understand — not as decorations on someone else’s abstraction.

That is the engineering thesis:

**Control first. Convenience later. Creativity always.**

---

## What AEGIS does today (V1)

1. You press **Start** and speak into the browser microphone.  
2. You press **Stop**. The clip becomes an audio blob.  
3. The Express backend receives that blob.  
4. **faster-whisper** (local) transcribes speech → text.  
5. **OpenAI** turns that text into a professional reply.  
6. **Piper** (local) synthesizes the reply into WAV audio.  
7. The console shows your transcript, the assistant text, and plays the voice through your speakers.

One turn. End to end. Real services. Real latency. Real understanding.

---

## System architecture

```text
┌──────────────────────────────┐
│  Browser — AEGIS Console     │
│  Next.js · TypeScript        │
│  Mic · Transcript · Speaker  │
└──────────────┬───────────────┘
               │  HTTP multipart + JSON
               ▼
┌──────────────────────────────┐
│  Voice Backend               │
│  Node.js · Express · TS      │
│  Orchestrator: handleTurn()  │
└──────┬──────────┬────────┬───┘
       │          │        │
       ▼          ▼        ▼
   ASR :5001   LLM API  TTS :5002
 faster-whisper OpenAI    Piper
 Speech→Text  Text→Text  Text→Speech
```

### Design principle: swappable intelligence

Each AI capability lives behind its own service boundary:

| Layer | Responsibility | Runtime |
|---|---|---|
| **ASR** | Speech → text | `asr-service` · faster-whisper |
| **LLM** | Text → reasoned reply | OpenAI Responses API |
| **TTS** | Reply → speech audio | `tts-service` · Piper |
| **Agent** | Compose the turn | Express `agent.service` |
| **Console** | Capture, display, play | Next.js AEGIS UI |

Change a model. Change a provider. Keep the contract.

---

## Meet the stack

| Surface | Technology |
|---|---|
| Frontend | Next.js, React, TypeScript, Tailwind |
| Backend | Node.js, Express, TypeScript, Multer |
| ASR | Python, FastAPI, faster-whisper |
| TTS | Python, FastAPI, Piper (`en_US-lessac-medium`) |
| LLM | OpenAI (`gpt-4.1-mini` by default) |

**Local where it teaches control. Cloud where reasoning shines.**

---

## Repository map

```text
Voice_Agents/
├── frontend/                 # AEGIS console (Next.js)
│   ├── app/                  # routes, fonts, design tokens
│   ├── components/           # VoiceButton, Transcript, AudioPlayer, …
│   ├── hooks/                # useAudioRecorder, useFetch, useVoiceApi
│   └── lib/                  # typed API client, config, audio helpers
│
├── backend/                  # Voice orchestrator (Express)
│   └── src/
│       ├── routes/           # /api/voice/*
│       ├── services/         # asr · llm · tts
│       ├── agent/            # handleTurn pipeline
│       └── lib/              # OpenAI client
│
├── asr-service/              # Local Whisper HTTP service (:5001)
├── tts-service/              # Local Piper HTTP service (:5002)
└── .gitignore
```

---

## The turn contract

`POST /api/voice/transcribe`  
`multipart/form-data` field: `audio`

**Response**

```json
{
  "text": "User speech as transcript",
  "replyText": "AEGIS reply from the LLM",
  "audioBase64": "<wav bytes encoded as base64>"
}
```

Inside the backend, that response is born from one clear composition:

```text
transcribeAudio(audio)
  → generateReply(transcript)
  → synthesizeSpeech(replyText)
  → { transcript, replyText, audio }
```

Simple enough to explain on a whiteboard. Real enough to ship as V1.

---

## Console experience

The UI is intentionally **Jarvis-adjacent** — steel, cyan HUD energy, operational calm — without collapsing into generic purple-AI aesthetics.

- **AEGIS** as the brand hero of the viewport  
- Status channel: `STANDBY` · `LISTENING` · `THINKING` · `SPEAKING` · `ERROR`  
- Live backend health + voice ping  
- Transcript panel for ASR output  
- Output channel for LLM text + WAV playback  

Creativity lives in presence and hierarchy. Engineering lives in typed clients, reusable hooks, and clean service seams.

---

## Prerequisites

- **Node.js** 20+  
- **Python** 3.10+  
- **ffmpeg** on PATH (recommended for Whisper / webm decode)  
- An **OpenAI API key**  
- Windows / macOS / Linux (developed and verified on Windows)

---

## Setup

### 1) Backend

```bash
cd backend
cp .env.example .env
# set OPENAI_API_KEY (no quotes)
npm install
npm run dev
```

Default: `http://localhost:4000`

### 2) Frontend

```bash
cd frontend
cp .env.local.example .env.local
# NEXT_PUBLIC_BACKEND_URL=http://localhost:4000
npm install
npm run dev
```

Default: `http://localhost:3000`

### 3) ASR service (faster-whisper)

```bash
cd asr-service
python -m venv .venv

# Windows
.\.venv\Scripts\Activate.ps1

pip install faster-whisper fastapi uvicorn python-multipart
uvicorn main:app --host 127.0.0.1 --port 5001
```

First launch downloads the Whisper model. Be patient once.

### 4) TTS service (Piper)

```bash
cd tts-service
python -m venv .venv

# Windows
.\.venv\Scripts\Activate.ps1

pip install piper-tts fastapi uvicorn
python -m piper.download_voices --data-dir .\voices en_US-lessac-medium
uvicorn main:app --host 127.0.0.1 --port 5002
```

Prove Piper alone before wiring anything else:

```bash
echo Hello from AEGIS. | piper --model .\voices\en_US-lessac-medium.onnx --output_file hello.wav
```

---

## Run the full system

Start **four** processes:

| Service | Port | Command |
|---|---|---|
| ASR | `5001` | `uvicorn main:app --host 127.0.0.1 --port 5001` |
| TTS | `5002` | `uvicorn main:app --host 127.0.0.1 --port 5002` |
| Backend | `4000` | `npm run dev` (in `backend/`) |
| Frontend | `3000` | `npm run dev` (in `frontend/`) |

Open **http://localhost:3000**

1. Allow microphone access  
2. **Start** → speak  
3. **Stop** → watch transcript, read reply, hear Piper  

If autoplay is blocked by the browser, press **Play** in the Output channel. Audio unlock on Start makes autoplay succeed in most cases.

---

## Environment

### `backend/.env`

```env
PORT=4000
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4.1-mini
ASR_URL=http://127.0.0.1:5001
TTS_URL=http://127.0.0.1:5002
FRONTEND_ORIGIN=http://localhost:3000
```

### `frontend/.env.local`

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:4000
```

Secrets stay out of git. Examples stay in.

---

## Engineering notes worth keeping

- **Services before frameworks.** ASR and TTS are independent HTTP workers. The backend orchestrates; it does not swallow everything into one process.  
- **Typed boundaries.** Frontend API client + shared response types keep the UI honest about what the backend returns.  
- **Browser audio is part of the system.** Recording, Blob assembly, object URLs, `canplaythrough`, and autoplay policy are first-class concerns — not afterthoughts.  
- **Local speech, cloud thought.** Whisper and Piper keep voice on your machine. OpenAI handles language. That split is intentional.  
- **V1 is complete only when speakers speak.** Transcript alone is not a voice agent.

---

## Roadmap

AEGIS is designed to grow one complexity at a time.

| Version | Focus |
|---|---|
| **V1** ✅ | Mic → ASR → LLM → TTS → Speaker |
| **V2** | Conversation memory + persistence |
| **V3** | Streaming ASR / LLM / TTS |
| **V4** | VAD + automatic turn detection |
| **V5** | Interruption / barge-in |
| **V6** | Tools, databases, guardrails |
| **V7** | Retries, timeouts, rate limits, cost controls |
| **V8** | Observability + latency budgets |
| **V9** | WebSockets |
| **V10** | WebRTC |
| **V11** | Rebuild comparison with OpenAI Realtime API |

The point of the roadmap is discipline:  
**earn each upgrade by feeling the limitation it solves.**

---

## API surface (current)

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/health` | Backend liveness |
| `GET` | `/api/voice/ping` | Voice router liveness |
| `POST` | `/api/voice/transcribe` | Full turn: ASR → LLM → TTS |
| `GET` | `ASR :5001/health` | Whisper service health |
| `POST` | `ASR :5001/transcribe` | Audio → text |
| `GET` | `TTS :5002/health` | Piper service health |
| `POST` | `TTS :5002/synthesize` | Text → WAV |

---

## Security posture (V1)

- No auth yet — local development only  
- `.env` files are gitignored  
- Do not commit API keys  
- Do not log raw audio or transcripts in production without policy  
- Rotate any key that ever appeared in chat, screenshots, or shared logs

---

## Philosophy

AEGIS is named like a shield because voice systems fail in layers: capture, recognition, reasoning, synthesis, playback. Each layer needs ownership.

Creativity without structure is a demo.  
Structure without taste is a dashboard.

This project aims for both — a console that feels composed, and a pipeline that stays explainable.

---

## License

Currently held private and has no mood for license yet :) 
Just Built by Shahbaz Baig (Ai Engineer + Building scalable apps that can also survive in production not just vibe coded disasters)

---

**AEGIS** — speak with systems you understand.
