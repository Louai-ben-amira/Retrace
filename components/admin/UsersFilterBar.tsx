"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

export function UsersFilterBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [q, setQ] = useState(searchParams.get("q") ?? "");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function onSearchChange(value: string) {
    setQ(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setParam("q", value), 300);
  }

  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current); }, []);

  return (
    <div className="flex flex-wrap items-center gap-3 mb-5">
      <input
        type="text"
        value={q}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search name or email…"
        className="flex-1 min-w-[220px] bg-white/[0.04] border border-white/10 rounded-lg px-3.5 py-2 text-sm text-cream placeholder:text-cream/30 focus:outline-none focus:border-brand-500/50 transition-colors"
      />

      <select
        value={searchParams.get("plan") ?? ""}
        onChange={(e) => setParam("plan", e.target.value)}
        className="bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-sm text-cream/80 focus:outline-none focus:border-brand-500/50 transition-colors"
      >
        <option value="">All plans</option>
        <option value="PRO">Pro</option>
        <option value="FREE">Free</option>
      </select>

      <select
        value={searchParams.get("streak") ?? ""}
        onChange={(e) => setParam("streak", e.target.value)}
        className="bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-sm text-cream/80 focus:outline-none focus:border-brand-500/50 transition-colors"
      >
        <option value="">Any streak</option>
        <option value="active">Active streak</option>
        <option value="none">No streak</option>
      </select>
    </div>
  );
}
