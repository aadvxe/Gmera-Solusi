// Import createClient untuk membuka koneksi Supabase dari browser saat helper database untuk user, profil perusahaan, dan audit log perlu membaca/menyimpan data.
import { createClient } from '@/utils/supabase/client';
// Import type dari ./types supaya helper database untuk user, profil perusahaan, dan audit log tahu bentuk data tanpa mengubah hasil JavaScript.
import type { UserProfile, CompanyProfile } from './types';

// ─── USER PROFILE ─────────────────────────────────────────────────────────────

export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  const supabase = createClient();
  // await menunggu respons Supabase selesai sebelum kode memakai data atau error yang dikembalikan.
  const { data: { user } } = await supabase.auth.getUser();
  // Kalau belum ada akun Supabase yang login, hentikan proses yang membutuhkan profil user.
  if (!user) return null;

  // await menunggu respons Supabase selesai sebelum kode memakai data atau error yang dikembalikan.
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  // Kalau Supabase mengembalikan error atau data kosong, helper user/profil/audit log menampilkan pesan gagal atau mengembalikan data kosong agar UI tidak rusak.
  if (error || !data) return null;
  // getCurrentUserProfile mengirim profil dari tabel users supaya halaman profil dan pengaturan memakai nama, role, dan data tambahan milik user login.
  return data;
}

// updateProfile menyimpan perubahan profil user yang sedang login.
export async function updateProfile(payload: Partial<UserProfile>) {
  const supabase = createClient();
  // await menunggu respons Supabase selesai sebelum kode memakai data atau error yang dikembalikan.
  const { data: { user } } = await supabase.auth.getUser();
  // Kalau Supabase mengembalikan error atau data kosong, helper user/profil/audit log menampilkan pesan gagal atau mengembalikan data kosong agar UI tidak rusak.
  if (!user) return { error: 'Not authenticated' };

  // await menunggu respons Supabase selesai sebelum kode memakai data atau error yang dikembalikan.
  const { data, error } = await supabase
    .from('users')
    .update(payload)
    .eq('id', user.id)
    .select()
    .single();

  // updateProfile mengirim hasil operasi Supabase: data untuk hasil sukses dan error untuk pesan gagal.
  return { data, error };
}

// getAllUsers mengambil semua user untuk tab Pengguna di pengaturan.
export async function getAllUsers(): Promise<UserProfile[]> {
  const supabase = createClient();
  // await menunggu respons Supabase selesai sebelum kode memakai data atau error yang dikembalikan.
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('name', { ascending: true });

  // Kalau Supabase mengembalikan error atau data kosong, helper user/profil/audit log menampilkan pesan gagal atau mengembalikan data kosong agar UI tidak rusak.
  if (error) { console.error('getAllUsers:', error); return []; }
  // getAllUsers mengirim daftar hasil Supabase; kalau data kosong, halaman mendapat array kosong agar tabel tidak error.
  return data || [];
}

// updateUserRole mengubah role user dan mencatat perubahan itu ke audit log.
export async function updateUserRole(id: string, role: string) {
  const supabase = createClient();
  // await menunggu respons Supabase selesai sebelum kode memakai data atau error yang dikembalikan.
  const { data, error } = await supabase
    .from('users')
    .update({ role })
    .eq('id', id)
    .select()
    .single();
    
  // Kalau Supabase mengembalikan error atau data kosong, helper user/profil/audit log menampilkan pesan gagal atau mengembalikan data kosong agar UI tidak rusak.
  if (!error && data) {
    // await menunggu respons Supabase selesai sebelum kode memakai data atau error yang dikembalikan.
    const { data: { user } } = await supabase.auth.getUser();
    // Kalau data user tersedia, lanjutkan proses yang membutuhkan akun login.
    if (user) await createAuditLog(user.id, 'update', 'Category Order', null, null, { role, system_type: 'user_role', target_user_id: id });
  }
  
  // updateUserRole mengirim hasil operasi Supabase: data untuk hasil sukses dan error untuk pesan gagal.
  return { data, error };
}

// deleteUser menonaktifkan user tanpa menghapus data historisnya.
export async function deleteUser(id: string) {
  const supabase = createClient();
  // Soft-delete: preserve audit trail by setting is_active = false
  const { error } = await supabase.from('users').update({ is_active: false }).eq('id', id);
  // Kalau Supabase mengembalikan error atau data kosong, helper user/profil/audit log menampilkan pesan gagal atau mengembalikan data kosong agar UI tidak rusak.
  if (!error) {
    // await menunggu respons Supabase selesai sebelum kode memakai data atau error yang dikembalikan.
    const { data: { user } } = await supabase.auth.getUser();
    // Kalau data user tersedia, lanjutkan proses yang membutuhkan akun login.
    if (user) await createAuditLog(user.id, 'delete', 'Category Order', null, null, { is_active: false, system_type: 'user_status', target_user_id: id });
  }
  // deleteUser mengirim error dari Supabase supaya halaman bisa menampilkan toast gagal jika perlu.
  return { error };
}

// ─── COMPANY PROFILE ──────────────────────────────────────────────────────────

export async function getCompanyProfile(): Promise<CompanyProfile | null> {
  const supabase = createClient();
  // await menunggu respons Supabase selesai sebelum kode memakai data atau error yang dikembalikan.
  const { data, error } = await supabase
    .from('company_profile')
    .select('*')
    .single();

  // Kalau Supabase mengembalikan error atau data kosong, helper user/profil/audit log menampilkan pesan gagal atau mengembalikan data kosong agar UI tidak rusak.
  if (error) return null;
  // deleteUser mengirim data Supabase yang berhasil ditemukan ke halaman pemanggil.
  return data;
}

// updateCompanyProfile menyimpan profil/pajak/rekening perusahaan dan mencatat audit log.
export async function updateCompanyProfile(payload: Partial<CompanyProfile>) {
  const supabase = createClient();
  // await menunggu proses async selesai sebelum kode ini melanjutkan langkah berikutnya.
  const company = await getCompanyProfile();
  // Kalau Supabase mengembalikan error atau data kosong, helper user/profil/audit log menampilkan pesan gagal atau mengembalikan data kosong agar UI tidak rusak.
  if (!company) return { error: 'Company profile not found' };

  // await menunggu respons Supabase selesai sebelum kode memakai data atau error yang dikembalikan.
  const { data, error } = await supabase
    .from('company_profile')
    .update(payload)
    .eq('id', company.id)
    .select()
    .single();

  // Kalau Supabase mengembalikan error atau data kosong, helper user/profil/audit log menampilkan pesan gagal atau mengembalikan data kosong agar UI tidak rusak.
  if (!error && data) {
    // await menunggu respons Supabase selesai sebelum kode memakai data atau error yang dikembalikan.
    const { data: { user } } = await supabase.auth.getUser();
    // Kalau data user tersedia, lanjutkan proses yang membutuhkan akun login.
    if (user) {
      // Kondisi ini mengecek jumlah item agar daftar kosong, pagination, atau total bisa ditangani dengan benar.
      if ('tax_rate' in payload && Object.keys(payload).length === 1) {
        // await menunggu proses async selesai sebelum kode ini melanjutkan langkah berikutnya.
        await createAuditLog(user.id, 'update', 'Category Order', null, null, { ...payload, system_type: 'tax_rate' });
      } else {
        const isPayment = 'bank_name' in payload || 'bank_account' in payload;
        // await menunggu proses async selesai sebelum kode ini melanjutkan langkah berikutnya.
        await createAuditLog(user.id, 'update', 'Category Order', null, null, { ...payload, system_type: isPayment ? 'payment_method' : 'company_profile' });
      }
    }
  }

  // updateCompanyProfile mengirim hasil operasi Supabase: data untuk hasil sukses dan error untuk pesan gagal.
  return { data, error };
}

// ─── AUDIT LOG ────────────────────────────────────────────────────────────────

export async function createAuditLog(
  user_id: string,
  action: 'create' | 'update' | 'delete' | 'view' | 'export' | 'login' | 'logout',
  entity_type: string,
  entity_id?: string | null,
  old_values?: any,
  new_values?: any
) {
  const supabase = createClient();
  // await menunggu respons Supabase selesai sebelum kode memakai data atau error yang dikembalikan.
  const { error } = await supabase.from('audit_logs').insert([{
    user_id,
    action,
    entity_type,
    entity_id: entity_id || null,
    old_values: old_values || null,
    new_values: new_values || null
  }]);
  
  // Kalau Supabase mengembalikan error atau data kosong, helper user/profil/audit log menampilkan pesan gagal atau mengembalikan data kosong agar UI tidak rusak.
  if (error) {
    console.error('[createAuditLog] Error inserting audit log:', error);
  }
}
