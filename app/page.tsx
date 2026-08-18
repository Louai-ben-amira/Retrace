import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { ScrollNav } from "@/components/landing/ScrollNav";
import { ParallaxLayer } from "@/components/landing/ParallaxLayer";
import { Reveal } from "@/components/landing/Reveal";
import { StaggerGroup, StaggerItem } from "@/components/landing/StaggerGroup";
import { AnimatedCounter } from "@/components/landing/AnimatedCounter";
import { LanguageGate } from "@/components/landing/LanguageGate";
import { isSupportedLanguage, isRTL, SUPPORTED_LANGUAGES } from "@/lib/languages";
import { TOPICS } from "@/lib/topics";
import { getLandingCopy, DEMO_SENTENCE_TYPED, DEMO_SENTENCE_REST } from "@/lib/i18n/landing";
import { UI_LANG_COOKIE, NATIVE_LANG_COOKIE } from "@/lib/i18n/cookies";

// Visual data stays language-independent; only the copy in lib/i18n/landing.ts varies.
// Order matches storiesSection.items: The Old Lighthouse, A Letter Never Sent, Market Morning, The Last Train North, Two Cities One Map.
const STORY_VISUALS = [
  { diff: "beginner", pct: 38, image: "/landing/journey-of-knowledge.png" },
  { diff: "inter", pct: 0, image: "/landing/a-phone-call.png" },
  { diff: "beginner", pct: 100, image: "/landing/at-the-market.png" },
  { diff: "advanced", pct: 0, image: "/landing/trip-to-the-mountains.png" },
  { diff: "inter", pct: 15, image: "/landing/my-first-day.png" },
] as const;

const diffStyles: Record<string, string> = {
  beginner: "bg-brand-500/15 text-brand-400",
  inter: "bg-amber-400/15 text-amber-300",
  advanced: "bg-rose-400/15 text-rose-300",
};

// Facts about the product, not usage metrics. The previous values (12k learners,
// 840k lines, 94% retention, "3x faster recall") were invented and presented to
// prospective customers as measured results.
const STATS_VALUES = [
  { value: SUPPORTED_LANGUAGES.length, suffix: "" },
  { value: 3, suffix: "" },
  { value: TOPICS.length, suffix: "" },
  { value: 0, suffix: "" },
] as const;

export default async function LandingPage() {
  const cookieStore = await cookies();
  const uiLangCookie = cookieStore.get(UI_LANG_COOKIE)?.value;
  const nativeLangCookie = cookieStore.get(NATIVE_LANG_COOKIE)?.value;

  if (!uiLangCookie || !isSupportedLanguage(uiLangCookie)) {
    return <LanguageGate />;
  }

  const uiLang = uiLangCookie;
  const nativeLang = nativeLangCookie && isSupportedLanguage(nativeLangCookie) ? nativeLangCookie : uiLang;

  const t = getLandingCopy(uiLang);
  const demoTranslation = getLandingCopy(nativeLang).demo.translation;
  const dir = isRTL(uiLang) ? "rtl" : "ltr";
  const demoDir = isRTL(nativeLang) ? "rtl" : "ltr";
  const demoIsArabicScript = nativeLang === "ar";

  return (
    <main dir={dir} className="grain bg-ink text-cream overflow-x-clip">
      {/* NAV */}
      <ScrollNav>
        <div dir="ltr" className="flex items-center gap-2 font-serif font-bold text-lg sm:text-xl tracking-tight text-cream shrink-0">
          <Image src="/logo-icon.png" alt="" width={32} height={32} className="rounded-lg" priority />
          <span>Re<span className="text-brand-500">trace</span></span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <a href="#how" className="text-sm font-medium text-cream/60 hover:text-cream transition-colors">{t.nav.howItWorks}</a>
          <a href="#stories" className="text-sm font-medium text-cream/60 hover:text-cream transition-colors">{t.nav.stories}</a>
          <a href="#pricing" className="text-sm font-medium text-cream/60 hover:text-cream transition-colors">{t.nav.pricing}</a>
        </div>
        <SignedOut>
          <Link href="/register" className="bg-brand-500 text-ink px-4 sm:px-5 py-2.5 rounded-md text-[13px] sm:text-sm font-semibold whitespace-nowrap hover:bg-brand-300 transition-all sm:hover:-translate-y-px">
            {t.nav.startForFree}
          </Link>
        </SignedOut>
        <SignedIn>
          <Link href="/library" className="bg-brand-500 text-ink px-4 sm:px-5 py-2.5 rounded-md text-[13px] sm:text-sm font-semibold whitespace-nowrap hover:bg-brand-300 transition-all sm:hover:-translate-y-px">
            {t.nav.goToLibrary}
          </Link>
        </SignedIn>
      </ScrollNav>

      {/* HERO */}
      <section className="relative min-h-[100svh] flex flex-col items-center justify-center text-center px-5 sm:px-6 pt-28 sm:pt-32 pb-16 sm:pb-20 overflow-hidden">
        <ParallaxLayer speed={0.25} className="absolute w-[800px] h-[800px] rounded-full pointer-events-none -top-52 -left-52 bg-[radial-gradient(circle,rgba(14,207,183,0.12)_0%,transparent_70%)] animate-pulse-glow" />
        <ParallaxLayer speed={-0.18} className="absolute w-[600px] h-[600px] rounded-full pointer-events-none -bottom-0 -right-24 bg-[radial-gradient(circle,rgba(14,207,183,0.07)_0%,transparent_70%)] animate-pulse-glow [animation-direction:reverse]" />
        <ParallaxLayer speed={0.4} className="absolute top-[18%] right-[6%] font-arabic text-cream/[0.04] text-6xl leading-relaxed pointer-events-none select-none hidden lg:block">
          قصص<br />حقيقية
        </ParallaxLayer>
        <ParallaxLayer speed={0.15} className="absolute bottom-[20%] left-[5%] font-arabic text-cream/[0.04] text-5xl pointer-events-none select-none hidden lg:block">
          اقرأ واسمع
        </ParallaxLayer>

        <span className="animate-fade-up inline-block border border-brand-500/30 rounded-full px-4 py-1.5 text-xs font-medium text-brand-500 tracking-wider uppercase mb-7">
          {t.hero.eyebrow}
        </span>
        <h1
          className="animate-fade-up font-serif font-black text-[clamp(2.6rem,7vw,6rem)] leading-[1.0] tracking-[-0.03em] mb-6"
          style={{ animationDelay: "150ms" }}
        >
          {t.hero.line1}<br />{t.hero.line2Pre}<em className="not-italic italic text-brand-500">{t.hero.line2Emphasis}</em>{t.hero.line2Post}
        </h1>
        <p className="animate-fade-up text-[clamp(1rem,2vw,1.25rem)] text-cream/60 font-light max-w-xl leading-relaxed mb-11" style={{ animationDelay: "300ms" }}>
          {t.hero.subPre}<strong className="text-cream font-medium">{t.hero.subStrong}</strong><br />
          {t.hero.subLine2}
        </p>
        <div className="animate-fade-up flex flex-col xs:flex-row items-stretch xs:items-center gap-3 xs:gap-4 flex-wrap justify-center w-full max-w-sm xs:max-w-none mb-14 sm:mb-20" style={{ animationDelay: "450ms" }}>
          <SignedOut>
            <Link href="/register" className="bg-brand-500 text-ink px-9 py-4 rounded-lg text-base font-semibold text-center shadow-[0_0_32px_rgba(14,207,183,0.25)] hover:bg-brand-300 hover:shadow-[0_0_48px_rgba(14,207,183,0.4)] sm:hover:-translate-y-0.5 transition-all">
              {t.hero.ctaBegin}
            </Link>
          </SignedOut>
          <SignedIn>
            <Link href="/library" className="bg-brand-500 text-ink px-9 py-4 rounded-lg text-base font-semibold text-center shadow-[0_0_32px_rgba(14,207,183,0.25)] hover:bg-brand-300 hover:shadow-[0_0_48px_rgba(14,207,183,0.4)] sm:hover:-translate-y-0.5 transition-all">
              {t.hero.ctaLibrary}
            </Link>
          </SignedIn>
          <a href="#how" className="border border-cream/20 text-cream px-9 py-4 rounded-lg text-base font-medium text-center hover:border-cream/50 hover:bg-cream/5 transition-colors">
            {t.hero.ctaHow}
          </a>
        </div>

        {/* Reader demo mockup */}
        <div
          className="animate-fade-up relative w-full max-w-3xl rounded-2xl overflow-hidden border border-brand-500/15 bg-ink-surface shadow-[0_40px_120px_rgba(0,0,0,0.8),0_0_80px_rgba(14,207,183,0.08)]"
          style={{ animationDelay: "600ms" }}
        >
          <div className="bg-ink-raised px-5 py-3.5 flex items-center gap-2.5 border-b border-white/[0.06]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
            <span className="flex-1 text-center text-[13px] text-cream/40">{t.demo.header}</span>
          </div>
          <div className="relative px-4 sm:px-12 pt-8 sm:pt-12 pb-9 sm:pb-11">
            <div className="text-[11px] uppercase tracking-[0.1em] text-cream/30 font-medium mb-5 sm:mb-8">{t.demo.chapter}</div>
            <p className="font-serif text-[clamp(1.4rem,4vw,2.1rem)] leading-snug tracking-[-0.5px] mb-8">
              {DEMO_SENTENCE_TYPED}{DEMO_SENTENCE_REST}
            </p>
            <p
              className={`text-base sm:text-lg text-cream/40 mb-6 sm:mb-9 ${demoIsArabicScript ? "font-arabic" : ""}`}
              dir={demoDir}
            >
              {demoTranslation}
            </p>
            <div className="flex items-center flex-wrap bg-white/[0.04] border border-white/10 rounded-lg px-4 sm:px-5 py-3.5">
              <span className="text-brand-500 text-sm sm:text-lg font-medium tracking-wide">{DEMO_SENTENCE_TYPED}</span>
              <span className="inline-block w-0.5 h-[22px] bg-brand-500 mx-px animate-blink align-middle" />
              <span className="text-cream/20 text-sm sm:text-lg font-medium tracking-wide">{DEMO_SENTENCE_REST}</span>
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-2 mt-5">
              <div className="text-xs text-cream/40 font-medium"><span className="text-brand-500">42</span> {t.demo.wpm}</div>
              <div className="text-xs text-cream/40 font-medium"><span className="text-brand-500">98%</span> {t.demo.accuracy}</div>
              <div className="text-xs text-cream/40 font-medium">🔥 <span className="text-amber-300">7</span> {t.demo.streak}</div>
            </div>
            <div className="absolute bottom-0 inset-x-0 h-[3px] bg-white/[0.06]">
              <div className="h-full w-[38%] bg-gradient-to-r from-brand-500 to-brand-300" />
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="border-t border-white/[0.07] px-5 sm:px-12 py-16 sm:py-32 max-w-6xl mx-auto">
        <Reveal>
          <div className="text-[11px] uppercase tracking-[0.12em] text-brand-500 font-semibold mb-4">{t.how.eyebrow}</div>
          <h2 className="font-serif text-[clamp(2.2rem,5vw,3.75rem)] font-bold leading-[1.1] tracking-[-1px] mb-5">
            {t.how.line1}<br />{t.how.line2}
          </h2>
          <p className="text-base sm:text-[17px] text-cream/60 font-light leading-relaxed max-w-lg mb-10 sm:mb-16">{t.how.paragraph}</p>
        </Reveal>
        <StaggerGroup className="grid sm:grid-cols-3 gap-5 sm:gap-8">
          {t.how.steps.map((step, i) => (
            <StaggerItem key={step.title} className="p-6 sm:p-10 bg-ink-surface border border-white/[0.07] rounded-xl hover:border-brand-500/25 sm:hover:-translate-y-1 transition-all duration-300">
              <div className="font-serif text-6xl sm:text-7xl font-black text-brand-500/10 leading-none mb-4 sm:mb-6">{String(i + 1).padStart(2, "0")}</div>
              <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
              <p className="text-[15px] text-cream/60 leading-relaxed">{step.body}</p>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </section>

      {/* STORIES */}
      <section id="stories" className="pb-24 sm:pb-32 overflow-hidden">
        <Reveal className="px-5 sm:px-12 max-w-6xl mx-auto mb-10 sm:mb-14">
          <div className="text-[11px] uppercase tracking-[0.12em] text-brand-500 font-semibold mb-4">{t.storiesSection.eyebrow}</div>
          <h2 className="font-serif text-[clamp(2.2rem,5vw,3.75rem)] font-bold leading-[1.1] tracking-[-1px]">{t.storiesSection.heading}</h2>
        </Reveal>
        <StaggerGroup className="flex gap-4 sm:gap-6 px-5 sm:px-12 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {t.storiesSection.items.map((s, i) => (
            <StaggerItem key={s.title} className="flex-none w-[240px] sm:w-[280px] bg-ink-surface border border-white/[0.07] rounded-xl overflow-hidden hover:border-brand-500/30 sm:hover:-translate-y-1 transition-all duration-300">
              <div className="h-40 flex items-end p-5 relative overflow-hidden">
                <Image
                  src={STORY_VISUALS[i].image}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 240px, 280px"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/25 to-black/10" />
                <span className="absolute top-3 right-3 font-arabic text-4xl leading-none text-white/20">{s.overlay}</span>
                <span className={`relative text-[10px] font-bold uppercase tracking-[0.08em] px-2.5 py-1 rounded ${diffStyles[STORY_VISUALS[i].diff]}`}>{s.level}</span>
              </div>
              <div className="px-[22px] py-5">
                <div className="font-serif text-lg font-bold mb-1.5 leading-tight">{s.title}</div>
                <div className="text-[13px] text-cream/40 mb-4">{s.lines} {t.storiesSection.linesUnit} · ~{s.minutes} {t.storiesSection.minUnit}</div>
                <div className="h-[3px] bg-white/[0.06] rounded-full">
                  <div className="h-full rounded-full bg-brand-500" style={{ width: `${STORY_VISUALS[i].pct}%` }} />
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </section>

      {/* STATS */}
      <section className="border-y border-white/[0.07] px-5 sm:px-12 py-14 sm:py-20">
        <StaggerGroup className="max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-8 sm:gap-10 text-center">
          {t.stats.map((label, i) => (
            <StaggerItem key={label}>
              <div className="font-serif text-4xl sm:text-5xl font-black leading-none mb-2.5 bg-gradient-to-br from-brand-500 to-brand-300 bg-clip-text text-transparent">
                <AnimatedCounter value={STATS_VALUES[i].value} suffix={STATS_VALUES[i].suffix} />
              </div>
              <div className="text-sm text-cream/60">{label}</div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </section>

      {/* PRICING */}
      <section id="pricing" className="px-5 sm:px-12 py-16 sm:py-32 max-w-6xl mx-auto">
        <Reveal>
          <div className="text-[11px] uppercase tracking-[0.12em] text-brand-500 font-semibold mb-4">{t.pricing.eyebrow}</div>
          <h2 className="font-serif text-[clamp(2.2rem,5vw,3.75rem)] font-bold leading-[1.1] tracking-[-1px] mb-10 sm:mb-16">
            {t.pricing.line1}<br />{t.pricing.line2}
          </h2>
        </Reveal>
        <StaggerGroup className="grid sm:grid-cols-2 gap-5 sm:gap-6 max-w-3xl">
          <StaggerItem className="p-6 sm:p-11 rounded-2xl border border-white/[0.09] bg-ink-surface">
            <div className="font-serif text-2xl font-bold mb-2">{t.pricing.free.name}</div>
            <div className="text-5xl font-bold leading-none mb-1"><sup className="text-2xl align-top">$</sup>0</div>
            <div className="text-[13px] text-cream/40 mb-7 sm:mb-9">{t.pricing.free.priceSuffix}</div>
            <ul className="flex flex-col gap-3.5 mb-10 text-[15px]">
              {t.pricing.free.features.map((f) => <PlanItem key={f}>{f}</PlanItem>)}
              {t.pricing.free.muted.map((f) => <PlanItem key={f} muted>{f}</PlanItem>)}
            </ul>
            <Link href="/register" className="block text-center py-3.5 rounded-lg text-[15px] font-semibold border border-white/15 text-cream hover:border-white/40 hover:bg-white/5 transition-colors">
              {t.pricing.free.cta}
            </Link>
          </StaggerItem>
          <StaggerItem className="p-6 sm:p-11 rounded-2xl border border-brand-500/35 bg-gradient-to-br from-ink-surface to-[#0D1A1A] shadow-[0_0_60px_rgba(14,207,183,0.08)] relative">
            <span className="inline-block bg-brand-500 text-ink text-[11px] font-bold uppercase tracking-[0.08em] px-3 py-1 rounded mb-6">{t.pricing.pro.badge}</span>
            <div className="font-serif text-2xl font-bold mb-2">{t.pricing.pro.name}</div>
            <div className="text-5xl font-bold leading-none mb-1"><sup className="text-2xl align-top">$</sup>8</div>
            <div className="text-[13px] text-cream/40 mb-7 sm:mb-9">{t.pricing.pro.priceSuffix}</div>
            <ul className="flex flex-col gap-3.5 mb-10 text-[15px]">
              {t.pricing.pro.features.map((f) => <PlanItem key={f}>{f}</PlanItem>)}
            </ul>
            <Link href="/register" className="block text-center py-3.5 rounded-lg text-[15px] font-semibold bg-brand-500 text-ink shadow-[0_0_32px_rgba(14,207,183,0.2)] hover:bg-brand-300 hover:-translate-y-px transition-all">
              {t.pricing.pro.cta}
            </Link>
          </StaggerItem>
        </StaggerGroup>
      </section>

      {/* CTA BAND */}
      <div className="relative overflow-hidden text-center px-5 sm:px-6 py-16 sm:py-32 bg-ink-surface border-t border-white/[0.07]">
        <ParallaxLayer speed={0.2} className="absolute w-[600px] h-[400px] rounded-full left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none bg-[radial-gradient(circle,rgba(14,207,183,0.14)_0%,transparent_70%)]" />
        <Reveal>
          <h2 className="relative font-serif text-[clamp(2.2rem,5vw,4rem)] font-black leading-[1.1] tracking-[-1.5px] mb-5">
            {t.ctaBand.line1}<br /><em className="not-italic italic text-brand-500">{t.ctaBand.line2Emphasis}</em>
          </h2>
          <p className="relative text-base sm:text-[17px] text-cream/60 max-w-md mx-auto mb-8 sm:mb-11 leading-relaxed">{t.ctaBand.paragraph}</p>
          <SignedOut>
            <Link href="/register" className="relative inline-block bg-brand-500 text-ink px-11 py-[18px] rounded-lg text-[17px] font-semibold shadow-[0_0_32px_rgba(14,207,183,0.25)] hover:bg-brand-300 hover:-translate-y-0.5 transition-all">
              {t.ctaBand.cta}
            </Link>
          </SignedOut>
          <SignedIn>
            <Link href="/library" className="relative inline-block bg-brand-500 text-ink px-11 py-[18px] rounded-lg text-[17px] font-semibold shadow-[0_0_32px_rgba(14,207,183,0.25)] hover:bg-brand-300 hover:-translate-y-0.5 transition-all">
              {t.ctaBand.cta}
            </Link>
          </SignedIn>
        </Reveal>
      </div>

      {/* FOOTER */}
      <footer className="max-w-6xl mx-auto px-5 sm:px-12 py-10 sm:py-12 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-start">
        <div dir="ltr" className="flex items-center gap-2 font-serif font-bold text-lg text-cream">
          <Image src="/logo-icon.png" alt="" width={24} height={24} className="rounded-md" />
          <span>Re<span className="text-brand-500">trace</span></span>
        </div>
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-3">
          <a href="/legal/about" className="text-[13px] text-cream/50 hover:text-cream transition-colors">{t.footer.about}</a>
          <a href="#stories" className="text-[13px] text-cream/50 hover:text-cream transition-colors">{t.footer.stories}</a>
          <a href="#pricing" className="text-[13px] text-cream/50 hover:text-cream transition-colors">{t.footer.pricing}</a>
          <a href="/legal/privacy" className="text-[13px] text-cream/50 hover:text-cream transition-colors">{t.footer.privacy}</a>
          <a href="/legal/terms" className="text-[13px] text-cream/50 hover:text-cream transition-colors">{t.footer.terms}</a>
          <a href="/legal/contact" className="text-[13px] text-cream/50 hover:text-cream transition-colors">{t.footer.contact}</a>
          {/* The app itself, not another marketing anchor — signed-out visitors land on
              /login and come back to the library once authenticated. */}
          <Link href="/library" className="text-[13px] text-brand-400 hover:text-brand-300 transition-colors">{t.footer.openApp}</Link>
        </div>
        <div className="text-[13px] text-cream/30">© {new Date().getFullYear()} Retrace</div>
      </footer>
    </main>
  );
}

function PlanItem({ children, muted }: { children: React.ReactNode; muted?: boolean }) {
  return (
    <li className={`flex items-center gap-2.5 ${muted ? "text-cream/30" : "text-cream/70"}`}>
      <span className={muted ? "text-cream/25" : "text-brand-500"}>{muted ? "–" : "✓"}</span>
      {children}
    </li>
  );
}
