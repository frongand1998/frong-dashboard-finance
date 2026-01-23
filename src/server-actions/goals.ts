'use server';

import { supabase } from '@/lib/supabaseClient';
import { auth } from '@clerk/nextjs/server';
import { goalSchema, type GoalFormData } from '@/lib/validators/goal';
import type { Goal } from '@/types';

export async function createGoal(data: GoalFormData) {
  try {
    const { userId } = await auth();
    if (!userId || !supabase) {
      throw new Error('Unauthorized or Supabase not configured');
    }

    const validated = goalSchema.parse(data);

    const { data: result, error } = await supabase
      .from('goals')
      .insert({
        user_id: userId,
        ...validated,
      } as any)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return { success: false, error: error.message || 'Failed to create goal' };
    }
    return { success: true, data: result };
  } catch (error) {
    console.error('Create goal error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return { success: false, error: errorMessage };
  }
}

export async function getGoals() {
  try {
    const { userId } = await auth();
    if (!userId || !supabase) {
      throw new Error('Unauthorized or Supabase not configured');
    }

    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return { success: false, error: error.message || 'Failed to fetch goals', data: [] };
    }
    return { success: true, data: (data || []) as Goal[] };
  } catch (error) {
    console.error('Get goals error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch goals';
    return { success: false, error: errorMessage, data: [] };
  }
}

export async function updateGoal(id: string, data: GoalFormData) {
  try {
    const { userId } = await auth();
    if (!userId || !supabase) {
      throw new Error('Unauthorized or Supabase not configured');
    }

    const validated = goalSchema.parse(data);

    const { error } = await supabase
      .from('goals')
      .update({
        ...validated,
        updated_at: new Date().toISOString(),
      } as any)
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('Supabase error:', error);
      return { success: false, error: error.message || 'Failed to update goal' };
    }
    return { success: true };
  } catch (error) {
    console.error('Update goal error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return { success: false, error: errorMessage };
  }
}

export async function deleteGoal(id: string) {
  try {
    const { userId } = await auth();
    if (!userId || !supabase) {
      throw new Error('Unauthorized or Supabase not configured');
    }

    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('Supabase error:', error);
      return { success: false, error: error.message || 'Failed to delete goal' };
    }
    return { success: true };
  } catch (error) {
    console.error('Delete goal error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete goal';
    return { success: false, error: errorMessage };
  }
}
