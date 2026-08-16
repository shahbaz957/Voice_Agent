"use client";

import type { TranscriptEntry } from "@/lib/types/voice";

type TranscriptProps = {
  entries: TranscriptEntry[];
  emptyHint?: string;
};

export function Transcript({
  entries,
  emptyHint = "Conversation feed will appear here after Phase 2–6.",
}: TranscriptProps) {
  return (
    <section
      className="flex min-h-48 w-full flex-col border border-line bg-bg-panel/70 backdrop-blur-sm"
      aria-label="Transcript"
    >
      <header className="flex items-center justify-between border-b border-line px-4 py-3">
        <p className="font-mono text-[10px] tracking-[0.24em] text-fg-muted uppercase">
          Transcript
        </p>
        <p className="font-mono text-[10px] text-fg-muted">{entries.length} lines</p>
      </header>

      <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-4">
        {entries.length === 0 ? (
          <p className="text-sm text-fg-muted">{emptyHint}</p>
        ) : (
          entries.map((entry) => (
            <article key={entry.id} className="flex flex-col gap-1">
              <p className="font-mono text-[10px] tracking-[0.2em] text-accent uppercase">
                {entry.role}
              </p>
              <p className="text-sm leading-relaxed text-fg">{entry.text}</p>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
