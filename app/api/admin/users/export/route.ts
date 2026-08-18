import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";

function csvField(value: string | number): string {
  const str = String(value);
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const admin = await db.user.findUnique({ where: { clerkId: userId } });
    if (!admin || admin.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const users = await db.user.findMany({
      include: {
        subscription: true,
        streak: true,
        _count: { select: { progress: { where: { completed: true } } } },
      },
      orderBy: { createdAt: "desc" },
    });

    const header = ["Name", "Email", "Plan", "Streak", "Stories done", "Joined"];
    const rows = users.map((u) => [
      csvField(u.name ?? ""),
      csvField(u.email),
      csvField(u.subscription?.tier ?? "FREE"),
      csvField(u.streak?.current ?? 0),
      csvField(u._count.progress),
      csvField(formatDate(u.createdAt)),
    ]);

    const csv = [header, ...rows].map((r) => r.join(",")).join("\r\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="retrace-users-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (err) {
    console.error("[GET /api/admin/users/export]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
