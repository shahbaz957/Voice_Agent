from fastapi import FastAPI, File, UploadFile
from faster_whisper import WhisperModel

app = FastAPI()

# device="cuda" + compute_type="float16" if you have NVIDIA GPU
print("Loading model...")
model = WhisperModel("tiny.en", device="cpu", compute_type="int8")
print("Model loaded")

@app.get("/health")
def health():
    return {"ok": True}

@app.post("/transcribe")
async def transcribe(audio: UploadFile = File(...)):
    # Save upload to a temp path (faster-whisper wants a file path or array)
    data = await audio.read()
    path = "temp_input.webm"
    with open(path, "wb") as f:
        f.write(data)

    segments, info = model.transcribe(path, beam_size=2)
    text = " ".join(segment.text.strip() for segment in segments).strip()

    return {
        "text": text,
        "language": info.language,
        "duration": info.duration,
    }