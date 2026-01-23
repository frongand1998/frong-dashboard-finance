import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "Frong Finance Dashboard",
  description: "Track income, expenses, and financial goals.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Use a placeholder key if not configured to allow builds without env
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "pk_live_demo";

  return (
    <ClerkProvider publishableKey={publishableKey}>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} bg-surface text-foreground antialiased`}
          suppressHydrationWarning
        >
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
