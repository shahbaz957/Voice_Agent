"""
Piper TTS HTTP service
Run: uvicorn main:app --host 127.0.0.1 --port 5002
"""

from __future__ import annotations

import io
import wave
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.responses import Response
from piper import PiperVoice
from pydantic import BaseModel, Field

VOICES_DIR = Path(__file__).resolve().parent / "voices"
MODEL_PATH = VOICES_DIR / "en_US-lessac-medium.onnx"

app = FastAPI(title="AEGIS TTS Service", version="1.0.0")

print(f"Loading Piper voice: {MODEL_PATH}", flush=True)
if not MODEL_PATH.exists():
    raise FileNotFoundError(
        f"Voice model not found at {MODEL_PATH}. "
        "Download with: python -m piper.download_voices --data-dir .\\voices en_US-lessac-medium"
    )

voice = PiperVoice.load(MODEL_PATH)
print("Piper voice loaded.", flush=True)


class SynthesizeRequest(BaseModel):
    text: str = Field(..., min_length=1)


@app.get("/health")
def health():
    return {"ok": True, "engine": "piper", "voice": MODEL_PATH.name}


@app.post("/synthesize")
def synthesize(body: SynthesizeRequest):
    text = body.text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="text is required")

    buffer = io.BytesIO()
    try:
        with wave.open(buffer, "wb") as wav_file:
            voice.synthesize_wav(text, wav_file)
    except Exception as err:
        raise HTTPException(status_code=500, detail=f"TTS failed: {err}") from err

    audio_bytes = buffer.getvalue()
    if not audio_bytes:
        raise HTTPException(status_code=500, detail="TTS produced empty audio")

    return Response(
        content=audio_bytes,
        media_type="audio/wav",
        headers={"Content-Disposition": 'inline; filename="speech.wav"'},
    )
