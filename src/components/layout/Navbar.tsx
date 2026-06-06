"use client";

// Import React hook yang dipakai navbar yang menampilkan search, notifikasi realtime, profil, dan logout, misalnya untuk state, efek setelah render, atau referensi elemen.
import React, { useEffect, useState, useRef } from "react";
// Import alat navigasi Next.js supaya navbar yang menampilkan search, notifikasi realtime, profil, dan logout bisa pindah halaman atau membaca route aktif.
import { useRouter } from "next/navigation";
// Import Link supaya menu/tombol di navbar yang menampilkan search, notifikasi realtime, profil, dan logout bisa berpindah halaman tanpa reload penuh.
import Link from "next/link";
// Import ikon yang dipakai navbar yang menampilkan search, notifikasi realtime, profil, dan logout untuk memperjelas tombol, menu, status, dan aksi di layar.
import { NotificationIcon, ChevronDownIcon, Profile1Icon, SettingsIcon, Logout2Icon, StatusUpIcon, ArrowDownIcon, DocumentIcon, PricingAlertIcon, CalenderIcon, DocumentDownloadIcon, Download2Icon, CloseIcon as CloseCircleIcon, MenuIcon } from "@astraicons/react/bold";
// Import authStore supaya navbar yang menampilkan search, notifikasi realtime, profil, dan logout bisa membaca user login, role, nama tampilan, atau mengosongkan session saat logout.
import { useAuthStore } from "@/store/authStore";
// Import helper database yang dipakai navbar yang menampilkan search, notifikasi realtime, profil, dan logout untuk mengambil atau menyimpan data Supabase.
import { getRecentActivities } from "@/lib/db";
// Import createClient untuk membuka koneksi Supabase dari browser saat navbar yang menampilkan search, notifikasi realtime, profil, dan logout perlu membaca/menyimpan data.
import { createClient } from "@/utils/supabase/client";
// Import komponen UI reusable supaya navbar yang menampilkan search, notifikasi realtime, profil, dan logout memakai tampilan tombol, modal, input, atau tabel yang konsisten.
import { Modal } from "@/components/ui/Modal";
// Import komponen UI reusable supaya navbar yang menampilkan search, notifikasi realtime, profil, dan logout memakai tampilan tombol, modal, input, atau tabel yang konsisten.
import { ConfirmModal } from "@/components/ui/ConfirmModal";
// Import context sidebar supaya navbar yang menampilkan search, notifikasi realtime, profil, dan logout bisa membuka, menutup, atau membaca status menu kiri.
import { useSidebar } from "./SidebarContext";
// Import komponen UI reusable supaya navbar yang menampilkan search, notifikasi realtime, profil, dan logout memakai tampilan tombol, modal, input, atau tabel yang konsisten.
import { SearchDropdown } from "@/components/ui/SearchDropdown";

// Navbar menampilkan pencarian, notifikasi realtime, profil user, modal semua notifikasi, dan tombol logout.
export function Navbar() {
  // greeting menyimpan nilai greeting yang berubah saat user berinteraksi dengan navbar yang menampilkan search, notifikasi realtime, profil, dan logout.
  const [greeting, setGreeting] = useState("Selamat Pagi");
  // isNotifOpen menentukan apakah dropdown notifikasi sedang terbuka.
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  // isProfileOpen menentukan apakah dropdown profil user sedang terbuka.
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  // isMobileSearchOpen menentukan apakah panel search mobile sedang terbuka.
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  // isLogoutModalOpen menentukan apakah modal konfirmasi logout sedang tampil.
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  // isLoggingOut menandai proses logout sedang berjalan agar tombol tidak diklik berkali-kali.
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  // isSeeAllOpen menentukan apakah modal semua notifikasi sedang dibuka.
  const [isSeeAllOpen, setIsSeeAllOpen] = useState(false);
  const [allNotifications, setAllNotifications] = useState<any[]>([]);
  // triggerReappear memicu animasi kecil pada reminder yang tetap muncul setelah notifikasi ditandai dibaca.
  const [triggerReappear, setTriggerReappear] = useState(false);
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

  // Effect ini mengambil notifikasi awal lalu berlangganan perubahan Supabase agar ikon lonceng update otomatis.
  useEffect(() => {
    // fetchNotifications mengambil data yang dibutuhkan navbar yang menampilkan search, notifikasi realtime, profil, dan logout dari Supabase lalu mengisi state halaman.
    const fetchNotifications = async () => {
      // try ini menjalankan operasi utama fetchNotifications yang berhubungan dengan Supabase, upload, export, atau update state.
      try {
        // await menunggu proses async selesai sebelum Navbar melanjutkan langkah berikutnya.
        const activities = await getRecentActivities(30);
        
        // Use localStorage as the single source of truth for cleared time
        const lastCleared = localStorage.getItem('last_cleared_notifications');
        
        let filtered = activities;
        // Kondisi if (!isAdmin) membuat isi blok if di bawahnya hanya berjalan saat kondisi itu benar di Navbar.
        if (!isAdmin) {
          // filter ini menyisakan data Navbar yang cocok dengan pencarian, status, role, atau tanggal aktif.
          filtered = filtered.filter(a => a.type !== 'system');
        }
        
        setAllNotifications(filtered);
        
        // Kondisi if (lastCleared) membuat isi blok if di bawahnya hanya berjalan saat kondisi itu benar di Navbar.
        if (lastCleared) {
          const clearedTime = new Date(lastCleared).getTime();
          // filter ini menyisakan data Navbar yang cocok dengan pencarian, status, role, atau tanggal aktif.
          const newOnly = filtered.filter(a => a.type === 'reminder' || new Date(a.date).getTime() > clearedTime);
          setNotifications(newOnly.slice(0, 5));
        } else {
          setNotifications(filtered.slice(0, 5));
        }
      } catch (error) {
        console.error("fetchNotifications error:", error);
      }
    };

    fetchNotifications();

    // handleRefresh adalah fungsi penangan aksi user; fungsi ini berjalan saat user mengklik, mengetik, memilih, atau submit sesuatu.
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
        { event: '*', schema: 'public', table: 'invoices' },
        () => fetchNotifications()
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'audit_logs' },
        () => fetchNotifications()
      )
      .subscribe();
    
    // fetchNotifications menampilkan UI untuk navbar yang menampilkan search, notifikasi realtime, profil, dan logout.
    return () => {
      window.removeEventListener('refreshNotifications', handleRefresh);
      supabase.removeChannel(channel);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasPrivilege, role]);

  // clearNotifications menandai notifikasi navbar sebagai sudah dibaca lalu mengosongkan badge lonceng.
  const clearNotifications = async () => {
    const now = new Date().toISOString();
    localStorage.setItem('last_cleared_notifications', now);
    
    // Filter out standard notifications but keep reminders in local state
    setNotifications(prev => prev.filter(n => n.type === 'reminder'));
    
    // Trigger scoped bounce animation on remaining reminder items
    setTriggerReappear(true);
    setTimeout(() => setTriggerReappear(false), 600);
    
    // Fire-and-forget Supabase sync — don't update global store to prevent
    // cascading re-renders into Sidebar and other components
    const supabase = createClient();
    supabase.auth.updateUser({
      data: { last_notifications_cleared_at: now }
    }).catch(err => console.error('Failed to sync cleared time:', err));
  };

  // Effect ini menutup dropdown/modal kecil ketika user klik area di luar komponennya.
  useEffect(() => {
    const hour = new Date().getHours();
    // Kalau jam lokal masih pagi, sapaan dashboard/navbar diatur ke Selamat Pagi.
    if (hour >= 5 && hour < 12) setGreeting("Selamat Pagi");
    // Kalau jam lokal masuk siang, sapaan dashboard/navbar diatur ke Selamat Siang.
    else if (hour >= 12 && hour < 15) setGreeting("Selamat Siang");
    // Kalau jam lokal masuk sore, sapaan dashboard/navbar diatur ke Selamat Sore.
    else if (hour >= 15 && hour < 19) setGreeting("Selamat Sore");
    // Kondisi else setGreeting("Selamat Malam"); membuat isi blok if di bawahnya hanya berjalan saat kondisi itu benar di Navbar.
    else setGreeting("Selamat Malam");
  }, []);

  // Effect ini menutup dropdown/modal kecil ketika user klik area di luar komponennya.
  useEffect(() => {
    // handleClickOutside berjalan saat user klik area luar komponen; jika kliknya di luar, dropdown atau kalender akan ditutup.
    function handleClickOutside(event: MouseEvent) {
      // Kondisi if (notifRef.current && !notifRef.current.contains(event.target as Node)) setIsNotifOpen(false); membuat isi blok if di bawahnya hanya berjalan saat kondisi itu benar di Navbar.
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) setIsNotifOpen(false);
      // Kondisi if (profileRef.current && !profileRef.current.contains(event.target as Node)) setIsProfileOpen(false); membuat isi blok if di bawahnya hanya berjalan saat kondisi itu benar di Navbar.
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) setIsProfileOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    // clearNotifications menampilkan UI untuk navbar yang menampilkan search, notifikasi realtime, profil, dan logout.
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // handleLogout menangani aksi user di navbar yang menampilkan search, notifikasi realtime, profil, dan logout, seperti klik tombol, submit form, atau perubahan input.
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



  // handleLogout menampilkan UI untuk navbar yang menampilkan search, notifikasi realtime, profil, dan logout.
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

      {/* Middle Search Bar (Desktop) */}
      <div className="mx-8 hidden max-w-lg flex-1 lg:block">
        <SearchDropdown />
      </div>

      {/* Right Actions */}
      <div className="flex min-w-0 items-center gap-3 sm:gap-6">

        {/* Mobile Search Toggle */}
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
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
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
              <div data-notif-panel className="fixed left-4 right-4 top-16 z-50 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] animate-in fade-in zoom-in-95 duration-200 sm:absolute sm:left-auto sm:right-0 sm:top-auto sm:mt-3 sm:w-80">
                <style dangerouslySetInnerHTML={{ __html: `
                  @keyframes _notif-bounce {
                    0%   { transform: scale(1);    opacity: 1; }
                    28%  { transform: scale(0.91); opacity: 0.65; }
                    62%  { transform: scale(1.05); opacity: 1; }
                    82%  { transform: scale(0.97); }
                    100% { transform: scale(1);    opacity: 1; }
                  }
                  [data-notif-panel] [data-reminder-bounce] {
                    animation: _notif-bounce 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
                    will-change: transform;
                    isolation: isolate;
                  }
                `}} />
                <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                  <h3 className="font-bold text-[#151D48]">Notifikasi</h3>
                  {notifications.length > 0 && (
                    <button onClick={clearNotifications} className="text-xs font-semibold text-[#5C67F2] hover:text-[#4a55c2] hover:underline transition-colors">Tandai dibaca</button>
                  )}
                </div>
                <div className="max-h-[300px] overflow-y-auto scrollbar-none">
                  {notifications.length > 0 ? (
                    // map ini membuat baris notifikasi dari aktivitas terbaru yang masuk ke navbar.
                    notifications.map((n: any) => (
                      <div 
                        key={n.id} 
                        className="relative p-4 border-b border-gray-50 hover:bg-[#5C67F2]/5 cursor-pointer transition-colors group flex items-start gap-3"
                        {...(triggerReappear && n.type === 'reminder' ? { 'data-reminder-bounce': '' } : {})}
                      >
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

    {/* Mobile Search Overlay */}
    {isMobileSearchOpen && (
      <>
        {/* Blur backdrop */}
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileSearchOpen(false)}
        />
        {/* Search panel */}
        <div className="fixed left-0 right-0 top-0 z-50 lg:hidden">
          <div className="mx-4 mt-4 rounded-2xl border border-white/30 bg-white/95 backdrop-blur-2xl shadow-[0_16px_48px_rgba(0,0,0,0.18)] p-3">
            <div className="flex items-center gap-2 mb-3">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 flex-1 pl-1">Pencarian</p>
              <button
                type="button"
                onClick={() => setIsMobileSearchOpen(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
              >
                <CloseCircleIcon className="w-4 h-4" />
              </button>
            </div>
            <SearchDropdown
              mobile
              autoFocus
              onCloseMobile={() => setIsMobileSearchOpen(false)}
            />
          </div>
        </div>
      </>
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
              // map ini membuat satu output untuk setiap item daftar yang sedang dirender oleh Navbar.
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
