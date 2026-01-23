'use client';

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import clsx from "clsx";
import type { PropsWithChildren } from "react";

export const PageShell = ({ children }: PropsWithChildren) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface">
      <Navbar onMenuClick={() => setIsSidebarOpen(true)} />
      <div className="relative mx-auto flex max-w-7xl gap-0 lg:gap-6">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <main className={clsx("flex-1 px-4 pb-10 pt-6 sm:px-6 lg:px-0")}>{children}</main>
      </div>
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};
