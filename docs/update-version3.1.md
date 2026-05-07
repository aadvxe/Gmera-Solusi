[file name]: update-version3.1.md

[file content begin]

# Sistem Informasi Keuangan — Feature Ideation & UX Improvements (Final v3.1)

## PT GMera Solusi — Next.js + Supabase, Bahasa Indonesia, Sidebar Collapsible

**Version:** 3.1 (Final)
**Date:** April 30, 2026
**Purpose:** Dokumen final yang mendefinisikan arah UI, tumpukan teknologi, dasbor yang selaras dengan bisnis, dan seluruh fitur menggunakan desain modern dengan sidebar collapsible, sepenuhnya dalam Bahasa Indonesia dan mata uang Rupiah.

---

## Table of Contents

1. [Technology Stack: Next.js 14 + Supabase](#1-technology-stack-nextjs-14--supabase)
2. [Desain Sistem & Prinsip UI](#2-desain-sistem--prinsip-ui)
3. [Sistem Bahasa & Mata Uang](#3-sistem-bahasa--mata-uang)
4. [Struktur Tata Letak Global — Sidebar Collapsible](#4-struktur-tata-letak-global--sidebar-collapsible)
5. [Desain Ulang Dasbor](#5-desain-ulang-dasbor)
6. [Sistem Notifikasi](#6-sistem-notifikasi)
7. [Ideasi Metrik Bisnis](#7-ideasi-metrik-bisnis)
8. [Integrasi Ongkos Kirim](#8-integrasi-ongkos-kirim)
9. [Modul Manajemen Klien](#9-modul-manajemen-klien)
10. [Modul Jejak Audit](#10-modul-jejak-audit)
11. [Peningkatan UX per Modul](#11-peningkatan-ux-per-modul)
12. [Fitur Lanjutan (Fase 2)](#12-fitur-lanjutan-fase-2)
13. [Matriks Prioritas Fitur](#13-matriks-prioritas-fitur)
14. [Kemenangan Cepat UX & Pengaturan Global](#14-kemenangan-cepat-ux--pengaturan-global)

---

## 1. Technology Stack: Next.js 14 + Supabase

Tumpukan teknologi final yang dipilih untuk Sistem Informasi Keuangan:

| Lapisan              | Teknologi                                                       | Keterangan                                                                                    |
| -------------------- | --------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| **Frontend**         | Next.js 14 (App Router) + TypeScript + Tailwind CSS + shadcn/ui | Kerangka kerja React modern, routing berbasis file, komponen yang dapat digunakan kembali.    |
| **Manajemen State**  | React Query (TanStack Query) + Zustand                          | Sinkronisasi data server, caching, dan state UI lokal yang ringan.                            |
| **Backend**          | Next.js API Routes + Supabase Client                            | API ringan dengan autentikasi, query database, penyimpanan file, dan kemampuan real‑time.     |
| **Database**         | Supabase (PostgreSQL)                                           | Database relasional dengan Row Level Security, real‑time subscriptions, dan backup terkelola. |
| **Autentikasi**      | Supabase Auth (email/sandi)                                     | Multi‑peran via tabel `user_roles` kustom + kebijakan RLS.                                    |
| **Penyimpanan File** | Supabase Storage                                                | Logo perusahaan, lampiran invoice, bukti pembayaran.                                          |
| **Real‑time**        | Supabase Realtime (WebSocket)                                   | Dasbor langsung, notifikasi invoice jatuh tempo, transaksi baru.                              |
| **Pembuatan PDF**    | @react-pdf/renderer                                             | PDF invoice dan laporan, sisi klien maupun server.                                            |
| **Ekspor Excel**     | xlsx.js (SheetJS)                                               | Ekspor laporan sisi klien.                                                                    |
| **Email**            | Supabase Edge Functions (Resend)                                | Pengiriman invoice ke klien, pengaturan ulang kata sandi.                                     |
| **Deployment**       | Vercel (frontend) + Supabase (layanan backend)                  | Dioptimalkan untuk Next.js, HTTPS otomatis, CI/CD.                                            |

---

## 2. Desain Sistem & Prinsip UI

### 2.1 Inspirasi & Filosofi

Desain antarmuka terinspirasi oleh dasbor _e‑commerce_ modern yang memiliki karakteristik:

- **Bersih dan lapang** — banyak ruang putih, kartu dengan bayangan halus.
- **Padat data** — angka besar, tren ringkas, grafik informatif.
- **Sudut melengkung** — radius 16px pada kartu, 12px pada tombol, 10px pada input.
- **Ikon di dalam lingkaran berwarna** — ikon 20px di dalam wadah 40px dengan latar pastel.
- **Palet profesional** — ungu sebagai aksen utama, hijau untuk pendapatan, merah untuk pengeluaran, kuning untuk peringatan.

### 2.2 Token Desain

Aksen Utama: #6C5CE7 (Ungu-600) — Tombol utama, status aktif, penekanan grafik
Sukses: #00B894 (Hijau-500) — Pendapatan, status Lunas, tren positif
Bahaya: #E17055 (Merah-500) — Pengeluaran, status Jatuh Tempo, tindakan hapus
Peringatan: #FDCB6E (Kuning-400) — Status Belum Bayar, pengingat
Info: #0984E3 (Biru-600) — Tautan sekunder, informasi
Latar Belakang: #F5F6FA (Abu Muda) — Latar halaman
Permukaan: #FFFFFF (Putih) — Kartu, modal
Batas: #E4E7EB (Abu-200) — Pembatas, border input
Teks Utama: #2D3436 (Abu-900) — Judul, teks penting
Teks Sekunder: #636E72 (Abu-600) — Deskripsi, placeholder
Teks Samar: #B2BEC3 (Abu-400) — Stempel waktu, teks nonaktif

text

**Tipografi:** Inter (via `next/font`), dengan `tabular-nums` untuk data keuangan.

---

## 3. Sistem Bahasa & Mata Uang

### 3.1 Bahasa Indonesia Penuh

Seluruh antarmuka menggunakan Bahasa Indonesia: label formulir, judul halaman, teks bantuan, notifikasi, pesan kesalahan.

### 3.2 Format Mata Uang Rupiah

```ts
const rupiah = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
}).format(50000000);
// → "Rp 50.000.000"
3.3 Format Tanggal Indonesia
ts
new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
}).format(new Date('2026-01-20'));
// → "20 Januari 2026"
4. Struktur Tata Letak Global — Sidebar Collapsible
4.1 Konsep Sidebar Collapsible
Menggantikan navigasi navbar horizontal sebelumnya, sistem menggunakan sidebar kiri yang dapat dilipat (collapsible sidebar).

Keuntungan:

Lebih banyak ruang vertikal untuk konten.

Navigasi lebih jelas dengan ikon dan label.

Saat dilipat, hanya ikon yang terlihat — area konten melebar penuh.

Mengikuti pola aplikasi modern (seperti Notion, Linear, GitHub).

4.2 Spesifikasi Sidebar
Properti	Dibentangkan (expanded)	Dilipat (collapsed)
Lebar	260px	72px
Item Navigasi	Ikon 20px + Label teks	Hanya ikon 20px (tengah)
Tooltip	Tidak ada	Tooltip muncul saat hover
Logo	"SIKeuangan" + ikon	Hanya ikon
Footer	Nama & peran pengguna	Hanya avatar
Tombol Collapse	Ikon chevron kiri di header	Ikon chevron kanan di header
4.3 Struktur Tata Letak
text
┌──────────────────────────────────────────────────────────────────────────────┐
│  NAVBAR ATAS (Tinggi 64px, tetap di atas)                                     │
│  ┌─────────┐ ┌──────────────────────────────────┐ ┌──────────┐ ┌───────────┐ │
│  │ ☰ Logo  │ │ Selamat Pagi, Hani! 🌤️          │ │ 🔔 (3)   │ │ 👤 Hani ▼ │ │
│  └─────────┘ └──────────────────────────────────┘ └──────────┘ └───────────┘ │
├──────────────────────────────────────────────────────────────────────────────┤
│ ┌───────────────────────┐ ┌──────────────────────────────────────────────────┐│
│ │                       │ │                                                  ││
│ │   SIDEBAR KIRI        │ │           KONTEN UTAMA                           ││
│ │   (collapsible)       │ │           (scrollable)                            ││
│ │                       │ │                                                  ││
│ │  ┌─────────────────┐  │ │                                                  ││
│ │  │ 📊 Beranda      │  │ │  [Halaman sesuai navigasi yang dipilih]          ││
│ │  │ 💰 Pendapatan   │  │ │                                                  ││
│ │  │ 📤 Pengeluaran  │  │ │                                                  ││
│ │  │ 📄 E-Invoice    │  │ │                                                  ││
│ │  │ 📋 Laporan      │  │ │                                                  ││
│ │  │ 👥 Klien        │  │ │                                                  ││
│ │  │ ⚙️ Pengaturan   │  │ │                                                  ││
│ │  └─────────────────┘  │ │                                                  ││
│ │                       │ │                                                  ││
│ │  ───────────────────  │ │                                                  ││
│ │  👤 Hani Fitria R.    │ │                                                  ││
│ │  Finance Manager      │ │                                                  ││
│ │                       │ │                                                  ││
│ └───────────────────────┘ └──────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────────────────────┘
4.4 Item Navigasi Sidebar
Ikon	Label	Rute	Deskripsi
📊	Beranda	/beranda	Dasbor utama
💰	Pendapatan	/pendapatan	Kelola pendapatan
📤	Pengeluaran	/pengeluaran	Kelola pengeluaran
📄	E-Invoice	/e-invoice	Kelola invoice
📋	Laporan	/laporan	Laporan keuangan
👥	Klien	/klien	Manajemen klien
⚙️	Pengaturan	/pengaturan	Profil, pengguna, kategori
4.5 Navigasi Aktif
Item yang sedang aktif memiliki:

Latar belakang: bg-[#6C5CE7]/10 (ungu 10% opacity)

Teks: text-[#6C5CE7]

Indikator kiri: garis vertikal 3px warna ungu

Font: font-semibold

Item tidak aktif: text-slate-600 dengan hover bg-slate-100.

4.6 Footer Sidebar
Menampilkan:

Avatar pengguna (lingkaran 36px, inisial)

Nama pengguna

Peran (Super Admin, Finance Manager, dsb.)

Tombol keluar (ikon logout)

4.7 Navbar Atas (Minimal)
Dengan sidebar, navbar atas menjadi minimal:

Posisi	Elemen
Kiri	Tombol hamburger (☰) untuk membuka/menutup sidebar + Logo kecil
Tengah	Sapaan personal dengan ikon cuaca/emoji
Kanan	Ikon lonceng notifikasi (dengan badge) + Dropdown profil
text
┌──────────────────────────────────────────────────────────────────────────────┐
│  ☰  SIKeuangan     Selamat Pagi, Hani Fitria Rahmani! 🌤️       🔔  👤 HFR ▼ │
└──────────────────────────────────────────────────────────────────────────────┘
5. Desain Ulang Dasbor
5.1 Wireframe Dasbor Final (dengan Sidebar Collapsible)
text
┌──────────────────────────────────────────────────────────────────────────────┐
│  ☰  SIKeuangan     Selamat Pagi, Hani! 🌤️  Ada 3 invoice jatuh tempo.   🔔3 👤│
├────────────────────┬─────────────────────────────────────────────────────────┤
│                    │                                                         │
│  📊 Beranda        │  Periode: [📅 Bulan Ini ▼]              [📊 Ekspor]    │
│  💰 Pendapatan     │                                                         │
│  📤 Pengeluaran    │  ┌─────────────────┐ ┌─────────────────┐               │
│  📄 E-Invoice      │  │ 💰 Pendapatan   │ │ 📤 Pengeluaran  │               │
│  📋 Laporan        │  │ Bulan Ini       │ │ Bulan Ini       │               │
│  👥 Klien          │  │                 │ │                 │               │
│  ⚙️ Pengaturan     │  │ Rp 350.000.000  │ │ Rp 120.000.000  │               │
│                    │  │ +12% vs bln lalu│ │ -5% vs bln lalu │               │
│                    │  └─────────────────┘ └─────────────────┘               │
│                    │                                                         │
│  ───────────────── │  ┌─────────────────┐ ┌─────────────────┐               │
│  👤 Hani Fitria R. │  │ 💵 Saldo Saat Ini│ │ 📄 Invoice      │               │
│  Finance Manager   │  │ Rp 230.000.000  │ │ Belum Bayar     │               │
│                    │  │                 │ │ 8 (Rp 45 jt)    │               │
│  [Keluar]          │  └─────────────────┘ └─────────────────┘               │
│                    │                                                         │
│                    │  ┌──────────────────────────────────────────────────┐   │
│                    │  │ 📊 Pendapatan Bulan Ini                          │   │
│                    │  │                                                  │   │
│                    │  │ [Grafik Batang — Pendapatan per hari/minggu]     │   │
│                    │  │ ████  ██████  ████████  ████  ████████  ██████   │   │
│                    │  │ Sen   Sel     Rab       Kam   Jum      Sab      │   │
│                    │  │                                                  │   │
│                    │  │ Total: Rp 350.000.000   Rata²: Rp 58.333.333     │   │
│                    │  └──────────────────────────────────────────────────┘   │
│                    │                                                         │
│                    │  ┌──────────────────────────────────────────────────┐   │
│                    │  │ 📤 Pengeluaran Bulan Ini                         │   │
│                    │  │                                                  │   │
│                    │  │ [Grafik Batang — Pengeluaran per hari/minggu]   │   │
│                    │  │ ██    ███    ██    ████   ██    ███             │   │
│                    │  │ Sen   Sel    Rab   Kam    Jum   Sab             │   │
│                    │  │                                                  │   │
│                    │  │ Total: Rp 120.000.000   Rata²: Rp 20.000.000     │   │
│                    │  └──────────────────────────────────────────────────┘   │
│                    │                                                         │
│                    │  ┌─────────────────┐ ┌─────────────────┐               │
│                    │  │ 🍩 Status       │ │ 🏭 Produk       │               │
│                    │  │ Invoice         │ │ Terlaris        │               │
│                    │  │                 │ │                 │               │
│                    │  │ ● Lunas 65%     │ │ 1. Meja 80 unit │               │
│                    │  │ ● Blm Bayar 25% │ │ 2. Kursi 45     │               │
│                    │  │ ● Jatuh Tempo 10%│ │ 3. Rak 30      │               │
│                    │  └─────────────────┘ └─────────────────┘               │
│                    │                                                         │
│                    │  ┌─────────────────┐ ┌──────────────────────────────┐   │
│                    │  │ 👥 Klien Teratas│ │ 📋 Aktivitas Terbaru         │   │
│                    │  │                 │ │                              │   │
│                    │  │ 1. PT Maju  150j│ │ 💰 Pembayaran INV-021  2 mnt │   │
│                    │  │ 2. CV Sentosa85j│ │ 📄 INV-026 dibuat      1 jam │   │
│                    │  │ 3. Toko Makmur72j│ │ 📦 Beli Bahan Baku    3 jam │   │
│                    │  └─────────────────┘ └──────────────────────────────┘   │
│                    │                                                         │
└────────────────────┴─────────────────────────────────────────────────────────┘
5.2 Responsif — Mobile
Pada layar mobile (lebar < 768px):

Sidebar menjadi overlay (muncul dari kiri saat tombol hamburger diklik).

Latar belakang overlay: bg-black/50.

Mengetuk di luar sidebar menutupnya.

Kartu metrik menjadi 2 kolom, lalu 1 kolom di layar sangat kecil.

Grafik batang menjadi lebih pendek dan dapat digulir horizontal jika perlu.

Tabel berubah menjadi tampilan kartu.

5.3 Definisi Setiap Metrik Dasbor
Kartu	Definisi Bisnis PT GMera Solusi
Pendapatan Bulan Ini	Total seluruh pemasukan yang dicatat dalam bulan berjalan (manual + otomatis dari pembayaran invoice), termasuk ongkos kirim.
Pengeluaran Bulan Ini	Total seluruh pengeluaran yang dicatat dalam bulan berjalan (operasional, pembelian bahan baku, tagihan, gaji).
Saldo Saat Ini	Akumulasi total pendapatan dikurangi total pengeluaran (semua waktu).
Invoice Belum Bayar	Jumlah invoice dengan status Belum Bayar atau Jatuh Tempo, beserta total nominalnya.
Pendapatan Bulan Ini (Grafik)	Grafik batang harian/mingguan yang hanya menampilkan data pendapatan.
Pengeluaran Bulan Ini (Grafik)	Grafik batang harian/mingguan yang hanya menampilkan data pengeluaran.
Status Invoice (Donut)	Diagram donut distribusi status invoice bulan berjalan: Lunas, Belum Bayar, Jatuh Tempo.
Produk Terlaris	Berdasarkan item di invoice (meja kantor, kursi ergonomis, rak gudang, dsb).
Klien Teratas	Klien dengan total nilai invoice tertinggi dalam periode yang dipilih.
Aktivitas Terbaru	5 transaksi terakhir: pendapatan, pembayaran invoice, pengeluaran.
5.4 Pemisahan Grafik
Sesuai permintaan, grafik dipisahkan menjadi dua widget berbeda yang masing-masing berdiri sendiri:

Widget "Pendapatan Bulan Ini" — Grafik batang penuh menampilkan pendapatan harian/mingguan.

Widget "Pengeluaran Bulan Ini" — Grafik batang penuh menampilkan pengeluaran harian/mingguan.

Toggle di masing-masing widget: [Harian | Mingguan | Bulanan].

6. Sistem Notifikasi
6.1 Komponen
Ikon lonceng di navbar kanan atas dengan badge jumlah notifikasi belum dibaca.

Drawer notifikasi meluncur dari sisi kanan layar, menampilkan daftar notifikasi terbaru.

Notifikasi real‑time via Supabase Realtime.

6.2 Jenis Notifikasi
Pemicu	Pesan Notifikasi	Ikon
Invoice mendekati jatuh tempo (H-3)	"INV-0XX akan jatuh tempo dalam 3 hari"	⚠️
Invoice jatuh tempo hari ini	"INV-0XX jatuh tempo hari ini!"	🔴
Invoice melewati jatuh tempo	"INV-0XX sudah lewat jatuh tempo"	🚨
Invoice ditandai lunas	"INV-0XX telah dibayar lunas"	✅
Pembayaran invoice menghasilkan pendapatan otomatis	"Pendapatan otomatis dibuat dari INV-0XX (+Rp XX.XXX.XXX)"	💰
Pendapatan baru dicatat	"Pendapatan baru: [Sumber] (+Rp XX.XXX.XXX)"	💰
Pengeluaran baru dicatat	"Pengeluaran baru: [Jenis] (-Rp XX.XXX.XXX)"	📤
6.3 Tabel Database Notifikasi
sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type ENUM ('info', 'warning', 'success', 'danger') DEFAULT 'info',
  entity_type VARCHAR(50),
  entity_id UUID,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now()
);
6.4 Interaksi Pengguna
Klik ikon lonceng → buka drawer.

Klik notifikasi → navigasi ke halaman terkait.

Tombol "Tandai Semua Terbaca".

Tombol "Hapus" di setiap notifikasi.

7. Ideasi Metrik Bisnis
7.1 Metrik Dasbor Utama
Metrik	Rumus	Kegunaan
Pendapatan Bulan Ini	SUM(income.amount) WHERE month = current	Pantau pemasukan bulan berjalan.
Pengeluaran Bulan Ini	SUM(expense.amount) WHERE month = current	Pantau pengeluaran bulan berjalan.
Saldo Saat Ini	SUM(income.amount) - SUM(expense.amount)	Indikator kas tersedia.
Invoice Belum Bayar	COUNT(invoices WHERE status IN ('unpaid','overdue'))	Pantau piutang.
Status Invoice	Distribusi Lunas / Belum Bayar / Jatuh Tempo	Tinjauan cepat status penagihan.
Produk Terlaris	COUNT(invoice_items) GROUP BY description	Produk paling laku.
Klien Teratas	SUM(invoices.grand_total) GROUP BY client_id	Klien penyumbang pendapatan terbesar.
7.2 Metrik Laporan & Analisis (Fase 1 atau 2)
Metrik	Kegunaan
Rasio Pengeluaran/Pendapatan	Indikator kesehatan keuangan (target < 70%).
Rata‑rata Nilai Invoice	Evaluasi harga jual produk.
Ongkos Kirim Rata‑rata	Negosiasi tarif kurir.
Lama Hari Piutang (DSO)	Rata‑rata hari dari invoice terbit sampai lunas.
Frekuensi Pemesanan per Klien	Klien paling loyal.
Tren Penjualan per Produk	Produk naik/turun penjualannya.
7.3 Kesehatan Keuangan (Widget Opsional)
text
┌─────────────────────────────────────────────────────────────────┐
│ 🏥 Kesehatan Keuangan                                           │
│                                                                 │
│     Rasio Pengeluaran/Pendapatan: 34%                           │
│     [████████████░░░░░░░░░░░░░░░░░░░░░░░░]                      │
│     Status: ✅ BAIK (target di bawah 60%)                       │
└─────────────────────────────────────────────────────────────────┘
8. Integrasi Ongkos Kirim
8.1 Formulir Invoice — Bagian Pengiriman
Di formulir pembuatan invoice (/e-invoice/tambah), setelah bagian item:

text
┌─────────────────────────────────────────────────────────────────┐
│ D. Informasi Pengiriman                                         │
│                                                                 │
│ Metode Pengiriman                                               │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ JNE Regular                                        [▼]     │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ Ongkos Kirim                                                    │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Rp 0                                                        │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ Nomor Resi (opsional)                                           │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Masukkan nomor resi...                                       │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ Alamat Pengiriman (default: alamat klien)                       │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Jl. Merdeka No. 123, Jakarta Pusat                          │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ Estimasi Sampai                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 📅 27 Januari 2026    (3-5 hari kerja)                      │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
8.2 Perhitungan Total Invoice
text
Subtotal              = SUM(item_total)           = Rp 10.000.000
Pajak (11%)           = Subtotal × 0,11           = Rp  1.100.000
Ongkos Kirim          = Input pengguna              = Rp    250.000
Diskon                = Input pengguna              = Rp          0
───────────────────────────────────────────────────────────────────
TOTAL                 = Subtotal + Pajak + Ongkir - Diskon
                      = Rp 11.350.000
8.3 Basis Data Kurir (Data Awal)
Kode	Nama Kurir	Tipe	Estimasi Default
jne_reg	JNE Regular	Darat	3-5 hari
jne_yes	JNE YES	Express	1-2 hari
tiki_reg	TIKI Regular	Darat	3-5 hari
tiki_ons	TIKI ONS	Express	1-2 hari
pos_reg	POS Indonesia	Darat	5-7 hari
pos_express	POS Express	Express	2-3 hari
gosend	GoSend	Same-day	Hari yang sama
grab_express	GrabExpress	Same-day	Hari yang sama
custom	Lainnya	Custom	Input manual
9. Modul Manajemen Klien
9.1 Daftar Klien (/klien)
Tabel dengan kolom: Nama Klien | Alamat | Telepon | Email | Total Invoice | Aksi.

9.2 Integrasi dengan Invoice
Saat membuat invoice, pilih klien dari dropdown → otomatis mengisi alamat, telepon, email.

10. Modul Jejak Audit
10.1 Tabel Jejak Audit (/audit-log)
Hanya dapat diakses oleh Super Admin dan Finance Manager.

10.2 Riwayat Perubahan per Record
Di setiap halaman detail, terdapat tab Riwayat Perubahan yang menampilkan perubahan nilai sebelum dan sesudah.

11. Peningkatan UX per Modul
11.1 Global
Peningkatan	Usulan	Manfaat
Loading State	Skeleton card yang beranimasi	Performa terasa lebih cepat
Empty State	Ilustrasi ramah + "Tambahkan [X] pertama Anda!"	Panduan pengguna
Konfirmasi Aksi	Modal bergaya dengan konteks	Kurangi aksi tidak sengaja
Toast Notifikasi	Toast via sonner	Umpan balik setiap aksi
Breadcrumb	Path dapat diklik dengan ikon	Navigasi jelas
Format Angka	Rp 50.000.000	Keterbacaan data keuangan
Format Tanggal	20 Januari 2026	Standar Indonesia
11.2 Pendapatan & Pengeluaran
Peningkatan	Detail
Default Cerdas	Tanggal = hari ini, Kategori = paling sering digunakan
Deteksi Duplikat	Peringatan jika jumlah + tanggal + deskripsi sama
Simpan Otomatis Draf	localStorage setiap 30 detik
11.3 E‑Invoice
Peningkatan	Detail
Template Email	Isi email dapat diedit sebelum kirim
Konfirmasi Terima Barang	Checkbox "Barang sudah diterima klien"
11.4 Laporan
Peningkatan	Detail
Mode Perbandingan	Bulan ini vs bulan lalu vs bulan yang sama tahun lalu
12. Fitur Lanjutan (Fase 2)
Fitur	Deskripsi	Prioritas
Integrasi Inventori	Kaitkan pembelian bahan baku dengan stok, penjualan dengan stok keluar.	Menengah
Transaksi Berulang	Pendapatan/pengeluaran otomatis setiap bulan.	Menengah
Unggah CSV Massal	Impor data pendapatan/pengeluaran dalam jumlah besar.	Rendah
Multi‑Cabang	Dukungan cabang berbeda dengan pembukuan terpisah.	Rendah
Integrasi WhatsApp	Kirim invoice via WhatsApp, pengingat jatuh tempo.	Menengah
Integrasi Bank API	Impor transaksi otomatis dari bank.	Tinggi
Ekspor E‑Faktur	CSV kompatibel E‑Faktur untuk pelaporan PPN.	Menengah
Dasbor Lanjutan	Widget Kesehatan Keuangan, Target vs Realisasi.	Menengah
13. Matriks Prioritas Fitur
13.1 Metode MoSCoW
HARUS ADA (MVP — Minggu 1‑8)
#	Fitur	Usaha	Nilai Bisnis
1	Autentikasi multi‑peran (5 peran) + Row Level Security	Menengah	Kritis
2	CRUD Pendapatan + tabel item	Menengah	Kritis
3	CRUD Pengeluaran + tabel item	Menengah	Kritis
4	Pembuatan Invoice + item baris + ongkos kirim	Menengah	Kritis
5	Pembuatan PDF Invoice	Menengah	Kritis
6	Dasbor baru (sapaan, kartu metrik, grafik pendapatan terpisah, grafik pengeluaran terpisah, donut, produk terlaris, klien teratas, aktivitas terbaru)	Tinggi	Tinggi
7	Sistem notifikasi (lonceng + drawer + real‑time)	Menengah	Tinggi
8	Sidebar collapsible + navbar minimal	Menengah	Tinggi
9	Database Klien + isi otomatis di invoice	Menengah	Tinggi
10	Laporan (Pendapatan, Pengeluaran, Gabungan) + ekspor PDF/Excel	Menengah	Tinggi
11	Pengaturan profil perusahaan	Rendah	Menengah
12	Filter periode di dasbor	Rendah	Tinggi
SEBAIKNYA ADA (Minggu 7‑8 jika memungkinkan)
#	Fitur	Usaha	Nilai Bisnis
13	Siklus hidup status invoice (lunas → pendapatan otomatis)	Menengah	Tinggi
14	Kirim invoice via email ke klien	Menengah	Menengah
15	Jejak audit	Menengah	Menengah
16	Manajemen pengguna (tambah/edit/hapus)	Menengah	Menengah
17	Manajemen kategori	Rendah	Menengah
18	Unggah lampiran	Rendah	Menengah
19	Toast notifikasi (sonner)	Rendah	Menengah
20	Modal konfirmasi	Rendah	Menengah
BOLEH ADA (Fase 2 — Bulan 2)
#	Fitur	Usaha	Nilai Bisnis
21	Integrasi inventori	Tinggi	Menengah
22	Transaksi berulang	Menengah	Menengah
23	Unggah CSV massal	Menengah	Rendah
24	Template invoice (beberapa desain)	Menengah	Rendah
25	Integrasi WhatsApp	Tinggi	Menengah
26	Laporan terjadwal	Menengah	Rendah
27	Widget kesehatan keuangan	Rendah	Menengah
28	Integrasi Bank API	Tinggi	Tinggi
29	Dukungan multi‑cabang	Tinggi	Menengah
30	Ekspor E‑Faktur	Menengah	Tinggi
13.2 Linimasa Pengembangan
text
MINGGU 1-2: [████████████████████] Fondasi + Auth + Sidebar + Pengguna + Profil Perusahaan
MINGGU 3-4: [████████████████████] Pendapatan + Pengeluaran (CRUD penuh, item, lampiran)
MINGGU 5-6: [████████████████████] E‑Invoice (buat, PDF, ongkos kirim, database klien)
MINGGU 7:   [████████████░░░░░░░░] Dasbor (sapaan, grafik terpisah, notifikasi) + Laporan
MINGGU 8:   [████████████░░░░░░░░] Poles: Jejak audit, pengujian, perbaikan bug

MVP SIAP ████████████████████ Minggu 8
14. Kemenangan Cepat UX & Pengaturan Global
14.1 Kemenangan Cepat
Skeleton Loading — Kartu skeleton yang beranimasi.

Ilustrasi Empty State — Ilustrasi ramah + "Tambahkan [X] pertama Anda!"

Format Angka Rupiah — Rp 50.000.000 (bukan 50000000).

Format Tanggal Indonesia — 20 Januari 2026 di seluruh UI.

Toast Sukses/Gagal — Umpan balik setiap aksi.

Breadcrumb Navigasi — Path dapat diklik.

Tabel Responsif — Tampilan kartu di mobile.

Shortcut Keyboard — Ctrl+Shift+N untuk "Baru", Escape tutup modal.

Sidebar Lengket — Sidebar tetap terlihat saat konten digulir.

Simpan Otomatis Formulir — localStorage setiap 30 detik.

Sapaan Personal Dinamis — "Selamat Pagi/Siang/Sore/Malam, [Nama]!"

14.2 Pengaturan Format Global
ts
// utils/formatters.ts

export const formatRupiah = (value: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatTanggal = (date: Date | string): string => {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date));
};

export const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Selamat Pagi';
  if (hour >= 12 && hour < 15) return 'Selamat Siang';
  if (hour >= 15 && hour < 19) return 'Selamat Sore';
  return 'Selamat Malam';
};
14.3 Bahasa Standar untuk Komponen
Konteks	Bahasa Indonesia
Tombol simpan	"Simpan"
Tombol batal	"Batal"
Tombol hapus	"Hapus"
Tombol edit	"Edit"
Tombol lihat	"Lihat"
Tombol ekspor	"Ekspor"
Konfirmasi hapus	"Apakah Anda yakin ingin menghapus [X] ini?"
Pencarian	"Cari..."
Tidak ada data	"Belum ada data."
Memuat...	"Memuat..."
Berhasil disimpan	"[X] berhasil disimpan."
Dokumen Final — Feature Ideation & UX Improvements
Sistem Informasi Keuangan PT GMera Solusi
Versi 3.1 — April 2026

[file content end]

text

---

**Perubahan utama di versi 3.1:**

1. **Sidebar Collapsible** — Navigasi Utama pindah dari navbar horizontal ke sidebar kiri yang dapat dilipat. Navbar atas menjadi minimal (hanya logo, tombol hamburger, sapaan, notif, profil).

2. **Grafik Pendapatan & Pengeluaran Dipisah** — Masing‑masing memiliki widget grafik batang sendiri:
   - "📊 Pendapatan Bulan Ini" — Grafik batang harian/mingguan.
   - "📤 Pengeluaran Bulan Ini" — Grafik batang harian/mingguan.

3. **Tata Letak Lebih Luas** — Karena sidebar dapat dilipat, area konten lebih lega. Grafik batang dapat memanjang penuh.

4. **Struktur Tata Letak Global** — Bagian baru di dokumen yang menjelaskan sidebar, navbar, dan area konten secara mendetail.

5. **Responsif** — Penjelasan bagaimana sidebar menjadi overlay di mobile, dan kartu metrik menyesuaikan.

Dokumen ini sekarang menjadi spesifikasi final yang mencakup semua kebutuhan terbaru Anda. Siap untuk diimplementasikan.
```
