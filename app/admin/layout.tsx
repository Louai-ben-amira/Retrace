import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import Link from "next/link";
import { cn } from "@/lib/cn";

const adminNav = [
  { href: "/admin/stories",    label: "Stories" },
  { href: "/admin/vocabulary", label: "Vocabulary" },
  { href: "/admin/users",      label: "Users" },
  { href: "/admin/analytics",  label: "Analytics" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") redirect("/library");

  return (
    <div className="grain relative min-h-screen bg-gradient-to-b from-ink via-ink to-ink-raised flex overflow-x-clip">
      <div
        aria-hidden
        className="fixed w-[650px] h-[650px] rounded-full pointer-events-none -top-64 right-0 bg-[radial-gradient(circle,rgba(14,207,183,0.09)_0%,transparent_70%)] animate-pulse-glow"
      />
      <div
        aria-hidden
        className="fixed w-[550px] h-[550px] rounded-full pointer-events-none -bottom-64 left-0 bg-[radial-gradient(circle,rgba(14,207,183,0.05)_0%,transparent_70%)] animate-pulse-glow [animation-direction:reverse]"
      />

      {/* Sidebar */}
      <aside className="relative w-56 bg-ink-surface border-r border-white/[0.07] flex flex-col">
        <div className="h-14 flex items-center px-5 border-b border-white/[0.07]">
          <span className="font-serif font-bold text-cream">Re<span className="text-brand-500">trace</span></span>
          <span className="ml-2 text-xs bg-white/10 text-cream/50 px-1.5 py-0.5 rounded font-medium">Admin</span>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {adminNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2 px-3 py-2 text-sm text-cream/50 rounded-lg hover:bg-white/[0.06] hover:text-cream transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-white/[0.07]">
          <Link href="/library" className="flex items-center gap-2 px-3 py-2 text-sm text-cream/40 rounded-lg hover:bg-white/[0.06] hover:text-cream/70 transition-colors">
            ← Back to app
          </Link>
        </div>
      </aside>

      {/* Content */}
      <div className="relative flex-1 flex flex-col overflow-hidden">
        <main className="relative flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
