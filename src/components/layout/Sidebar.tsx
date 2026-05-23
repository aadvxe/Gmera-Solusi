"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSidebar } from "./SidebarContext";
import { useAuthStore } from "@/store/authStore";
import { 
  HomeIcon,
  WalletIcon,
  DocumentIcon,
  Document1Icon,
  ChartIcon,
  GroupIcon,
  SettingsIcon,
  Logout2Icon
} from "@astraicons/react/bold";
import { ChevronLeftIcon } from "@astraicons/react/linear";
import { createClient } from "@/utils/supabase/client";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

const NAV_ITEMS = [
  { icon: HomeIcon, label: "Dashboard", href: "/beranda", roles: ["super_admin", "finance_manager", "accounting_staff", "sales_staff", "viewer"] },
  { icon: WalletIcon, label: "Pendapatan", href: "/pendapatan", roles: ["super_admin", "finance_manager", "accounting_staff", "sales_staff", "viewer"] },
  { icon: DocumentIcon, label: "Pengeluaran", href: "/pengeluaran", roles: ["super_admin", "finance_manager", "accounting_staff", "viewer"] },
  { icon: Document1Icon, label: "E-Invoice", href: "/e-invoice", roles: ["super_admin", "finance_manager", "accounting_staff", "sales_staff", "viewer"] },
  { icon: ChartIcon, label: "Laporan", href: "/laporan", roles: ["super_admin", "finance_manager", "accounting_staff", "viewer"] },
  { icon: GroupIcon, label: "Customer", href: "/customer", roles: ["super_admin", "finance_manager", "accounting_staff", "sales_staff"] },
];

export function Sidebar() {
  const { isOpen, toggleSidebar, closeSidebar } = useSidebar();
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const setRole = useAuthStore((state) => state.setRole);
  const role: string = user?.user_metadata?.role || "viewer";
  const [isLogoutModalOpen, setIsLogoutModalOpen] = React.useState(false);
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    document.cookie = "mock_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    setUser(null);
    setRole(null);
    router.push("/login");
  };

  const filteredNavItems = NAV_ITEMS.filter(item => item.roles.includes(role));
  const closeOnMobile = () => {
    if (window.innerWidth < 1024) closeSidebar();
  };

  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Tutup menu"
          onClick={closeSidebar}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px] lg:hidden"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-dvh w-[250px] shrink-0 flex-col overflow-x-hidden border-r border-border bg-white transition-all duration-300 lg:sticky lg:top-0 lg:h-screen ${
          isOpen ? "translate-x-0 lg:w-[250px]" : "-translate-x-full lg:w-[72px] lg:translate-x-0"
        }`}
      >
      <div className="h-20 flex items-center px-4 justify-between shrink-0">
        {isOpen && (
          <div className="flex-1 flex justify-center ml-9 transition-all duration-300">
            <div className="flex items-center text-xl text-[#151D48] tracking-tight">
              <span className="font-bold">GMERA</span>
              <span className="font-normal">Solusi</span>
            </div>
          </div>
        )}
        
        <button 
          onClick={toggleSidebar}
          className={`p-2 rounded-lg hover:bg-gray-100 text-gray-500 shrink-0 transition-all duration-300 ${!isOpen ? "mx-auto" : ""}`}
        >
          <ChevronLeftIcon className={`w-5 h-5 shrink-0 transition-transform duration-300 ${!isOpen ? "rotate-180" : ""}`} />
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-4 space-y-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {filteredNavItems.map((item) => {
          const isActive = pathname === item.href || (pathname === '/' && item.href === '/beranda');
          const Icon = item.icon;
          
          return (
            <Link 
              key={item.href} 
              href={item.href}
              onClick={closeOnMobile}
              className={`flex items-center h-12 px-4 rounded-2xl transition-all relative group ${
                isOpen ? "justify-start" : "justify-center"
              } ${
                isActive 
                  ? "bg-[#5C67F2] text-white font-medium shadow-sm" 
                  : "text-[#737791] hover:bg-gray-50 hover:text-[#5C67F2]"
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {isOpen && (
                <span className="ml-4 whitespace-nowrap opacity-100 w-auto transition-all duration-300">
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Bottom Menu */}
      <div className="p-4 space-y-2 shrink-0 mb-4">
        {["super_admin", "finance_manager"].includes(role) && (
          <Link 
            href="/pengaturan"
            onClick={closeOnMobile}
            className={`flex items-center h-12 px-4 rounded-2xl transition-all relative group ${
              isOpen ? "justify-start" : "justify-center"
            } ${
              pathname === "/pengaturan" 
                ? "bg-[#5C67F2] text-white font-medium shadow-sm" 
                : "text-[#737791] hover:bg-gray-50 hover:text-[#5C67F2]"
            }`}
          >
            <SettingsIcon className="w-5 h-5 shrink-0" />
            {isOpen && <span className="ml-4 whitespace-nowrap opacity-100 w-auto transition-all duration-300">Pengaturan</span>}
          </Link>
        )}
        <button 
          onClick={() => setIsLogoutModalOpen(true)}
          className={`w-full flex items-center h-12 px-4 rounded-2xl transition-all text-[#737791] hover:bg-red-50 hover:text-red-500 ${
            isOpen ? "justify-start" : "justify-center"
          }`}
        >
          <Logout2Icon className="w-5 h-5 shrink-0" />
          {isOpen && <span className="ml-4 whitespace-nowrap opacity-100 w-auto transition-all duration-300">Keluar</span>}
        </button>
      </div>
      </aside>
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
    </>
  );
}
