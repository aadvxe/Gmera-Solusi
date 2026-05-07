"use client";

import React, { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { 
  GroupIcon as Building2Icon,
  GroupIcon,
  Category1Icon,
  DocumentIcon as ReceiptIcon,
  CardIcon,
  SaveIcon,
  PlusIcon,
  EditIcon,
  TrashIcon,
  CheckCircleIcon,
  CloseCircleIcon
} from "@astraicons/react/bold";
import { SearchIcon, Menu2Icon } from "@astraicons/react/linear";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/Table";
import { 
  getCompanyProfile, 
  updateCompanyProfile, 
  getAllUsers, 
  getCategories, 
  getPaymentMethods,
  updateUserRole,
  deleteUser,
  deleteCategory,
  updateCategoryOrder,
  CompanyProfile,
  UserProfile,
  Category,
  PaymentMethod
} from "@/lib/db";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

type TabId = "profil" | "pengguna" | "kategori" | "pajak" | "pembayaran";

const TABS = [
  { id: "profil", label: "Profil Perusahaan", icon: Building2Icon },
  { id: "pengguna", label: "Manajemen Pengguna", icon: GroupIcon },
  { id: "kategori", label: "Kategori Transaksi", icon: Category1Icon },
  { id: "pajak", label: "Pengaturan Pajak", icon: ReceiptIcon },
  { id: "pembayaran", label: "Metode Pembayaran", icon: CardIcon },
];

export default function PengaturanPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>("profil");
  const [activeCatTab, setActiveCatTab] = useState<"pendapatan"|"pengeluaran">("pendapatan");
  
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState<CompanyProfile | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [compData, userData, catData, pmData] = await Promise.all([
        getCompanyProfile(),
        getAllUsers(),
        getCategories(),
        getPaymentMethods()
      ]);
      setCompany(compData);
      setUsers(userData);
      setCategories(catData);
      setPaymentMethods(pmData);
    } catch (error) {
      console.error("Failed to load settings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateCompany = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!company) return;

    const formData = new FormData(e.currentTarget);
    const payload = {
      company_name: formData.get("company_name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      address: formData.get("address") as string,
      website: formData.get("website") as string,
    };

    setLoading(true);
    const { error } = await updateCompanyProfile(payload);
    setLoading(false);

    if (error) {
      toast.error("Gagal memperbarui profil: " + (typeof error === 'string' ? error : error.message));
    } else {
      toast.success("Profil perusahaan berhasil diperbarui!");
      loadData();
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (confirm("Apakah Anda yakin ingin menonaktifkan pengguna ini?")) {
      setLoading(true);
      const { error } = await deleteUser(id);
      if (error) toast.error("Gagal menonaktifkan pengguna");
      else { toast.success("Pengguna dinonaktifkan"); loadData(); }
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus kategori ini?")) {
      setLoading(true);
      const { error } = await deleteCategory(id);
      if (error) toast.error("Gagal menghapus kategori");
      else { toast.success("Kategori berhasil dihapus"); loadData(); }
      setLoading(false);
    }
  };

  const handleSort = async () => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    if (dragItem.current === dragOverItem.current) {
      dragItem.current = null;
      dragOverItem.current = null;
      return;
    }

    const type = activeCatTab === "pendapatan" ? "income" : "expense";
    const filteredCats = categories.filter(c => c.type === type);
    const otherCats = categories.filter(c => c.type !== type);

    const _filteredCats = [...filteredCats];
    const draggedItemContent = _filteredCats.splice(dragItem.current, 1)[0];
    _filteredCats.splice(dragOverItem.current, 0, draggedItemContent);
    
    // Set sequential indices for the new order, fixing any all-0 states
    const itemsToUpdate = _filteredCats.map((cat, idx) => ({
      id: cat.id,
      order_index: idx
    }));

    // Optimistically update local state
    setCategories([...otherCats, ..._filteredCats]);

    dragItem.current = null;
    dragOverItem.current = null;

    setLoading(true);
    const { error } = await updateCategoryOrder(itemsToUpdate);
    if (error) {
      toast.error("Gagal mengubah urutan: " + error.message);
      loadData(); // Revert
    } else {
      toast.warning("Pengaturan Sistem", {
        description: "Urutan kategori berhasil diperbarui"
      });
      // Auto-update the Navbar notifications
      window.dispatchEvent(new Event('refreshNotifications'));
      loadData(); // Reload to get fresh from DB
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  const renderContent = () => {
    switch (activeTab) {
      case "profil":
        return (
          <form onSubmit={handleUpdateCompany} className="space-y-6 max-w-3xl">
            <div>
              <h2 className="text-xl font-bold text-[#151D48]">Profil Perusahaan</h2>
              <p className="text-sm text-gray-500 mt-1">Informasi ini akan ditampilkan pada kop surat dan E-Invoice.</p>
            </div>

            <div className="flex items-start gap-6 border-b border-gray-100 pb-6">
              <div className="w-24 h-24 rounded-2xl bg-gray-100 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-500 shrink-0">
                <Building2Icon className="w-6 h-6 mb-2" />
                <span className="text-[10px] font-medium">Logo Perusahaan</span>
              </div>
              <div className="flex-1 space-y-1">
                <h3 className="font-medium text-[#151D48]">Logo Perusahaan</h3>
                <p className="text-xs text-gray-500">Logo sudah terpasang di sistem.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[#151D48] mb-1.5">Nama Perusahaan <span className="text-red-500">*</span></label>
                <Input name="company_name" defaultValue={company?.company_name} className="bg-[#F9FAFB] border-gray-200" required />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#151D48] mb-1.5">Email Resmi <span className="text-red-500">*</span></label>
                <Input name="email" type="email" defaultValue={company?.email} className="bg-[#F9FAFB] border-gray-200" required />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#151D48] mb-1.5">Nomor Telepon</label>
                <Input name="phone" type="text" defaultValue={company?.phone} className="bg-[#F9FAFB] border-gray-200" />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[#151D48] mb-1.5">Alamat Lengkap</label>
                <textarea 
                  name="address"
                  rows={3}
                  defaultValue={company?.address}
                  className="w-full bg-[#F9FAFB] border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#5C67F2]/20 transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#151D48] mb-1.5">Website</label>
                <Input name="website" type="text" defaultValue={company?.website ?? ''} className="bg-[#F9FAFB] border-gray-200" />
              </div>
            </div>

            <div className="pt-4 flex justify-between">
              <Button 
                type="button"
                variant="outline"
                onClick={handleLogout}
                className="text-red-500 border-red-200 hover:bg-red-50"
              >
                Sign Out
              </Button>
              <Button 
                type="submit"
                disabled={loading}
                className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-2"
              >
                <SaveIcon className="w-4 h-4" /> {loading ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </div>
          </form>
        );
      
      case "pengguna":
        return (
          <div className="space-y-6 max-w-4xl">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-[#151D48]">Manajemen Pengguna</h2>
                <p className="text-sm text-gray-500 mt-1">Kelola akses staf dan manajer keuangan ke dalam sistem.</p>
              </div>
              <Button className="bg-[#5C67F2] hover:bg-[#4a55c2] text-white flex items-center gap-2">
                <PlusIcon className="w-4 h-4" /> Tambah Pengguna
              </Button>
            </div>
            
            <div className="border border-gray-100 rounded-2xl overflow-hidden">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead>Nama & Email</TableHead>
                    <TableHead>Peran Akses</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="font-medium text-[#151D48]">{user.name}</div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${
                          user.role.includes("manager") ? "bg-[#5C67F2]/10 text-[#5C67F2]" : "bg-gray-100 text-gray-600"
                        }`}>
                          {user.role?.replace('_', ' ').toUpperCase()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-xs">
                          {user.is_active ? (
                            <><CheckCircleIcon className="w-3.5 h-3.5 text-[#3CD856]" /> <span className="text-[#3CD856] font-medium">Aktif</span></>
                          ) : (
                            <><CloseCircleIcon className="w-3.5 h-3.5 text-gray-400" /> <span className="text-gray-400 font-medium">Nonaktif</span></>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => alert("Fitur edit pengguna sedang dikembangkan.")} className="p-1.5 text-gray-400 hover:text-[#5C67F2] hover:bg-[#5C67F2]/10 rounded-md transition-colors" title="Edit">
                            <EditIcon className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDeleteUser(user.id)} className="p-1.5 text-gray-400 hover:text-[#FA5A7D] hover:bg-[#FA5A7D]/10 rounded-md transition-colors" title="Hapus">
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        );

      case "kategori":
        return (
          <div className="space-y-6 max-w-3xl">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-[#151D48]">Kategori Transaksi</h2>
                <p className="text-sm text-gray-500 mt-1">Klasifikasi untuk mempermudah pencatatan dan laporan.</p>
              </div>
              <Button className="bg-[#5C67F2] hover:bg-[#4a55c2] text-white flex items-center gap-2">
                <PlusIcon className="w-4 h-4" /> Kategori Baru
              </Button>
            </div>

            <div className="flex gap-2 border-b border-gray-100 pb-px">
              <button 
                onClick={() => setActiveCatTab("pendapatan")}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeCatTab === "pendapatan" ? "border-[#5C67F2] text-[#5C67F2]" : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Kategori Pendapatan
              </button>
              <button 
                onClick={() => setActiveCatTab("pengeluaran")}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeCatTab === "pengeluaran" ? "border-[#5C67F2] text-[#5C67F2]" : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Kategori Pengeluaran
              </button>
            </div>

            <div className="border border-gray-100 rounded-2xl overflow-hidden">
              <Table>
                <TableBody>
                  {categories.filter(c => c.type === (activeCatTab === "pendapatan" ? "income" : "expense")).map((cat, idx) => (
                    <TableRow 
                      key={cat.id}
                      draggable
                      onDragStart={() => (dragItem.current = idx)}
                      onDragEnter={() => (dragOverItem.current = idx)}
                      onDrop={handleSort}
                      onDragOver={(e) => e.preventDefault()}
                      className="cursor-move"
                    >
                      <TableCell className="font-medium text-[#151D48] w-full">
                        <div className="flex items-center gap-3">
                          <div className="text-gray-400 hover:text-gray-600">
                            <Menu2Icon className="w-4 h-4" />
                          </div>
                          <span>{cat.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        <div className="flex justify-end gap-2 items-center">
                          <button onClick={() => alert("Fitur edit kategori sedang dikembangkan.")} className="p-1.5 text-gray-400 hover:text-[#5C67F2] hover:bg-[#5C67F2]/10 rounded-md transition-colors" title="Edit">
                            <EditIcon className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDeleteCategory(cat.id)} className="p-1.5 text-gray-400 hover:text-[#FA5A7D] hover:bg-[#FA5A7D]/10 rounded-md transition-colors" title="Hapus">
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        );

      case "pajak":
        return (
          <form onSubmit={handleUpdateCompany} className="space-y-6 max-w-2xl">
            <div>
              <h2 className="text-xl font-bold text-[#151D48]">Pengaturan Pajak</h2>
              <p className="text-sm text-gray-500 mt-1">Konfigurasi NPWP dan tarif pajak *default* untuk tagihan.</p>
            </div>

            <div className="bg-[#F9FAFB] p-4 rounded-xl border border-gray-100 flex items-start gap-3">
              <div className="mt-0.5 text-[#5C67F2]"><ReceiptIcon className="w-[18px] h-[18px]" /></div>
              <div>
                <h4 className="text-sm font-semibold text-[#151D48]">Aktifkan Perhitungan Pajak Otomatis</h4>
                <p className="text-xs text-gray-500 mt-1">Jika diaktifkan, pajak akan otomatis ditambahkan ke total subtotal setiap kali Anda membuat E-Invoice baru.</p>
              </div>
              <div className="ml-auto">
                <div className="w-10 h-5 bg-[#3CD856] rounded-full relative cursor-pointer">
                  <div className="absolute right-1 top-0.5 w-4 h-4 bg-white rounded-full"></div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 pt-2">
              <div>
                <label className="block text-sm font-medium text-[#151D48] mb-1.5">NPWP Perusahaan</label>
                <Input name="npwp" defaultValue={company?.npwp ?? ''} className="bg-[#F9FAFB] border-gray-200" />
                <p className="text-xs text-gray-500 mt-1.5">Akan ditampilkan di atas setiap faktur pajak.</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#151D48] mb-1.5">Tarif PPN Default (%)</label>
                <Input name="tax_rate" type="number" defaultValue={company?.tax_rate ?? 11} className="bg-[#F9FAFB] border-gray-200 w-1/3" />
              </div>
            </div>

            <div className="pt-4 flex justify-start">
              <Button type="submit" disabled={loading} className="bg-[#5C67F2] hover:bg-[#4a55c2] text-white flex items-center gap-2">
                <SaveIcon className="w-4 h-4" /> {loading ? "Menyimpan..." : "Simpan Pengaturan"}
              </Button>
            </div>
          </form>
        );

      case "pembayaran":
        return (
          <form onSubmit={handleUpdateCompany} className="space-y-6 max-w-3xl">
            <div>
              <h2 className="text-xl font-bold text-[#151D48]">Metode Pembayaran</h2>
              <p className="text-sm text-gray-500 mt-1">Daftar rekening bank untuk dilampirkan pada E-Invoice agar klien mudah membayar.</p>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-6 shadow-sm">
              <h3 className="font-semibold text-[#151D48] mb-4">Informasi Rekening Bank Utama</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Nama Bank</label>
                  <Input name="bank_name" defaultValue={company?.bank_name ?? ''} placeholder="Contoh: BCA" className="bg-[#F9FAFB] border-gray-200" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Nomor Rekening</label>
                  <Input name="bank_account" defaultValue={company?.bank_account ?? ''} placeholder="xxxxxxxxxx" className="bg-[#F9FAFB] border-gray-200" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Atas Nama</label>
                  <Input name="bank_account_name" defaultValue={company?.bank_account_name ?? ''} placeholder="PT GMera Solusi" className="bg-[#F9FAFB] border-gray-200" />
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <Button type="submit" disabled={loading} className="bg-[#5C67F2] hover:bg-[#4a55c2] text-white flex items-center gap-2">
                  <SaveIcon className="w-4 h-4" /> {loading ? "Menyimpan..." : "Simpan Perubahan"}
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-[#151D48]">Rekening Terdaftar</h3>
              {company?.bank_account && (
                <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl bg-[#F9FAFB]">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-lg border border-gray-200 flex items-center justify-center shrink-0">
                      <CardIcon className="w-5 h-5 text-[#5C67F2]" />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#151D48]">{company.bank_name} - {company.bank_account}</h4>
                      <p className="text-xs text-gray-500">a.n {company.bank_account_name}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </form>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row h-[calc(100vh-8rem)]">
      {/* Sidebar Navigation */}
      <div className="w-full md:w-64 bg-gray-50 border-r border-gray-100 shrink-0 p-4 overflow-y-auto">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-3">Menu Pengaturan</h3>
        <nav className="space-y-1">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabId)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium ${
                  isActive 
                    ? "bg-[#5C67F2] text-white shadow-md shadow-[#5C67F2]/20" 
                    : "text-gray-600 hover:bg-gray-200/50 hover:text-[#151D48]"
                }`}
              >
                <Icon className="w-[18px] h-[18px]" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-6 md:p-8 overflow-y-auto">
        {renderContent()}
      </div>
    </div>
  );
}
