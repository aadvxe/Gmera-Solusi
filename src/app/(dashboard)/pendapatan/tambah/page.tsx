"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeftIcon, SaveIcon, CloudUploadIcon, ChevronDownIcon } from "@astraicons/react/bold";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { CustomDatePicker } from "@/components/ui/CustomDatePicker";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { getClients, getCategories, getPaymentMethods, createIncome, getInvoicesByClient, Client, Category, PaymentMethod, Invoice } from "@/lib/db";
import { uploadFile } from "@/lib/storage";
import { formatRupiah, parseRupiah } from "@/lib/utils";

export default function TambahPendapatanPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [amountDisplay, setAmountDisplay] = useState("");
  
  // Data for dropdowns
  const [clients, setClients] = useState<Client[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  
  // Form State
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [clientId, setClientId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [paymentMethodId, setPaymentMethodId] = useState("");
  const [amount, setAmount] = useState(0);
  const [notes, setNotes] = useState("");
  const [refNumber, setRefNumber] = useState("");
  const [invoiceId, setInvoiceId] = useState("");
  const [clientInvoices, setClientInvoices] = useState<Invoice[]>([]);
  const [addTax, setAddTax] = useState(false);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
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
      if (paymentData.length > 0) setPaymentMethodId(paymentData[0].id);
    };
    fetchData();

    // Click outside handler for combobox
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch invoices when client changes
  useEffect(() => {
    const fetchClientInvoices = async () => {
      if (clientId && clientId !== "lainnya") {
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

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const parsed = parseRupiah(raw);
    setAmount(parsed);
    setAmountDisplay(parsed > 0 ? formatRupiah(parsed) : raw === "0" ? "0" : "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount <= 0) return alert("Jumlah pendapatan harus lebih dari 0");
    if (!clientId && !notes) return alert("Pilih Klien atau tambahkan Catatan Sumber");
    
    setLoading(true);
    try {
      const clientName = clients.find(c => c.id === clientId)?.name || "Lainnya";
      
      let finalAmount = amount;
      if (addTax) {
        finalAmount = Math.round(amount * 1.11); // Add 11% PPN
      }

      let attachmentUrl = null;
      if (attachment) {
        const { url, error } = await uploadFile(attachment, 'uploads');
        if (error) {
          toast.error("Gagal mengunggah file. Pastikan bucket 'uploads' sudah ada di Supabase.");
        } else {
          attachmentUrl = url;
        }
      }

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
                <label className="block text-sm font-medium text-text-primary mb-1.5">Klien / Sumber <span className="text-danger">*</span></label>
                <CustomSelect 
                  placeholder="Pilih Klien"
                  options={[
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
                        if (clientInvoices.length > 0) setIsDropdownOpen(true);
                        
                        // Check exact match
                        const matchedInv = clientInvoices.find(inv => inv.invoice_number === val);
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
                          .filter(inv => inv.invoice_number.toLowerCase().includes(refNumber.toLowerCase()) || refNumber === '')
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
