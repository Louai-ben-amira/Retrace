"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";

interface UserDetail {
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
    role: string;
    uiLanguage: string;
    nativeLanguage: string;
    createdAt: string;
  };
  subscription: {
    tier: "FREE" | "PRO";
    status: string;
    currentPeriodEnd: string | null;
    cancelAtPeriodEnd: boolean;
    paddleCustomerId: string;
    paddleSubscriptionId: string | null;
    createdAt: string;
  } | null;
  streak: { current: number; longest: number; lastActivity: string | null } | null;
  stats: {
    storiesCompleted: number;
    storiesStarted: number;
    wordBankSize: number;
    totalAttempts: number;
    accuracyPct: number | null;
    lastActive: string | null;
  };
}

interface UserDrawerProps {
  userId: string;
  onClose: () => void;
  onPlanChange: (userId: string, tier: "FREE" | "PRO") => void;
}

export function UserDrawer({ userId, onClose, onPlanChange }: UserDrawerProps) {
  const [data, setData] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<"PRO" | "FREE" | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setData(null);
    setConfirming(null);

    fetch(`/api/admin/users/${userId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load user");
        return res.json();
      })
      .then((json) => { if (!cancelled) setData(json); })
      .catch(() => { if (!cancelled) setError("Couldn't load this user."); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [userId]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function applyPlan(tier: "PRO" | "FREE") {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}/plan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      });
      if (!res.ok) throw new Error("Failed to update plan");
      const json = await res.json();
      setData((prev) => (prev ? { ...prev, subscription: json.subscription ?? prev.subscription } : prev));
      onPlanChange(userId, tier);
      setConfirming(null);
    } catch {
      setError("Couldn't update the plan. Try again.");
    } finally {
      setSaving(false);
    }
  }

  const tier = data?.subscription?.tier ?? "FREE";

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative w-full max-w-md h-full bg-ink-surface border-l border-white/[0.08] shadow-[0_0_60px_rgba(0,0,0,0.5)] overflow-y-auto animate-slide-in-right">
        <div className="sticky top-0 bg-ink-surface border-b border-white/[0.07] px-6 py-4 flex items-center justify-between">
          <h2 className="font-serif text-lg font-bold text-cream">User details</h2>
          <button onClick={onClose} className="text-cream/40 hover:text-cream transition-colors text-xl leading-none px-1" aria-label="Close">
            ×
          </button>
        </div>

        {loading && <div className="p-6 text-sm text-cream/40">Loading…</div>}
        {error && !loading && <div className="p-6 text-sm text-rose-400">{error}</div>}

        {data && !loading && (
          <div className="p-6 space-y-6">
            <div className="flex items-center gap-3">
              {data.user.image ? (
                <img src={data.user.image} alt="" className="w-12 h-12 rounded-full object-cover" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-cream/50 font-semibold">
                  {(data.user.name ?? data.user.email)[0]?.toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <div className="font-medium text-cream truncate">{data.user.name ?? "—"}</div>
                <div className="text-sm text-cream/40 truncate">{data.user.email}</div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant={tier === "PRO" ? "brand" : "stone"}>{tier === "PRO" ? "Pro" : "Free"}</Badge>
              {data.user.role === "ADMIN" && <Badge variant="amber">Admin</Badge>}
              <Badge variant="default">Joined {formatDate(data.user.createdAt)}</Badge>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 xs:grid-cols-2 gap-3">
              <Stat label="Stories completed" value={data.stats.storiesCompleted} />
              <Stat label="Stories started" value={data.stats.storiesStarted} />
              <Stat label="Accuracy" value={data.stats.accuracyPct !== null ? `${data.stats.accuracyPct}%` : "—"} hint={`${data.stats.totalAttempts} attempts`} />
              <Stat label="Word bank" value={data.stats.wordBankSize} />
              <Stat label="Streak" value={`🔥 ${data.streak?.current ?? 0}d`} hint={`Best: ${data.streak?.longest ?? 0}d`} />
              <Stat label="Last active" value={data.stats.lastActive ? formatDate(data.stats.lastActive) : "Unknown"} />
            </div>

            {/* Subscription */}
            <div className="border-t border-white/[0.07] pt-5">
              <h3 className="text-xs font-semibold text-cream/40 uppercase tracking-wide mb-3">Subscription</h3>
              {data.subscription ? (
                <div className="text-sm text-cream/60 space-y-1 mb-4">
                  <div>Status: <span className="text-cream/80">{data.subscription.status}</span></div>
                  {data.subscription.currentPeriodEnd && (
                    <div>Renews: <span className="text-cream/80">{formatDate(data.subscription.currentPeriodEnd)}</span></div>
                  )}
                  {data.subscription.cancelAtPeriodEnd && <div className="text-amber-400">Cancels at period end</div>}
                  {!data.subscription.paddleSubscriptionId && data.subscription.tier === "PRO" && (
                    <div className="text-cream/40 text-xs">Admin-granted access — no active Paddle billing.</div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-cream/40 mb-4">No subscription on file.</p>
              )}

              {confirming ? (
                <div className="bg-white/[0.04] border border-white/10 rounded-lg p-4">
                  <p className="text-sm text-cream/70 mb-3">
                    {confirming === "PRO"
                      ? "Grant this user free Pro access? This won't charge a card."
                      : data.subscription?.paddleSubscriptionId
                        ? "Downgrade to Free? This revokes Pro access immediately, but does NOT stop Paddle billing — cancel the subscription in the Paddle dashboard as well, or this user keeps being charged."
                        : "Downgrade to Free? This revokes Pro access immediately."}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => void applyPlan(confirming)}
                      disabled={saving}
                      className="bg-brand-500 text-ink text-sm font-semibold px-4 py-2 rounded-lg hover:bg-brand-300 transition-colors disabled:opacity-50"
                    >
                      {saving ? "Applying…" : "Confirm"}
                    </button>
                    <button
                      onClick={() => setConfirming(null)}
                      disabled={saving}
                      className="text-sm text-cream/50 hover:text-cream/80 px-4 py-2 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : tier === "PRO" ? (
                <button
                  onClick={() => setConfirming("FREE")}
                  className="w-full text-center py-2.5 rounded-lg text-sm font-semibold border border-white/15 text-cream hover:border-white/40 hover:bg-white/5 transition-colors"
                >
                  Downgrade to Free
                </button>
              ) : (
                <button
                  onClick={() => setConfirming("PRO")}
                  className="w-full text-center py-2.5 rounded-lg text-sm font-semibold bg-brand-500 text-ink hover:bg-brand-300 transition-colors"
                >
                  Upgrade to Pro
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="bg-white/[0.03] border border-white/[0.07] rounded-lg px-3.5 py-3">
      <div className="text-lg font-semibold text-cream">{value}</div>
      <div className="text-xs text-cream/40">{label}</div>
      {hint && <div className="text-[11px] text-cream/30 mt-0.5">{hint}</div>}
    </div>
  );
}
