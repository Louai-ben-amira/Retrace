"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import { UserDrawer } from "@/components/admin/UserDrawer";

export interface UserRow {
  id: string;
  name: string | null;
  email: string;
  tier: "FREE" | "PRO";
  streak: number;
  storiesCount: number;
  joinedAt: string;
}

const COLUMNS: { key: string; label: string }[] = [
  { key: "name", label: "User" },
  { key: "plan", label: "Plan" },
  { key: "streak", label: "Streak" },
  { key: "stories", label: "Stories" },
  { key: "joined", label: "Joined" },
];

export function UsersTable({ users }: { users: UserRow[] }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [rows, setRows] = useState(users);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => setRows(users), [users]);

  const sort = searchParams.get("sort") ?? "joined";
  const dir = searchParams.get("dir") === "asc" ? "asc" : "desc";

  function sortHref(column: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", column);
    params.set("dir", sort === column && dir === "desc" ? "asc" : "desc");
    return `${pathname}?${params.toString()}`;
  }

  function handlePlanChange(userId: string, tier: "FREE" | "PRO") {
    setRows((prev) => prev.map((r) => (r.id === userId ? { ...r, tier } : r)));
  }

  return (
    <>
      <div className="bg-ink-surface rounded-xl border border-white/[0.08] overflow-hidden">
        {/* The table scrolls inside its own card rather than widening the page — the
            outer `overflow-hidden` alone just clipped the right-hand columns on mobile. */}
        <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="border-b border-white/[0.07] bg-white/[0.02]">
              {COLUMNS.map((col) => (
                <th key={col.key} className="text-left px-5 py-3 text-xs font-semibold text-cream/40 uppercase tracking-wide">
                  <Link href={sortHref(col.key)} className="hover:text-cream/70 transition-colors inline-flex items-center gap-1">
                    {col.label}
                    {sort === col.key && <span className="text-brand-400">{dir === "asc" ? "↑" : "↓"}</span>}
                  </Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.06]">
            {rows.map((user) => (
              <tr
                key={user.id}
                onClick={() => setSelected(user.id)}
                className="hover:bg-white/[0.03] transition-colors cursor-pointer"
              >
                <td className="px-5 py-4">
                  <div className="font-medium text-cream">{user.name ?? "—"}</div>
                  <div className="text-cream/40 text-xs">{user.email}</div>
                </td>
                <td className="px-5 py-4">
                  <Badge variant={user.tier === "PRO" ? "brand" : "stone"}>{user.tier === "PRO" ? "Pro" : "Free"}</Badge>
                </td>
                <td className="px-5 py-4 text-cream/60">🔥 {user.streak} days</td>
                <td className="px-5 py-4 text-cream/50">{user.storiesCount}</td>
                <td className="px-5 py-4 text-cream/50">{formatDate(user.joinedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        {rows.length === 0 && (
          <div className="text-center py-16 text-cream/40 text-sm">No users match these filters.</div>
        )}
      </div>

      {selected && (
        <UserDrawer userId={selected} onClose={() => setSelected(null)} onPlanChange={handlePlanChange} />
      )}
    </>
  );
}
