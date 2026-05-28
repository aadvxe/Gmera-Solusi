import { createClient } from '@/utils/supabase/client';
import type { Expense } from './types';

export async function getExpense(limit?: number): Promise<Expense[]> {
  const supabase = createClient();
  let query = supabase
    .from('expense')
    .select('*, categories(name), payment_methods(name)')
    .order('date', { ascending: false });
  if (limit) query = query.limit(limit);
  const { data, error } = await query;
  if (error) { console.error('getExpense:', error); return []; }
  return data || [];
}

export async function getTotalExpense(year?: number, month?: number): Promise<number> {
  const supabase = createClient();
  let query = supabase.from('expense').select('amount');
  if (year && month) {
    const start = `${year}-${String(month).padStart(2, '0')}-01`;
    const end = month === 12
      ? `${year + 1}-01-01`
      : `${year}-${String(month + 1).padStart(2, '0')}-01`;
    query = query.gte('date', start).lt('date', end);
    console.log('[getTotalExpense] Querying date range:', { start, end });
  }
  const { data, error } = await query;
  console.log('[getTotalExpense] Result:', { dataLength: data?.length, error, sampleData: data?.slice(0, 3) });
  if (error || !data) return 0;
  return data.reduce((sum, row) => sum + (Number(row.amount) || 0), 0);
}

export async function createExpense(
  payload: Omit<Expense, 'id' | 'created_at' | 'categories' | 'payment_methods'>
) {
  const supabase = createClient();
  const { data, error } = await supabase.from('expense').insert([payload]).select().single();
  return { data, error };
}

export async function deleteExpense(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from('expense').delete().eq('id', id);
  return { error };
}

export async function updateExpense(
  id: string,
  payload: Partial<Omit<Expense, 'id' | 'created_at' | 'categories' | 'payment_methods'>>
) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('expense')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  return { data, error };
}
