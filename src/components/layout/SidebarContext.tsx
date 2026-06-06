"use client";

// Import React hook yang dipakai context sidebar yang mengatur buka/tutup menu kiri di desktop dan mobile, misalnya untuk state, efek setelah render, atau referensi elemen.
import React, { createContext, useContext, useEffect, useState } from "react";

// Interface ini menjelaskan field yang dipakai context sidebar yang mengatur buka/tutup menu kiri di desktop dan mobile supaya data form/database tidak salah bentuk.
interface SidebarContextType {
  isOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

// SidebarProvider menyimpan status sidebar terbuka/tertutup dan menyesuaikannya otomatis saat ukuran layar berubah.
export function SidebarProvider({ children }: { children: React.ReactNode }) {
  // isOpen menentukan apakah panel/dropdown/modal sedang terbuka di layar.
  const [isOpen, setIsOpen] = useState(false);

  // toggleSidebar membalik status sidebar: terbuka menjadi tertutup, tertutup menjadi terbuka.
  const toggleSidebar = () => setIsOpen((current) => !current);
  // closeSidebar menutup sidebar secara paksa, terutama setelah user memilih menu di mobile.
  const closeSidebar = () => setIsOpen(false);

  // Effect ini membaca ukuran layar: sidebar otomatis terbuka di desktop dan tertutup di mobile.
  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)");
    // handleChange adalah fungsi penangan aksi user; fungsi ini berjalan saat user mengklik, mengetik, memilih, atau submit sesuatu.
    const handleChange = () => setIsOpen(mediaQuery.matches);

    handleChange();
    mediaQuery.addEventListener("change", handleChange);

    // SidebarProvider menampilkan UI untuk context sidebar yang mengatur buka/tutup menu kiri di desktop dan mobile.
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // SidebarProvider menampilkan UI untuk context sidebar yang mengatur buka/tutup menu kiri di desktop dan mobile.
  return (
    <SidebarContext.Provider value={{ isOpen, toggleSidebar, closeSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
}

// useSidebar mengambil status sidebar dari SidebarProvider; kalau dipakai di luar provider, aplikasi diberi error jelas.
export function useSidebar() {
  const context = useContext(SidebarContext);
  // Kondisi if (context === undefined) membuat isi blok if di bawahnya hanya berjalan saat kondisi itu benar di SidebarContext.
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  // context mengembalikan nilai yang dibutuhkan oleh SidebarContext.
  return context;
}
