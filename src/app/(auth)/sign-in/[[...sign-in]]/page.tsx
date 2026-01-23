'use client';

import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  const isClerkReady = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

  if (!isClerkReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface px-4">
        <div className="max-w-md rounded-xl border border-border bg-card p-6 text-sm text-slate-700 shadow-sm">
          Add your Clerk publishable key to .env.local to enable authentication.
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface">
      <SignIn 
        appearance={{ elements: { formButtonPrimary: "bg-accent" } }}
        afterSignInUrl="/"
        afterSignUpUrl="/"
        redirectUrl="/"
      />
    </div>
  );
}
