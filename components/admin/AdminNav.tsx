"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

const ADMIN_NAV = [
  { href: "/admin/stories", label: "Stories" },
  { href: "/admin/vocabulary", label: "Vocabulary" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/analytics", label: "Analytics" },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <>
      {ADMIN_NAV.map((item) => {
        const active = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-2 px-3 py-2.5 min-h-[44px] text-sm rounded-lg transition-colors",
              active ? "bg-brand-500/15 text-brand-400 font-medium" : "text-cream/50 hover:bg-white/[0.06] hover:text-cream"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </>
  );
}

function Wordmark() {
  return (
    <span dir="ltr" className="flex items-center gap-2 font-serif font-bold text-cream">
      <Image src="/logo-icon.png" alt="" width={24} height={24} className="rounded-md" />
      <span>Re<span className="text-brand-500">trace</span></span>
      <span className="ml-1 text-xs bg-white/10 text-cream/50 px-1.5 py-0.5 rounded font-medium">Admin</span>
    </span>
  );
}

// The admin shell was a permanently visible w-56 sidebar, which consumed 224px of a
// 375px viewport and left the CMS unusable on a phone. Below md it becomes a slide-over
// drawer behind a hamburger in a sticky top bar; at md and up the original sidebar is
// unchanged.
export function AdminNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Route change closes the drawer — otherwise it stays over the page you just opened.
  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    // Lock background scroll while the overlay is up.
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 inset-x-0 z-30 h-14 flex items-center gap-3 px-4 border-b border-white/[0.07] bg-ink-surface/95 backdrop-blur-sm">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open admin menu"
          aria-expanded={open}
          className="inline-flex items-center justify-center w-10 h-10 -ml-2 rounded-lg text-cream/60 hover:text-cream hover:bg-white/[0.06] transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" viewBox="0 0 24 24">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <Wordmark />
      </div>

      {open && (
        <div className="md:hidden fixed inset-0 z-40">
          <button
            type="button"
            aria-label="Close admin menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
          />
          <aside className="absolute inset-y-0 start-0 w-[min(17rem,80vw)] bg-ink-surface border-e border-white/[0.07] flex flex-col animate-slide-in-right">
            <div className="h-14 flex items-center px-5 border-b border-white/[0.07]">
              <Wordmark />
            </div>
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
              <NavLinks onNavigate={() => setOpen(false)} />
            </nav>
            <div className="p-3 border-t border-white/[0.07]">
              <Link
                href="/library"
                className="flex items-center gap-2 px-3 py-2.5 min-h-[44px] text-sm text-cream/40 rounded-lg hover:bg-white/[0.06] hover:text-cream/70 transition-colors"
              >
                ← Back to app
              </Link>
            </div>
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="relative hidden md:flex w-56 shrink-0 bg-ink-surface border-r border-white/[0.07] flex-col">
        <div className="h-14 flex items-center px-5 border-b border-white/[0.07]">
          <Wordmark />
        </div>
        <nav className="flex-1 p-3 space-y-1">
          <NavLinks />
        </nav>
        <div className="p-3 border-t border-white/[0.07]">
          <Link
            href="/library"
            className="flex items-center gap-2 px-3 py-2 text-sm text-cream/40 rounded-lg hover:bg-white/[0.06] hover:text-cream/70 transition-colors"
          >
            ← Back to app
          </Link>
        </div>
      </aside>
    </>
  );
}
