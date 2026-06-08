"use client";

import { useEffect, useMemo, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useI18n } from "@/contexts/I18nContext";
import {
  futureValueLumpSum,
  requiredMonthlyContribution,
  toMonthlyRate,
} from "@/lib/investment-planner";
import { formatCurrency } from "@/lib/utils";

function sanitizeNumber(value: string, fallback: number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return fallback;
  return parsed;
}

function getNextDcaDate(day: number, now = new Date()) {
  const safeDay = Math.min(Math.max(day, 1), 28);
  const currentMonthDate = new Date(
    now.getFullYear(),
    now.getMonth(),
    safeDay,
    9,
    0,
    0,
    0,
  );

  if (currentMonthDate >= now) {
    return currentMonthDate;
  }

  return new Date(now.getFullYear(), now.getMonth() + 1, safeDay, 9, 0, 0, 0);
}

const TICKER_RE = /^[A-Z0-9.\-^]{1,12}$/;

type RiskPreset = {
  id: "stable" | "balanced" | "growth";
  labelEn: string;
  labelTh: string;
  annualReturn: number;
  allocation: { equity: number; bond: number; cash: number };
};

type SuggestedInstrument = {
  symbol: string;
  name: string;
  assetClass: string;
  weightPct: number;
  reason: string;
  price: number | null;
  changePct: number | null;
};

type PlanProfile = "core" | "global-equity";

type RegionalZone = {
  zone: string;
  zoneNameEn: string;
  zoneNameTh: string;
  weightPct: number;
  exampleEtfs: string[];
  descriptionEn: string;
  descriptionTh: string;
};

type WatchlistQuote = {
  symbol: string;
  name: string;
  price: number | null;
  changePct: number | null;
  currency: string | null;
};

const GLOBAL_EQUITY_REGIONAL: Record<RiskPreset["id"], RegionalZone[]> = {
  stable: [
    {
      zone: "US",
      zoneNameEn: "U.S. Equities",
      zoneNameTh: "หุ้นสหรัฐ",
      weightPct: 40,
      exampleEtfs: ["VTI", "SPY"],
      descriptionEn: "Broad U.S. market for stability and dividend income.",
      descriptionTh: "หุ้นสหรัฐครอบคลุมตลาดกว้าง เน้นปันผลและความมั่นคง",
    },
    {
      zone: "Developed",
      zoneNameEn: "Developed Markets ex-US",
      zoneNameTh: "ตลาดพัฒนาแล้ว (นอกสหรัฐ)",
      weightPct: 35,
      exampleEtfs: ["VEA", "EFA"],
      descriptionEn: "Europe, Japan, Australia for geographic diversification.",
      descriptionTh: "ยุโรป ญี่ปุ่น ออสเตรเลีย กระจายภูมิภาคเพื่อลดความเสี่ยง",
    },
    {
      zone: "EM",
      zoneNameEn: "Emerging Markets",
      zoneNameTh: "ตลาดเกิดใหม่",
      weightPct: 25,
      exampleEtfs: ["VWO", "IEMG"],
      descriptionEn: "China, India, Brazil — long-term high-growth potential.",
      descriptionTh: "จีน อินเดีย บราซิล — โอกาสเติบโตสูงระยะยาว",
    },
  ],
  balanced: [
    {
      zone: "US",
      zoneNameEn: "U.S. Equities",
      zoneNameTh: "หุ้นสหรัฐ",
      weightPct: 50,
      exampleEtfs: ["VTI", "SPY"],
      descriptionEn: "Core U.S. growth engine driving global equity returns.",
      descriptionTh: "แกนหลักการเติบโตสหรัฐ ขับเคลื่อนผลตอบแทนตลาดโลก",
    },
    {
      zone: "Developed",
      zoneNameEn: "Developed Markets ex-US",
      zoneNameTh: "ตลาดพัฒนาแล้ว (นอกสหรัฐ)",
      weightPct: 30,
      exampleEtfs: ["VEA", "EFA"],
      descriptionEn: "Smoother volatility cycle from mature economies.",
      descriptionTh: "ลดความผันผวนด้วยเศรษฐกิจที่เป็นผู้ใหญ่",
    },
    {
      zone: "EM",
      zoneNameEn: "Emerging Markets",
      zoneNameTh: "ตลาดเกิดใหม่",
      weightPct: 20,
      exampleEtfs: ["VWO", "IEMG"],
      descriptionEn: "Selective EM weight for long-term alpha opportunity.",
      descriptionTh: "เพิ่มน้ำหนัก EM บางส่วนเพื่อโอกาสผลตอบแทนระยะยาว",
    },
  ],
  growth: [
    {
      zone: "US",
      zoneNameEn: "U.S. Equities",
      zoneNameTh: "หุ้นสหรัฐ",
      weightPct: 45,
      exampleEtfs: ["QQQ", "VTI"],
      descriptionEn: "High-growth U.S. tech and large-cap momentum tilt.",
      descriptionTh: "เน้นหุ้นเทคและขนาดใหญ่สหรัฐที่มี momentum สูง",
    },
    {
      zone: "Developed",
      zoneNameEn: "Developed Markets ex-US",
      zoneNameTh: "ตลาดพัฒนาแล้ว (นอกสหรัฐ)",
      weightPct: 25,
      exampleEtfs: ["VEA", "SPDW"],
      descriptionEn: "Developed diversifier to offset U.S. concentration.",
      descriptionTh: "กระจายความเสี่ยงออกจากสหรัฐด้วยตลาดพัฒนาแล้ว",
    },
    {
      zone: "EM",
      zoneNameEn: "Emerging Markets",
      zoneNameTh: "ตลาดเกิดใหม่",
      weightPct: 30,
      exampleEtfs: ["VWO", "IEMG"],
      descriptionEn: "Higher EM tilt for maximum long-term growth potential.",
      descriptionTh: "น้ำหนัก EM สูงสำหรับโอกาสเติบโตสูงสุดระยะยาว",
    },
  ],
};

const RISK_PRESETS: RiskPreset[] = [
  {
    id: "stable",
    labelEn: "Stable",
    labelTh: "เน้นมั่นคง",
    annualReturn: 5,
    allocation: { equity: 30, bond: 55, cash: 15 },
  },
  {
    id: "balanced",
    labelEn: "Balanced",
    labelTh: "สมดุล",
    annualReturn: 8,
    allocation: { equity: 60, bond: 30, cash: 10 },
  },
  {
    id: "growth",
    labelEn: "Growth",
    labelTh: "เน้นเติบโต",
    annualReturn: 11,
    allocation: { equity: 80, bond: 15, cash: 5 },
  },
];

function projectWithStepUp(params: {
  principal: number;
  monthlyContribution: number;
  annualReturnPercent: number;
  months: number;
  annualStepUpPercent: number;
}) {
  const monthlyRate = toMonthlyRate(params.annualReturnPercent);
  let currentContribution = params.monthlyContribution;
  let totalValue = params.principal;
  let totalContributions = params.principal;

  const monthlyRows: Array<{
    month: number;
    contribution: number;
    totalContributions: number;
    portfolioValue: number;
  }> = [];

  const yearlyRows: Array<{ year: number; value: number }> = [];

  for (let month = 1; month <= params.months; month += 1) {
    totalValue = totalValue * (1 + monthlyRate) + currentContribution;
    totalContributions += currentContribution;

    if (month <= 12) {
      monthlyRows.push({
        month,
        contribution: currentContribution,
        totalContributions,
        portfolioValue: totalValue,
      });
    }

    if (month % 12 === 0) {
      yearlyRows.push({
        year: month / 12,
        value: totalValue,
      });
      currentContribution *= 1 + params.annualStepUpPercent / 100;
    }
  }

  return {
    totalFutureValue: totalValue,
    totalContributions,
    estimatedGain: totalValue - totalContributions,
    yearlyRows,
    monthlyRows,
  };
}

export default function DcaPlannerPage() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const { currency } = useCurrency();
  const { t, locale } = useI18n();
  const [riskPresetId, setRiskPresetId] =
    useState<RiskPreset["id"]>("balanced");
  const [initialAmount, setInitialAmount] = useState("10000");
  const [monthlyAmount, setMonthlyAmount] = useState("5000");
  const [annualReturn, setAnnualReturn] = useState("8");
  const [years, setYears] = useState("10");
  const [annualStepUp, setAnnualStepUp] = useState("0");
  const [goalAmount, setGoalAmount] = useState("1000000");
  const [dcaDay, setDcaDay] = useState("5");
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [planProfileId, setPlanProfileId] = useState<PlanProfile>("core");
  const [suggestions, setSuggestions] = useState<SuggestedInstrument[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(true);
  const [suggestionsError, setSuggestionsError] = useState<string | null>(null);
  const [watchlistInput, setWatchlistInput] = useState("");
  const [watchlistSymbols, setWatchlistSymbols] = useState<string[]>([]);
  const [watchlistQuotes, setWatchlistQuotes] = useState<WatchlistQuote[]>([]);
  const [watchlistLoading, setWatchlistLoading] = useState(false);
  const [watchlistHydrated, setWatchlistHydrated] = useState(false);

  const watchlistStorageKey = useMemo(
    () => `dca:watchlist:${user?.id ?? "anonymous"}`,
    [user?.id],
  );

  const currentPreset =
    RISK_PRESETS.find((preset) => preset.id === riskPresetId) ??
    RISK_PRESETS[1];

  const projection = useMemo(() => {
    const principal = sanitizeNumber(initialAmount, 0);
    const monthlyContribution = sanitizeNumber(monthlyAmount, 0);
    const annualReturnPercent = sanitizeNumber(annualReturn, 0);
    const yearsNum = Math.max(1, Math.floor(sanitizeNumber(years, 1)));
    const annualStepUpPercent = sanitizeNumber(annualStepUp, 0);
    const goalTarget = sanitizeNumber(goalAmount, 0);
    const months = yearsNum * 12;

    const result = projectWithStepUp({
      principal,
      monthlyContribution,
      annualReturnPercent,
      months,
      annualStepUpPercent,
    });

    const principalFutureValue = futureValueLumpSum(
      principal,
      toMonthlyRate(annualReturnPercent),
      months,
    );
    const remainingForDca = Math.max(goalTarget - principalFutureValue, 0);
    const requiredMonthly = requiredMonthlyContribution({
      targetFutureValue: remainingForDca,
      annualReturnPercent,
      months,
    });
    const monthlyGap = monthlyContribution - requiredMonthly;

    const planStatus =
      monthlyGap >= 0
        ? locale === "th"
          ? "ถึงเป้าตามแผน"
          : "On target"
        : locale === "th"
          ? "ควรเพิ่ม DCA"
          : "Increase DCA";

    return {
      principal,
      monthlyContribution,
      annualReturnPercent,
      yearsNum,
      annualStepUpPercent,
      goalTarget,
      totalFutureValue: result.totalFutureValue,
      totalContributions: result.totalContributions,
      estimatedGain: result.estimatedGain,
      requiredMonthly,
      monthlyGap,
      planStatus,
      milestones: result.yearlyRows,
      monthlyRows: result.monthlyRows,
    };
  }, [
    annualReturn,
    annualStepUp,
    goalAmount,
    initialAmount,
    locale,
    monthlyAmount,
    years,
  ]);

  const scenarios = useMemo(() => {
    const principal = sanitizeNumber(initialAmount, 0);
    const monthlyContribution = sanitizeNumber(monthlyAmount, 0);
    const yearsNum = Math.max(1, Math.floor(sanitizeNumber(years, 1)));
    const annualStepUpPercent = sanitizeNumber(annualStepUp, 0);
    const months = yearsNum * 12;

    const byPreset = RISK_PRESETS.map((preset) => {
      const simulated = projectWithStepUp({
        principal,
        monthlyContribution,
        annualReturnPercent: preset.annualReturn,
        months,
        annualStepUpPercent,
      });

      return {
        preset,
        finalValue: simulated.totalFutureValue,
        yearlyRows: simulated.yearlyRows,
      };
    });

    const maxValue = Math.max(
      1,
      ...byPreset.flatMap((scenario) =>
        scenario.yearlyRows.map((row) => row.value),
      ),
    );

    return { byPreset, maxValue, yearsNum };
  }, [annualStepUp, initialAmount, monthlyAmount, years]);

  const schedule = useMemo(() => {
    const day = Math.min(
      28,
      Math.max(1, Math.floor(sanitizeNumber(dcaDay, 5))),
    );
    const nextRun = getNextDcaDate(day);

    return {
      day,
      nextRun,
    };
  }, [dcaDay]);

  const ui = {
    goalPlanner: locale === "th" ? "ตัวช่วยวางแผนถึงเป้าหมาย" : "Goal Planner",
    riskProfile: locale === "th" ? "โปรไฟล์ความเสี่ยง" : "Risk Profile",
    annualStepUp:
      locale === "th" ? "เพิ่มเงิน DCA ทุกปี (%)" : "Annual DCA Step-up (%)",
    targetAmount:
      locale === "th" ? "เป้าหมายเงินปลายทาง" : "Target Future Value",
    requiredMonthly:
      locale === "th" ? "DCA ที่ควรลงทุน/เดือน" : "Required DCA / month",
    yourPlanGap:
      locale === "th" ? "ส่วนต่างจากแผนปัจจุบัน" : "Gap vs your current DCA",
    yearOnePlan: locale === "th" ? "แผน 12 เดือนแรก" : "First 12 Months Plan",
    month: locale === "th" ? "เดือน" : "Month",
    contribution: locale === "th" ? "เงินลงทุนเดือนนี้" : "Contribution",
    cumulative: locale === "th" ? "เงินลงทุนสะสม" : "Cumulative",
    portfolio: locale === "th" ? "มูลค่าพอร์ตประมาณ" : "Estimated Value",
    allocationMix: locale === "th" ? "สัดส่วนแนะนำ" : "Suggested Allocation",
    comparePlans:
      locale === "th" ? "เปรียบเทียบ 3 แผน" : "Compare 3 Strategies",
    dcaSchedule: locale === "th" ? "ตารางลงทุน DCA" : "DCA Schedule",
    dcaDay: locale === "th" ? "ลงทุนทุกวันที่" : "Invest every day",
    reminder: locale === "th" ? "เปิดการแจ้งเตือน" : "Enable reminder",
    nextRun: locale === "th" ? "รอบถัดไป" : "Next run",
    exportPdf: locale === "th" ? "Export PDF แผนลงทุน" : "Export Plan PDF",
    finalValue: locale === "th" ? "มูลค่าเป้าประมาณ" : "Estimated final value",
    expectedReturn: locale === "th" ? "ผลตอบแทนคาดหวัง" : "Expected return",
    suggestedBasket:
      locale === "th"
        ? "กองทุน/หุ้นแนะนำตามความเสี่ยง"
        : "Suggested Funds/Stocks by Risk",
    monthlyBuyPlan:
      locale === "th" ? "แผนซื้อรายเดือนตามสัดส่วน" : "Monthly Buy Plan",
    noSuggestionData:
      locale === "th"
        ? "ยังโหลดคำแนะนำไม่ได้ ลองใหม่อีกครั้ง"
        : "Unable to load suggestions right now. Please retry.",
    notFinancialAdvice:
      locale === "th"
        ? "ข้อมูลนี้เป็นแนวทางการกระจายพอร์ตเบื้องต้น ไม่ใช่คำแนะนำการลงทุนเฉพาะบุคคล"
        : "These are educational allocation examples, not personalized financial advice.",
    planType: locale === "th" ? "รูปแบบพอร์ต" : "Plan Type",
    planCore: locale === "th" ? "พอร์ตผสมมาตรฐาน" : "Core Diversified",
    planGlobalEquity:
      locale === "th"
        ? "แผนหุ้นนอก (Global Equity)"
        : "Foreign Stocks (Global Equity)",
    regionalBreakdown:
      locale === "th"
        ? "สัดส่วนตามภูมิภาค (Global Equity)"
        : "Regional Breakdown (Global Equity)",
    exampleEtfs: locale === "th" ? "ตัวอย่าง ETF" : "Example ETFs",
    watchlistTitle:
      locale === "th" ? "Watchlist หุ้นที่สนใจ" : "Custom Watchlist",
    watchlistPlaceholder:
      locale === "th" ? "เช่น AAPL หรือ AMD, MSFT" : "e.g. AAPL or AMD, MSFT",
    watchlistAdd: locale === "th" ? "เพิ่ม" : "Add",
    watchlistEmpty:
      locale === "th"
        ? "เพิ่ม symbol เพื่อดูราคา live"
        : "Add ticker symbols above to track live prices.",
    watchlistFetching:
      locale === "th" ? "กำลังโหลดราคา..." : "Loading prices...",
    watchlistNoData: locale === "th" ? "ไม่พบข้อมูลราคา" : "Price unavailable",
  };

  const applyRiskPreset = (preset: RiskPreset) => {
    setRiskPresetId(preset.id);
    setAnnualReturn(String(preset.annualReturn));
  };

  useEffect(() => {
    let ignore = false;

    const loadSuggestions = async () => {
      setSuggestionsLoading(true);
      setSuggestionsError(null);

      try {
        const res = await fetch(
          `/api/investment-recommendations?plan=${planProfileId}&risk=${riskPresetId}&locale=${locale}`,
          { cache: "no-store" },
        );

        if (!res.ok) {
          throw new Error("failed-to-load-suggestions");
        }

        const payload = (await res.json()) as {
          recommendations?: SuggestedInstrument[];
        };

        if (!ignore) {
          setSuggestions(payload.recommendations || []);
        }
      } catch {
        if (!ignore) {
          setSuggestions([]);
          setSuggestionsError(ui.noSuggestionData);
        }
      } finally {
        if (!ignore) {
          setSuggestionsLoading(false);
        }
      }
    };

    loadSuggestions();
    return () => {
      ignore = true;
    };
  }, [locale, planProfileId, riskPresetId, ui.noSuggestionData]);

  useEffect(() => {
    if (!isUserLoaded) return;

    try {
      const raw = localStorage.getItem(watchlistStorageKey);
      if (!raw) {
        setWatchlistSymbols([]);
        return;
      }

      const parsed = JSON.parse(raw) as unknown;
      if (!Array.isArray(parsed)) {
        setWatchlistSymbols([]);
        return;
      }

      const normalized = parsed
        .map((item) => String(item).trim().toUpperCase())
        .filter((symbol) => symbol && TICKER_RE.test(symbol));

      setWatchlistSymbols([...new Set(normalized)].slice(0, 10));
    } catch {
      setWatchlistSymbols([]);
    } finally {
      setWatchlistHydrated(true);
    }
  }, [isUserLoaded, watchlistStorageKey]);

  useEffect(() => {
    if (!watchlistHydrated) return;
    localStorage.setItem(watchlistStorageKey, JSON.stringify(watchlistSymbols));
  }, [watchlistHydrated, watchlistStorageKey, watchlistSymbols]);

  useEffect(() => {
    if (watchlistSymbols.length === 0) {
      setWatchlistQuotes([]);
      return;
    }
    let ignore = false;
    setWatchlistLoading(true);
    fetch(
      `/api/watchlist-quotes?symbols=${encodeURIComponent(watchlistSymbols.join(","))}`,
      { cache: "no-store" },
    )
      .then((res) => (res.ok ? res.json() : { quotes: [] }))
      .then((data: { quotes?: WatchlistQuote[] }) => {
        if (!ignore) setWatchlistQuotes(data.quotes ?? []);
      })
      .catch(() => {
        if (!ignore) setWatchlistQuotes([]);
      })
      .finally(() => {
        if (!ignore) setWatchlistLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [watchlistSymbols]);

  const addToWatchlist = () => {
    const incoming = watchlistInput
      .split(",")
      .map((s) => s.trim().toUpperCase())
      .filter((s) => s && TICKER_RE.test(s));
    if (incoming.length === 0) return;
    setWatchlistSymbols((prev) =>
      [...new Set([...prev, ...incoming])].slice(0, 10),
    );
    setWatchlistInput("");
  };

  const removeFromWatchlist = (sym: string) => {
    setWatchlistSymbols((prev) => prev.filter((s) => s !== sym));
  };

  const handleExportPlanPdf = async () => {
    const normalizePdfText = (value?: string) => {
      if (!value) return "-";
      return (
        value
          .normalize("NFKC")
          .replace(/[\u0100-\uFFFF]/g, "")
          .replace(/[\u0000-\u001F\u007F-\u009F]/g, " ")
          .replace(/\s{2,}/g, " ")
          .trim() || "-"
      );
    };

    const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
      import("jspdf"),
      import("jspdf-autotable"),
    ]);

    const doc = new jsPDF({ unit: "pt", format: "a4" });
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text(normalizePdfText("DCA Plan Summary"), 40, 44);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(
      normalizePdfText(
        `Currency: ${currency.code} | Horizon: ${projection.yearsNum} years`,
      ),
      40,
      64,
    );
    doc.text(
      normalizePdfText(
        `Initial: ${formatCurrency(projection.principal, currency.code)} | Monthly: ${formatCurrency(projection.monthlyContribution, currency.code)}`,
      ),
      40,
      80,
    );
    doc.text(
      normalizePdfText(
        `Expected return: ${projection.annualReturnPercent}% | Step-up: ${projection.annualStepUpPercent}%`,
      ),
      40,
      96,
    );

    autoTable(doc, {
      startY: 120,
      head: [["Metric", "Value"]],
      body: [
        [
          "Future Value",
          formatCurrency(projection.totalFutureValue, currency.code),
        ],
        [
          "Total Contributions",
          formatCurrency(projection.totalContributions, currency.code),
        ],
        [
          "Estimated Gain",
          formatCurrency(projection.estimatedGain, currency.code),
        ],
        [
          "Required Monthly DCA",
          formatCurrency(projection.requiredMonthly, currency.code),
        ],
        ["Plan Status", normalizePdfText(projection.planStatus)],
      ],
      styles: { fontSize: 9 },
      headStyles: { fillColor: [15, 23, 42] },
    });

    const lastAutoTableY = (doc as { lastAutoTable?: { finalY?: number } })
      .lastAutoTable?.finalY;

    autoTable(doc, {
      startY: (lastAutoTableY ?? 120) + 18,
      head: [["Month", "Contribution", "Cumulative", "Est. Value"]],
      body: projection.monthlyRows.map((row) => [
        String(row.month),
        formatCurrency(row.contribution, currency.code),
        formatCurrency(row.totalContributions, currency.code),
        formatCurrency(row.portfolioValue, currency.code),
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [14, 165, 233] },
    });

    doc.save(`dca_plan_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <PageShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">{t.investment.dcaTitle}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {t.investment.dcaSubtitle}
            </p>
          </div>
          <Button variant="soft" onClick={handleExportPlanPdf}>
            {ui.exportPdf}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t.investment.planInputs}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-1.5 text-sm md:col-span-2">
                <span className="text-muted-foreground">{ui.planType}</span>
                <div className="grid gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setPlanProfileId("core")}
                    className={`rounded-xl border p-3 text-left transition-colors ${
                      planProfileId === "core"
                        ? "border-accent bg-accent/10"
                        : "border-border bg-white hover:border-accent/40"
                    }`}
                  >
                    <p className="text-sm font-semibold">{ui.planCore}</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPlanProfileId("global-equity")}
                    className={`rounded-xl border p-3 text-left transition-colors ${
                      planProfileId === "global-equity"
                        ? "border-accent bg-accent/10"
                        : "border-border bg-white hover:border-accent/40"
                    }`}
                  >
                    <p className="text-sm font-semibold">
                      {ui.planGlobalEquity}
                    </p>
                  </button>
                </div>
              </label>

              <label className="space-y-1.5 text-sm md:col-span-2">
                <span className="text-muted-foreground">{ui.riskProfile}</span>
                <div className="grid gap-2 sm:grid-cols-3">
                  {RISK_PRESETS.map((preset) => {
                    const selected = preset.id === riskPresetId;
                    const label =
                      locale === "th" ? preset.labelTh : preset.labelEn;

                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => applyRiskPreset(preset)}
                        className={`rounded-xl border p-3 text-left transition-colors ${
                          selected
                            ? "border-accent bg-accent/10"
                            : "border-border bg-white hover:border-accent/40"
                        }`}
                      >
                        <p className="text-sm font-semibold">{label}</p>
                        <p className="text-xs text-muted-foreground">
                          {locale === "th"
                            ? "ผลตอบแทนคาดหวัง"
                            : "Expected return"}{" "}
                          {preset.annualReturn}%
                        </p>
                      </button>
                    );
                  })}
                </div>
              </label>

              <label className="space-y-1.5 text-sm">
                <span className="text-muted-foreground">
                  {t.investment.initialInvestment}
                </span>
                <input
                  type="number"
                  min="0"
                  value={initialAmount}
                  onChange={(event) => setInitialAmount(event.target.value)}
                  className="h-11 w-full rounded-lg border border-border bg-white px-3 outline-none focus:ring-2 focus:ring-accent"
                />
              </label>

              <label className="space-y-1.5 text-sm">
                <span className="text-muted-foreground">
                  {t.investment.monthlyDcaAmount}
                </span>
                <input
                  type="number"
                  min="0"
                  value={monthlyAmount}
                  onChange={(event) => setMonthlyAmount(event.target.value)}
                  className="h-11 w-full rounded-lg border border-border bg-white px-3 outline-none focus:ring-2 focus:ring-accent"
                />
              </label>

              <label className="space-y-1.5 text-sm">
                <span className="text-muted-foreground">
                  {t.investment.expectedAnnualReturn}
                </span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={annualReturn}
                  onChange={(event) => setAnnualReturn(event.target.value)}
                  className="h-11 w-full rounded-lg border border-border bg-white px-3 outline-none focus:ring-2 focus:ring-accent"
                />
              </label>

              <label className="space-y-1.5 text-sm">
                <span className="text-muted-foreground">
                  {t.investment.investmentHorizonYears}
                </span>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={years}
                  onChange={(event) => setYears(event.target.value)}
                  className="h-11 w-full rounded-lg border border-border bg-white px-3 outline-none focus:ring-2 focus:ring-accent"
                />
              </label>

              <label className="space-y-1.5 text-sm">
                <span className="text-muted-foreground">{ui.annualStepUp}</span>
                <input
                  type="number"
                  min="0"
                  max="50"
                  step="0.1"
                  value={annualStepUp}
                  onChange={(event) => setAnnualStepUp(event.target.value)}
                  className="h-11 w-full rounded-lg border border-border bg-white px-3 outline-none focus:ring-2 focus:ring-accent"
                />
              </label>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">
                {t.investment.futureValue}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {formatCurrency(projection.totalFutureValue, currency.code)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">
                {t.investment.totalContributions}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {formatCurrency(projection.totalContributions, currency.code)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">
                {t.investment.estimatedGain}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p
                className={`text-2xl font-bold ${
                  projection.estimatedGain >= 0 ? "text-success" : "text-danger"
                }`}
              >
                {formatCurrency(projection.estimatedGain, currency.code)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">
                {t.investment.planStatus}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p
                className={`text-xl font-bold ${
                  projection.monthlyGap >= 0 ? "text-success" : "text-warning"
                }`}
              >
                {projection.planStatus}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{ui.goalPlanner}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-1.5 text-sm">
                <span className="text-muted-foreground">{ui.targetAmount}</span>
                <input
                  type="number"
                  min="0"
                  value={goalAmount}
                  onChange={(event) => setGoalAmount(event.target.value)}
                  className="h-11 w-full rounded-lg border border-border bg-white px-3 outline-none focus:ring-2 focus:ring-accent"
                />
              </label>

              <div className="rounded-xl border border-border bg-white p-4">
                <p className="text-sm text-muted-foreground">
                  {ui.requiredMonthly}
                </p>
                <p className="mt-1 text-2xl font-bold text-accent">
                  {formatCurrency(projection.requiredMonthly, currency.code)}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {ui.yourPlanGap}
                </p>
                <p
                  className={`text-base font-semibold ${
                    projection.monthlyGap >= 0 ? "text-success" : "text-warning"
                  }`}
                >
                  {projection.monthlyGap >= 0 ? "+" : ""}
                  {formatCurrency(projection.monthlyGap, currency.code)}
                </p>
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-3">
              {[
                {
                  label: locale === "th" ? "หุ้น" : "Equity",
                  value: currentPreset.allocation.equity,
                },
                {
                  label: locale === "th" ? "ตราสารหนี้" : "Bond",
                  value: currentPreset.allocation.bond,
                },
                {
                  label: locale === "th" ? "เงินสด" : "Cash",
                  value: currentPreset.allocation.cash,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl border border-border bg-white p-3"
                >
                  <p className="text-xs text-muted-foreground">
                    {ui.allocationMix}
                  </p>
                  <p className="mt-1 text-sm font-medium">{item.label}</p>
                  <p className="text-lg font-bold">{item.value}%</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{ui.suggestedBasket}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {suggestionsLoading ? (
              <p className="text-sm text-muted-foreground">
                Loading suggestions...
              </p>
            ) : suggestions.length === 0 ? (
              <p className="text-sm text-danger">
                {suggestionsError || ui.noSuggestionData}
              </p>
            ) : (
              <div className="space-y-3">
                {suggestions.map((item) => {
                  const monthlyBuyAmount =
                    (projection.monthlyContribution * item.weightPct) / 100;

                  return (
                    <div
                      key={item.symbol}
                      className="rounded-xl border border-border bg-white p-4"
                    >
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-base font-semibold">
                            {item.symbol} · {item.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {item.assetClass} · {item.weightPct}%
                          </p>
                        </div>
                        <div className="text-left sm:text-right">
                          <p className="text-sm text-muted-foreground">
                            {ui.monthlyBuyPlan}
                          </p>
                          <p className="text-lg font-bold text-accent">
                            {formatCurrency(monthlyBuyAmount, currency.code)}
                          </p>
                        </div>
                      </div>

                      <div className="mt-2 flex flex-wrap gap-3 text-xs">
                        <span className="rounded-full bg-muted px-3 py-1 text-muted-foreground">
                          {item.price == null
                            ? "-"
                            : `Price: ${item.price.toFixed(2)}`}
                        </span>
                        <span
                          className={`rounded-full px-3 py-1 ${
                            (item.changePct || 0) >= 0
                              ? "bg-success/15 text-success"
                              : "bg-danger/15 text-danger"
                          }`}
                        >
                          {item.changePct == null
                            ? "Change: -"
                            : `Change: ${item.changePct >= 0 ? "+" : ""}${item.changePct.toFixed(2)}%`}
                        </span>
                      </div>

                      <p className="mt-2 text-sm text-muted-foreground">
                        {item.reason}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              {ui.notFinancialAdvice}
            </p>
          </CardContent>
        </Card>

        {planProfileId === "global-equity" && (
          <Card>
            <CardHeader>
              <CardTitle>{ui.regionalBreakdown}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {GLOBAL_EQUITY_REGIONAL[riskPresetId].map((zone) => (
                <div
                  key={zone.zone}
                  className="rounded-xl border border-border bg-white p-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-sm font-semibold">
                        {locale === "th" ? zone.zoneNameTh : zone.zoneNameEn}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {locale === "th"
                          ? zone.descriptionTh
                          : zone.descriptionEn}
                      </p>
                    </div>
                    <span className="shrink-0 text-xl font-bold text-accent">
                      {zone.weightPct}%
                    </span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-accent"
                      style={{ width: `${zone.weightPct}%` }}
                    />
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <span className="text-xs text-muted-foreground">
                      {ui.exampleEtfs}:
                    </span>
                    {zone.exampleEtfs.map((etf) => (
                      <span
                        key={etf}
                        className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium"
                      >
                        {etf}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>{t.investment.yearlyProjection}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {projection.milestones.map((milestone) => (
                <div key={milestone.year} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span>
                      {t.investment.yearLabel} {milestone.year}
                    </span>
                    <span className="font-semibold">
                      {formatCurrency(milestone.value, currency.code)}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-accent"
                      style={{
                        width: `${Math.min((milestone.year / projection.yearsNum) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{ui.comparePlans}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              {scenarios.byPreset.map((scenario) => (
                <div
                  key={scenario.preset.id}
                  className="rounded-xl border border-border bg-white p-3"
                >
                  <p className="text-sm font-semibold">
                    {locale === "th"
                      ? scenario.preset.labelTh
                      : scenario.preset.labelEn}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {ui.expectedReturn}: {scenario.preset.annualReturn}%
                  </p>
                  <p className="mt-2 text-base font-bold">
                    {formatCurrency(scenario.finalValue, currency.code)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {ui.finalValue}
                  </p>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              {Array.from({ length: scenarios.yearsNum }).map((_, index) => {
                const year = index + 1;
                return (
                  <div key={year} className="space-y-1">
                    <p className="text-xs text-muted-foreground">
                      {t.investment.yearLabel} {year}
                    </p>
                    <div className="space-y-1.5">
                      {scenarios.byPreset.map((scenario, scenarioIndex) => {
                        const value = scenario.yearlyRows[index]?.value ?? 0;
                        const widthPct = (value / scenarios.maxValue) * 100;
                        const barColor =
                          scenarioIndex === 0
                            ? "bg-emerald-500"
                            : scenarioIndex === 1
                              ? "bg-sky-500"
                              : "bg-violet-500";
                        return (
                          <div key={scenario.preset.id} className="space-y-1">
                            <div className="flex items-center justify-between text-[11px]">
                              <span>
                                {locale === "th"
                                  ? scenario.preset.labelTh
                                  : scenario.preset.labelEn}
                              </span>
                              <span>
                                {formatCurrency(value, currency.code)}
                              </span>
                            </div>
                            <div className="h-2 rounded-full bg-muted">
                              <div
                                className={`h-full rounded-full ${barColor}`}
                                style={{ width: `${Math.max(2, widthPct)}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{ui.dcaSchedule}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1.5 text-sm">
              <span className="text-muted-foreground">{ui.dcaDay}</span>
              <input
                type="number"
                min="1"
                max="28"
                value={dcaDay}
                onChange={(event) => setDcaDay(event.target.value)}
                className="h-11 w-full rounded-lg border border-border bg-white px-3 outline-none focus:ring-2 focus:ring-accent"
              />
            </label>

            <div className="rounded-xl border border-border bg-white p-4">
              <label className="mb-2 flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={reminderEnabled}
                  onChange={(event) => setReminderEnabled(event.target.checked)}
                />
                <span>{ui.reminder}</span>
              </label>
              <p className="text-sm text-muted-foreground">{ui.nextRun}</p>
              <p className="text-lg font-bold text-foreground">
                {schedule.nextRun.toLocaleDateString(
                  locale === "th" ? "th-TH" : "en-US",
                  {
                    weekday: "short",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  },
                )}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {reminderEnabled
                  ? locale === "th"
                    ? "ระบบจะเตือนก่อนวันลงทุน 1 วัน"
                    : "Reminder will trigger one day before DCA date"
                  : locale === "th"
                    ? "ปิดการแจ้งเตือนอยู่"
                    : "Reminder disabled"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{ui.yearOnePlan}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground">
                    <th className="pb-2 pr-4 font-medium">{ui.month}</th>
                    <th className="pb-2 pr-4 font-medium">{ui.contribution}</th>
                    <th className="pb-2 pr-4 font-medium">{ui.cumulative}</th>
                    <th className="pb-2 font-medium">{ui.portfolio}</th>
                  </tr>
                </thead>
                <tbody>
                  {projection.monthlyRows.map((row) => (
                    <tr key={row.month} className="border-t border-border/70">
                      <td className="py-2 pr-4">{row.month}</td>
                      <td className="py-2 pr-4">
                        {formatCurrency(row.contribution, currency.code)}
                      </td>
                      <td className="py-2 pr-4">
                        {formatCurrency(row.totalContributions, currency.code)}
                      </td>
                      <td className="py-2 font-medium">
                        {formatCurrency(row.portfolioValue, currency.code)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{ui.watchlistTitle}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Input row */}
            <div className="flex gap-2">
              <input
                type="text"
                value={watchlistInput}
                onChange={(e) => setWatchlistInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") addToWatchlist();
                }}
                placeholder={ui.watchlistPlaceholder}
                className="h-11 flex-1 rounded-lg border border-border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-accent"
              />
              <Button variant="soft" onClick={addToWatchlist}>
                {ui.watchlistAdd}
              </Button>
            </div>

            {/* Symbol chips */}
            {watchlistSymbols.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {watchlistSymbols.map((sym) => (
                  <span
                    key={sym}
                    className="flex items-center gap-1.5 rounded-full border border-border bg-muted px-3 py-1 text-sm font-medium"
                  >
                    {sym}
                    <button
                      type="button"
                      onClick={() => removeFromWatchlist(sym)}
                      className="text-muted-foreground hover:text-danger"
                      aria-label={`Remove ${sym}`}
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Quote cards */}
            {watchlistSymbols.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {ui.watchlistEmpty}
              </p>
            ) : watchlistLoading ? (
              <p className="text-sm text-muted-foreground">
                {ui.watchlistFetching}
              </p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {watchlistQuotes.map((q) => (
                  <div
                    key={q.symbol}
                    className="rounded-xl border border-border bg-white p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-base font-semibold">{q.symbol}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {q.name !== q.symbol ? q.name : ui.watchlistNoData}
                        </p>
                      </div>
                    </div>
                    <p className="mt-2 text-xl font-bold">
                      {q.price == null
                        ? "–"
                        : `${q.currency ? q.currency + " " : ""}${q.price.toFixed(2)}`}
                    </p>
                    <p
                      className={`text-sm font-medium ${
                        (q.changePct ?? 0) >= 0 ? "text-success" : "text-danger"
                      }`}
                    >
                      {q.changePct == null
                        ? "–"
                        : `${q.changePct >= 0 ? "+" : ""}${q.changePct.toFixed(2)}%`}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
