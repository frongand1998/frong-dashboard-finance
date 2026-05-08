import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { cookies } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import { I18nProvider } from "@/contexts/I18nContext";
import { LOCALE_COOKIE_KEY, resolveLocale } from "@/lib/i18n";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Your Finance Assistant - Smart Personal Finance Management",
    template: "%s | Your Finance Assistant",
  },
  description:
    "Track expenses, scan Thai payment slips with OCR, set financial goals, and manage your money smarter. Free personal finance app with multi-currency support.",
  keywords: [
    "personal finance",
    "expense tracker",
    "budget app",
    "payment slip OCR",
    "Thai banking",
    "financial goals",
    "money management",
    "expense management",
    "budget planner",
  ],
  authors: [{ name: "Your Finance Assistant" }],
  creator: "Your Finance Assistant",
  publisher: "Your Finance Assistant",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://frong-finance.vercel.app",
    title: "Your Finance Assistant - Smart Personal Finance Management",
    description:
      "Track expenses, scan Thai payment slips with OCR, and achieve your financial goals. Free personal finance app.",
    siteName: "Your Finance Assistant",
  },
  twitter: {
    card: "summary_large_image",
    title: "Your Finance Assistant - Smart Personal Finance Management",
    description:
      "Track expenses, scan payment slips, and manage your money smarter. 100% free.",
    creator: "@frongfinance",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const initialLocale = resolveLocale(
    cookieStore.get(LOCALE_COOKIE_KEY)?.value,
  );

  // Use a placeholder key if not configured to allow builds without env
  const publishableKey =
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "pk_live_demo";

  return (
    <ClerkProvider publishableKey={publishableKey}>
      <html lang={initialLocale}>
        <body
          className={`${geistSans.variable} ${geistMono.variable} bg-surface text-foreground antialiased`}
          suppressHydrationWarning
        >
          <I18nProvider initialLocale={initialLocale}>{children}</I18nProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
