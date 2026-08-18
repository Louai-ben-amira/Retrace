"use client";

import { useEffect, useState } from "react";
import { getAppCopy } from "@/lib/i18n/app";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}

async function subscribeToPush() {
  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!vapidPublicKey || !("serviceWorker" in navigator)) return;
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as BufferSource,
    });
    await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subscription }),
    });
    window.localStorage.setItem("push_subscribed", "1");
  } catch (err) {
    console.error("[NotificationPrompt] subscribe failed", err);
  }
}

export function NotificationPrompt({ uiLanguage }: { uiLanguage?: string | null }) {
  const t = getAppCopy(uiLanguage);
  const [visible, setVisible] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    const current = Notification.permission;
    setPermission(current);

    if (current === "default") {
      const dismissed = window.localStorage.getItem("notification_dismissed");
      if (!dismissed) setVisible(true);
    } else if (current === "granted") {
      if (!window.localStorage.getItem("push_subscribed")) void subscribeToPush();
    }
  }, []);

  function dismiss() {
    window.localStorage.setItem("notification_dismissed", "1");
    setVisible(false);
  }

  async function enable() {
    const result = await Notification.requestPermission();
    setPermission(result);
    setVisible(false);
    if (result === "granted") void subscribeToPush();
  }

  if (permission !== "default" || !visible) return null;

  return (
    // Sits above the MobileTabBar on phones (56px bar + safe-area), back to the bottom
    // edge from sm: up where the tab bar is hidden.
    <div className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom))] sm:bottom-4 left-1/2 -translate-x-1/2 z-30 w-[calc(100%-2rem)] max-w-md rounded-xl border border-white/15 bg-ink-surface px-4 py-3.5 shadow-[0_16px_40px_rgba(0,0,0,0.5)] animate-fade-up flex items-center gap-3">
      <span className="text-xl shrink-0" aria-hidden>🔔</span>
      <p className="flex-1 text-sm text-cream/80">{t.notifications.prompt}</p>
      <button
        type="button"
        onClick={() => void enable()}
        className="shrink-0 bg-brand-500 text-ink font-semibold text-sm px-3.5 py-1.5 rounded-full hover:bg-brand-300 transition-colors"
      >
        {t.notifications.enable}
      </button>
      <button
        type="button"
        onClick={dismiss}
        aria-label={t.streak.dismiss}
        className="shrink-0 text-cream/40 hover:text-cream/80 transition-colors w-6 h-6 flex items-center justify-center"
      >
        ✕
      </button>
    </div>
  );
}
