'use server';

import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabaseClient';

export async function getCategorySummary(startDate?: string, endDate?: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    if (!supabase) {
      return { success: false, error: 'Database connection failed' };
    }

    let query = supabase
      .from('transactions')
      .select('type, category, amount')
      .eq('user_id', userId);

    if (startDate) {
      query = query.gte('date', startDate);
    }
    if (endDate) {
      query = query.lte('date', endDate);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return { success: false, error: error.message || 'Failed to fetch category summary' };
    }

    // Group by category and type (normalize names)
    const categoryMap = new Map<string, { category: string; income: number; expense: number; total: number }>();

    data?.forEach((tx: any) => {
      const rawCategory = typeof tx.category === 'string' ? tx.category : '';
      const trimmedCategory = rawCategory.trim().replace(/\s+/g, ' ');
      const displayCategory = trimmedCategory || 'Uncategorized';
      const key = displayCategory.toLowerCase();

      const existing = categoryMap.get(key) || {
        category: displayCategory,
        income: 0,
        expense: 0,
        total: 0,
      };
      
      if (tx.type === 'income') {
        existing.income += Number(tx.amount);
        existing.total += Number(tx.amount);
      } else {
        existing.expense += Number(tx.amount);
        existing.total += Number(tx.amount);
      }
      
      categoryMap.set(key, existing);
    });

    // Convert to array and sort by total (descending)
    const categories = Array.from(categoryMap.values())
      .map((amounts) => ({
        ...amounts,
      }))
      .sort((a, b) => b.total - a.total);

    return {
      success: true,
      data: categories,
    };
  } catch (error) {
    console.error('Error getting category summary:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get category summary',
    };
  }
}

export async function getCategories() {
  try {
    const { userId } = await auth();
    if (!userId || !supabase) {
      return { success: false, error: 'Unauthorized', data: [] };
    }

    const { data, error } = await supabase
      .from('transactions')
      .select('category')
      .eq('user_id', userId);

    if (error) {
      console.error('Supabase error:', error);
      return { success: false, error: error.message || 'Failed to fetch categories', data: [] };
    }

    // Get unique categories
    const uniqueCategories = [...new Set(data?.map((t: any) => t.category) || [])];
    
    return {
      success: true,
      data: uniqueCategories.filter(Boolean).sort(),
    };
  } catch (error) {
    console.error('Get categories error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch categories',
      data: [],
    };
  }
}
