"use client";

// Import React hook yang dipakai form tambah customer untuk menyimpan pelanggan baru, misalnya untuk state, efek setelah render, atau referensi elemen.
import React, { useState } from "react";
// Import alat navigasi Next.js supaya form tambah customer untuk menyimpan pelanggan baru bisa pindah halaman atau membaca route aktif.
import { useRouter } from "next/navigation";
// Import komponen UI reusable supaya form tambah customer untuk menyimpan pelanggan baru memakai tampilan tombol, modal, input, atau tabel yang konsisten.
import { Button } from "@/components/ui/Button";
// Import komponen UI reusable supaya form tambah customer untuk menyimpan pelanggan baru memakai tampilan tombol, modal, input, atau tabel yang konsisten.
import { Input } from "@/components/ui/Input";
// Import ikon yang dipakai form tambah customer untuk menyimpan pelanggan baru untuk memperjelas tombol, menu, status, dan aksi di layar.
import { ArrowLeftIcon } from "@astraicons/react/bold";
// Import Sonner untuk menampilkan toast sukses/error di form tambah customer untuk menyimpan pelanggan baru.
import { toast } from "sonner";
// Import Link supaya menu/tombol di form tambah customer untuk menyimpan pelanggan baru bisa berpindah halaman tanpa reload penuh.
import Link from "next/link";

// Import authStore supaya form tambah customer untuk menyimpan pelanggan baru bisa membaca user login, role, nama tampilan, atau mengosongkan session saat logout.
import { useAuthStore } from "@/store/authStore";

// TambahCustomerPage mengumpulkan data customer baru lalu menyimpannya ke tabel clients.
export default function TambahCustomerPage() {
  const router = useRouter();
  // isSubmitting menyimpan nilai is submitting yang berubah saat user berinteraksi dengan form tambah customer untuk menyimpan pelanggan baru.
  const [isSubmitting, setIsSubmitting] = useState(false);
  const role = useAuthStore(state => state.role);

  // Kondisi ini mengecek role agar menu/fitur yang tampil sesuai hak akses user.
  if (role === 'viewer') {
    // TambahCustomerPage menampilkan UI untuk form tambah customer untuk menyimpan pelanggan baru.
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center bg-white rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-text-primary mb-2">Akses Ditolak</h2>
        <p className="text-sm text-text-secondary">Anda tidak memiliki hak akses untuk membuka halaman Customer.</p>
      </div>
    );
  }

  // handleSubmit adalah fungsi penangan aksi user; fungsi ini berjalan saat user mengklik, mengetik, memilih, atau submit sesuatu.
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // MOCK SUBMIT
    setTimeout(() => {
      toast.success("Customer berhasil ditambahkan!");
      setIsSubmitting(false);
      router.push("/customer");
    }, 1000);
  };

  // TambahCustomerPage menampilkan UI untuk form tambah customer untuk menyimpan pelanggan baru.
  return (
    <div className="bg-surface border border-border rounded-2xl shadow-sm flex flex-col h-full min-h-[500px]">
      <div className="p-6 border-b border-border flex items-center gap-4">
        <Link href="/customer" className="p-2 text-text-secondary hover:bg-background rounded-lg transition-colors">
          <ArrowLeftIcon className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Tambah Customer Baru</h1>
          <p className="text-sm text-text-secondary mt-1">Masukkan informasi detail customer untuk keperluan invoice dan penagihan.</p>
        </div>
      </div>

      <div className="p-6 overflow-y-auto flex-1">
        <form id="client-form" className="space-y-6 max-w-3xl" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-text-primary mb-1.5">Nama Customer / Perusahaan <span className="text-danger">*</span></label>
              <Input type="text" required placeholder="Contoh: PT Bangun Persada" className="bg-background border-border" />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-text-primary mb-1.5">NPWP <span className="text-text-muted font-normal">(Opsional)</span></label>
              <Input type="text" placeholder="Format: 00.000.000.0-000.000" className="bg-background border-border" />
            </div>
            
            <div className="md:col-span-2 border-t border-border pt-6">
              <h3 className="font-semibold text-text-primary mb-4">Informasi Kontak</h3>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">Nomor Telepon <span className="text-danger">*</span></label>
              <Input type="text" required placeholder="0812-xxxx-xxxx" className="bg-background border-border" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">Email Customer <span className="text-danger">*</span></label>
              <Input type="email" required placeholder="email@perusahaan.com" className="bg-background border-border" />
            </div>
            
            <div className="md:col-span-2 border-t border-border pt-6">
              <h3 className="font-semibold text-text-primary mb-4">Informasi Alamat</h3>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-text-primary mb-1.5">Alamat Lengkap <span className="text-danger">*</span></label>
              <textarea required rows={3} className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none" placeholder="Nama jalan, gedung, blok..." />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">Kota / Kabupaten</label>
              <Input type="text" placeholder="Kota" className="bg-background border-border" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">Kode Pos</label>
              <Input type="text" placeholder="Kode Pos" className="bg-background border-border" />
            </div>
            
            <div className="md:col-span-2 border-t border-border pt-6">
              <label className="block text-sm font-medium text-text-primary mb-1.5">Catatan Tambahan <span className="text-text-muted font-normal">(Opsional)</span></label>
              <textarea rows={2} className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none" placeholder="Informasi kontak darurat atau catatan lainnya..." />
            </div>
          </div>
        </form>
      </div>

      <div className="p-6 border-t border-border bg-background/50 flex justify-end gap-3 shrink-0">
        <Link href="/customer">
          <Button variant="outline">Batal</Button>
        </Link>
        <Button 
          type="submit" 
          form="client-form" 
          disabled={isSubmitting}
          className="bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-70"
        >
          {isSubmitting ? "Menyimpan..." : "Simpan Customer"}
        </Button>
      </div>
    </div>
  );
}
