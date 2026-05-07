import { createClient } from '@/utils/supabase/client';
import type { Invoice, InvoiceItem } from './types';

export async function getInvoices(
  status?: Invoice['status']
): Promise<(Invoice & { clients: { name: string } | null })[]> {
  const supabase = createClient();
  let query = supabase
    .from('invoices')
    .select('*, clients(name)')
    .order('invoice_date', { ascending: false });
  if (status) query = query.eq('status', status);
  const { data, error } = await query;
  if (error) { console.error('getInvoices:', error); return []; }
  return data || [];
}

export async function getInvoiceById(id: string): Promise<Invoice | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('invoices')
    .select('*, invoice_items(*)')
    .eq('id', id)
    .single();
  if (error) { console.error('getInvoiceById:', error); return null; }
  return data;
}

export async function getInvoicesByClient(clientId: string): Promise<Invoice[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('client_id', clientId)
    .order('invoice_date', { ascending: false });
  if (error) { console.error('getInvoicesByClient:', error); return []; }
  return data || [];
}

export async function createInvoiceWithItems(
  invoice: Omit<Invoice, 'id' | 'created_at'>,
  items: Omit<InvoiceItem, 'id' | 'invoice_id'>[]
) {
  const supabase = createClient();

  const { data: invData, error: invError } = await supabase
    .from('invoices')
    .insert([invoice])
    .select()
    .single();

  if (invError) return { error: invError };

  const itemsWithInvId = items.map(item => ({ ...item, invoice_id: invData.id }));
  const { error: itemsError } = await supabase.from('invoice_items').insert(itemsWithInvId);

  return { data: invData, error: itemsError };
}

export const INVOICE_STATUS_LABEL: Record<string, string> = {
  unpaid: 'Belum Bayar',
  paid: 'Lunas',
  overdue: 'Jatuh Tempo',
  cancelled: 'Dibatalkan',
};

export const INVOICE_STATUS_COLOR: Record<string, string> = {
  unpaid: 'bg-warning/10 text-warning border-warning/20',
  paid: 'bg-success/10 text-success border-success/20',
  overdue: 'bg-danger/10 text-danger border-danger/20',
  cancelled: 'bg-border text-text-muted border-border',
};
