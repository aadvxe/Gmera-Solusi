"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon, SaveIcon, PlusIcon, TrashIcon, Document1Icon, TruckIcon, CalculatorIcon, CheckCircleIcon, PrinterIcon, CloseIcon } from "@astraicons/react/bold";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { getClients, createInvoiceWithItems, Client, getCompanyProfile, CompanyProfile } from "@/lib/db";
import { Modal } from "@/components/ui/Modal";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { formatRupiah, parseRupiah, formatCurrency } from "@/lib/utils";
import { CustomDatePicker } from "@/components/ui/CustomDatePicker";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { uploadFile } from "@/lib/storage";
import { toast } from "sonner";
import { createAuditLog } from "@/lib/db/users";
import { useAuthStore } from "@/store/authStore";

interface InvoiceItem {
  id: number;
  name: string;
  qty: number;
  unit: string;
  price: number;
}

function splitAddress(addressStr: string) {
  if (!addressStr) return { line1: "", line2: "" };
  const normalized = addressStr.replace(/\r\n/g, "\n");
  const lastNewlineIndex = normalized.lastIndexOf("\n");
  if (lastNewlineIndex !== -1) {
    const line1 = normalized.substring(0, lastNewlineIndex).trim();
    const line2 = normalized.substring(lastNewlineIndex + 1).trim();
    return { line1, line2 };
  }
  const lastCommaIndex = normalized.lastIndexOf(",");
  if (lastCommaIndex === -1) {
    return { line1: normalized, line2: "" };
  }
  const line1 = normalized.substring(0, lastCommaIndex + 1).trim();
  const line2 = normalized.substring(lastCommaIndex + 1).trim();
  return { line1, line2 };
}

interface PageData {
  pageNumber: number;
  items: any[];
  isLastPage: boolean;
}

function getPages(itemsList: any[]): PageData[] {
  if (!itemsList || itemsList.length === 0) {
    return [{ pageNumber: 1, items: [], isLastPage: true }];
  }
  const pages: PageData[] = [];
  let remaining = [...itemsList];
  let pageNum = 1;
  while (remaining.length > 0) {
    const isFirst = pageNum === 1;
    const limitWithSummary = 3;
    if (remaining.length <= limitWithSummary) {
      pages.push({
        pageNumber: pageNum,
        items: remaining,
        isLastPage: true
      });
      break;
    }
    const limitNoSummary = 5;
    let itemsToTake = limitNoSummary;
    if (remaining.length - itemsToTake < 1) {
      itemsToTake = remaining.length - 1;
    }
    pages.push({
      pageNumber: pageNum,
      items: remaining.splice(0, itemsToTake),
      isLastPage: false
    });
    pageNum++;
  }
  return pages;
}

export default function BuatInvoicePage() {
  const router = useRouter();
  const user = useAuthStore(state => state.user);
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);

  // Form State
  const [invoiceNumber, setInvoiceNumber] = useState(`INV-${Date.now().toString().slice(-6)}`);
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState("");
  const [clientId, setClientId] = useState("");
  const [shippingMethod, setShippingMethod] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [estimatedArrival, setEstimatedArrival] = useState("");
  const [notes, setNotes] = useState("Terima kasih atas bisnis Anda bersama PT GMera Solusi. Pembayaran harap ditransfer ke rekening BCA 1234567890 a.n PT GMera Solusi.");

  const [items, setItems] = useState<InvoiceItem[]>([
    { id: 1, name: "", qty: 1, unit: "Pcs", price: 0 }
  ]);
  
  const [shippingCost, setShippingCost] = useState(0);
  const [shippingAddress, setShippingAddress] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [taxRate, setTaxRate] = useState(11); // 11% PPN
  const [applyTax, setApplyTax] = useState(true);
  const [attachment, setAttachment] = useState<File | null>(null);
  
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [warningModal, setWarningModal] = useState<{ isOpen: boolean; title: string; description: string }>({
    isOpen: false,
    title: "",
    description: ""
  });

  useEffect(() => {
    const fetchData = async () => {
      const [clientsData, companyData] = await Promise.all([
        getClients(),
        getCompanyProfile()
      ]);
      setClients(clientsData || []);
      setCompanyProfile(companyData || null);
    };
    fetchData();
  }, []);

  // Selected Client Data
  const selectedClient = clients.find(c => c.id === clientId);

  const { line1, line2 } = splitAddress(selectedClient?.address || "");
  const addressLine2Parts = [];
  if (selectedClient?.city) addressLine2Parts.push(selectedClient.city);
  if (selectedClient?.province) addressLine2Parts.push(selectedClient.province);
  if (selectedClient?.postal_code) addressLine2Parts.push(selectedClient.postal_code);
  const cityProvincePostal = addressLine2Parts.join(", ");

  const selectedClientAddressLine1 = line1;
  const selectedClientAddressLine2 = line2 
    ? `${line2} ${cityProvincePostal}`.trim() 
    : cityProvincePostal;

  // Kalkulasi
  const subtotal = items.reduce((sum, item) => sum + (item.qty * item.price), 0);
  const taxAmount = applyTax ? ((subtotal - discountAmount) * taxRate) / 100 : 0;
  const grandTotal = subtotal - discountAmount + taxAmount + shippingCost;



  const addItem = () => {
    setItems([...items, { id: Date.now(), name: "", qty: 1, unit: "Pcs", price: 0 }]);
  };

  const removeItem = (id: number) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: number, field: keyof InvoiceItem, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId) {
      setWarningModal({
        isOpen: true,
        title: "Pilih Customer",
        description: "Silakan pilih customer terlebih dahulu sebelum menyimpan invoice."
      });
      return;
    }
    if (!dueDate) {
      setWarningModal({
        isOpen: true,
        title: "Tentukan Jatuh Tempo",
        description: "Silakan tentukan tanggal jatuh tempo terlebih dahulu sebelum menyimpan invoice."
      });
      return;
    }
    if (dueDate && invoiceDate && dueDate < invoiceDate) {
      setWarningModal({
        isOpen: true,
        title: "Tanggal Jatuh Tempo Tidak Valid",
        description: "Tanggal jatuh tempo tidak boleh lebih awal dari tanggal terbit invoice."
      });
      return;
    }
    if (items.some(i => !i.name || i.price <= 0)) {
      setWarningModal({
        isOpen: true,
        title: "Barang / Jasa Tidak Valid",
        description: "Pastikan semua barang/jasa memiliki deskripsi dan harga yang valid sebelum menyimpan invoice."
      });
      return;
    }

    setLoading(true);
    try {
      let attachmentUrl = null;
      if (attachment) {
        const { url, error } = await uploadFile(attachment, 'uploads');
        if (!error && url) {
          attachmentUrl = url;
        } else {
          toast.error("Gagal mengunggah lampiran");
        }
      }

      const invoiceData = {
        invoice_number: invoiceNumber,
        client_id: selectedClient?.id || null,
        client_name: selectedClient?.name || "Unknown",
        client_address: selectedClient?.address || null,
        client_phone: selectedClient?.phone || null,
        client_email: selectedClient?.email || null,
        invoice_date: invoiceDate,
        due_date: dueDate,
        status: 'unpaid' as const,
        subtotal: subtotal,
        tax_rate: applyTax ? taxRate : 0,
        tax_amount: taxAmount,
        shipping_cost: shippingCost,
        shipping_method: shippingMethod || null,
        tracking_number: trackingNumber || null,
        shipping_address: shippingAddress || null,
        estimated_arrival: estimatedArrival || null,
        discount_amount: discountAmount,
        grand_total: grandTotal,
        notes: notes || null,
        attachment_url: attachmentUrl,
        created_by: null // Handled by RLS
      };

      const itemsData = items.map(item => ({
        description: item.name,
        quantity: item.qty,
        unit: item.unit,
        unit_price: item.price,
        total_price: item.qty * item.price
      }));

      const { error } = await createInvoiceWithItems(invoiceData, itemsData);
      
      if (error) {
        console.error(error);
        toast.error(`Gagal membuat invoice: ${error.message}`);
      } else {
        toast("Pembuatan Berhasil", {
          description: `Invoice ${invoiceNumber} telah berhasil dibuat.`,
          icon: <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center bg-[#76c893]/10 text-[#76c893]"><CheckCircleIcon className="w-5 h-5" /></div>,
        });

        // Add to Audit Log & Refresh Notifications
        if (user) {
          await createAuditLog(user.id, 'create', 'E-Invoice', null, null, { 
            description: `Invoice ${invoiceNumber} berhasil dibuat` 
          });
          
          // Small delay to ensure DB consistency before refresh and allow UI to update
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('refreshNotifications'));
            router.push('/e-invoice');
          }, 200);
        } else {
          router.push('/e-invoice');
        }
      }
    } catch (error: any) {
      toast.error(`Terjadi kesalahan: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPreview = () => {
    if (!clientId) {
      setWarningModal({
        isOpen: true,
        title: "Pilih Customer",
        description: "Silakan pilih customer terlebih dahulu sebelum melihat pratinjau."
      });
      return;
    }
    if (!dueDate) {
      setWarningModal({
        isOpen: true,
        title: "Tentukan Jatuh Tempo",
        description: "Silakan tentukan tanggal jatuh tempo terlebih dahulu sebelum melihat pratinjau."
      });
      return;
    }
    if (dueDate && invoiceDate && dueDate < invoiceDate) {
      setWarningModal({
        isOpen: true,
        title: "Tanggal Jatuh Tempo Tidak Valid",
        description: "Tanggal jatuh tempo tidak boleh lebih awal dari tanggal terbit invoice."
      });
      return;
    }
    if (items.some(i => !i.name || i.price <= 0)) {
      setWarningModal({
        isOpen: true,
        title: "Barang / Jasa Tidak Valid",
        description: "Pastikan semua barang/jasa memiliki deskripsi dan harga yang valid sebelum melihat pratinjau."
      });
      return;
    }
    setIsPreviewOpen(true);
  };

  return (
    <form className="max-w-5xl mx-auto space-y-6 pb-20" onSubmit={handleSubmit}>
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/e-invoice">
          <button className="p-2 bg-surface border border-border rounded-xl hover:bg-background transition-colors text-text-secondary">
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Buat Invoice Baru</h1>
          <p className="text-sm text-text-secondary mt-1">Buat faktur penagihan untuk customer Anda</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Informasi Customer */}
          <div className="bg-surface border border-border rounded-2xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-text-primary border-b border-border pb-2 mb-4 flex items-center gap-2">
              <Document1Icon className="w-[18px] h-[18px] text-primary" /> Informasi Invoice & Customer
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">No. Invoice</label>
                <Input type="text" value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">Tanggal Terbit</label>
                <CustomDatePicker value={invoiceDate} onChange={setInvoiceDate} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-text-primary mb-1.5">Customer <span className="text-danger">*</span></label>
                <CustomSelect 
                  placeholder="Pilih Customer"
                  options={clients.map(c => ({ value: c.id, label: c.name }))}
                  value={clientId}
                  onChange={setClientId}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-text-primary mb-1.5">Alamat Penagihan</label>
                <textarea 
                  className="flex w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-primary shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary min-h-[60px] resize-y"
                  placeholder="Alamat akan terisi otomatis setelah customer dipilih..."
                  value={
                    selectedClient 
                      ? `${selectedClientAddressLine1}\n${selectedClientAddressLine2}` 
                      : ""
                  }
                  readOnly
                ></textarea>
              </div>
            </div>
          </div>

          {/* Section 2: Detail Barang/Jasa */}
          <div className="bg-surface border border-border rounded-2xl shadow-sm p-6 overflow-hidden">
            <h3 className="text-lg font-semibold text-text-primary border-b border-border pb-2 mb-4 flex items-center gap-2">
              <PlusIcon className="w-[18px] h-[18px] text-primary" /> Detail Barang & Jasa
            </h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-text-secondary bg-background/50 uppercase border-b border-border">
                  <tr>
                    <th className="px-4 py-3 w-4/12">Deskripsi Barang/Jasa</th>
                    <th className="px-4 py-3 w-2/12">Qty</th>
                    <th className="px-4 py-3 w-2/12">Satuan</th>
                    <th className="px-4 py-3 w-3/12">Harga Satuan</th>
                    <th className="px-4 py-3 w-2/12 text-right">Total</th>
                    <th className="px-2 py-3 w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={item.id} className="border-b border-border border-dashed last:border-0">
                      <td className="px-2 py-3">
                        <Input 
                          placeholder="Misal: Meja Kantor Tipe A" 
                          value={item.name}
                          onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                        />
                      </td>
                      <td className="px-2 py-3">
                        <Input 
                          type="number" 
                          min="1" 
                          value={item.qty}
                          onChange={(e) => updateItem(item.id, 'qty', parseInt(e.target.value) || 0)}
                        />
                      </td>
                      <td className="px-2 py-3">
                        <CustomSelect 
                          placeholder="Satuan"
                          options={[
                            { value: "Pcs", label: "Pcs" },
                            { value: "Unit", label: "Unit" },
                            { value: "Set", label: "Set" },
                            { value: "Box", label: "Box" },
                            { value: "Jasa", label: "Jasa" },
                            { value: "Hari", label: "Hari" },
                            { value: "Bulan", label: "Bulan" }
                          ]}
                          value={item.unit}
                          onChange={val => updateItem(item.id, 'unit', val)}
                        />
                      </td>
                      <td className="px-2 py-3">
                        <Input 
                          icon={<span className="text-xs font-medium">Rp</span>}
                          type="text" 
                          className="text-right"
                          value={formatRupiah(item.price)}
                          onChange={(e) => updateItem(item.id, 'price', parseRupiah(e.target.value))}
                        />
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-text-primary">
                        {formatCurrency(item.qty * item.price)}
                      </td>
                      <td className="px-2 py-3 text-center">
                        <button 
                          onClick={() => removeItem(item.id)}
                          className="p-1.5 text-text-muted hover:text-danger hover:bg-danger/10 rounded-md transition-colors"
                          disabled={items.length === 1}
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-4">
              <Button type="button" variant="outline" size="sm" onClick={addItem} className="flex items-center gap-1 text-primary border-primary/20 hover:bg-primary/5">
                <PlusIcon className="w-3.5 h-3.5" /> Tambah Baris
              </Button>
            </div>
          </div>

          {/* Section 3: Informasi Pengiriman (Merged & Premium) */}
          <div className="bg-surface border border-border rounded-2xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-text-primary border-b border-border pb-2 mb-4 flex items-center gap-2">
              <TruckIcon className="w-[18px] h-[18px] text-primary" /> Informasi Pengiriman (Opsional)
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">Kurir / Metode Pengiriman</label>
                <CustomSelect 
                  placeholder="Pilih Kurir"
                  options={[
                    { value: "JNE", label: "JNE" },
                    { value: "J&T", label: "J&T" },
                    { value: "SiCepat", label: "SiCepat" },
                    { value: "Anteraja", label: "Anteraja" },
                    { value: "GoSend", label: "GoSend" },
                    { value: "GrabExpress", label: "GrabExpress" },
                    { value: "Self Pickup", label: "Ambil Sendiri" },
                    { value: "Lainnya", label: "Lainnya" }
                  ]}
                  value={shippingMethod}
                  onChange={setShippingMethod}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">Ongkos Kirim (Rp)</label>
                <Input 
                  type="text" 
                  placeholder="0"
                  value={formatRupiah(shippingCost)}
                  onChange={(e) => setShippingCost(parseRupiah(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">No. Resi / Pelacakan</label>
                <Input 
                  type="text" 
                  placeholder="Contoh: JNE123456789" 
                  value={trackingNumber} 
                  onChange={e => setTrackingNumber(e.target.value)} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">Estimasi Sampai</label>
                <CustomDatePicker value={estimatedArrival} onChange={setEstimatedArrival} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-text-primary mb-1.5">Alamat Pengiriman (Jika berbeda dengan penagihan)</label>
                <textarea 
                  className="flex w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-primary shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary min-h-[60px] resize-y"
                  placeholder="Masukkan alamat pengiriman jika berbeda dengan alamat customer..."
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                ></textarea>
              </div>
            </div>
          </div>
          
          {/* Section 4: Lampiran */}
          <div className="bg-surface border border-border rounded-2xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-text-primary border-b border-border pb-2 mb-4 flex items-center gap-2">
              <Document1Icon className="w-[18px] h-[18px] text-primary" /> Lampiran
            </h3>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">File PO / Kontrak (Opsional)</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-border border-dashed rounded-xl bg-background/50 hover:bg-background transition-colors cursor-pointer">
                <div className="space-y-1 text-center">
                  <div className="flex text-sm text-text-secondary justify-center">
                    <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary/80 focus-within:outline-none">
                      <span>Unggah file lampiran</span>
                      <input id="file-upload" name="file-upload" type="file" className="sr-only" />
                    </label>
                  </div>
                  <p className="text-xs text-text-muted">PDF, PNG, JPG maksimal 5MB</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Summary Area */}
        <div className="lg:col-span-1">
          <div className="bg-surface border border-border rounded-2xl shadow-sm p-6 sticky top-24">
            <h3 className="text-lg font-semibold text-text-primary border-b border-border pb-2 mb-4 flex items-center gap-2">
              <CalculatorIcon className="w-[18px] h-[18px] text-primary" /> Ringkasan Pembayaran
            </h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center text-text-secondary">
                <span>Subtotal</span>
                <span className="font-medium text-text-primary">{formatCurrency(subtotal)}</span>
              </div>
              
              <div className="flex justify-between items-start text-text-secondary">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs">Pajak (PPN)</span>
                    <button 
                      type="button"
                      onClick={() => setApplyTax(!applyTax)}
                      className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors duration-200 focus:outline-none ${
                        applyTax ? 'bg-[#5C67F2]' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-2.5 w-2.5 transform rounded-full bg-white transition-transform duration-200 ${
                          applyTax ? 'translate-x-4' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                  </div>
                  
                  {applyTax && (
                    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden h-7 bg-white w-fit animate-in fade-in slide-in-from-top-1 duration-200">
                      <input 
                        type="number" 
                        className="w-14 text-center text-xs font-bold outline-none bg-transparent text-[#5C67F2]" 
                        value={taxRate}
                        onChange={(e) => setTaxRate(parseInt(e.target.value) || 0)}
                      />
                      <span className="bg-gray-50 px-2 text-[10px] font-bold text-gray-400 border-l border-gray-100 h-full flex items-center">%</span>
                    </div>
                  )}
                </div>
                <span className="font-medium text-text-primary">{formatCurrency(taxAmount)}</span>
              </div>
              
              <div className="flex justify-between items-start text-text-secondary">
                <div className="space-y-1">
                  <span className="text-xs">Ongkos Kirim</span>
                  {shippingMethod && (
                    <p className="text-[10px] font-semibold text-primary">{shippingMethod}</p>
                  )}
                </div>
                <span className="font-medium text-text-primary">{formatCurrency(shippingCost)}</span>
              </div>
              
              <div className="flex justify-between items-center text-text-secondary">
                <span>Diskon</span>
                <div className="w-32">
                  <Input 
                    icon={<span className="text-[10px] font-medium">Rp</span>}
                    type="text" 
                    className="text-right h-8 text-xs"
                    value={formatRupiah(discountAmount)}
                    onChange={(e) => setDiscountAmount(parseRupiah(e.target.value))}
                  />
                </div>
              </div>
              
              <div className="pt-3 mt-3 border-t border-border flex justify-between items-center">
                <span className="font-bold text-base text-text-primary">TOTAL AKHIR</span>
                <span className="font-bold text-lg text-primary">{formatCurrency(grandTotal)}</span>
              </div>
            </div>
            
            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">Jatuh Tempo Pada <span className="text-danger">*</span></label>
                <CustomDatePicker value={dueDate} onChange={setDueDate} minDate={invoiceDate} />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">Catatan untuk Customer</label>
                <textarea 
                  className="flex w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-primary shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary min-h-[80px] resize-y text-xs"
                  placeholder="Terima kasih atas bisnis Anda..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                ></textarea>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">Lampiran Bukti (Opsional)</label>
                <label htmlFor="file-upload" className="flex justify-center px-4 py-4 border-2 border-dashed border-border rounded-xl bg-surface hover:bg-background transition-colors cursor-pointer relative">
                  <div className="space-y-1 text-center">
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
                    </div>
                    {attachment ? (
                      <p className="text-xs font-medium text-text-primary mt-1">{attachment.name}</p>
                    ) : (
                      <p className="text-[10px] text-text-muted mt-1">PNG, JPG, PDF hingga 5MB</p>
                    )}
                  </div>
                </label>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-border flex flex-col gap-3">
              <Button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 py-6 text-base bg-[#5C67F2] hover:bg-[#4a55c2] text-white">
                <SaveIcon className="w-[18px] h-[18px]" /> {loading ? "Menyimpan..." : "Simpan Invoice"}
              </Button>
              <Button variant="outline" type="button" onClick={handleOpenPreview} className="w-full flex items-center justify-center gap-2">
                <Document1Icon className="w-4 h-4" /> Pratinjau PDF
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* PDF Preview Modal */}
      <Modal isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)}>
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh] print:max-h-none print:shadow-none print:rounded-none">
          <div className="flex items-center justify-between p-6 border-b border-gray-100 shrink-0 print:hidden">
            <div>
              <h2 className="text-xl font-bold text-[#151D48]">Pratinjau PDF Invoice</h2>
              <p className="text-sm text-gray-500 mt-1">Pratinjau tampilan cetak invoice sebelum disimpan</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => window.print()} className="bg-[#5C67F2] hover:bg-[#4a55c2] text-white flex items-center gap-2">
                <PrinterIcon className="w-4 h-4" /> Cetak
              </Button>
              <button 
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <CloseIcon className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>
          
          <div className="p-6 overflow-y-auto flex-1 bg-gray-50 print:p-0 print:bg-white">
            {/* The Invoice Document */}
            {getPages(items).map((page) => (
              <div
                key={page.pageNumber}
                id="invoice-preview-document"
                className="invoice-page-container bg-white border border-gray-200 shadow-md p-[6mm_10mm] print:border-none print:shadow-none print:p-[6mm_10mm] mx-auto mb-6 last:mb-0 flex flex-col justify-between"
                style={{
                  width: '210mm',
                  height: '148mm',
                  boxSizing: 'border-box',
                  overflow: 'hidden',
                  position: 'relative'
                }}
              >
                <div>
                  {/* Page Header */}
                  {page.pageNumber === 1 ? (
                    <div className="flex justify-between items-start border-b border-gray-100 pb-2 mb-2 gap-6">
                      <div className="flex flex-row items-center gap-4">
                        {companyProfile?.logo_url ? (
                          <img src={companyProfile.logo_url} alt="Logo" className="h-16 w-auto object-contain max-w-[140px]" />
                        ) : (
                          <div className="w-16 h-16 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100 shrink-0">
                            <span className="text-[10px] text-gray-300 font-bold text-center">NO<br/>LOGO</span>
                          </div>
                        )}
                        <div className="flex flex-col justify-center text-left">
                          <h2 className="text-sm font-bold text-[#151D48] leading-tight">{companyProfile?.company_name || 'PT GMera Solusi'}</h2>
                          <p className="text-[10px] text-gray-500 max-w-xs mt-0.5 leading-tight">{companyProfile?.address || 'Jl. Teknologi No. 123, Jakarta'}</p>
                          <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
                            {companyProfile?.npwp && <p className="text-[9px] text-gray-500 font-medium">NPWP: {companyProfile.npwp}</p>}
                            <p className="text-[9px] text-gray-500">{companyProfile?.phone || '021-12345678'} • {companyProfile?.email || 'finance@gmera.com'}</p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <h1 className="text-lg font-bold text-[#5C67F2] uppercase tracking-wider">INVOICE</h1>
                        <p className="text-xs font-semibold text-[#151D48] mt-0.5">{invoiceNumber || 'INV-XXXXXX'}</p>
                        <div className="mt-1 text-[9px] text-gray-600 space-y-0.5 text-right">
                          <p><span className="text-gray-400">Terbit:</span> {invoiceDate ? new Date(invoiceDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}</p>
                          <p>
                            <span className="text-gray-400">Jatuh Tempo:</span>{' '}
                            <span>
                              {dueDate ? new Date(dueDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Minimal Header for Subsequent Pages */
                    <div className="flex justify-between items-center border-b border-gray-100 pb-1.5 mb-2">
                      <div className="flex items-center gap-2">
                        {companyProfile?.logo_url ? (
                          <img src={companyProfile.logo_url} alt="Logo" className="h-6 w-auto object-contain" />
                        ) : (
                          <span className="text-xs font-bold text-[#151D48]">PT GMera Solusi</span>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] font-semibold text-gray-500">INVOICE {invoiceNumber} — Halaman {page.pageNumber}</span>
                      </div>
                    </div>
                  )}

                  {/* Billed To (Only on Page 1) */}
                  {page.pageNumber === 1 && (
                    <div className="mb-2 text-left">
                      <h3 className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">DITAGIHKAN KEPADA:</h3>
                      <h4 className="text-xs font-bold text-[#151D48]">{selectedClient?.name || 'Belum memilih customer'}</h4>
                      {selectedClientAddressLine1 && <p className="text-[10px] text-gray-600 max-w-md">{selectedClientAddressLine1}</p>}
                      {selectedClientAddressLine2 && <p className="text-[10px] text-gray-600 max-w-md">{selectedClientAddressLine2}</p>}
                      {(selectedClient?.phone || selectedClient?.email) && (
                        <p className="text-[9px] text-gray-600">{[selectedClient.phone, selectedClient.email].filter(Boolean).join(' • ')}</p>
                      )}
                    </div>
                  )}

                  {/* Items Table */}
                  <div className="mb-2 overflow-hidden rounded-md">
                    <table className="w-full text-[10px] text-left border-collapse">
                      <thead>
                        <tr className="bg-[#5C67F2] text-white">
                          <th className="px-3 py-1 font-semibold">Deskripsi Barang / Jasa</th>
                          <th className="px-3 py-1 font-semibold text-center w-16">Qty</th>
                          <th className="px-3 py-1 font-semibold text-right w-24">Harga Satuan (Rp)</th>
                          <th className="px-3 py-1 font-semibold text-right w-28">Total (Rp)</th>
                        </tr>
                      </thead>
                      <tbody className="text-gray-700">
                        {page.items.map((item: any, idx: number) => (
                          <tr key={item.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-[#F8F9FF]'} style={{ borderBottom: '1px solid #eee' }}>
                            <td className="px-3 py-1">{item.name || '-'}</td>
                            <td className="px-3 py-1 text-center">{item.qty} {item.unit}</td>
                            <td className="px-3 py-1 text-right tabular-nums">{formatCurrency(item.price)}</td>
                            <td className="px-3 py-1 text-right tabular-nums font-semibold text-[#151D48]">{formatCurrency(item.qty * item.price)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Summary Block (Only on Last Page) */}
                  {page.isLastPage && (
                    <div id="invoice-summary" className="flex gap-4 mt-2 text-left">
                      {/* Payment info */}
                      <div className="flex-1 text-[9px]">
                        <div className="flex gap-3 mb-1.5">
                          <div className="flex-1">
                            <h3 className="text-[8px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">INFORMASI PEMBAYARAN:</h3>
                            <div className="bg-gray-50 rounded-md p-2 border border-gray-100 min-h-[50px]">
                              <p className="font-semibold text-[#151D48] mb-0.5">Transfer Bank:</p>
                              <p className="text-gray-600">Bank: <span className="font-medium text-[#151D48]">{companyProfile?.bank_name || '-'}</span></p>
                              <p className="text-gray-600">No. Rekening: <span className="font-medium text-[#151D48]">{companyProfile?.bank_account || '-'}</span></p>
                              <p className="text-gray-600">Atas Nama: <span className="font-medium text-[#151D48]">{companyProfile?.bank_account_name || '-'}</span></p>
                            </div>
                          </div>
                          
                          {shippingMethod && (
                            <div className="flex-1">
                              <h3 className="text-[8px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">PENGIRIMAN:</h3>
                              <div className="bg-gray-50 rounded-md p-2 border border-gray-100 min-h-[50px]">
                                <p className="text-gray-600">Kurir: <span className="font-medium text-[#151D48]">{shippingMethod}</span></p>
                                {trackingNumber && (
                                  <p className="text-gray-600 mt-0.5">
                                    No. Resi: <span className="font-medium text-[#151D48]">{trackingNumber}</span>
                                  </p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        {notes && (
                          <div className="mt-1">
                            <p className="text-[8px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">CATATAN:</p>
                            <p className="text-[9px] text-gray-600 whitespace-pre-wrap leading-tight">{notes}</p>
                          </div>
                        )}
                      </div>

                      {/* Grand totals */}
                      <div className="w-48 shrink-0 text-[9px]">
                        <div className="space-y-1 text-gray-600">
                          <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span className="font-medium text-[#151D48] tabular-nums">{formatCurrency(subtotal)}</span>
                          </div>
                          {discountAmount > 0 && (
                            <div className="flex justify-between">
                              <span>Diskon</span>
                              <span className="font-medium text-[#FA5A7D] tabular-nums">- {formatCurrency(discountAmount)}</span>
                            </div>
                          )}
                          {taxAmount > 0 && (
                            <div className="flex justify-between">
                              <span>Pajak ({taxRate}%)</span>
                              <span className="font-medium text-[#151D48] tabular-nums">{formatCurrency(taxAmount)}</span>
                            </div>
                          )}
                          {shippingCost > 0 && (
                            <div className="flex justify-between">
                              <span>Ongkos Kirim {shippingMethod ? `(${shippingMethod})` : ''}</span>
                              <span className="font-medium text-[#151D48] tabular-nums">{formatCurrency(shippingCost)}</span>
                            </div>
                          )}
                          <div className="pt-1.5 mt-1.5 border-t-2 border-[#5C67F2] flex justify-between items-center">
                            <span className="font-bold text-[10px] text-[#151D48]">TOTAL AKHIR</span>
                            <span className="font-bold text-xs text-[#5C67F2] tabular-nums">{formatCurrency(grandTotal)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="pt-1.5 border-t border-gray-100 text-center text-[8px] text-gray-400 shrink-0">
                  <p>Terima kasih atas kepercayaan Anda kepada {companyProfile?.company_name || 'kami'}.</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Modal>

      {/* CSS Print Styles for preview page */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          /* 1. Hide the entire main layout tree of Next.js app completely */
          nav, aside, header, footer, form, button, main, .print\\:hidden, div[class*="min-h-screen"] {
            display: none !important;
          }

          /* 2. Reset the body and html for printing strictly to 1 page (A5 landscape) */
          html, body {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            height: auto !important;
            overflow: visible !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          /* 3. Reset the outermost portal backdrop wrapper only to position at top-left of Page 1 */
          div[class*="backdrop-blur"], div[class*="bg-black/50"] {
            background: transparent !important;
            backdrop-filter: none !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            padding: 0 !important;
            margin: 0 !important;
            display: block !important;
            overflow: visible !important;
            width: 100% !important;
            height: auto !important;
            box-sizing: border-box !important;
          }

          /* Flatten the modal card container (shadow-xl) so it flows cleanly without absolute stacking */
          div[class*="shadow-xl"] {
            box-shadow: none !important;
            border: none !important;
            background: transparent !important;
            display: block !important;
            width: 100% !important;
            height: auto !important;
            overflow: visible !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          #invoice-preview-document {
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            width: 100% !important;
            min-height: 132mm !important;
            height: auto !important;
            overflow: visible !important;
            background: white !important;
            box-sizing: border-box !important;
            margin: 0 auto !important;
          }

          tr {
            page-break-inside: avoid !important;
          }

          #invoice-summary {
            page-break-inside: avoid !important;
          }

          /* Ensure high-fidelity exact colors */
          #invoice-preview-document * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          @page {
            size: A5 landscape;
            margin: 8mm 12mm 8mm 12mm !important;
          }
        }
      `}} />
      <ConfirmModal
        isOpen={warningModal.isOpen}
        onClose={() => setWarningModal({ ...warningModal, isOpen: false })}
        onConfirm={() => setWarningModal({ ...warningModal, isOpen: false })}
        title={warningModal.title}
        description={warningModal.description}
        confirmText="OK"
        cancelText="Tutup"
        isHelp={true}
      />
    </form>
  );
}
