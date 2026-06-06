// Import createClient untuk membuka koneksi Supabase dari browser saat helper database untuk kategori pendapatan/pengeluaran dan metode pembayaran perlu membaca/menyimpan data.
import { createClient } from '@/utils/supabase/client';
// Import type dari ./types supaya helper database untuk kategori pendapatan/pengeluaran dan metode pembayaran tahu bentuk data tanpa mengubah hasil JavaScript.
import type { Category, PaymentMethod } from './types';
// Import helper users agar perubahan kategori/metode pembayaran bisa ditulis ke audit log.
import { createAuditLog } from './users';

// getCategories mengambil kategori income/expense dan mengurutkannya untuk dropdown/filter.
export async function getCategories(type?: 'income' | 'expense'): Promise<Category[]> {
  const supabase = createClient();
  let query = supabase.from('categories').select('*');
  // Kalau teks pencarian cocok dengan nama/nomor/keterangan data, item itu masuk hasil pencarian.
  if (type) query = query.eq('type', type);
  query = query.order('order_index', { ascending: true }).order('name', { ascending: true });
  // await menunggu proses async selesai sebelum kode ini melanjutkan langkah berikutnya.
  const { data, error } = await query;
  // Kalau Supabase mengembalikan error atau data kosong, helper kategori dan metode pembayaran menampilkan pesan gagal atau mengembalikan data kosong agar UI tidak rusak.
  if (error) { console.error('getCategories:', error); return []; }
  // getCategories mengirim daftar hasil Supabase; kalau data kosong, halaman mendapat array kosong agar tabel tidak error.
  return data || [];
}

// deleteCategory menghapus kategori lalu mencatat nama kategori yang dihapus ke audit log.
export async function deleteCategory(id: string) {
  const supabase = createClient();
  
  // Fetch category data first to log its name
  const { data: catData } = await supabase.from('categories').select('name').eq('id', id).single();
  
  // await menunggu respons Supabase selesai sebelum kode memakai data atau error yang dikembalikan.
  const { error } = await supabase.from('categories').delete().eq('id', id);
  // Kalau Supabase mengembalikan error atau data kosong, helper kategori dan metode pembayaran menampilkan pesan gagal atau mengembalikan data kosong agar UI tidak rusak.
  if (!error) {
    // await menunggu respons Supabase selesai sebelum kode memakai data atau error yang dikembalikan.
    const { data: { user } } = await supabase.auth.getUser();
    // Kalau data user tersedia, lanjutkan proses yang membutuhkan akun login.
    if (user) await createAuditLog(user.id, 'delete', 'Category Order', id, catData, null);
  }
  // deleteCategory mengirim error dari Supabase supaya halaman bisa menampilkan toast gagal jika perlu.
  return { error };
}

// createCategory menyimpan kategori baru dan menulis audit log jika berhasil.
export async function createCategory(payload: Omit<Category, 'id' | 'created_at'>) {
  const supabase = createClient();
  // await menunggu respons Supabase selesai sebelum kode memakai data atau error yang dikembalikan.
  const { data, error } = await supabase
    .from('categories')
    .insert([payload])
    .select()
    .single();
  // Kalau Supabase mengembalikan error atau data kosong, helper kategori dan metode pembayaran menampilkan pesan gagal atau mengembalikan data kosong agar UI tidak rusak.
  if (!error && data) {
    // await menunggu respons Supabase selesai sebelum kode memakai data atau error yang dikembalikan.
    const { data: { user } } = await supabase.auth.getUser();
    // Kalau data user tersedia, lanjutkan proses yang membutuhkan akun login.
    if (user) await createAuditLog(user.id, 'create', 'Category Order', data.id, null, payload);
  }
  // createCategory mengirim hasil operasi Supabase: data untuk hasil sukses dan error untuk pesan gagal.
  return { data, error };
}

// updateCategory mengubah nama/tipe/status kategori.
export async function updateCategory(id: string, payload: Partial<Category>) {
  const supabase = createClient();
  // await menunggu respons Supabase selesai sebelum kode memakai data atau error yang dikembalikan.
  const { data, error } = await supabase
    .from('categories')
    .update(payload)
    .eq('id', id)
    .select()
    .single();
  // updateCategory mengirim hasil operasi Supabase: data untuk hasil sukses dan error untuk pesan gagal.
  return { data, error };
}

// updateCategoryOrder menyimpan urutan kategori setelah user mengatur ulang daftar kategori.
export async function updateCategoryOrder(categories: { id: string; order_index: number }[]) {
  const supabase = createClient();
  // map ini membuat pilihan kategori income/expense dari daftar kategori aktif.
  const promises = categories.map(cat =>
    supabase.from('categories').update({ order_index: cat.order_index }).eq('id', cat.id).select()
  );
  // await Promise.all menunggu beberapa query berjalan paralel sampai semuanya selesai.
  const results = await Promise.all(promises);
  const error = results.find(r => r.error)?.error;

  const emptyData = results.find(r => !r.error && (!r.data || r.data.length === 0));
  // Kondisi if (emptyData) membuat isi blok if di bawahnya hanya berjalan saat kondisi itu benar di helper kategori dan metode pembayaran.
  if (emptyData) {
    console.error('updateCategoryOrder: RLS blocking or wrong ID', emptyData);
    // emptyData mengembalikan hasil untuk helper kategori dan metode pembayaran, sesuai data yang dihitung tepat sebelum baris return ini.
    return { error: { message: 'Gagal menyimpan ke database (0 baris diubah).' } as any };
  }

  // Kalau Supabase mengembalikan error atau data kosong, helper kategori dan metode pembayaran menampilkan pesan gagal atau mengembalikan data kosong agar UI tidak rusak.
  if (!error) {
    // await menunggu respons Supabase selesai sebelum kode memakai data atau error yang dikembalikan.
    const { data: { user } } = await supabase.auth.getUser();
    // Kalau data user tersedia, lanjutkan proses yang membutuhkan akun login.
    if (user) {
      // await menunggu proses async selesai sebelum kode ini melanjutkan langkah berikutnya.
      await createAuditLog(user.id, 'update', 'Category Order', null, null, null);
    }
  }

  // updateCategoryOrder mengirim error dari Supabase supaya halaman bisa menampilkan toast gagal jika perlu.
  return { error };
}

// getPaymentMethods mengambil metode pembayaran aktif untuk form income/expense/invoice.
export async function getPaymentMethods(): Promise<PaymentMethod[]> {
  const supabase = createClient();
  // await menunggu respons Supabase selesai sebelum kode memakai data atau error yang dikembalikan.
  const { data, error } = await supabase.from('payment_methods').select('*').eq('is_active', true);
  // Kalau Supabase mengembalikan error atau data kosong, helper kategori dan metode pembayaran menampilkan pesan gagal atau mengembalikan data kosong agar UI tidak rusak.
  if (error) { console.error('getPaymentMethods:', error); return []; }
  // getPaymentMethods mengirim daftar hasil Supabase; kalau data kosong, halaman mendapat array kosong agar tabel tidak error.
  return data || [];
}
