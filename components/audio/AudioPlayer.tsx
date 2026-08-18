"use client";

import { cn } from "@/lib/cn";
import { AUDIO_SPEEDS, type AudioSpeed } from "@/hooks/useAudio";
import { useTranslation } from "@/lib/i18n/TranslationProvider";

interface AudioPlayerProps {
  isPlaying: boolean;
  isLoading: boolean;
  speed: AudioSpeed;
  isPro: boolean;
  onReplay: () => void;
  onSpeedChange: (speed: AudioSpeed) => void;
}

export function AudioPlayer({ isPlaying, isLoading, speed, isPro, onReplay, onSpeedChange }: AudioPlayerProps) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={onReplay}
        disabled={isLoading}
        aria-label={t.reader.replayLine}
        className={cn(
          "inline-flex items-center justify-center w-9 h-9 rounded-full border border-white/10 text-cream/70 hover:text-brand-500 hover:border-brand-500/50 transition-colors disabled:opacity-40",
          isPlaying && "text-brand-500 border-brand-500/50"
        )}
      >
        {isLoading ? (
          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
        ) : (
          <ReplayIcon />
        )}
      </button>

      <div className="flex items-center gap-1" title={isPro ? undefined : t.reader.upgradeForSpeed}>
        {AUDIO_SPEEDS.map((s) => (
          <button
            key={s}
            type="button"
            disabled={!isPro}
            onClick={() => onSpeedChange(s)}
            className={cn(
              "text-xs font-medium px-2 py-1 rounded-md transition-colors",
              !isPro
                ? "text-cream/20 cursor-not-allowed"
                : speed === s
                ? "bg-brand-500/15 text-brand-500"
                : "text-cream/40 hover:text-cream/70"
            )}
          >
            {s}×
          </button>
        ))}
      </div>
    </div>
  );
}

function ReplayIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5M20 20v-5h-5M4 9a9 9 0 0114.13-6.36M20 15a9 9 0 01-14.13 6.36" />
    </svg>
  );
}
