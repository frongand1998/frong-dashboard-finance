import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { runDueRecurringForUserWithClient } from "@/server-actions/recurring";
import type { SupabaseDatabase } from "@/lib/supabaseClient";

export async function POST(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json(
      { error: "CRON_SECRET is not configured." },
      { status: 500 },
    );
  }

  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;

  if (!token || token !== cronSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      { error: "Supabase service credentials are missing." },
      { status: 500 },
    );
  }

  const adminClient = createClient<SupabaseDatabase>(supabaseUrl, serviceRoleKey);

  const dueUsersResult = await adminClient
    .from("recurring_rules")
    .select("user_id")
    .eq("is_active", true)
    .lte("next_run_on", new Date().toISOString().slice(0, 10));

  if (dueUsersResult.error) {
    return NextResponse.json(
      { error: dueUsersResult.error.message },
      { status: 500 },
    );
  }

  const userIds = Array.from(
    new Set(
      (dueUsersResult.data ?? [])
        .map((row) => row.user_id)
        .filter((id): id is string => typeof id === "string" && id.length > 0),
    ),
  );

  let processedUsers = 0;
  let processedRules = 0;
  let createdTransactions = 0;
  let skippedDuplicates = 0;

  for (const userId of userIds) {
    const result = await runDueRecurringForUserWithClient(adminClient, userId);
    if (!result.success) {
      continue;
    }
    processedUsers += 1;
    processedRules += result.processedRules;
    createdTransactions += result.createdTransactions;
    skippedDuplicates += result.skippedDuplicates;
  }

  return NextResponse.json({
    success: true,
    processedUsers,
    processedRules,
    createdTransactions,
    skippedDuplicates,
  });
}
