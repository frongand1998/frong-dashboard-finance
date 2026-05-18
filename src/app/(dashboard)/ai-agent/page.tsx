"use client";

import { PageShell } from "@/components/layout/PageShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useI18n } from "@/contexts/I18nContext";

export default function AIAgentPage() {
  const { locale } = useI18n();

  return (
    <PageShell>
      <div className="mx-auto w-full max-w-2xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold">
            {locale === "th" ? "AI ผู้ช่วยทางการเงิน" : "AI Finance Agent"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {locale === "th"
              ? "ปิดใช้งานชั่วคราวเพื่อควบคุมค่าใช้จ่าย"
              : "Temporarily disabled to control operating costs."}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {locale === "th"
                ? "ปิดให้บริการชั่วคราว"
                : "Service Temporarily Unavailable"}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p>
              {locale === "th"
                ? "ฟีเจอร์ AI Agent จะกลับมาเมื่อพร้อมด้านงบประมาณและโครงสร้างต้นทุน"
                : "The AI Agent feature will return once budget and cost controls are ready."}
            </p>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
