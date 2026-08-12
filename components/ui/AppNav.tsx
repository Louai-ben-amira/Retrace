"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { cn } from "@/lib/cn";
import { SUPPORTED_LANGUAGES, getLanguage } from "@/lib/languages";

const navLinks = [
  { href: "/library",    label: "Library" },
  { href: "/wordbank",   label: "Word bank" },
  { href: "/vocabulary", label: "Vocabulary" },
  { href: "/progress",   label: "Progress" },
  { href: "/settings",   label: "Settings" },
];

interface AppNavProps {
  isAdmin?: boolean;
  nativeLanguage: string;
}

export function AppNav({ isAdmin, nativeLanguage }: AppNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(nativeLanguage);
  const [switching, setSwitching] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => setCurrent(nativeLanguage), [nativeLanguage]);

  useEffect(() => {
    if (!open) return;
    function onClickOutside(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  async function selectLanguage(code: string) {
    if (code === current) { setOpen(false); return; }
    const prev = current;
    setCurrent(code);
    setSwitching(true);
    try {
      const res = await fetch("/api/user/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nativeLanguage: code }),
      });
      if (!res.ok) throw new Error("Failed to switch language");
      setOpen(false);
      router.refresh();
    } catch {
      setCurrent(prev);
    } finally {
      setSwitching(false);
    }
  }

  const activeLang = getLanguage(current);

  return (
    <header className="border-b border-white/[0.07] bg-ink/95 backdrop-blur-sm sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-6">
        <div className="flex items-center gap-8">
          <Link href="/library" className="font-serif font-bold text-lg text-cream tracking-tight">
            Re<span className="text-brand-500">trace</span>
          </Link>
          <nav className="hidden sm:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm px-3.5 py-1.5 rounded-full transition-all duration-200",
                  pathname.startsWith(link.href)
                    ? "bg-brand-500 text-ink font-semibold"
                    : "text-cream/50 hover:text-cream hover:bg-white/[0.06]"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          {isAdmin && (
            <Link
              href="/admin/stories"
              className="hidden sm:flex items-center gap-1.5 text-sm px-3.5 py-1.5 rounded-full border border-white/15 text-cream/60 hover:text-cream hover:border-brand-500/40 transition-all duration-200"
            >
              Admin <span aria-hidden className="text-xs">↗</span>
            </Link>
          )}

          <div className="relative" ref={popoverRef}>
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              disabled={switching}
              aria-label="Switch reading language"
              aria-expanded={open}
              className="w-8 h-8 flex items-center justify-center rounded-full text-base hover:bg-white/[0.08] transition-colors disabled:opacity-50"
            >
              <span aria-hidden>{activeLang?.flag ?? "🌐"}</span>
            </button>

            {open && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl border border-white/[0.1] bg-ink-surface shadow-[0_16px_40px_rgba(0,0,0,0.6)] py-2 animate-scale-in origin-top-right z-20">
                <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wide text-cream/30">
                  Reading language
                </p>
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => void selectLanguage(lang.code)}
                    className={cn(
                      "w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left transition-colors",
                      lang.code === current ? "text-brand-400 bg-brand-500/10" : "text-cream/70 hover:bg-white/[0.06] hover:text-cream"
                    )}
                  >
                    <span aria-hidden className="text-base">{lang.flag}</span>
                    <span className="flex-1">{lang.nameNative}</span>
                    {lang.code === current && <span aria-hidden className="text-brand-400">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </header>
  );
}
