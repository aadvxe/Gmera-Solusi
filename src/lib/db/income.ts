// Import createClient untuk membuka koneksi Supabase dari browser saat helper database untuk membaca dan menyimpan data pendapatan perlu membaca/menyimpan data.
import { createClient } from '@/utils/supabase/client';
// Import type dari ./types supaya helper database untuk membaca dan menyimpan data pendapatan tahu bentuk data tanpa mengubah hasil JavaScript.
import type { Income } from './types';

// getIncome mengambil daftar pendapatan dari Supabase, termasuk nama kategori dan metode pembayaran.
export async function getIncome(limit?: number): Promise<Income[]> {
  const supabase = createClient();
  let query = supabase
    .from('income')
    .select('*, categories(name), payment_methods(name)')
    .order('date', { ascending: false });
  // Kalau pemanggil memberi batas jumlah data, query Supabase dibatasi supaya tidak mengambil terlalu banyak baris.
  if (limit) query = query.limit(limit);
  // await menunggu proses async selesai sebelum kode ini melanjutkan langkah berikutnya.
  const { data, error } = await query;
  // Kalau Supabase mengembalikan error atau data kosong, helper pendapatan menampilkan pesan gagal atau mengembalikan data kosong agar UI tidak rusak.
  if (error) { console.error('getIncome:', error); return []; }
  // getIncome mengirim daftar hasil Supabase; kalau data kosong, halaman mendapat array kosong agar tabel tidak error.
  return data || [];
}

// getTotalIncome menjumlahkan nominal pendapatan; jika tahun/bulan diberikan, hanya periode itu yang dihitung.
export async function getTotalIncome(year?: number, month?: number): Promise<number> {
  const supabase = createClient();
  let query = supabase.from('income').select('amount');
  // Kalau tanggal/bulan/tahun cocok dengan filter aktif, data itu ikut dihitung atau ditampilkan.
  if (year && month) {
    const start = `${year}-${String(month).padStart(2, '0')}-01`;
    const end = month === 12
      ? `${year + 1}-01-01`
      : `${year}-${String(month + 1).padStart(2, '0')}-01`;
    query = query.gte('date', start).lt('date', end);
    console.log('[getTotalIncome] Querying date range:', { start, end });
  }
  // await menunggu proses async selesai sebelum kode ini melanjutkan langkah berikutnya.
  const { data, error } = await query;
  console.log('[getTotalIncome] Result:', { dataLength: data?.length, error, sampleData: data?.slice(0, 3) });
  // Kalau Supabase mengembalikan error atau data kosong, helper pendapatan menampilkan pesan gagal atau mengembalikan data kosong agar UI tidak rusak.
  if (error || !data) return 0;
  // end mengembalikan hasil untuk helper pendapatan, sesuai data yang dihitung tepat sebelum baris return ini.
  return data.reduce((sum, row) => sum + (Number(row.amount) || 0), 0);
}

// createIncome menyimpan pemasukan baru dan otomatis menandai invoice terkait sebagai lunas jika ada invoice_id.
export async function createIncome(
  payload: Omit<Income, 'id' | 'created_at' | 'categories' | 'payment_methods'>
) {
  const supabase = createClient();
  // await menunggu respons Supabase selesai sebelum kode memakai data atau error yang dikembalikan.
  const { data, error } = await supabase.from('income').insert([payload]).select().single();

  // Kalau Supabase mengembalikan error atau data kosong, helper pendapatan menampilkan pesan gagal atau mengembalikan data kosong agar UI tidak rusak.
  if (!error && payload.invoice_id) {
    // Automatically mark linked invoice as paid
    await supabase
      .from('invoices')
      .update({ status: 'paid', paid_at: new Date().toISOString() })
      .eq('id', payload.invoice_id);
  }

  // createIncome mengirim hasil operasi Supabase: data untuk hasil sukses dan error untuk pesan gagal.
  return { data, error };
}

// deleteIncome menghapus satu data pemasukan dari tabel income.
export async function deleteIncome(id: string) {
  const supabase = createClient();
  // await menunggu respons Supabase selesai sebelum kode memakai data atau error yang dikembalikan.
  const { error } = await supabase.from('income').delete().eq('id', id);
  // deleteIncome mengirim error dari Supabase supaya halaman bisa menampilkan toast gagal jika perlu.
  return { error };
}

// updateIncome mengubah satu data pemasukan berdasarkan id yang dipilih user.
export async function updateIncome(
  id: string,
  payload: Partial<Omit<Income, 'id' | 'created_at' | 'categories' | 'payment_methods'>>
) {
  const supabase = createClient();
  // await menunggu respons Supabase selesai sebelum kode memakai data atau error yang dikembalikan.
  const { data, error } = await supabase
    .from('income')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  // updateIncome mengirim hasil operasi Supabase: data untuk hasil sukses dan error untuk pesan gagal.
  return { data, error };
}
