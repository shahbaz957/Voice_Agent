/**
 * Voice agent orchestrator.
 * Phase 6 wires: ASR → LLM → TTS
 */
export type AgentTurnResult = {
  transcript: string;
  replyText: string;
  audio: Buffer;
};

export async function handleTurn(_audio: Buffer): Promise<AgentTurnResult> {
  throw new Error("Agent pipeline not implemented — Phase 6");
}
