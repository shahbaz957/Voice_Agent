/**
 * Voice agent orchestrator.
 * Current: ASR → LLM (TTS later)
 */
import { transcribeAudio } from "../services/asr.service.js";
import { generateReply } from "../services/llm.service.js";

export type AgentTurnResult = {
  transcript: string;
  replyText: string;
};

export async function handleTurn(audio: Buffer): Promise<AgentTurnResult> {
  const transcript = await transcribeAudio(audio);
  const replyText = await generateReply(transcript);
  return { transcript, replyText };
}
