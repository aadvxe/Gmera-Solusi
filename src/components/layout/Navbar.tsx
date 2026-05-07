"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { NotificationIcon, ChevronDownIcon, Profile1Icon, SettingsIcon, Logout2Icon, StatusUpIcon, ArrowDownIcon, DocumentIcon } from "@astraicons/react/bold";
import { SearchIcon } from "@astraicons/react/linear";
import { useAuthStore } from "@/store/authStore";
import { getRecentActivities } from "@/lib/db";

export function Navbar() {
  const [greeting, setGreeting] = useState("Selamat Pagi");
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const getDisplayName = useAuthStore((state) => state.getDisplayName);
  const getRoleLabel = useAuthStore((state) => state.getRoleLabel);
  const getInitials = useAuthStore((state) => state.getInitials);

  const displayName = getDisplayName();
  const roleLabel = getRoleLabel();
  const initials = getInitials();

  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      const activities = await getRecentActivities(5);
      setNotifications(activities);
    };
    fetchNotifications();
  }, []);

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

  const handleLogout = () => {
    document.cookie = "mock_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    setUser(null);
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-40 bg-white h-20 px-6 flex items-center justify-between shrink-0">

      {/* Left Spacer / Empty Title */}
      <div className="hidden md:block">
      </div>

      {/* Middle Search Bar */}
      <div className="flex-1 max-w-lg mx-8 hidden lg:block">
        <div className="relative">
          <SearchIcon className="w-[18px] h-[18px] absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari transaksi atau klien..."
            className="w-full bg-[#F9FAFB] rounded-xl h-12 pl-12 pr-4 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#5C67F2]/20 transition-all"
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-6">

        {/* Notifications */}
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
            <div className="absolute right-0 mt-3 w-80 bg-white border border-gray-100 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-50">
              <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                <h3 className="font-bold text-[#151D48]">Notifikasi</h3>
                {notifications.length > 0 && (
                  <button onClick={() => setNotifications([])} className="text-xs font-semibold text-[#5C67F2] hover:text-[#4a55c2] hover:underline transition-colors">Tandai dibaca</button>
                )}
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((n: any) => (
                    <div key={n.id} className="relative p-4 border-b border-gray-50 hover:bg-[#5C67F2]/5 cursor-pointer transition-colors group flex items-start gap-3">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#5C67F2] rounded-r-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center ${
                        n.type === 'income' ? 'bg-[#76c893]/10 text-[#76c893]' :
                        n.type === 'expense' ? 'bg-[#f08a5d]/10 text-[#f08a5d]' :
                        'bg-[#5C67F2]/10 text-[#5C67F2]'
                      }`}>
                        {n.type === 'income' && <StatusUpIcon className="w-5 h-5" />}
                        {n.type === 'expense' && <ArrowDownIcon className="w-5 h-5" />}
                        {n.type === 'invoice' && <DocumentIcon className="w-5 h-5" />}
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
              <div className="p-3 bg-gray-50/80 text-center border-t border-gray-100 hover:bg-gray-100 transition-colors cursor-pointer">
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
            <div className="absolute right-0 mt-3 w-56 bg-white border border-gray-100 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-50">
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
                    onClick={handleLogout}
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
  );
}
