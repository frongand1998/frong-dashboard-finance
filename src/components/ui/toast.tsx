"use client";

import { useState, useCallback } from "react";
import { X, CheckCircle, AlertCircle, AlertTriangle } from "lucide-react";

export type ToastVariant = "success" | "error" | "warning" | "info";

export interface ToastItem {
  id: string;
  message: string;
  variant: ToastVariant;
}

const variantStyles: Record<ToastVariant, string> = {
  success: "bg-green-50 border-green-400 text-green-800",
  error: "bg-red-50 border-red-400 text-red-800",
  warning: "bg-orange-50 border-orange-400 text-orange-800",
  info: "bg-blue-50 border-blue-400 text-blue-800",
};

const variantIcons: Record<ToastVariant, React.ReactNode> = {
  success: <CheckCircle className="w-4 h-4 shrink-0" />,
  error: <AlertCircle className="w-4 h-4 shrink-0" />,
  warning: <AlertTriangle className="w-4 h-4 shrink-0" />,
  info: <AlertCircle className="w-4 h-4 shrink-0" />,
};

interface ToastProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastProps) {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-start gap-2 border rounded-lg px-4 py-3 shadow-md pointer-events-auto transition-all duration-300 ${variantStyles[toast.variant]}`}
        >
          {variantIcons[toast.variant]}
          <p className="flex-1 text-sm leading-snug">{toast.message}</p>
          <button
            onClick={() => onDismiss(toast.id)}
            className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

export function useToast(autoDismissMs = 4000) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, variant: ToastVariant = "info") => {
      const id = Math.random().toString(36).slice(2);
      setToasts((prev) => [...prev, { id, message, variant }]);
      if (autoDismissMs > 0) {
        setTimeout(() => dismiss(id), autoDismissMs);
      }
      return id;
    },
    [autoDismissMs, dismiss],
  );

  return { toasts, toast, dismiss };
}
