import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import type { PropsWithChildren } from "react";

export const dynamic = "force-dynamic";

export default function DashboardLayout({ children }: PropsWithChildren) {
  return (
    <ProtectedRoute>
      <CurrencyProvider>
        {children}
      </CurrencyProvider>
    </ProtectedRoute>
  );
}
