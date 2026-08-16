"use client";

import { useCallback, useRef, useState } from "react";
import { voiceApi } from "@/lib/api/voice";
import type { TranscribeResponse } from "@/lib/types/voice";

function pickMimeType(): string | undefined {
  if (typeof MediaRecorder === "undefined") return undefined;
  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
  ];
  return candidates.find((type) => MediaRecorder.isTypeSupported(type));
}

export function useAudioRecorder() {
  const chunksRef = useRef<Blob[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastTranscript, setLastTranscript] = useState<string | null>(null);
  const [lastReply, setLastReply] = useState<string | null>(null);

  const cleanupStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    mediaRecorderRef.current = null;
  }, []);

  const startRecording = useCallback(async () => {
    setError(null);
    setLastTranscript(null);
    setLastReply(null);

    if (mediaRecorderRef.current?.state === "recording") return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];

      // Unlock browser audio so TTS can autoplay after the async round-trip
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContext();
      }
      const unlock = audioCtxRef.current;
      if (unlock.state === "suspended") {
        await unlock.resume();
      }
      const oscillator = unlock.createOscillator();
      const gain = unlock.createGain();
      gain.gain.value = 0;
      oscillator.connect(gain);
      gain.connect(unlock.destination);
      oscillator.start();
      oscillator.stop(unlock.currentTime + 0.01);

      const mimeType = pickMimeType();
      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event: BlobEvent) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.start();
      setIsRecording(true);
    } catch (err) {
      cleanupStream();
      setIsRecording(false);
      setError(err instanceof Error ? err.message : "Microphone access failed");
    }
  }, [cleanupStream]);

  const stopRecording = useCallback(async (): Promise<TranscribeResponse | null> => {
    const recorder = mediaRecorderRef.current;

    if (!recorder || recorder.state === "inactive") {
      cleanupStream();
      setIsRecording(false);
      return null;
    }

    setError(null);

    const blob = await new Promise<Blob>((resolve, reject) => {
      recorder.onstop = () => {
        const type = recorder.mimeType || "audio/webm";
        resolve(new Blob(chunksRef.current, { type }));
      };
      recorder.onerror = () => reject(new Error("MediaRecorder failed"));

      // Flush any buffered audio before stop
      if (recorder.state === "recording") {
        recorder.requestData();
      }
      recorder.stop();
    });

    cleanupStream();
    chunksRef.current = [];
    setIsRecording(false);

    setIsUploading(true);
    try {
      const formData = new FormData();
      const extension = blob.type.includes("mp4") ? "mp4" : "webm";
      formData.append("audio", blob, `recording.${extension}`);

      const result = await voiceApi.transcribe(formData);
      setLastTranscript(result.text);
      setLastReply(result.replyText);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Transcribe request failed";
      setError(message);
      return null;
    } finally {
      setIsUploading(false);
    }
  }, [cleanupStream]);

  return {
    isRecording,
    isUploading,
    error,
    lastTranscript,
    lastReply,
    startRecording,
    stopRecording,
  };
}
