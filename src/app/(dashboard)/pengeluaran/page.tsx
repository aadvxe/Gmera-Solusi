"use client";

// Import React hook yang dipakai halaman daftar pengeluaran untuk filter, edit, hapus, dan export biaya, misalnya untuk state, efek setelah render, atau referensi elemen.
import React, { useState, useEffect } from "react";
// Import Link supaya menu/tombol di halaman daftar pengeluaran untuk filter, edit, hapus, dan export biaya bisa berpindah halaman tanpa reload penuh.
import Link from "next/link";
// Import ikon yang dipakai halaman daftar pengeluaran untuk filter, edit, hapus, dan export biaya untuk memperjelas tombol, menu, status, dan aksi di layar.
import { Filter1Icon, PlusIcon, DocumentDownloadIcon, EyeIcon, EditIcon, TrashIcon, HelpIcon, ArrowDownIcon, CloseIcon } from "@astraicons/react/bold";
// Import ikon yang dipakai halaman daftar pengeluaran untuk filter, edit, hapus, dan export biaya untuk memperjelas tombol, menu, status, dan aksi di layar.
import { SearchIcon } from "@astraicons/react/linear";
// Import komponen UI reusable supaya halaman daftar pengeluaran untuk filter, edit, hapus, dan export biaya memakai tampilan tombol, modal, input, atau tabel yang konsisten.
import { ConfirmModal } from "@/components/ui/ConfirmModal";
// Import komponen UI reusable supaya halaman daftar pengeluaran untuk filter, edit, hapus, dan export biaya memakai tampilan tombol, modal, input, atau tabel yang konsisten.
import { Modal } from "@/components/ui/Modal";
// Import komponen UI reusable supaya halaman daftar pengeluaran untuk filter, edit, hapus, dan export biaya memakai tampilan tombol, modal, input, atau tabel yang konsisten.
import { Button } from "@/components/ui/Button";
// Import komponen UI reusable supaya halaman daftar pengeluaran untuk filter, edit, hapus, dan export biaya memakai tampilan tombol, modal, input, atau tabel yang konsisten.
import { Input } from "@/components/ui/Input";
// Import komponen UI reusable supaya halaman daftar pengeluaran untuk filter, edit, hapus, dan export biaya memakai tampilan tombol, modal, input, atau tabel yang konsisten.
import { CustomDatePicker } from "@/components/ui/CustomDatePicker";
// Import komponen UI reusable supaya halaman daftar pengeluaran untuk filter, edit, hapus, dan export biaya memakai tampilan tombol, modal, input, atau tabel yang konsisten.
import { CustomSelect } from "@/components/ui/CustomSelect";
// Import SkeletonTableRow untuk loading state table yang premium.
import { SkeletonTableRow } from "@/components/ui/Skeleton";
// Import berikutnya mengambil komponen/helper yang langsung dipakai oleh halaman daftar pengeluaran.
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/Table";
// Import helper database yang dipakai halaman daftar pengeluaran untuk filter, edit, hapus, dan export biaya untuk mengambil atau menyimpan data Supabase.
import { getExpense, deleteExpense, updateExpense, getCategories, Expense, Category } from "@/lib/db";
// Import helper database yang dipakai halaman daftar pengeluaran untuk filter, edit, hapus, dan export biaya untuk mengambil atau menyimpan data Supabase.
import { createAuditLog } from "@/lib/db/users";
// Import authStore supaya halaman daftar pengeluaran untuk filter, edit, hapus, dan export biaya bisa membaca user login, role, nama tampilan, atau mengosongkan session saat logout.
import { useAuthStore } from "@/store/authStore";
// Import Sonner untuk menampilkan toast sukses/error di halaman daftar pengeluaran untuk filter, edit, hapus, dan export biaya.
import { toast } from "sonner";
// Import utility project supaya halaman daftar pengeluaran untuk filter, edit, hapus, dan export biaya bisa memformat class Tailwind atau angka Rupiah dengan cara yang sama.
import { formatRupiah, parseRupiah, formatCurrency } from "@/lib/utils";
// Import uploadFile supaya halaman daftar pengeluaran untuk filter, edit, hapus, dan export biaya bisa mengirim lampiran ke Supabase Storage.
import { uploadFile } from "@/lib/storage";
// Import helper export supaya daftar pengeluaran bisa diunduh sebagai PDF/Excel sesuai filter tanggal, kategori, dan pencarian aktif.
import { exportToExcel, exportToPDF } from "@/lib/export";
// Import ikon yang dipakai halaman daftar pengeluaran untuk filter, edit, hapus, dan export biaya untuk memperjelas tombol, menu, status, dan aksi di layar.
import { ChevronLeft, ChevronRight } from "lucide-react";

// PengeluaranPage menampilkan data expense, menghitung ringkasan, menjalankan filter, dan membuka modal edit/hapus.
export default function PengeluaranPage() {
  // searchTerm menyimpan nilai search term yang berubah saat user berinteraksi dengan halaman daftar pengeluaran untuk filter, edit, hapus, dan export biaya.
  const [searchTerm, setSearchTerm] = useState("");
  const [expenses, setExpenses] = useState<Expense[]>([]);
  // loading menyimpan nilai loading yang berubah saat user berinteraksi dengan halaman daftar pengeluaran untuk filter, edit, hapus, dan export biaya.
  const [loading, setLoading] = useState(true);
  const user = useAuthStore(state => state.user);
  const role = useAuthStore(state => state.role);

  const [categories, setCategories] = useState<Category[]>([]);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  // itemsPerPage menyimpan nilai items per page yang berubah saat user berinteraksi dengan halaman daftar pengeluaran untuk filter, edit, hapus, dan export biaya.
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // loadData mengambil data yang dibutuhkan halaman daftar pengeluaran untuk filter, edit, hapus, dan export biaya dari Supabase lalu mengisi state halaman.
  const loadData = async () => {
    setLoading(true);
    // await Promise.all menunggu beberapa query berjalan paralel sampai semuanya selesai.
    const [data, catsData] = await Promise.all([
      getExpense(),
      getCategories('expense')
    ]);
    setExpenses(data);
    setCategories(catsData);
    setLoading(false);
  };

  // Effect ini mengambil data yang diperlukan halaman daftar pengeluaran untuk filter, edit, hapus, dan export biaya saat halaman dibuka atau filter berubah.
  useEffect(() => {
    loadData();
  }, []);

  // isDeleteModalOpen menyimpan nilai is delete modal open yang berubah saat user berinteraksi dengan halaman daftar pengeluaran untuk filter, edit, hapus, dan export biaya.
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  // handleDeleteClick adalah fungsi penangan aksi user; fungsi ini berjalan saat user mengklik, mengetik, memilih, atau submit sesuatu.
  const handleDeleteClick = (id: string) => {
    setItemToDelete(id);
    setIsDeleteModalOpen(true);
  };

  // confirmDelete menjalankan hapus data setelah user menyetujui modal konfirmasi.
  const confirmDelete = async () => {
    // Kondisi if (!itemToDelete) return; membuat isi blok if di bawahnya hanya berjalan saat kondisi itu benar di halaman daftar pengeluaran.
    if (!itemToDelete) return;
    
    // await menunggu proses async selesai sebelum kode ini melanjutkan langkah berikutnya.
    const { error } = await deleteExpense(itemToDelete);
    // Kalau Supabase mengembalikan error atau data kosong, halaman daftar pengeluaran menampilkan pesan gagal atau mengembalikan data kosong agar UI tidak rusak.
    if (error) {
      alert("Gagal menghapus data: " + error.message);
    } else {
      loadData();
    }
    
    setIsDeleteModalOpen(false);
    setItemToDelete(null);
  };

  // isDetailModalOpen menyimpan nilai is detail modal open yang berubah saat user berinteraksi dengan halaman daftar pengeluaran untuk filter, edit, hapus, dan export biaya.
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  // isEditModalOpen menyimpan nilai is edit modal open yang berubah saat user berinteraksi dengan halaman daftar pengeluaran untuk filter, edit, hapus, dan export biaya.
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  // editFormData menyimpan nilai edit form data yang berubah saat user berinteraksi dengan halaman daftar pengeluaran untuk filter, edit, hapus, dan export biaya.
  const [editFormData, setEditFormData] = useState({
    date: "",
    expense_type: "",
    amount: 0,
    category_id: "",
    status: "",
    reference_number: "",
    attachment_url: "" as string | null
  });
  const [editAttachment, setEditAttachment] = useState<File | null>(null);

  // isFilterDropdownOpen menyimpan nilai is filter dropdown open yang berubah saat user berinteraksi dengan halaman daftar pengeluaran untuk filter, edit, hapus, dan export biaya.
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  // filterFrom menyimpan nilai filter from yang berubah saat user berinteraksi dengan halaman daftar pengeluaran untuk filter, edit, hapus, dan export biaya.
  const [filterFrom, setFilterFrom] = useState("");
  // filterTo menyimpan nilai filter to yang berubah saat user berinteraksi dengan halaman daftar pengeluaran untuk filter, edit, hapus, dan export biaya.
  const [filterTo, setFilterTo] = useState("");
  // filterCategoryId menyimpan nilai filter category id yang berubah saat user berinteraksi dengan halaman daftar pengeluaran untuk filter, edit, hapus, dan export biaya.
  const [filterCategoryId, setFilterCategoryId] = useState("all");

  // resetFilters mengembalikan filter invoice ke kondisi awal: semua status, tanpa pencarian, dan halaman pertama.
  const resetFilters = () => {
    setFilterFrom("");
    setFilterTo("");
    setFilterCategoryId("all");
    setIsFilterDropdownOpen(false);
  };

  // handleView adalah fungsi penangan aksi user; fungsi ini berjalan saat user mengklik, mengetik, memilih, atau submit sesuatu.
  const handleView = (expense: Expense) => {
    setSelectedExpense(expense);
    setIsDetailModalOpen(true);
  };

  // handleEdit adalah fungsi penangan aksi user; fungsi ini berjalan saat user mengklik, mengetik, memilih, atau submit sesuatu.
  const handleEdit = (expense: Expense) => {
    setSelectedExpense(expense);
    setEditFormData({
      date: new Date(expense.date).toISOString().split('T')[0],
      expense_type: expense.expense_type || "",
      amount: expense.amount || 0,
      category_id: expense.category_id || "",
      status: expense.status || "",
      reference_number: expense.reference_number || "",
      attachment_url: expense.attachment_url || null
    });
    setEditAttachment(null);
    setIsEditModalOpen(true);
  };

  // submitEdit menyimpan perubahan dari modal edit lalu memperbarui daftar data di halaman.
  const submitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Kondisi if (!selectedExpense) return; membuat isi blok if di bawahnya hanya berjalan saat kondisi itu benar di halaman daftar pengeluaran.
    if (!selectedExpense) return;
    
    setLoading(true);
    let newAttachmentUrl = editFormData.attachment_url;
      
    // Kondisi if (editAttachment) membuat isi blok if di bawahnya hanya berjalan saat kondisi itu benar di halaman daftar pengeluaran.
    if (editAttachment) {
      // await menunggu upload lampiran selesai agar invoice menyimpan URL file yang benar.
      const { url, error } = await uploadFile(editAttachment, 'uploads');
      // Kalau Supabase mengembalikan error atau data kosong, halaman daftar pengeluaran menampilkan pesan gagal atau mengembalikan data kosong agar UI tidak rusak.
      if (!error && url) {
        newAttachmentUrl = url;
      }
    }

    // await menunggu proses async selesai sebelum kode ini melanjutkan langkah berikutnya.
    const { error } = await updateExpense(selectedExpense.id, {
      date: editFormData.date,
      expense_type: editFormData.expense_type,
      amount: editFormData.amount,
      category_id: editFormData.category_id || null,
      status: editFormData.status,
      reference_number: editFormData.reference_number,
      attachment_url: newAttachmentUrl
    });
    setLoading(false);

    // Kalau Supabase mengembalikan error atau data kosong, halaman daftar pengeluaran menampilkan pesan gagal atau mengembalikan data kosong agar UI tidak rusak.
    if (error) {
      toast.error("Gagal memperbarui data: " + error.message);
    } else {
      toast.success("Pengeluaran berhasil diperbarui");
      setIsEditModalOpen(false);
      setSelectedExpense(null);
      loadData();
    }
  };

  // getFilteredExpenses mengambil atau menghitung data yang dibutuhkan halaman daftar pengeluaran untuk filter, edit, hapus, dan export biaya.
  const getFilteredExpenses = () => {
    // getFilteredExpenses mengembalikan hasil untuk halaman daftar pengeluaran, sesuai data yang dihitung tepat sebelum baris return ini.
    return expenses.filter(row => {
      // Bagian matchesSearch menyimpan logika yang dipakai di bawahnya.
      const matchesSearch = (row.expense_type || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
                            (row.reference_number || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDateFrom = filterFrom ? row.date >= filterFrom : true;
      const matchesDateTo = filterTo ? row.date <= filterTo : true;
      const matchesCategory = filterCategoryId === "all" ? true : row.category_id === filterCategoryId;
      
      // matchesCategory mengembalikan hasil untuk halaman daftar pengeluaran, sesuai data yang dihitung tepat sebelum baris return ini.
      return matchesSearch && matchesDateFrom && matchesDateTo && matchesCategory;
    });
  };

  // Reset page to 1 when filters or search terms change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterFrom, filterTo, filterCategoryId]);

  const filteredExpenses = getFilteredExpenses();
  const totalItems = filteredExpenses.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  // Bagian startIndex menyimpan logika yang dipakai di bawahnya.
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedExpenses = filteredExpenses.slice(startIndex, endIndex);

  // getPageNumbers mengambil atau menghitung data yang dibutuhkan halaman daftar pengeluaran untuk filter, edit, hapus, dan export biaya.
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    // Kondisi if (totalPages <= maxVisible) membuat isi blok if di bawahnya hanya berjalan saat kondisi itu benar di halaman daftar pengeluaran.
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);
      
      // Kondisi if (currentPage <= 3) membuat isi blok if di bawahnya hanya berjalan saat kondisi itu benar di halaman daftar pengeluaran.
      if (currentPage <= 3) {
        end = 4;
      } else if (currentPage >= totalPages - 2) {
        start = totalPages - 3;
      }
      
      // Kondisi if (start > 2) membuat isi blok if di bawahnya hanya berjalan saat kondisi itu benar di halaman daftar pengeluaran.
      if (start > 2) {
        pages.push("ellipsis-start");
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      // Kondisi if (end < totalPages - 1) membuat isi blok if di bawahnya hanya berjalan saat kondisi itu benar di halaman daftar pengeluaran.
      if (end < totalPages - 1) {
        pages.push("ellipsis-end");
      }
      
      pages.push(totalPages);
    }
    
    // maxVisible mengembalikan hasil untuk halaman daftar pengeluaran, sesuai data yang dihitung tepat sebelum baris return ini.
    return pages;
  };

  const exportColumns = [
    { header: 'Tanggal', key: 'date', isDate: true, width: 14 },
    { header: 'No. Referensi', key: 'reference_number', width: 16 },
    { header: 'Vendor / Penerima', key: 'expense_type', width: 24 },
    { header: 'Kategori', key: 'categories.name', width: 18 },
    { header: 'Jumlah (Rp)', key: 'amount', isCurrency: true, width: 22 },
    { header: 'Status', key: 'status', width: 12 }
  ];

  // handleExportExcel menangani aksi user di halaman daftar pengeluaran untuk filter, edit, hapus, dan export biaya, seperti klik tombol, submit form, atau perubahan input.
  const handleExportExcel = async () => {
    // try ini membaca, menyimpan, mengedit, menghapus, atau export data pengeluaran dari Supabase.
    try {
      exportToExcel(getFilteredExpenses(), exportColumns, `Pengeluaran_${new Date().toISOString().slice(0,10)}`);
      toast("Ekspor Excel Selesai", {
        description: "Data pengeluaran berhasil diekspor ke format Excel.",
        icon: <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center bg-[#5C67F2]/10 text-[#5C67F2]"><ArrowDownIcon className="w-5 h-5" /></div>,
      });
      
      // Kalau data user tersedia, lanjutkan proses yang membutuhkan akun login.
      if (user) {
        // await menunggu proses async selesai sebelum kode ini melanjutkan langkah berikutnya.
        await createAuditLog(user.id, 'create', 'Export', null, null, { description: 'Laporan Pengeluaran (Excel) berhasil diunduh' });
        window.dispatchEvent(new CustomEvent('refreshNotifications'));
      }
    } catch (error) {
      toast("Gagal Ekspor Excel", {
        description: "Terjadi kesalahan saat mengekspor data ke Excel.",
        icon: <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center bg-[#FA5A7D]/10 text-[#FA5A7D]"><HelpIcon className="w-5 h-5" /></div>,
      });
    }
  };

  // handleExportPDF menangani aksi user di halaman daftar pengeluaran untuk filter, edit, hapus, dan export biaya, seperti klik tombol, submit form, atau perubahan input.
  const handleExportPDF = async () => {
    toast.info("Sedang menyiapkan PDF...");
    // try ini membaca, menyimpan, mengedit, menghapus, atau export data pengeluaran dari Supabase.
    try {
      exportToPDF(getFilteredExpenses(), exportColumns, 'Laporan Pengeluaran', `Laporan_Pengeluaran_${new Date().toISOString().slice(0,10)}`);
      toast("Ekspor PDF Selesai", {
        description: "Laporan pengeluaran berhasil diunduh dalam format PDF.",
        icon: <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center bg-[#5C67F2]/10 text-[#5C67F2]"><ArrowDownIcon className="w-5 h-5" /></div>,
      });

      // Kalau data user tersedia, lanjutkan proses yang membutuhkan akun login.
      if (user) {
        // await menunggu proses async selesai sebelum kode ini melanjutkan langkah berikutnya.
        await createAuditLog(user.id, 'create', 'Export', null, null, { description: 'Laporan Pengeluaran (PDF) berhasil diunduh' });
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

  // handleExportPDF menampilkan UI untuk halaman daftar pengeluaran untuk filter, edit, hapus, dan export biaya.
  return (
    <>
      <div className="bg-surface border border-border rounded-2xl shadow-sm flex flex-col h-full min-h-[500px]">
        {/* Header & Actions */}
        <div className="p-6 border-b border-border">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-[#151D48]">Pengeluaran</h1>
              <p className="text-sm text-gray-500 mt-1">Kelola seluruh catatan pengeluaran operasional</p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button variant="outline" className="flex items-center gap-2" onClick={handleExportExcel}>
                <DocumentDownloadIcon className="w-4 h-4" /> <span className="hidden sm:inline">Excel</span>
              </Button>
              <Button variant="outline" className="flex items-center gap-2" onClick={handleExportPDF}>
                <DocumentDownloadIcon className="w-4 h-4" /> <span className="hidden sm:inline">PDF</span>
              </Button>
              {role !== 'viewer' && (
                <Link href="/pengeluaran/tambah" className="w-full sm:w-auto">
                  <Button 
                    className="w-full sm:w-auto flex items-center gap-2 bg-[#FA5A7D] hover:bg-[#e04868] text-white border-transparent"
                  >
                    <PlusIcon className="w-4 h-4" /> Tambah Data
                  </Button>
                </Link>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 max-w-md sm:min-w-72">
              <Input 
                placeholder="Cari vendor atau referensi..." 
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
                  (filterFrom || filterTo || filterCategoryId !== 'all') 
                    ? 'bg-[#5C67F2] text-white border-[#5C67F2] shadow-[0_8px_20px_rgba(92,103,242,0.2)]' 
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                <Filter1Icon className="w-4 h-4" /> 
                Filter
                {(filterFrom || filterTo || filterCategoryId !== 'all') && (
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                )}
              </Button>

              {isFilterDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsFilterDropdownOpen(false)}></div>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 z-50 mt-2">
                    <div className="w-[calc(100vw-2rem)] sm:w-[550px] bg-white border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-2xl p-6 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="mb-5">
                        <h3 className="font-bold text-[#151D48]">Filter Data</h3>
                      </div>

                      <div className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Dari Tanggal</label>
                            <CustomDatePicker value={filterFrom} onChange={setFilterFrom} className="w-full h-10" />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Sampai Tanggal</label>
                            <CustomDatePicker value={filterTo} onChange={setFilterTo} className="w-full h-10" />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Kategori</label>
                            <CustomSelect 
                              options={[
                                { value: "all", label: "Semua Kategori" },
                                // map ini membuat pilihan kategori income/expense dari daftar kategori aktif.
                                ...categories.map(c => ({ value: c.id, label: c.name }))
                              ]}
                              value={filterCategoryId}
                              onChange={setFilterCategoryId}
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
                <TableHead>Tanggal</TableHead>
                <TableHead>No. Ref</TableHead>
                <TableHead>Vendor / Tujuan</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead className="text-right">Jumlah</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <SkeletonTableRow key={idx} cols={7} widths={["w-24", "w-20", "w-40", "w-28", "ml-auto w-24", "w-20", "ml-auto w-12"]} />
                ))
              ) : filteredExpenses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-gray-500">
                    Tidak ada data pengeluaran yang ditemukan.
                  </TableCell>
                </TableRow>
              ) : (
                // filter ini menyisakan data halaman daftar pengeluaran yang cocok dengan pencarian, status, role, atau tanggal aktif.
                paginatedExpenses.map((row) => (
                  <TableRow key={row.id} className="animate-fade-in">
                    <TableCell className="font-medium text-[#151D48]">{new Date(row.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</TableCell>
                    <TableCell className="text-gray-600">{row.reference_number || '-'}</TableCell>
                    <TableCell className="text-gray-600">{row.expense_type}</TableCell>
                    <TableCell>
                      <span className="bg-gray-100 px-2.5 py-1 rounded-md text-xs font-medium text-gray-600 border border-gray-200">
                        {row.categories?.name || 'Lain-lain'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-bold text-[#FA5A7D] tabular-nums">
                      -{formatCurrency(row.amount)}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        row.status?.toLowerCase() === 'paid' || row.status?.toLowerCase() === 'lunas' ? 'bg-[#3CD856]/10 text-[#3CD856]' : 'bg-[#FF947A]/10 text-[#FF947A]'
                       }`}>
                        {row.status?.toLowerCase() === 'paid' || row.status?.toLowerCase() === 'lunas' ? 'Lunas' : row.status || 'Pending'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleView(row)}
                          className="p-1.5 text-gray-400 hover:text-[#5C67F2] hover:bg-[#5C67F2]/10 rounded-md transition-colors" 
                          title="Lihat"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        {role !== 'viewer' && (
                          <>
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
                          </>
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
            
            {/* filter ini menyisakan data halaman daftar pengeluaran yang cocok dengan pencarian, status, role, atau tanggal aktif. */}
            {getPageNumbers().map((p, idx) => {
              // Kondisi if (p === "ellipsis-start" || p === "ellipsis-end") membuat isi blok if di bawahnya hanya berjalan saat kondisi itu benar di halaman daftar pengeluaran.
              if (p === "ellipsis-start" || p === "ellipsis-end") {
                // handleExportPDF menampilkan UI untuk halaman daftar pengeluaran untuk filter, edit, hapus, dan export biaya.
                return (
                  <span key={`ellipsis-${idx}`} className="px-1 text-gray-400">
                    ...
                  </span>
                );
              }
              // handleExportPDF menampilkan UI untuk halaman daftar pengeluaran untuk filter, edit, hapus, dan export biaya.
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

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Hapus Pengeluaran"
        description="Apakah Anda yakin ingin menghapus data pengeluaran ini? Tindakan ini tidak dapat dibatalkan."
        confirmText="Hapus"
        isDanger={true}
      />

      {/* Detail Modal */}
      <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)}>
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-xl font-bold text-[#151D48]">Detail Pengeluaran</h2>
            <button onClick={() => setIsDetailModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
          </div>
          {selectedExpense && (
            <div className="p-6 space-y-4">
              <div className="flex justify-between border-b border-gray-100 pb-3">
                <span className="text-gray-500 text-sm">Tanggal</span>
                <span className="font-semibold text-[#151D48]">
                  {new Date(selectedExpense.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-3">
                <span className="text-gray-500 text-sm">No. Referensi</span>
                <span className="font-semibold text-[#151D48]">{selectedExpense.reference_number || '-'}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-3">
                <span className="text-gray-500 text-sm">Vendor / Penerima</span>
                <span className="font-semibold text-[#151D48]">{selectedExpense.expense_type}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-3">
                <span className="text-gray-500 text-sm">Kategori</span>
                <span className="font-semibold text-[#151D48]">{selectedExpense.categories?.name || 'Lain-lain'}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-3">
                <span className="text-gray-500 text-sm">Status</span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                  selectedExpense.status?.toLowerCase() === 'paid' || selectedExpense.status?.toLowerCase() === 'lunas' ? 'bg-[#3CD856]/10 text-[#3CD856]' : 'bg-[#FF947A]/10 text-[#FF947A]'
                }`}>
                  {selectedExpense.status?.toLowerCase() === 'paid' || selectedExpense.status?.toLowerCase() === 'lunas' ? 'Lunas' : selectedExpense.status || 'Pending'}
                </span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-gray-500 font-medium">Total Jumlah</span>
                <span className="text-xl font-bold text-[#FA5A7D]">{formatCurrency(selectedExpense.amount)}</span>
              </div>
              {selectedExpense.attachment_url && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <span className="block text-gray-500 text-sm mb-2">Lampiran Bukti</span>
                  <a href={selectedExpense.attachment_url} target="_blank" rel="noopener noreferrer" className="inline-flex flex-col items-center justify-center p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors w-full">
                    {selectedExpense.attachment_url.toLowerCase().match(/\.(jpeg|jpg|gif|png)$/) ? (
                      <img src={selectedExpense.attachment_url} alt="Lampiran" className="max-h-40 object-contain mb-2 rounded" />
                    ) : (
                      <div className="w-12 h-12 bg-[#5C67F2]/10 text-[#5C67F2] rounded-full flex items-center justify-center mb-2">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                      </div>
                    )}
                    <span className="text-sm font-medium text-[#5C67F2]">Lihat File Asli</span>
                  </a>
                </div>
              )}
            </div>
          )}
          <div className="p-6 bg-gray-50 flex justify-end">
            <Button onClick={() => setIsDetailModalOpen(false)} className="bg-[#5C67F2] hover:bg-[#4a55c2] text-white">Tutup</Button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-xl font-bold text-[#151D48]">Edit Pengeluaran</h2>
            <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
          </div>
          <form onSubmit={submitEdit} className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#151D48] mb-1.5">Tanggal</label>
                <CustomDatePicker 
                  value={editFormData.date} 
                  onChange={val => setEditFormData({...editFormData, date: val})} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#151D48] mb-1.5">No. Referensi</label>
                <Input type="text" value={editFormData.reference_number} onChange={e => setEditFormData({...editFormData, reference_number: e.target.value})} className="bg-[#F9FAFB]" />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#151D48] mb-1.5">Vendor / Penerima</label>
              <Input type="text" value={editFormData.expense_type} onChange={e => setEditFormData({...editFormData, expense_type: e.target.value})} required className="bg-[#F9FAFB]" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#151D48] mb-1.5">Jumlah</label>
                <Input 
                  icon={<span className="font-medium text-sm">Rp</span>}
                  type="text" 
                  value={formatRupiah(editFormData.amount)} 
                  onChange={e => setEditFormData({...editFormData, amount: parseRupiah(e.target.value)})} 
                  required 
                  className="bg-[#F9FAFB] text-right" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#151D48] mb-1.5">Status</label>
                <CustomSelect 
                  placeholder="Pilih Status"
                  options={[
                    { value: "Paid", label: "Lunas" },
                    { value: "Pending", label: "Pending" }
                  ]}
                  value={editFormData.status}
                  onChange={val => setEditFormData({...editFormData, status: val})}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#151D48] mb-1.5">Kategori</label>
              <CustomSelect 
                placeholder="Pilih Kategori"
                // map ini membuat pilihan kategori income/expense dari daftar kategori aktif.
                options={categories.map(c => ({ value: c.id, label: c.name }))}
                value={editFormData.category_id}
                onChange={val => setEditFormData({...editFormData, category_id: val})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#151D48] mb-1.5">Lampiran Bukti (Opsional)</label>
              {editFormData.attachment_url && !editAttachment && (
                <div className="mb-2 p-3 bg-gray-50 rounded-xl border border-gray-200 flex justify-between items-center">
                  <span className="text-sm text-gray-600 truncate max-w-[200px]">Lampiran tersimpan</span>
                  <a href={editFormData.attachment_url} target="_blank" rel="noopener noreferrer" className="text-sm text-[#5C67F2] font-medium hover:underline">Lihat</a>
                </div>
              )}
              <label htmlFor="edit-file-upload" className="flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50 hover:bg-gray-50 transition-colors cursor-pointer relative">
                <div className="space-y-1 text-center">
                  <div className="flex text-sm text-gray-600 justify-center">
                    <div className="relative cursor-pointer rounded-md font-medium text-[#5C67F2] hover:text-[#4a55c2] focus-within:outline-none">
                      <span>{editAttachment ? "Ganti file" : "Unggah file baru"}</span>
                      <input 
                        id="edit-file-upload" 
                        name="edit-file-upload" 
                        type="file" 
                        className="sr-only" 
                        onChange={e => {
                          // Kalau user memilih file dari input lampiran, simpan file itu ke state attachment.
                          if (e.target.files && e.target.files[0]) {
                            setEditAttachment(e.target.files[0]);
                          }
                        }}
                      />
                    </div>
                  </div>
                  {editAttachment && <p className="text-sm font-medium text-gray-800 mt-2">{editAttachment.name}</p>}
                </div>
              </label>
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-6">
              <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>Batal</Button>
              <Button type="submit" disabled={loading} className="bg-[#5C67F2] hover:bg-[#4a55c2] text-white">
                {loading ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}
