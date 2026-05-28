"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Filter1Icon, PlusIcon, DocumentDownloadIcon, EyeIcon, EditIcon, TrashIcon, HelpIcon, ArrowDownIcon, CloseIcon } from "@astraicons/react/bold";
import { SearchIcon } from "@astraicons/react/linear";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { CustomDatePicker } from "@/components/ui/CustomDatePicker";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/Table";
import { getIncome, deleteIncome, updateIncome, getCategories, getClients, Income, Category, Client } from "@/lib/db";
import { createAuditLog } from "@/lib/db/users";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";
import { formatRupiah, parseRupiah, formatCurrency } from "@/lib/utils";
import { uploadFile } from "@/lib/storage";
import { exportToExcel, exportToPDF } from "@/lib/export";

export default function PendapatanPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [loading, setLoading] = useState(true);
  const user = useAuthStore(state => state.user);
  const role = useAuthStore(state => state.role);
  const [categories, setCategories] = useState<Category[]>([]);
  const [clients, setClients] = useState<Client[]>([]);

  const loadData = async () => {
    setLoading(true);
    const [data, catsData, clientsData] = await Promise.all([
      getIncome(),
      getCategories('income'),
      getClients()
    ]);
    setIncomes(data);
    setCategories(catsData);
    setClients(clientsData);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const handleDeleteClick = (id: string) => {
    setItemToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    
    const { error } = await deleteIncome(itemToDelete);
    if (error) {
      alert("Gagal menghapus data: " + error.message);
    } else {
      loadData();
    }
    
    setIsDeleteModalOpen(false);
    setItemToDelete(null);
  };

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedIncome, setSelectedIncome] = useState<Income | null>(null);

  const [editFormData, setEditFormData] = useState({
    date: "",
    source: "",
    amount: 0,
    amountRaw: "",
    category_id: "",
    status: "",
    reference_number: "",
    attachment_url: "" as string | null
  });
  const [editAttachment, setEditAttachment] = useState<File | null>(null);

  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");
  const [filterCategoryId, setFilterCategoryId] = useState("all");

  const resetFilters = () => {
    setFilterFrom("");
    setFilterTo("");
    setFilterCategoryId("all");
    setIsFilterDropdownOpen(false);
  };

  const handleView = (income: Income) => {
    setSelectedIncome(income);
    setIsDetailModalOpen(true);
  };

  const handleEdit = (income: Income) => {
    setSelectedIncome(income);
    const amt = income.amount || 0;
    setEditFormData({
      date: new Date(income.date).toISOString().split('T')[0],
      source: income.source || "",
      amount: amt,
      amountRaw: amt > 0 ? formatRupiah(amt, true) : "",
      category_id: income.category_id || "",
      status: income.status || "",
      reference_number: income.reference_number || "",
      attachment_url: income.attachment_url || null
    });
    setEditAttachment(null);
    setIsEditModalOpen(true);
  };

  const submitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIncome) return;
    
    setLoading(true);
    let newAttachmentUrl = editFormData.attachment_url;
      
    if (editAttachment) {
      const { url, error } = await uploadFile(editAttachment, 'uploads');
      if (!error && url) {
        newAttachmentUrl = url;
      }
    }

    const { error } = await updateIncome(selectedIncome.id, {
      date: editFormData.date,
      source: editFormData.source,
      amount: editFormData.amount,
      category_id: editFormData.category_id || null,
      status: editFormData.status,
      reference_number: editFormData.reference_number,
      attachment_url: newAttachmentUrl
    });
    setLoading(false);

    if (error) {
      toast.error("Gagal memperbarui data: " + error.message);
    } else {
      toast.success("Pendapatan berhasil diperbarui");
      setIsEditModalOpen(false);
      setSelectedIncome(null);
      setEditAttachment(null);
      loadData();
    }
  };

  const getFilteredIncomes = () => {
    return incomes.filter(row => {
      const matchesSearch = row.source.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            (row.reference_number || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDateFrom = filterFrom ? row.date >= filterFrom : true;
      const matchesDateTo = filterTo ? row.date <= filterTo : true;
      const matchesCategory = filterCategoryId === "all" ? true : row.category_id === filterCategoryId;
      
      return matchesSearch && matchesDateFrom && matchesDateTo && matchesCategory;
    });
  };

  const exportColumns = [
    { header: 'Tanggal', key: 'date', isDate: true, width: 14 },
    { header: 'No. Referensi', key: 'reference_number', width: 16 },
    { header: 'Customer / Sumber', key: 'source', width: 24 },
    { header: 'Kategori', key: 'categories.name', width: 18 },
    { header: 'Jumlah (Rp)', key: 'amount', isCurrency: true, width: 22 },
    { header: 'Status', key: 'status', width: 12 }
  ];

  const handleExportExcel = async () => {
    try {
      exportToExcel(getFilteredIncomes(), exportColumns, `Pendapatan_${new Date().toISOString().slice(0,10)}`);
      toast("Ekspor Excel Selesai", {
        description: "Data pendapatan berhasil diekspor ke format Excel.",
        icon: <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center bg-[#5C67F2]/10 text-[#5C67F2]"><ArrowDownIcon className="w-5 h-5" /></div>,
      });
      
      if (user) {
        await createAuditLog(user.id, 'create', 'Export', null, null, { description: 'Laporan Pendapatan (Excel) berhasil diunduh' });
        window.dispatchEvent(new CustomEvent('refreshNotifications'));
      }
    } catch (error) {
      toast("Gagal Ekspor Excel", {
        description: "Terjadi kesalahan saat mengekspor data ke Excel.",
        icon: <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center bg-[#FA5A7D]/10 text-[#FA5A7D]"><HelpIcon className="w-5 h-5" /></div>,
      });
    }
  };

  const handleExportPDF = async () => {
    toast.info("Sedang menyiapkan PDF...");
    try {
      exportToPDF(getFilteredIncomes(), exportColumns, 'Laporan Pendapatan', `Laporan_Pendapatan_${new Date().toISOString().slice(0,10)}`);
      toast("Ekspor PDF Selesai", {
        description: "Laporan pendapatan berhasil diunduh dalam format PDF.",
        icon: <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center bg-[#5C67F2]/10 text-[#5C67F2]"><ArrowDownIcon className="w-5 h-5" /></div>,
      });

      if (user) {
        await createAuditLog(user.id, 'create', 'Export', null, null, { description: 'Laporan Pendapatan (PDF) berhasil diunduh' });
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

  return (
    <>
      <div className="bg-surface border border-border rounded-2xl shadow-sm flex flex-col h-full min-h-[500px]">
        {/* Header & Actions */}
        <div className="p-6 border-b border-border">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-[#151D48]">Pendapatan</h1>
              <p className="text-sm text-gray-500 mt-1">Kelola seluruh catatan pemasukan perusahaan</p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button variant="outline" className="flex items-center gap-2" onClick={handleExportExcel}>
                <DocumentDownloadIcon className="w-4 h-4" /> <span className="hidden sm:inline">Excel</span>
              </Button>
              <Button variant="outline" className="flex items-center gap-2" onClick={handleExportPDF}>
                <DocumentDownloadIcon className="w-4 h-4" /> <span className="hidden sm:inline">PDF</span>
              </Button>
              {role !== 'viewer' && (
                <Link href="/pendapatan/tambah" className="w-full sm:w-auto">
                  <Button 
                    className="w-full sm:w-auto flex items-center gap-2 bg-[#5C67F2] hover:bg-[#4a55c2] text-white"
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
                placeholder="Cari referensi atau customer..." 
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
                <TableHead>Customer / Sumber</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead className="text-right">Jumlah</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-gray-500">
                    Memuat data...
                  </TableCell>
                </TableRow>
              ) : getFilteredIncomes().length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-gray-500">
                    Tidak ada data pendapatan yang ditemukan.
                  </TableCell>
                </TableRow>
              ) : (
                getFilteredIncomes().map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium text-[#151D48]">{new Date(row.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</TableCell>
                    <TableCell className="text-gray-600">{row.reference_number || '-'}</TableCell>
                    <TableCell className="text-gray-600">{row.source}</TableCell>
                    <TableCell>
                      <span className="bg-gray-100 px-2.5 py-1 rounded-md text-xs font-medium text-gray-600 border border-gray-200">
                        {row.categories?.name || 'Lain-lain'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-bold text-[#3CD856] tabular-nums">
                      +{formatCurrency(row.amount)}
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
          <div className="p-4 border-t border-border flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-sm text-gray-500">
          <div>Menampilkan {getFilteredIncomes().length} data</div>
            <div className="flex w-full justify-end gap-1 sm:w-auto">
            <Button variant="outline" size="sm" disabled>Seb</Button>
            <Button variant="default" size="sm" className="bg-[#5C67F2] hover:bg-[#4a55c2] text-white">1</Button>
            <Button variant="outline" size="sm">2</Button>
            <Button variant="outline" size="sm">3</Button>
            <Button variant="outline" size="sm">Lan</Button>
          </div>
        </div>
      </div>
      
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Hapus Pendapatan"
        description="Apakah Anda yakin ingin menghapus data pendapatan ini? Tindakan ini tidak dapat dibatalkan."
        confirmText="Hapus"
        isDanger={true}
      />

      {/* Detail Modal */}
      <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)}>
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-xl font-bold text-[#151D48]">Detail Pendapatan</h2>
            <button onClick={() => setIsDetailModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
          </div>
          {selectedIncome && (
            <div className="p-6 space-y-4">
              <div className="flex justify-between border-b border-gray-100 pb-3">
                <span className="text-gray-500 text-sm">Tanggal</span>
                <span className="font-semibold text-[#151D48]">
                  {new Date(selectedIncome.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-3">
                <span className="text-gray-500 text-sm">No. Referensi</span>
                <span className="font-semibold text-[#151D48]">{selectedIncome.reference_number || '-'}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-3">
                <span className="text-gray-500 text-sm">Sumber / Customer</span>
                <span className="font-semibold text-[#151D48]">{selectedIncome.source}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-3">
                <span className="text-gray-500 text-sm">Kategori</span>
                <span className="font-semibold text-[#151D48]">{selectedIncome.categories?.name || 'Lain-lain'}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-3">
                <span className="text-gray-500 text-sm">Status</span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                  selectedIncome.status?.toLowerCase() === 'paid' || selectedIncome.status?.toLowerCase() === 'lunas' ? 'bg-[#3CD856]/10 text-[#3CD856]' : 'bg-[#FF947A]/10 text-[#FF947A]'
                }`}>
                  {selectedIncome.status?.toLowerCase() === 'paid' || selectedIncome.status?.toLowerCase() === 'lunas' ? 'Lunas' : selectedIncome.status || 'Pending'}
                </span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-gray-500 font-medium">Total Jumlah</span>
                <span className="text-xl font-bold text-[#3CD856]">+{formatCurrency(selectedIncome.amount)}</span>
              </div>
              {selectedIncome.attachment_url && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <span className="block text-gray-500 text-sm mb-2">Lampiran Bukti</span>
                  <a href={selectedIncome.attachment_url} target="_blank" rel="noopener noreferrer" className="inline-flex flex-col items-center justify-center p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors w-full">
                    {selectedIncome.attachment_url.toLowerCase().match(/\.(jpeg|jpg|gif|png)$/) ? (
                      <img src={selectedIncome.attachment_url} alt="Lampiran" className="max-h-40 object-contain mb-2 rounded" />
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
            <h2 className="text-xl font-bold text-[#151D48]">Edit Pendapatan</h2>
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
              <label className="block text-sm font-medium text-[#151D48] mb-1.5">Customer / Sumber</label>
              <CustomSelect 
                placeholder="Pilih Customer"
                options={[
                  ...clients.map(c => ({ value: c.name, label: c.name })),
                  { value: "Lainnya", label: "Lainnya" }
                ]}
                value={editFormData.source}
                onChange={val => setEditFormData({...editFormData, source: val})}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#151D48] mb-1.5">Jumlah</label>
                <Input 
                  icon={<span className="font-medium text-sm">Rp</span>}
                  type="text" 
                  placeholder="0"
                  value={editFormData.amountRaw} 
                  onChange={e => {
                    const raw = e.target.value;
                    const parsed = parseRupiah(raw);
                    setEditFormData({...editFormData, amount: parsed, amountRaw: parsed > 0 ? formatRupiah(parsed, false) : "" });
                  }}
                  onBlur={() => {
                    // On blur, reformat the display value
                    const formatted = editFormData.amount > 0 ? formatRupiah(editFormData.amount, true) : "";
                    setEditFormData(prev => ({...prev, amountRaw: formatted}));
                  }}
                  onFocus={() => {
                    const formatted = editFormData.amount > 0 ? formatRupiah(editFormData.amount, false) : "";
                    setEditFormData(prev => ({...prev, amountRaw: formatted}));
                  }}
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
