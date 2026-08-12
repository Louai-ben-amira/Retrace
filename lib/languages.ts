export const SUPPORTED_LANGUAGES = [
  { code: "ar", name: "Arabic",     nameNative: "العربية",   rtl: true,  flag: "🇸🇦" },
  { code: "fr", name: "French",     nameNative: "Français",  rtl: false, flag: "🇫🇷" },
  { code: "tr", name: "Turkish",    nameNative: "Türkçe",    rtl: false, flag: "🇹🇷" },
  { code: "es", name: "Spanish",    nameNative: "Español",   rtl: false, flag: "🇪🇸" },
] as const;

export type LanguageCode = typeof SUPPORTED_LANGUAGES[number]["code"];

export const SUPPORTED_LANGUAGE_CODES = SUPPORTED_LANGUAGES.map((l) => l.code);

export function isSupportedLanguage(code: string): code is LanguageCode {
  return (SUPPORTED_LANGUAGE_CODES as string[]).includes(code);
}

export function getLanguage(code: string) {
  return SUPPORTED_LANGUAGES.find((l) => l.code === code);
}

export function getTranslation(translations: Record<string, string>, locale: string, fallback = ""): string {
  return translations[locale] ?? translations["ar"] ?? fallback;
}

export function isRTL(code: string): boolean {
  return SUPPORTED_LANGUAGES.find((l) => l.code === code)?.rtl ?? false;
}
