// Import React hook yang dipakai layout dashboard yang membungkus semua halaman dengan auth, sidebar, dan navbar, misalnya untuk state, efek setelah render, atau referensi elemen.
import React from "react";
// import layout dipakai untuk menyusun kerangka dashboard seperti sidebar dan navbar.
import { SidebarProvider } from "@/components/layout/SidebarContext";
// import layout dipakai untuk menyusun kerangka dashboard seperti sidebar dan navbar.
import { Sidebar } from "@/components/layout/Sidebar";
// import layout dipakai untuk menyusun kerangka dashboard seperti sidebar dan navbar.
import { Navbar } from "@/components/layout/Navbar";
// Import AuthProvider agar layout dashboard bisa membaca session Supabase dan mengisi authStore sebelum halaman dipakai.
import { AuthProvider } from "@/components/AuthProvider";
// Import AuthGate agar layout dashboard bisa menahan isi halaman sampai user login valid.
import { AuthGate } from "@/components/AuthGate";

// DashboardLayout menyusun kerangka dashboard: AuthProvider membaca session, AuthGate mengecek akses login, lalu sidebar, navbar, dan isi halaman ditampilkan.
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // DashboardLayout menampilkan UI untuk layout dashboard yang membungkus semua halaman dengan auth, sidebar, dan navbar.
  return (
    <AuthProvider>
      <AuthGate>
        <SidebarProvider>
          <div className="flex min-h-screen bg-[#f8f9fa] font-sans">
            <Sidebar />
            <div className="flex-1 flex flex-col min-h-0 min-w-0">
              <Navbar />
              <main className="flex-1 overflow-x-hidden p-4 sm:p-6 md:p-8">
                {children}
              </main>
            </div>
          </div>
        </SidebarProvider>
      </AuthGate>
    </AuthProvider>
  );
}
