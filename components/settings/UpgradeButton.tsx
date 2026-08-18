"use client";

import { useState } from "react";
import { initializePaddle, type Paddle } from "@paddle/paddle-js";
import { useTranslation } from "@/lib/i18n/TranslationProvider";
import { toPaddleLocale } from "@/lib/paddle";

// Paddle.js is fetched on first click rather than on mount: most visits to Settings never
// open checkout. The initialized instance is cached across clicks.
let paddlePromise: Promise<Paddle | undefined> | null = null;

// Read once at module scope. These were previously asserted non-null with `!`, which
// type-checks happily against an empty string and then fails deep inside Paddle.js with
// nothing useful in the console — the reason billing was silently dead.
const PADDLE_TOKEN = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
const PADDLE_PRICE_ID = process.env.NEXT_PUBLIC_PADDLE_PRO_PRICE_ID;

function loadPaddle() {
  if (!PADDLE_TOKEN) return Promise.resolve(undefined);
  if (!paddlePromise) {
    paddlePromise = initializePaddle({
      environment: process.env.NEXT_PUBLIC_PADDLE_ENV === "production" ? "production" : "sandbox",
      token: PADDLE_TOKEN,
    }).catch((err) => {
      // Don't cache a rejected promise — a transient network failure shouldn't disable the
      // button for the rest of the session.
      paddlePromise = null;
      throw err;
    });
  }
  return paddlePromise;
}

interface UpgradeButtonProps {
  /** Internal user id, echoed back by the webhook to grant Pro to the right account. */
  userId: string;
  /** Prefills checkout so the customer Paddle creates matches the signed-in account. */
  email: string;
}

export function UpgradeButton({ userId, email }: UpgradeButtonProps) {
  const { t, lang } = useTranslation();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  async function openCheckout() {
    setBusy(true);
    setError(false);
    try {
      if (!PADDLE_TOKEN || !PADDLE_PRICE_ID) {
        throw new Error("Paddle is not configured: missing client token or price id");
      }

      const paddle = await loadPaddle();
      if (!paddle) throw new Error("Paddle.js failed to initialize");

      paddle.Checkout.open({
        items: [{ priceId: PADDLE_PRICE_ID, quantity: 1 }],
        // Passing the email rather than a `ctm_` id is what lets this run without the
        // Paddle API: Paddle matches an existing customer by email, or creates one.
        customer: { email },
        // Paddle copies a transaction's custom data onto the subscription it creates. This
        // is the only link between the payment and the account, so the webhook reads it
        // first and falls back to the stored customer id.
        customData: { userId },
        settings: {
          displayMode: "overlay",
          theme: "dark",
          locale: toPaddleLocale(lang),
          // The email is fixed to the signed-in account; letting the user change it would
          // bill a customer the webhook has no way to map back to them.
          allowLogout: false,
          // Same contract as the old Stripe success_url. Pro is granted by the webhook, not
          // by this redirect — the reload just re-renders Settings once it has landed.
          successUrl: `${window.location.origin}/settings?upgraded=1`,
        },
      });
    } catch (err) {
      console.error("[UpgradeButton]", err);
      setError(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={openCheckout}
        disabled={busy}
        className="inline-block w-full xs:w-auto text-center bg-brand-500 text-ink text-sm font-semibold px-5 py-3 rounded-lg shadow-[0_0_24px_rgba(14,207,183,0.2)] hover:bg-brand-300 sm:hover:-translate-y-px transition-all duration-200 disabled:opacity-60 disabled:hover:translate-y-0"
      >
        {t.settings.upgradeCta}
      </button>
      {error && <p className="mt-3 text-sm text-rose-400">{t.settings.checkoutError}</p>}
    </div>
  );
}
