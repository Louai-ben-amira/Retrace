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
    <div className="absolute bottom-5 left-5 text-xs text-cream/30 font-mono tracking-wide">
      {wpm} WPM · {accuracy}% accuracy
    </div>
  );
}
