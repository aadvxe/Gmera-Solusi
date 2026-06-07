"use client";

// Import React hook yang dipakai halaman customer untuk melihat, mencari, mengedit, dan menghapus data pelanggan, misalnya untuk state, efek setelah render, atau referensi elemen.
import React, { useState, useEffect } from "react";
// Import ikon yang dipakai halaman customer untuk melihat, mencari, mengedit, dan menghapus data pelanggan untuk memperjelas tombol, menu, status, dan aksi di layar.
import { Filter1Icon, PlusIcon, DocumentDownloadIcon, EyeIcon, EditIcon, TrashIcon, EmailIcon, CallIcon, CloseIcon, ArrowDownIcon, HelpIcon } from "@astraicons/react/bold";
// Import ikon yang dipakai halaman customer untuk melihat, mencari, mengedit, dan menghapus data pelanggan untuk memperjelas tombol, menu, status, dan aksi di layar.
import { SearchIcon } from "@astraicons/react/linear";
// Import komponen UI reusable supaya halaman customer untuk melihat, mencari, mengedit, dan menghapus data pelanggan memakai tampilan tombol, modal, input, atau tabel yang konsisten.
import { Modal } from "@/components/ui/Modal";
// Import komponen UI reusable supaya halaman customer untuk melihat, mencari, mengedit, dan menghapus data pelanggan memakai tampilan tombol, modal, input, atau tabel yang konsisten.
import { ConfirmModal } from "@/components/ui/ConfirmModal";
// Import komponen UI reusable supaya halaman customer untuk melihat, mencari, mengedit, dan menghapus data pelanggan memakai tampilan tombol, modal, input, atau tabel yang konsisten.
import { Button } from "@/components/ui/Button";
// Import komponen UI reusable supaya halaman customer untuk melihat, mencari, mengedit, dan menghapus data pelanggan memakai tampilan tombol, modal, input, atau tabel yang konsisten.
import { Input } from "@/components/ui/Input";
// Import komponen UI reusable supaya halaman customer untuk melihat, mencari, mengedit, dan menghapus data pelanggan memakai tampilan tombol, modal, input, atau tabel yang konsisten.
import { CustomSelect } from "@/components/ui/CustomSelect";
// Import berikutnya mengambil komponen/helper yang langsung dipakai oleh halaman customer.
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow,
} from "@/components/ui/Table";
// Import helper database yang dipakai halaman customer untuk melihat, mencari, mengedit, dan menghapus data pelanggan untuk mengambil atau menyimpan data Supabase.
import { getClients, insertClient, updateClient, deleteClient, Client, getClientInvoiceStats, getInvoicesByClient, Invoice } from "@/lib/db";
// Import helper database yang dipakai halaman customer untuk melihat, mencari, mengedit, dan menghapus data pelanggan untuk mengambil atau menyimpan data Supabase.
import { createAuditLog } from "@/lib/db/users";
// Import Sonner untuk menampilkan toast sukses/error di halaman customer untuk melihat, mencari, mengedit, dan menghapus data pelanggan.
import { toast } from "sonner";
// Import utility project supaya halaman customer untuk melihat, mencari, mengedit, dan menghapus data pelanggan bisa memformat class Tailwind atau angka Rupiah dengan cara yang sama.
import { formatCurrency } from "@/lib/utils";
// Import authStore supaya halaman customer untuk melihat, mencari, mengedit, dan menghapus data pelanggan bisa membaca user login, role, nama tampilan, atau mengosongkan session saat logout.
import { useAuthStore } from "@/store/authStore";
// Import helper export supaya daftar customer bisa diunduh sebagai PDF/Excel sesuai pencarian dan status aktif/nonaktif.
import { exportToExcel, exportToPDF } from "@/lib/export";
// Import ikon yang dipakai halaman customer untuk melihat, mencari, mengedit, dan menghapus data pelanggan untuk memperjelas tombol, menu, status, dan aksi di layar.
import { ChevronLeft, ChevronRight } from "lucide-react";

// CustomerPage menampilkan daftar customer aktif dan menyediakan aksi tambah, edit, detail, hapus, dan filter.
export default function CustomerPage() {
  const role = useAuthStore(state => state.role);

  // searchTerm menyimpan nilai search term yang berubah saat user berinteraksi dengan halaman customer untuk melihat, mencari, mengedit, dan menghapus data pelanggan.
  const [searchTerm, setSearchTerm] = useState("");
  const [clients, setClients] = useState<(Client & { stats?: { totalInvoices: number, unpaidAmount: number } })[]>([]);
  // loading menyimpan nilai loading yang berubah saat user berinteraksi dengan halaman customer untuk melihat, mencari, mengedit, dan menghapus data pelanggan.
  const [loading, setLoading] = useState(true);
  // isModalOpen menyimpan nilai is modal open yang berubah saat user berinteraksi dengan halaman customer untuk melihat, mencari, mengedit, dan menghapus data pelanggan.
  const [isModalOpen, setIsModalOpen] = useState(false);
  // isEdit menyimpan nilai is edit yang berubah saat user berinteraksi dengan halaman customer untuk melihat, mencari, mengedit, dan menghapus data pelanggan.
  const [isEdit, setIsEdit] = useState(false);
  const [currentClientId, setCurrentClientId] = useState<string | null>(null);
  // isDeleteModalOpen menyimpan nilai is delete modal open yang berubah saat user berinteraksi dengan halaman customer untuk melihat, mencari, mengedit, dan menghapus data pelanggan.
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<string | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  // itemsPerPage menyimpan nilai items per page yang berubah saat user berinteraksi dengan halaman customer untuk melihat, mencari, mengedit, dan menghapus data pelanggan.
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // isDetailModalOpen menyimpan nilai is detail modal open yang berubah saat user berinteraksi dengan halaman customer untuk melihat, mencari, mengedit, dan menghapus data pelanggan.
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<(Client & { stats?: { totalInvoices: number, unpaidAmount: number } }) | null>(null);
  const [clientInvoices, setClientInvoices] = useState<Invoice[]>([]);
  // loadingInvoices menyimpan nilai loading invoices yang berubah saat user berinteraksi dengan halaman customer untuk melihat, mencari, mengedit, dan menghapus data pelanggan.
  const [loadingInvoices, setLoadingInvoices] = useState(false);

  // handleViewDetail menangani aksi user di halaman customer untuk melihat, mencari, mengedit, dan menghapus data pelanggan, seperti klik tombol, submit form, atau perubahan input.
  const handleViewDetail = async (client: (Client & { stats?: { totalInvoices: number, unpaidAmount: number } })) => {
    setSelectedClient(client);
    setIsDetailModalOpen(true);
    setLoadingInvoices(true);
    // await menunggu proses async selesai sebelum kode ini melanjutkan langkah berikutnya.
    const invoices = await getInvoicesByClient(client.id);
    setClientInvoices(invoices);
    setLoadingInvoices(false);
  };

  // isFilterDropdownOpen menyimpan nilai is filter dropdown open yang berubah saat user berinteraksi dengan halaman customer untuk melihat, mencari, mengedit, dan menghapus data pelanggan.
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  // filterCity menyimpan nilai filter city yang berubah saat user berinteraksi dengan halaman customer untuk melihat, mencari, mengedit, dan menghapus data pelanggan.
  const [filterCity, setFilterCity] = useState("all");
  // filterStatus menyimpan nilai filter status yang berubah saat user berinteraksi dengan halaman customer untuk melihat, mencari, mengedit, dan menghapus data pelanggan.
  const [filterStatus, setFilterStatus] = useState("all");

  // resetFilters mengembalikan filter invoice ke kondisi awal: semua status, tanpa pencarian, dan halaman pertama.
  const resetFilters = () => {
    setFilterCity("all");
    setFilterStatus("all");
    setIsFilterDropdownOpen(false);
  };

  const uniqueCities = Array.from(
    // map ini membuat opsi/baris customer dari data clients yang sudah diambil dari Supabase.
    new Set(clients.map(c => c.city).filter((city): city is string => Boolean(city)))
  ).sort();

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    npwp: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    province: "",
    postal_code: "",
    notes: ""
  });

  // loadData mengambil data yang dibutuhkan halaman customer untuk melihat, mencari, mengedit, dan menghapus data pelanggan dari Supabase lalu mengisi state halaman.
  const loadData = async () => {
    setLoading(true);
    // await menunggu proses async selesai sebelum kode ini melanjutkan langkah berikutnya.
    const data = await getClients();
    
    // Fetch stats for each client (not the most efficient but works for now)
    const clientsWithStats = await Promise.all(data.map(async (client) => {
      // await menunggu proses async selesai sebelum kode ini melanjutkan langkah berikutnya.
      const stats = await getClientInvoiceStats(client.id);
      // loadData mengirim hasil akhir yang dibutuhkan oleh bagian kode yang memanggilnya.
      return { ...client, stats };
    }));

    setClients(clientsWithStats);
    setLoading(false);
  };

  // Effect ini mengambil data yang diperlukan halaman customer untuk melihat, mencari, mengedit, dan menghapus data pelanggan saat halaman dibuka atau filter berubah.
  useEffect(() => {
    loadData();
  }, []);

  // resetForm mengosongkan form customer dan mengembalikan modal ke mode tambah data.
  const resetForm = () => {
    setFormData({
      name: "",
      npwp: "",
      phone: "",
      email: "",
      address: "",
      city: "",
      province: "",
      postal_code: "",
      notes: ""
    });
    setIsEdit(false);
    setCurrentClientId(null);
  };

  // handleEdit adalah fungsi penangan aksi user; fungsi ini berjalan saat user mengklik, mengetik, memilih, atau submit sesuatu.
  const handleEdit = (client: Client) => {
    setFormData({
      name: client.name,
      npwp: client.npwp || "",
      phone: client.phone || "",
      email: client.email || "",
      address: client.address || "",
      city: client.city || "",
      province: client.province || "",
      postal_code: client.postal_code || "",
      notes: client.notes || ""
    });
    setIsEdit(true);
    setCurrentClientId(client.id);
    setIsModalOpen(true);
  };

  // handleDeleteClick adalah fungsi penangan aksi user; fungsi ini berjalan saat user mengklik, mengetik, memilih, atau submit sesuatu.
  const handleDeleteClick = (id: string) => {
    setClientToDelete(id);
    setIsDeleteModalOpen(true);
  };

  // confirmDelete menjalankan hapus data setelah user menyetujui modal konfirmasi.
  const confirmDelete = async () => {
    // Kondisi if (!clientToDelete) return; membuat isi blok if di bawahnya hanya berjalan saat kondisi itu benar di halaman customer.
    if (!clientToDelete) return;

    setLoading(true);
    // await menunggu proses async selesai sebelum kode ini melanjutkan langkah berikutnya.
    const { error } = await deleteClient(clientToDelete);
    setLoading(false);

    // Kalau Supabase mengembalikan error atau data kosong, halaman customer menampilkan pesan gagal atau mengembalikan data kosong agar UI tidak rusak.
    if (error) {
      toast.error("Gagal menghapus customer: " + error.message);
    } else {
      toast.success("Customer berhasil dihapus");
      setIsDeleteModalOpen(false);
      setClientToDelete(null);
      loadData();
    }
  };

  // handleSubmit menangani aksi user di halaman customer untuk melihat, mencari, mengedit, dan menghapus data pelanggan, seperti klik tombol, submit form, atau perubahan input.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // try ini membaca, menyimpan, mengedit, menghapus, atau export data customer dari Supabase.
    try {
      // Kalau mode edit aktif dan ada id customer, form memperbarui customer lama; selain itu form membuat customer baru.
      if (isEdit && currentClientId) {
        // await menunggu proses async selesai sebelum kode ini melanjutkan langkah berikutnya.
        const { error } = await updateClient(currentClientId, formData);
        // Kalau Supabase mengembalikan error atau data kosong, halaman customer menampilkan pesan gagal atau mengembalikan data kosong agar UI tidak rusak.
        if (error) throw error;
        toast.success("Customer berhasil diperbarui");
      } else {
        // await menunggu proses async selesai sebelum kode ini melanjutkan langkah berikutnya.
        const { error } = await insertClient(formData);
        // Kalau Supabase mengembalikan error atau data kosong, halaman customer menampilkan pesan gagal atau mengembalikan data kosong agar UI tidak rusak.
        if (error) throw error;
        toast.success("Customer baru berhasil ditambahkan");
      }
      setIsModalOpen(false);
      resetForm();
      loadData();
    } catch (error: any) {
      toast.error("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // getFilteredClients mengambil atau menghitung data yang dibutuhkan halaman customer untuk melihat, mencari, mengedit, dan menghapus data pelanggan.
  const getFilteredClients = () => {
    // getFilteredClients mengembalikan hasil untuk halaman customer, sesuai data yang dihitung tepat sebelum baris return ini.
    return clients.filter(row => {
      const matchesSearch = row.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            (row.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (row.phone || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCity = filterCity === "all" ? true : row.city === filterCity;
      const matchesStatus = filterStatus === "all" ? true : (filterStatus === "active" ? row.is_active : !row.is_active);
      
      // matchesStatus mengembalikan hasil untuk halaman customer, sesuai data yang dihitung tepat sebelum baris return ini.
      return matchesSearch && matchesCity && matchesStatus;
    });
  };

  // Reset page to 1 when filters or search terms change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterCity, filterStatus]);

  const filteredClients = getFilteredClients();
  const totalItems = filteredClients.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  // Bagian startIndex menyimpan logika yang dipakai di bawahnya.
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedClients = filteredClients.slice(startIndex, endIndex);

  // getPageNumbers mengambil atau menghitung data yang dibutuhkan halaman customer untuk melihat, mencari, mengedit, dan menghapus data pelanggan.
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    // Kondisi if (totalPages <= maxVisible) membuat isi blok if di bawahnya hanya berjalan saat kondisi itu benar di halaman customer.
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);
      
      // Kondisi if (currentPage <= 3) membuat isi blok if di bawahnya hanya berjalan saat kondisi itu benar di halaman customer.
      if (currentPage <= 3) {
        end = 4;
      } else if (currentPage >= totalPages - 2) {
        start = totalPages - 3;
      }
      
      // Kondisi if (start > 2) membuat isi blok if di bawahnya hanya berjalan saat kondisi itu benar di halaman customer.
      if (start > 2) {
        pages.push("ellipsis-start");
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      // Kondisi if (end < totalPages - 1) membuat isi blok if di bawahnya hanya berjalan saat kondisi itu benar di halaman customer.
      if (end < totalPages - 1) {
        pages.push("ellipsis-end");
      }
      
      pages.push(totalPages);
    }
    
    // maxVisible mengembalikan hasil untuk halaman customer, sesuai data yang dihitung tepat sebelum baris return ini.
    return pages;
  };

  const exportColumns = [
    { header: 'Nama Customer', key: 'name', width: 24 },
    { header: 'NPWP', key: 'npwp', width: 20 },
    { header: 'Telepon', key: 'phone', width: 16 },
    { header: 'Email', key: 'email', width: 22 },
    { header: 'Alamat', key: 'address', width: 30 },
    { header: 'Kota', key: 'city', width: 16 },
    { header: 'Total Invoice', key: 'stats.totalInvoices', width: 14 },
    { header: 'Piutang Berjalan (Rp)', key: 'stats.unpaidAmount', isCurrency: true, width: 22 }
  ];

  // handleExportExcel menangani aksi user di halaman customer untuk melihat, mencari, mengedit, dan menghapus data pelanggan, seperti klik tombol, submit form, atau perubahan input.
  const handleExportExcel = async () => {
    // try ini membaca, menyimpan, mengedit, menghapus, atau export data customer dari Supabase.
    try {
      exportToExcel(getFilteredClients(), exportColumns, `Customer_${new Date().toISOString().slice(0,10)}`);
      toast("Ekspor Excel Selesai", {
        description: "Data customer berhasil diekspor ke format Excel.",
        icon: <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center bg-[#5C67F2]/10 text-[#5C67F2]"><ArrowDownIcon className="w-5 h-5" /></div>,
      });
      
      const user = useAuthStore.getState().user;
      // Kalau data user tersedia, lanjutkan proses yang membutuhkan akun login.
      if (user) {
        // await menunggu proses async selesai sebelum kode ini melanjutkan langkah berikutnya.
        await createAuditLog(user.id, 'create', 'Export', null, null, { description: 'Daftar Customer (Excel) berhasil diunduh' });
        window.dispatchEvent(new CustomEvent('refreshNotifications'));
      }
    } catch (error) {
      toast("Gagal Ekspor Excel", {
        description: "Terjadi kesalahan saat mengekspor data ke Excel.",
        icon: <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center bg-[#FA5A7D]/10 text-[#FA5A7D]"><HelpIcon className="w-5 h-5" /></div>,
      });
    }
  };

  // handleExportPDF menangani aksi user di halaman customer untuk melihat, mencari, mengedit, dan menghapus data pelanggan, seperti klik tombol, submit form, atau perubahan input.
  const handleExportPDF = async () => {
    toast.info("Sedang menyiapkan PDF...");
    // try ini membaca, menyimpan, mengedit, menghapus, atau export data customer dari Supabase.
    try {
      exportToPDF(getFilteredClients(), exportColumns, 'Daftar Customer', `Daftar_Customer_${new Date().toISOString().slice(0,10)}`);
      toast("Ekspor PDF Selesai", {
        description: "Daftar customer berhasil diunduh dalam format PDF.",
        icon: <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center bg-[#5C67F2]/10 text-[#5C67F2]"><ArrowDownIcon className="w-5 h-5" /></div>,
      });

      const user = useAuthStore.getState().user;
      // Kalau data user tersedia, lanjutkan proses yang membutuhkan akun login.
      if (user) {
        // await menunggu proses async selesai sebelum kode ini melanjutkan langkah berikutnya.
        await createAuditLog(user.id, 'create', 'Export', null, null, { description: 'Daftar Customer (PDF) berhasil diunduh' });
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

  // Kalau role user adalah viewer, semua hook di atas tetap sudah dipanggil dulu, lalu halaman menampilkan pesan akses ditolak.
  if (role === 'viewer') {
    // CustomerPage menampilkan UI akses ditolak untuk viewer, karena role ini hanya boleh melihat area dashboard tertentu.
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center bg-white rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-text-primary mb-2">Akses Ditolak</h2>
        <p className="text-sm text-text-secondary">Anda tidak memiliki hak akses untuk membuka halaman Customer.</p>
      </div>
    );
  }

  // CustomerPage menampilkan UI utama daftar customer setelah role dinyatakan boleh membuka halaman ini.
  return (
    <>
      <div className="bg-surface border border-border rounded-2xl shadow-sm flex flex-col h-full min-h-[500px]">
        {/* Header & Actions */}
        <div className="p-6 border-b border-border">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-[#151D48]">Manajemen Customer</h1>
              <p className="text-sm text-gray-500 mt-1">Kelola data customer dan riwayat penagihan</p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button variant="outline" className="flex items-center gap-2" onClick={handleExportExcel}>
                <DocumentDownloadIcon className="w-4 h-4" /> <span className="hidden sm:inline">Excel</span>
              </Button>
              <Button variant="outline" className="flex items-center gap-2" onClick={handleExportPDF}>
                <DocumentDownloadIcon className="w-4 h-4" /> <span className="hidden sm:inline">PDF</span>
              </Button>
              <Button 
                onClick={() => { resetForm(); setIsModalOpen(true); }}
                className="w-full sm:w-auto flex items-center gap-2 bg-[#5C67F2] hover:bg-[#4a55c2] text-white"
              >
                <PlusIcon className="w-4 h-4" /> Tambah Customer
              </Button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 max-w-md">
              <Input 
                placeholder="Cari nama customer, email, atau telepon..." 
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
                  (filterCity !== 'all' || filterStatus !== 'all') 
                    ? 'bg-[#5C67F2] text-white border-[#5C67F2] shadow-[0_8px_20px_rgba(92,103,242,0.2)]' 
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                <Filter1Icon className="w-4 h-4" /> 
                Filter
                {(filterCity !== 'all' || filterStatus !== 'all') && (
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                )}
              </Button>

              {isFilterDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsFilterDropdownOpen(false)}></div>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 z-50 mt-2">
                    <div className="w-[calc(100vw-2rem)] sm:w-[500px] bg-white border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-2xl p-6 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="mb-5">
                        <h3 className="font-bold text-[#151D48]">Filter Customer</h3>
                      </div>

                      <div className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Kota</label>
                            <CustomSelect 
                              options={[
                                { value: "all", label: "Semua Kota" },
                                // map ini membuat satu output untuk setiap item daftar yang sedang dirender oleh halaman customer.
                                ...uniqueCities.map(city => ({ value: city, label: city }))
                              ]}
                              value={filterCity}
                              onChange={setFilterCity}
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status Customer</label>
                            <CustomSelect 
                              options={[
                                { value: "all", label: "Semua Status" },
                                { value: "active", label: "Aktif" },
                                { value: "inactive", label: "Nonaktif" },
                              ]}
                              value={filterStatus}
                              onChange={setFilterStatus}
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
                <TableHead>Nama Customer / Perusahaan</TableHead>
                <TableHead>Kontak</TableHead>
                <TableHead className="text-center">Total Invoice</TableHead>
                <TableHead className="text-right">Piutang Berjalan</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-gray-500">
                    Memuat data customer...
                  </TableCell>
                </TableRow>
              ) : filteredClients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-gray-500">
                    Tidak ada data customer yang ditemukan.
                  </TableCell>
                </TableRow>
              ) : (
                // filter ini menyisakan data halaman customer yang cocok dengan pencarian, status, role, atau tanggal aktif.
                paginatedClients.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      <div className="font-semibold text-[#151D48]">{row.name}</div>
                      <div className="text-xs text-gray-500 mt-0.5 truncate max-w-[200px]">{row.address}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 text-xs text-gray-500">
                        <span className="flex items-center gap-1.5"><CallIcon className="w-3 h-3" /> {row.phone || '-'}</span>
                        <span className="flex items-center gap-1.5"><EmailIcon className="w-3 h-3" /> {row.email || '-'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center font-medium text-[#151D48]">
                      {row.stats?.totalInvoices || 0}
                    </TableCell>
                    <TableCell className="text-right">
                      {(row.stats?.unpaidAmount || 0) > 0 ? (
                        <span className="font-bold text-[#FA5A7D] tabular-nums">
                          {formatCurrency(row.stats?.unpaidAmount || 0)}
                        </span>
                      ) : (
                        <span className="text-gray-400 tabular-nums">Rp 0</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleViewDetail(row)}
                          className="p-1.5 text-gray-400 hover:text-[#5C67F2] hover:bg-[#5C67F2]/10 rounded-md transition-colors" 
                          title="Lihat Profil & Riwayat"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleEdit(row)}
                          className="p-1.5 text-gray-400 hover:text-[#5C67F2] hover:bg-[#5C67F2]/10 rounded-md transition-colors" 
                          title="Edit"
                        >
                          <EditIcon className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(row.id)}
                          className="p-1.5 text-gray-400 hover:text-[#FA5A7D] hover:bg-[#FA5A7D]/10 rounded-md transition-colors" 
                          title="Hapus"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
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
            
            {/* map ini membuat satu output untuk setiap item daftar yang sedang dirender oleh halaman customer. */}
            {getPageNumbers().map((p, idx) => {
              // Kondisi if (p === "ellipsis-start" || p === "ellipsis-end") membuat isi blok if di bawahnya hanya berjalan saat kondisi itu benar di halaman customer.
              if (p === "ellipsis-start" || p === "ellipsis-end") {
                // handleExportPDF menampilkan UI untuk halaman customer untuk melihat, mencari, mengedit, dan menghapus data pelanggan.
                return (
                  <span key={`ellipsis-${idx}`} className="px-1 text-gray-400">
                    ...
                  </span>
                );
              }
              // handleExportPDF menampilkan UI untuk halaman customer untuk melihat, mencari, mengedit, dan menghapus data pelanggan.
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

      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); resetForm(); }}>
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div>
              <h2 className="text-xl font-bold text-[#151D48]">{isEdit ? "Edit Customer" : "Tambah Customer Baru"}</h2>
              <p className="text-sm text-gray-500 mt-1">Masukkan informasi detail customer untuk keperluan invoice.</p>
            </div>
            <button 
              onClick={() => { setIsModalOpen(false); resetForm(); }}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <CloseIcon className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <div className="p-6 overflow-y-auto">
            <form id="client-form" className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-[#151D48] mb-1.5">Nama Customer / Perusahaan <span className="text-red-500">*</span></label>
                  <Input 
                    type="text" 
                    required 
                    placeholder="Contoh: PT Bangun Persada" 
                    className="bg-[#F9FAFB] border-gray-200" 
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-[#151D48] mb-1.5">NPWP <span className="text-gray-400 font-normal">(Opsional)</span></label>
                  <Input 
                    type="text" 
                    placeholder="Format: 00.000.000.0-000.000" 
                    className="bg-[#F9FAFB] border-gray-200" 
                    value={formData.npwp}
                    onChange={(e) => setFormData({ ...formData, npwp: e.target.value })}
                  />
                </div>
                <div className="md:col-span-2 border-t border-gray-100 pt-6">
                  <h3 className="font-semibold text-[#151D48] mb-4">Informasi Kontak</h3>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#151D48] mb-1.5">Nomor Telepon <span className="text-red-500">*</span></label>
                  <Input 
                    type="text" 
                    required 
                    placeholder="0812-xxxx-xxxx" 
                    className="bg-[#F9FAFB] border-gray-200" 
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#151D48] mb-1.5">Email Customer <span className="text-red-500">*</span></label>
                  <Input 
                    type="email" 
                    required 
                    placeholder="email@perusahaan.com" 
                    className="bg-[#F9FAFB] border-gray-200" 
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="md:col-span-2 border-t border-gray-100 pt-6">
                  <h3 className="font-semibold text-[#151D48] mb-4">Informasi Alamat</h3>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-[#151D48] mb-1.5">Alamat Lengkap <span className="text-red-500">*</span></label>
                  <textarea 
                    required 
                    rows={3} 
                    className="w-full bg-[#F9FAFB] border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#5C67F2]/20 transition-all resize-none" 
                    placeholder="Nama jalan, gedung, blok..." 
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#151D48] mb-1.5">Kota / Kabupaten</label>
                  <Input 
                    type="text" 
                    placeholder="Kota" 
                    className="bg-[#F9FAFB] border-gray-200" 
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#151D48] mb-1.5">Provinsi</label>
                  <Input 
                    type="text" 
                    placeholder="Provinsi" 
                    className="bg-[#F9FAFB] border-gray-200" 
                    value={formData.province}
                    onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-[#151D48] mb-1.5">Kode Pos</label>
                  <Input 
                    type="text" 
                    placeholder="Kode Pos" 
                    className="bg-[#F9FAFB] border-gray-200" 
                    value={formData.postal_code}
                    onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                  />
                </div>
                <div className="md:col-span-2 border-t border-gray-100 pt-6">
                  <label className="block text-sm font-medium text-[#151D48] mb-1.5">Catatan Tambahan <span className="text-gray-400 font-normal">(Opsional)</span></label>
                  <textarea 
                    rows={2} 
                    className="w-full bg-[#F9FAFB] border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#5C67F2]/20 transition-all resize-none" 
                    placeholder="Informasi kontak darurat atau catatan lainnya..." 
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>
              </div>
            </form>
          </div>
          <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 shrink-0">
            <Button variant="outline" onClick={() => { setIsModalOpen(false); resetForm(); }}>Batal</Button>
            <Button type="submit" form="client-form" disabled={loading} className="bg-[#5C67F2] hover:bg-[#4a55c2] text-white">
              {loading ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Simpan Customer"}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Hapus Customer"
        description="Apakah Anda yakin ingin menghapus customer ini? Tindakan ini tidak dapat dibatalkan."
        confirmText="Hapus"
        isDanger={true}
        isLoading={loading}
      />

      {/* Detail Customer Modal */}
      <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)}>
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div>
              <h2 className="text-xl font-bold text-[#151D48]">Profil Customer</h2>
              <p className="text-sm text-gray-500 mt-1">Detail informasi dan riwayat invoice.</p>
            </div>
            <button 
              onClick={() => setIsDetailModalOpen(false)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <CloseIcon className="w-5 h-5" />
            </button>
          </div>
          <div className="p-6 overflow-y-auto space-y-6">
            {selectedClient && (
              <>
                <div className="bg-[#F9FAFB] rounded-xl p-5 border border-gray-100 flex flex-col gap-4">
                  <div>
                    <h3 className="font-bold text-lg text-[#151D48]">{selectedClient.name}</h3>
                    <p className="text-sm text-gray-500">{selectedClient.npwp ? `NPWP: ${selectedClient.npwp}` : 'Tidak ada NPWP'}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500 block mb-1">Kontak</span>
                      <div className="flex items-center gap-1.5 text-[#151D48] mb-1"><CallIcon className="w-3.5 h-3.5" /> {selectedClient.phone || '-'}</div>
                      <div className="flex items-center gap-1.5 text-[#151D48]"><EmailIcon className="w-3.5 h-3.5" /> {selectedClient.email || '-'}</div>
                    </div>
                    <div>
                      <span className="text-gray-500 block mb-1">Alamat</span>
                      <p className="text-[#151D48] leading-tight">
                        {selectedClient.address}<br/>
                        {/* filter(Boolean) membuang nilai kosong, misalnya nomor telepon/email yang tidak ada, sebelum teks digabung. */}
                        {[selectedClient.city, selectedClient.province, selectedClient.postal_code].filter(Boolean).join(', ')}
                      </p>
                    </div>
                  </div>
                  {selectedClient.notes && (
                    <div className="pt-3 border-t border-gray-200">
                      <span className="text-gray-500 text-xs block mb-1">Catatan</span>
                      <p className="text-sm text-[#151D48] italic">{selectedClient.notes}</p>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="font-bold text-[#151D48] mb-4">Riwayat Invoice</h3>
                  <div className="border border-gray-100 rounded-xl overflow-hidden">
                    <Table>
                      <TableHeader className="bg-gray-50">
                        <TableRow>
                          <TableHead>Invoice</TableHead>
                          <TableHead>Tanggal</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loadingInvoices ? (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center py-6 text-gray-500">Memuat riwayat...</TableCell>
                          </TableRow>
                        ) : clientInvoices.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center py-6 text-gray-500">Belum ada invoice untuk customer ini.</TableCell>
                          </TableRow>
                        ) : (
                          // map ini membuat satu output untuk setiap item daftar yang sedang dirender oleh halaman customer.
                          clientInvoices.map((inv) => (
                            <TableRow key={inv.id}>
                              <TableCell className="font-medium text-[#5C67F2]">{inv.invoice_number}</TableCell>
                              <TableCell>{new Date(inv.invoice_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</TableCell>
                              <TableCell className="text-right font-medium text-[#151D48]">{formatCurrency(inv.grand_total || 0)}</TableCell>
                              <TableCell>
                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                  inv.status?.toLowerCase() === 'paid' || inv.status?.toLowerCase() === 'lunas' ? 'bg-[#3CD856]/10 text-[#3CD856]' : 
                                  inv.status?.toLowerCase() === 'overdue' ? 'bg-[#FA5A7D]/10 text-[#FA5A7D]' : 
                                  'bg-[#FF947A]/10 text-[#FF947A]'
                                }`}>
                                  {inv.status?.toLowerCase() === 'paid' || inv.status?.toLowerCase() === 'lunas' ? 'Lunas' : 
                                   inv.status?.toLowerCase() === 'overdue' ? 'Jatuh Tempo' : 'Pending'}
                                </span>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </>
            )}
          </div>
          <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end shrink-0">
            <Button onClick={() => setIsDetailModalOpen(false)} className="bg-[#5C67F2] hover:bg-[#4a55c2] text-white">
              Tutup
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
