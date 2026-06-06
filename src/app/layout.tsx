// Import Metadata supaya layout utama bisa memberi judul dan deskripsi untuk tab browser serta SEO dasar aplikasi GMera.
import type { Metadata } from "next";
// Import Poppins dari Next Font agar seluruh aplikasi memakai font Poppins yang dioptimalkan oleh Next.js.
import { Poppins } from "next/font/google";
// Import Toaster supaya pesan sukses/error dari halaman dashboard bisa muncul dari satu tempat global.
import { Toaster } from "@/components/ui/Toaster";
// Import CSS global yang berisi Tailwind, token warna, dan style dasar seluruh aplikasi.
import "./globals.css";

// poppins menyimpan konfigurasi font Poppins yang akan dipasang ke body aplikasi.
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-poppins",
});

// metadata memberi nama aplikasi dan deskripsi yang dipakai Next.js untuk halaman utama.
export const metadata: Metadata = {
  title: "Sistem Informasi Keuangan - PT GMera Solusi",
  description: "Dashboard Sistem Informasi Keuangan PT GMera Solusi",
};

// RootLayout adalah pembungkus paling luar yang memasang bahasa Indonesia, font Poppins, warna dasar, isi halaman, dan Toaster.
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // RootLayout menampilkan struktur HTML utama; semua halaman dashboard/login masuk lewat children.
  return (
    <html lang="id">
      <body className={`${poppins.className} ${poppins.variable} antialiased bg-background text-text-primary`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
