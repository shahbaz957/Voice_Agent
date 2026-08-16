


export async function transcribeAudio(audio: Buffer): Promise<string> {
  const asrUrl = process.env.ASR_URL ?? "http://127.0.0.1:5001";
  const form = new FormData();
  form.append(
    "audio",
    new Blob([audio.buffer as ArrayBuffer], { type: "audio/webm" }),
    "recording.webm",
  );
  const res = await fetch(`${asrUrl}/transcribe`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) {
    throw new Error(`ASR failed: ${res.status}`);
  }
  const data = (await res.json()) as { text: string };
  return data.text;
}