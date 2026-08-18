import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { UsersFilterBar } from "@/components/admin/UsersFilterBar";
import { UsersTable, type UserRow } from "@/components/admin/UsersTable";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Users — Admin" };

interface AdminUsersPageProps {
  searchParams: { q?: string; plan?: string; streak?: string; sort?: string; dir?: string };
}

function buildOrderBy(sort: string, dir: "asc" | "desc"): Prisma.UserOrderByWithRelationInput {
  switch (sort) {
    case "name": return { name: dir };
    case "plan": return { subscription: { tier: dir } };
    case "streak": return { streak: { current: dir } };
    case "stories": return { progress: { _count: dir } };
    case "joined":
    default: return { createdAt: dir };
  }
}

export default async function AdminUsersPage({ searchParams }: AdminUsersPageProps) {
  const q = (searchParams.q ?? "").trim();
  const plan = searchParams.plan === "PRO" || searchParams.plan === "FREE" ? searchParams.plan : undefined;
  const streakFilter = searchParams.streak === "active" || searchParams.streak === "none" ? searchParams.streak : undefined;
  const dir: "asc" | "desc" = searchParams.dir === "asc" ? "asc" : "desc";
  const sort = searchParams.sort ?? "joined";

  const AND: Prisma.UserWhereInput[] = [];
  if (q) {
    AND.push({
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
      ],
    });
  }
  if (plan === "PRO") AND.push({ subscription: { tier: "PRO" } });
  if (plan === "FREE") AND.push({ OR: [{ subscription: null }, { subscription: { tier: "FREE" } }] });
  if (streakFilter === "active") AND.push({ streak: { current: { gt: 0 } } });
  if (streakFilter === "none") AND.push({ OR: [{ streak: null }, { streak: { current: 0 } }] });

  const where: Prisma.UserWhereInput = AND.length > 0 ? { AND } : {};

  const [users, totalCount] = await Promise.all([
    db.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        subscription: { select: { tier: true } },
        streak: { select: { current: true } },
        _count: { select: { progress: true } },
      },
      orderBy: buildOrderBy(sort, dir),
      take: 100,
    }),
    db.user.count(),
  ]);

  const rows: UserRow[] = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    tier: u.subscription?.tier ?? "FREE",
    streak: u.streak?.current ?? 0,
    storiesCount: u._count.progress,
    joinedAt: u.createdAt.toISOString(),
  }));

  const isFiltered = q.length > 0 || Boolean(plan) || Boolean(streakFilter);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-xl font-bold text-cream">Users</h1>
          <p className="text-sm text-cream/40 mt-0.5">
            {isFiltered ? `${users.length} of ${totalCount} users` : `${totalCount} total users`}
          </p>
        </div>
        <a
          href="/api/admin/users/export"
          className="bg-white/[0.06] border border-white/10 text-cream text-sm font-medium px-4 py-2 rounded-lg hover:bg-white/10 transition-colors"
        >
          Export CSV
        </a>
      </div>

      <UsersFilterBar />
      <UsersTable users={rows} />
    </div>
  );
}
