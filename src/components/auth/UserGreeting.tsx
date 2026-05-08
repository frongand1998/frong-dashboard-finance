"use client";

import { useUser } from "@clerk/nextjs";
import { useI18n } from "@/contexts/I18nContext";

export const UserGreeting = () => {
  const { user, isLoaded } = useUser();
  const { t } = useI18n();

  if (!isLoaded) {
    return <div className="h-6 w-24 animate-pulse rounded bg-slate-200" />;
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-slate-700">
        {t.common.welcome}, {user?.firstName || user?.username || "User"}
      </span>
    </div>
  );
};
