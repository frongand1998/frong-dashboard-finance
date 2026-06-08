"use server";

import { supabase } from "@/lib/supabaseClient";
import { auth } from "@clerk/nextjs/server";
import {
  transactionSchema,
  type TransactionFormData,
} from "@/lib/validators/transaction";
import type { Transaction } from "@/types";
import { normalizeCategoryLabel } from "@/lib/utils";

type TransactionAmountRow = Pick<Transaction, "type" | "amount">;
type TrendRow = Pick<Transaction, "type" | "amount" | "date">;

function normalizeTransactionCategory<T extends { category: string }>(
  tx: T,
): T {
  return {
    ...tx,
    category: normalizeCategoryLabel(tx.category),
  };
}

export async function createTransaction(data: TransactionFormData) {
  try {
    const { userId } = await auth();
    if (!userId || !supabase) {
      throw new Error("Unauthorized or Supabase not configured");
    }

    const validated = transactionSchema.parse(data);
    const normalized = {
      ...validated,
      category: normalizeCategoryLabel(validated.category),
    };

    const { data: result, error } = await supabase
      .from("transactions")
      .insert({
        user_id: userId,
        ...normalized,
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return {
        success: false,
        error: error.message || "Failed to create transaction",
      };
    }
    return { success: true, data: result };
  } catch (error) {
    console.error("Create transaction error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred";
    return { success: false, error: errorMessage };
  }
}

export async function getTransactions(limit = 10, offset = 0) {
  try {
    const { userId } = await auth();
    if (!userId || !supabase) {
      throw new Error("Unauthorized or Supabase not configured");
    }

    const { data, error, count } = await supabase
      .from("transactions")
      .select("*", { count: "exact" })
      .eq("user_id", userId)
      .order("date", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return {
      success: true,
      data: ((data || []) as Transaction[]).map(normalizeTransactionCategory),
      total: count || 0,
    };
  } catch (error) {
    console.error("Get transactions error:", error);
    return { success: false, error: String(error), data: [], total: 0 };
  }
}

export async function getTransactionsSummary(
  startDate: string,
  endDate: string,
) {
  try {
    const { userId } = await auth();
    if (!userId || !supabase) {
      throw new Error("Unauthorized or Supabase not configured");
    }

    const { data, error } = await supabase
      .from("transactions")
      .select("type, amount")
      .eq("user_id", userId)
      .gte("date", startDate)
      .lte("date", endDate);

    if (error) throw error;

    const summary = ((data || []) as TransactionAmountRow[]).reduce(
      (acc: { income: number; expenses: number }, tx) => {
        if (tx.type === "income") {
          acc.income += Number(tx.amount);
        } else {
          acc.expenses += Number(tx.amount);
        }
        return acc;
      },
      { income: 0, expenses: 0 },
    );

    return { success: true, ...summary };
  } catch (error) {
    console.error("Get summary error:", error);
    return { success: false, error: String(error), income: 0, expenses: 0 };
  }
}

export async function deleteTransaction(id: string) {
  try {
    const { userId } = await auth();
    if (!userId || !supabase) {
      throw new Error("Unauthorized or Supabase not configured");
    }

    const { error } = await supabase
      .from("transactions")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Delete transaction error:", error);
    return { success: false, error: String(error) };
  }
}

export async function getTransactionById(id: string) {
  try {
    const { userId } = await auth();
    if (!userId || !supabase) {
      throw new Error("Unauthorized or Supabase not configured");
    }

    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (error) throw error;
    return {
      success: true,
      data: normalizeTransactionCategory(data as Transaction),
    };
  } catch (error) {
    console.error("Get transaction error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to fetch transaction";
    return { success: false, error: errorMessage };
  }
}

export async function updateTransaction(id: string, data: TransactionFormData) {
  try {
    const { userId } = await auth();
    if (!userId || !supabase) {
      throw new Error("Unauthorized or Supabase not configured");
    }

    const validated = transactionSchema.parse(data);

    const updateData = {
      ...validated,
      category: normalizeCategoryLabel(validated.category),
      updated_at: new Date().toISOString(),
    };

    const { data: result, error } = await supabase
      .from("transactions")
      .update(updateData)
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return {
        success: false,
        error: error.message || "Failed to update transaction",
      };
    }
    return { success: true, data: result };
  } catch (error) {
    console.error("Update transaction error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred";
    return { success: false, error: errorMessage };
  }
}

export async function getMonthlyTrend(months = 6) {
  try {
    const { userId } = await auth();
    if (!userId || !supabase) {
      throw new Error("Unauthorized or Supabase not configured");
    }

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months + 1);
    startDate.setDate(1);
    const startStr = startDate.toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("transactions")
      .select("type, amount, date")
      .eq("user_id", userId)
      .gte("date", startStr)
      .order("date", { ascending: true });

    if (error) throw error;

    // Build ordered month slots
    const slots: { month: string; income: number; expense: number }[] = [];
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      slots.push({ month: d.toISOString().slice(0, 7), income: 0, expense: 0 });
    }

    ((data || []) as TrendRow[]).forEach((tx) => {
      const month = String(tx.date).slice(0, 7);
      const slot = slots.find((s) => s.month === month);
      if (!slot) return;
      if (tx.type === "income") slot.income += Number(tx.amount);
      else slot.expense += Number(tx.amount);
    });

    return { success: true, data: slots };
  } catch (error) {
    console.error("getMonthlyTrend error:", error);
    return { success: false, error: String(error), data: [] };
  }
}

export async function getAnalyticsTransactions(
  startDate: string,
  endDate: string,
) {
  try {
    const { userId } = await auth();
    if (!userId || !supabase) {
      throw new Error("Unauthorized or Supabase not configured");
    }

    const { data, error } = await supabase
      .from("transactions")
      .select("type, amount, category, date")
      .eq("user_id", userId)
      .gte("date", startDate)
      .lte("date", endDate)
      .order("date", { ascending: false });

    if (error) throw error;
    return {
      success: true,
      data: (
        (data || []) as Pick<
          Transaction,
          "type" | "amount" | "category" | "date"
        >[]
      ).map(normalizeTransactionCategory),
    };
  } catch (error) {
    console.error("getAnalyticsTransactions error:", error);
    return { success: false, error: String(error), data: [] };
  }
}

export async function deleteAllTransactions() {
  try {
    const { userId } = await auth();
    if (!userId || !supabase) {
      throw new Error("Unauthorized or Supabase not configured");
    }

    const { error, count } = await supabase
      .from("transactions")
      .delete()
      .eq("user_id", userId);

    if (error) {
      console.error("Supabase error:", error);
      return {
        success: false,
        error: error.message || "Failed to delete transactions",
      };
    }

    return { success: true, count: count || 0 };
  } catch (error) {
    console.error("Delete all transactions error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred";
    return { success: false, error: errorMessage };
  }
}
