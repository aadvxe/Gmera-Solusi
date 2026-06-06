// Import createClient untuk membuka koneksi Supabase dari browser saat helper database untuk membaca dan menyimpan data pengeluaran perlu membaca/menyimpan data.
import { createClient } from '@/utils/supabase/client';
// Import type dari ./types supaya helper database untuk membaca dan menyimpan data pengeluaran tahu bentuk data tanpa mengubah hasil JavaScript.
import type { Expense } from './types';

// getExpense mengambil daftar pengeluaran dari Supabase, termasuk nama kategori dan metode pembayaran.
export async function getExpense(limit?: number): Promise<Expense[]> {
  const supabase = createClient();
  let query = supabase
    .from('expense')
    .select('*, categories(name), payment_methods(name)')
    .order('date', { ascending: false });
  // Kalau pemanggil memberi batas jumlah data, query Supabase dibatasi supaya tidak mengambil terlalu banyak baris.
  if (limit) query = query.limit(limit);
  // await menunggu proses async selesai sebelum kode ini melanjutkan langkah berikutnya.
  const { data, error } = await query;
  // Kalau Supabase mengembalikan error atau data kosong, helper pengeluaran menampilkan pesan gagal atau mengembalikan data kosong agar UI tidak rusak.
  if (error) { console.error('getExpense:', error); return []; }
  // getExpense mengirim daftar hasil Supabase; kalau data kosong, halaman mendapat array kosong agar tabel tidak error.
  return data || [];
}

// getTotalExpense menjumlahkan nominal pengeluaran; jika tahun/bulan diberikan, hanya periode itu yang dihitung.
export async function getTotalExpense(year?: number, month?: number): Promise<number> {
  const supabase = createClient();
  let query = supabase.from('expense').select('amount');
  // Kalau tanggal/bulan/tahun cocok dengan filter aktif, data itu ikut dihitung atau ditampilkan.
  if (year && month) {
    const start = `${year}-${String(month).padStart(2, '0')}-01`;
    const end = month === 12
      ? `${year + 1}-01-01`
      : `${year}-${String(month + 1).padStart(2, '0')}-01`;
    query = query.gte('date', start).lt('date', end);
    console.log('[getTotalExpense] Querying date range:', { start, end });
  }
  // await menunggu proses async selesai sebelum kode ini melanjutkan langkah berikutnya.
  const { data, error } = await query;
  console.log('[getTotalExpense] Result:', { dataLength: data?.length, error, sampleData: data?.slice(0, 3) });
  // Kalau Supabase mengembalikan error atau data kosong, helper pengeluaran menampilkan pesan gagal atau mengembalikan data kosong agar UI tidak rusak.
  if (error || !data) return 0;
  // end mengembalikan hasil untuk helper pengeluaran, sesuai data yang dihitung tepat sebelum baris return ini.
  return data.reduce((sum, row) => sum + (Number(row.amount) || 0), 0);
}

// createExpense menyimpan data pengeluaran baru ke tabel expense.
export async function createExpense(
  payload: Omit<Expense, 'id' | 'created_at' | 'categories' | 'payment_methods'>
) {
  const supabase = createClient();
  // await menunggu respons Supabase selesai sebelum kode memakai data atau error yang dikembalikan.
  const { data, error } = await supabase.from('expense').insert([payload]).select().single();
  // createExpense mengirim hasil operasi Supabase: data untuk hasil sukses dan error untuk pesan gagal.
  return { data, error };
}

// deleteExpense menghapus satu data pengeluaran dari tabel expense.
export async function deleteExpense(id: string) {
  const supabase = createClient();
  // await menunggu respons Supabase selesai sebelum kode memakai data atau error yang dikembalikan.
  const { error } = await supabase.from('expense').delete().eq('id', id);
  // deleteExpense mengirim error dari Supabase supaya halaman bisa menampilkan toast gagal jika perlu.
  return { error };
}

// updateExpense mengubah satu data pengeluaran berdasarkan id yang dipilih user.
export async function updateExpense(
  id: string,
  payload: Partial<Omit<Expense, 'id' | 'created_at' | 'categories' | 'payment_methods'>>
) {
  const supabase = createClient();
  // await menunggu respons Supabase selesai sebelum kode memakai data atau error yang dikembalikan.
  const { data, error } = await supabase
    .from('expense')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  // updateExpense mengirim hasil operasi Supabase: data untuk hasil sukses dan error untuk pesan gagal.
  return { data, error };
}
