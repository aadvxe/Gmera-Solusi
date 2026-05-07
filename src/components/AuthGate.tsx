"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const isLoading = useAuthStore((state) => state.isLoading);
  const user = useAuthStore((state) => state.user);
  const router = useRouter();

  useEffect(() => {
    // Setelah loading selesai dan tidak ada user → redirect ke login
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [isLoading, user, router]);

  // Tampilkan loading screen saat cek session atau menunggu redirect
  if (isLoading || !user) {
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

  return <>{children}</>;
}
