"use client";

import React, { useState, useEffect } from "react";
import { EyeIcon } from "@astraicons/react/bold";
import { EyeSlashIcon } from "@astraicons/react/bold";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useAuthStore } from "@/store/authStore";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  
  // Random Greeting
  const [greeting, setGreeting] = useState("Selamat Datang 👋");

  useEffect(() => {
    // Pick random greeting
    setGreeting(Math.random() > 0.5 ? "Selamat Datang 👋" : "Halo 👋");
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        setError(error.message === "Invalid login credentials" ? "Email atau password salah." : error.message);
      } else if (data.user) {
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();

        const userRole = profile?.role || data.user.user_metadata?.role || 'viewer';
        const fullName = profile?.name || data.user.user_metadata?.name || data.user.user_metadata?.full_name;

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

        await supabase.from('users').update({ last_login: new Date().toISOString() }).eq('id', data.user.id);

        router.push("/beranda");
      }
    } catch (err: any) {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-dvh w-screen overflow-hidden bg-surface">
      {/* Left Panel (Showcase Wrapper) */}
      <div className="hidden lg:flex lg:w-1/2 h-full p-4">
        <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden bg-[#fafbfe] rounded-[2rem]">
        
        {/* Drifting Mesh Gradient Blobs */}
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-[#7983ff] rounded-full blur-[130px] opacity-40 pointer-events-none"></div>
        <div className="absolute -top-20 -right-20 w-[26rem] h-[26rem] bg-[#f72585] rounded-full blur-[150px] opacity-25 pointer-events-none"></div>
        <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-[#4cc9f0] rounded-full blur-[110px] opacity-35 pointer-events-none"></div>

        {/* Grain Texture Overlay with Gaussian Blur */}
        <div className="absolute inset-0 opacity-[0.06] mix-blend-overlay pointer-events-none" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3CfeGaussianBlur stdDeviation='0.5'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")" }}></div>

        {/* Static KPI Dashboard Mockups */}
        <div className="relative w-full h-full">
          
          {/* Card 3: Chart (CENTERPIECE - Background) */}
          <div className="absolute z-10 bg-white/90 backdrop-blur shadow-lg border border-border/60 rounded-2xl p-6 w-80 lg:w-96" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
            <div className="flex justify-between items-center mb-5">
              <div>
                <p className="text-sm font-semibold text-text-primary">Arus Kas</p>
                <p className="text-xs text-text-secondary mt-0.5">Ringkasan pergerakan dana</p>
              </div>
              <span className="text-xs font-medium text-text-secondary bg-surface px-2 py-1 rounded">Nov 2026</span>
            </div>
            <div className="flex items-end space-x-3 h-28">
              <div className="w-full bg-primary/20 rounded-t-sm h-[40%] relative"><div className="absolute bottom-0 w-full bg-primary rounded-t-sm h-[20%] transition-all"></div></div>
              <div className="w-full bg-primary/20 rounded-t-sm h-[60%] relative"><div className="absolute bottom-0 w-full bg-primary rounded-t-sm h-[30%] transition-all"></div></div>
              <div className="w-full bg-primary/20 rounded-t-sm h-[80%] relative"><div className="absolute bottom-0 w-full bg-primary rounded-t-sm h-[50%] transition-all"></div></div>
              <div className="w-full bg-primary/20 rounded-t-sm h-[100%] relative"><div className="absolute bottom-0 w-full bg-primary rounded-t-sm h-[70%] transition-all"></div></div>
              <div className="w-full bg-primary/20 rounded-t-sm h-[70%] relative"><div className="absolute bottom-0 w-full bg-primary rounded-t-sm h-[40%] transition-all"></div></div>
            </div>
          </div>

          {/* Card 1: Revenue (Top Left) */}
          <div className="absolute z-40 bg-white shadow-xl border border-border rounded-2xl p-5 w-60" style={{ top: '15%', left: '8%' }}>
            <p className="text-xs text-text-secondary font-semibold uppercase tracking-wider mb-1">Pendapatan</p>
            <h3 className="text-xl font-bold text-text-primary mb-2">Rp 120.5M</h3>
            <div className="w-full bg-border rounded-full h-1.5 mb-2"><div className="bg-success h-1.5 rounded-full" style={{ width: '75%' }}></div></div>
            <p className="text-[10px] text-success font-medium">+15% bulan ini</p>
          </div>

          {/* Card 2: Expense (Top Right) */}
          <div className="absolute z-30 bg-white/95 backdrop-blur shadow-lg border border-border/50 rounded-2xl p-4 w-52" style={{ top: '22%', right: '10%' }}>
            <p className="text-xs text-text-secondary font-semibold uppercase tracking-wider mb-1">Pengeluaran</p>
            <h3 className="text-lg font-bold text-text-primary mb-2">Rp 45.2M</h3>
            <div className="flex items-center space-x-1">
              <span className="h-2 w-2 rounded-full bg-danger"></span>
              <p className="text-[10px] text-text-secondary">Didominasi operasional</p>
            </div>
          </div>

          {/* Card 4: Pending Invoices (Attached to Chart) */}
          <div className="absolute z-40 bg-white shadow-lg border border-border rounded-xl p-3 w-44" style={{ top: '62%', left: '12%' }}>
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-full bg-warning/20 flex items-center justify-center shrink-0">
                <span className="text-warning font-bold text-xs">12</span>
              </div>
              <div>
                <p className="text-xs font-bold text-text-primary">Unpaid</p>
                <p className="text-[10px] text-text-secondary">E-Invoice</p>
              </div>
            </div>
          </div>

          {/* Card 5: Table (Bottom Right) */}
          <div className="absolute z-40 bg-white shadow-xl border border-border rounded-xl overflow-hidden w-64" style={{ bottom: '15%', right: '12%' }}>
            <div className="bg-surface px-3 py-2 border-b border-border">
              <p className="text-[10px] font-bold text-text-primary uppercase tracking-wider">E-Invoice Terbaru</p>
            </div>
            <div className="p-0">
              <div className="flex justify-between items-center px-3 py-2 border-b border-border/50">
                <div>
                  <p className="text-xs font-semibold text-text-primary">INV-001</p>
                  <p className="text-[10px] text-text-secondary">Maju Bersama</p>
                </div>
                <span className="px-1.5 py-0.5 bg-success/10 text-success text-[8px] font-bold rounded">LUNAS</span>
              </div>
              <div className="flex justify-between items-center px-3 py-2">
                <div>
                  <p className="text-xs font-semibold text-text-primary">INV-002</p>
                  <p className="text-[10px] text-text-secondary">Karya Abadi</p>
                </div>
                <span className="px-1.5 py-0.5 bg-warning/10 text-warning text-[8px] font-bold rounded">PENDING</span>
              </div>
            </div>
          </div>


        </div>
      </div>
    </div>

      {/* Right Panel (Form) */}
      <div className="w-full lg:w-1/2 h-full flex flex-col justify-center px-6 py-6 sm:py-10 sm:px-12 lg:px-24 bg-surface relative overflow-y-auto">
        <div className="mx-auto w-full max-w-md">
          
          {/* Logo */}
          <div className="flex items-center space-x-2 mb-4">
             <img src="/logo_gmera.png" alt="GMera Logo" className="h-12 w-auto object-contain" />
          </div>

          <div className="mb-4">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight mb-1.5">
              {greeting}
            </h2>
            <p className="text-sm sm:text-base text-text-secondary">
              Mari kelola bisnis Anda hari ini
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleLogin}>
            {error && (
              <div className="bg-danger/10 border-l-4 border-danger p-4 rounded-lg flex items-start">
                <p className="text-sm text-danger font-medium">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-text-primary mb-1.5">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="masukan email anda"
                className="appearance-none block w-full px-4 py-3 bg-background border border-border rounded-xl shadow-sm placeholder-text-muted text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-text-primary mb-1.5">
                Kata sandi
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="masukan password anda"
                  className="appearance-none block w-full px-4 py-3 bg-background border border-border rounded-xl shadow-sm placeholder-text-muted text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all sm:text-sm pr-10"
                />
                <button 
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-muted hover:text-text-primary focus:outline-none transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary focus:ring-primary border-border rounded cursor-pointer transition-colors"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm font-medium text-text-secondary cursor-pointer hover:text-text-primary transition-colors">
                  Ingat saya
                </label>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sedang masuk...
                  </>
                ) : (
                  "Masuk"
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-text-muted font-medium">
              © {new Date().getFullYear()} PT GMera Solusi. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
