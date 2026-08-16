export type AgentStatus =
  | "STANDBY"
  | "LISTENING"
  | "THINKING"
  | "SPEAKING"
  | "ERROR";

export type HealthResponse = {
  ok: boolean;
};

export type VoicePingResponse = {
  message: string;
};

export type TranscribeResponse = {
  text: string;
  replyText: string;
  audioBase64: string;
};

export type ApiErrorBody = {
  error?: string;
  message?: string;
};

export type TranscriptEntry = {
  id: string;
  role: "user" | "assistant" | "system";
  text: string;
  createdAt: string;
};

/** Future Phase 6 turn response — typed early so UI can grow against it */
export type VoiceTurnResponse = {
  transcript: string;
  replyText: string;
  /** Base64 audio or URL — decide in Phase 5/6 */
  audioBase64?: string;
  audioUrl?: string;
};
