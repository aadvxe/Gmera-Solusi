"use client";

// Import React hook yang dipakai pembungkus auth yang mengambil session Supabase lalu mengisi data user dan role di store, misalnya untuk state, efek setelah render, atau referensi elemen.
import { useEffect, useCallback } from "react";
// Import alat navigasi Next.js supaya pembungkus auth yang mengambil session Supabase lalu mengisi data user dan role di store bisa pindah halaman atau membaca route aktif.
import { useRouter } from "next/navigation";
// Import createClient untuk membuka koneksi Supabase dari browser saat pembungkus auth yang mengambil session Supabase lalu mengisi data user dan role di store perlu membaca/menyimpan data.
import { createClient } from "@/utils/supabase/client";
// Import authStore supaya pembungkus auth yang mengambil session Supabase lalu mengisi data user dan role di store bisa membaca user login, role, nama tampilan, atau mengosongkan session saat logout.
import { useAuthStore } from "@/store/authStore";

// AuthProvider membungkus halaman dashboard agar session Supabase dibaca lalu user dan role disimpan ke authStore untuk Navbar, Sidebar, dan halaman lain.
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setRole, setIsLoading } = useAuthStore();
  const router = useRouter();

  /** Enrich user object with profile data from public.users */
  const enrichWithProfile = useCallback(async (userObj: any) => {
    // try ini membaca session/profil Supabase; kalau gagal, AuthProvider akan membersihkan state login dengan aman.
    try {
      const supabase = createClient();
      // await menunggu respons Supabase selesai sebelum kode memakai data atau error yang dikembalikan.
      const { data: profile } = await supabase
        .from("users")
        .select("name, role, phone, department, is_active")
        .eq("id", userObj.id)
        .single();

      // Kalau data user tersedia, lanjutkan proses yang membutuhkan akun login.
      if (!profile) return; // No profile row yet — session user is already set, skip

      const userRole = profile.role || userObj.user_metadata?.role || "viewer";

      const enriched = {
        ...userObj,
        user_metadata: {
          ...userObj.user_metadata,
          role: userRole,
          full_name: profile.name || userObj.user_metadata?.full_name,
          phone: profile.phone,
          department: profile.department,
          is_active: profile.is_active,
        },
      };

      setUser(enriched as any);
      setRole(userRole);
    } catch (err) {
      // Profile fetch failed — user is already set from session, do nothing
      console.warn("[AuthProvider] Profile enrichment failed (non-fatal):", err);
    }
  }, [setUser, setRole]);

  // Effect ini dijalankan saat app dashboard mulai dibuka untuk mengambil session Supabase terbaru dan mengisi authStore.
  useEffect(() => {
    const supabase = createClient();
    let isMounted = true;

    // init adalah fungsi awal yang mengecek apakah user masih punya sesi login yang valid ketika aplikasi pertama kali dibuka.
    const init = async () => {
      setIsLoading(true);
      // try ini membaca session/profil Supabase; kalau gagal, AuthProvider akan membersihkan state login dengan aman.
      try {
        // Use getUser() for better security and server-sync
        const { data: { user }, error } = await supabase.auth.getUser();

        // Kalau AuthProvider sudah dilepas dari layar, hentikan update state agar React tidak menerima update dari komponen yang sudah hilang.
        if (!isMounted) return;

        // Kalau data user tersedia, lanjutkan proses yang membutuhkan akun login.
        if (user) {
          // ✅ STEP 1: Set user immediately from session
          const baseRole = user.user_metadata?.role || "viewer";
          setUser(user as any);
          setRole(baseRole);

          // ✅ STEP 2: Enrich with DB profile
          enrichWithProfile(user);
        } else {
          // If there's an error like "Refresh Token Not Found", just sign out cleanly
          if (error) {
            console.warn("[AuthProvider] Session invalidated:", error.message);
          }
          setUser(null);
          setRole(null);
        }
      } catch (err) {
        console.error("[AuthProvider] Initialization error:", err);
        // Kalau AuthProvider masih aktif di layar, barulah state auth boleh diubah.
        if (isMounted) {
          setUser(null);
          setRole(null);
        }
      } finally {
        // Kalau AuthProvider masih aktif di layar, barulah state auth boleh diubah.
        if (isMounted) setIsLoading(false);
      }
    };

    init();

    // Listen for auth state changes (sign out, token refresh, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: string, session: any) => {
        // Kalau AuthProvider sudah dilepas dari layar, hentikan update state agar React tidak menerima update dari komponen yang sudah hilang.
        if (!isMounted) return;

        // Kalau Supabase memberi event SIGNED_OUT, AuthProvider mengosongkan user/role lalu mengarahkan user ke login.
        if (event === "SIGNED_OUT") {
          setUser(null);
          setRole(null);
          router.push("/login");
          // baseRole berhenti di sini karena syarat lanjut belum terpenuhi.
          return;
        }

        // Kalau Supabase memperbarui token atau data user, AuthProvider mengambil ulang profil supaya role/nama tetap sinkron.
        if (
          (event === "TOKEN_REFRESHED" || event === "USER_UPDATED") &&
          session?.user
        ) {
          // Silently re-enrich on token refresh — user won't notice
          enrichWithProfile(session.user);
        }
      }
    );

    // AuthProvider menampilkan UI untuk pembungkus auth yang mengambil session Supabase lalu mengisi data user dan role di store.
    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [enrichWithProfile, setIsLoading, setRole, setUser, router]);

  // Mengembalikan children berarti isi halaman dashboard boleh lanjut tampil setelah pengecekan auth selesai.
  return <>{children}</>;
}
