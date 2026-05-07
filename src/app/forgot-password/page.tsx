"use client";

import React, { useState } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setMessage("");

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        setError(error.message);
      } else {
        setMessage("Tautan pemulihan kata sandi telah dikirim ke email Anda.");
      }
    } catch (err: any) {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-surface py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-border">
          <div className="mb-6">
            <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center text-surface font-bold text-2xl mb-4">
              SI
            </div>
            <h2 className="text-2xl font-bold text-text-primary tracking-tight">
              Lupa Password
            </h2>
            <p className="text-sm text-text-secondary mt-1">
              Masukkan email Anda dan kami akan mengirimkan tautan untuk mengatur ulang kata sandi.
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-danger/10 border-l-4 border-danger p-4 rounded-md">
                <p className="text-sm text-danger">{error}</p>
              </div>
            )}
            
            {message && (
              <div className="bg-success/10 border-l-4 border-success p-4 rounded-md">
                <p className="text-sm text-success">{message}</p>
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
                  placeholder="mail@simmmple.com"
                  className="appearance-none block w-full px-4 py-3 border border-border rounded-lg shadow-sm placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all sm:text-sm"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all disabled:opacity-70"
              >
                {isSubmitting ? "Mengirim..." : "Kirim Tautan"}
              </button>
            </div>
            
            <div className="text-center text-sm">
              <Link href="/login" className="font-medium text-text-primary hover:text-primary transition-colors">
                Kembali ke halaman masuk
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
