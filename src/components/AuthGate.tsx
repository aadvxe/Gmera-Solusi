"use client";

// Import useEffect untuk menjalankan pengecekan akses setelah React membaca status login dari authStore.
import { useEffect } from "react";
// Import useRouter supaya AuthGate bisa mengirim user ke /login jika session Supabase tidak ada.
import { useRouter } from "next/navigation";
// Import authStore supaya AuthGate bisa membaca apakah proses cek session masih loading dan apakah user sudah login.
import { useAuthStore } from "@/store/authStore";

// AuthGate adalah komponen pemeriksa akses dashboard: kalau authStore belum punya user login, isi dashboard tidak ditampilkan dan user diarahkan ke /login.
export function AuthGate({ children }: { children: React.ReactNode }) {
  const isLoading = useAuthStore((state) => state.isLoading);
  const user = useAuthStore((state) => state.user);
  const router = useRouter();

  // Effect ini menunggu pengecekan session selesai; kalau tidak ada user, dashboard langsung dialihkan ke halaman login.
  useEffect(() => {
    // Setelah loading selesai dan tidak ada user → redirect ke login
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [isLoading, user, router]);

  // Tampilkan loading screen saat cek session atau menunggu redirect
  if (isLoading || !user) {
    // AuthGate menampilkan layar tunggu saat session Supabase masih dicek atau saat redirect ke login sedang diproses.
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#f8f9fa]">
        <div className="flex flex-col items-center gap-5">

          <div className="w-10 h-10 rounded-full border-4 border-[#5C67F2]/20 border-t-[#5C67F2] animate-spin" />
          <p className="text-sm text-gray-500 font-medium">
            {isLoading ? "Memuat sesi..." : "Mengalihkan ke login..."}
          </p>
        </div>
      </div>
    );
  }

  // Mengembalikan children berarti isi halaman dashboard boleh lanjut tampil setelah pengecekan auth selesai.
  return <>{children}</>;
}
