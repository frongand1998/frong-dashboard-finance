import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import yahooFinance from "yahoo-finance2";

const yf = new yahooFinance();

type QuoteFull = {
  longName?: string | null;
  shortName?: string | null;
  regularMarketPrice?: number;
  regularMarketChangePercent?: number;
  currency?: string | null;
};

type QuoteView = {
  symbol: string;
  name: string;
  price: number | null;
  changePct: number | null;
  currency: string | null;
};

async function safeQuote(symbol: string): Promise<QuoteFull | null> {
  try {
    const q = await yf.quote(symbol);
    return {
      longName: q.longName,
      shortName: q.shortName,
      regularMarketPrice: q.regularMarketPrice,
      regularMarketChangePercent: q.regularMarketChangePercent,
      currency: q.currency,
    };
  } catch {
    return null;
  }
}

async function fetchYahooBatch(symbols: string[]) {
  const map = new Map<
    string,
    { price: number | null; changePct: number | null; currency: string | null }
  >();

  if (symbols.length === 0) return map;

  try {
    const res = await fetch(
      `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbols.join(","))}`,
      {
        cache: "no-store",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
          Accept: "application/json, text/plain, */*",
        },
      },
    );
    if (!res.ok) return map;

    const payload = (await res.json()) as {
      quoteResponse?: {
        result?: Array<{
          symbol?: string;
          regularMarketPrice?: number;
          regularMarketChangePercent?: number;
          currency?: string;
        }>;
      };
    };

    for (const row of payload.quoteResponse?.result ?? []) {
      if (!row.symbol) continue;
      map.set(row.symbol.toUpperCase(), {
        price: row.regularMarketPrice ?? null,
        changePct: row.regularMarketChangePercent ?? null,
        currency: row.currency ?? null,
      });
    }
  } catch {
    // Ignore and fallback to other providers.
  }

  return map;
}

async function fetchStooqQuote(symbol: string) {
  try {
    const res = await fetch(
      `https://stooq.com/q/l/?s=${encodeURIComponent(symbol.toLowerCase())}.us&i=d`,
      { cache: "no-store" },
    );
    if (!res.ok) return null;

    const csv = await res.text();
    const lines = csv.trim().split("\n");
    if (lines.length < 2) return null;
    const values = lines[1].split(",");
    const closeRaw = values[6];
    const close = Number(closeRaw);
    if (!Number.isFinite(close) || close <= 0) return null;

    return {
      price: close,
      changePct: null,
      currency: "USD",
    };
  } catch {
    return null;
  }
}

// Allow standard ticker characters: letters, digits, dot, dash, caret
const SYMBOL_RE = /^[A-Z0-9.\-^]{1,12}$/;
const MAX_SYMBOLS = 10;

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const symbolsParam = req.nextUrl.searchParams.get("symbols") || "";
  const rawSymbols = symbolsParam
    .split(",")
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean);

  const valid = rawSymbols
    .slice(0, MAX_SYMBOLS)
    .filter((s) => SYMBOL_RE.test(s));

  if (valid.length === 0) {
    return NextResponse.json({ asOf: new Date().toISOString(), quotes: [] });
  }

  const initial = await Promise.all(
    valid.map(async (sym): Promise<QuoteView> => {
      const q = await safeQuote(sym);
      return {
        symbol: sym,
        name: q?.longName || q?.shortName || sym,
        price: q?.regularMarketPrice ?? null,
        changePct: q?.regularMarketChangePercent ?? null,
        currency: q?.currency ?? null,
      };
    }),
  );

  const missingSymbols = initial
    .filter((row) => row.price == null)
    .map((row) => row.symbol);
  const yahooBatchMap = await fetchYahooBatch(missingSymbols);

  const results = await Promise.all(
    initial.map(async (row): Promise<QuoteView> => {
      if (row.price != null) return row;

      const yahooBatch = yahooBatchMap.get(row.symbol);
      if (yahooBatch?.price != null) {
        return {
          ...row,
          price: yahooBatch.price,
          changePct: yahooBatch.changePct,
          currency: yahooBatch.currency,
        };
      }

      const stooq = await fetchStooqQuote(row.symbol);
      if (stooq?.price != null) {
        return {
          ...row,
          price: stooq.price,
          changePct: stooq.changePct,
          currency: stooq.currency,
        };
      }

      return row;
    }),
  );

  return NextResponse.json({ asOf: new Date().toISOString(), quotes: results });
}
