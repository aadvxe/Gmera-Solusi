"use client";

// Import React hook yang dipakai halaman daftar invoice untuk status pembayaran, edit, preview, hapus, dan export, misalnya untuk state, efek setelah render, atau referensi elemen.
import React, { useState, useEffect } from "react";
// Import Link supaya menu/tombol di halaman daftar invoice untuk status pembayaran, edit, preview, hapus, dan export bisa berpindah halaman tanpa reload penuh.
import Link from "next/link";
// Import ikon yang dipakai halaman daftar invoice untuk status pembayaran, edit, preview, hapus, dan export untuk memperjelas tombol, menu, status, dan aksi di layar.
import { Filter1Icon, PlusIcon, DocumentDownloadIcon, MoreHorizontalIcon, EyeIcon, EmailSentIcon, TrashIcon, CheckCircleIcon, CloseIcon, CalculatorIcon, TruckIcon, Document1Icon, ChevronDownIcon, EditIcon, HelpIcon, ArrowDownIcon } from "@astraicons/react/bold";
// Import ikon yang dipakai halaman daftar invoice untuk status pembayaran, edit, preview, hapus, dan export untuk memperjelas tombol, menu, status, dan aksi di layar.
import { SearchIcon } from "@astraicons/react/linear";
// Import komponen UI reusable supaya halaman daftar invoice untuk status pembayaran, edit, preview, hapus, dan export memakai tampilan tombol, modal, input, atau tabel yang konsisten.
import { Modal } from "@/components/ui/Modal";
// Import komponen UI reusable supaya halaman daftar invoice untuk status pembayaran, edit, preview, hapus, dan export memakai tampilan tombol, modal, input, atau tabel yang konsisten.
import { ConfirmModal } from "@/components/ui/ConfirmModal";
// Import komponen UI reusable supaya halaman daftar invoice untuk status pembayaran, edit, preview, hapus, dan export memakai tampilan tombol, modal, input, atau tabel yang konsisten.
import { Button } from "@/components/ui/Button";
// Import komponen UI reusable supaya halaman daftar invoice untuk status pembayaran, edit, preview, hapus, dan export memakai tampilan tombol, modal, input, atau tabel yang konsisten.
import { Input } from "@/components/ui/Input";
// Import komponen UI reusable supaya halaman daftar invoice untuk status pembayaran, edit, preview, hapus, dan export memakai tampilan tombol, modal, input, atau tabel yang konsisten.
import { CustomSelect } from "@/components/ui/CustomSelect";
// Import SkeletonTableRow untuk loading state table yang premium.
import { SkeletonTableRow } from "@/components/ui/Skeleton";
// Import berikutnya mengambil komponen/helper yang langsung dipakai oleh halaman daftar invoice.
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/Table";
// Import helper database yang dipakai halaman daftar invoice untuk status pembayaran, edit, preview, hapus, dan export untuk mengambil atau menyimpan data Supabase.
import { getInvoices, deleteInvoice, getClients, Invoice, Client } from "@/lib/db";
// Import helper database yang dipakai halaman daftar invoice untuk status pembayaran, edit, preview, hapus, dan export untuk mengambil atau menyimpan data Supabase.
import { createInvoiceWithItems } from "@/lib/db/invoices";
// Import helper database yang dipakai halaman daftar invoice untuk status pembayaran, edit, preview, hapus, dan export untuk mengambil atau menyimpan data Supabase.
import { createAuditLog } from "@/lib/db/users";
// Import authStore supaya halaman daftar invoice untuk status pembayaran, edit, preview, hapus, dan export bisa membaca user login, role, nama tampilan, atau mengosongkan session saat logout.
import { useAuthStore } from "@/store/authStore";
// Import utility project supaya halaman daftar invoice untuk status pembayaran, edit, preview, hapus, dan export bisa memformat class Tailwind atau angka Rupiah dengan cara yang sama.
import { formatCurrency } from "@/lib/utils";
// Import helper export supaya daftar invoice bisa diunduh sebagai PDF/Excel sesuai pencarian, customer, status, dan halaman yang sedang aktif.
import { exportToExcel, exportToPDF } from "@/lib/export";
// Import Sonner untuk menampilkan toast sukses/error di halaman daftar invoice untuk status pembayaran, edit, preview, hapus, dan export.
import { toast } from "sonner";
// Import ikon yang dipakai halaman daftar invoice untuk status pembayaran, edit, preview, hapus, dan export untuk memperjelas tombol, menu, status, dan aksi di layar.
import { ChevronLeft, ChevronRight } from "lucide-react";

// Interface ini menjelaskan field yang dipakai halaman daftar invoice untuk status pembayaran, edit, preview, hapus, dan export supaya data form/database tidak salah bentuk.
interface InvoiceItemForm {
  id: number;
  name: string;
  qty: number | "";
  price: number;
}

// EInvoicePage menampilkan semua invoice dan mengatur aksi status, preview, edit, hapus, serta export.
export default function EInvoicePage() {
  // searchTerm menyimpan nilai search term yang berubah saat user berinteraksi dengan halaman daftar invoice untuk status pembayaran, edit, preview, hapus, dan export.
  const [searchTerm, setSearchTerm] = useState("");
  const [invoices, setInvoices] = useState<(Invoice & { clients: { name: string } | null })[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  // loading menyimpan nilai loading yang berubah saat user berinteraksi dengan halaman daftar invoice untuk status pembayaran, edit, preview, hapus, dan export.
  const [loading, setLoading] = useState(true);
  const user = useAuthStore(state => state.user);
  const role = useAuthStore(state => state.role);
  // isModalOpen menyimpan nilai is modal open yang berubah saat user berinteraksi dengan halaman daftar invoice untuk status pembayaran, edit, preview, hapus, dan export.
  const [isModalOpen, setIsModalOpen] = useState(false);
  // clientId menyimpan nilai client id yang berubah saat user berinteraksi dengan halaman daftar invoice untuk status pembayaran, edit, preview, hapus, dan export.
  const [clientId, setClientId] = useState("");
  // isDeleteModalOpen menyimpan nilai is delete modal open yang berubah saat user berinteraksi dengan halaman daftar invoice untuk status pembayaran, edit, preview, hapus, dan export.
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<string | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  // itemsPerPage menyimpan nilai items per page yang berubah saat user berinteraksi dengan halaman daftar invoice untuk status pembayaran, edit, preview, hapus, dan export.
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // isFilterDropdownOpen menyimpan nilai is filter dropdown open yang berubah saat user berinteraksi dengan halaman daftar invoice untuk status pembayaran, edit, preview, hapus, dan export.
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  // filterStatus menyimpan nilai filter status yang berubah saat user berinteraksi dengan halaman daftar invoice untuk status pembayaran, edit, preview, hapus, dan export.
  const [filterStatus, setFilterStatus] = useState("all");
  // filterClientId menyimpan nilai filter client id yang berubah saat user berinteraksi dengan halaman daftar invoice untuk status pembayaran, edit, preview, hapus, dan export.
  const [filterClientId, setFilterClientId] = useState("all");

  // resetFilters mengembalikan filter invoice ke kondisi awal: semua status, tanpa pencarian, dan halaman pertama.
  const resetFilters = () => {
    setFilterStatus("all");
    setFilterClientId("all");
    setIsFilterDropdownOpen(false);
  };

  // loadData mengambil data yang dibutuhkan halaman daftar invoice untuk status pembayaran, edit, preview, hapus, dan export dari Supabase lalu mengisi state halaman.
  const loadData = async () => {
    setLoading(true);
    // await Promise.all menunggu beberapa query berjalan paralel sampai semuanya selesai.
    const [invData, clientData] = await Promise.all([
      getInvoices(),
      getClients()
    ]);
    setInvoices(invData);
    setClients(clientData);
    setLoading(false);
  };

  // Effect ini mengambil data yang diperlukan halaman daftar invoice untuk status pembayaran, edit, preview, hapus, dan export saat halaman dibuka atau filter berubah.
  useEffect(() => {
    loadData();
  }, []);



  // getStatusBadge mengambil atau menghitung data yang dibutuhkan halaman daftar invoice untuk status pembayaran, edit, preview, hapus, dan export.
  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    switch (s) {
      case "paid":
      case "lunas":
        // getStatusBadge menampilkan potongan UI yang dipakai di halaman daftar invoice untuk status pembayaran, edit, preview, hapus, dan export.
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#76c893]/10 text-[#76c893] flex items-center gap-1 w-max"><CheckCircleIcon className="w-3 h-3" /> Lunas</span>;
      case "overdue":
      case "jatuh tempo":
        // getStatusBadge menampilkan potongan UI yang dipakai di halaman daftar invoice untuk status pembayaran, edit, preview, hapus, dan export.
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#f08a5d]/10 text-[#f08a5d] w-max block">Jatuh T.</span>;
      case "cancelled":
      case "dibatalkan":
        // getStatusBadge menampilkan potongan UI yang dipakai di halaman daftar invoice untuk status pembayaran, edit, preview, hapus, dan export.
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-500 w-max block">Dibatalkan</span>;
      default:
        // getStatusBadge menampilkan potongan UI yang dipakai di halaman daftar invoice untuk status pembayaran, edit, preview, hapus, dan export.
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#ffd166]/10 text-[#ffd166] w-max block">Belum Bayar</span>;
    }
  };

  // Form State
  const [items, setItems] = useState<InvoiceItemForm[]>([{ id: 1, name: "", qty: "", price: 0 }]);
  // shippingCost menyimpan nilai shipping cost yang berubah saat user berinteraksi dengan halaman daftar invoice untuk status pembayaran, edit, preview, hapus, dan export.
  const [shippingCost, setShippingCost] = useState(0);
  // taxRate menyimpan nilai tax rate yang berubah saat user berinteraksi dengan halaman daftar invoice untuk status pembayaran, edit, preview, hapus, dan export.
  const [taxRate, setTaxRate] = useState(11);
  // applyTax menyimpan nilai apply tax yang berubah saat user berinteraksi dengan halaman daftar invoice untuk status pembayaran, edit, preview, hapus, dan export.
  const [applyTax, setApplyTax] = useState(true);
  
  // reduce ini menjumlahkan nominal transaksi untuk ringkasan angka di halaman daftar invoice untuk status pembayaran, edit, preview, hapus, dan export.
  const subtotal = items.reduce((sum, item) => sum + ((Number(item.qty) || 0) * item.price), 0);
  const taxAmount = applyTax ? (subtotal * taxRate) / 100 : 0;
  const grandTotal = subtotal + taxAmount + shippingCost;

  // addItem menambah satu baris barang/jasa kosong supaya user bisa memasukkan item invoice berikutnya.
  const addItem = () => setItems([...items, { id: Date.now(), name: "", qty: "", price: 0 }]);
  // removeItem menghapus atau menonaktifkan data yang dipilih user.
  const removeItem = (id: number) => {
    // Kalau invoice masih punya lebih dari satu item, user boleh menghapus baris item yang dipilih.
    if (items.length > 1) setItems(items.filter(item => item.id !== id));
  };
  // updateItem menyimpan perubahan data yang diedit dari halaman daftar invoice untuk status pembayaran, edit, preview, hapus, dan export.
  const updateItem = (id: number, field: keyof InvoiceItemForm, value: any) => {
    // map ini mengubah setiap item invoice di form menjadi data item yang siap disimpan ke Supabase atau ditampilkan di tabel.
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  // handleCreateInvoice menangani aksi user di halaman daftar invoice untuk status pembayaran, edit, preview, hapus, dan export, seperti klik tombol, submit form, atau perubahan input.
  const handleCreateInvoice = async () => {
    // Kalau customer belum dipilih, proses simpan invoice dihentikan dan modal peringatan ditampilkan.
    if (!clientId) return alert("Pilih customer terlebih dahulu");
    // Kalau ada item tanpa nama, qty, atau harga valid, invoice tidak disimpan.
    if (items.some(i => !i.name || !i.qty || Number(i.qty) <= 0 || i.price <= 0)) return alert("Lengkapi detail barang/jasa");

    setLoading(true);
    // try ini membaca atau menyimpan data invoice dari Supabase sesuai aksi user di halaman invoice.
    try {
      const now = new Date();
      const due = new Date();
      due.setDate(now.getDate() + 14); // Default 14 days

      const selectedClient = clients.find(c => c.id === clientId);

      // await menunggu proses async selesai sebelum kode ini melanjutkan langkah berikutnya.
      const { error } = await createInvoiceWithItems({
        invoice_number: `INV-${Date.now()}`,
        client_id: clientId,
        client_name: selectedClient?.name ?? '',
        client_address: selectedClient?.address ?? null,
        client_phone: selectedClient?.phone ?? null,
        client_email: selectedClient?.email ?? null,
        invoice_date: now.toISOString().split('T')[0],
        due_date: due.toISOString().split('T')[0],
        status: 'unpaid',
        subtotal,
        tax_rate: applyTax ? taxRate : 0,
        tax_amount: taxAmount,
        shipping_cost: shippingCost,
        shipping_method: null,
        tracking_number: null,
        discount_amount: 0,
        grand_total: grandTotal,
        notes: null,
        created_by: null,
        paid_at: null,
      // map ini mengubah setiap item invoice di form menjadi data item yang siap disimpan ke Supabase atau ditampilkan di tabel.
      }, items.map(i => ({
        description: i.name,
        quantity: Number(i.qty) || 0,
        unit: 'pcs',
        unit_price: i.price,
        total_price: (Number(i.qty) || 0) * i.price
      })));

      // Kalau Supabase mengembalikan error atau data kosong, halaman daftar invoice menampilkan pesan gagal atau mengembalikan data kosong agar UI tidak rusak.
      if (error) throw error;
      
      setIsModalOpen(false);
      setItems([{ id: 1, name: "", qty: "", price: 0 }]);
      setClientId("");
      loadData();
      alert("Invoice berhasil dibuat!");
    } catch (error: any) {
      alert("Gagal membuat invoice: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // handleDeleteClick adalah fungsi penangan aksi user; fungsi ini berjalan saat user mengklik, mengetik, memilih, atau submit sesuatu.
  const handleDeleteClick = (id: string) => {
    setInvoiceToDelete(id);
    setIsDeleteModalOpen(true);
  };

  // confirmDelete menjalankan hapus data setelah user menyetujui modal konfirmasi.
  const confirmDelete = async () => {
    // Kondisi if (!invoiceToDelete) return; membuat isi blok if di bawahnya hanya berjalan saat kondisi itu benar di halaman daftar invoice.
    if (!invoiceToDelete) return;
    
    setLoading(true);
    // await menunggu proses async selesai sebelum kode ini melanjutkan langkah berikutnya.
    const { error } = await deleteInvoice(invoiceToDelete);
    setLoading(false);
    
    // Kalau Supabase mengembalikan error atau data kosong, halaman daftar invoice menampilkan pesan gagal atau mengembalikan data kosong agar UI tidak rusak.
    if (error) {
      alert("Gagal menghapus invoice: " + error.message);
    } else {
      setIsDeleteModalOpen(false);
      setInvoiceToDelete(null);
      loadData();
    }
  };

  // getFilteredInvoices mengambil atau menghitung data yang dibutuhkan halaman daftar invoice untuk status pembayaran, edit, preview, hapus, dan export.
  const getFilteredInvoices = () => {
    // getFilteredInvoices mengembalikan hasil untuk halaman daftar invoice, sesuai data yang dihitung tepat sebelum baris return ini.
    return invoices.filter(row => {
      const matchesSearch = row.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            row.clients?.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === "all" ? true : row.status === filterStatus;
      const matchesClient = filterClientId === "all" ? true : row.client_id === filterClientId;
      
      // matchesClient mengembalikan hasil untuk halaman daftar invoice, sesuai data yang dihitung tepat sebelum baris return ini.
      return matchesSearch && matchesStatus && matchesClient;
    });
  };

  // Reset page to 1 when filters or search terms change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, filterClientId]);

  const filteredInvoices = getFilteredInvoices();
  const totalItems = filteredInvoices.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  // Bagian startIndex menyimpan logika yang dipakai di bawahnya.
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedInvoices = filteredInvoices.slice(startIndex, endIndex);

  // getPageNumbers mengambil atau menghitung data yang dibutuhkan halaman daftar invoice untuk status pembayaran, edit, preview, hapus, dan export.
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    // Kondisi if (totalPages <= maxVisible) membuat isi blok if di bawahnya hanya berjalan saat kondisi itu benar di halaman daftar invoice.
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);
      
      // Kondisi if (currentPage <= 3) membuat isi blok if di bawahnya hanya berjalan saat kondisi itu benar di halaman daftar invoice.
      if (currentPage <= 3) {
        end = 4;
      } else if (currentPage >= totalPages - 2) {
        start = totalPages - 3;
      }
      
      // Kondisi if (start > 2) membuat isi blok if di bawahnya hanya berjalan saat kondisi itu benar di halaman daftar invoice.
      if (start > 2) {
        pages.push("ellipsis-start");
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      // Kondisi if (end < totalPages - 1) membuat isi blok if di bawahnya hanya berjalan saat kondisi itu benar di halaman daftar invoice.
      if (end < totalPages - 1) {
        pages.push("ellipsis-end");
      }
      
      pages.push(totalPages);
    }
    
    // maxVisible mengembalikan hasil untuk halaman daftar invoice, sesuai data yang dihitung tepat sebelum baris return ini.
    return pages;
  };

  const exportColumns = [
    { header: 'No. Invoice', key: 'invoice_number', width: 18 },
    { header: 'Customer', key: 'clients.name', width: 24 },
    { header: 'Tgl. Terbit', key: 'invoice_date', isDate: true, width: 14 },
    { header: 'Jatuh Tempo', key: 'due_date', isDate: true, width: 14 },
    { header: 'Total (Rp)', key: 'grand_total', isCurrency: true, width: 22 },
    { header: 'Status', key: 'status', width: 12 }
  ];

  // handleExportExcel menangani aksi user di halaman daftar invoice untuk status pembayaran, edit, preview, hapus, dan export, seperti klik tombol, submit form, atau perubahan input.
  const handleExportExcel = async () => {
    // try ini membaca atau menyimpan data invoice dari Supabase sesuai aksi user di halaman invoice.
    try {
      exportToExcel(getFilteredInvoices(), exportColumns, `Invoice_${new Date().toISOString().slice(0,10)}`);
      toast("Ekspor Excel Selesai", {
        description: "Daftar invoice berhasil diekspor ke format Excel.",
        icon: <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center bg-[#5C67F2]/10 text-[#5C67F2]"><ArrowDownIcon className="w-5 h-5" /></div>,
      });
      
      // Kalau data user tersedia, lanjutkan proses yang membutuhkan akun login.
      if (user) {
        // await menunggu proses async selesai sebelum kode ini melanjutkan langkah berikutnya.
        await createAuditLog(user.id, 'create', 'Export', null, null, { description: 'Daftar E-Invoice (Excel) berhasil diunduh' });
        window.dispatchEvent(new CustomEvent('refreshNotifications'));
      }
    } catch (error) {
      toast("Gagal Ekspor Excel", {
        description: "Terjadi kesalahan saat mengekspor data ke Excel.",
        icon: <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center bg-[#FA5A7D]/10 text-[#FA5A7D]"><HelpIcon className="w-5 h-5" /></div>,
      });
    }
  };

  // handleExportPDF menangani aksi user di halaman daftar invoice untuk status pembayaran, edit, preview, hapus, dan export, seperti klik tombol, submit form, atau perubahan input.
  const handleExportPDF = async () => {
    toast.info("Sedang menyiapkan PDF...");
    // try ini membaca atau menyimpan data invoice dari Supabase sesuai aksi user di halaman invoice.
    try {
      exportToPDF(getFilteredInvoices(), exportColumns, 'Laporan Invoice', `Laporan_Invoice_${new Date().toISOString().slice(0,10)}`);
      toast("Ekspor PDF Selesai", {
        description: "Laporan invoice berhasil diunduh dalam format PDF.",
        icon: <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center bg-[#5C67F2]/10 text-[#5C67F2]"><ArrowDownIcon className="w-5 h-5" /></div>,
      });

      // Kalau data user tersedia, lanjutkan proses yang membutuhkan akun login.
      if (user) {
        // await menunggu proses async selesai sebelum kode ini melanjutkan langkah berikutnya.
        await createAuditLog(user.id, 'create', 'Export', null, null, { description: 'Laporan E-Invoice (PDF) berhasil diunduh' });
        window.dispatchEvent(new CustomEvent('refreshNotifications'));
      }
    } catch (error) {
      console.error("PDF Export Error:", error);
      toast("Gagal Ekspor PDF", {
        description: "Terjadi kesalahan saat mengekspor data ke PDF.",
        icon: <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center bg-[#FA5A7D]/10 text-[#FA5A7D]"><HelpIcon className="w-5 h-5" /></div>,
      });
    }
  };

  // handleExportPDF menampilkan UI untuk halaman daftar invoice untuk status pembayaran, edit, preview, hapus, dan export.
  return (
    <>
      <div className="bg-surface border border-border rounded-2xl shadow-sm flex flex-col h-full min-h-[500px]">
        {/* Header & Actions */}
        <div className="p-6 border-b border-border">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-[#151D48]">E-Invoice</h1>
              <p className="text-sm text-gray-500 mt-1">Kelola pembuatan dan penagihan faktur ke customer</p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button variant="outline" className="flex items-center gap-2" onClick={handleExportExcel}>
                <DocumentDownloadIcon className="w-4 h-4" /> <span className="hidden sm:inline">Excel</span>
              </Button>
              <Button variant="outline" className="flex items-center gap-2" onClick={handleExportPDF}>
                <DocumentDownloadIcon className="w-4 h-4" /> <span className="hidden sm:inline">PDF</span>
              </Button>
              {role !== 'viewer' && (
                <Link href="/e-invoice/buat" className="w-full sm:w-auto">
                  <Button 
                    className="w-full flex items-center gap-2 bg-[#5C67F2] hover:bg-[#4a55c2] text-white"
                  >
                    <PlusIcon className="w-4 h-4" /> Buat Invoice Baru
                  </Button>
                </Link>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 max-w-md sm:min-w-72">
              <Input 
                placeholder="Cari nomor invoice atau customer..." 
                icon={<SearchIcon className="w-[18px] h-[18px]" />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-[#F9FAFB] border-gray-200"
              />
            </div>
            <div className="relative">
              <Button 
                variant="outline" 
                onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                className={`flex items-center gap-2 sm:w-auto w-full transition-all duration-300 ${
                  (filterStatus !== 'all' || filterClientId !== 'all') 
                    ? 'bg-[#5C67F2] text-white border-[#5C67F2] shadow-[0_8px_20px_rgba(92,103,242,0.2)]' 
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                <Filter1Icon className="w-4 h-4" /> 
                Filter
                {(filterStatus !== 'all' || filterClientId !== 'all') && (
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                )}
              </Button>

              {isFilterDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsFilterDropdownOpen(false)}></div>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 z-50 mt-2">
                    <div className="w-[calc(100vw-2rem)] sm:w-[500px] bg-white border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-2xl p-6 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="mb-5">
                        <h3 className="font-bold text-[#151D48]">Filter Invoice</h3>
                      </div>

                      <div className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status Pembayaran</label>
                            <CustomSelect 
                              options={[
                                { value: "all", label: "Semua Status" },
                                { value: "unpaid", label: "Belum Bayar" },
                                { value: "paid", label: "Lunas" },
                                { value: "overdue", label: "Jatuh Tempo" },
                              ]}
                              value={filterStatus}
                              onChange={setFilterStatus}
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Customer</label>
                            <CustomSelect 
                              options={[
                                { value: "all", label: "Semua Customer" },
                                // map ini membuat opsi/baris customer dari data clients yang sudah diambil dari Supabase.
                                ...clients.map(c => ({ value: c.id, label: c.name }))
                              ]}
                              value={filterClientId}
                              onChange={setFilterClientId}
                            />
                          </div>
                        </div>

                        <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                          <button 
                            onClick={resetFilters}
                            className="text-xs font-bold text-gray-400 hover:text-red-500 transition-colors uppercase tracking-wider"
                          >
                            Reset Filter
                          </button>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline"
                              onClick={() => setIsFilterDropdownOpen(false)}
                              className="text-xs font-bold uppercase h-9 px-4 rounded-xl"
                            >
                              Batal
                            </Button>
                            <Button 
                              onClick={() => setIsFilterDropdownOpen(false)}
                              className="bg-[#5C67F2] hover:bg-[#4a55c2] text-white font-bold text-xs uppercase h-9 px-6 rounded-xl"
                            >
                              Terapkan
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No. Invoice</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Tgl. Terbit</TableHead>
                <TableHead>Jatuh Tempo</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <SkeletonTableRow key={idx} cols={7} widths={["w-24", "w-36", "w-24", "w-24", "ml-auto w-28", "w-20", "ml-auto w-12"]} />
                ))
              ) : filteredInvoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-gray-500">
                    Tidak ada invoice yang ditemukan.
                  </TableCell>
                </TableRow>
              ) : (
                // filter ini menyisakan data halaman daftar invoice yang cocok dengan pencarian, status, role, atau tanggal aktif.
                paginatedInvoices.map((row) => (
                  <TableRow key={row.id} className="animate-fade-in">
                    <TableCell className="font-medium text-[#5C67F2] cursor-pointer hover:underline">{row.invoice_number}</TableCell>
                    <TableCell className="font-semibold text-[#151D48]">{row.clients?.name}</TableCell>
                    <TableCell className="text-gray-600">{new Date(row.invoice_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</TableCell>
                    <TableCell className={row.status === 'overdue' ? 'text-[#FA5A7D] font-medium' : 'text-gray-600'}>
                      {new Date(row.due_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </TableCell>
                    <TableCell className="text-right font-bold text-[#151D48] tabular-nums">
                      {formatCurrency(row.grand_total || 0)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(row.status || 'Unpaid')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Link href={`/e-invoice/${row.id}/detail`}>
                          <button className="p-1.5 text-gray-400 hover:text-[#5C67F2] hover:bg-[#5C67F2]/10 rounded-md transition-colors" title="Lihat">
                            <EyeIcon className="w-4 h-4" />
                          </button>
                        </Link>
                        {role !== 'viewer' && (
                          <Link href={`/e-invoice/${row.id}/edit`}>
                            <button className="p-1.5 text-gray-400 hover:text-[#5C67F2] hover:bg-[#5C67F2]/10 rounded-md transition-colors" title="Edit">
                              <EditIcon className="w-4 h-4" />
                            </button>
                          </Link>
                        )}
                        <Link href={`/e-invoice/${row.id}/detail?download=true`}>
                          <button className="p-1.5 text-gray-400 hover:text-[#5C67F2] hover:bg-[#5C67F2]/10 rounded-md transition-colors" title="Download PDF">
                            <DocumentDownloadIcon className="w-4 h-4" />
                          </button>
                        </Link>
                        {role !== 'viewer' && (
                          <button onClick={() => handleDeleteClick(row.id)} className="p-1.5 text-gray-400 hover:text-[#FA5A7D] hover:bg-[#FA5A7D]/10 rounded-md transition-colors" title="Hapus">
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-border flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between text-sm text-gray-500">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span>Tampilkan:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-white border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#5C67F2]/20"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span>data per halaman</span>
            </div>
            <div>
              Menampilkan {totalItems === 0 ? 0 : startIndex + 1} - {Math.min(endIndex, totalItems)} dari {totalItems} data
            </div>
          </div>
          <div className="flex flex-row flex-nowrap gap-1 items-center justify-end select-none">
            <Button 
              variant="outline" 
              size="sm" 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              className="w-8 px-0 flex items-center justify-center"
              title="Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            {/* map ini membuat satu output untuk setiap item daftar yang sedang dirender oleh halaman daftar invoice. */}
            {getPageNumbers().map((p, idx) => {
              // Kondisi if (p === "ellipsis-start" || p === "ellipsis-end") membuat isi blok if di bawahnya hanya berjalan saat kondisi itu benar di halaman daftar invoice.
              if (p === "ellipsis-start" || p === "ellipsis-end") {
                // handleExportPDF menampilkan UI untuk halaman daftar invoice untuk status pembayaran, edit, preview, hapus, dan export.
                return (
                  <span key={`ellipsis-${idx}`} className="px-1 text-gray-400">
                    ...
                  </span>
                );
              }
              // handleExportPDF menampilkan UI untuk halaman daftar invoice untuk status pembayaran, edit, preview, hapus, dan export.
              return (
                <Button
                  key={`page-${p}`}
                  variant={currentPage === p ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(p as number)}
                  className={currentPage === p 
                    ? "bg-[#5C67F2] hover:bg-[#4a55c2] text-white w-8 px-0 flex items-center justify-center" 
                    : "w-8 px-0 flex items-center justify-center"}
                >
                  {p}
                </Button>
              );
            })}

            <Button 
              variant="outline" 
              size="sm" 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              className="w-8 px-0 flex items-center justify-center"
              title="Selanjutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh]">
          <div className="flex items-center justify-between p-6 border-b border-gray-100 shrink-0">
            <div>
              <h2 className="text-xl font-bold text-[#151D48]">Buat Invoice Baru</h2>
              <p className="text-sm text-gray-500 mt-1">Buat faktur penagihan untuk customer Anda</p>
            </div>
            <button 
              onClick={() => setIsModalOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <CloseIcon className="w-5 h-5 text-gray-500" />
            </button>
          </div>
            
            <div className="p-6 overflow-y-auto flex-1 bg-gray-50">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Form Content */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Info Customer */}
                  <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                    <h3 className="text-sm font-semibold text-[#151D48] mb-4 flex items-center gap-2">
                    <Document1Icon className="w-4 h-4 text-[#5C67F2]" /> Informasi Customer
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-gray-500 mb-1.5">Customer <span className="text-red-500">*</span></label>
                        <CustomSelect 
                          // map ini membuat opsi/baris customer dari data clients yang sudah diambil dari Supabase.
                          options={clients.map(c => ({ value: c.id, label: c.name }))}
                          value={clientId}
                          onChange={setClientId}
                          placeholder="Pilih Customer"
                          triggerClassName="w-full bg-[#F9FAFB] border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#5C67F2]/20"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1.5">Tanggal Terbit</label>
                        <Input type="date" defaultValue={new Date().toISOString().split('T')[0]} className="bg-[#F9FAFB]" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1.5">Jatuh Tempo <span className="text-red-500">*</span></label>
                        <Input type="date" className="bg-[#F9FAFB]" />
                      </div>
                    </div>
                  </div>

                  {/* Detail Barang */}
                  <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                    <h3 className="text-sm font-semibold text-[#151D48] mb-4 flex items-center gap-2">
                      <PlusIcon className="w-4 h-4 text-[#5C67F2]" /> Detail Tagihan
                    </h3>
                    <div className="space-y-3">
                      {/* map ini mengubah setiap item invoice di form menjadi data item yang siap disimpan ke Supabase atau ditampilkan di tabel. */}
                      {items.map((item, idx) => (
                        <div key={item.id} className="flex flex-col gap-3 p-3 border border-gray-100 rounded-lg bg-[#F9FAFB] sm:flex-row sm:items-start">
                          <div className="flex-1">
                            <Input placeholder="Deskripsi Barang/Jasa" value={item.name} onChange={(e) => updateItem(item.id, 'name', e.target.value)} className="bg-white mb-2" />
                            <div className="flex gap-3">
                              <div className="w-24">
                                <Input type="number" min="1" placeholder="Qty" value={item.qty} onChange={(e) => updateItem(item.id, 'qty', e.target.value === "" ? "" : (parseInt(e.target.value) || 0))} className="bg-white" />
                              </div>
                              <div className="flex-1">
                                <Input type="number" min="0" placeholder="Harga Satuan" value={item.price} onChange={(e) => updateItem(item.id, 'price', parseInt(e.target.value) || 0)} className="bg-white" />
                              </div>
                            </div>
                          </div>
                          <div className="flex shrink-0 items-center justify-between gap-2 pt-1 sm:w-32 sm:flex-col sm:items-end">
                            <span className="font-bold text-[#151D48] text-sm">{formatCurrency((Number(item.qty) || 0) * item.price)}</span>
                            <button onClick={() => removeItem(item.id)} disabled={items.length === 1} className="text-gray-400 hover:text-[#FA5A7D] p-1 mt-auto">
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                      <Button variant="outline" size="sm" onClick={addItem} className="text-[#5C67F2] border-[#5C67F2]/30 hover:bg-[#5C67F2]/5 w-full">
                        <PlusIcon className="w-3.5 h-3.5 mr-1" /> Tambah Baris
                      </Button>
                    </div>
                  </div>

                  {/* Pengiriman */}
                  <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                    <h3 className="text-sm font-semibold text-[#151D48] mb-4 flex items-center gap-2">
                      <TruckIcon className="w-4 h-4 text-[#5C67F2]" /> Informasi Pengiriman
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-gray-500 mb-1.5">Biaya Ongkos Kirim (Rp)</label>
                        <Input type="number" min="0" value={shippingCost} onChange={(e) => setShippingCost(parseInt(e.target.value) || 0)} className="bg-[#F9FAFB]" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sidebar Ringkasan */}
                <div className="lg:col-span-1">
                  <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm sticky top-0">
                    <h3 className="text-sm font-semibold text-[#151D48] border-b border-gray-100 pb-3 mb-4 flex items-center gap-2">
                      <CalculatorIcon className="w-4 h-4 text-[#5C67F2]" /> Ringkasan Pembayaran
                    </h3>
                    
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between items-center text-gray-600">
                        <span>Subtotal</span>
                        <span className="font-medium text-[#151D48]">{formatCurrency(subtotal)}</span>
                      </div>
                      
                      <div className="flex justify-between items-center text-gray-600">
                        <div className="flex items-center gap-2">
                          <input type="checkbox" checked={applyTax} onChange={(e) => setApplyTax(e.target.checked)} className="w-3.5 h-3.5 rounded accent-[#5C67F2]" />
                          <span>Pajak (PPN {taxRate}%)</span>
                        </div>
                        <span className="font-medium text-[#151D48]">{formatCurrency(taxAmount)}</span>
                      </div>
                      
                      <div className="flex justify-between items-center text-gray-600">
                        <span>Ongkos Kirim</span>
                        <span className="font-medium text-[#151D48]">{formatCurrency(shippingCost)}</span>
                      </div>
                      
                      <div className="pt-3 mt-3 border-t border-gray-100 flex justify-between items-center">
                        <span className="font-bold text-sm text-[#151D48]">TOTAL</span>
                        <span className="font-bold text-lg text-[#5C67F2]">{formatCurrency(grandTotal)}</span>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-100">
                      <label className="block text-xs font-medium text-gray-500 mb-1.5">Catatan</label>
                      <textarea className="w-full bg-[#F9FAFB] border border-gray-200 rounded-lg p-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#5C67F2]/20" rows={3} placeholder="Instruksi transfer..."></textarea>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-4 sm:p-6 border-t border-gray-100 bg-white flex flex-col-reverse gap-3 shrink-0 sm:flex-row sm:justify-end">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Batal
              </Button>
              <Button onClick={handleCreateInvoice} disabled={loading} className="bg-[#5C67F2] hover:bg-[#4a55c2] text-white">
                {loading ? "Menyimpan..." : "Terbitkan Invoice"}
              </Button>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Hapus Invoice"
        description="Apakah Anda yakin ingin menghapus invoice ini? Tindakan ini tidak dapat dibatalkan."
        confirmText="Hapus"
        isDanger={true}
        isLoading={loading}
      />

    </>
  );
}
