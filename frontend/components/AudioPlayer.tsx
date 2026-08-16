"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type AudioPlayerProps = {
  src?: string | null;
  /** LLM text reply until TTS is wired */
  replyText?: string | null;
  label?: string;
};

export function AudioPlayer({
  src = null,
  replyText = null,
  label = "Agent audio",
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const emptyAudio = !src;
  const hasReply = Boolean(replyText?.trim());

  useEffect(() => {
    setIsPlaying(false);
  }, [src]);

  const status = useMemo(() => {
    if (hasReply) return "LLM response ready";
    if (emptyAudio) return "No output yet";
    return isPlaying ? "Playing response" : "Ready to play";
  }, [emptyAudio, hasReply, isPlaying]);

  async function toggle() {
    const el = audioRef.current;
    if (!el || emptyAudio) return;
    if (el.paused) {
      await el.play();
      setIsPlaying(true);
    } else {
      el.pause();
      setIsPlaying(false);
    }
  }

  return (
    <section
      className="flex min-h-48 w-full flex-col border border-line bg-bg-panel/70 backdrop-blur-sm"
      aria-label={label}
    >
      <header className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
        <div>
          <p className="font-mono text-[10px] tracking-[0.24em] text-fg-muted uppercase">
            Output channel
          </p>
          <p className="mt-1 text-sm text-fg">{status}</p>
        </div>
        <button
          type="button"
          onClick={toggle}
          disabled={emptyAudio}
          className="border border-line px-3 py-1.5 font-mono text-[11px] tracking-wider text-accent uppercase transition-colors hover:border-accent disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isPlaying ? "Pause" : "Play"}
        </button>
      </header>

      <div className="flex flex-1 flex-col gap-2 overflow-y-auto px-4 py-4">
        {hasReply ? (
          <>
            <p className="font-mono text-[10px] tracking-[0.2em] text-accent uppercase">
              assistant
            </p>
            <p className="text-sm leading-relaxed text-fg whitespace-pre-wrap">
              {replyText}
            </p>
          </>
        ) : (
          <p className="text-sm text-fg-muted">
            LLM replies will appear here after you stop recording.
          </p>
        )}
      </div>

      {src ? (
        <audio
          ref={audioRef}
          src={src}
          onEnded={() => setIsPlaying(false)}
          className="hidden"
        />
      ) : null}
    </section>
  );
}
