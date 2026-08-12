"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const STORAGE_KEY = "linebyline:key-sound-muted";

// Short synthesized clicks (Web Audio) instead of an audio file — a correct
// keystroke gets a crisp high tick, a wrong one a lower buzz.
export function useKeySound() {
  const [muted, setMuted] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    setMuted(localStorage.getItem(STORAGE_KEY) === "1");
  }, []);

  const toggleMuted = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      return next;
    });
  }, []);

  const playKey = useCallback(
    (correct: boolean) => {
      if (muted || typeof window === "undefined") return;
      const AudioContextClass = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;

      if (!ctxRef.current) ctxRef.current = new AudioContextClass();
      const ctx = ctxRef.current;
      if (ctx.state === "suspended") void ctx.resume();

      const duration = correct ? 0.03 : 0.09;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.value = correct ? 1500 : 220;
      gain.gain.setValueAtTime(correct ? 0.05 : 0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    },
    [muted]
  );

  return { muted, toggleMuted, playKey };
}
