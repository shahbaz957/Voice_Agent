"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type AudioPlayerProps = {
  src?: string | null;
  label?: string;
};

export function AudioPlayer({ src = null, label = "Agent audio" }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const empty = !src;

  useEffect(() => {
    setIsPlaying(false);
  }, [src]);

  const status = useMemo(() => {
    if (empty) return "No playback buffer";
    return isPlaying ? "Playing response" : "Ready to play";
  }, [empty, isPlaying]);

  async function toggle() {
    const el = audioRef.current;
    if (!el || empty) return;
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
      className="flex w-full flex-col gap-3 border border-line bg-bg-panel/70 px-4 py-3 backdrop-blur-sm"
      aria-label={label}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] tracking-[0.24em] text-fg-muted uppercase">
            Output channel
          </p>
          <p className="mt-1 text-sm text-fg">{status}</p>
        </div>
        <button
          type="button"
          onClick={toggle}
          disabled={empty}
          className="border border-line px-3 py-1.5 font-mono text-[11px] tracking-wider text-accent uppercase transition-colors hover:border-accent disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isPlaying ? "Pause" : "Play"}
        </button>
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
