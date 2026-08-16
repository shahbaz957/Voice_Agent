"use client";

type VoiceButtonProps = {
  active?: boolean;
  disabled?: boolean;
  label?: string;
  hint?: string;
  onPress?: () => void;
};

export function VoiceButton({
  active = false,
  disabled = false,
  label = "Engage microphone",
  hint,
  onPress,
}: VoiceButtonProps) {
  const caption =
    hint ?? (active ? "Stop recording" : "Start recording");

  return (
    <div className="relative flex flex-col items-center gap-5">
      {active && (
        <span
          className="anim-pulse-ring pointer-events-none absolute top-1/2 left-1/2 size-40 -translate-x-1/2 -translate-y-1/2 rounded-full border border-accent/50"
          aria-hidden
        />
      )}

      <button
        type="button"
        disabled={disabled}
        onClick={onPress}
        aria-pressed={active}
        aria-label={label}
        className="group relative flex size-28 items-center justify-center rounded-full border border-line-strong bg-accent-soft transition-[transform,border-color,background-color] duration-300 hover:scale-[1.03] hover:border-accent disabled:cursor-not-allowed disabled:opacity-40"
      >
        <span className="absolute inset-3 rounded-full border border-line" />
        <span className="absolute inset-6 rounded-full bg-bg-elevated/80" />
        {active ? (
          <StopIcon className="relative z-10 size-8 text-danger transition-colors group-hover:text-fg" />
        ) : (
          <MicIcon className="relative z-10 size-9 text-accent transition-colors group-hover:text-fg" />
        )}
      </button>

      <span className="font-mono text-[11px] tracking-[0.28em] text-fg-muted uppercase">
        {caption}
      </span>
    </div>
  );
}

function MicIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0" />
      <path d="M12 18v3" />
      <path d="M8 21h8" />
    </svg>
  );
}

function StopIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <rect x="7" y="7" width="10" height="10" rx="1" />
    </svg>
  );
}
