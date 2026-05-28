"use client";

import React, { useState, useEffect } from "react";
import { Filter1Icon, PlusIcon, DocumentDownloadIcon, EyeIcon, EditIcon, TrashIcon, EmailIcon, CallIcon, CloseIcon, ArrowDownIcon, HelpIcon } from "@astraicons/react/bold";
import { SearchIcon } from "@astraicons/react/linear";
import { Modal } from "@/components/ui/Modal";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow,
} from "@/components/ui/Table";
import { getClients, insertClient, updateClient, deleteClient, Client, getClientInvoiceStats, getInvoicesByClient, Invoice } from "@/lib/db";
import { createAuditLog } from "@/lib/db/users";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { exportToExcel, exportToPDF } from "@/lib/export";

export default function CustomerPage() {
  const role = useAuthStore(state => state.role);

  if (role === 'viewer') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center bg-white rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-text-primary mb-2">Akses Ditolak</h2>
        <p className="text-sm text-text-secondary">Anda tidak memiliki hak akses untuk membuka halaman Customer.</p>
      </div>
    );
  }

  const [searchTerm, setSearchTerm] = useState("");
  const [clients, setClients] = useState<(Client & { stats?: { totalInvoices: number, unpaidAmount: number } })[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentClientId, setCurrentClientId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<string | null>(null);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<(Client & { stats?: { totalInvoices: number, unpaidAmount: number } }) | null>(null);
  const [clientInvoices, setClientInvoices] = useState<Invoice[]>([]);
  const [loadingInvoices, setLoadingInvoices] = useState(false);

  const handleViewDetail = async (client: (Client & { stats?: { totalInvoices: number, unpaidAmount: number } })) => {
    setSelectedClient(client);
    setIsDetailModalOpen(true);
    setLoadingInvoices(true);
    const invoices = await getInvoicesByClient(client.id);
    setClientInvoices(invoices);
    setLoadingInvoices(false);
  };

  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [filterCity, setFilterCity] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const resetFilters = () => {
    setFilterCity("all");
    setFilterStatus("all");
    setIsFilterDropdownOpen(false);
  };

  const uniqueCities = Array.from(
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

  const loadData = async () => {
    setLoading(true);
    const data = await getClients();
    
    // Fetch stats for each client (not the most efficient but works for now)
    const clientsWithStats = await Promise.all(data.map(async (client) => {
      const stats = await getClientInvoiceStats(client.id);
      return { ...client, stats };
    }));

    setClients(clientsWithStats);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

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

  const handleDeleteClick = (id: string) => {
    setClientToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!clientToDelete) return;

    setLoading(true);
    const { error } = await deleteClient(clientToDelete);
    setLoading(false);

    if (error) {
      toast.error("Gagal menghapus customer: " + error.message);
    } else {
      toast.success("Customer berhasil dihapus");
      setIsDeleteModalOpen(false);
      setClientToDelete(null);
      loadData();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEdit && currentClientId) {
        const { error } = await updateClient(currentClientId, formData);
        if (error) throw error;
        toast.success("Customer berhasil diperbarui");
      } else {
        const { error } = await insertClient(formData);
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

  const getFilteredClients = () => {
    return clients.filter(row => {
      const matchesSearch = row.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            (row.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (row.phone || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCity = filterCity === "all" ? true : row.city === filterCity;
      const matchesStatus = filterStatus === "all" ? true : (filterStatus === "active" ? row.is_active : !row.is_active);
      
      return matchesSearch && matchesCity && matchesStatus;
    });
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

  const handleExportExcel = async () => {
    try {
      exportToExcel(getFilteredClients(), exportColumns, `Customer_${new Date().toISOString().slice(0,10)}`);
      toast("Ekspor Excel Selesai", {
        description: "Data customer berhasil diekspor ke format Excel.",
        icon: <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center bg-[#5C67F2]/10 text-[#5C67F2]"><ArrowDownIcon className="w-5 h-5" /></div>,
      });
      
      const user = useAuthStore.getState().user;
      if (user) {
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

  const handleExportPDF = async () => {
    toast.info("Sedang menyiapkan PDF...");
    try {
      exportToPDF(getFilteredClients(), exportColumns, 'Daftar Customer', `Daftar_Customer_${new Date().toISOString().slice(0,10)}`);
      toast("Ekspor PDF Selesai", {
        description: "Daftar customer berhasil diunduh dalam format PDF.",
        icon: <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center bg-[#5C67F2]/10 text-[#5C67F2]"><ArrowDownIcon className="w-5 h-5" /></div>,
      });

      const user = useAuthStore.getState().user;
      if (user) {
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
              ) : getFilteredClients().length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-gray-500">
                    Tidak ada data customer yang ditemukan.
                  </TableCell>
                </TableRow>
              ) : (
                getFilteredClients().map((row) => (
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
        <div className="p-4 border-t border-border flex items-center justify-between text-sm text-gray-500">
          <div>Menampilkan {getFilteredClients().length} data</div>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" disabled>Seb</Button>
            <Button variant="default" size="sm" className="bg-[#5C67F2] hover:bg-[#4a55c2] text-white">1</Button>
            <Button variant="outline" size="sm">2</Button>
            <Button variant="outline" size="sm">3</Button>
            <Button variant="outline" size="sm">Lan</Button>
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
