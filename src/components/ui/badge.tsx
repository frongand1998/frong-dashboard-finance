import clsx from "clsx";
import { twMerge } from "tailwind-merge";
import type { PropsWithChildren } from "react";

type BadgeProps = PropsWithChildren<{
  variant?: "default" | "success" | "danger" | "muted";
  className?: string;
}>;

const variantStyles: Record<NonNullable<BadgeProps["variant"]>, string> = {
  default: "bg-accent-muted text-accent border border-accent/20",
  success: "bg-green-100 text-green-700 border border-green-200",
  danger: "bg-red-100 text-red-700 border border-red-200",
  muted: "bg-slate-100 text-slate-600 border border-slate-200",
};

export const Badge = ({
  children,
  variant = "default",
  className,
}: BadgeProps) => {
  return (
    <span
      className={twMerge(
        clsx(
          "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
          variantStyles[variant]
        ),
        className
      )}
    >
      {children}
    </span>
  );
};
