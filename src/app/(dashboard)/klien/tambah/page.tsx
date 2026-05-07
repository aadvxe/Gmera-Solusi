"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ArrowLeftIcon } from "@astraicons/react/bold";
import { toast } from "sonner";
import Link from "next/link";

export default function TambahKlienPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // MOCK SUBMIT
    setTimeout(() => {
      toast.success("Klien berhasil ditambahkan!");
      setIsSubmitting(false);
      router.push("/klien");
    }, 1000);
  };

  return (
    <div className="bg-surface border border-border rounded-2xl shadow-sm overflow-hidden flex flex-col h-full min-h-[500px]">
      <div className="p-6 border-b border-border flex items-center gap-4">
        <Link href="/klien" className="p-2 text-text-secondary hover:bg-background rounded-lg transition-colors">
          <ArrowLeftIcon className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Tambah Klien Baru</h1>
          <p className="text-sm text-text-secondary mt-1">Masukkan informasi detail klien untuk keperluan invoice dan penagihan.</p>
        </div>
      </div>

      <div className="p-6 overflow-y-auto flex-1">
        <form id="client-form" className="space-y-6 max-w-3xl" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-text-primary mb-1.5">Nama Klien / Perusahaan <span className="text-danger">*</span></label>
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
              <label className="block text-sm font-medium text-text-primary mb-1.5">Email Klien <span className="text-danger">*</span></label>
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
        <Link href="/klien">
          <Button variant="outline">Batal</Button>
        </Link>
        <Button 
          type="submit" 
          form="client-form" 
          disabled={isSubmitting}
          className="bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-70"
        >
          {isSubmitting ? "Menyimpan..." : "Simpan Klien"}
        </Button>
      </div>
    </div>
  );
}
