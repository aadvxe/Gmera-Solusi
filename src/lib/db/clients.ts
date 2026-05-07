import { createClient } from '@/utils/supabase/client';
import type { Client } from './types';

export async function getClients(): Promise<Client[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('is_active', true)
    .order('name');
  if (error) { console.error('getClients:', error); return []; }
  return data || [];
}

export async function getClientById(id: string): Promise<Client | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .single();
  if (error) { console.error('getClientById:', error); return null; }
  return data;
}

export async function getClientInvoiceStats(clientId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('invoices')
    .select('status, grand_total')
    .eq('client_id', clientId);
  if (error || !data) return { totalInvoices: 0, unpaidAmount: 0, totalValue: 0 };
  return {
    totalInvoices: data.length,
    unpaidAmount: data.filter(i => i.status !== 'paid').reduce((s, i) => s + (i.grand_total || 0), 0),
    totalValue: data.reduce((s, i) => s + (i.grand_total || 0), 0),
  };
}

export async function insertClient(payload: Omit<Client, 'id' | 'created_at' | 'is_active'>) {
  const supabase = createClient();
  const { data, error } = await supabase.from('clients').insert([payload]).select().single();
  return { data, error };
}

export async function updateClient(id: string, payload: Partial<Client>) {
  const supabase = createClient();
  const { data, error } = await supabase.from('clients').update(payload).eq('id', id).select().single();
  return { data, error };
}

export async function deleteClient(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from('clients').update({ is_active: false }).eq('id', id);
  return { error };
}
