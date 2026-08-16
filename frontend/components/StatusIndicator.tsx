"use client";

import type { AgentStatus } from "@/lib/types/voice";

const STATUS_COPY: Record<AgentStatus, string> = {
  STANDBY: "Systems idle — awaiting command",
  LISTENING: "Capturing audio input",
  THINKING: "Reasoning over your request",
  SPEAKING: "Delivering voice response",
  ERROR: "Fault detected — check link",
};

const STATUS_COLOR: Record<AgentStatus, string> = {
  STANDBY: "var(--accent)",
  LISTENING: "var(--ok)",
  THINKING: "var(--warn)",
  SPEAKING: "var(--accent)",
  ERROR: "var(--danger)",
};

type StatusIndicatorProps = {
  status: AgentStatus;
};

export function StatusIndicator({ status }: StatusIndicatorProps) {
  const color = STATUS_COLOR[status];

  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <div className="flex items-center gap-3">
        <span
          className="anim-breathe inline-block size-2.5 rounded-sm"
          style={{ background: color, boxShadow: `0 0 12px ${color}` }}
          aria-hidden
        />
        <p
          className="font-[family-name:var(--font-display)] text-sm tracking-[0.35em] uppercase"
          style={{ color }}
        >
          {status}
        </p>
      </div>
      <p className="max-w-sm text-sm text-fg-muted">{STATUS_COPY[status]}</p>
    </div>
  );
}
