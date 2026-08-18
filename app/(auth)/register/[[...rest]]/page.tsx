import { SignUp } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Create account" };

export default function RegisterPage() {
  return (
    <div className="grain relative min-h-[100svh] bg-gradient-to-b from-ink via-ink to-ink-raised flex items-center justify-center px-4 py-10 overflow-hidden">
      <div
        aria-hidden
        className="absolute w-[700px] h-[700px] rounded-full pointer-events-none -top-52 -right-52 bg-[radial-gradient(circle,rgba(14,207,183,0.12)_0%,transparent_70%)] animate-pulse-glow"
      />
      <div
        aria-hidden
        className="absolute w-[500px] h-[500px] rounded-full pointer-events-none -bottom-56 -left-40 bg-[radial-gradient(circle,rgba(14,207,183,0.06)_0%,transparent_70%)] animate-pulse-glow [animation-direction:reverse]"
      />
      <div className="relative w-full max-w-md animate-fade-up">
        <div className="text-center mb-8">
          <Link href="/" dir="ltr" className="inline-flex flex-col items-center gap-2 font-serif font-bold text-xl text-cream tracking-tight">
            <Image src="/logo-icon.png" alt="" width={40} height={40} className="rounded-xl" priority />
            <span>Re<span className="text-brand-500">trace</span></span>
          </Link>
          <h1 className="font-serif text-2xl font-bold text-cream mt-6">Start learning for free</h1>
          <p className="text-cream/50 mt-1">Create your account in seconds</p>
        </div>
        <div className="rounded-2xl border border-brand-500/15 bg-ink-surface shadow-[0_20px_60px_rgba(0,0,0,0.6),0_0_40px_rgba(14,207,183,0.06)]">
          <SignUp />
        </div>
      </div>
    </div>
  );
}
