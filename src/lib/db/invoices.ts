// Import createClient untuk membuka koneksi Supabase dari browser saat helper database untuk membaca, membuat, mengubah, dan menghapus invoice perlu membaca/menyimpan data.
import { createClient } from '@/utils/supabase/client';
// Import type dari ./types supaya helper database untuk membaca, membuat, mengubah, dan menghapus invoice tahu bentuk data tanpa mengubah hasil JavaScript.
import type { Invoice, InvoiceItem } from './types';

// checkAndUpdateOverdueInvoices mengecek invoice belum bayar yang melewati due date lalu mengubah statusnya menjadi jatuh tempo.
export async function checkAndUpdateOverdueInvoices() {
  // try ini menjalankan query invoice Supabase dan menyiapkan fallback jika query gagal.
  try {
    const supabase = createClient();
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;
    
    // await menunggu respons Supabase selesai sebelum kode memakai data atau error yang dikembalikan.
    await supabase
      .from('invoices')
      .update({ status: 'overdue' })
      .eq('status', 'unpaid')
      .lt('due_date', todayStr);
  } catch (error) {
    console.error('checkAndUpdateOverdueInvoices error:', error);
  }
}

// getInvoices mengambil daftar invoice dan nama customer, lalu bisa membatasi hasil berdasarkan status.
export async function getInvoices(
  status?: Invoice['status']
): Promise<(Invoice & { clients: { name: string } | null })[]> {
  // await menunggu proses async selesai sebelum kode ini melanjutkan langkah berikutnya.
  await checkAndUpdateOverdueInvoices();
  const supabase = createClient();
  let query = supabase
    .from('invoices')
    .select('*, clients(name)')
    .order('invoice_date', { ascending: false });
  // Kondisi ini memilih tampilan atau query berdasarkan status invoice/transaksi yang sedang dipakai.
  if (status) query = query.eq('status', status);
  // await menunggu proses async selesai sebelum kode ini melanjutkan langkah berikutnya.
  const { data, error } = await query;
  // Kalau Supabase mengembalikan error atau data kosong, helper invoice menampilkan pesan gagal atau mengembalikan data kosong agar UI tidak rusak.
  if (error) { console.error('getInvoices:', error); return []; }
  // getInvoices mengirim daftar hasil Supabase; kalau data kosong, halaman mendapat array kosong agar tabel tidak error.
  return data || [];
}

// getInvoiceById mengambil satu invoice lengkap dengan item dan data customernya untuk halaman detail/edit.
export async function getInvoiceById(id: string): Promise<any | null> {
  // await menunggu proses async selesai sebelum kode ini melanjutkan langkah berikutnya.
  await checkAndUpdateOverdueInvoices();
  const supabase = createClient();
  // await menunggu respons Supabase selesai sebelum kode memakai data atau error yang dikembalikan.
  const { data, error } = await supabase
    .from('invoices')
    .select('*, invoice_items(*), clients(*)')
    .eq('id', id)
    .single();
  // Kalau Supabase mengembalikan error atau data kosong, helper invoice menampilkan pesan gagal atau mengembalikan data kosong agar UI tidak rusak.
  if (error) { console.error('getInvoiceById:', error); return null; }
  // getInvoiceById mengirim data Supabase yang berhasil ditemukan ke halaman pemanggil.
  return data;
}

// getInvoicesByClient mengambil semua invoice milik satu customer.
export async function getInvoicesByClient(clientId: string): Promise<Invoice[]> {
  // await menunggu proses async selesai sebelum kode ini melanjutkan langkah berikutnya.
  await checkAndUpdateOverdueInvoices();
  const supabase = createClient();
  // await menunggu respons Supabase selesai sebelum kode memakai data atau error yang dikembalikan.
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('client_id', clientId)
    .order('invoice_date', { ascending: false });
  // Kalau Supabase mengembalikan error atau data kosong, helper invoice menampilkan pesan gagal atau mengembalikan data kosong agar UI tidak rusak.
  if (error) { console.error('getInvoicesByClient:', error); return []; }
  // getInvoicesByClient mengirim daftar hasil Supabase; kalau data kosong, halaman mendapat array kosong agar tabel tidak error.
  return data || [];
}

// createInvoiceWithItems menyimpan header invoice dulu, lalu menyimpan semua baris item dengan invoice_id yang baru dibuat.
export async function createInvoiceWithItems(
  invoice: Omit<Invoice, 'id' | 'created_at'>,
  items: Omit<InvoiceItem, 'id' | 'invoice_id'>[]
) {
  const supabase = createClient();

  // await menunggu respons Supabase selesai sebelum kode memakai data atau error yang dikembalikan.
  const { data: invData, error: invError } = await supabase
    .from('invoices')
    .insert([invoice])
    .select()
    .single();

  // Kalau Supabase mengembalikan error atau data kosong, helper invoice menampilkan pesan gagal atau mengembalikan data kosong agar UI tidak rusak.
  if (invError) return { error: invError };

  // map ini mengubah setiap item invoice di form menjadi data item yang siap disimpan ke Supabase atau ditampilkan di tabel.
  const itemsWithInvId = items.map(item => ({ ...item, invoice_id: invData.id }));
  // await menunggu respons Supabase selesai sebelum kode memakai data atau error yang dikembalikan.
  const { error: itemsError } = await supabase.from('invoice_items').insert(itemsWithInvId);

  // itemsWithInvId mengembalikan hasil untuk helper invoice, sesuai data yang dihitung tepat sebelum baris return ini.
  return { data: invData, error: itemsError };
}

// updateInvoiceWithItems mengubah invoice lalu mengganti semua item lama dengan item baru dari form edit.
export async function updateInvoiceWithItems(
  id: string,
  invoice: Partial<Omit<Invoice, 'id' | 'created_at'>>,
  items: Omit<InvoiceItem, 'id' | 'invoice_id'>[]
) {
  const supabase = createClient();

  // await menunggu respons Supabase selesai sebelum kode memakai data atau error yang dikembalikan.
  const { data: invData, error: invError } = await supabase
    .from('invoices')
    .update(invoice)
    .eq('id', id)
    .select()
    .single();

  // Kalau Supabase mengembalikan error atau data kosong, helper invoice menampilkan pesan gagal atau mengembalikan data kosong agar UI tidak rusak.
  if (invError) return { error: invError };

  // Delete old items
  await supabase.from('invoice_items').delete().eq('invoice_id', id);

  // Insert new items
  const itemsWithInvId = items.map(item => ({ ...item, invoice_id: id }));
  // await menunggu respons Supabase selesai sebelum kode memakai data atau error yang dikembalikan.
  const { error: itemsError } = await supabase.from('invoice_items').insert(itemsWithInvId);

  // itemsWithInvId mengembalikan hasil untuk helper invoice, sesuai data yang dihitung tepat sebelum baris return ini.
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

// deleteInvoice menghapus invoice berdasarkan id.
export async function deleteInvoice(id: string) {
  const supabase = createClient();
  // await menunggu respons Supabase selesai sebelum kode memakai data atau error yang dikembalikan.
  const { error } = await supabase.from('invoices').delete().eq('id', id);
  // deleteInvoice mengirim error dari Supabase supaya halaman bisa menampilkan toast gagal jika perlu.
  return { error };
}
