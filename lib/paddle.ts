/**
 * Paddle Checkout does not accept every language this app ships in — passing an
 * unsupported locale makes Paddle.js throw rather than fall back. Extend this set as
 * Paddle adds locales; anything unlisted renders the checkout in English.
 *
 * This module is imported by a client component, so it must stay free of server-only
 * dependencies. There is deliberately no Paddle API client here: checkout runs entirely
 * in the browser via Paddle.js, and the webhook route verifies signatures with the
 * webhook secret alone, so this integration holds no Paddle API key at all.
 */
const PADDLE_CHECKOUT_LOCALES = new Set(["en", "fr", "es", "it", "de", "nl", "pt", "pl", "ru", "da", "sv", "no", "ja", "ko", "zh-Hans"]);

export function toPaddleLocale(uiLanguage: string | null | undefined): string {
  return uiLanguage && PADDLE_CHECKOUT_LOCALES.has(uiLanguage) ? uiLanguage : "en";
}
