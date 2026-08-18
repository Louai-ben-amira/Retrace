"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

export function ScrollNav({ children }: { children: ReactNode }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={cn(
        "fixed top-0 inset-x-0 z-40 flex items-center justify-between gap-3 px-4 sm:px-12 py-3.5 sm:py-5 transition-all duration-300",
        scrolled
          ? "bg-ink/85 backdrop-blur-md border-b border-white/[0.07]"
          : "bg-gradient-to-b from-ink/95 to-transparent backdrop-blur-[2px] border-b border-transparent"
      )}
    >
      {children}
    </nav>
  );
}
