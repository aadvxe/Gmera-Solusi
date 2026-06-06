"use client";

// Import React hook yang dipakai halaman login yang mengirim email dan password ke Supabase, misalnya untuk state, efek setelah render, atau referensi elemen.
import React, { useState } from "react";
// Import ikon yang dipakai halaman login yang mengirim email dan password ke Supabase untuk memperjelas tombol, menu, status, dan aksi di layar.
import { EyeIcon } from "@astraicons/react/bold";
// Import alat navigasi Next.js supaya halaman login yang mengirim email dan password ke Supabase bisa pindah halaman atau membaca route aktif.
import { useRouter } from "next/navigation";
// Import createClient untuk membuka koneksi Supabase dari browser saat halaman login yang mengirim email dan password ke Supabase perlu membaca/menyimpan data.
import { createClient } from "@/utils/supabase/client";
// Import authStore supaya halaman login yang mengirim email dan password ke Supabase bisa membaca user login, role, nama tampilan, atau mengosongkan session saat logout.
import { useAuthStore } from "@/store/authStore";

// LoginPage menampilkan form masuk, mengirim email/password ke Supabase, lalu menyimpan data user yang berhasil login.
export default function LoginPage() {
  // email menyimpan alamat email yang diketik user di form login.
  const [email, setEmail] = useState("");
  // password menyimpan kata sandi yang diketik user sebelum dikirim ke Supabase.
  const [password, setPassword] = useState("");
  // showPassword menentukan apakah kata sandi ditampilkan sebagai teks biasa atau disembunyikan.
  const [showPassword, setShowPassword] = useState(false);
  // error menyimpan pesan gagal agar bisa ditampilkan ke user.
  const [error, setError] = useState("");
  // isLoading menandai proses sedang berjalan supaya tombol bisa dibuat disabled atau layar loading muncul.
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { setUser } = useAuthStore();

  // handleLogin menangani aksi user di halaman login yang mengirim email dan password ke Supabase, seperti klik tombol, submit form, atau perubahan input.
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // try ini mengirim email dan password ke Supabase Auth, lalu mengambil profil user jika login berhasil.
    try {
      const supabase = createClient();
      // await menunggu respons Supabase selesai sebelum kode memakai data atau error yang dikembalikan.
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      // Kalau Supabase mengembalikan error atau data kosong, page.tsx menampilkan pesan gagal atau mengembalikan data kosong agar UI tidak rusak.
      if (error) {
        setError(error.message === "Invalid login credentials" ? "Email atau password salah." : error.message);
      } else if (data.user) {
        // Fetch profile from public.users table to get role & name
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();

        const userRole = profile?.role || data.user.user_metadata?.role || 'viewer';
        const fullName = profile?.name || data.user.user_metadata?.name || data.user.user_metadata?.full_name;

        // Merge profile into user metadata for authStore
        const enrichedUser = {
          ...data.user,
          user_metadata: {
            ...data.user.user_metadata,
            role: userRole,
            full_name: fullName,
          }
        };

        const { setUser, setRole } = useAuthStore.getState();
        setUser(enrichedUser as any);
        setRole(userRole);

        // Update last_login
        await supabase.from('users').update({ last_login: new Date().toISOString() }).eq('id', data.user.id);

        router.push("/beranda");
      }
    } catch (err: any) {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  // handleLogin menampilkan UI untuk halaman login yang mengirim email dan password ke Supabase.
  return (
    <div className="flex min-h-dvh flex-col justify-center overflow-y-auto bg-background px-4 py-6 sm:px-6 sm:py-12 lg:px-8">
      <div className="mx-auto w-full max-w-md">
        <div className="rounded-2xl border border-border bg-surface px-4 py-6 shadow-xl sm:px-10 sm:py-8">
          <div className="mb-6">

            <h2 className="text-2xl font-bold text-text-primary tracking-tight">
              Selamat datang kembali
            </h2>
            <p className="text-sm text-text-secondary mt-1">
              Silakan masuk dengan email dan kata sandi Anda.
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="bg-danger/10 border-l-4 border-danger p-4 rounded-md">
                <p className="text-sm text-danger">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-1.5">
                Email
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Masukkan email"
                  className="appearance-none block w-full px-4 py-3 border border-border rounded-lg shadow-sm placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-text-primary mb-1.5">
                Kata sandi
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi"
                  className="appearance-none block w-full px-4 py-3 border border-border rounded-lg shadow-sm placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all sm:text-sm"
                />
                <div 
                  className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-text-secondary hover:text-text-primary"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <EyeIcon className="w-5 h-5" />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary focus:ring-primary border-border rounded cursor-pointer"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-text-secondary cursor-pointer">
                  Ingat saya
                </label>
              </div>

            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all disabled:opacity-70"
              >
                {isLoading ? "Sedang masuk..." : "Masuk"}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-text-muted">
              © 2026 PT GMera Solusi
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
