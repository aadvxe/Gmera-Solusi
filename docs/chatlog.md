# 💬 chatlog.md — Ringkasan Konteks AI Agent
> **Tujuan file ini:** Memberi konteks cepat kepada AI agent baru agar bisa langsung bekerja tanpa harus membaca seluruh history percakapan.
> Terakhir diperbarui: 30 April 2026

---

## 🧭 Identitas Proyek

**Nama:** Gmera Solusi V3 — Dashboard Keuangan Internal  
**Stack:** Next.js 16 (App Router) + Supabase + Tailwind CSS + TypeScript  
**Lokasi:** `d:\Gmera Solusi V3\` (Windows) / target migrasi: macOS  
**Dev server:** `npm run dev` → berjalan di `http://localhost:3000`  
**Bahasa UI:** Bahasa Indonesia

---

## 🎯 Apa yang Sudah Dikerjakan (Kronologis)

### 1. Autentikasi & Session
- **Dihapus:** sesi Guest yang memungkinkan akses sementara ke dashboard tanpa login.
- **Diperbaiki:** infinite loading loop saat refresh halaman saat sudah login — middleware sekarang langsung redirect ke `/beranda` tanpa looping.
- **Mekanisme:** `middleware.ts` memeriksa session via `supabase.auth.getUser()` server-side. Session tersimpan di cookie.

### 2. Perbaikan UI
- **Hapus:** Logo "SI" dan kotak ungu di halaman login & loading screen.
- **Sidebar collapse icon:** gunakan `ChevronLeft` (buka) dan `ChevronRight` (tutup). **Bukan** rotate CSS.
- **Translasi sidebar:** "Settings" → "Pengaturan", "Sign Out" → "Keluar".
- **Hapus:** Item "Pengaturan" dari dropdown profil Navbar (redundan, sudah ada di sidebar).

### 3. Bug Fixes Modul
- `klien/page.tsx`: tambah `import { TableRow } from ...` — sebelumnya `ReferenceError`.
- `pengaturan/page.tsx`: tambah `useEffect` ke import React — sebelumnya `ReferenceError`.

### 4. Custom Date Picker
- **Masalah:** Native date picker Chrome tidak bisa di-style rounded corner karena dikontrol browser.
- **Solusi:** Buat `src/components/ui/CustomDatePicker.tsx` — komponen React murni tanpa library eksternal.
  - Fitur: popup grid kalender kustom, navigasi bulan (</>), highlight tanggal terpilih warna `#5C67F2`.
  - Digunakan di: `laporan/page.tsx` untuk filter tanggal "Dari" dan "Sampai".
  - Tidak ada `<Input type="date">` lagi di halaman laporan.

### 5. Grafik Dinamis (FinancialChart)
- **Komponen:** `src/components/dashboard/FinancialChart.tsx` — **sudah dirombak total**.
- **Sebelumnya:** Menerima `data: DataPoint[]` dan `average: string` — statis.
- **Sekarang:** Menerima `rawData: RawDataPoint[]` dan `dataKey: "income" | "expense"`.
  - `RawDataPoint = { dateStr: string; income: number; expense: number }`
  - Data dikelompokkan secara dinamis menggunakan `useMemo` berdasarkan tab aktif:
    - **Harian** → label X: `"23 Apr"`
    - **Mingguan** → label X: `"M1 (23 Apr)"`
    - **Bulanan** → label X: `"Apr"`, `"Mei"`, ...
  - Rata-rata footer otomatis berubah: `/hr`, `/mgg`, `/bln`.
- **Tooltip:** Menggunakan `CustomTooltip` yang sama dengan dashboard (kotak putih, rounded-2xl, shadow besar).
- **Digunakan di:** `laporan/page.tsx` dengan dua instance (pendapatan + pengeluaran).

### 6. Fungsi Database `getReportChartData`
- **Lokasi:** `src/lib/db.ts`
- **Signature sekarang:** `getReportChartData(startDate: string, endDate: string)`
  - `startDate` dan `endDate` format `YYYY-MM-DD`
- **Return:** Array data mentah harian `{ dateStr, income, expense }[]`.
- Pengelompokkan (harian/mingguan/bulanan) dilakukan di sisi klien dalam `FinancialChart.tsx`.

### 7. Format Angka Dashboard
- Fungsi `formatCompactCurrency(value: number)` dibuat di dalam `beranda/page.tsx`:
  - ≥ 1.000.000 → `"X Jt"`
  - ≥ 1.000 → `"X k"`
  - < 1.000 → angka penuh
- Digunakan di: kartu ringkasan keuangan, YAxis grafik Tren Arus Kas, YAxis grafik Perbandingan Arus Kas.
- **Sebelumnya:** semua hardcode `/ 1000000 + "Jt"` meski nilainya ribuan.

### 8. Perbaikan Grafik Dashboard
- `YAxis` grafik Tren Arus Kas dan Perbandingan Arus Kas: menggunakan `tickFormatter={(value) => formatCompactCurrency(value)}`.
- `XAxis` kedua grafik: ditambah `minTickGap={20}` dan `interval="preserveStartEnd"` agar jarak label konsisten.
- Grafik "Perbandingan Arus Kas" sekarang punya `YAxis` (sebelumnya tidak ada, jadi sumbu Y tidak tampil).

### 9. MTD (Month-to-Date) Laba Bersih
- Fungsi `getDashboardSummary()` di `db.ts` kini menghitung `prevNetProfitMTD`.
- Logika: ambil income & expense bulan lalu hanya sampai tanggal yang sama dengan hari ini.
- Digunakan di kartu "Laba Bulan Lalu" di dashboard.

---

## ⚠️ Hal Penting untuk Agent Baru

### Jangan lakukan ini:
1. **Jangan impor `CalendarIcon`** dari `@astraicons/react/bold` — nama yang benar adalah **`CalenderIcon`** (typo di library, tapi memang begitu namanya).
2. **Jangan gunakan `<Input type="date">`** di halaman laporan — sudah diganti `<CustomDatePicker>`.
3. **Jangan ubah signature `getReportChartData`** — fungsi ini sekarang mengembalikan raw daily data, bukan grouped data.
4. **Jangan hapus `middleware.ts`** — ini yang melindungi semua route dashboard.

### Hal yang perlu diperhatikan:
- File `.env.local` **tidak ada di Git** — harus dibuat manual dengan URL dan Anon Key dari Supabase Dashboard.
- Semua query DB ada di `src/lib/db.ts` — jangan buat query Supabase langsung di komponen.
- `FinancialChart` hanya digunakan di `laporan/page.tsx`. Grafik di `beranda/page.tsx` menggunakan Recharts secara langsung.
- `getDashboardSummary()` sekarang mengembalikan `prevNetProfitMTD` (ada field baru ini).

---

## 📋 Status Fitur Saat Ini

| Fitur | Status | Catatan |
|---|---|---|
| Login / Logout | ✅ Stabil | Via Supabase Auth |
| Session persist (refresh) | ✅ Stabil | Cookie-based, tidak loop |
| Dashboard Beranda | ✅ Stabil | Grafik real-time Supabase |
| Modul Pendapatan | ✅ Stabil | CRUD ke Supabase |
| Modul Pengeluaran | ✅ Stabil | CRUD ke Supabase |
| Modul E-Invoice | ✅ Stabil | |
| Modul Laporan | ✅ Stabil | Custom date picker + grafik dinamis |
| Modul Klien | ✅ Stabil | Bug import TableRow sudah diperbaiki |
| Modul Pengaturan | ✅ Stabil | Bug import useEffect sudah diperbaiki |
| Format angka kompak | ✅ Selesai | Jt / k / penuh |
| Custom Date Picker | ✅ Selesai | Tanpa library eksternal |
| FinancialChart dinamis | ✅ Selesai | Harian/Mingguan/Bulanan |

---

## 🔜 Hal yang Belum Dikerjakan (Backlog)

- Export PDF / Excel dari halaman Laporan
- Filter chart di halaman Beranda juga menggunakan tanggal (saat ini hardcoded bulan berjalan)
- Notifikasi / reminder invoice jatuh tempo
- Dark mode

---

## 📁 File Dokumentasi Proyek

| File | Isi |
|---|---|
| `LLM.md` | Dokumentasi teknis lengkap + panduan migrasi ke Mac |
| `chatlog.md` (file ini) | Ringkasan konteks untuk AI agent |
| `technical-specification.md` | Spesifikasi teknis awal proyek |
| `wireframe-documentation.md` | Desain wireframe & layout |
| `update-version3.1.md` | Catatan update versi 3.1 |
| `feature-ideation-ux-improvements.md` | Ide fitur UX ke depan |
| `supabase-schema-final.sql` | DDL database (gunakan ini untuk setup DB baru) |
| `supabase-seed-final.sql` | Data awal / seed database |
