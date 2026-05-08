"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon, SaveIcon, CloudUploadIcon } from "@astraicons/react/bold";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { CustomDatePicker } from "@/components/ui/CustomDatePicker";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { getCategories, getPaymentMethods, createExpense, Category, PaymentMethod } from "@/lib/db";

export default function TambahPengeluaranPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [amountDisplay, setAmountDisplay] = useState("");
  
  // Data for dropdowns
  const [categories, setCategories] = useState<Category[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  
  // Form State
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [vendor, setVendor] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [paymentMethodId, setPaymentMethodId] = useState("");
  const [status, setStatus] = useState("paid");
  const [amount, setAmount] = useState(0);
  const [notes, setNotes] = useState("");
  const [refNumber, setRefNumber] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const [catsData, paymentData] = await Promise.all([
        getCategories('expense'),
        getPaymentMethods()
      ]);
      setCategories(catsData);
      setPaymentMethods(paymentData);
      
      if (catsData.length > 0) setCategoryId(catsData[0].id);
      if (paymentData.length > 0) setPaymentMethodId(paymentData[0].id);
    };
    fetchData();
  }, []);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "");
    if (val) {
      const num = parseInt(val, 10);
      setAmountDisplay(new Intl.NumberFormat('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num));
      setAmount(num);
    } else {
      setAmountDisplay("");
      setAmount(0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount <= 0) return alert("Jumlah pengeluaran harus lebih dari 0");
    if (!vendor) return alert("Masukkan Nama Vendor / Tujuan");
    
    setLoading(true);
    try {
      await createExpense({
        date,
        expense_type: vendor,
        category_id: categoryId || null,
        payment_method_id: paymentMethodId || null,
        amount,
        reference_number: refNumber || null,
        status: status === "paid" ? "Paid" : "Pending",
        description: notes || null,
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
                <select 
                  className="flex h-10 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-primary shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  value={status}
                  onChange={e => setStatus(e.target.value)}
                >
                  <option value="paid">Lunas</option>
                  <option value="pending">Belum Dibayar (Utang)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">Metode Pembayaran</label>
                <CustomSelect 
                  placeholder="Pilih Metode Pembayaran"
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
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-border border-dashed rounded-xl bg-background/50 hover:bg-background transition-colors cursor-pointer group">
                <div className="space-y-1 text-center">
                  <CloudUploadIcon className="mx-auto h-12 w-12 text-text-muted group-hover:text-primary transition-colors" />
                  <div className="flex text-sm text-text-secondary justify-center">
                    <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary/80 focus-within:outline-none">
                      <span>Unggah file</span>
                      <input id="file-upload" name="file-upload" type="file" className="sr-only" />
                    </label>
                    <p className="pl-1">atau tarik dan lepas ke sini</p>
                  </div>
                  <p className="text-xs text-text-muted">Fitur ini belum aktif, ini hanya tampilan UI</p>
                </div>
              </div>
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
