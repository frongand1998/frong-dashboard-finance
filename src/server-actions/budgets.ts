'use server';

import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabaseClient';
import type { Budget } from '@/types';

/** Fetch all budgets for a given month (YYYY-MM). Defaults to current month. */
export async function getBudgets(month?: string) {
  try {
    const { userId } = await auth();
    if (!userId || !supabase) return { success: false, error: 'Unauthorized', data: [] };

    const targetMonth = month ?? new Date().toISOString().slice(0, 7);

    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', userId)
      .eq('month', targetMonth)
      .order('category', { ascending: true });

    if (error) return { success: false, error: error.message, data: [] };
    return { success: true, data: (data ?? []) as Budget[] };
  } catch (err) {
    return { success: false, error: (err as Error).message, data: [] };
  }
}

/** Create or update a budget limit for a category/month. */
export async function upsertBudget(category: string, limitAmount: number, month?: string) {
  try {
    const { userId } = await auth();
    if (!userId || !supabase) return { success: false, error: 'Unauthorized' };

    const targetMonth = month ?? new Date().toISOString().slice(0, 7);

    const { data, error } = await supabase
      .from('budgets')
      .upsert(
        {
          user_id: userId,
          category: category.trim(),
          limit_amount: limitAmount,
          month: targetMonth,
          updated_at: new Date().toISOString(),
        } as any,
        { onConflict: 'user_id,category,month' }
      )
      .select()
      .single();

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
    if (!userId || !supabase) return { success: false, error: 'Unauthorized' };

    const { error } = await supabase
      .from('budgets')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}
