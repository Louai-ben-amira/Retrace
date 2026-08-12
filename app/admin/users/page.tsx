import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Users — Admin" };

export default async function AdminUsersPage() {
  const users = await db.user.findMany({
    include: { subscription: true, streak: true, _count: { select: { progress: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-xl font-bold text-cream">Users</h1>
        <p className="text-sm text-cream/40 mt-0.5">{users.length} total users</p>
      </div>

      <div className="bg-ink-surface rounded-xl border border-white/[0.08] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.07] bg-white/[0.02]">
              <th className="text-left px-5 py-3 text-xs font-semibold text-cream/40 uppercase tracking-wide">User</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-cream/40 uppercase tracking-wide">Plan</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-cream/40 uppercase tracking-wide">Streak</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-cream/40 uppercase tracking-wide">Stories</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-cream/40 uppercase tracking-wide">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.06]">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-white/[0.03] transition-colors">
                <td className="px-5 py-4">
                  <div className="font-medium text-cream">{user.name ?? "—"}</div>
                  <div className="text-cream/40 text-xs">{user.email}</div>
                </td>
                <td className="px-5 py-4">
                  <Badge variant={user.subscription?.tier === "PRO" ? "brand" : "stone"}>
                    {user.subscription?.tier ?? "Free"}
                  </Badge>
                </td>
                <td className="px-5 py-4 text-cream/60">
                  🔥 {user.streak?.current ?? 0} days
                </td>
                <td className="px-5 py-4 text-cream/50">{user._count.progress}</td>
                <td className="px-5 py-4 text-cream/50">{formatDate(user.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
