import { create } from 'zustand';
import { User } from '@supabase/supabase-js';

// Mock user profile data (used while Supabase is not yet connected)
export const MOCK_PROFILES: Record<string, { name: string; role: string; roleName: string }> = {
  "1": { name: "Ahmad Fauzi", role: "super_admin", roleName: "Super Admin" },
  "2": { name: "Sari Dewi", role: "finance_manager", roleName: "Finance Manager" },
  "3": { name: "Budi Santoso", role: "accounting_staff", roleName: "Accounting Staff" },
  "4": { name: "Rina Melati", role: "sales_staff", roleName: "Sales Staff" },
  "5": { name: "Dani Kurniawan", role: "viewer", roleName: "Viewer" },
};

export const ROLE_LABELS: Record<string, string> = {
  super_admin: "Super Admin",
  finance_manager: "Finance Manager",
  accounting_staff: "Accounting Staff",
  sales_staff: "Sales Staff",
  viewer: "Viewer",
};

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
    if (!user) return "Guest";
    // From Supabase metadata (real auth)
    if (user.user_metadata?.full_name) return user.user_metadata.full_name;
    // From mock profile lookup
    const profile = MOCK_PROFILES[user.id];
    if (profile) return profile.name;
    // Fallback to email prefix
    return user.email?.split('@')[0] || "Pengguna";
  },

  getRoleLabel: () => {
    const { user } = get();
    if (!user) return "";
    const role = user.user_metadata?.role || "";
    return ROLE_LABELS[role] || role;
  },

  getInitials: () => {
    const { getDisplayName } = get();
    const name = getDisplayName();
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  },
}));

