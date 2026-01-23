'use client';

import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { Bell, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserGreeting } from "@/components/auth/UserGreeting";
import type { PropsWithChildren } from "react";

type NavbarProps = PropsWithChildren<{
  onMenuClick?: () => void;
}>;

export const Navbar = ({ onMenuClick }: NavbarProps) => {
  const isClerkReady = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-card/80 backdrop-blur">
      <div className="mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            aria-label="Toggle navigation"
            className="inline-flex items-center justify-center rounded-lg p-2 text-slate-700 hover:bg-slate-100 lg:hidden"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-white shadow-sm">
              F
            </span>
            <span className="hidden sm:inline">Frong Finance</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            aria-label="Notifications"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-slate-600 hover:bg-slate-100"
          >
            <Bell className="h-4 w-4" />
          </button>
          {isClerkReady ? (
            <>
              <SignedIn>                <UserGreeting />
              </SignedIn>
              <SignedIn>                <UserButton afterSignOutUrl="/" />
              </SignedIn>
              <SignedOut>
                <SignInButton>
                  <Button variant="soft" size="sm">
                    Sign in
                  </Button>
                </SignInButton>
              </SignedOut>
            </>
          ) : (
            <Button variant="soft" size="sm">Set up Clerk</Button>
          )}
        </div>
      </div>
    </header>
  );
};
