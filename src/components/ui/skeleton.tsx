import clsx from "clsx";
import { twMerge } from "tailwind-merge";
import type { PropsWithChildren } from "react";

export const Skeleton = ({
  className,
  children,
}: PropsWithChildren<{ className?: string }>) => (
  <div
    className={twMerge(
      clsx("animate-pulse rounded-lg bg-slate-200", className)
    )}
  >
    {children}
  </div>
);
