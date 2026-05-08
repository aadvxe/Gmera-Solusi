"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { BarsIcon, PlusIcon, DocumentDownloadIcon, EyeIcon, EditIcon, TrashIcon } from "@astraicons/react/bold";
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
import { getExpense, deleteExpense, updateExpense, getCategories, Expense, Category } from "@/lib/db";
import { toast } from "sonner";
import { formatRupiah, parseRupiah, formatCurrency } from "@/lib/utils";

export default function PengeluaranPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  const [categories, setCategories] = useState<Category[]>([]);

  const loadData = async () => {
    setLoading(true);
    const [data, catsData] = await Promise.all([
      getExpense(),
      getCategories('expense')
    ]);
    setExpenses(data);
    setCategories(catsData);
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
    
    const { error } = await deleteExpense(itemToDelete);
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
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  const [editFormData, setEditFormData] = useState({
    date: "",
    vendor: "",
    amount: 0,
    category_id: "",
    status: "",
    reference_number: ""
  });

  const handleView = (expense: Expense) => {
    setSelectedExpense(expense);
    setIsDetailModalOpen(true);
  };

  const handleEdit = (expense: Expense) => {
    setSelectedExpense(expense);
    setEditFormData({
      date: new Date(expense.date).toISOString().split('T')[0],
      vendor: expense.vendor || "",
      amount: expense.amount || 0,
      category_id: expense.category_id || "",
      status: expense.status || "",
      reference_number: expense.reference_number || ""
    });
    setIsEditModalOpen(true);
  };

  const submitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExpense) return;
    
    setLoading(true);
    const { error } = await updateExpense(selectedExpense.id, {
      date: editFormData.date,
      vendor: editFormData.vendor,
      amount: editFormData.amount,
      category_id: editFormData.category_id || null,
      status: editFormData.status,
      reference_number: editFormData.reference_number
    });
    setLoading(false);

    if (error) {
      toast.error("Gagal memperbarui data: " + error.message);
    } else {
      toast.success("Pengeluaran berhasil diperbarui");
      setIsEditModalOpen(false);
      setSelectedExpense(null);
      loadData();
    }
  };



  return (
    <>
      <div className="bg-surface border border-border rounded-2xl shadow-sm overflow-hidden flex flex-col h-full min-h-[500px]">
        {/* Header & Actions */}
        <div className="p-6 border-b border-border">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-[#151D48]">Pengeluaran</h1>
              <p className="text-sm text-gray-500 mt-1">Kelola seluruh catatan pengeluaran operasional</p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button variant="outline" className="flex items-center gap-2">
                <DocumentDownloadIcon className="w-4 h-4" /> <span className="hidden sm:inline">Ekspor</span>
              </Button>
              <Link href="/pengeluaran/tambah">
                <Button 
                  className="w-full sm:w-auto flex items-center gap-2 bg-[#FA5A7D] hover:bg-[#e04868] text-white border-transparent"
                >
                  <PlusIcon className="w-4 h-4" /> Tambah Data
                </Button>
              </Link>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 max-w-md">
              <Input 
                placeholder="Cari vendor atau referensi..." 
                icon={<SearchIcon className="w-[18px] h-[18px]" />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-[#F9FAFB] border-gray-200"
              />
            </div>
            <Button variant="outline" className="flex items-center gap-2 sm:w-auto w-full">
              <BarsIcon className="w-4 h-4" /> Filter
            </Button>
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
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-gray-500">
                    Memuat data...
                  </TableCell>
                </TableRow>
              ) : expenses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-gray-500">
                    Tidak ada data pengeluaran yang ditemukan.
                  </TableCell>
                </TableRow>
              ) : (
                expenses.filter(row => 
                  row.expense_type.toLowerCase().includes(searchTerm.toLowerCase()) || 
                  (row.reference_number || "").toLowerCase().includes(searchTerm.toLowerCase())
                ).map((row) => (
                  <TableRow key={row.id}>
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
          <div>Menampilkan {expenses.length} data</div>
          <div className="flex gap-1">
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
                <span className="font-semibold text-[#151D48]">{selectedExpense.vendor}</span>
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
            <div className="grid grid-cols-2 gap-4">
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
              <Input type="text" value={editFormData.vendor} onChange={e => setEditFormData({...editFormData, vendor: e.target.value})} required className="bg-[#F9FAFB]" />
            </div>

            <div className="grid grid-cols-2 gap-4">
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
                options={categories.map(c => ({ value: c.id, label: c.name }))}
                value={editFormData.category_id}
                onChange={val => setEditFormData({...editFormData, category_id: val})}
              />
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
