import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import { LanguagePreferences } from "@/components/settings/LanguagePreferences";
import { getAppCopy } from "@/lib/i18n/app";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  const [clerkUser, user] = await Promise.all([currentUser(), getCurrentUser()]);

  const isPro = user?.subscription?.tier === "PRO";
  const t = getAppCopy(user?.uiLanguage);

  return (
    <div className="max-w-2xl">
      <h1 className="font-serif text-2xl sm:text-[28px] font-bold tracking-tight text-cream mb-8 animate-fade-up">{t.settings.title}</h1>

      {/* Account */}
      <Card className="mb-6 animate-fade-up hover:border-white/[0.15]">
        <h2 className="font-semibold text-cream mb-4">{t.settings.account}</h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-cream/40 shrink-0">{t.settings.name}</span>
            <span className="text-cream text-end min-w-0 break-words">{clerkUser?.fullName ?? "—"}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-cream/40 shrink-0">{t.settings.email}</span>
            <span className="text-cream text-end min-w-0 break-all">{clerkUser?.primaryEmailAddress?.emailAddress}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-cream/40 shrink-0">{t.settings.memberSince}</span>
            <span className="text-cream text-end shrink-0">{user ? formatDate(user.createdAt) : "—"}</span>
          </div>
        </div>
      </Card>

      {/* Language preferences */}
      <Card className="mb-6 animate-fade-up hover:border-white/[0.15]" style={{ animationDelay: "40ms" }}>
        <h2 className="font-semibold text-cream mb-4">{t.settings.languagePreferences}</h2>
        {user && (
          <LanguagePreferences
            uiLanguage={user.uiLanguage}
            nativeLanguage={user.nativeLanguage}
            targetLanguage={user.targetLanguage}
          />
        )}
      </Card>

      {/* Subscription */}
      <Card className="mb-6 animate-fade-up hover:border-white/[0.15]" style={{ animationDelay: "80ms" }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-cream">{t.settings.subscription}</h2>
          <Badge variant={isPro ? "brand" : "stone"}>{isPro ? t.common.pro : t.common.free}</Badge>
        </div>

        {isPro ? (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-cream/40 shrink-0">{t.settings.status}</span>
              <span className="text-cream text-end">{user?.subscription?.status}</span>
            </div>
            {user?.subscription?.currentPeriodEnd && (
              <div className="flex justify-between gap-4">
                <span className="text-cream/40 shrink-0">{t.settings.renews}</span>
                <span className="text-cream text-end">{formatDate(user.subscription.currentPeriodEnd)}</span>
              </div>
            )}
            <div className="pt-3 border-t border-white/[0.08]">
              <a href="/api/subscriptions/portal" className="text-sm text-rose-400 hover:text-rose-300 hover:underline transition-colors">
                {t.settings.manageSubscription}
              </a>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-sm text-cream/50 mb-4">
              {t.settings.upgradeCopy}
            </p>
            <a
              href="/api/subscriptions/create-checkout"
              className="inline-block w-full xs:w-auto text-center bg-brand-500 text-ink text-sm font-semibold px-5 py-3 rounded-lg shadow-[0_0_24px_rgba(14,207,183,0.2)] hover:bg-brand-300 sm:hover:-translate-y-px transition-all duration-200"
            >
              {t.settings.upgradeCta}
            </a>
          </div>
        )}
      </Card>
    </div>
  );
}
