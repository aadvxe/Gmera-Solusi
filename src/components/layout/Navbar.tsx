"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { NotificationIcon, ChevronDownIcon, Profile1Icon, SettingsIcon, Logout2Icon, StatusUpIcon, ArrowDownIcon, DocumentIcon, PricingAlertIcon, CalenderIcon, DocumentDownloadIcon, Download2Icon, CloseIcon as CloseCircleIcon, MenuIcon } from "@astraicons/react/bold";
import { SearchIcon } from "@astraicons/react/linear";
import { useAuthStore } from "@/store/authStore";
import { getRecentActivities } from "@/lib/db";
import { createClient } from "@/utils/supabase/client";
import { Modal } from "@/components/ui/Modal";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { useSidebar } from "./SidebarContext";

export function Navbar() {
  const [greeting, setGreeting] = useState("Selamat Pagi");
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isSeeAllOpen, setIsSeeAllOpen] = useState(false);
  const [allNotifications, setAllNotifications] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { toggleSidebar } = useSidebar();

  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const setRole = useAuthStore((state) => state.setRole);
  const getDisplayName = useAuthStore((state) => state.getDisplayName);
  const getRoleLabel = useAuthStore((state) => state.getRoleLabel);
  const getInitials = useAuthStore((state) => state.getInitials);
  const role = useAuthStore((state) => state.role);

  const displayName = getDisplayName();
  const roleLabel = getRoleLabel();
  const initials = getInitials();
  
  const isAdmin = role === 'super_admin';
  const hasPrivilege = role === 'super_admin' || role === 'finance_manager';

  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const activities = await getRecentActivities(30);
        
        // Sync cleared time
        const localCleared = localStorage.getItem('last_cleared_notifications');
        const remoteCleared = user?.user_metadata?.last_notifications_cleared_at;
        const lastCleared = remoteCleared || localCleared;
        
        let filtered = activities;
        if (!isAdmin) {
          filtered = filtered.filter(a => a.type !== 'system');
        }
        
        setAllNotifications(filtered);
        
        if (lastCleared) {
          const clearedTime = new Date(lastCleared).getTime();
          const newOnly = filtered.filter(a => new Date(a.date).getTime() > clearedTime);
          setNotifications(newOnly.slice(0, 5));
        } else {
          setNotifications(filtered.slice(0, 5));
        }
      } catch (error) {
        console.error("fetchNotifications error:", error);
      }
    };

    fetchNotifications();

    const handleRefresh = () => fetchNotifications();
    window.addEventListener('refreshNotifications', handleRefresh);
    
    // Subscribe to real-time changes in relevant tables
    const supabase = createClient();
    const channel = supabase
      .channel('notifications-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'income' },
        () => fetchNotifications()
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'expense' },
        () => fetchNotifications()
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'invoices' },
        () => fetchNotifications()
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'audit_logs' },
        () => fetchNotifications()
      )
      .subscribe();
    
    return () => {
      window.removeEventListener('refreshNotifications', handleRefresh);
      supabase.removeChannel(channel);
    };
  }, [hasPrivilege, role, user?.user_metadata?.last_notifications_cleared_at]);

  const clearNotifications = async () => {
    const now = new Date().toISOString();
    
    // Update local state for immediate feedback
    setNotifications([]);
    localStorage.setItem('last_cleared_notifications', now);
    
    // Sync to Supabase user_metadata for cross-device persistence
    const supabase = createClient();
    const { data: { user: updatedUser }, error } = await supabase.auth.updateUser({
      data: { last_notifications_cleared_at: now }
    });
    
    if (!error && updatedUser) {
      setUser(updatedUser); // Update global auth store
    }
  };

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) setGreeting("Selamat Pagi");
    else if (hour >= 12 && hour < 15) setGreeting("Selamat Siang");
    else if (hour >= 15 && hour < 19) setGreeting("Selamat Sore");
    else setGreeting("Selamat Malam");
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) setIsNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) setIsProfileOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    document.cookie = "mock_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    setUser(null);
    setRole(null);
    router.push("/login");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/pencarian?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setIsMobileSearchOpen(false);
    }
  };

  return (
    <>
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between gap-3 bg-white px-4 sm:h-20 sm:px-6">

      {/* Mobile Menu */}
      <div className="flex items-center lg:hidden">
        <button
          type="button"
          aria-label="Buka menu"
          onClick={toggleSidebar}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-600 transition-colors hover:bg-gray-200"
        >
          <MenuIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Middle Search Bar */}
      <div className="mx-8 hidden max-w-lg flex-1 lg:block">
        <form onSubmit={handleSearch} className="relative">
          <SearchIcon className="w-[18px] h-[18px] absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari transaksi atau customer..."
            className="w-full bg-[#F9FAFB] rounded-xl h-12 pl-12 pr-4 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#5C67F2]/20 transition-all"
          />
        </form>
      </div>

      {/* Right Actions */}
      <div className="flex min-w-0 items-center gap-3 sm:gap-6">

        {/* Mobile Search */}
        <button
          type="button"
          aria-label="Buka pencarian"
          onClick={() => {
            setIsMobileSearchOpen((open) => !open);
            setIsNotifOpen(false);
            setIsProfileOpen(false);
          }}
          className={`flex h-11 w-11 items-center justify-center rounded-xl transition-colors lg:hidden ${
            isMobileSearchOpen ? "bg-[#5C67F2] text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
          }`}
        >
          <SearchIcon className="h-5 w-5" />
        </button>

        {/* Notifications (Visible to all, contents filtered by role) */}
        <div className="relative" ref={notifRef}>
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className={`relative p-3 rounded-xl transition-colors ${notifications.length > 0 ? 'bg-[#FFF4E5] text-[#FF9F43] hover:bg-[#FFE5C2]' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
            >
              <NotificationIcon className="w-5 h-5" />
              {notifications.length > 0 && (
                <span className="absolute top-2.5 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
              )}
            </button>

            {isNotifOpen && (
              <div className="fixed left-4 right-4 top-16 z-50 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] animate-in fade-in zoom-in-95 duration-200 sm:absolute sm:left-auto sm:right-0 sm:top-auto sm:mt-3 sm:w-80">
                <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                  <h3 className="font-bold text-[#151D48]">Notifikasi</h3>
                  {notifications.length > 0 && (
                    <button onClick={clearNotifications} className="text-xs font-semibold text-[#5C67F2] hover:text-[#4a55c2] hover:underline transition-colors">Tandai dibaca</button>
                  )}
                </div>
                <div className="max-h-[300px] overflow-y-auto scrollbar-none">
                  {notifications.length > 0 ? (
                    notifications.map((n: any) => (
                      <div key={n.id} className="relative p-4 border-b border-gray-50 hover:bg-[#5C67F2]/5 cursor-pointer transition-colors group flex items-start gap-3">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#5C67F2] rounded-r-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center ${
                          n.type === 'income' ? 'bg-[#76c893]/10 text-[#76c893]' :
                          n.type === 'expense' ? 'bg-[#f08a5d]/10 text-[#f08a5d]' :
                          n.type === 'system' ? 'bg-[#FF9F43]/10 text-[#FF9F43]' :
                          n.type === 'reminder' ? 'bg-[#FF9F43]/10 text-[#FF9F43]' :
                          n.type === 'export' ? 'bg-[#5C67F2]/10 text-[#5C67F2]' :
                          'bg-[#5C67F2]/10 text-[#5C67F2]'
                        }`}>
                          {n.type === 'income' && <StatusUpIcon className="w-5 h-5" />}
                          {n.type === 'expense' && <ArrowDownIcon className="w-5 h-5" />}
                          {n.type === 'invoice' && <DocumentIcon className="w-5 h-5" />}
                          {n.type === 'system' && <SettingsIcon className="w-5 h-5" />}
                          {n.type === 'reminder' && <CalenderIcon className="w-5 h-5" />}
                          {n.type === 'export' && <ArrowDownIcon className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#151D48] mb-0.5 group-hover:text-[#5C67F2] transition-colors line-clamp-1">{n.title}</p>
                          <p className="text-xs text-gray-500 mb-1 line-clamp-1">{n.desc}</p>
                          <p className="text-[10px] font-medium text-gray-400">{new Date(n.date).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-gray-500 text-sm flex flex-col items-center gap-3">
                      <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center">
                        <NotificationIcon className="w-5 h-5 text-gray-400" />
                      </div>
                      <span className="font-medium">Belum ada notifikasi baru.</span>
                    </div>
                  )}
                </div>
                <div 
                  className="p-3 bg-gray-50/80 text-center border-t border-gray-100 hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => {
                    setIsNotifOpen(false);
                    setIsSeeAllOpen(true);
                  }}
                >
                  <button className="text-sm font-semibold text-[#151D48] hover:text-[#5C67F2] transition-colors">Lihat Semua</button>
                </div>
              </div>
            )}
          </div>

        {/* Profile */}
        <div className="relative" ref={profileRef}>
          <div
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-3 cursor-pointer select-none group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#5C67F2]/10 text-[#5C67F2] flex items-center justify-center font-bold text-sm group-hover:bg-[#5C67F2]/20 transition-colors">
              {initials}
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-bold text-[#151D48] group-hover:text-[#5C67F2] transition-colors leading-tight">{displayName}</p>
              <p className="text-xs font-medium text-gray-500">{roleLabel}</p>
            </div>
            <ChevronDownIcon className={`w-4 h-4 text-gray-400 hidden sm:block transition-transform ${isProfileOpen ? 'rotate-180 text-[#5C67F2]' : ''}`} />
          </div>

          {/* Profile Dropdown */}
          {isProfileOpen && (
            <div className="absolute right-0 z-50 mt-3 w-[calc(100vw-2rem)] max-w-56 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] animate-in fade-in zoom-in-95 duration-200">
              <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                <p className="text-sm font-bold text-[#151D48]">{displayName}</p>
                <p className="text-xs font-medium text-gray-500 mt-0.5">{roleLabel}</p>
                <p className="text-xs text-gray-400 mt-0.5 truncate">{user?.email}</p>
              </div>
              <ul className="py-2">
                <li>
                  <Link
                    href="/profil"
                    onClick={() => setIsProfileOpen(false)}
                    className="w-full flex items-center gap-3 px-5 py-3 text-sm font-semibold text-gray-600 hover:bg-[#5C67F2]/5 hover:text-[#5C67F2] transition-colors relative group"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#5C67F2] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <Profile1Icon className="w-[18px] h-[18px] text-gray-400 group-hover:text-[#5C67F2] transition-colors" /> Profil Saya
                  </Link>
                </li>

                <li className="my-1 border-t border-gray-100"></li>
                <li>
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      setIsLogoutModalOpen(true);
                    }}
                    className="w-full flex items-center gap-3 px-5 py-3 text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors relative group"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <Logout2Icon className="w-[18px] h-[18px] text-red-400 group-hover:text-red-500 transition-colors" /> Keluar
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>

      </div>
    </header>

    {isMobileSearchOpen && (
      <div className="fixed left-4 right-4 top-16 z-50 sm:top-20 lg:hidden">
        <form
          onSubmit={handleSearch}
          className="flex gap-2 rounded-2xl border border-gray-100 bg-white p-2 shadow-[0_8px_30px_rgb(0,0,0,0.12)]"
        >
          <div className="relative min-w-0 flex-1">
            <SearchIcon className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari transaksi atau customer..."
              className="h-11 w-full rounded-xl bg-[#F9FAFB] pl-10 pr-3 text-sm text-gray-700 outline-none transition-all focus:ring-2 focus:ring-[#5C67F2]/20"
              autoFocus
            />
          </div>
          <button
            type="submit"
            className="flex h-11 shrink-0 items-center justify-center rounded-xl bg-[#5C67F2] px-4 text-sm font-semibold text-white"
          >
            Cari
          </button>
        </form>
      </div>
    )}

    {/* See All Notifications Modal */}
    <Modal isOpen={isSeeAllOpen} onClose={() => setIsSeeAllOpen(false)}>
      <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] w-full max-w-2xl overflow-hidden flex flex-col max-h-[90dvh]">
        <div className="flex items-start justify-between gap-4 p-4 sm:p-6 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-[#151D48]">Semua Notifikasi</h2>
            <p className="text-sm text-gray-500 mt-1">Riwayat lengkap aktivitas dan transaksi.</p>
          </div>
          <button 
            onClick={() => setIsSeeAllOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <CloseCircleIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        <div className="overflow-y-auto flex-1">
          <div className="p-4 sm:p-6 space-y-6">
            {allNotifications.length > 0 ? (
              allNotifications.map((n: any, idx, arr) => (
                <div key={`${n.id}-${idx}`} className="flex gap-4 relative">
                  {/* Timeline Line */}
                  {idx !== arr.length - 1 && (
                    <div className="absolute left-5 top-10 bottom-[-24px] w-0.5 bg-gray-100"></div>
                  )}
                  
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 z-10 ${
                    n.type === 'income' ? 'bg-[#76c893]/10 text-[#76c893]' :
                    n.type === 'expense' ? 'bg-[#f08a5d]/10 text-[#f08a5d]' :
                    n.type === 'system' ? 'bg-[#FF9F43]/10 text-[#FF9F43]' :
                    n.type === 'reminder' ? 'bg-[#FF9F43]/10 text-[#FF9F43]' :
                    n.type === 'export' ? 'bg-[#5C67F2]/10 text-[#5C67F2]' :
                    'bg-[#5C67F2]/10 text-[#5C67F2]'
                  }`}>
                    {n.type === 'income' ? <StatusUpIcon className="w-[18px] h-[18px]" /> : 
                     n.type === 'expense' ? <ArrowDownIcon className="w-[18px] h-[18px]" /> : 
                     n.type === 'system' ? <SettingsIcon className="w-[18px] h-[18px]" /> :
                     n.type === 'reminder' ? <CalenderIcon className="w-[18px] h-[18px]" /> :
                     n.type === 'export' ? <ArrowDownIcon className="w-[18px] h-[18px]" /> :
                     <DocumentIcon className="w-[18px] h-[18px]" />}
                  </div>
                  
                  <div className="flex-1 pb-1">
                    <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:items-start mb-1">
                      <h4 className="font-semibold text-[#151D48] text-sm">{n.title}</h4>
                      <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                        {new Date(n.date).toLocaleString('id-ID', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">{n.desc}</p>
                    {n.amount && (
                      <p className="text-sm font-bold text-[#151D48] mt-1">
                        Rp {new Intl.NumberFormat('id-ID').format(n.amount)}
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                  <NotificationIcon className="w-8 h-8 text-gray-200" />
                </div>
                <p className="text-gray-400 font-medium">Tidak ada riwayat notifikasi.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
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
