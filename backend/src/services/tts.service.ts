export async function synthesizeSpeech(text: string): Promise<Buffer> {
  const ttsUrl = process.env.TTS_URL ?? "http://127.0.0.1:5002";
  const res = await fetch(`${ttsUrl}/synthesize`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) {
    throw new Error(`TTS failed: ${res.status}`);
  }
  return Buffer.from(await res.arrayBuffer());
}
