"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Filter1Icon, PlusIcon, DocumentDownloadIcon, MoreHorizontalIcon, EyeIcon, EmailSentIcon, TrashIcon, CheckCircleIcon, CloseIcon, CalculatorIcon, TruckIcon, Document1Icon, ChevronDownIcon, EditIcon, HelpIcon, ArrowDownIcon } from "@astraicons/react/bold";
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
  TableRow 
} from "@/components/ui/Table";
import { getInvoices, deleteInvoice, getClients, Invoice, Client } from "@/lib/db";
import { createInvoiceWithItems } from "@/lib/db/invoices";
import { createAuditLog } from "@/lib/db/users";
import { useAuthStore } from "@/store/authStore";
import { formatCurrency } from "@/lib/utils";
import { exportToExcel, exportToPDF } from "@/lib/export";
import { toast } from "sonner";

interface InvoiceItemForm {
  id: number;
  name: string;
  qty: number;
  price: number;
}

export default function EInvoicePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [invoices, setInvoices] = useState<(Invoice & { clients: { name: string } | null })[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const user = useAuthStore(state => state.user);
  const role = useAuthStore(state => state.role);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clientId, setClientId] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<string | null>(null);

  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterClientId, setFilterClientId] = useState("all");

  const resetFilters = () => {
    setFilterStatus("all");
    setFilterClientId("all");
    setIsFilterDropdownOpen(false);
  };

  const loadData = async () => {
    setLoading(true);
    const [invData, clientData] = await Promise.all([
      getInvoices(),
      getClients()
    ]);
    setInvoices(invData);
    setClients(clientData);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);



  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    switch (s) {
      case "paid":
      case "lunas":
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#76c893]/10 text-[#76c893] flex items-center gap-1 w-max"><CheckCircleIcon className="w-3 h-3" /> Lunas</span>;
      case "overdue":
      case "jatuh tempo":
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#f08a5d]/10 text-[#f08a5d] w-max block">Jatuh T.</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#ffd166]/10 text-[#ffd166] w-max block">Belum Bayar</span>;
    }
  };

  // Form State
  const [items, setItems] = useState<InvoiceItemForm[]>([{ id: 1, name: "", qty: 1, price: 0 }]);
  const [shippingCost, setShippingCost] = useState(0);
  const [taxRate, setTaxRate] = useState(11);
  const [applyTax, setApplyTax] = useState(true);
  
  const subtotal = items.reduce((sum, item) => sum + (item.qty * item.price), 0);
  const taxAmount = applyTax ? (subtotal * taxRate) / 100 : 0;
  const grandTotal = subtotal + taxAmount + shippingCost;

  const addItem = () => setItems([...items, { id: Date.now(), name: "", qty: 1, price: 0 }]);
  const removeItem = (id: number) => {
    if (items.length > 1) setItems(items.filter(item => item.id !== id));
  };
  const updateItem = (id: number, field: keyof InvoiceItemForm, value: any) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleCreateInvoice = async () => {
    if (!clientId) return alert("Pilih customer terlebih dahulu");
    if (items.some(i => !i.name || i.qty <= 0 || i.price <= 0)) return alert("Lengkapi detail barang/jasa");

    setLoading(true);
    try {
      const now = new Date();
      const due = new Date();
      due.setDate(now.getDate() + 14); // Default 14 days

      const selectedClient = clients.find(c => c.id === clientId);

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
      }, items.map(i => ({
        description: i.name,
        quantity: i.qty,
        unit: 'pcs',
        unit_price: i.price,
        total_price: i.qty * i.price
      })));

      if (error) throw error;
      
      setIsModalOpen(false);
      setItems([{ id: 1, name: "", qty: 1, price: 0 }]);
      setClientId("");
      loadData();
      alert("Invoice berhasil dibuat!");
    } catch (error: any) {
      alert("Gagal membuat invoice: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (id: string) => {
    setInvoiceToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!invoiceToDelete) return;
    
    setLoading(true);
    const { error } = await deleteInvoice(invoiceToDelete);
    setLoading(false);
    
    if (error) {
      alert("Gagal menghapus invoice: " + error.message);
    } else {
      setIsDeleteModalOpen(false);
      setInvoiceToDelete(null);
      loadData();
    }
  };

  const exportColumns = [
    { header: 'No. Invoice', key: 'invoice_number', width: 18 },
    { header: 'Customer', key: 'clients.name', width: 24 },
    { header: 'Tgl. Terbit', key: 'invoice_date', isDate: true, width: 14 },
    { header: 'Jatuh Tempo', key: 'due_date', isDate: true, width: 14 },
    { header: 'Total (Rp)', key: 'grand_total', isCurrency: true, width: 22 },
    { header: 'Status', key: 'status', width: 12 }
  ];

  const handleExportExcel = async () => {
    try {
      exportToExcel(invoices, exportColumns, `Invoice_${new Date().toISOString().slice(0,10)}`);
      toast("Ekspor Excel Selesai", {
        description: "Daftar invoice berhasil diekspor ke format Excel.",
        icon: <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center bg-[#5C67F2]/10 text-[#5C67F2]"><ArrowDownIcon className="w-5 h-5" /></div>,
      });
      
      if (user) {
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

  const handleExportPDF = async () => {
    toast.info("Sedang menyiapkan PDF...");
    try {
      exportToPDF(invoices, exportColumns, 'Laporan Invoice', `Laporan_Invoice_${new Date().toISOString().slice(0,10)}`);
      toast("Ekspor PDF Selesai", {
        description: "Laporan invoice berhasil diunduh dalam format PDF.",
        icon: <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center bg-[#5C67F2]/10 text-[#5C67F2]"><ArrowDownIcon className="w-5 h-5" /></div>,
      });

      if (user) {
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
            <div className="flex-1 max-w-md">
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
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-gray-500">
                    Memuat data invoice...
                  </TableCell>
                </TableRow>
              ) : invoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-gray-500">
                    Tidak ada invoice yang ditemukan.
                  </TableCell>
                </TableRow>
              ) : (
                invoices.filter(row => {
                  const matchesSearch = row.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                        row.clients?.name.toLowerCase().includes(searchTerm.toLowerCase());
                  const matchesStatus = filterStatus === "all" ? true : row.status === filterStatus;
                  const matchesClient = filterClientId === "all" ? true : row.client_id === filterClientId;
                  
                  return matchesSearch && matchesStatus && matchesClient;
                }).map((row) => (
                  <TableRow key={row.id}>
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
        <div className="p-4 border-t border-border flex items-center justify-between text-sm text-gray-500">
          <div>Menampilkan {invoices.length} data</div>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" disabled>Seb</Button>
            <Button variant="default" size="sm" className="bg-[#5C67F2] hover:bg-[#4a55c2] text-white">1</Button>
            <Button variant="outline" size="sm">2</Button>
            <Button variant="outline" size="sm">3</Button>
            <Button variant="outline" size="sm">Lan</Button>
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
                      {items.map((item, idx) => (
                        <div key={item.id} className="flex items-start gap-3 p-3 border border-gray-100 rounded-lg bg-[#F9FAFB]">
                          <div className="flex-1">
                            <Input placeholder="Deskripsi Barang/Jasa" value={item.name} onChange={(e) => updateItem(item.id, 'name', e.target.value)} className="bg-white mb-2" />
                            <div className="flex gap-3">
                              <div className="w-24">
                                <Input type="number" min="1" placeholder="Qty" value={item.qty} onChange={(e) => updateItem(item.id, 'qty', parseInt(e.target.value) || 0)} className="bg-white" />
                              </div>
                              <div className="flex-1">
                                <Input type="number" min="0" placeholder="Harga Satuan" value={item.price} onChange={(e) => updateItem(item.id, 'price', parseInt(e.target.value) || 0)} className="bg-white" />
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2 shrink-0 w-32 pt-1">
                            <span className="font-bold text-[#151D48] text-sm">{formatCurrency(item.qty * item.price)}</span>
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
            
            <div className="p-6 border-t border-gray-100 bg-white flex justify-end gap-3 shrink-0">
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
