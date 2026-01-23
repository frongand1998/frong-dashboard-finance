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
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  return <>{children}</>;
};
