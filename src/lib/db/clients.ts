// Import createClient untuk membuka koneksi Supabase dari browser saat helper database untuk membaca dan menyimpan data customer perlu membaca/menyimpan data.
import { createClient } from '@/utils/supabase/client';
// Import type dari ./types supaya helper database untuk membaca dan menyimpan data customer tahu bentuk data tanpa mengubah hasil JavaScript.
import type { Client } from './types';
// Import helper invoices agar dashboard bisa menghitung status invoice dan piutang.
import { checkAndUpdateOverdueInvoices } from './invoices';

// getClients mengambil customer yang masih aktif untuk dropdown dan daftar customer.
export async function getClients(): Promise<Client[]> {
  const supabase = createClient();
  // await menunggu respons Supabase selesai sebelum kode memakai data atau error yang dikembalikan.
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('is_active', true)
    .order('name');
  // Kalau Supabase mengembalikan error atau data kosong, helper customer menampilkan pesan gagal atau mengembalikan data kosong agar UI tidak rusak.
  if (error) { console.error('getClients:', error); return []; }
  // getClients mengirim daftar hasil Supabase; kalau data kosong, halaman mendapat array kosong agar tabel tidak error.
  return data || [];
}

// getClientById mengambil satu customer berdasarkan id.
export async function getClientById(id: string): Promise<Client | null> {
  const supabase = createClient();
  // await menunggu respons Supabase selesai sebelum kode memakai data atau error yang dikembalikan.
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .single();
  // Kalau Supabase mengembalikan error atau data kosong, helper customer menampilkan pesan gagal atau mengembalikan data kosong agar UI tidak rusak.
  if (error) { console.error('getClientById:', error); return null; }
  // getClientById mengirim data Supabase yang berhasil ditemukan ke halaman pemanggil.
  return data;
}

// getClientInvoiceStats menghitung jumlah invoice, nilai belum dibayar, dan total transaksi satu customer.
export async function getClientInvoiceStats(clientId: string) {
  // await menunggu proses async selesai sebelum kode ini melanjutkan langkah berikutnya.
  await checkAndUpdateOverdueInvoices();
  const supabase = createClient();
  // await menunggu respons Supabase selesai sebelum kode memakai data atau error yang dikembalikan.
  const { data, error } = await supabase
    .from('invoices')
    .select('status, grand_total')
    .eq('client_id', clientId);
  // Kalau Supabase mengembalikan error atau data kosong, helper customer menampilkan pesan gagal atau mengembalikan data kosong agar UI tidak rusak.
  if (error || !data) return { totalInvoices: 0, unpaidAmount: 0, totalValue: 0 };
  // supabase mengembalikan hasil untuk helper customer, sesuai data yang dihitung tepat sebelum baris return ini.
  return {
    totalInvoices: data.length,
    // filter ini menyisakan transaksi/invoice yang statusnya sesuai filter yang dipilih user.
    unpaidAmount: data.filter(i => i.status !== 'paid').reduce((s, i) => s + (i.grand_total || 0), 0),
    // reduce ini menggabungkan daftar data menjadi satu nilai ringkasan yang dibutuhkan helper database untuk membaca dan menyimpan data customer.
    totalValue: data.reduce((s, i) => s + (i.grand_total || 0), 0),
  };
}

// insertClient menyimpan customer baru ke tabel clients.
export async function insertClient(payload: Omit<Client, 'id' | 'created_at' | 'is_active'>) {
  const supabase = createClient();
  // await menunggu respons Supabase selesai sebelum kode memakai data atau error yang dikembalikan.
  const { data, error } = await supabase.from('clients').insert([payload]).select().single();
  // insertClient mengirim hasil operasi Supabase: data untuk hasil sukses dan error untuk pesan gagal.
  return { data, error };
}

// updateClient mengubah data customer berdasarkan id.
export async function updateClient(id: string, payload: Partial<Client>) {
  const supabase = createClient();
  // await menunggu respons Supabase selesai sebelum kode memakai data atau error yang dikembalikan.
  const { data, error } = await supabase.from('clients').update(payload).eq('id', id).select().single();
  // updateClient mengirim hasil operasi Supabase: data untuk hasil sukses dan error untuk pesan gagal.
  return { data, error };
}

// deleteClient tidak menghapus permanen, tetapi menandai customer sebagai tidak aktif.
export async function deleteClient(id: string) {
  const supabase = createClient();
  // await menunggu respons Supabase selesai sebelum kode memakai data atau error yang dikembalikan.
  const { error } = await supabase.from('clients').update({ is_active: false }).eq('id', id);
  // deleteClient mengirim error dari Supabase supaya halaman bisa menampilkan toast gagal jika perlu.
  return { error };
}
