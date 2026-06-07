// Import createClient untuk membuka koneksi Supabase dari browser saat helper upload file ke Supabase Storage perlu membaca/menyimpan data.
import { createClient } from '@/utils/supabase/client';

// uploadFile mengirim file lampiran ke Supabase Storage lalu mengembalikan URL publiknya.
export async function uploadFile(file: File, bucket: string = 'uploads'): Promise<{ url: string | null; error: any }> {
  // try ini mengupload file ke Supabase Storage dan mengambil public URL untuk disimpan di transaksi/invoice.
  try {
    const supabase = createClient();
    
    // Create a unique file name
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    // await menunggu respons Supabase selesai sebelum kode memakai data atau error yang dikembalikan.
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    // Kalau Supabase mengembalikan error atau data kosong, helper upload storage menampilkan pesan gagal atau mengembalikan data kosong agar UI tidak rusak.
    if (error) {
      console.error('Error uploading file:', error);
      // uploadFile mengembalikan URL kosong dan error supaya halaman bisa menampilkan toast gagal upload.
      return { url: null, error };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    // filePath mengembalikan nilai yang dibutuhkan oleh helper upload storage.
    return { url: urlData.publicUrl, error: null };
  } catch (error) {
    console.error('Unexpected error during file upload:', error);
    // uploadFile mengembalikan URL kosong dan error supaya halaman bisa menampilkan toast gagal upload.
    return { url: null, error };
  }
}
