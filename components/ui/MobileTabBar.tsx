"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { useTranslation } from "@/lib/i18n/TranslationProvider";

// The header nav is `hidden sm:flex`, so below 640px this bar is the only way to move
// between sections. Five destinations, thumb-reachable, with the same active-state rule
// the header uses (`pathname.startsWith`) so the two never disagree.
const TABS = [
  { href: "/library", key: "library" },
  { href: "/wordbank", key: "wordbank" },
  { href: "/vocabulary", key: "vocabulary" },
  { href: "/progress", key: "progress" },
  { href: "/settings", key: "settings" },
] as const;

function Icon({ name, active }: { name: string; active: boolean }) {
  const stroke = active ? 2.1 : 1.7;
  const common = {
    className: "w-[22px] h-[22px]",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: stroke,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    viewBox: "0 0 24 24",
  };
  switch (name) {
    case "library":
      return (
        <svg {...common}>
          <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H10v16H5.5A1.5 1.5 0 0 1 4 18.5z" />
          <path d="M14 4h4.5A1.5 1.5 0 0 1 20 5.5v13a1.5 1.5 0 0 1-1.5 1.5H14z" />
        </svg>
      );
    case "wordbank":
      return (
        <svg {...common}>
          <path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 0-3 3z" />
          <path d="M5 4v16" />
          <path d="M9.5 9h5" />
        </svg>
      );
    case "vocabulary":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8.5" />
          <path d="M12 3.5c2.2 2.3 3.3 5.2 3.3 8.5S14.2 18.2 12 20.5c-2.2-2.3-3.3-5.2-3.3-8.5S9.8 5.8 12 3.5z" />
          <path d="M3.8 9.5h16.4M3.8 14.5h16.4" />
        </svg>
      );
    case "progress":
      return (
        <svg {...common}>
          <path d="M4 19.5h16" />
          <path d="M7 19.5v-6M12 19.5V7M17 19.5v-9" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="3.2" />
          <path d="M19.4 14.4a1.7 1.7 0 0 0 .34 1.88l.06.06a2 2 0 1 1-2.84 2.84l-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.56V21a2 2 0 1 1-4 0v-.1A1.7 1.7 0 0 0 8.9 19.3a1.7 1.7 0 0 0-1.88.34l-.06.06a2 2 0 1 1-2.84-2.84l.06-.06a1.7 1.7 0 0 0 .34-1.88 1.7 1.7 0 0 0-1.56-1.03H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.56-1.1 1.7 1.7 0 0 0-.34-1.88l-.06-.06a2 2 0 1 1 2.84-2.84l.06.06a1.7 1.7 0 0 0 1.88.34H9a1.7 1.7 0 0 0 1.03-1.56V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1.03 1.56 1.7 1.7 0 0 0 1.88-.34l.06-.06a2 2 0 1 1 2.84 2.84l-.06.06a1.7 1.7 0 0 0-.34 1.88V9a1.7 1.7 0 0 0 1.56 1.03H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1.37z" />
        </svg>
      );
  }
}

export function MobileTabBar() {
  const { t } = useTranslation();
  const pathname = usePathname();

  const labels: Record<string, string> = {
    library: t.nav.library,
    wordbank: t.nav.wordbank,
    vocabulary: t.nav.vocabulary,
    progress: t.nav.progress,
    settings: t.nav.settings,
  };

  return (
    <nav
      aria-label={t.nav.mainNavigation}
      className="sm:hidden fixed bottom-0 inset-x-0 z-40 border-t border-white/[0.09] bg-ink/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="flex items-stretch">
        {TABS.map((tab) => {
          const active = pathname.startsWith(tab.href);
          return (
            <li key={tab.href} className="flex-1">
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  // min-h-14 keeps every tap target above the 44px accessibility floor.
                  "flex flex-col items-center justify-center gap-1 min-h-14 py-2 px-0.5 transition-colors",
                  active ? "text-brand-500" : "text-cream/45 active:text-cream/80"
                )}
              >
                <Icon name={tab.key} active={active} />
                <span className="text-[10px] leading-none font-medium truncate max-w-full">
                  {labels[tab.key]}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
