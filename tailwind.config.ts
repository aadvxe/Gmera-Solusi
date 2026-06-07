// Import Config supaya TypeScript mengecek bentuk konfigurasi Tailwind yang dipakai aplikasi GMera.
import type { Config } from "tailwindcss";
// Import plugin animasi supaya class animasi modal/dropdown bisa dipakai tanpa require CommonJS.
import tailwindcssAnimate from "tailwindcss-animate";

// config menentukan file mana yang discan Tailwind dan token desain apa yang boleh dipakai komponen dashboard.
const config: Config = {
  // content memberi tahu Tailwind untuk membaca class dari pages, components, dan app router agar CSS yang dibuat tidak berisi class yang tidak dipakai.
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // sans menghubungkan class font-sans Tailwind ke variable Poppins yang dipasang di root layout.
        sans: ["var(--font-poppins)", "sans-serif"],
      },
      colors: {
        primary: {
          // primary dipakai untuk tombol utama, highlight menu, dan aksen dashboard GMera.
          DEFAULT: "#7983ff",
          foreground: "#FFFFFF",
        },
        success: {
          // success dipakai untuk status berhasil, paid/lunas, dan angka positif.
          DEFAULT: "#76c893",
          foreground: "#FFFFFF",
        },
        danger: {
          // danger dipakai untuk hapus, error, overdue, atau nilai yang perlu perhatian.
          DEFAULT: "#f08a5d",
          foreground: "#FFFFFF",
        },
        warning: {
          // warning dipakai untuk status pending atau peringatan sebelum user lanjut menyimpan data.
          DEFAULT: "#ffd166",
          foreground: "#2D3436",
        },
        info: {
          // info dipakai untuk pesan netral dan aksen informasi di dashboard.
          DEFAULT: "#62b6cb",
          foreground: "#FFFFFF",
        },
        // background adalah warna dasar halaman dashboard agar area kerja tetap terang dan bersih.
        background: "#F8FAFC",
        // surface adalah warna kartu, modal, tabel, dan panel yang berada di atas background.
        surface: "#FFFFFF",
        // border menyamakan garis pemisah input, tabel, kartu, dan modal.
        border: "#E2E8F0",
        text: {
          // primary dipakai untuk judul, angka utama, dan teks yang harus paling jelas.
          primary: "#1E293B",
          // secondary dipakai untuk label, deskripsi, dan teks pendukung.
          secondary: "#64748B",
          // muted dipakai untuk placeholder, metadata, atau informasi yang tidak dominan.
          muted: "#94A3B8",
        }
      },
    },
  },
  // Plugin ini menambahkan class animasi Tailwind yang dipakai komponen modal/dropdown.
  plugins: [tailwindcssAnimate],
};
export default config;
