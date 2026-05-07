import { createClient } from '@/utils/supabase/client';
import type { Category, PaymentMethod } from './types';
import { createAuditLog } from './users';

export async function getCategories(type?: 'income' | 'expense'): Promise<Category[]> {
  const supabase = createClient();
  let query = supabase.from('categories').select('*');
  if (type) query = query.eq('type', type);
  query = query.order('order_index', { ascending: true }).order('name', { ascending: true });
  const { data, error } = await query;
  if (error) { console.error('getCategories:', error); return []; }
  return data || [];
}

export async function deleteCategory(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from('categories').delete().eq('id', id);
  return { error };
}

export async function updateCategory(id: string, payload: Partial<Category>) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('categories')
    .update(payload)
    .eq('id', id)
    .select()
    .single();
  return { data, error };
}

export async function updateCategoryOrder(categories: { id: string; order_index: number }[]) {
  const supabase = createClient();
  const promises = categories.map(cat =>
    supabase.from('categories').update({ order_index: cat.order_index }).eq('id', cat.id).select()
  );
  const results = await Promise.all(promises);
  const error = results.find(r => r.error)?.error;

  const emptyData = results.find(r => !r.error && (!r.data || r.data.length === 0));
  if (emptyData) {
    console.error('updateCategoryOrder: RLS blocking or wrong ID', emptyData);
    return { error: { message: 'Gagal menyimpan ke database (0 baris diubah).' } as any };
  }

  if (!error) {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await createAuditLog(user.id, 'update', 'Category Order', null, null, null);
    }
  }

  return { error };
}

export async function getPaymentMethods(): Promise<PaymentMethod[]> {
  const supabase = createClient();
  const { data, error } = await supabase.from('payment_methods').select('*').eq('is_active', true);
  if (error) { console.error('getPaymentMethods:', error); return []; }
  return data || [];
}
