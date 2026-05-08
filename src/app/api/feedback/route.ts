import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 5;
const submissionBuckets = new Map<string, number[]>();

const feedbackPayloadSchema = z.object({
  name: z.string().trim().max(80).optional(),
  email: z.string().trim().email().optional(),
  category: z.enum(["bug", "feature", "ux", "other"]),
  message: z.string().trim().min(10).max(2000),
  locale: z.enum(["en", "th"]).optional(),
  website: z.string().optional(),
  startedAt: z.number().int().positive().optional(),
});

const getClientIp = (req: NextRequest) => {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    return xff.split(",")[0]?.trim() || "unknown";
  }
  return req.headers.get("x-real-ip") || "unknown";
};

const isRateLimited = (ip: string, now: number) => {
  const windowStart = now - RATE_LIMIT_WINDOW_MS;
  const history = submissionBuckets.get(ip) ?? [];
  const recent = history.filter((ts) => ts >= windowStart);

  if (recent.length >= RATE_LIMIT_MAX_REQUESTS) {
    submissionBuckets.set(ip, recent);
    return true;
  }

  recent.push(now);
  submissionBuckets.set(ip, recent);
  return false;
};

export async function POST(req: NextRequest) {
  const now = Date.now();
  const body = await req.json().catch(() => null);
  const parsed = feedbackPayloadSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid feedback payload." },
      { status: 400 },
    );
  }

  // Honeypot: real users should never fill this field.
  if (parsed.data.website && parsed.data.website.trim().length > 0) {
    return NextResponse.json({ success: true });
  }

  // Basic bot check: form submitted too quickly.
  if (parsed.data.startedAt && now - parsed.data.startedAt < 1500) {
    return NextResponse.json({ error: "Suspicious submission." }, { status: 400 });
  }

  const clientIp = getClientIp(req);
  if (isRateLimited(clientIp, now)) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 },
    );
  }

  const appsScriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL;
  if (!appsScriptUrl) {
    return NextResponse.json(
      { error: "GOOGLE_APPS_SCRIPT_URL is not configured." },
      { status: 500 },
    );
  }

  const payload = {
    ...parsed.data,
    submittedAt: new Date().toISOString(),
    userAgent: req.headers.get("user-agent") ?? "unknown",
    clientIp,
  };

  const upstream = await fetch(appsScriptUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    redirect: "follow",
    cache: "no-store",
  }).catch(() => null);

  if (!upstream || !upstream.ok) {
    return NextResponse.json(
      { error: "Failed to send feedback." },
      { status: 502 },
    );
  }

  return NextResponse.json({ success: true });
}
