import type { Metadata } from "next";
import { Playfair_Display, DM_Sans, Noto_Naskh_Arabic } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
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
  title: { default: "Retrace", template: "%s | Retrace" },
  description: "Master English by reading, listening, and typing stories line by line — made for Arabic speakers.",
  keywords: ["learn english", "arabic speakers", "language learning", "stories"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning className={`scroll-smooth ${dmSans.variable} ${playfair.variable} ${notoNaskhArabic.variable}`}>
        <body className="font-sans antialiased bg-paper text-ink min-h-screen">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
