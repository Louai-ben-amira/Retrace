"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { SUPPORTED_LANGUAGES } from "@/lib/languages";
import { useTranslation } from "@/lib/i18n/TranslationProvider";

interface LanguagePreferencesProps {
  uiLanguage: string;
  nativeLanguage: string;
  targetLanguage: string;
}

type FieldKey = "uiLanguage" | "nativeLanguage" | "targetLanguage";

export function LanguagePreferences({ uiLanguage, nativeLanguage, targetLanguage }: LanguagePreferencesProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const [values, setValues] = useState({ uiLanguage, nativeLanguage, targetLanguage });
  const [savingField, setSavingField] = useState<FieldKey | null>(null);
  const [toast, setToast] = useState<{ message: string; error?: boolean } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    return () => clearTimeout(toastTimer.current);
  }, []);

  function showToast(message: string, error = false) {
    clearTimeout(toastTimer.current);
    setToast({ message, error });
    toastTimer.current = setTimeout(() => setToast(null), 2500);
  }

  async function save(field: FieldKey, value: string) {
    const prev = values[field];
    setValues((v) => ({ ...v, [field]: value }));
    setSavingField(field);
    try {
      const res = await fetch("/api/user/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });
      if (!res.ok) throw new Error("Failed to save");
      showToast(t.settings.savedToast);
      router.refresh();
    } catch {
      setValues((v) => ({ ...v, [field]: prev }));
      showToast(t.settings.errorToast, true);
    } finally {
      setSavingField(null);
    }
  }

  return (
    <div className="relative">
      <div className="space-y-4">
        <LanguageSelect
          label={t.settings.appLanguage}
          hint={t.settings.appLanguageHint}
          value={values.uiLanguage}
          onChange={(v) => void save("uiLanguage", v)}
          loading={savingField === "uiLanguage"}
        />
        <LanguageSelect
          label={t.settings.nativeLanguage}
          hint={t.settings.nativeLanguageHint}
          value={values.nativeLanguage}
          onChange={(v) => void save("nativeLanguage", v)}
          loading={savingField === "nativeLanguage"}
        />
        <div className="flex flex-col gap-2 xs:flex-row xs:items-center xs:justify-between xs:gap-4">
          <div className="min-w-0">
            <label className="text-sm font-medium text-cream/70 block">{t.settings.learning}</label>
            <p className="text-xs text-cream/30 mt-0.5">{t.settings.learningHint}</p>
          </div>
          <select
            value={values.targetLanguage}
            disabled
            className="w-full xs:w-auto xs:min-w-[160px] text-sm border border-white/15 rounded-lg px-3 py-2 bg-white/5 text-cream/50 disabled:cursor-not-allowed"
          >
            <option value="en" className="bg-ink-surface text-cream">🇬🇧 English</option>
          </select>
        </div>
      </div>

      {toast && (
        <div
          className={`absolute -bottom-3 right-0 translate-y-full text-xs font-medium px-3 py-2 rounded-lg shadow-lg animate-fade-in ${
            toast.error ? "bg-rose-500/15 text-rose-300 border border-rose-500/30" : "bg-brand-500/15 text-brand-300 border border-brand-500/30"
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}

interface LanguageSelectProps {
  label: string;
  hint: string;
  value: string;
  onChange: (value: string) => void;
  loading?: boolean;
}

function LanguageSelect({ label, hint, value, onChange, loading }: LanguageSelectProps) {
  return (
    <div className="flex flex-col gap-2 xs:flex-row xs:items-center xs:justify-between xs:gap-4">
      <div className="min-w-0">
        <label className="text-sm font-medium text-cream/70 block">{label}</label>
        <p className="text-xs text-cream/30 mt-0.5">{hint}</p>
      </div>
      <div className="relative w-full xs:w-auto">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={loading}
          className="text-sm border border-white/15 rounded-lg px-3 py-2 bg-white/5 text-cream hover:border-white/25 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-colors disabled:opacity-50 w-full xs:w-auto xs:min-w-[160px]"
        >
          {SUPPORTED_LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code} className="bg-ink-surface text-cream">
              {lang.flag} {lang.nameNative}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
