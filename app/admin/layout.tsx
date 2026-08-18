import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AdminNav } from "@/components/admin/AdminNav";

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

      <AdminNav />

      {/* Content — pt-14 on mobile clears AdminNav's fixed top bar. min-w-0 stops a wide
          admin table from stretching this flex child and scrolling the whole page. */}
      <div className="relative flex-1 min-w-0 flex flex-col overflow-hidden">
        <main className="relative flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 pt-[4.5rem] md:pt-8">
          {children}
        </main>
      </div>
    </div>
  );
}
