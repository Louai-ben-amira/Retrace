"use client";

import { useEffect, useState } from "react";

interface LiveWpmProps {
  correctKeystrokes: number;
  sessionStart: number | null;
  accuracy: number;
}

// Owns its own 500ms tick locally so the live readout updates without forcing
// the Reader/KaraokeText tree to re-render on every tick.
export function LiveWpm({ correctKeystrokes, sessionStart, accuracy }: LiveWpmProps) {
  const [, tick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => tick((n) => n + 1), 500);
    return () => clearInterval(id);
  }, []);

  const minutesElapsed = sessionStart ? (Date.now() - sessionStart) / 60000 : 0;
  const wpm = minutesElapsed > 0 ? Math.round(correctKeystrokes / 5 / minutesElapsed) : 0;

  return (
    // Fixed, not absolute: the reader's root is a scroll container, so an absolutely
    // positioned readout would sit at the bottom of the *content* and scroll out of view.
    <div className="fixed bottom-[max(0.75rem,env(safe-area-inset-bottom))] left-3 sm:bottom-5 sm:left-5 text-[11px] sm:text-xs text-cream/30 font-mono tracking-wide pointer-events-none">
      {wpm} WPM · {accuracy}% accuracy
    </div>
  );
}
