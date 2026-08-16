import { appConfig } from "@/lib/config";
import { createApiClient } from "@/lib/api/client";
import type {
  HealthResponse,
  TranscribeResponse,
  VoicePingResponse,
} from "@/lib/types/voice";

export const api = createApiClient(appConfig.backendUrl);

export const voiceApi = {
  health: () => api.get<HealthResponse>("/health"),
  ping: () => api.get<VoicePingResponse>("/api/voice/ping"),
  transcribe: (formData: FormData) =>
    api.post<TranscribeResponse>("/api/voice/transcribe", formData),
};
