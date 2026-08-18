"use client";

import { createContext, useContext, useMemo } from "react";
import { getAppCopy, type AppCopy } from "@/lib/i18n/app";
import type { LanguageCode } from "@/lib/languages";

interface TranslationContextValue {
  t: AppCopy;
  lang: LanguageCode;
  dir: "ltr" | "rtl";
}

const TranslationContext = createContext<TranslationContextValue | null>(null);

export function TranslationProvider({
  lang,
  dir,
  children,
}: {
  lang: LanguageCode;
  dir: "ltr" | "rtl";
  children: React.ReactNode;
}) {
  const copy = useMemo(() => getAppCopy(lang), [lang]);

  return (
    <TranslationContext.Provider value={{ t: copy, lang, dir }}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation(): TranslationContextValue {
  const ctx = useContext(TranslationContext);
  if (!ctx) throw new Error("useTranslation must be used within a TranslationProvider");
  return ctx;
}
