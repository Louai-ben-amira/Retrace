import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import { LanguagePreferences } from "@/components/settings/LanguagePreferences";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  const [clerkUser, user] = await Promise.all([currentUser(), getCurrentUser()]);

  const isPro = user?.subscription?.tier === "PRO";

  return (
    <div className="max-w-2xl">
      <h1 className="font-serif text-[28px] font-bold tracking-tight text-cream mb-8 animate-fade-up">Settings</h1>

      {/* Account */}
      <Card className="mb-6 animate-fade-up hover:border-white/[0.15]">
        <h2 className="font-semibold text-cream mb-4">Account</h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-cream/40">Name</span>
            <span className="text-cream">{clerkUser?.fullName ?? "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-cream/40">Email</span>
            <span className="text-cream">{clerkUser?.primaryEmailAddress?.emailAddress}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-cream/40">Member since</span>
            <span className="text-cream">{user ? formatDate(user.createdAt) : "—"}</span>
          </div>
        </div>
      </Card>

      {/* Language preferences */}
      <Card className="mb-6 animate-fade-up hover:border-white/[0.15]" style={{ animationDelay: "40ms" }}>
        <h2 className="font-semibold text-cream mb-4">Language preferences</h2>
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
          <h2 className="font-semibold text-cream">Subscription</h2>
          <Badge variant={isPro ? "brand" : "stone"}>{isPro ? "Pro" : "Free"}</Badge>
        </div>

        {isPro ? (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-cream/40">Status</span>
              <span className="text-cream">{user?.subscription?.status}</span>
            </div>
            {user?.subscription?.currentPeriodEnd && (
              <div className="flex justify-between">
                <span className="text-cream/40">Renews</span>
                <span className="text-cream">{formatDate(user.subscription.currentPeriodEnd)}</span>
              </div>
            )}
            <div className="pt-3 border-t border-white/[0.08]">
              <a href="/api/subscriptions/portal" className="text-sm text-rose-400 hover:text-rose-300 hover:underline transition-colors">
                Manage or cancel subscription
              </a>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-sm text-cream/50 mb-4">
              Upgrade to Pro to unlock all stories, AI-generated content, and audio speed control.
            </p>
            <a
              href="/api/subscriptions/create-checkout"
              className="inline-block bg-brand-500 text-ink text-sm font-semibold px-5 py-2.5 rounded-lg shadow-[0_0_24px_rgba(14,207,183,0.2)] hover:bg-brand-300 hover:-translate-y-px transition-all duration-200"
            >
              Upgrade to Pro
            </a>
          </div>
        )}
      </Card>
    </div>
  );
}
