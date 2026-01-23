'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "@/config/routes";
import clsx from "clsx";

export const Sidebar = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const pathname = usePathname();

  return (
    <aside
      className={clsx(
        "fixed inset-y-0 left-0 z-40 w-64 border-r border-border bg-card shadow-lg transition-transform duration-200 lg:static lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}
    >
      <div className="flex items-center justify-between px-6 py-5 lg:hidden">
        <span className="text-base font-semibold text-foreground">Menu</span>
        <button
          aria-label="Close menu"
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
          onClick={onClose}
        >
          ✕
        </button>
      </div>
      <nav className="space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                active
                  ? "bg-accent text-white shadow-sm"
                  : "text-slate-700 hover:bg-slate-100"
              )}
              onClick={onClose}
            >
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};
