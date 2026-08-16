"use client";

import { useCallback } from "react";
import { voiceApi } from "@/lib/api/voice";
import { useFetch } from "@/hooks/useFetch";

export function useHealth(pollMs = 8000) {
  const fetcher = useCallback(() => voiceApi.health(), []);
  return useFetch(fetcher, { refreshIntervalMs: pollMs });
}

export function useVoicePing() {
  const fetcher = useCallback(() => voiceApi.ping(), []);
  return useFetch(fetcher);
}
