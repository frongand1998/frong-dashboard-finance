'use server';

import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabaseClient';
import { OcrUsageInfo } from '@/lib/ocr/parser';

const OCR_MONTHLY_LIMIT = 50; // Free tier: 50 scans per month

/**
 * Get current OCR usage for the authenticated user
 */
export async function getOcrUsage(): Promise<{
  success: boolean;
  data?: OcrUsageInfo;
  error?: string;
}> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    if (!supabase) {
      return { success: false, error: 'Database connection failed' };
    }

    // Get current month's usage
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const { data, error } = await supabase
      .from('ocr_usage')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', startOfMonth.toISOString())
      .lte('created_at', endOfMonth.toISOString());

    if (error) {
      console.error('Error fetching OCR usage:', error);
      return { success: false, error: error.message };
    }

    const used = data?.length || 0;
    const remaining = Math.max(0, OCR_MONTHLY_LIMIT - used);
    
    // Calculate next reset date (first day of next month)
    const resetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    return {
      success: true,
      data: {
        used,
        limit: OCR_MONTHLY_LIMIT,
        remaining,
        resetDate: resetDate.toISOString(),
      },
    };
  } catch (error) {
    console.error('Error in getOcrUsage:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Record an OCR scan for the authenticated user
 */
export async function recordOcrUsage(): Promise<{
  success: boolean;
  remainingScans?: number;
  error?: string;
}> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    if (!supabase) {
      return { success: false, error: 'Database connection failed' };
    }

    // Check current usage first
    const usageResult = await getOcrUsage();
    if (!usageResult.success || !usageResult.data) {
      return { success: false, error: 'Failed to check usage' };
    }

    // Check if user has exceeded limit
    if (usageResult.data.remaining <= 0) {
      return {
        success: false,
        error: `Monthly limit reached. Resets on ${new Date(usageResult.data.resetDate).toLocaleDateString()}`,
      };
    }

    // Record the usage
    const { error } = await supabase.from('ocr_usage').insert([{
      user_id: userId,
      created_at: new Date().toISOString(),
    }] as any);

    if (error) {
      console.error('Error recording OCR usage:', error);
      return { success: false, error: error.message };
    }

    return {
      success: true,
      remainingScans: usageResult.data.remaining - 1,
    };
  } catch (error) {
    console.error('Error in recordOcrUsage:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
