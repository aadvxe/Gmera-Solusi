import { createClient } from '@/utils/supabase/client';
import type { Income } from './types';

export async function getIncome(limit?: number): Promise<Income[]> {
  const supabase = createClient();
  let query = supabase
    .from('income')
    .select('*, categories(name), payment_methods(name)')
    .order('date', { ascending: false });
  if (limit) query = query.limit(limit);
  const { data, error } = await query;
  if (error) { console.error('getIncome:', error); return []; }
  return data || [];
}

export async function getTotalIncome(year?: number, month?: number): Promise<number> {
  const supabase = createClient();
  let query = supabase.from('income').select('amount');
  if (year && month) {
    const start = `${year}-${String(month).padStart(2, '0')}-01`;
    const end = month === 12
      ? `${year + 1}-01-01`
      : `${year}-${String(month + 1).padStart(2, '0')}-01`;
    query = query.gte('date', start).lt('date', end);
  }
  const { data, error } = await query;
  if (error || !data) return 0;
  return data.reduce((sum, row) => sum + (row.amount || 0), 0);
}

export async function createIncome(
  payload: Omit<Income, 'id' | 'created_at' | 'categories' | 'payment_methods'>
) {
  const supabase = createClient();
  const { data, error } = await supabase.from('income').insert([payload]).select().single();

  if (!error && payload.invoice_id) {
    // Automatically mark linked invoice as paid
    await supabase
      .from('invoices')
      .update({ status: 'paid', paid_at: new Date().toISOString() })
      .eq('id', payload.invoice_id);
  }

  return { data, error };
}

export async function deleteIncome(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from('income').delete().eq('id', id);
  return { error };
}

export async function updateIncome(
  id: string,
  payload: Partial<Omit<Income, 'id' | 'created_at' | 'categories' | 'payment_methods'>>
) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('income')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  return { data, error };
}
