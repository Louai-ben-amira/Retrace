import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { AppNav } from "@/components/ui/AppNav";
import { MobileTabBar } from "@/components/ui/MobileTabBar";
import { ServiceWorkerRegistrar } from "@/components/ui/ServiceWorkerRegistrar";
import { getCurrentUser } from "@/lib/auth";
import { isRTL, isSupportedLanguage } from "@/lib/languages";
import { TranslationProvider } from "@/lib/i18n/TranslationProvider";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  const user = await getCurrentUser();
  if (user && !user.onboarded) redirect("/onboarding");
  const isAdmin = user?.role === "ADMIN";

  const rawLang = user?.uiLanguage ?? "";
  const uiLang = isSupportedLanguage(rawLang) ? rawLang : "ar";
  const dir = isRTL(uiLang) ? "rtl" : "ltr";

  return (
    <TranslationProvider lang={uiLang} dir={dir}>
      <div
        dir={dir}
        className="grain relative min-h-screen bg-gradient-to-b from-ink via-ink to-ink-raised text-cream flex flex-col overflow-x-clip"
      >
        <ServiceWorkerRegistrar />
        <div
          aria-hidden
          className="fixed w-[700px] h-[700px] rounded-full pointer-events-none -top-64 -right-64 bg-[radial-gradient(circle,rgba(14,207,183,0.09)_0%,transparent_70%)] animate-pulse-glow"
        />
        <div
          aria-hidden
          className="fixed w-[600px] h-[600px] rounded-full pointer-events-none -bottom-72 -left-56 bg-[radial-gradient(circle,rgba(14,207,183,0.05)_0%,transparent_70%)] animate-pulse-glow [animation-direction:reverse]"
        />
        <AppNav isAdmin={isAdmin} nativeLanguage={user?.nativeLanguage ?? "ar"} />
        {/* Bottom padding clears the fixed MobileTabBar (56px bar + safe-area inset). */}
        <main className="relative flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-[calc(5.5rem+env(safe-area-inset-bottom))] sm:pb-8">
          {children}
        </main>
        <MobileTabBar />
      </div>
    </TranslationProvider>
  );
}
