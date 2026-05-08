"use client";

import { SignUp } from "@clerk/nextjs";
import { useI18n } from "@/contexts/I18nContext";

export default function SignUpPage() {
  const isClerkReady = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
  const { t } = useI18n();

  if (!isClerkReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface px-4">
        <div className="max-w-md rounded-xl border border-border bg-card p-6 text-sm text-slate-700 shadow-sm">
          {t.auth.clerkNotConfigured}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface">
      <SignUp
        appearance={{ elements: { formButtonPrimary: "bg-accent" } }}
        afterSignInUrl="/dashboard"
        afterSignUpUrl="/dashboard"
        redirectUrl="/dashboard"
      />
    </div>
  );
}
