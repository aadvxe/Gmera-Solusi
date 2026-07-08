"use client";

// Import React hook yang dipakai halaman pengaturan untuk profil perusahaan, user, kategori, pajak, dan pembayaran, misalnya untuk state, efek setelah render, atau referensi elemen.
import React, { useState, useEffect, useRef } from "react";
// Import Sonner untuk menampilkan toast sukses/error di halaman pengaturan untuk profil perusahaan, user, kategori, pajak, dan pembayaran.
import { toast } from "sonner";
// Import berikutnya mengambil komponen/helper yang langsung dipakai oleh halaman pengaturan.
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
  CloseCircleIcon,
  CloseIcon
} from "@astraicons/react/bold";
// Import ikon yang dipakai halaman pengaturan untuk profil perusahaan, user, kategori, pajak, dan pembayaran untuk memperjelas tombol, menu, status, dan aksi di layar.
import { SearchIcon, Menu2Icon } from "@astraicons/react/linear";
// Import komponen UI reusable supaya halaman pengaturan untuk profil perusahaan, user, kategori, pajak, dan pembayaran memakai tampilan tombol, modal, input, atau tabel yang konsisten.
import { Button } from "@/components/ui/Button";
// Import SkeletonForm untuk loading state form.
import { SkeletonForm } from "@/components/ui/Skeleton";
// Import komponen UI reusable supaya halaman pengaturan untuk profil perusahaan, user, kategori, pajak, dan pembayaran memakai tampilan tombol, modal, input, atau tabel yang konsisten.
import { Input } from "@/components/ui/Input";
// Import komponen UI reusable supaya halaman pengaturan untuk profil perusahaan, user, kategori, pajak, dan pembayaran memakai tampilan tombol, modal, input, atau tabel yang konsisten.
import { Modal } from "@/components/ui/Modal";
// Import komponen UI reusable supaya halaman pengaturan untuk profil perusahaan, user, kategori, pajak, dan pembayaran memakai tampilan tombol, modal, input, atau tabel yang konsisten.
import { ConfirmModal } from "@/components/ui/ConfirmModal";
// Import berikutnya mengambil komponen/helper yang langsung dipakai oleh halaman pengaturan.
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/Table";
// Import berikutnya mengambil komponen/helper yang langsung dipakai oleh halaman pengaturan.
import { 
  getCompanyProfile, 
  updateCompanyProfile, 
  getAllUsers, 
  getCategories, 
  getPaymentMethods,
  updateUserRole,
  deleteUser,
  deleteCategory,
  updateCategory,
  updateCategoryOrder,
  createCategory,
  CompanyProfile,
  UserProfile,
  Category,
  PaymentMethod
} from "@/lib/db";
// Import createClient untuk membuka koneksi Supabase dari browser saat halaman pengaturan untuk profil perusahaan, user, kategori, pajak, dan pembayaran perlu membaca/menyimpan data.
import { createClient } from "@/utils/supabase/client";
// Import alat navigasi Next.js supaya halaman pengaturan untuk profil perusahaan, user, kategori, pajak, dan pembayaran bisa pindah halaman atau membaca route aktif.
import { useRouter } from "next/navigation";
// Import uploadFile supaya halaman pengaturan untuk profil perusahaan, user, kategori, pajak, dan pembayaran bisa mengirim lampiran ke Supabase Storage.
import { uploadFile } from "@/lib/storage";
// Import authStore supaya halaman pengaturan untuk profil perusahaan, user, kategori, pajak, dan pembayaran bisa membaca user login, role, nama tampilan, atau mengosongkan session saat logout.
import { useAuthStore } from "@/store/authStore";

// Type ini memberi nama pada bentuk data yang dipakai halaman pengaturan untuk profil perusahaan, user, kategori, pajak, dan pembayaran.
type TabId = "profil" | "pengguna" | "kategori" | "pajak" | "pembayaran";

const TABS = [
  { id: "profil", label: "Profil Perusahaan", icon: Building2Icon },
  { id: "pengguna", label: "Manajemen Pengguna", icon: GroupIcon },
  { id: "kategori", label: "Kategori Transaksi", icon: Category1Icon },
  { id: "pajak", label: "Pengaturan Pajak", icon: ReceiptIcon },
  { id: "pembayaran", label: "Metode Pembayaran", icon: CardIcon },
];

// PengaturanPage mengatur data master seperti profil perusahaan, user, kategori, pajak, dan rekening pembayaran.
export default function PengaturanPage() {
  const router = useRouter();
  const role = useAuthStore(state => state.role);
  const setUser = useAuthStore(state => state.setUser);
  const setRole = useAuthStore(state => state.setRole);
  const [activeTab, setActiveTab] = useState<TabId>("profil");
  const [activeCatTab, setActiveCatTab] = useState<"pendapatan"|"pengeluaran">("pendapatan");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  
  // loading menyimpan nilai loading yang berubah saat user berinteraksi dengan halaman pengaturan untuk profil perusahaan, user, kategori, pajak, dan pembayaran.
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState<CompanyProfile | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

  // isDeleteUserModalOpen menyimpan nilai is delete user modal open yang berubah saat user berinteraksi dengan halaman pengaturan untuk profil perusahaan, user, kategori, pajak, dan pembayaran.
  const [isDeleteUserModalOpen, setIsDeleteUserModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  
  // isDeleteCategoryModalOpen menyimpan nilai is delete category modal open yang berubah saat user berinteraksi dengan halaman pengaturan untuk profil perusahaan, user, kategori, pajak, dan pembayaran.
  const [isDeleteCategoryModalOpen, setIsDeleteCategoryModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  // isLogoutModalOpen menentukan apakah modal konfirmasi logout sedang tampil.
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  // isLoggingOut menandai proses logout sedang berjalan agar tombol tidak diklik berkali-kali.
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // isAddCategoryModalOpen menyimpan nilai is add category modal open yang berubah saat user berinteraksi dengan halaman pengaturan untuk profil perusahaan, user, kategori, pajak, dan pembayaran.
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  // newCategoryName menyimpan nilai new category name yang berubah saat user berinteraksi dengan halaman pengaturan untuk profil perusahaan, user, kategori, pajak, dan pembayaran.
  const [newCategoryName, setNewCategoryName] = useState("");

  // isEditCategoryModalOpen menyimpan nilai is edit category modal open yang berubah saat user berinteraksi dengan halaman pengaturan untuk profil perusahaan, user, kategori, pajak, dan pembayaran.
  const [isEditCategoryModalOpen, setIsEditCategoryModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);
  // editCategoryName menyimpan nilai edit category name yang berubah saat user berinteraksi dengan halaman pengaturan untuk profil perusahaan, user, kategori, pajak, dan pembayaran.
  const [editCategoryName, setEditCategoryName] = useState("");

  // isEditUserModalOpen menyimpan nilai is edit user modal open yang berubah saat user berinteraksi dengan halaman pengaturan untuk profil perusahaan, user, kategori, pajak, dan pembayaran.
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<UserProfile | null>(null);
  // editUserRole menyimpan nilai edit user role yang berubah saat user berinteraksi dengan halaman pengaturan untuk profil perusahaan, user, kategori, pajak, dan pembayaran.
  const [editUserRole, setEditUserRole] = useState("staff");

  // isAddUserModalOpen menyimpan nilai is add user modal open yang berubah saat user berinteraksi dengan halaman pengaturan untuk profil perusahaan, user, kategori, pajak, dan pembayaran.
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  // newUserName menyimpan nilai new user name yang berubah saat user berinteraksi dengan halaman pengaturan untuk profil perusahaan, user, kategori, pajak, dan pembayaran.
  const [newUserName, setNewUserName] = useState("");
  // newUserEmail menyimpan nilai new user email yang berubah saat user berinteraksi dengan halaman pengaturan untuk profil perusahaan, user, kategori, pajak, dan pembayaran.
  const [newUserEmail, setNewUserEmail] = useState("");
  // newUserRole menyimpan nilai new user role yang berubah saat user berinteraksi dengan halaman pengaturan untuk profil perusahaan, user, kategori, pajak, dan pembayaran.
  const [newUserRole, setNewUserRole] = useState("staff");
  // newUserPassword menyimpan nilai new user password yang berubah saat user berinteraksi dengan halaman pengaturan untuk profil perusahaan, user, kategori, pajak, dan pembayaran.
  const [newUserPassword, setNewUserPassword] = useState("");

  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);
  const categoryRowRefs = useRef<Record<string, HTMLTableRowElement | null>>({});
  const [draggingCategoryId, setDraggingCategoryId] = useState<string | null>(null);
  const [dragOverCategoryId, setDragOverCategoryId] = useState<string | null>(null);
  const [dragPreview, setDragPreview] = useState<{
    name: string;
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
    scale: number;
  } | null>(null);
  // dragTargetRef menyimpan referensi ke elemen/timer tanpa memaksa layar render ulang.
  const dragTargetRef = useRef({ x: 0, y: 0 });
  // dragMotionRef menyimpan referensi ke elemen/timer tanpa memaksa layar render ulang.
  const dragMotionRef = useRef({ x: 0, y: 0, vx: 0, vy: 0 });
  // dragOffsetRef menyimpan referensi ke elemen/timer tanpa memaksa layar render ulang.
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  // dragBaseXRef menyimpan referensi ke elemen/timer tanpa memaksa layar render ulang.
  const dragBaseXRef = useRef(0);
  const dragAnimationFrame = useRef<number | null>(null);

  // loadData mengambil data yang dibutuhkan halaman pengaturan untuk profil perusahaan, user, kategori, pajak, dan pembayaran dari Supabase lalu mengisi state halaman.
  const loadData = async () => {
    setLoading(true);
    // try ini menyimpan perubahan pengaturan seperti profil perusahaan, user, kategori, pajak, atau metode pembayaran.
    try {
      // await Promise.all menunggu beberapa query berjalan paralel sampai semuanya selesai.
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

  // Effect ini mengambil data yang diperlukan halaman pengaturan untuk profil perusahaan, user, kategori, pajak, dan pembayaran saat halaman dibuka atau filter berubah.
  useEffect(() => {
    loadData();
  }, []);

  // Effect ini mengambil data yang diperlukan halaman pengaturan untuk profil perusahaan, user, kategori, pajak, dan pembayaran saat halaman dibuka atau filter berubah.
  useEffect(() => {
    // loadData menampilkan UI untuk halaman pengaturan untuk profil perusahaan, user, kategori, pajak, dan pembayaran.
    return () => {
      // Kondisi if (dragAnimationFrame.current !== null) membuat isi blok if di bawahnya hanya berjalan saat kondisi itu benar di halaman pengaturan.
      if (dragAnimationFrame.current !== null) {
        cancelAnimationFrame(dragAnimationFrame.current);
      }
    };
  }, []);

  // handleUpdateCompany menangani aksi user di halaman pengaturan untuk profil perusahaan, user, kategori, pajak, dan pembayaran, seperti klik tombol, submit form, atau perubahan input.
  const handleUpdateCompany = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    // Kondisi if (!company) return; membuat isi blok if di bawahnya hanya berjalan saat kondisi itu benar di halaman pengaturan.
    if (!company) return;

    setLoading(true);

    let newLogoUrl = company.logo_url;
    // Kondisi if (logoFile) membuat isi blok if di bawahnya hanya berjalan saat kondisi itu benar di halaman pengaturan.
    if (logoFile) {
      // await menunggu upload lampiran selesai agar invoice menyimpan URL file yang benar.
      const { url, error } = await uploadFile(logoFile, 'uploads');
      // Kalau Supabase mengembalikan error atau data kosong, halaman pengaturan menampilkan pesan gagal atau mengembalikan data kosong agar UI tidak rusak.
      if (!error && url) {
        newLogoUrl = url;
      } else {
        console.error("Upload error:", error);
        toast.error("Gagal mengunggah logo. Pastikan bucket 'uploads' sudah dibuat di Supabase Storage.");
        setLoading(false);
        // form berhenti di sini karena syarat lanjut belum terpenuhi.
        return;
      }
    }

    const formData = new FormData(form);
    const payload: any = { logo_url: newLogoUrl };
    
    // Only include fields that are present in the form
    formData.forEach((value, key) => {
      // Kondisi ini memastikan nilai input ada sebelum dipakai untuk tampilan atau perhitungan.
      if (value !== null && value !== "" && key !== 'logo-upload') {
        // Kondisi ini memastikan nilai input ada sebelum dipakai untuk tampilan atau perhitungan.
        if (key === 'tax_rate') payload[key] = parseFloat(value as string);
        // Kondisi else payload[key] = value as string; membuat isi blok if di bawahnya hanya berjalan saat kondisi itu benar di halaman pengaturan.
        else payload[key] = value as string;
      }
    });

    // Kondisi ini mengecek jumlah item agar daftar kosong, pagination, atau total bisa ditangani dengan benar.
    if (Object.keys(payload).length === 0) {
      setLoading(false);
      // payload berhenti di sini karena syarat lanjut belum terpenuhi.
      return;
    }

    // await menunggu proses async selesai sebelum kode ini melanjutkan langkah berikutnya.
    const { error } = await updateCompanyProfile(payload);
    setLoading(false);

    // Kalau Supabase mengembalikan error atau data kosong, halaman pengaturan menampilkan pesan gagal atau mengembalikan data kosong agar UI tidak rusak.
    if (error) {
      toast.error("Gagal memperbarui: " + (typeof error === 'string' ? error : error.message));
    } else {
      let desc = "Pengaturan sistem berhasil diperbarui";
      // Kondisi if (payload.tax_rate || payload.npwp) desc = "Pengaturan pajak diperbarui"; membuat isi blok if di bawahnya hanya berjalan saat kondisi itu benar di halaman pengaturan.
      if (payload.tax_rate || payload.npwp) desc = "Pengaturan pajak diperbarui";
      // Kondisi else if (payload.bank_name || payload.bank_account) desc = "Metode pembayaran diperbarui"; membuat isi blok if di bawahnya hanya berjalan saat kondisi itu benar di halaman pengaturan.
      else if (payload.bank_name || payload.bank_account) desc = "Metode pembayaran diperbarui";
      // Kondisi else desc = "Profil perusahaan berhasil diperbarui"; membuat isi blok if di bawahnya hanya berjalan saat kondisi itu benar di halaman pengaturan.
      else desc = "Profil perusahaan berhasil diperbarui";

      toast.warning("Pengaturan Sistem", {
        description: desc
      });
      
      setLogoFile(null);
      window.dispatchEvent(new Event('refreshNotifications'));
      loadData();
    }
  };

  // handleDeleteUserClick adalah fungsi penangan aksi user; fungsi ini berjalan saat user mengklik, mengetik, memilih, atau submit sesuatu.
  const handleDeleteUserClick = (id: string) => {
    setUserToDelete(id);
    setIsDeleteUserModalOpen(true);
  };

  // confirmDeleteUser menonaktifkan user yang dipilih setelah modal konfirmasi disetujui.
  const confirmDeleteUser = async () => {
    // Kalau belum ada akun Supabase yang login, hentikan proses yang membutuhkan profil user.
    if (!userToDelete) return;
    setLoading(true);
    // await menunggu proses async selesai sebelum kode ini melanjutkan langkah berikutnya.
    const { error } = await deleteUser(userToDelete);
    // Kalau Supabase mengembalikan error atau data kosong, halaman pengaturan menampilkan pesan gagal atau mengembalikan data kosong agar UI tidak rusak.
    if (error) toast.error("Gagal menonaktifkan pengguna");
    // Kondisi else { toast.success("Pengguna dinonaktifkan"); loadData(); } membuat isi blok if di bawahnya hanya berjalan saat kondisi itu benar di halaman pengaturan.
    else { toast.success("Pengguna dinonaktifkan"); loadData(); }
    setIsDeleteUserModalOpen(false);
    setUserToDelete(null);
    setLoading(false);
  };

  // handleDeleteCategoryClick adalah fungsi penangan aksi user; fungsi ini berjalan saat user mengklik, mengetik, memilih, atau submit sesuatu.
  const handleDeleteCategoryClick = (id: string) => {
    setCategoryToDelete(id);
    setIsDeleteCategoryModalOpen(true);
  };

  // confirmDeleteCategory menghapus kategori yang dipilih lalu menutup modal konfirmasi.
  const confirmDeleteCategory = async () => {
    // Kondisi if (!categoryToDelete) return; membuat isi blok if di bawahnya hanya berjalan saat kondisi itu benar di halaman pengaturan.
    if (!categoryToDelete) return;
    setLoading(true);
    // await menunggu proses async selesai sebelum kode ini melanjutkan langkah berikutnya.
    const { error } = await deleteCategory(categoryToDelete);
    // Kalau Supabase mengembalikan error atau data kosong, halaman pengaturan menampilkan pesan gagal atau mengembalikan data kosong agar UI tidak rusak.
    if (error) {
      toast.error("Gagal menghapus kategori");
    } else {
      toast.warning("Pengaturan Sistem", {
        description: "Kategori berhasil dihapus"
      });
      window.dispatchEvent(new Event('refreshNotifications'));
      loadData();
    }
    setIsDeleteCategoryModalOpen(false);
    setCategoryToDelete(null);
    setLoading(false);
  };

  // handleCreateCategory menangani aksi user di halaman pengaturan untuk profil perusahaan, user, kategori, pajak, dan pembayaran, seperti klik tombol, submit form, atau perubahan input.
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    // Kondisi if (!newCategoryName.trim()) return; membuat isi blok if di bawahnya hanya berjalan saat kondisi itu benar di halaman pengaturan.
    if (!newCategoryName.trim()) return;
    
    setLoading(true);
    const type = activeCatTab === "pendapatan" ? "income" : "expense";
    // map ini membuat satu output untuk setiap item daftar yang sedang dirender oleh halaman pengaturan.
    const maxOrder = Math.max(0, ...categories.filter(c => c.type === type).map(c => c.order_index || 0));
    
    // await menunggu proses async selesai sebelum kode ini melanjutkan langkah berikutnya.
    const { error } = await createCategory({
      name: newCategoryName.trim(),
      type: type,
      description: null,
      order_index: maxOrder + 1,
      is_active: true
    });
    
    // Kalau Supabase mengembalikan error atau data kosong, halaman pengaturan menampilkan pesan gagal atau mengembalikan data kosong agar UI tidak rusak.
    if (error) {
      toast.error("Gagal menambahkan kategori: " + error.message);
    } else {
      toast.warning("Pengaturan Sistem", {
        description: `Kategori '${newCategoryName.trim()}' berhasil ditambahkan`
      });
      window.dispatchEvent(new Event('refreshNotifications'));
      setNewCategoryName("");
      setIsAddCategoryModalOpen(false);
      loadData();
    }
    setLoading(false);
  };

  // handleEditCategoryClick adalah fungsi penangan aksi user; fungsi ini berjalan saat user mengklik, mengetik, memilih, atau submit sesuatu.
  const handleEditCategoryClick = (cat: Category) => {
    setCategoryToEdit(cat);
    setEditCategoryName(cat.name);
    setIsEditCategoryModalOpen(true);
  };

  // handleUpdateCategory menangani aksi user di halaman pengaturan untuk profil perusahaan, user, kategori, pajak, dan pembayaran, seperti klik tombol, submit form, atau perubahan input.
  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    // Kondisi if (!categoryToEdit || !editCategoryName.trim()) return; membuat isi blok if di bawahnya hanya berjalan saat kondisi itu benar di halaman pengaturan.
    if (!categoryToEdit || !editCategoryName.trim()) return;

    setLoading(true);
    // await menunggu proses async selesai sebelum kode ini melanjutkan langkah berikutnya.
    const { error } = await updateCategory(categoryToEdit.id, { name: editCategoryName.trim() });
    
    // Kalau Supabase mengembalikan error atau data kosong, halaman pengaturan menampilkan pesan gagal atau mengembalikan data kosong agar UI tidak rusak.
    if (error) {
      toast.error("Gagal mengubah kategori: " + error.message);
    } else {
      toast.success("Kategori berhasil diubah");
      window.dispatchEvent(new Event('refreshNotifications'));
      setIsEditCategoryModalOpen(false);
      setCategoryToEdit(null);
      loadData();
    }
    setLoading(false);
  };

  // handleCreateUser menangani aksi user di halaman pengaturan untuk profil perusahaan, user, kategori, pajak, dan pembayaran, seperti klik tombol, submit form, atau perubahan input.
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // try ini menyimpan perubahan pengaturan seperti profil perusahaan, user, kategori, pajak, atau metode pembayaran.
    try {
      const supabase = createClient();
      // await menunggu respons Supabase selesai sebelum kode memakai data atau error yang dikembalikan.
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newUserEmail,
        password: newUserPassword,
        options: {
          data: {
            name: newUserName,
            role: newUserRole,
          }
        }
      });

      // Kondisi if (authError) throw authError; membuat isi blok if di bawahnya hanya berjalan saat kondisi itu benar di halaman pengaturan.
      if (authError) throw authError;
      
      toast.success("Pengguna baru berhasil ditambahkan. Silakan minta pengguna untuk verifikasi email.");
      setIsAddUserModalOpen(false);
      setNewUserName("");
      setNewUserEmail("");
      setNewUserPassword("");
      loadData();
    } catch (error: any) {
      toast.error("Gagal menambahkan pengguna: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // handleEditUserClick adalah fungsi penangan aksi user; fungsi ini berjalan saat user mengklik, mengetik, memilih, atau submit sesuatu.
  const handleEditUserClick = (user: UserProfile) => {
    setUserToEdit(user);
    setEditUserRole(user.role || "staff");
    setIsEditUserModalOpen(true);
  };

  // handleUpdateUserRole menangani aksi user di halaman pengaturan untuk profil perusahaan, user, kategori, pajak, dan pembayaran, seperti klik tombol, submit form, atau perubahan input.
  const handleUpdateUserRole = async (e: React.FormEvent) => {
    e.preventDefault();
    // Kalau belum ada akun Supabase yang login, hentikan proses yang membutuhkan profil user.
    if (!userToEdit) return;

    setLoading(true);
    // await menunggu proses async selesai sebelum kode ini melanjutkan langkah berikutnya.
    const { error } = await updateUserRole(userToEdit.id, editUserRole);
    
    // Kalau Supabase mengembalikan error atau data kosong, halaman pengaturan menampilkan pesan gagal atau mengembalikan data kosong agar UI tidak rusak.
    if (error) {
      toast.error("Gagal mengubah akses pengguna: " + error.message);
    } else {
      toast.success("Akses pengguna berhasil diperbarui");
      window.dispatchEvent(new Event('refreshNotifications'));
      setIsEditUserModalOpen(false);
      setUserToEdit(null);
      loadData();
    }
    setLoading(false);
  };

  // handleSort menangani aksi user di halaman pengaturan untuk profil perusahaan, user, kategori, pajak, dan pembayaran, seperti klik tombol, submit form, atau perubahan input.
  const handleSort = async () => {
    // Kondisi if (dragItem.current === null || dragOverItem.current === null) return; membuat isi blok if di bawahnya hanya berjalan saat kondisi itu benar di halaman pengaturan.
    if (dragItem.current === null || dragOverItem.current === null) return;
    // Kondisi if (dragItem.current === dragOverItem.current) membuat isi blok if di bawahnya hanya berjalan saat kondisi itu benar di halaman pengaturan.
    if (dragItem.current === dragOverItem.current) {
      dragItem.current = null;
      dragOverItem.current = null;
      setDraggingCategoryId(null);
      setDragOverCategoryId(null);
      clearDragPreview();
      // handleSort berhenti di sini karena syarat lanjut belum terpenuhi.
      return;
    }

    const type = activeCatTab === "pendapatan" ? "income" : "expense";
    // filter ini menyisakan data halaman pengaturan yang cocok dengan pencarian, status, role, atau tanggal aktif.
    const filteredCats = categories.filter(c => c.type === type);
    // filter ini menyisakan data halaman pengaturan yang cocok dengan pencarian, status, role, atau tanggal aktif.
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
    setDraggingCategoryId(null);
    setDragOverCategoryId(null);
    clearDragPreview();

    setLoading(true);
    // await menunggu proses async selesai sebelum kode ini melanjutkan langkah berikutnya.
    const { error } = await updateCategoryOrder(itemsToUpdate);
    // Kalau Supabase mengembalikan error atau data kosong, halaman pengaturan menampilkan pesan gagal atau mengembalikan data kosong agar UI tidak rusak.
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

  // getCategoryIndexAtPoint mengambil atau menghitung data yang dibutuhkan halaman pengaturan untuk profil perusahaan, user, kategori, pajak, dan pembayaran.
  const getCategoryIndexAtPoint = (clientY: number, visibleCategories: Category[]) => {
    let closestIndex = dragItem.current ?? 0;
    let closestDistance = Number.POSITIVE_INFINITY;

    visibleCategories.forEach((cat, idx) => {
      const row = categoryRowRefs.current[cat.id];
      // Kondisi if (!row) return; membuat isi blok if di bawahnya hanya berjalan saat kondisi itu benar di halaman pengaturan.
      if (!row) return;

      const rect = row.getBoundingClientRect();
      const midpoint = rect.top + rect.height / 2;
      const distance = Math.abs(clientY - midpoint);

      // Kondisi if (distance < closestDistance) membuat isi blok if di bawahnya hanya berjalan saat kondisi itu benar di halaman pengaturan.
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = idx;
      }
    });

    // distance mengembalikan hasil untuk halaman pengaturan, sesuai data yang dihitung tepat sebelum baris return ini.
    return closestIndex;
  };

  // clearDragPreview menghapus bayangan item kategori yang sedang di-drag.
  const clearDragPreview = () => {
    // Kondisi if (dragAnimationFrame.current !== null) membuat isi blok if di bawahnya hanya berjalan saat kondisi itu benar di halaman pengaturan.
    if (dragAnimationFrame.current !== null) {
      cancelAnimationFrame(dragAnimationFrame.current);
      dragAnimationFrame.current = null;
    }
    setDragPreview(null);
  };

  // runDragPreviewSpring menjalankan animasi halus untuk bayangan kategori saat drag berjalan.
  const runDragPreviewSpring = () => {
    // Kondisi if (dragAnimationFrame.current !== null) return; membuat isi blok if di bawahnya hanya berjalan saat kondisi itu benar di halaman pengaturan.
    if (dragAnimationFrame.current !== null) return;

    // tick menghitung posisi animasi berikutnya untuk preview drag kategori.
    const tick = () => {
      const motion = dragMotionRef.current;
      const target = dragTargetRef.current;
      const stiffness = 0.18;
      const damping = 0.7;

      motion.vx = (motion.vx + (target.x - motion.x) * stiffness) * damping;
      motion.vy = (motion.vy + (target.y - motion.y) * stiffness) * damping;
      motion.x += motion.vx;
      motion.y += motion.vy;

      const rotation = Math.max(-7, Math.min(7, motion.vx * 0.16));

      setDragPreview((preview) =>
        preview
          ? {
              ...preview,
              x: motion.x,
              y: motion.y,
              rotation,
              scale: 1.03
            }
          : null
      );

      dragAnimationFrame.current = requestAnimationFrame(tick);
    };

    dragAnimationFrame.current = requestAnimationFrame(tick);
  };

  // startDragPreview membuat bayangan kategori di posisi pointer saat user mulai drag.
  const startDragPreview = (name: string, rowRect: DOMRect, pointerX: number, pointerY: number) => {
    clearDragPreview();
    dragBaseXRef.current = rowRect.left;
    dragOffsetRef.current = {
      x: pointerX - rowRect.left,
      y: pointerY - rowRect.top,
    };
    dragTargetRef.current = { x: rowRect.left, y: rowRect.top };
    dragMotionRef.current = { x: rowRect.left, y: rowRect.top, vx: 0, vy: 0 };
    setDragPreview({
      name,
      x: rowRect.left,
      y: rowRect.top,
      width: rowRect.width,
      height: rowRect.height,
      rotation: 0,
      scale: 1
    });
    runDragPreviewSpring();
  };

  // Bagian handleCategoryPointerDown menyimpan logika yang dipakai di bawahnya.
  const handleCategoryPointerDown = (
    event: React.PointerEvent<HTMLButtonElement>,
    index: number,
    categoryId: string
  ) => {
    // Kondisi if (event.pointerType === "mouse" && event.button !== 0) return; membuat isi blok if di bawahnya hanya berjalan saat kondisi itu benar di halaman pengaturan.
    if (event.pointerType === "mouse" && event.button !== 0) return;

    event.preventDefault();
    dragItem.current = index;
    dragOverItem.current = index;
    setDraggingCategoryId(categoryId);
    setDragOverCategoryId(categoryId);
    const rowRect = categoryRowRefs.current[categoryId]?.getBoundingClientRect();
    // Kondisi if (rowRect) membuat isi blok if di bawahnya hanya berjalan saat kondisi itu benar di halaman pengaturan.
    if (rowRect) {
      startDragPreview(categories.find((cat) => cat.id === categoryId)?.name ?? "", rowRect, event.clientX, event.clientY);
    }
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  // Bagian handleCategoryPointerMove menyimpan logika yang dipakai di bawahnya.
  const handleCategoryPointerMove = (
    event: React.PointerEvent<HTMLButtonElement>,
    visibleCategories: Category[]
  ) => {
    // Kondisi if (dragItem.current === null) return; membuat isi blok if di bawahnya hanya berjalan saat kondisi itu benar di halaman pengaturan.
    if (dragItem.current === null) return;

    event.preventDefault();
    const nextIndex = getCategoryIndexAtPoint(event.clientY, visibleCategories);
    dragOverItem.current = nextIndex;
    setDragOverCategoryId(visibleCategories[nextIndex]?.id ?? null);
    dragTargetRef.current = {
      x: dragBaseXRef.current,
      y: event.clientY - dragOffsetRef.current.y
    };
  };

  // handleCategoryPointerEnd menangani aksi user di halaman pengaturan untuk profil perusahaan, user, kategori, pajak, dan pembayaran, seperti klik tombol, submit form, atau perubahan input.
  const handleCategoryPointerEnd = async (event: React.PointerEvent<HTMLButtonElement>) => {
    // Kondisi if (event.currentTarget.hasPointerCapture(event.pointerId)) membuat isi blok if di bawahnya hanya berjalan saat kondisi itu benar di halaman pengaturan.
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    // await menunggu proses async selesai sebelum kode ini melanjutkan langkah berikutnya.
    await handleSort();
  };

  // handleCategoryPointerCancel adalah fungsi penangan aksi user; fungsi ini berjalan saat user mengklik, mengetik, memilih, atau submit sesuatu.
  const handleCategoryPointerCancel = (event: React.PointerEvent<HTMLButtonElement>) => {
    // Kondisi if (event.currentTarget.hasPointerCapture(event.pointerId)) membuat isi blok if di bawahnya hanya berjalan saat kondisi itu benar di halaman pengaturan.
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    dragItem.current = null;
    dragOverItem.current = null;
    setDraggingCategoryId(null);
    setDragOverCategoryId(null);
    clearDragPreview();
  };

  // handleLogout menangani aksi user di halaman pengaturan untuk profil perusahaan, user, kategori, pajak, dan pembayaran, seperti klik tombol, submit form, atau perubahan input.
  const handleLogout = async () => {
    setIsLoggingOut(true);
    const supabase = createClient();
    // await menunggu respons Supabase selesai sebelum kode memakai data atau error yang dikembalikan.
    await supabase.auth.signOut();
    document.cookie = "mock_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    setUser(null);
    setRole(null);
    router.push("/login");
  };

  // renderContent memilih isi tab pengaturan yang tampil: perusahaan, user, kategori, pajak, atau pembayaran.
  const renderContent = () => {
    switch (activeTab) {
      case "profil":
        // handleLogout menampilkan UI untuk halaman pengaturan untuk profil perusahaan, user, kategori, pajak, dan pembayaran.
        return (
          <form onSubmit={handleUpdateCompany} className="space-y-6 max-w-3xl">
            <div>
              <h2 className="text-xl font-bold text-[#151D48]">Profil Perusahaan</h2>
              <p className="text-sm text-gray-500 mt-1">Informasi ini akan ditampilkan pada kop surat dan E-Invoice.</p>
            </div>

            <div className="flex items-start gap-6 border-b border-gray-100 pb-6">
              <div className="w-24 h-24 rounded-2xl bg-gray-100 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-500 shrink-0 overflow-hidden relative group">
                {(logoFile || company?.logo_url) ? (
                  <img src={logoFile ? URL.createObjectURL(logoFile) : (company?.logo_url ?? "")} alt="Company Logo" className="w-full h-full object-contain bg-white" />
                ) : (
                  <>
                    <Building2Icon className="w-6 h-6 mb-2" />
                    <span className="text-[10px] font-medium text-center">Logo<br/>Perusahaan</span>
                  </>
                )}
                <label className="absolute inset-0 bg-black/50 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                  <span className="text-[10px] font-medium">Ubah Logo</span>
                  <input 
                    type="file" 
                    name="logo-upload" 
                    accept="image/*" 
                    className="sr-only" 
                    onChange={e => {
                      // Kalau user memilih file dari input lampiran, simpan file itu ke state attachment.
                      if (e.target.files && e.target.files[0]) {
                        setLogoFile(e.target.files[0]);
                      }
                    }}
                  />
                </label>
              </div>
              <div className="flex-1 space-y-1 pt-2">
                <h3 className="font-medium text-[#151D48]">Logo Perusahaan</h3>
                <p className="text-xs text-gray-500">Logo digunakan pada E-Invoice. Format JPG, PNG (Maks. 2MB)</p>
                {logoFile && <p className="text-xs text-[#5C67F2] font-medium mt-1">Logo baru siap diunggah</p>}
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
                onClick={() => setIsLogoutModalOpen(true)}
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
        // Kondisi ini mengecek role agar menu/fitur yang tampil sesuai hak akses user.
        if (role !== "super_admin") return null;
        // handleLogout menampilkan UI untuk halaman pengaturan untuk profil perusahaan, user, kategori, pajak, dan pembayaran.
        return (
          <div className="space-y-6 max-w-4xl">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <h2 className="text-xl font-bold text-[#151D48]">Manajemen Pengguna</h2>
                <p className="text-sm text-gray-500 mt-1">Kelola akses staf dan manajer keuangan ke dalam sistem.</p>
              </div>
              <Button 
                onClick={() => setIsAddUserModalOpen(true)}
                className="w-full bg-[#5C67F2] hover:bg-[#4a55c2] text-white flex items-center gap-2 sm:w-auto"
              >
                <PlusIcon className="w-4 h-4" /> Tambah Pengguna
              </Button>
            </div>
            
            <div className="border border-gray-100 rounded-2xl overflow-hidden">
              <Table className="min-w-full">
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead>Nama & Email</TableHead>
                    <TableHead>Peran Akses</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* map ini membuat satu output untuk setiap item daftar yang sedang dirender oleh halaman pengaturan. */}
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
                          <button onClick={() => handleEditUserClick(user)} className="p-1.5 text-gray-400 hover:text-[#5C67F2] hover:bg-[#5C67F2]/10 rounded-md transition-colors" title="Edit">
                            <EditIcon className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDeleteUserClick(user.id)} className="p-1.5 text-gray-400 hover:text-[#FA5A7D] hover:bg-[#FA5A7D]/10 rounded-md transition-colors" title="Hapus">
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

      case "kategori": {
        // filter ini menyisakan data halaman pengaturan yang cocok dengan pencarian, status, role, atau tanggal aktif.
        const visibleCategories = categories.filter(c => c.type === (activeCatTab === "pendapatan" ? "income" : "expense"));
        // handleLogout menampilkan UI untuk halaman pengaturan untuk profil perusahaan, user, kategori, pajak, dan pembayaran.
        return (
          <div className="space-y-6 max-w-3xl">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <h2 className="text-xl font-bold text-[#151D48]">Kategori Transaksi</h2>
                <p className="text-sm text-gray-500 mt-1">Klasifikasi untuk mempermudah pencatatan dan laporan.</p>
              </div>
              <Button onClick={() => setIsAddCategoryModalOpen(true)} className="w-full bg-[#5C67F2] hover:bg-[#4a55c2] text-white flex items-center gap-2 sm:w-auto">
                <PlusIcon className="w-4 h-4" /> Kategori Baru
              </Button>
            </div>

            <div className="flex gap-2 overflow-x-auto border-b border-gray-100 pb-px">
              <button 
                onClick={() => setActiveCatTab("pendapatan")}
                className={`shrink-0 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeCatTab === "pendapatan" ? "border-[#5C67F2] text-[#5C67F2]" : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Kategori Pendapatan
              </button>
              <button 
                onClick={() => setActiveCatTab("pengeluaran")}
                className={`shrink-0 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeCatTab === "pengeluaran" ? "border-[#5C67F2] text-[#5C67F2]" : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Kategori Pengeluaran
              </button>
            </div>

            <div className="relative border border-gray-100 rounded-2xl overflow-hidden">
              <Table className="min-w-full">
                <TableBody>
                  {/* map ini membuat satu output untuk setiap item daftar yang sedang dirender oleh halaman pengaturan. */}
                  {visibleCategories.map((cat, idx) => (
                    <TableRow 
                      key={cat.id}
                      ref={(node) => {
                        categoryRowRefs.current[cat.id] = node;
                      }}
                      onDragStart={() => (dragItem.current = idx)}
                      onDragEnter={() => (dragOverItem.current = idx)}
                      onDrop={handleSort}
                      onDragOver={(e) => e.preventDefault()}
                      className={`transition-colors duration-100 ${
                        draggingCategoryId === cat.id
                          ? "bg-[#5C67F2]/5 opacity-30"
                          : dragOverCategoryId === cat.id
                          ? "bg-[#5C67F2]/10 shadow-[inset_4px_0_0_#5C67F2]"
                          : ""
                      }`}
                    >
                      <TableCell className="font-medium text-[#151D48] w-full">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onPointerDown={(event) => handleCategoryPointerDown(event, idx, cat.id)}
                            onPointerMove={(event) => handleCategoryPointerMove(event, visibleCategories)}
                            onPointerUp={handleCategoryPointerEnd}
                            onPointerCancel={handleCategoryPointerCancel}
                            className={`touch-none rounded-md p-1 transition-colors hover:bg-gray-100 active:cursor-grabbing ${
                              draggingCategoryId === cat.id ? "bg-[#5C67F2]/10 text-[#5C67F2]" : "text-gray-400 hover:text-gray-600"
                            }`}
                            aria-label={`Geser urutan ${cat.name}`}
                            title="Geser urutan"
                          >
                            <Menu2Icon className="w-4 h-4" />
                          </button>
                          <span>{cat.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        <div className="flex justify-end gap-2 items-center">
                          <button onClick={() => handleEditCategoryClick(cat)} className="p-1.5 text-gray-400 hover:text-[#5C67F2] hover:bg-[#5C67F2]/10 rounded-md transition-colors" title="Edit">
                            <EditIcon className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDeleteCategoryClick(cat.id)} className="p-1.5 text-gray-400 hover:text-[#FA5A7D] hover:bg-[#FA5A7D]/10 rounded-md transition-colors" title="Hapus">
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {dragPreview && (
                <div
                  className="pointer-events-none fixed left-0 top-0 z-[10000] flex select-none items-center justify-between gap-3 rounded-xl border border-[#5C67F2]/20 bg-white px-4 text-sm font-semibold text-[#151D48] shadow-[0_22px_55px_rgba(92,103,242,0.32)] ring-4 ring-[#5C67F2]/10 will-change-transform"
                  style={{
                    width: dragPreview.width,
                    minHeight: dragPreview.height,
                    transform: `translate3d(${dragPreview.x}px, ${dragPreview.y}px, 0) rotate(${dragPreview.rotation}deg) scale(${dragPreview.scale})`,
                    transformOrigin: "18px 18px",
                  }}
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#5C67F2]/10 text-[#5C67F2]">
                      <Menu2Icon className="h-4 w-4" />
                    </span>
                    <span className="truncate">{dragPreview.name}</span>
                  </span>
                  <span className="flex shrink-0 items-center gap-2 text-gray-300">
                    <EditIcon className="h-4 w-4" />
                    <TrashIcon className="h-4 w-4" />
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      }

      case "pajak":
        // handleLogout menampilkan UI untuk halaman pengaturan untuk profil perusahaan, user, kategori, pajak, dan pembayaran.
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
        // handleLogout menampilkan UI untuk halaman pengaturan untuk profil perusahaan, user, kategori, pajak, dan pembayaran.
        return (
          <form onSubmit={handleUpdateCompany} className="space-y-6 max-w-3xl">
            <div>
              <h2 className="text-xl font-bold text-[#151D48]">Metode Pembayaran</h2>
              <p className="text-sm text-gray-500 mt-1">Daftar rekening bank untuk dilampirkan pada E-Invoice agar customer mudah membayar.</p>
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

  // handleLogout menampilkan UI untuk halaman pengaturan untuk profil perusahaan, user, kategori, pajak, dan pembayaran.
  return (
    <div className="flex min-h-[calc(100dvh-6rem)] flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm md:h-[calc(100vh-8rem)] md:flex-row">
      {/* Sidebar Navigation */}
      <div className="w-full shrink-0 border-b border-gray-100 bg-gray-50 p-4 md:w-64 md:border-b-0 md:border-r md:overflow-y-auto">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-3">Menu Pengaturan</h3>
        <nav className="flex gap-2 overflow-x-auto md:block md:space-y-1">
          {/* map ini membuat satu output untuk setiap item daftar yang sedang dirender oleh halaman pengaturan. */}
          {TABS.filter(tab => tab.id !== "pengguna" || role === "super_admin").map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            // handleLogout menampilkan UI untuk halaman pengaturan untuk profil perusahaan, user, kategori, pajak, dan pembayaran.
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabId)}
                className={`flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all md:w-full ${
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
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
        {loading ? <SkeletonForm /> : (
          <div key={activeTab} className="animate-fade-in">
            {renderContent()}
          </div>
        )}
      </div>

      {/* Modals */}
      <ConfirmModal
        isOpen={isDeleteUserModalOpen}
        onClose={() => setIsDeleteUserModalOpen(false)}
        onConfirm={confirmDeleteUser}
        title="Nonaktifkan Pengguna"
        description="Apakah Anda yakin ingin menonaktifkan pengguna ini?"
        confirmText="Nonaktifkan"
        isDanger={true}
        isLoading={loading}
      />

      <ConfirmModal
        isOpen={isDeleteCategoryModalOpen}
        onClose={() => setIsDeleteCategoryModalOpen(false)}
        onConfirm={confirmDeleteCategory}
        title="Hapus Kategori"
        description="Apakah Anda yakin ingin menghapus kategori ini? Tindakan ini tidak dapat dibatalkan."
        confirmText="Hapus"
        isDanger={true}
        isLoading={loading}
      />

      <ConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
        title="Keluar dari Akun"
        description="Apakah Anda yakin ingin keluar dari akun ini?"
        confirmText="Keluar"
        cancelText="Batal"
        isDanger={true}
        isLoading={isLoggingOut}
      />

      <Modal isOpen={isAddCategoryModalOpen} onClose={() => setIsAddCategoryModalOpen(false)}>
        <div className="flex max-h-[90dvh] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
          <div className="flex items-start justify-between gap-4 border-b border-gray-100 p-4 sm:p-6">
            <div className="min-w-0">
              <h2 className="text-xl font-bold text-[#151D48]">Tambah Kategori Baru</h2>
              <p className="text-sm text-gray-500 mt-1">
                Kategori {activeCatTab === "pendapatan" ? "Pendapatan" : "Pengeluaran"}
              </p>
            </div>
            <button 
              onClick={() => setIsAddCategoryModalOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <CloseIcon className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <div className="overflow-y-auto p-4 sm:p-6">
            <form id="category-form" onSubmit={handleCreateCategory}>
              <label className="block text-sm font-medium text-[#151D48] mb-1.5">Nama Kategori <span className="text-red-500">*</span></label>
              <Input 
                type="text" 
                required 
                placeholder="Contoh: ATK, Konsumsi, dll." 
                className="bg-[#F9FAFB] border-gray-200" 
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                autoFocus
              />
            </form>
          </div>
          <div className="flex shrink-0 flex-col-reverse gap-3 border-t border-gray-100 bg-gray-50 p-4 sm:flex-row sm:justify-end sm:p-6">
            <Button variant="outline" onClick={() => setIsAddCategoryModalOpen(false)} disabled={loading}>Batal</Button>
            <Button type="submit" form="category-form" disabled={loading} className="bg-[#5C67F2] hover:bg-[#4a55c2] text-white">
              {loading ? "Menyimpan..." : "Simpan Kategori"}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={isEditCategoryModalOpen} onClose={() => setIsEditCategoryModalOpen(false)}>
        <div className="flex max-h-[90dvh] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
          <div className="flex items-start justify-between gap-4 border-b border-gray-100 p-4 sm:p-6">
            <div>
              <h2 className="text-xl font-bold text-[#151D48]">Edit Kategori</h2>
            </div>
            <button 
              onClick={() => setIsEditCategoryModalOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <CloseIcon className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <div className="overflow-y-auto p-4 sm:p-6">
            <form id="edit-category-form" onSubmit={handleUpdateCategory}>
              <label className="block text-sm font-medium text-[#151D48] mb-1.5">Nama Kategori <span className="text-red-500">*</span></label>
              <Input 
                type="text" 
                required 
                className="bg-[#F9FAFB] border-gray-200" 
                value={editCategoryName}
                onChange={(e) => setEditCategoryName(e.target.value)}
                autoFocus
              />
            </form>
          </div>
          <div className="flex shrink-0 flex-col-reverse gap-3 border-t border-gray-100 bg-gray-50 p-4 sm:flex-row sm:justify-end sm:p-6">
            <Button variant="outline" onClick={() => setIsEditCategoryModalOpen(false)} disabled={loading}>Batal</Button>
            <Button type="submit" form="edit-category-form" disabled={loading} className="bg-[#5C67F2] hover:bg-[#4a55c2] text-white">
              {loading ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={isEditUserModalOpen} onClose={() => setIsEditUserModalOpen(false)}>
        <div className="flex max-h-[90dvh] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
          <div className="flex items-start justify-between gap-4 border-b border-gray-100 p-4 sm:p-6">
            <div>
              <h2 className="text-xl font-bold text-[#151D48]">Ubah Akses Pengguna</h2>
            </div>
            <button 
              onClick={() => setIsEditUserModalOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <CloseIcon className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <div className="overflow-y-auto p-4 sm:p-6">
            <form id="edit-user-form" onSubmit={handleUpdateUserRole}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-500">Nama Pengguna</label>
                <div className="font-semibold text-[#151D48]">{userToEdit?.name}</div>
                <div className="text-xs text-gray-500">{userToEdit?.email}</div>
              </div>
              <label className="block text-sm font-medium text-[#151D48] mb-1.5">Peran Akses <span className="text-red-500">*</span></label>
              <select 
                className="flex h-10 w-full rounded-xl border border-gray-200 bg-[#F9FAFB] px-3 py-2 text-sm text-gray-700 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5C67F2]/20"
                value={editUserRole}
                onChange={(e) => setEditUserRole(e.target.value)}
              >
                <option value="staff">Staff (Terbatas)</option>
                <option value="manager">Manager (Penuh)</option>
              </select>
            </form>
          </div>
          <div className="flex shrink-0 flex-col-reverse gap-3 border-t border-gray-100 bg-gray-50 p-4 sm:flex-row sm:justify-end sm:p-6">
            <Button variant="outline" onClick={() => setIsEditUserModalOpen(false)} disabled={loading}>Batal</Button>
            <Button type="submit" form="edit-user-form" disabled={loading} className="bg-[#5C67F2] hover:bg-[#4a55c2] text-white">
              {loading ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </div>
        </div>
      </Modal>
      
      <Modal isOpen={isAddUserModalOpen} onClose={() => setIsAddUserModalOpen(false)}>
        <div className="flex max-h-[90dvh] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
          <div className="flex items-start justify-between gap-4 border-b border-gray-100 p-4 sm:p-6">
            <div className="min-w-0">
              <h2 className="text-xl font-bold text-[#151D48]">Tambah Pengguna Baru</h2>
              <p className="text-sm text-gray-500 mt-1">Daftarkan staf atau manajer baru.</p>
            </div>
            <button 
              onClick={() => setIsAddUserModalOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <CloseIcon className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <div className="overflow-y-auto p-4 sm:p-6">
            <form id="add-user-form" onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#151D48] mb-1.5">Nama Lengkap <span className="text-red-500">*</span></label>
                <Input 
                  required 
                  className="bg-[#F9FAFB] border-gray-200" 
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="Contoh: Budi Santoso"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#151D48] mb-1.5">Email <span className="text-red-500">*</span></label>
                <Input 
                  type="email"
                  required 
                  className="bg-[#F9FAFB] border-gray-200" 
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="mail@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#151D48] mb-1.5">Password <span className="text-red-500">*</span></label>
                <Input 
                  type="password"
                  required 
                  className="bg-[#F9FAFB] border-gray-200" 
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  placeholder="Minimal 8 karakter"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#151D48] mb-1.5">Peran Akses <span className="text-red-500">*</span></label>
                <select 
                  className="flex h-10 w-full rounded-xl border border-gray-200 bg-[#F9FAFB] px-3 py-2 text-sm text-gray-700 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5C67F2]/20"
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value)}
                >
                  <option value="staff">Staff (Terbatas)</option>
                  <option value="manager">Manager (Penuh)</option>
                </select>
              </div>
            </form>
          </div>
          <div className="flex shrink-0 flex-col-reverse gap-3 border-t border-gray-100 bg-gray-50 p-4 sm:flex-row sm:justify-end sm:p-6">
            <Button variant="outline" onClick={() => setIsAddUserModalOpen(false)} disabled={loading}>Batal</Button>
            <Button type="submit" form="add-user-form" disabled={loading} className="bg-[#5C67F2] hover:bg-[#4a55c2] text-white">
              {loading ? "Menambahkan..." : "Tambah Pengguna"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
