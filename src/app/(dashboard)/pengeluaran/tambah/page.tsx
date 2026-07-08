"use client";

// Import React hook yang dipakai form tambah pengeluaran untuk menyimpan biaya baru, misalnya untuk state, efek setelah render, atau referensi elemen.
import React, { useState, useEffect } from "react";
// Import Link supaya menu/tombol di form tambah pengeluaran untuk menyimpan biaya baru bisa berpindah halaman tanpa reload penuh.
import Link from "next/link";
// Import alat navigasi Next.js supaya form tambah pengeluaran untuk menyimpan biaya baru bisa pindah halaman atau membaca route aktif.
import { useRouter } from "next/navigation";
// Import ikon yang dipakai form tambah pengeluaran untuk menyimpan biaya baru untuk memperjelas tombol, menu, status, dan aksi di layar.
import { ArrowLeftIcon, SaveIcon, CloudUploadIcon } from "@astraicons/react/bold";
// Import komponen UI reusable supaya form tambah pengeluaran untuk menyimpan biaya baru memakai tampilan tombol, modal, input, atau tabel yang konsisten.
import { Button } from "@/components/ui/Button";
// Import komponen UI reusable supaya form tambah pengeluaran untuk menyimpan biaya baru memakai tampilan tombol, modal, input, atau tabel yang konsisten.
import { Input } from "@/components/ui/Input";
// Import komponen UI reusable supaya form tambah pengeluaran untuk menyimpan biaya baru memakai tampilan tombol, modal, input, atau tabel yang konsisten.
import { CustomDatePicker } from "@/components/ui/CustomDatePicker";
// Import komponen UI reusable supaya form tambah pengeluaran untuk menyimpan biaya baru memakai tampilan tombol, modal, input, atau tabel yang konsisten.
import { CustomSelect } from "@/components/ui/CustomSelect";
// Import helper database yang dipakai form tambah pengeluaran untuk menyimpan biaya baru untuk mengambil atau menyimpan data Supabase.
import { getCategories, getPaymentMethods, createExpense, Category, PaymentMethod } from "@/lib/db";
// Import uploadFile supaya form tambah pengeluaran untuk menyimpan biaya baru bisa mengirim lampiran ke Supabase Storage.
import { uploadFile } from "@/lib/storage";
// Import Sonner untuk menampilkan toast sukses/error di form tambah pengeluaran untuk menyimpan biaya baru.
import { toast } from "sonner";
// Import utility project supaya form tambah pengeluaran untuk menyimpan biaya baru bisa memformat class Tailwind atau angka Rupiah dengan cara yang sama.
import { formatRupiah, parseRupiah } from "@/lib/utils";
// Import Skeleton dan SkeletonForm untuk loading state.
import { Skeleton, SkeletonForm } from "@/components/ui/Skeleton";

// TambahPengeluaranPage menyimpan pengeluaran baru, termasuk kategori, metode pembayaran, item, dan lampiran.
export default function TambahPengeluaranPage() {
  const router = useRouter();
  // loading menyimpan nilai loading yang berubah saat user berinteraksi dengan form tambah pengeluaran untuk menyimpan biaya baru.
  const [loading, setLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  // amountDisplay menyimpan nilai amount display yang berubah saat user berinteraksi dengan form tambah pengeluaran untuk menyimpan biaya baru.
  const [amountDisplay, setAmountDisplay] = useState("");
  
  // Data for dropdowns
  const [categories, setCategories] = useState<Category[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  
  // Form State
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  // vendor menyimpan nilai vendor yang berubah saat user berinteraksi dengan form tambah pengeluaran untuk menyimpan biaya baru.
  const [vendor, setVendor] = useState("");
  // categoryId menyimpan nilai category id yang berubah saat user berinteraksi dengan form tambah pengeluaran untuk menyimpan biaya baru.
  const [categoryId, setCategoryId] = useState("");
  // paymentMethodId menyimpan nilai payment method id yang berubah saat user berinteraksi dengan form tambah pengeluaran untuk menyimpan biaya baru.
  const [paymentMethodId, setPaymentMethodId] = useState("");
  // status menyimpan nilai status yang berubah saat user berinteraksi dengan form tambah pengeluaran untuk menyimpan biaya baru.
  const [status, setStatus] = useState("paid");
  // amount menyimpan nilai amount yang berubah saat user berinteraksi dengan form tambah pengeluaran untuk menyimpan biaya baru.
  const [amount, setAmount] = useState(0);
  // notes menyimpan nilai notes yang berubah saat user berinteraksi dengan form tambah pengeluaran untuk menyimpan biaya baru.
  const [notes, setNotes] = useState("");
  // refNumber menyimpan nilai ref number yang berubah saat user berinteraksi dengan form tambah pengeluaran untuk menyimpan biaya baru.
  const [refNumber, setRefNumber] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);

  // Effect ini mengambil data yang diperlukan form tambah pengeluaran untuk menyimpan biaya baru saat halaman dibuka atau filter berubah.
  useEffect(() => {
    const fetchData = async () => {
      // await Promise.all menunggu beberapa query berjalan paralel sampai semuanya selesai.
      const [catsData, paymentData] = await Promise.all([
        getCategories('expense'),
        getPaymentMethods()
      ]);
      setCategories(catsData);
      setPaymentMethods(paymentData);
      
      // Kondisi ini mengecek jumlah item agar daftar kosong, pagination, atau total bisa ditangani dengan benar.
      if (catsData.length > 0) setCategoryId(catsData[0].id);
      // Kondisi ini mengecek jumlah item agar daftar kosong, pagination, atau total bisa ditangani dengan benar.
      if (paymentData.length > 0) setPaymentMethodId(paymentData[0].id);
      setIsInitialLoading(false);
    };
    fetchData();
  }, []);

  // handleAmountChange adalah fungsi penangan aksi user; fungsi ini berjalan saat user mengklik, mengetik, memilih, atau submit sesuatu.
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const parsed = parseRupiah(raw);
    setAmount(parsed);
    setAmountDisplay(parsed > 0 ? formatRupiah(parsed) : raw === "0" ? "0" : "");
  };

  // handleSubmit menangani aksi user di form tambah pengeluaran untuk menyimpan biaya baru, seperti klik tombol, submit form, atau perubahan input.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Kalau nominal kosong atau nol, formatter menampilkan nilai kosong/0 sesuai kebutuhan kartu ringkasan.
    if (!amount || amount <= 0) return alert("Jumlah pengeluaran harus lebih dari 0");
    // Kondisi if (!vendor) return alert("Masukkan Nama Vendor / Tujuan"); membuat isi blok if di bawahnya hanya berjalan saat kondisi itu benar di form tambah pengeluaran.
    if (!vendor) return alert("Masukkan Nama Vendor / Tujuan");
    
    setLoading(true);
    // try ini membaca, menyimpan, mengedit, menghapus, atau export data pengeluaran dari Supabase.
    try {
      let attachmentUrl = null;
      // Kalau user memilih lampiran, file diupload dulu sebelum invoice disimpan.
      if (attachment) {
        // await menunggu upload lampiran selesai agar invoice menyimpan URL file yang benar.
        const { url, error } = await uploadFile(attachment, 'uploads');
        // Kalau Supabase mengembalikan error atau data kosong, form tambah pengeluaran menampilkan pesan gagal atau mengembalikan data kosong agar UI tidak rusak.
        if (error) {
          toast.error("Gagal mengunggah file. Pastikan bucket 'uploads' sudah ada di Supabase.");
        } else {
          attachmentUrl = url;
        }
      }

      // await menunggu proses async selesai sebelum kode ini melanjutkan langkah berikutnya.
      await createExpense({
        date,
        expense_type: vendor,
        category_id: categoryId || null,
        payment_method_id: paymentMethodId || null,
        amount,
        reference_number: refNumber || null,
        status: status === "paid" ? "Paid" : "Pending",
        description: notes || null,
        attachment_url: attachmentUrl,
        created_by: null
      });
      
      router.push('/pengeluaran');
    } catch (error) {
      console.error(error);
      alert("Gagal menyimpan pengeluaran");
    } finally {
      setLoading(false);
    }
  };

  if (isInitialLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/pengeluaran">
            <button className="p-2 bg-surface border border-border rounded-xl hover:bg-background transition-colors text-text-secondary">
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
          </Link>
          <div className="space-y-2">
            <Skeleton className="h-8 w-48 bg-gray-200/60" />
            <Skeleton className="h-4 w-80 bg-gray-200/60" />
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-surface border border-border rounded-2xl p-6 md:p-8 shadow-sm">
          <SkeletonForm />
        </div>
      </div>
    );
  }

  // handleSubmit menampilkan UI untuk form tambah pengeluaran untuk menyimpan biaya baru.
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/pengeluaran">
          <button className="p-2 bg-surface border border-border rounded-xl hover:bg-background transition-colors text-text-secondary">
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Catat Pengeluaran</h1>
          <p className="text-sm text-text-secondary mt-1">Masukkan detail pengeluaran operasional baru</p>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-surface border border-border rounded-2xl shadow-sm p-6 md:p-8">
        <form className="space-y-8" onSubmit={handleSubmit}>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-text-primary border-b border-border pb-2">Informasi Dasar</h3>
              
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">Tanggal Transaksi <span className="text-danger">*</span></label>
                <CustomDatePicker value={date} onChange={setDate} />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">Vendor / Tujuan <span className="text-danger">*</span></label>
                <Input 
                  type="text" 
                  required 
                  placeholder="Nama Toko, Vendor, atau Penerima" 
                  value={vendor}
                  onChange={e => setVendor(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">Kategori <span className="text-danger">*</span></label>
                <CustomSelect 
                  placeholder="Pilih Kategori"
                  // map ini membuat pilihan kategori income/expense dari daftar kategori aktif.
                  options={categories.map(c => ({ value: c.id, label: c.name }))}
                  value={categoryId}
                  onChange={setCategoryId}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">No Referensi / Struk</label>
                <Input 
                  type="text" 
                  placeholder="REF-XXX" 
                  value={refNumber}
                  onChange={e => setRefNumber(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-text-primary border-b border-border pb-2">Detail Pembayaran</h3>
              
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">Jumlah <span className="text-danger">*</span></label>
                <Input 
                  icon={<span className="font-medium">Rp</span>}
                  type="text" 
                  required 
                  placeholder="0" 
                  className="font-medium text-lg text-danger text-right"
                  value={amountDisplay}
                  onChange={handleAmountChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">Status Pembayaran</label>
                <CustomSelect 
                  placeholder="Pilih Status"
                  options={[
                    { value: "paid", label: "Lunas" },
                    { value: "pending", label: "Belum Dibayar (Utang)" }
                  ]}
                  value={status}
                  onChange={setStatus}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">Metode Pembayaran</label>
                <CustomSelect 
                  placeholder="Pilih Metode Pembayaran"
                  // map ini membuat pilihan metode pembayaran dari data master pembayaran.
                  options={paymentMethods.map(p => ({ value: p.id, label: p.name }))}
                  value={paymentMethodId}
                  onChange={setPaymentMethodId}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <h3 className="text-lg font-semibold text-text-primary border-b border-border pb-2">Informasi Tambahan</h3>
            
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">Keterangan / Catatan</label>
              <textarea 
                className="flex w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-primary shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary min-h-[100px] resize-y"
                placeholder="Tambahkan rincian barang atau keperluan..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">Lampiran Bukti (Struk/Nota)</label>
              <label htmlFor="file-upload" className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-border border-dashed rounded-xl bg-background/50 hover:bg-background transition-colors cursor-pointer group relative">
                <div className="space-y-1 text-center">
                  <CloudUploadIcon className="mx-auto h-12 w-12 text-text-muted group-hover:text-primary transition-colors" />
                  <div className="flex text-sm text-text-secondary justify-center">
                    <div className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary/80 focus-within:outline-none">
                      <span>{attachment ? "Ganti file" : "Unggah file"}</span>
                      <input 
                        id="file-upload" 
                        name="file-upload" 
                        type="file" 
                        className="sr-only" 
                        onChange={e => {
                          // Kalau user memilih file dari input lampiran, simpan file itu ke state attachment.
                          if (e.target.files && e.target.files[0]) {
                            setAttachment(e.target.files[0]);
                          }
                        }}
                      />
                    </div>
                    {!attachment && <p className="pl-1">atau tarik dan lepas ke sini</p>}
                  </div>
                  {attachment ? (
                    <p className="text-sm font-medium text-text-primary mt-2">{attachment.name}</p>
                  ) : (
                    <p className="text-xs text-text-muted">PNG, JPG, PDF hingga 5MB</p>
                  )}
                </div>
              </label>
            </div>
          </div>

          <div className="pt-6 border-t border-border flex justify-end gap-3">
            <Link href="/pengeluaran">
              <Button variant="outline" type="button">Batal</Button>
            </Link>
            <Button type="submit" disabled={loading} className="flex items-center gap-2 bg-[#FA5A7D] hover:bg-[#e04868] text-white border-transparent">
              <SaveIcon className="w-4 h-4" /> {loading ? "Menyimpan..." : "Simpan Data"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
