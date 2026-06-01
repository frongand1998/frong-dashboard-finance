"use server";

import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";
import type { SupabaseDatabase } from "@/lib/supabaseClient";
import {
  recurringRuleSchema,
  type RecurringRuleFormData,
} from "@/lib/validators/recurring";
import { getAnchorDay, getNextRunDate, todayIso } from "@/lib/recurring";
import type { RecurringRule } from "@/types";

type AnySupabase = NonNullable<typeof supabase>;

type RunResult = {
  processedRules: number;
  createdTransactions: number;
  skippedDuplicates: number;
};

function getServerSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (supabaseUrl && serviceRoleKey) {
    return createClient<SupabaseDatabase>(supabaseUrl, serviceRoleKey);
  }

  return supabase;
}

function getRecurringContextError(
  userId: string | null | undefined,
  client: AnySupabase | null,
) {
  if (!userId) return "Unauthorized";
  if (!client) return "Database connection failed";
  return null;
}

const markerFor = (ruleId: string, runDate: string) =>
  `[#recurring:${ruleId}:${runDate}]`;

async function processRecurringRules(
  client: AnySupabase,
  userId: string,
  rules: RecurringRule[],
): Promise<RunResult> {
  const today = todayIso();
  let processedRules = 0;
  let createdTransactions = 0;
  let skippedDuplicates = 0;

  for (const rule of rules) {
    if (!rule.is_active) continue;
    let runDate = rule.next_run_on;
    if (!runDate || runDate > today) continue;

    processedRules += 1;
    let safety = 0;
    let lastRunOn = rule.last_run_on ?? null;

    while (runDate <= today && safety < 60) {
      const marker = markerFor(rule.id, runDate);
      const note = [rule.note?.trim(), marker].filter(Boolean).join(" ");

      const existing = await client
        .from("transactions")
        .select("id")
        .eq("user_id", userId)
        .eq("date", runDate)
        .eq("note", note)
        .limit(1)
        .maybeSingle();

      if (!existing.error && !existing.data) {
        const created = await client.from("transactions").insert({
          user_id: userId,
          type: rule.type,
          category: rule.category,
          amount: rule.amount,
          date: runDate,
          note,
        });

        if (!created.error) {
          createdTransactions += 1;
          lastRunOn = runDate;
        }
      } else {
        skippedDuplicates += 1;
      }

      runDate = getNextRunDate(
        runDate,
        rule.frequency,
        rule.anchor_day ?? undefined,
      );
      safety += 1;
    }

    await client
      .from("recurring_rules")
      .update({
        next_run_on: runDate,
        last_run_on: lastRunOn,
        updated_at: new Date().toISOString(),
      })
      .eq("id", rule.id)
      .eq("user_id", userId);
  }

  return { processedRules, createdTransactions, skippedDuplicates };
}

export async function getRecurringRules() {
  try {
    const { userId } = await auth();
    const client = getServerSupabaseClient();
    const contextError = getRecurringContextError(userId, client);

    if (contextError) {
      return {
        success: false,
        error: contextError,
        data: [] as RecurringRule[],
      };
    }

    const { data, error } = await client
      .from("recurring_rules")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error)
      return {
        success: false,
        error: error.message,
        data: [] as RecurringRule[],
      };
    return { success: true, data: (data ?? []) as RecurringRule[] };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to load recurring rules",
      data: [] as RecurringRule[],
    };
  }
}

export async function createRecurringRule(payload: RecurringRuleFormData) {
  try {
    const { userId } = await auth();
    const client = getServerSupabaseClient();
    const contextError = getRecurringContextError(userId, client);

    if (contextError) {
      return { success: false, error: contextError };
    }

    const data = recurringRuleSchema.parse(payload);
    const anchorDay =
      data.frequency === "monthly" ? getAnchorDay(data.startDate) : null;

    const { data: result, error } = await client
      .from("recurring_rules")
      .insert({
        user_id: userId,
        name: data.name,
        type: data.type,
        category: data.category,
        amount: data.amount,
        frequency: data.frequency,
        start_date: data.startDate,
        next_run_on: data.startDate,
        note: data.note || null,
        is_active: data.isActive,
        anchor_day: anchorDay,
      })
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: result as RecurringRule };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create recurring rule",
    };
  }
}

export async function updateRecurringRule(
  id: string,
  payload: RecurringRuleFormData,
) {
  try {
    const { userId } = await auth();
    const client = getServerSupabaseClient();
    const contextError = getRecurringContextError(userId, client);

    if (contextError) {
      return { success: false, error: contextError };
    }

    const data = recurringRuleSchema.parse(payload);
    const anchorDay =
      data.frequency === "monthly" ? getAnchorDay(data.startDate) : null;

    const { data: existingRule, error: getError } = await client
      .from("recurring_rules")
      .select("start_date, frequency, next_run_on")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (getError || !existingRule) {
      return {
        success: false,
        error: getError?.message || "Recurring rule not found",
      };
    }

    const shouldResetNextRun =
      existingRule.start_date !== data.startDate ||
      existingRule.frequency !== data.frequency;

    const nextRunOn = shouldResetNextRun
      ? data.startDate
      : existingRule.next_run_on;

    const { data: result, error } = await client
      .from("recurring_rules")
      .update({
        name: data.name,
        type: data.type,
        category: data.category,
        amount: data.amount,
        frequency: data.frequency,
        start_date: data.startDate,
        next_run_on: nextRunOn,
        note: data.note || null,
        is_active: data.isActive,
        anchor_day: anchorDay,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: result as RecurringRule };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to update recurring rule",
    };
  }
}

export async function toggleRecurringRule(id: string, isActive: boolean) {
  try {
    const { userId } = await auth();
    const client = getServerSupabaseClient();
    const contextError = getRecurringContextError(userId, client);

    if (contextError) {
      return { success: false, error: contextError };
    }

    const { error } = await client
      .from("recurring_rules")
      .update({
        is_active: isActive,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", userId);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to update recurring rule",
    };
  }
}

export async function deleteRecurringRule(id: string) {
  try {
    const { userId } = await auth();
    const client = getServerSupabaseClient();
    const contextError = getRecurringContextError(userId, client);

    if (contextError) {
      return { success: false, error: contextError };
    }

    const { error } = await client
      .from("recurring_rules")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to delete recurring rule",
    };
  }
}

export async function runRecurringRuleNow(id: string) {
  try {
    const { userId } = await auth();
    const client = getServerSupabaseClient();
    const contextError = getRecurringContextError(userId, client);

    if (contextError) {
      return { success: false, error: contextError };
    }

    const { data: rule, error } = await client
      .from("recurring_rules")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    const recurringRule = (rule ?? null) as RecurringRule | null;

    if (error || !recurringRule) {
      return {
        success: false,
        error: error?.message || "Recurring rule not found",
      };
    }

    const runDate = todayIso();
    const marker = markerFor(recurringRule.id, runDate);
    const note = [recurringRule.note?.trim(), marker].filter(Boolean).join(" ");

    const { error: insertError } = await client.from("transactions").insert({
      user_id: userId,
      type: recurringRule.type,
      category: recurringRule.category,
      amount: recurringRule.amount,
      date: runDate,
      note,
    });

    if (insertError) {
      return { success: false, error: insertError.message };
    }

    const nextRunOn = getNextRunDate(
      runDate,
      recurringRule.frequency,
      recurringRule.anchor_day ?? undefined,
    );

    await client
      .from("recurring_rules")
      .update({
        next_run_on: nextRunOn,
        last_run_on: runDate,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", userId);

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to run recurring rule",
    };
  }
}

export async function runDueRecurringForCurrentUser() {
  try {
    const { userId } = await auth();
    const client = getServerSupabaseClient();
    const contextError = getRecurringContextError(userId, client);

    if (contextError) {
      return { success: false, error: contextError };
    }

    const { data, error } = await client
      .from("recurring_rules")
      .select("*")
      .eq("user_id", userId)
      .eq("is_active", true)
      .lte("next_run_on", todayIso())
      .order("next_run_on", { ascending: true });

    if (error) return { success: false, error: error.message };

    const summary = await processRecurringRules(
      client,
      userId,
      (data ?? []) as RecurringRule[],
    );

    return { success: true, ...summary };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to run due recurring rules",
    };
  }
}

export async function runDueRecurringForUserWithClient(
  client: AnySupabase,
  userId: string,
) {
  const { data, error } = await client
    .from("recurring_rules")
    .select("*")
    .eq("user_id", userId)
    .eq("is_active", true)
    .lte("next_run_on", todayIso())
    .order("next_run_on", { ascending: true });

  if (error) {
    return {
      success: false,
      error: error.message,
      processedRules: 0,
      createdTransactions: 0,
      skippedDuplicates: 0,
    };
  }

  const summary = await processRecurringRules(
    client,
    userId,
    (data ?? []) as RecurringRule[],
  );
  return { success: true, ...summary };
}
