"use client";

// Import React hook yang dipakai form edit invoice yang memuat data lama lalu menyimpan perubahan, misalnya untuk state, efek setelah render, atau referensi elemen.
import React, { useState, useEffect } from "react";
// Import Link supaya menu/tombol di form edit invoice yang memuat data lama lalu menyimpan perubahan bisa berpindah halaman tanpa reload penuh.
import Link from "next/link";
// Import alat navigasi Next.js supaya form edit invoice yang memuat data lama lalu menyimpan perubahan bisa pindah halaman atau membaca route aktif.
import { useRouter, useParams } from "next/navigation";
// Import ikon yang dipakai form edit invoice yang memuat data lama lalu menyimpan perubahan untuk memperjelas tombol, menu, status, dan aksi di layar.
import { ArrowLeftIcon, SaveIcon, PlusIcon, TrashIcon, Document1Icon, TruckIcon, CalculatorIcon, CheckCircleIcon } from "@astraicons/react/bold";
// Import komponen UI reusable supaya form edit invoice yang memuat data lama lalu menyimpan perubahan memakai tampilan tombol, modal, input, atau tabel yang konsisten.
import { Button } from "@/components/ui/Button";
// Import komponen UI reusable supaya form edit invoice yang memuat data lama lalu menyimpan perubahan memakai tampilan tombol, modal, input, atau tabel yang konsisten.
import { Input } from "@/components/ui/Input";
// Import helper database yang dipakai form edit invoice yang memuat data lama lalu menyimpan perubahan untuk mengambil atau menyimpan data Supabase.
import { getClients, getInvoiceById, updateInvoiceWithItems, Client } from "@/lib/db";
// Import komponen UI reusable supaya form edit invoice yang memuat data lama lalu menyimpan perubahan memakai tampilan tombol, modal, input, atau tabel yang konsisten.
import { ConfirmModal } from "@/components/ui/ConfirmModal";
// Import Sonner untuk menampilkan toast sukses/error di form edit invoice yang memuat data lama lalu menyimpan perubahan.
import { toast } from "sonner";
// Import utility project supaya form edit invoice yang memuat data lama lalu menyimpan perubahan bisa memformat class Tailwind atau angka Rupiah dengan cara yang sama.
import { formatRupiah, parseRupiah, formatCurrency } from "@/lib/utils";
// Import komponen UI reusable supaya form edit invoice yang memuat data lama lalu menyimpan perubahan memakai tampilan tombol, modal, input, atau tabel yang konsisten.
import { CustomDatePicker } from "@/components/ui/CustomDatePicker";
// Import komponen UI reusable supaya form edit invoice yang memuat data lama lalu menyimpan perubahan memakai tampilan tombol, modal, input, atau tabel yang konsisten.
import { CustomSelect } from "@/components/ui/CustomSelect";
// Import uploadFile supaya form edit invoice yang memuat data lama lalu menyimpan perubahan bisa mengirim lampiran ke Supabase Storage.
import { uploadFile } from "@/lib/storage";
// Import helper database yang dipakai form edit invoice yang memuat data lama lalu menyimpan perubahan untuk mengambil atau menyimpan data Supabase.
import { createAuditLog } from "@/lib/db/users";
// Import authStore supaya form edit invoice yang memuat data lama lalu menyimpan perubahan bisa membaca user login, role, nama tampilan, atau mengosongkan session saat logout.
import { useAuthStore } from "@/store/authStore";
// Interface ini menjelaskan field yang dipakai form edit invoice yang memuat data lama lalu menyimpan perubahan supaya data form/database tidak salah bentuk.
interface InvoiceItem {
  id: number;
  name: string;
  qty: number | "";
  unit: string;
  price: number;
}

// splitAddress memecah alamat panjang menjadi beberapa bagian supaya muat rapi di tampilan invoice.
function splitAddress(addressStr: string) {
  // Kondisi if (!addressStr) return { line1: "", line2: "" }; membuat isi blok if di bawahnya hanya berjalan saat kondisi itu benar di form edit invoice.
  if (!addressStr) return { line1: "", line2: "" };
  const normalized = addressStr.replace(/\n/g, "\n");
  const lastNewlineIndex = normalized.lastIndexOf("\n");
  // Kondisi if (lastNewlineIndex !== -1) membuat isi blok if di bawahnya hanya berjalan saat kondisi itu benar di form edit invoice.
  if (lastNewlineIndex !== -1) {
    const line1 = normalized.substring(0, lastNewlineIndex).trim();
    const line2 = normalized.substring(lastNewlineIndex + 1).trim();
    // splitAddress mengirim dua baris alamat agar preview invoice bisa menata alamat customer dengan rapi.
    return { line1, line2 };
  }
  const lastCommaIndex = normalized.lastIndexOf(",");
  // Kondisi if (lastCommaIndex === -1) membuat isi blok if di bawahnya hanya berjalan saat kondisi itu benar di form edit invoice.
  if (lastCommaIndex === -1) {
    // splitAddress mengirim dua baris alamat agar preview invoice bisa menata alamat customer dengan rapi.
    return { line1: normalized, line2: "" };
  }
  const line1 = normalized.substring(0, lastCommaIndex + 1).trim();
  const line2 = normalized.substring(lastCommaIndex + 1).trim();
  // splitAddress mengirim dua baris alamat agar preview invoice bisa menata alamat customer dengan rapi.
  return { line1, line2 };
}

// EditInvoicePage memuat invoice lama, mengisi form edit, lalu menyimpan perubahan invoice dan itemnya.
export default function EditInvoicePage() {
  const router = useRouter();
  const params = useParams();
  const user = useAuthStore(state => state.user);
  const invoiceId = params.id as string;
  
  // loading menyimpan nilai loading yang berubah saat user berinteraksi dengan form edit invoice yang memuat data lama lalu menyimpan perubahan.
  const [loading, setLoading] = useState(true);
  // saving menyimpan nilai saving yang berubah saat user berinteraksi dengan form edit invoice yang memuat data lama lalu menyimpan perubahan.
  const [saving, setSaving] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);

  // Form State
  const [invoiceNumber, setInvoiceNumber] = useState("");
  // invoiceDate menyimpan nilai invoice date yang berubah saat user berinteraksi dengan form edit invoice yang memuat data lama lalu menyimpan perubahan.
  const [invoiceDate, setInvoiceDate] = useState("");
  // dueDate menyimpan nilai due date yang berubah saat user berinteraksi dengan form edit invoice yang memuat data lama lalu menyimpan perubahan.
  const [dueDate, setDueDate] = useState("");
  // clientId menyimpan nilai client id yang berubah saat user berinteraksi dengan form edit invoice yang memuat data lama lalu menyimpan perubahan.
  const [clientId, setClientId] = useState("");
  // shippingMethod menyimpan nilai shipping method yang berubah saat user berinteraksi dengan form edit invoice yang memuat data lama lalu menyimpan perubahan.
  const [shippingMethod, setShippingMethod] = useState("");
  // trackingNumber menyimpan nilai tracking number yang berubah saat user berinteraksi dengan form edit invoice yang memuat data lama lalu menyimpan perubahan.
  const [trackingNumber, setTrackingNumber] = useState("");
  // estimatedArrival menyimpan nilai estimated arrival yang berubah saat user berinteraksi dengan form edit invoice yang memuat data lama lalu menyimpan perubahan.
  const [estimatedArrival, setEstimatedArrival] = useState("");
  // notes menyimpan nilai notes yang berubah saat user berinteraksi dengan form edit invoice yang memuat data lama lalu menyimpan perubahan.
  const [notes, setNotes] = useState("");

  const [items, setItems] = useState<InvoiceItem[]>([]);
  
  // shippingCost menyimpan nilai shipping cost yang berubah saat user berinteraksi dengan form edit invoice yang memuat data lama lalu menyimpan perubahan.
  const [shippingCost, setShippingCost] = useState(0);
  // shippingAddress menyimpan nilai shipping address yang berubah saat user berinteraksi dengan form edit invoice yang memuat data lama lalu menyimpan perubahan.
  const [shippingAddress, setShippingAddress] = useState("");
  // discountAmount menyimpan nilai discount amount yang berubah saat user berinteraksi dengan form edit invoice yang memuat data lama lalu menyimpan perubahan.
  const [discountAmount, setDiscountAmount] = useState(0);
  // taxRate menyimpan nilai tax rate yang berubah saat user berinteraksi dengan form edit invoice yang memuat data lama lalu menyimpan perubahan.
  const [taxRate, setTaxRate] = useState(11); // 11% PPN
  // applyTax menyimpan nilai apply tax yang berubah saat user berinteraksi dengan form edit invoice yang memuat data lama lalu menyimpan perubahan.
  const [applyTax, setApplyTax] = useState(true);
  
  // status menyimpan nilai status yang berubah saat user berinteraksi dengan form edit invoice yang memuat data lama lalu menyimpan perubahan.
  const [status, setStatus] = useState("unpaid");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [existingAttachmentUrl, setExistingAttachmentUrl] = useState<string | null>(null);
  const [warningModal, setWarningModal] = useState<{ isOpen: boolean; title: string; description: string }>({
    isOpen: false,
    title: "",
    description: ""
  });

  // Effect ini mengambil data yang diperlukan form edit invoice yang memuat data lama lalu menyimpan perubahan saat halaman dibuka atau filter berubah.
  useEffect(() => {
    // fetchData mengambil data yang dibutuhkan form edit invoice yang memuat data lama lalu menyimpan perubahan dari Supabase lalu mengisi state halaman.
    const fetchData = async () => {
      setLoading(true);
      // try ini membaca atau menyimpan data invoice dari Supabase sesuai aksi user di halaman invoice.
      try {
        // await Promise.all menunggu beberapa query berjalan paralel sampai semuanya selesai.
        const [clientsData, invoiceData] = await Promise.all([
          getClients(),
          getInvoiceById(invoiceId)
        ]);
        
        setClients(clientsData);
        
        // Kondisi if (invoiceData) membuat isi blok if di bawahnya hanya berjalan saat kondisi itu benar di form edit invoice.
        if (invoiceData) {
          setInvoiceNumber(invoiceData.invoice_number);
          setInvoiceDate(invoiceData.invoice_date);
          setDueDate(invoiceData.due_date);
          setClientId(invoiceData.client_id || "");
          setShippingMethod(invoiceData.shipping_method || "");
          setTrackingNumber(invoiceData.tracking_number || "");
          setEstimatedArrival(invoiceData.estimated_arrival || "");
          setNotes(invoiceData.notes || "");
          setExistingAttachmentUrl(invoiceData.attachment_url || null);
          setStatus(invoiceData.status || "unpaid");
          setShippingCost(invoiceData.shipping_cost || 0);
          setShippingAddress(invoiceData.shipping_address || "");
          setDiscountAmount(invoiceData.discount_amount || 0);
          
          // Kondisi if (invoiceData.tax_rate && invoiceData.tax_rate > 0) membuat isi blok if di bawahnya hanya berjalan saat kondisi itu benar di form edit invoice.
          if (invoiceData.tax_rate && invoiceData.tax_rate > 0) {
            setApplyTax(true);
            setTaxRate(invoiceData.tax_rate);
          } else {
            setApplyTax(false);
          }
          
          setStatus(invoiceData.status);

          // Kondisi ini mengecek jumlah item agar daftar kosong, pagination, atau total bisa ditangani dengan benar.
          if (invoiceData.invoice_items && invoiceData.invoice_items.length > 0) {
            // map ini mengubah setiap item invoice di form menjadi data item yang siap disimpan ke Supabase atau ditampilkan di tabel.
            setItems(invoiceData.invoice_items.map((item: any) => ({
              id: item.id,
              name: item.description,
              qty: item.quantity,
              unit: item.unit || "Pcs",
              price: item.unit_price
            })));
          } else {
            setItems([{ id: Date.now(), name: "", qty: "", unit: "Pcs", price: 0 }]);
          }
        } else {
          toast.error("Invoice tidak ditemukan");
          router.push('/e-invoice');
        }
      } catch (error) {
        console.error("Error fetching invoice:", error);
      } finally {
        setLoading(false);
      }
    };
    
    // Kondisi if (invoiceId) membuat isi blok if di bawahnya hanya berjalan saat kondisi itu benar di form edit invoice.
    if (invoiceId) {
      fetchData();
    }
  }, [invoiceId, router]);

  // Selected Client Data
  const selectedClient = clients.find(c => c.id === clientId);

  const { line1, line2 } = splitAddress(selectedClient?.address || "");
  const addressLine2Parts = [];
  // Kondisi if (selectedClient?.city) addressLine2Parts.push(selectedClient.city); membuat isi blok if di bawahnya hanya berjalan saat kondisi itu benar di form edit invoice.
  if (selectedClient?.city) addressLine2Parts.push(selectedClient.city);
  // Kondisi if (selectedClient?.province) addressLine2Parts.push(selectedClient.province); membuat isi blok if di bawahnya hanya berjalan saat kondisi itu benar di form edit invoice.
  if (selectedClient?.province) addressLine2Parts.push(selectedClient.province);
  // Kondisi if (selectedClient?.postal_code) addressLine2Parts.push(selectedClient.postal_code); membuat isi blok if di bawahnya hanya berjalan saat kondisi itu benar di form edit invoice.
  if (selectedClient?.postal_code) addressLine2Parts.push(selectedClient.postal_code);
  const cityProvincePostal = addressLine2Parts.join(", ");

  const selectedClientAddressLine1 = line1;
  const selectedClientAddressLine2 = line2 
    ? `${line2} ${cityProvincePostal}`.trim() 
    : cityProvincePostal;



  // Kalkulasi
  const subtotal = items.reduce((sum, item) => sum + ((Number(item.qty) || 0) * item.price), 0);
  const taxAmount = applyTax ? ((subtotal - discountAmount) * taxRate) / 100 : 0;
  const grandTotal = subtotal - discountAmount + taxAmount + shippingCost;



  // addItem menambah satu baris barang/jasa kosong supaya user bisa memasukkan item invoice berikutnya.
  const addItem = () => {
    setItems([...items, { id: Date.now(), name: "", qty: "", unit: "Pcs", price: 0 }]);
  };

  // removeItem menghapus atau menonaktifkan data yang dipilih user.
  const removeItem = (id: number) => {
    // Kalau invoice masih punya lebih dari satu item, user boleh menghapus baris item yang dipilih.
    if (items.length > 1) {
      // filter ini membuang item invoice yang id-nya dipilih user untuk dihapus dari form.
      setItems(items.filter(item => item.id !== id));
    }
  };

  // updateItem menyimpan perubahan data yang diedit dari form edit invoice yang memuat data lama lalu menyimpan perubahan.
  const updateItem = (id: number, field: keyof InvoiceItem, value: any) => {
    // map ini mengubah setiap item invoice di form menjadi data item yang siap disimpan ke Supabase atau ditampilkan di tabel.
    setItems(items.map(item => {
      // Kalau item invoice ini adalah baris yang sedang diedit, hanya baris itu yang diganti nilainya.
      if (item.id === id) {
        // Baris item yang sedang diedit dikembalikan dengan field baru, sementara isi lain tetap sama.
        return { ...item, [field]: value };
      }
      // Item lain dikembalikan apa adanya supaya perubahan hanya terjadi pada baris yang dipilih.
      return item;
    }));
  };

  // handleSubmit menangani aksi user di form edit invoice yang memuat data lama lalu menyimpan perubahan, seperti klik tombol, submit form, atau perubahan input.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Kalau customer belum dipilih, proses simpan invoice dihentikan dan modal peringatan ditampilkan.
    if (!clientId) {
      setWarningModal({
        isOpen: true,
        title: "Pilih Customer",
        description: "Silakan pilih customer terlebih dahulu sebelum menyimpan invoice."
      });
      // Proses invoice berhenti di sini karena validasi form belum lolos atau data yang dibutuhkan belum lengkap.
      return;
    }
    // Kalau jatuh tempo belum diisi, invoice tidak disimpan karena tanggal bayar wajib ada.
    if (!dueDate) {
      setWarningModal({
        isOpen: true,
        title: "Tentukan Jatuh Tempo",
        description: "Silakan tentukan tanggal jatuh tempo terlebih dahulu sebelum menyimpan invoice."
      });
      // Proses invoice berhenti di sini karena validasi form belum lolos atau data yang dibutuhkan belum lengkap.
      return;
    }
    // Kalau jatuh tempo lebih awal dari tanggal invoice, form menolak data supaya invoice tidak keliru.
    if (dueDate && invoiceDate && dueDate < invoiceDate) {
      setWarningModal({
        isOpen: true,
        title: "Tanggal Jatuh Tempo Tidak Valid",
        description: "Tanggal jatuh tempo tidak boleh lebih awal dari tanggal terbit invoice."
      });
      // Proses invoice berhenti di sini karena validasi form belum lolos atau data yang dibutuhkan belum lengkap.
      return;
    }
    // Kalau ada item tanpa nama, qty, atau harga valid, invoice tidak disimpan.
    if (items.some(i => !i.name || !i.qty || Number(i.qty) <= 0 || i.price <= 0)) {
      setWarningModal({
        isOpen: true,
        title: "Barang / Jasa Tidak Valid",
        description: "Pastikan semua barang/jasa memiliki deskripsi, jumlah (qty), dan harga yang valid sebelum menyimpan invoice."
      });
      // Proses invoice berhenti di sini karena validasi form belum lolos atau data yang dibutuhkan belum lengkap.
      return;
    }

    setSaving(true);
    // try ini menyimpan invoice, item invoice, lampiran, audit log, lalu mengarahkan user kembali ke daftar invoice.
    try {
      let attachmentUrl = existingAttachmentUrl;
      // Kalau user memilih lampiran, file diupload dulu sebelum invoice disimpan.
      if (attachment) {
        // await menunggu upload lampiran selesai agar invoice menyimpan URL file yang benar.
        const { url, error } = await uploadFile(attachment, 'uploads');
        // Kalau Supabase mengembalikan error atau data kosong, form edit invoice menampilkan pesan gagal atau mengembalikan data kosong agar UI tidak rusak.
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
        status: status as any,
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
      };

      // map ini mengubah setiap item invoice di form menjadi data item yang siap disimpan ke Supabase atau ditampilkan di tabel.
      const itemsData = items.map(item => ({
        description: item.name,
        quantity: Number(item.qty) || 0,
        unit: item.unit,
        unit_price: item.price,
        total_price: (Number(item.qty) || 0) * item.price
      }));

      // await menunggu proses async selesai sebelum kode ini melanjutkan langkah berikutnya.
      const { error } = await updateInvoiceWithItems(invoiceId, invoiceData, itemsData);
      
      // Kalau Supabase mengembalikan error atau data kosong, form edit invoice menampilkan pesan gagal atau mengembalikan data kosong agar UI tidak rusak.
      if (error) {
        console.error(error);
        toast.error(`Gagal memperbarui invoice: ${error.message}`);
      } else {
        toast("Pembaruan Berhasil", {
          description: `Invoice ${invoiceNumber} telah berhasil diperbarui.`,
          icon: <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center bg-[#76c893]/10 text-[#76c893]"><CheckCircleIcon className="w-5 h-5" /></div>,
        });

        // Add to Audit Log & Refresh Notifications
        if (user) {
          // await menunggu proses async selesai sebelum kode ini melanjutkan langkah berikutnya.
          await createAuditLog(user.id, 'update', 'E-Invoice', invoiceId as string, null, { 
            description: `Invoice ${invoiceNumber} berhasil diperbarui` 
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
      setSaving(false);
    }
  };

  // Kondisi if (loading) membuat isi blok if di bawahnya hanya berjalan saat kondisi itu benar di form edit invoice.
  if (loading) {
    // handleSubmit menampilkan potongan UI yang dipakai di form edit invoice yang memuat data lama lalu menyimpan perubahan.
    return <div className="p-10 text-center text-gray-500">Memuat data invoice...</div>;
  }

  // handleSubmit menampilkan UI untuk form edit invoice yang memuat data lama lalu menyimpan perubahan.
  return (
    <form className="max-w-5xl mx-auto space-y-6 pb-20" onSubmit={handleSubmit}>
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/e-invoice">
          <button type="button" className="p-2 bg-surface border border-border rounded-xl hover:bg-background transition-colors text-text-secondary">
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Edit Invoice</h1>
          <p className="text-sm text-text-secondary mt-1">{invoiceNumber}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Informasi Customer */}
          <div className="bg-surface border border-border rounded-2xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-text-primary border-b border-border pb-2 mb-4 flex items-center gap-2">
              <Document1Icon className="w-[18px] h-[18px] text-[#5C67F2]" /> Informasi Invoice & Customer
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
                  // map ini membuat opsi/baris customer dari data clients yang sudah diambil dari Supabase.
                  options={clients.map(c => ({ value: c.id, label: c.name }))}
                  value={clientId}
                  onChange={setClientId}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-text-primary mb-1.5">Alamat Penagihan</label>
                <textarea 
                  className="flex w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-primary shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5C67F2]/20 min-h-[60px] resize-y"
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

          {/* Section: Informasi Pengiriman */}
          <div className="bg-surface border border-border rounded-2xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-text-primary border-b border-border pb-2 mb-4 flex items-center gap-2">
              <TruckIcon className="w-[18px] h-[18px] text-[#5C67F2]" /> Informasi Pengiriman (Opsional)
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
                  className="flex w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-primary shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5C67F2]/20 min-h-[40px] resize-y text-xs"
                  placeholder="Masukkan alamat pengiriman jika berbeda dengan alamat customer..."
                  value={shippingAddress}
                  onChange={e => setShippingAddress(e.target.value)}
                ></textarea>
              </div>
            </div>
          </div>

          {/* Section 2: Detail Barang/Jasa */}
          <div className="bg-surface border border-border rounded-2xl shadow-sm p-6 overflow-hidden">
            <h3 className="text-lg font-semibold text-text-primary border-b border-border pb-2 mb-4 flex items-center gap-2">
              <PlusIcon className="w-[18px] h-[18px] text-[#5C67F2]" /> Detail Barang & Jasa
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
                  {/* map ini mengubah setiap item invoice di form menjadi data item yang siap disimpan ke Supabase atau ditampilkan di tabel. */}
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
                          onChange={(e) => updateItem(item.id, 'qty', e.target.value === "" ? "" : (parseInt(e.target.value) || 0))}
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
                        {formatCurrency((Number(item.qty) || 0) * item.price)}
                      </td>
                      <td className="px-2 py-3 text-center">
                        <button 
                          type="button"
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
              <Button type="button" variant="outline" size="sm" onClick={addItem} className="flex items-center gap-1 text-[#5C67F2] border-[#5C67F2]/20 hover:bg-[#5C67F2]/5">
                <PlusIcon className="w-3.5 h-3.5" /> Tambah Baris
              </Button>
            </div>
          </div>
        </div>

        {/* Sidebar Summary Area */}
        <div className="lg:col-span-1">
          <div className="bg-surface border border-border rounded-2xl shadow-sm p-6 sticky top-24">
            <h3 className="text-lg font-semibold text-text-primary border-b border-border pb-2 mb-4 flex items-center gap-2">
              <CalculatorIcon className="w-[18px] h-[18px] text-[#5C67F2]" /> Ringkasan Pembayaran
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
                    <p className="text-[10px] font-semibold text-[#5C67F2]">{shippingMethod}</p>
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
                <span className="font-bold text-lg text-[#5C67F2]">{formatCurrency(grandTotal)}</span>
              </div>
            </div>
            
            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">Jatuh Tempo Pada <span className="text-danger">*</span></label>
                <CustomDatePicker value={dueDate} onChange={setDueDate} minDate={invoiceDate} />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">Status</label>
                <CustomSelect 
                  placeholder="Pilih Status"
                  options={[
                    { value: "unpaid", label: "Belum Bayar" },
                    { value: "paid", label: "Lunas" },
                    { value: "overdue", label: "Jatuh Tempo" },
                    { value: "cancelled", label: "Dibatalkan" }
                  ]}
                  value={status}
                  onChange={setStatus}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">Catatan untuk Customer</label>
                <textarea 
                  className="flex w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-primary shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5C67F2]/20 min-h-[80px] resize-y text-xs"
                  placeholder="Terima kasih atas bisnis Anda..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">Lampiran Bukti (Opsional)</label>
                {existingAttachmentUrl && !attachment && (
                  <div className="mb-2 p-3 bg-surface rounded-xl border border-border flex justify-between items-center">
                    <span className="text-sm text-text-secondary truncate max-w-[200px]">Lampiran tersimpan</span>
                    <a href={existingAttachmentUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary font-medium hover:underline">Lihat</a>
                  </div>
                )}
                <label htmlFor="edit-file-upload" className="flex justify-center px-4 py-4 border-2 border-dashed border-border rounded-xl bg-surface hover:bg-background transition-colors cursor-pointer relative">
                  <div className="space-y-1 text-center">
                    <div className="flex text-sm text-text-secondary justify-center">
                      <div className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary/80 focus-within:outline-none">
                        <span>{attachment ? "Ganti file" : "Unggah file baru"}</span>
                        <input 
                          id="edit-file-upload" 
                          name="edit-file-upload" 
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
              <Button type="submit" disabled={saving} className="w-full flex items-center justify-center gap-2 py-6 text-base bg-[#5C67F2] hover:bg-[#4a55c2] text-white">
                <SaveIcon className="w-[18px] h-[18px]" /> {saving ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </div>
          </div>
        </div>
      </div>
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
