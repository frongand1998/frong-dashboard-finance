'use client';

import { useAuth } from "@clerk/nextjs";
import type { PropsWithChildren } from "react";
import { redirect } from "next/navigation";
import { useEffect } from "react";

export const ProtectedRoute = ({ children }: PropsWithChildren) => {
  const { isSignedIn, isLoaded } = useAuth();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      redirect("/sign-in");
    }
  }, [isLoaded, isSignedIn]);

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <div className="text-center space-y-4">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-accent text-2xl font-bold text-white animate-pulse">
            Y
          </div>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return null; // Will redirect in useEffect
  }

  return <>{children}</>;
};
