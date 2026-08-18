import type { Metadata, Viewport } from "next";
import { Playfair_Display, DM_Sans, Noto_Naskh_Arabic } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { clerkAppearance } from "@/lib/clerk-appearance";
import { siteUrl } from "@/lib/site";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-sans",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

const notoNaskhArabic = Noto_Naskh_Arabic({
  subsets: ["arabic"],
  weight: ["400", "700"],
  variable: "--font-arabic",
  display: "swap",
});

export const metadata: Metadata = {
  // Without metadataBase, Next resolves every OG/Twitter image against localhost and
  // warns on each build — social previews would break in production.
  metadataBase: new URL(siteUrl()),
  title: { default: "Retrace", template: "%s | Retrace" },
  description: "Master English by reading, listening, and typing stories line by line — made for Arabic speakers.",
  keywords: ["learn english", "arabic speakers", "language learning", "stories"],
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Retrace" },
};

export const viewport: Viewport = {
  themeColor: "#0d9488",
  width: "device-width",
  initialScale: 1,
  // Required for env(safe-area-inset-*) to report real values — without it the bottom
  // tab bar and reader controls sit under the iPhone home indicator. Zoom is left
  // unrestricted on purpose (no maximumScale / userScalable: false).
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider appearance={clerkAppearance}>
      <html lang="en" suppressHydrationWarning className={`scroll-smooth ${dmSans.variable} ${playfair.variable} ${notoNaskhArabic.variable}`}>
        <body className="font-sans antialiased bg-paper text-ink min-h-screen">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
