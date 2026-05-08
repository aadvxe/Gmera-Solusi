"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon, SaveIcon, PlusIcon, TrashIcon, Document1Icon, TruckIcon, CalculatorIcon, CheckCircleIcon } from "@astraicons/react/bold";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { getClients, createInvoiceWithItems, Client } from "@/lib/db";
import { formatRupiah, parseRupiah, formatCurrency } from "@/lib/utils";
import { CustomDatePicker } from "@/components/ui/CustomDatePicker";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { uploadFile } from "@/lib/storage";
import { toast } from "sonner";

interface InvoiceItem {
  id: number;
  name: string;
  qty: number;
  unit: string;
  price: number;
}

export default function BuatInvoicePage() {
  const router = useRouter();
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

  useEffect(() => {
    const fetchClients = async () => {
      const data = await getClients();
      setClients(data);
    };
    fetchClients();
  }, []);

  // Selected Client Data
  const selectedClient = clients.find(c => c.id === clientId);

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
    if (!clientId) return alert("Silakan pilih klien terlebih dahulu.");
    if (!dueDate) return alert("Silakan tentukan tanggal jatuh tempo.");
    if (items.some(i => !i.name || i.price <= 0)) return alert("Pastikan semua barang/jasa memiliki deskripsi dan harga yang valid.");

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
        router.push('/e-invoice');
      }
    } catch (error: any) {
      toast.error(`Terjadi kesalahan: ${error.message}`);
    } finally {
      setLoading(false);
    }
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
          <p className="text-sm text-text-secondary mt-1">Buat faktur penagihan untuk klien Anda</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Informasi Klien */}
          <div className="bg-surface border border-border rounded-2xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-text-primary border-b border-border pb-2 mb-4 flex items-center gap-2">
              <Document1Icon className="w-[18px] h-[18px] text-primary" /> Informasi Invoice & Klien
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
                <label className="block text-sm font-medium text-text-primary mb-1.5">Klien <span className="text-danger">*</span></label>
                <CustomSelect 
                  placeholder="Pilih Klien"
                  options={clients.map(c => ({ value: c.id, label: c.name }))}
                  value={clientId}
                  onChange={setClientId}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-text-primary mb-1.5">Alamat Penagihan</label>
                <textarea 
                  className="flex w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-primary shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary min-h-[60px] resize-y"
                  placeholder="Alamat akan terisi otomatis setelah klien dipilih..."
                  value={selectedClient ? `${selectedClient.address || ''}, ${selectedClient.city || ''}, ${selectedClient.province || ''}` : ""}
                  readOnly
                ></textarea>
              </div>
            </div>
          </div>

          {/* Section: Informasi Pengiriman */}
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
                  value={formatRupiah(shippingCost)}
                  onChange={(e) => setShippingCost(parseRupiah(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">No. Resi</label>
                <Input 
                  type="text" 
                  placeholder="Contoh: JNE123456789"
                  value={trackingNumber} 
                  onChange={e => setTrackingNumber(e.target.value)} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">Alamat Pengiriman (Opsional)</label>
                <textarea 
                  className="flex w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-primary shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary min-h-[40px] resize-y text-xs"
                  placeholder="Masukkan alamat pengiriman jika berbeda dengan alamat klien..."
                  value={shippingAddress}
                  onChange={e => setShippingAddress(e.target.value)}
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

          {/* Section 3: Informasi Pengiriman (Feature Ideation 1.2) */}
          <div className="bg-surface border border-border rounded-2xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-text-primary border-b border-border pb-2 mb-4 flex items-center gap-2">
              <TruckIcon className="w-[18px] h-[18px] text-primary" /> Informasi Pengiriman
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">Metode Pengiriman</label>
                <select 
                  className="flex h-10 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-primary shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  value={shippingMethod}
                  onChange={e => setShippingMethod(e.target.value)}
                >
                  <option value="">-- Pilih Kurir --</option>
                  <option value="jne_reg">JNE Regular</option>
                  <option value="jne_yes">JNE YES</option>
                  <option value="gosend">GoSend / GrabExpress</option>
                  <option value="custom">Kurir Internal / Custom</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">No. Resi / Pelacakan</label>
                <Input type="text" placeholder="Opsional" value={trackingNumber} onChange={e => setTrackingNumber(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">Estimasi Sampai</label>
                <Input type="date" value={estimatedArrival} onChange={e => setEstimatedArrival(e.target.value)} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-text-primary mb-1.5">Alamat Pengiriman (Jika berbeda dengan penagihan)</label>
                <textarea 
                  className="flex w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-primary shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary min-h-[60px] resize-y"
                  placeholder="Opsional..."
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
                <CustomDatePicker value={dueDate} onChange={setDueDate} />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">Catatan untuk Klien</label>
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
              <Button variant="outline" type="button" className="w-full flex items-center justify-center gap-2">
                <Document1Icon className="w-4 h-4" /> Pratinjau PDF
              </Button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
