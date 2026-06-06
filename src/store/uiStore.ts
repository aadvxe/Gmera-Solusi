// Import create dari Zustand untuk membuat store kecil yang menyimpan state global aplikasi.
import { create } from 'zustand';

// Interface ini menjelaskan field yang dipakai store Zustand lama untuk status sidebar terbuka/tertutup supaya data form/database tidak salah bentuk.
interface UIState {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isSidebarOpen: true,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
}));
