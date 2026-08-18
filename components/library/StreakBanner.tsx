"use client";

import Link from "next/link";
import { useState } from "react";
import { getAppCopy } from "@/lib/i18n/app";

interface StreakBannerProps {
  current: number;
  longest: number;
  studiedToday: boolean;
  continueHref: string;
  startHref: string;
  dismissCookieName: string;
  uiLanguage?: string | null;
}

// Seconds remaining until the next UTC midnight — used as the dismissal cookie's
// max-age so "dismissed for the rest of the day" is measured in UTC, matching how
// studiedToday/the cookie name itself are computed server-side.
function secondsUntilNextUTCMidnight(): number {
  const now = new Date();
  const nextMidnightUTC = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1);
  return Math.max(1, Math.round((nextMidnightUTC - now.getTime()) / 1000));
}

export function StreakBanner({ current, longest, studiedToday, continueHref, startHref, dismissCookieName, uiLanguage }: StreakBannerProps) {
  const t = getAppCopy(uiLanguage);
  const [visible, setVisible] = useState(true);
  if (!visible) return null;

  function dismiss() {
    document.cookie = `${dismissCookieName}=1; path=/; max-age=${secondsUntilNextUTCMidnight()}; SameSite=Lax`;
    setVisible(false);
  }

  const showBest = longest > current;

  return (
    <div
      className="relative w-full rounded-xl border p-4 mb-6 animate-fade-up"
      style={{ backgroundColor: "#0d1f1e", borderColor: "#134e4a" }}
    >
      <button
        type="button"
        onClick={dismiss}
        aria-label={t.streak.dismiss}
        className="absolute top-3 right-3 text-cream/40 hover:text-cream/80 transition-colors w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/5"
      >
        ✕
      </button>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 pr-8">
        <div className="flex-1 min-w-0">
          {current > 0 && studiedToday && (
            <p className="text-[15px] font-medium text-brand-300">
              {t.streak.greatWorkToday(current)}
            </p>
          )}
          {current > 0 && !studiedToday && (
            <p className="text-[15px] font-medium text-brand-300">
              {t.streak.keepItAlive(current)}
            </p>
          )}
          {current === 0 && (
            <p className="text-[15px] font-medium text-brand-300">
              {t.streak.startToday}
            </p>
          )}
          {showBest && <p className="text-xs text-cream/40 mt-1">{t.streak.yourBest(longest)}</p>}
        </div>

        {current > 0 && !studiedToday && (
          <Link
            href={continueHref}
            className="shrink-0 bg-brand-500 text-ink font-semibold text-sm px-4 py-2 rounded-full hover:bg-brand-300 transition-colors text-center"
          >
            {t.streak.continueReading}
          </Link>
        )}
        {current === 0 && (
          <Link
            href={startHref}
            className="shrink-0 bg-brand-500 text-ink font-semibold text-sm px-4 py-2 rounded-full hover:bg-brand-300 transition-colors text-center"
          >
            {t.streak.startReading}
          </Link>
        )}
      </div>
    </div>
  );
}
