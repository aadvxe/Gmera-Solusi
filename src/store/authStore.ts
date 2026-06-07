// Import create dari Zustand untuk membuat store kecil yang menyimpan state global aplikasi.
import { create } from 'zustand';
// Import type User agar authStore tahu bentuk data akun yang dikirim Supabase Auth.
import { User } from '@supabase/supabase-js';

// Mock user profile data (used while Supabase is not yet connected)
export const MOCK_PROFILES: Record<string, { name: string; role: string; roleName: string }> = {
  "1": { name: "Ahmad Fauzi", role: "super_admin", roleName: "Super Admin" },
  "2": { name: "Sari Dewi", role: "finance_manager", roleName: "Finance" },
  "3": { name: "Budi Santoso", role: "accounting_staff", roleName: "Accounting Staff" },
  "4": { name: "Rina Melati", role: "sales_staff", roleName: "Sales Staff" },
  "5": { name: "Dani Kurniawan", role: "viewer", roleName: "Viewer" },
};

export const ROLE_LABELS: Record<string, string> = {
  super_admin: "Super Admin",
  finance_manager: "Finance",
  accounting_staff: "Accounting Staff",
  sales_staff: "Sales Staff",
  viewer: "Viewer",
};

// Interface ini menjelaskan field yang dipakai store Zustand untuk user login, role, nama tampilan, dan inisial supaya data form/database tidak salah bentuk.
interface AuthState {
  user: User | null;
  role: string | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setRole: (role: string | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  // Computed helpers
  getDisplayName: () => string;
  getRoleLabel: () => string;
  getInitials: () => string;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  role: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setRole: (role) => set({ role }),
  setIsLoading: (isLoading) => set({ isLoading }),

  getDisplayName: () => {
    const { user } = get();
    // Kalau belum ada akun Supabase yang login, hentikan proses yang membutuhkan profil user.
    if (!user) return "Guest";
    // From Supabase metadata (real auth)
    if (user.user_metadata?.full_name) return user.user_metadata.full_name;
    // From mock profile lookup
    const profile = MOCK_PROFILES[user.id];
    // Kondisi if (profile) return profile.name; membuat isi blok if di bawahnya hanya berjalan saat kondisi itu benar di authStore Zustand.
    if (profile) return profile.name;
    // Fallback to email prefix
    return user.email?.split('@')[0] || "Pengguna";
  },

  getRoleLabel: () => {
    const { user } = get();
    // Kalau belum ada akun Supabase yang login, hentikan proses yang membutuhkan profil user.
    if (!user) return "";
    const role = user.user_metadata?.role || "";
    // getRoleLabel mengembalikan nama role yang ramah dibaca, misalnya finance_manager menjadi Finance.
    return ROLE_LABELS[role] || role;
  },

  getInitials: () => {
    const { getDisplayName } = get();
    const name = getDisplayName();
    const parts = name.trim().split(" ");
    // Kondisi ini mengecek jumlah item agar daftar kosong, pagination, atau total bisa ditangani dengan benar.
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    // getInitials mengembalikan dua huruf pertama nama sebagai fallback avatar user.
    return name.substring(0, 2).toUpperCase();
  },
}));

