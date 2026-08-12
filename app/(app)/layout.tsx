import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { AppNav } from "@/components/ui/AppNav";
import { getCurrentUser } from "@/lib/auth";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  const user = await getCurrentUser();
  if (user && !user.onboarded) redirect("/onboarding");
  const isAdmin = user?.role === "ADMIN";

  return (
    <div className="grain relative min-h-screen bg-gradient-to-b from-ink via-ink to-ink-raised text-cream flex flex-col overflow-x-clip">
      <div
        aria-hidden
        className="fixed w-[700px] h-[700px] rounded-full pointer-events-none -top-64 -right-64 bg-[radial-gradient(circle,rgba(14,207,183,0.09)_0%,transparent_70%)] animate-pulse-glow"
      />
      <div
        aria-hidden
        className="fixed w-[600px] h-[600px] rounded-full pointer-events-none -bottom-72 -left-56 bg-[radial-gradient(circle,rgba(14,207,183,0.05)_0%,transparent_70%)] animate-pulse-glow [animation-direction:reverse]"
      />
      <AppNav isAdmin={isAdmin} nativeLanguage={user?.nativeLanguage ?? "ar"} />
      <main className="relative flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8">
        {children}
      </main>
    </div>
  );
}
