"use client";

// Import React hook yang dipakai form tambah pendapatan untuk menyimpan pemasukan baru, misalnya untuk state, efek setelah render, atau referensi elemen.
import React, { useState, useEffect, useRef } from "react";
// Import Link supaya menu/tombol di form tambah pendapatan untuk menyimpan pemasukan baru bisa berpindah halaman tanpa reload penuh.
import Link from "next/link";
// Import alat navigasi Next.js supaya form tambah pendapatan untuk menyimpan pemasukan baru bisa pindah halaman atau membaca route aktif.
import { useRouter } from "next/navigation";
// Import Sonner untuk menampilkan toast sukses/error di form tambah pendapatan untuk menyimpan pemasukan baru.
import { toast } from "sonner";
// Import ikon yang dipakai form tambah pendapatan untuk menyimpan pemasukan baru untuk memperjelas tombol, menu, status, dan aksi di layar.
import { ArrowLeftIcon, SaveIcon, CloudUploadIcon, ChevronDownIcon } from "@astraicons/react/bold";
// Import komponen UI reusable supaya form tambah pendapatan untuk menyimpan pemasukan baru memakai tampilan tombol, modal, input, atau tabel yang konsisten.
import { Button } from "@/components/ui/Button";
// Import komponen UI reusable supaya form tambah pendapatan untuk menyimpan pemasukan baru memakai tampilan tombol, modal, input, atau tabel yang konsisten.
import { Input } from "@/components/ui/Input";
// Import komponen UI reusable supaya form tambah pendapatan untuk menyimpan pemasukan baru memakai tampilan tombol, modal, input, atau tabel yang konsisten.
import { CustomDatePicker } from "@/components/ui/CustomDatePicker";
// Import komponen UI reusable supaya form tambah pendapatan untuk menyimpan pemasukan baru memakai tampilan tombol, modal, input, atau tabel yang konsisten.
import { CustomSelect } from "@/components/ui/CustomSelect";
// Import helper database yang dipakai form tambah pendapatan untuk menyimpan pemasukan baru untuk mengambil atau menyimpan data Supabase.
import { getClients, getCategories, getPaymentMethods, createIncome, getInvoicesByClient, Client, Category, PaymentMethod, Invoice } from "@/lib/db";
// Import uploadFile supaya form tambah pendapatan untuk menyimpan pemasukan baru bisa mengirim lampiran ke Supabase Storage.
import { uploadFile } from "@/lib/storage";
// Import utility project supaya form tambah pendapatan untuk menyimpan pemasukan baru bisa memformat class Tailwind atau angka Rupiah dengan cara yang sama.
import { formatRupiah, parseRupiah } from "@/lib/utils";
// Import Skeleton dan SkeletonForm untuk loading state yang premium.
import { Skeleton, SkeletonForm } from "@/components/ui/Skeleton";

// TambahPendapatanPage menyimpan pemasukan baru, termasuk kategori, metode pembayaran, item, dan lampiran.
export default function TambahPendapatanPage() {
  const router = useRouter();
  // loading menyimpan nilai loading yang berubah saat user berinteraksi dengan form tambah pendapatan untuk menyimpan pemasukan baru.
  const [loading, setLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  // amountDisplay menyimpan nilai amount display yang berubah saat user berinteraksi dengan form tambah pendapatan untuk menyimpan pemasukan baru.
  const [amountDisplay, setAmountDisplay] = useState("");
  
  // Data for dropdowns
  const [clients, setClients] = useState<Client[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  
  // Form State
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  // clientId menyimpan nilai client id yang berubah saat user berinteraksi dengan form tambah pendapatan untuk menyimpan pemasukan baru.
  const [clientId, setClientId] = useState("");
  // categoryId menyimpan nilai category id yang berubah saat user berinteraksi dengan form tambah pendapatan untuk menyimpan pemasukan baru.
  const [categoryId, setCategoryId] = useState("");
  // paymentMethodId menyimpan nilai payment method id yang berubah saat user berinteraksi dengan form tambah pendapatan untuk menyimpan pemasukan baru.
  const [paymentMethodId, setPaymentMethodId] = useState("");
  // amount menyimpan nilai amount yang berubah saat user berinteraksi dengan form tambah pendapatan untuk menyimpan pemasukan baru.
  const [amount, setAmount] = useState(0);
  // notes menyimpan nilai notes yang berubah saat user berinteraksi dengan form tambah pendapatan untuk menyimpan pemasukan baru.
  const [notes, setNotes] = useState("");
  // refNumber menyimpan nilai ref number yang berubah saat user berinteraksi dengan form tambah pendapatan untuk menyimpan pemasukan baru.
  const [refNumber, setRefNumber] = useState("");
  // invoiceId menyimpan nilai invoice id yang berubah saat user berinteraksi dengan form tambah pendapatan untuk menyimpan pemasukan baru.
  const [invoiceId, setInvoiceId] = useState("");
  const [clientInvoices, setClientInvoices] = useState<Invoice[]>([]);
  // addTax menyimpan nilai add tax yang berubah saat user berinteraksi dengan form tambah pendapatan untuk menyimpan pemasukan baru.
  const [addTax, setAddTax] = useState(false);
  const [attachment, setAttachment] = useState<File | null>(null);
  // isDropdownOpen menyimpan nilai is dropdown open yang berubah saat user berinteraksi dengan form tambah pendapatan untuk menyimpan pemasukan baru.
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Effect ini menutup dropdown/modal kecil ketika user klik area di luar komponennya.
  useEffect(() => {
    // fetchData mengambil data yang dibutuhkan form tambah pendapatan untuk menyimpan pemasukan baru dari Supabase lalu mengisi state halaman.
    const fetchData = async () => {
      // await Promise.all menunggu beberapa query berjalan paralel sampai semuanya selesai.
      const [clientsData, catsData, paymentData] = await Promise.all([
        getClients(),
        getCategories('income'),
        getPaymentMethods()
      ]);
      setClients(clientsData);
      setCategories(catsData);
      setPaymentMethods(paymentData);
      
      // Auto select first option if available
      if (catsData.length > 0) setCategoryId(catsData[0].id);
      // Kondisi ini mengecek jumlah item agar daftar kosong, pagination, atau total bisa ditangani dengan benar.
      if (paymentData.length > 0) setPaymentMethodId(paymentData[0].id);
      setIsInitialLoading(false);
    };
    fetchData();

    // Click outside handler for combobox
    function handleClickOutside(event: MouseEvent) {
      // Kondisi if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) membuat isi blok if di bawahnya hanya berjalan saat kondisi itu benar di form tambah pendapatan.
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    // fetchData menampilkan UI untuk form tambah pendapatan untuk menyimpan pemasukan baru.
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch invoices when client changes
  useEffect(() => {
    // fetchClientInvoices mengambil data yang dibutuhkan form tambah pendapatan untuk menyimpan pemasukan baru dari Supabase lalu mengisi state halaman.
    const fetchClientInvoices = async () => {
      // Kondisi if (clientId && clientId !== "lainnya") membuat isi blok if di bawahnya hanya berjalan saat kondisi itu benar di form tambah pendapatan.
      if (clientId && clientId !== "lainnya") {
        // await menunggu proses async selesai sebelum kode ini melanjutkan langkah berikutnya.
        const data = await getInvoicesByClient(clientId);
        // Filter to only show unpaid/overdue invoices
        setClientInvoices(data.filter(inv => inv.status !== 'paid' && inv.status !== 'cancelled'));
      } else {
        setClientInvoices([]);
        setInvoiceId("");
      }
    };
    fetchClientInvoices();
  }, [clientId]);

  // handleAmountChange adalah fungsi penangan aksi user; fungsi ini berjalan saat user mengklik, mengetik, memilih, atau submit sesuatu.
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const parsed = parseRupiah(raw);
    setAmount(parsed);
    setAmountDisplay(parsed > 0 ? formatRupiah(parsed) : raw === "0" ? "0" : "");
  };

  // handleSubmit menangani aksi user di form tambah pendapatan untuk menyimpan pemasukan baru, seperti klik tombol, submit form, atau perubahan input.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Kalau nominal kosong atau nol, formatter menampilkan nilai kosong/0 sesuai kebutuhan kartu ringkasan.
    if (!amount || amount <= 0) return alert("Jumlah pendapatan harus lebih dari 0");
    // Kalau customer belum dipilih, proses simpan invoice dihentikan dan modal peringatan ditampilkan.
    if (!clientId && !notes) return alert("Pilih Customer atau tambahkan Catatan Sumber");
    
    setLoading(true);
    // try ini membaca, menyimpan, mengedit, menghapus, atau export data pendapatan dari Supabase.
    try {
      const clientName = clients.find(c => c.id === clientId)?.name || "Lainnya";
      
      let finalAmount = amount;
      // Kondisi if (addTax) membuat isi blok if di bawahnya hanya berjalan saat kondisi itu benar di form tambah pendapatan.
      if (addTax) {
        finalAmount = Math.round(amount * 1.11); // Add 11% PPN
      }

      let attachmentUrl = null;
      // Kalau user memilih lampiran, file diupload dulu sebelum invoice disimpan.
      if (attachment) {
        // await menunggu upload lampiran selesai agar invoice menyimpan URL file yang benar.
        const { url, error } = await uploadFile(attachment, 'uploads');
        // Kalau Supabase mengembalikan error atau data kosong, form tambah pendapatan menampilkan pesan gagal atau mengembalikan data kosong agar UI tidak rusak.
        if (error) {
          toast.error("Gagal mengunggah file. Pastikan bucket 'uploads' sudah ada di Supabase.");
        } else {
          attachmentUrl = url;
        }
      }

      // await menunggu proses async selesai sebelum kode ini melanjutkan langkah berikutnya.
      await createIncome({
        date,
        source: clientId ? clientName : notes.substring(0, 50),
        category_id: categoryId || null,
        payment_method_id: paymentMethodId || null,
        amount: finalAmount,
        reference_number: refNumber || null,
        invoice_id: invoiceId || null,
        entry_method: 'manual',
        status: 'paid', // Default to paid for direct income
        description: notes || null,
        attachment_url: attachmentUrl,
        created_by: null // handled by RLS typically
      });
      
      toast.success("Pendapatan", {
        description: `Berhasil dicatat: Rp ${finalAmount.toLocaleString('id-ID')} dari ${clientName}`
      });
      
      // Auto-update the Navbar notifications
      window.dispatchEvent(new Event('refreshNotifications'));

      router.push('/pendapatan');
    } catch (error) {
      console.error(error);
      toast.error("Gagal menyimpan pendapatan");
    } finally {
      setLoading(false);
    }
  };

  if (isInitialLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/pendapatan">
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

  // handleSubmit menampilkan UI untuk form tambah pendapatan untuk menyimpan pemasukan baru.
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/pendapatan">
          <button className="p-2 bg-surface border border-border rounded-xl hover:bg-background transition-colors text-text-secondary">
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Catat Pendapatan</h1>
          <p className="text-sm text-text-secondary mt-1">Masukkan detail transaksi pemasukan baru</p>
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
                <label className="block text-sm font-medium text-text-primary mb-1.5">Customer / Sumber <span className="text-danger">*</span></label>
                <CustomSelect 
                  placeholder="Pilih Customer"
                  options={[
                    // map ini membuat opsi/baris customer dari data clients yang sudah diambil dari Supabase.
                    ...clients.map(c => ({ value: c.id, label: c.name })),
                    { value: "lainnya", label: "Tunai / Lainnya" }
                  ]}
                  value={clientId}
                  onChange={setClientId}
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
                <label className="block text-sm font-medium text-text-primary mb-1.5">No Referensi / Invoice</label>
                <div className="relative" ref={dropdownRef}>
                  <div className="relative flex items-center">
                    <input 
                      type="text" 
                      className="flex h-10 w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text-primary shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5C67F2]/20 focus-visible:border-[#5C67F2] transition-all"
                      placeholder="Ketik manual atau pilih invoice..." 
                      value={refNumber} 
                      onFocus={() => clientInvoices.length > 0 && setIsDropdownOpen(true)}
                      onChange={e => {
                        const val = e.target.value;
                        setRefNumber(val);
                        // Kondisi ini mengecek jumlah item agar daftar kosong, pagination, atau total bisa ditangani dengan benar.
                        if (clientInvoices.length > 0) setIsDropdownOpen(true);
                        
                        // Check exact match
                        const matchedInv = clientInvoices.find(inv => inv.invoice_number === val);
                        // Kondisi if (matchedInv) membuat isi blok if di bawahnya hanya berjalan saat kondisi itu benar di form tambah pendapatan.
                        if (matchedInv) {
                          setInvoiceId(matchedInv.id);
                          setAmount(matchedInv.grand_total);
                          setAmountDisplay(new Intl.NumberFormat('id-ID').format(matchedInv.grand_total));
                        } else {
                          setInvoiceId("");
                        }
                      }} 
                    />
                    {clientInvoices.length > 0 && (
                      <ChevronDownIcon 
                        className={`absolute right-3 w-4 h-4 text-gray-400 transition-transform cursor-pointer ${isDropdownOpen ? 'rotate-180' : ''}`} 
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      />
                    )}
                  </div>
                  
                   {isDropdownOpen && clientInvoices.length > 0 && (
                    <div className="absolute z-[100] w-full mt-1 bg-white border border-gray-100 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] overflow-hidden">
                      <ul className="max-h-60 overflow-auto p-1.5 space-y-0.5 scrollbar-none">
                        {clientInvoices
                          // filter ini menyisakan data form tambah pendapatan yang cocok dengan pencarian, status, role, atau tanggal aktif.
                          .filter(inv => inv.invoice_number.toLowerCase().includes(refNumber.toLowerCase()) || refNumber === '')
                          // map ini membuat satu output untuk setiap item daftar yang sedang dirender oleh form tambah pendapatan.
                          .map(inv => (
                          <li 
                            key={inv.id}
                            className={`px-3 py-2 text-sm cursor-pointer transition-all select-none rounded-xl flex justify-between items-center ${invoiceId === inv.id ? 'bg-[#5C67F2]/10 text-[#5C67F2] font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}
                            onClick={() => {
                              setInvoiceId(inv.id);
                              setRefNumber(inv.invoice_number);
                              setAmount(inv.grand_total);
                              setAmountDisplay(formatRupiah(inv.grand_total));
                              setIsDropdownOpen(false);
                            }}
                          >
                            <span>{inv.invoice_number}</span>
                            <span className="text-xs font-semibold">Rp {inv.grand_total.toLocaleString('id-ID')}</span>
                          </li>
                        ))}
                        {/* filter ini menyisakan data form tambah pendapatan yang cocok dengan pencarian, status, role, atau tanggal aktif. */}
                        {clientInvoices.filter(inv => inv.invoice_number.toLowerCase().includes(refNumber.toLowerCase())).length === 0 && (
                          <li className="px-3 py-2 text-sm text-gray-500 text-center italic">Tidak ada invoice yang cocok</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
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
                  className="font-medium text-lg text-right"
                  value={amountDisplay}
                  onChange={handleAmountChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">Pajak PPN (11%)</label>
                <div className="flex items-center gap-3">
                  <input 
                    type="checkbox" 
                    id="ppn" 
                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary" 
                    checked={addTax}
                    onChange={e => setAddTax(e.target.checked)}
                  />
                  <label htmlFor="ppn" className="text-sm text-text-secondary cursor-pointer">Tambahkan PPN 11% secara otomatis</label>
                </div>
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
                placeholder="Tambahkan catatan terkait transaksi ini..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">Lampiran Bukti (Opsional)</label>
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
            <Link href="/pendapatan">
              <Button variant="outline" type="button">Batal</Button>
            </Link>
            <Button type="submit" disabled={loading} className="flex items-center gap-2 bg-[#5C67F2] hover:bg-[#4a55c2] text-white">
              <SaveIcon className="w-4 h-4" /> {loading ? "Menyimpan..." : "Simpan Data"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
