"use client";

interface KeySoundToggleProps {
  muted: boolean;
  onToggle: () => void;
}

export function KeySoundToggle({ muted, onToggle }: KeySoundToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={muted ? "Unmute keyboard sound" : "Mute keyboard sound"}
      aria-pressed={muted}
      title={muted ? "Keyboard sound muted" : "Keyboard sound on"}
      className="text-cream/30 hover:text-cream/70 transition-colors"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5 6 9H3v6h3l5 4V5z" />
        {muted ? (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 9l5 6M21 9l-5 6" />
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8a5 5 0 010 8" />
        )}
      </svg>
    </button>
  );
}
