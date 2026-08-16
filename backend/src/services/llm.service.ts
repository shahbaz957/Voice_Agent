/**
 * LLM — Text → Text
 * V1 runtime: OpenAI
 */
import { getOpenAIClient } from "../lib/openai.client.js";

const SYSTEM_PROMPT = `You are AEGIS, a professional voice operations assistant.
Be clear, concise, and precise. Prefer short spoken-friendly answers.
Do not invent tools or actions you cannot perform.`;

export async function generateReply(text: string): Promise<string> {
  const trimmed = text.trim();
  if (!trimmed) {
    throw new Error("Cannot generate a reply for empty transcript");
  }

  const openai = getOpenAIClient();
  const model = process.env.OPENAI_MODEL?.trim() || "gpt-4.1-mini";

  const response = await openai.responses.create({
    model,
    input: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: trimmed },
    ],
  });

  const reply = response.output_text?.trim();
  if (!reply) {
    throw new Error("OpenAI returned an empty response");
  }

  return reply;
}
