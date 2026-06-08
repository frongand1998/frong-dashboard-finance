import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import yahooFinance from "yahoo-finance2";

const yf = new yahooFinance();

type QuoteSnippet = {
  regularMarketPrice?: number;
  regularMarketChangePercent?: number;
};

async function safeQuote(symbol: string): Promise<QuoteSnippet | null> {
  try {
    const q = await yf.quote(symbol);
    return {
      regularMarketPrice: q.regularMarketPrice,
      regularMarketChangePercent: q.regularMarketChangePercent,
    };
  } catch {
    return null;
  }
}

type RiskProfile = "stable" | "balanced" | "growth";
type PlanProfile = "core" | "global-equity";
type Locale = "en" | "th";

type BaseRecommendation = {
  symbol: string;
  name: string;
  assetClass: string;
  weightPct: number;
  reasonEn: string;
  reasonTh: string;
};

const CORE_RECOMMENDATIONS: Record<RiskProfile, BaseRecommendation[]> = {
  stable: [
    {
      symbol: "BND",
      name: "Vanguard Total Bond Market ETF",
      assetClass: "Bond",
      weightPct: 40,
      reasonEn: "Core bond exposure to reduce volatility.",
      reasonTh: "แกนหลักตราสารหนี้ ช่วยลดความผันผวนพอร์ต",
    },
    {
      symbol: "AGG",
      name: "iShares Core U.S. Aggregate Bond ETF",
      assetClass: "Bond",
      weightPct: 20,
      reasonEn: "Diversified fixed-income complement.",
      reasonTh: "เสริมความหลากหลายฝั่งตราสารหนี้",
    },
    {
      symbol: "VTI",
      name: "Vanguard Total Stock Market ETF",
      assetClass: "Equity",
      weightPct: 25,
      reasonEn: "Broad equity exposure for long-term growth.",
      reasonTh: "หุ้นกว้างทั้งตลาด เพื่อโอกาสเติบโตระยะยาว",
    },
    {
      symbol: "SGOV",
      name: "iShares 0-3 Month Treasury Bond ETF",
      assetClass: "Cash-like",
      weightPct: 15,
      reasonEn: "Liquidity buffer for near-term needs.",
      reasonTh: "กันเงินสภาพคล่องสำหรับระยะสั้น",
    },
  ],
  balanced: [
    {
      symbol: "VTI",
      name: "Vanguard Total Stock Market ETF",
      assetClass: "Equity",
      weightPct: 40,
      reasonEn: "Core U.S. market exposure.",
      reasonTh: "หุ้นสหรัฐแบบครอบคลุมทั้งตลาด",
    },
    {
      symbol: "VXUS",
      name: "Vanguard Total International Stock ETF",
      assetClass: "Equity",
      weightPct: 20,
      reasonEn: "International diversification beyond U.S.",
      reasonTh: "กระจายความเสี่ยงต่างประเทศนอกสหรัฐ",
    },
    {
      symbol: "BND",
      name: "Vanguard Total Bond Market ETF",
      assetClass: "Bond",
      weightPct: 30,
      reasonEn: "Stabilizes portfolio drawdowns.",
      reasonTh: "ลดแรงเหวี่ยงพอร์ตในช่วงตลาดผันผวน",
    },
    {
      symbol: "VNQ",
      name: "Vanguard Real Estate ETF",
      assetClass: "REIT",
      weightPct: 10,
      reasonEn: "Adds real-asset income diversification.",
      reasonTh: "เพิ่มสินทรัพย์จริงและโอกาสรายได้ปันผล",
    },
  ],
  growth: [
    {
      symbol: "VTI",
      name: "Vanguard Total Stock Market ETF",
      assetClass: "Equity",
      weightPct: 45,
      reasonEn: "Broad growth engine for long horizon.",
      reasonTh: "แกนเติบโตหลักสำหรับระยะยาว",
    },
    {
      symbol: "QQQ",
      name: "Invesco QQQ Trust",
      assetClass: "Growth Equity",
      weightPct: 25,
      reasonEn: "Higher-growth tilt via large-cap tech.",
      reasonTh: "เพิ่มน้ำหนักหุ้นเติบโตสูง โดยเฉพาะกลุ่มเทค",
    },
    {
      symbol: "VXUS",
      name: "Vanguard Total International Stock ETF",
      assetClass: "Equity",
      weightPct: 20,
      reasonEn: "Geographic diversification for resilience.",
      reasonTh: "กระจายภูมิภาคเพื่อเพิ่มความทนทานของพอร์ต",
    },
    {
      symbol: "BND",
      name: "Vanguard Total Bond Market ETF",
      assetClass: "Bond",
      weightPct: 10,
      reasonEn: "Small bond sleeve to reduce downside shocks.",
      reasonTh: "ถือพันธบัตรเล็กน้อยเพื่อลดแรงกระแทกขาลง",
    },
  ],
};

const GLOBAL_EQUITY_RECOMMENDATIONS: Record<RiskProfile, BaseRecommendation[]> =
  {
    stable: [
      {
        symbol: "VT",
        name: "Vanguard Total World Stock ETF",
        assetClass: "Global Equity",
        weightPct: 45,
        reasonEn: "Single ETF for broad global stock coverage.",
        reasonTh: "ETF เดียวที่ครอบคลุมหุ้นทั่วโลกแบบกระจายตัว",
      },
      {
        symbol: "SCHD",
        name: "Schwab U.S. Dividend Equity ETF",
        assetClass: "Dividend Equity",
        weightPct: 20,
        reasonEn: "Quality dividend tilt with lower volatility profile.",
        reasonTh: "เพิ่มหุ้นคุณภาพจ่ายปันผล ลดความผันผวนสัมพัทธ์",
      },
      {
        symbol: "QQQM",
        name: "Invesco NASDAQ 100 ETF",
        assetClass: "Growth Equity",
        weightPct: 15,
        reasonEn: "Measured growth allocation to global innovation leaders.",
        reasonTh: "เพิ่มน้ำหนักหุ้นเติบโตในกลุ่มผู้นำนวัตกรรมโลก",
      },
      {
        symbol: "BND",
        name: "Vanguard Total Bond Market ETF",
        assetClass: "Bond",
        weightPct: 20,
        reasonEn: "Safety sleeve for drawdown control.",
        reasonTh: "กันส่วนปลอดภัยเพื่อลดความเสี่ยงขาลง",
      },
    ],
    balanced: [
      {
        symbol: "VT",
        name: "Vanguard Total World Stock ETF",
        assetClass: "Global Equity",
        weightPct: 50,
        reasonEn: "Global core equity allocation across regions.",
        reasonTh: "แกนหุ้นโลกแบบกระจายภูมิภาคครบ",
      },
      {
        symbol: "QQQM",
        name: "Invesco NASDAQ 100 ETF",
        assetClass: "Growth Equity",
        weightPct: 20,
        reasonEn: "Growth tilt from large-cap U.S. innovators.",
        reasonTh: "เพิ่มน้ำหนักหุ้นเติบโตสูงกลุ่มเทคขนาดใหญ่",
      },
      {
        symbol: "VEA",
        name: "Vanguard FTSE Developed Markets ETF",
        assetClass: "Developed ex-US Equity",
        weightPct: 15,
        reasonEn: "Extra exposure to developed markets outside U.S.",
        reasonTh: "เพิ่มน้ำหนักตลาดพัฒนาแล้วนอกสหรัฐ",
      },
      {
        symbol: "BND",
        name: "Vanguard Total Bond Market ETF",
        assetClass: "Bond",
        weightPct: 15,
        reasonEn: "Bond ballast for smoother ride.",
        reasonTh: "มีตราสารหนี้ช่วยพยุงพอร์ตให้ผันผวนน้อยลง",
      },
    ],
    growth: [
      {
        symbol: "VT",
        name: "Vanguard Total World Stock ETF",
        assetClass: "Global Equity",
        weightPct: 40,
        reasonEn: "Global core equity exposure for structural growth.",
        reasonTh: "แกนหลักหุ้นโลกเพื่อการเติบโตระยะยาว",
      },
      {
        symbol: "QQQM",
        name: "Invesco NASDAQ 100 ETF",
        assetClass: "Growth Equity",
        weightPct: 30,
        reasonEn: "Higher growth tilt in global technology leaders.",
        reasonTh: "เน้นหุ้นเติบโตสูงในกลุ่มเทคระดับโลก",
      },
      {
        symbol: "SOXX",
        name: "iShares Semiconductor ETF",
        assetClass: "Thematic Equity",
        weightPct: 15,
        reasonEn: "Theme allocation to semiconductors cycle.",
        reasonTh: "เพิ่มธีมเซมิคอนดักเตอร์เพื่อรับวัฏจักรการเติบโต",
      },
      {
        symbol: "VXUS",
        name: "Vanguard Total International Stock ETF",
        assetClass: "International Equity",
        weightPct: 15,
        reasonEn: "Diversifies away from U.S.-only concentration.",
        reasonTh: "กระจายความเสี่ยงไม่ให้กระจุกเฉพาะสหรัฐ",
      },
    ],
  };

const PLAN_RECOMMENDATIONS: Record<
  PlanProfile,
  Record<RiskProfile, BaseRecommendation[]>
> = {
  core: CORE_RECOMMENDATIONS,
  "global-equity": GLOBAL_EQUITY_RECOMMENDATIONS,
};

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const risk = (req.nextUrl.searchParams.get("risk") ||
    "balanced") as RiskProfile;
  const plan = (req.nextUrl.searchParams.get("plan") || "core") as PlanProfile;
  const locale = (req.nextUrl.searchParams.get("locale") || "en") as Locale;

  const selectedPlan = PLAN_RECOMMENDATIONS[plan] || PLAN_RECOMMENDATIONS.core;
  const profile = selectedPlan[risk] || selectedPlan.balanced;

  const quoteMap = new Map<string, { price?: number; changePct?: number }>();

  try {
    const symbolList = profile.map((item) => item.symbol);
    const quotes = await Promise.all(symbolList.map(safeQuote));
    symbolList.forEach((sym, i) => {
      const q = quotes[i];
      if (q) {
        quoteMap.set(sym, {
          price: q.regularMarketPrice,
          changePct: q.regularMarketChangePercent,
        });
      }
    });
  } catch {
    // Gracefully degrade when quote lookup is unavailable.
  }

  return NextResponse.json({
    plan,
    risk,
    asOf: new Date().toISOString(),
    source: "Yahoo Finance public quote endpoint + curated allocation",
    recommendations: profile.map((item) => ({
      symbol: item.symbol,
      name: item.name,
      assetClass: item.assetClass,
      weightPct: item.weightPct,
      reason: locale === "th" ? item.reasonTh : item.reasonEn,
      price: quoteMap.get(item.symbol)?.price ?? null,
      changePct: quoteMap.get(item.symbol)?.changePct ?? null,
    })),
  });
}
