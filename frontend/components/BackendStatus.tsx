"use client";

import { useHealth, useVoicePing } from "@/hooks/useVoiceApi";

function LinkDot({ ok, loading }: { ok: boolean; loading: boolean }) {
  const color = loading ? "var(--warn)" : ok ? "var(--ok)" : "var(--danger)";
  return (
    <span
      className="inline-block size-2 rounded-sm"
      style={{ background: color }}
      aria-hidden
    />
  );
}

export function BackendStatus() {
  const health = useHealth(8000);
  const ping = useVoicePing();

  const healthOk = Boolean(health.data?.ok);
  const pingOk = ping.data?.message === "pong";

  return (
    <div className="flex flex-wrap items-center gap-4 border border-line bg-bg-panel/60 px-3 py-2 font-mono text-[11px] tracking-wide text-fg-muted uppercase backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <LinkDot ok={healthOk} loading={health.isLoading} />
        <span>Health</span>
        <span className="text-fg">
          {health.isLoading ? "…" : healthOk ? "OK" : health.error ?? "DOWN"}
        </span>
      </div>
      <div className="h-3 w-px bg-line" aria-hidden />
      <div className="flex items-center gap-2">
        <LinkDot ok={pingOk} loading={ping.isLoading} />
        <span>Voice</span>
        <span className="text-fg">
          {ping.isLoading ? "…" : pingOk ? ping.data?.message : ping.error ?? "DOWN"}
        </span>
      </div>
      <button
        type="button"
        onClick={() => {
          void health.refetch();
          void ping.refetch();
        }}
        className="ml-auto border border-line px-2 py-1 text-accent transition-colors hover:border-accent"
      >
        Refresh
      </button>
    </div>
  );
}
