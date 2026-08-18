"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { useTranslation } from "@/lib/i18n/TranslationProvider";

/**
 * Chromium fires this instead of showing its own install banner once the page is
 * installable. It is not in lib.dom, so the shape we rely on is declared here.
 */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/** True when the page is already running from the home screen rather than a browser tab. */
function isStandalone(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // iOS Safari predates display-mode and exposes its own flag on navigator.
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

/** iOS has no beforeinstallprompt at all — installing there is a manual Share-sheet step. */
function isIos(): boolean {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

export function InstallAppButton() {
  const { t } = useTranslation();
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [showIosSteps, setShowIosSteps] = useState(false);

  useEffect(() => {
    if (isStandalone()) {
      setInstalled(true);
      return;
    }
    setShowIosSteps(isIos());

    const onPrompt = (e: Event) => {
      // Suppressing the default is what lets us surface installation on our own terms,
      // in the user's language, instead of Chrome's mini-infobar.
      e.preventDefault();
      setPromptEvent(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setPromptEvent(null);
    };

    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  async function install() {
    if (!promptEvent) return;
    await promptEvent.prompt();
    const { outcome } = await promptEvent.userChoice;
    // The event is single-use; Chromium fires a fresh one if the user declines and the
    // page stays installable, so drop this one either way.
    setPromptEvent(null);
    if (outcome === "accepted") setInstalled(true);
  }

  // Nothing actionable to show: not installable (desktop Firefox, an unsupported browser)
  // and not iOS. Rendering an empty card would be worse than rendering nothing.
  if (!installed && !promptEvent && !showIosSteps) return null;

  return (
    <Card className="mb-6 animate-fade-up hover:border-white/[0.15]" style={{ animationDelay: "120ms" }}>
      <h2 className="font-semibold text-cream mb-1.5">{t.settings.installTitle}</h2>

      {installed ? (
        <p className="text-sm text-cream/50">{t.settings.installedNote}</p>
      ) : (
        <>
          <p className="text-sm text-cream/50 mb-4">{t.settings.installCopy}</p>
          {promptEvent ? (
            <button
              type="button"
              onClick={() => void install()}
              className="inline-block w-full xs:w-auto text-center bg-brand-500 text-ink text-sm font-semibold px-5 py-3 rounded-lg shadow-[0_0_24px_rgba(14,207,183,0.2)] hover:bg-brand-300 sm:hover:-translate-y-px transition-all duration-200"
            >
              {t.settings.installCta}
            </button>
          ) : (
            <p className="text-sm text-cream/70 bg-white/5 border border-white/10 rounded-lg px-4 py-3">
              {t.settings.installIosSteps}
            </p>
          )}
        </>
      )}
    </Card>
  );
}
