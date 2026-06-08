"use server";

import { auth } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabaseClient";
import type { Budget } from "@/types";

const TABLE_PLURAL = "budgets";
const TABLE_SINGULAR = "budget";
let cachedBudgetTable: string | null = null;

function isMissingTableError(message?: string, tableName?: string) {
  if (!message || !tableName) return false;
  return (
    message.includes("schema cache") && message.includes(`public.${tableName}`)
  );
}

async function resolveBudgetTable() {
  if (!supabase) return TABLE_PLURAL;
  if (cachedBudgetTable) return cachedBudgetTable;

  const pluralProbe = await supabase.from(TABLE_PLURAL).select("id").limit(1);
  if (
    !pluralProbe.error ||
    !isMissingTableError(pluralProbe.error.message, TABLE_PLURAL)
  ) {
    cachedBudgetTable = TABLE_PLURAL;
    return cachedBudgetTable;
  }

  const singularProbe = await supabase
    .from(TABLE_SINGULAR)
    .select("id")
    .limit(1);
  if (
    !singularProbe.error ||
    !isMissingTableError(singularProbe.error.message, TABLE_SINGULAR)
  ) {
    cachedBudgetTable = TABLE_SINGULAR;
    return cachedBudgetTable;
  }

  cachedBudgetTable = TABLE_PLURAL;
  return cachedBudgetTable;
}

/** Fetch all budgets for a given month (YYYY-MM). Defaults to current month. */
export async function getBudgets(month?: string) {
  try {
    const { userId } = await auth();
    if (!userId || !supabase)
      return { success: false, error: "Unauthorized", data: [] };

    const targetMonth = month ?? new Date().toISOString().slice(0, 7);
    const tableName = await resolveBudgetTable();

    const { data, error } = await supabase
      .from(tableName)
      .select("*")
      .eq("user_id", userId)
      .eq("month", targetMonth)
      .order("category", { ascending: true });

    if (error) return { success: false, error: error.message, data: [] };
    return { success: true, data: (data ?? []) as Budget[] };
  } catch (err) {
    return { success: false, error: (err as Error).message, data: [] };
  }
}

/** Create or update a budget limit for a category/month. */
export async function upsertBudget(
  category: string,
  limitAmount: number,
  month?: string,
) {
  try {
    const { userId } = await auth();
    if (!userId || !supabase) return { success: false, error: "Unauthorized" };

    const targetMonth = month ?? new Date().toISOString().slice(0, 7);
    let tableName = await resolveBudgetTable();

    let { data, error } = await supabase
      .from(tableName)
      .upsert(
        {
          user_id: userId,
          category: category.trim(),
          limit_amount: limitAmount,
          month: targetMonth,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,category,month" },
      )
      .select()
      .single();

    // Retry with the alternate table name when environments use a different naming convention.
    if (error && isMissingTableError(error.message, tableName)) {
      tableName = tableName === TABLE_PLURAL ? TABLE_SINGULAR : TABLE_PLURAL;
      cachedBudgetTable = tableName;

      const retry = await supabase
        .from(tableName)
        .upsert(
          {
            user_id: userId,
            category: category.trim(),
            limit_amount: limitAmount,
            month: targetMonth,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id,category,month" },
        )
        .select()
        .single();

      data = retry.data;
      error = retry.error;
    }

    if (error) return { success: false, error: error.message };
    return { success: true, data: data as Budget };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

/** Delete a budget by id. */
export async function deleteBudget(id: string) {
  try {
    const { userId } = await auth();
    if (!userId || !supabase) return { success: false, error: "Unauthorized" };

    const tableName = await resolveBudgetTable();

    const { error } = await supabase
      .from(tableName)
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}
