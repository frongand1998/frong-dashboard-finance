"use client";

import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "@/config/routes";
import { useI18n } from "@/contexts/I18nContext";
import { hasAdminAccess } from "@/lib/admin";
import clsx from "clsx";

export const Sidebar = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const { user } = useUser();
  const pathname = usePathname();
  const { t } = useI18n();
  const canAccessAdmin = hasAdminAccess(user);

  const visibleNavItems = navItems.filter((item) => {
    if (item.href === "/admin") {
      return canAccessAdmin;
    }
    return true;
  });

  return (
    <aside
      className={clsx(
        "fixed inset-y-0 left-0 z-40 w-64 border-r border-border bg-card shadow-lg transition-transform duration-200 lg:static lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
      )}
    >
      <div className="flex items-center justify-between px-6 py-5 lg:hidden">
        <span className="text-base font-semibold text-foreground">
          {t.nav.menu}
        </span>
        <button
          aria-label={t.nav.closeMenu}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
          onClick={onClose}
        >
          ✕
        </button>
      </div>
      <nav className="space-y-1 px-3 py-4">
        {visibleNavItems.map((item) => {
          const active = pathname === item.href;
          const label =
            t.nav[item.labelKey as keyof typeof t.nav] ?? item.labelKey;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                active
                  ? "bg-accent text-white shadow-sm"
                  : "text-slate-700 hover:bg-slate-100",
              )}
              onClick={onClose}
            >
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};
