import { twMerge } from "tailwind-merge";
import type { PropsWithChildren, ReactNode } from "react";

type CardProps = PropsWithChildren<{
  className?: string;
}>;

type CardSectionProps = PropsWithChildren<{
  className?: string;
  action?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
}>;

export const Card = ({ children, className }: CardProps) => {
  return (
    <div className={twMerge("card-surface", className)}>
      {children}
    </div>
  );
};

export const CardHeader = ({
  className,
  children,
}: PropsWithChildren<{ className?: string }>) => (
  <div className={twMerge("flex items-start justify-between gap-3 p-6", className)}>
    {children}
  </div>
);

export const CardTitle = ({ children, className }: CardProps) => (
  <div className={twMerge("text-lg font-semibold text-foreground", className)}>
    {children}
  </div>
);

export const CardDescription = ({ children, className }: CardProps) => (
  <p className={twMerge("text-sm text-slate-600", className)}>{children}</p>
);

export const CardContent = ({ children, className }: CardProps) => (
  <div className={twMerge("px-6 pb-6", className)}>{children}</div>
);

export const CardSection = ({
  className,
  title,
  description,
  action,
  children,
}: CardSectionProps) => (
  <Card className={className}>
    <CardHeader>
      <div className="space-y-1">
        {title && <CardTitle>{title}</CardTitle>}
        {description && <CardDescription>{description}</CardDescription>}
      </div>
      {action}
    </CardHeader>
    <CardContent>{children}</CardContent>
  </Card>
);
