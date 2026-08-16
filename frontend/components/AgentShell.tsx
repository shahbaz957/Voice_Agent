"use client";

import { useMemo, useState } from "react";
import { appConfig } from "@/lib/config";
import type { AgentStatus, TranscriptEntry } from "@/lib/types/voice";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { AudioPlayer } from "@/components/AudioPlayer";
import { BackendStatus } from "@/components/BackendStatus";
import { StatusIndicator } from "@/components/StatusIndicator";
import { Transcript } from "@/components/Transcript";
import { VoiceButton } from "@/components/VoiceButton";

export function AgentShell() {
  const [entries, setEntries] = useState<TranscriptEntry[]>([]);
  const {
    isRecording,
    isUploading,
    error,
    startRecording,
    stopRecording,
  } = useAudioRecorder();

  const status: AgentStatus = isUploading
    ? "THINKING"
    : isRecording
      ? "LISTENING"
      : error
        ? "ERROR"
        : "STANDBY";

  const hint = useMemo(() => {
    if (isUploading) return "Sending to ASR…";
    if (isRecording) return "Stop recording";
    if (error) return "Retry recording";
    return "Start recording";
  }, [error, isRecording, isUploading]);

  async function handleMicPress() {
    if (isUploading) return;

    if (isRecording) {
      const result = await stopRecording();
      if (result?.text) {
        setEntries((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "user",
            text: result.text,
            createdAt: new Date().toISOString(),
          },
        ]);
      }
      return;
    }

    await startRecording();
  }

  return (
    <div className="aegis-field flex min-h-full flex-1 flex-col">
      <div className="aegis-content mx-auto flex w-full max-w-5xl flex-1 flex-col px-5 py-6 sm:px-8 sm:py-8">
        <header className="anim-fade-up flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[11px] tracking-[0.35em] text-accent uppercase">
              Voice Agent // V1 Console
            </p>
            <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl font-semibold tracking-[0.12em] text-fg sm:text-5xl">
              {appConfig.agentName}
            </h1>
            <p className="mt-2 max-w-md text-sm text-fg-muted sm:text-base">
              {appConfig.agentTagline}
            </p>
          </div>
          <div className="hidden sm:block">
            <BackendStatus />
          </div>
        </header>

        <main className="flex flex-1 flex-col items-center justify-center gap-10 py-10 sm:py-14">
          <div className="anim-fade-up-delay">
            <StatusIndicator status={status} />
          </div>

          <div className="anim-fade-up-delay-2">
            <VoiceButton
              active={isRecording}
              disabled={isUploading}
              label={isRecording ? "Stop recording" : "Start recording"}
              hint={hint}
              onPress={() => {
                void handleMicPress();
              }}
            />
          </div>

          {error ? (
            <p className="max-w-lg text-center text-sm text-danger">{error}</p>
          ) : (
            <p className="max-w-lg text-center text-sm leading-relaxed text-fg-muted">
              Start recording, speak, then stop — audio is sent to{" "}
              <span className="font-mono text-accent">/api/voice/transcribe</span>.
            </p>
          )}
        </main>

        <footer className="anim-fade-up-delay-2 grid gap-4 pb-2 sm:grid-cols-2">
          <div className="sm:hidden">
            <BackendStatus />
          </div>
          <Transcript entries={entries} />
          <AudioPlayer />
        </footer>
      </div>
    </div>
  );
}
