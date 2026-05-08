"use client";

import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { Bell, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { UserGreeting } from "@/components/auth/UserGreeting";
import { useI18n } from "@/contexts/I18nContext";
import type { PropsWithChildren } from "react";

type NavbarProps = PropsWithChildren<{
  onMenuClick?: () => void;
}>;

export const Navbar = ({ onMenuClick }: NavbarProps) => {
  const isClerkReady = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
  const { t } = useI18n();

  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-card/80 backdrop-blur">
      <div className="mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            aria-label={t.nav.toggleNav}
            className="inline-flex items-center justify-center rounded-lg p-2 text-slate-700 hover:bg-slate-100 lg:hidden"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-white shadow-sm">
              Y
            </span>
            <span className="hidden sm:inline">{t.nav.appName}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <button
            aria-label={t.nav.notifications}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-slate-600 hover:bg-slate-100"
          >
            <Bell className="h-4 w-4" />
          </button>
          {isClerkReady ? (
            <>
              <SignedIn>
                {" "}
                <UserGreeting />
              </SignedIn>
              <SignedIn>
                {" "}
                <UserButton afterSignOutUrl="/" />
              </SignedIn>
              <SignedOut>
                <SignInButton mode="redirect" forceRedirectUrl="/dashboard">
                  <Button variant="soft" size="sm">
                    {t.nav.signIn}
                  </Button>
                </SignInButton>
              </SignedOut>
            </>
          ) : (
            <Button variant="soft" size="sm">
              {t.nav.setUpClerk}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};
