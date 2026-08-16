import { transcribeAudio } from "../services/asr.service.js";
import { generateReply } from "../services/llm.service.js";
import { synthesizeSpeech } from "../services/tts.service.js";

export type AgentTurnResult = {
  transcript: string;
  replyText: string;
  audio: Buffer;
};

export async function handleTurn(audio: Buffer): Promise<AgentTurnResult> {
  const transcript = await transcribeAudio(audio);
  const replyText = await generateReply(transcript);
  const speech = await synthesizeSpeech(replyText);
  return { transcript, replyText, audio: speech };
}
