'use client';

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";
import clsx from "clsx";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "soft";
  size?: "sm" | "md" | "lg";
};

const baseStyles = "inline-flex items-center justify-center font-medium transition-colors rounded-lg";

const variantStyles: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary: "bg-accent text-white hover:bg-sky-500",
  ghost: "bg-transparent text-foreground hover:bg-muted",
  soft: "bg-accent-muted text-accent hover:bg-sky-100",
};

const sizeStyles: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-4 text-sm",
  lg: "h-12 px-5 text-base",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={twMerge(
          clsx(baseStyles, variantStyles[variant], sizeStyles[size]),
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
