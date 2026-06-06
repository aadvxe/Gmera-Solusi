# 📘 LLM.md — Gmera Solusi V3 Dashboard Keuangan
> **Dokumentasi AI-assisted Development Log & Panduan Migrasi**  
> Dibuat: 30 April 2026 | Versi: 3.x

---

## 1. Deskripsi Proyek

**PT Gmera Solusi** — Dashboard Keuangan Internal

Aplikasi web full-stack berbasis **Next.js 16 + Supabase** yang berfungsi sebagai pusat kendali keuangan perusahaan. Mencakup modul:

- Beranda (Dashboard dengan grafik real-time)
- Pendapatan & Pengeluaran
- E-Invoice
- Laporan Keuangan
- Klien
- Profil & Pengaturan

---

## 2. Stack Teknologi

| Layer | Teknologi | Versi |
|---|---|---|
| Framework | Next.js (App Router) | ^16.2.4 |
| Runtime | React | ^19.2.5 |
| Backend | Supabase (Auth + DB) | ^2.105.1 |
| SSR Auth | @supabase/ssr | ^0.10.2 |
| Styling | Tailwind CSS | ^3.4.1 |
| Icons | @astraicons/react | ^1.7.0 |
| Icons 2 | lucide-react | ^1.14.0 |
| Charts | Recharts | ^3.8.1 |
| Toasts | Sonner | ^2.0.7 |
| State | Zustand | ^5.0.12 |
| CSS Utils | tailwind-merge, tailwindcss-animate | latest |
| Language | TypeScript | ^5 |

---

## 3. Arsitektur Kunci

### Autentikasi
- **Supabase Auth** digunakan untuk login/session management.
- **`middleware.ts`** menangani route protection server-side.
  - Route protected: `/beranda`, `/pendapatan`, `/pengeluaran`, `/e-invoice`, `/laporan`, `/klien`, `/pengaturan`, `/profil`
  - Jika belum login → redirect ke `/login`
  - Jika sudah login dan akses `/login` atau `/` → redirect ke `/beranda`
- Session dipertahankan via **cookie** yang dikelola oleh `@supabase/ssr`.
- Client-side auth store: `src/store/authStore.ts` (Zustand)

### Data Layer
- **`src/lib/db.ts`** adalah *single source of truth* untuk semua query ke Supabase.
- Semua function di `db.ts` menggunakan Supabase browser client dari `src/utils/supabase/client.ts`.

### Layout
```
src/app/
├── (dashboard)/              # Authenticated layout group
│   ├── layout.tsx            # Sidebar + Navbar layout
│   ├── beranda/page.tsx      # Dashboard utama
│   ├── pendapatan/page.tsx
│   ├── pengeluaran/page.tsx
│   ├── e-invoice/page.tsx
│   ├── laporan/page.tsx      # Laporan + custom date picker
│   ├── klien/page.tsx
│   ├── pengaturan/page.tsx
│   └── profil/page.tsx
├── login/page.tsx
└── globals.css
```

### Komponen Penting
```
src/components/
├── layout/
│   ├── Sidebar.tsx           # Navigasi sidebar (collapsible, bahasa Indonesia)
│   └── Navbar.tsx            # Top bar + profil dropdown
├── ui/
│   ├── CustomDatePicker.tsx  # ⭐ Custom calendar (no native browser)
│   ├── CustomSelect.tsx
│   ├── Modal.tsx
│   ├── Button.tsx
│   ├── Input.tsx
│   └── ChartWrapper.tsx
└── dashboard/
    ├── FinancialChart.tsx    # ⭐ Grafik dinamis (Harian/Mingguan/Bulanan)
    └── MetricCard.tsx
```

---

## 4. Variabel Environment (`.env.local`)

File ini **tidak dikommit ke Git**. Buat ulang saat pindah device:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project-id>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key-dari-supabase-dashboard>
```

> Dapatkan nilainya dari: **Supabase Dashboard → Project Settings → API**

---

## 5. Database (Supabase)

Schema tersimpan di root project:
- `supabase-schema-final.sql` — DDL tabel utama
- `supabase-seed-final.sql` — Data awal (seed)
- `supabase-create-users.sql` — Setup user auth

### Tabel Utama
| Tabel | Deskripsi |
|---|---|
| `income` | Data pemasukan, kolom: `id, date, amount, category_id, description, client_id` |
| `expense` | Data pengeluaran, kolom: `id, date, amount, category_id, description` |
| `invoices` | E-Invoice, kolom: `id, client_id, status, grand_total, issue_date, due_date` |
| `clients` | Data klien |
| `categories` | Kategori income/expense |
| `profiles` | Profil user (extends Supabase auth.users) |

> **Penting:** Tabel `income` dan `expense` menggunakan kolom `date` bertipe `DATE` dalam format `YYYY-MM-DD`.

---

## 6. Log Sesi Pengembangan AI (Rangkuman Perubahan)

### Sesi 1 — Fondasi Autentikasi
- ✅ Hapus sesi Guest (tidak ada bypass ke dashboard tanpa login)
- ✅ Perbaiki infinite loading loop (middleware redirect langsung, bukan loop)
- ✅ Hapus logo SI dan box ungu di halaman login & loading

### Sesi 2 — UI & Navigasi
- ✅ Ubah icon collapse sidebar: `ChevronLeft` saat buka, `ChevronRight` saat tutup
- ✅ Translasi label sidebar: "Settings" → "Pengaturan", "Sign Out" → "Keluar"
- ✅ Hapus menu "Pengaturan" redundan dari dropdown profil Navbar

### Sesi 3 — Perbaikan Bug Modul
- ✅ Fix `ReferenceError: TableRow is not defined` → tambah import di `klien/page.tsx`
- ✅ Fix `ReferenceError: useEffect is not defined` → tambah import di `pengaturan/page.tsx`
- ✅ Konfirmasi koneksi database untuk modul Klien dan Pengaturan

### Sesi 4 — UI Custom & Logika Laporan
- ✅ Styling global input `type="date"` di `globals.css` (rounded corners)
- ✅ **Custom React Calendar** (`CustomDatePicker.tsx`) — menggantikan native browser calendar sepenuhnya, dengan popup kustom rounded-2xl, navigasi bulan, dan highlight warna brand
- ✅ Filter laporan keuangan: `getReportChartData(startDate, endDate)` menggunakan tanggal penuh bukan tahun hardcoded
- ✅ Logika MTD (Month-to-Date) untuk perbandingan laba bersih bulan lalu vs bulan ini

### Sesi 5 — Grafik Dinamis
- ✅ **FinancialChart.tsx dirombak total**: 
  - Menerima `rawData` (data mentah harian) dan `dataKey` ("income"/"expense")
  - Mengelompokkan data secara dinamis berdasarkan tab aktif:
    - **Harian**: Label X = "23 Apr", "24 Apr", ...
    - **Mingguan**: Label X = "M1 (Apr)", "M2 (Apr)", ...
    - **Bulanan**: Label X = "Apr", "Mei", "Jun", ...
  - `getReportChartData` di `db.ts` kini mengembalikan data mentah harian
  - Rata-rata di footer grafik otomatis menggunakan satuan: `/hr`, `/mgg`, `/bln`

### Sesi 6 — Polish & Format Angka
- ✅ **Custom Tooltip** grafik laporan disamakan dengan tooltip dashboard (kotak putih, shadow, rounded-2xl)
- ✅ Fungsi `formatCompactCurrency(value)` di beranda:
  - ≥ 1.000.000 → `X Jt`
  - ≥ 1.000 → `X k`
  - < 1.000 → angka penuh
- ✅ `YAxis` grafik Tren Arus Kas dan Perbandingan Arus Kas menggunakan `formatCompactCurrency`
- ✅ Label sumbu X (bawah) dirapikan dengan `minTickGap={20}` dan `interval="preserveStartEnd"`
- ✅ Ringkasan Keuangan di dashboard cards menggunakan format angka dinamis (tidak lagi hardcode Jt)

---

## 7. File Kunci untuk Referensi

| File | Fungsi |
|---|---|
| `src/lib/db.ts` | Semua query Supabase |
| `middleware.ts` | Auth guard & routing |
| `src/store/authStore.ts` | State user (Zustand) |
| `src/utils/supabase/client.ts` | Supabase browser client |
| `src/utils/supabase/server.ts` | Supabase server client |
| `src/components/ui/CustomDatePicker.tsx` | Kalender kustom |
| `src/components/dashboard/FinancialChart.tsx` | Grafik dinamis laporan |
| `src/app/(dashboard)/beranda/page.tsx` | Dashboard utama |
| `src/app/(dashboard)/laporan/page.tsx` | Laporan keuangan |
| `tailwind.config.ts` | Design tokens (warna, font) |
| `supabase-schema-final.sql` | DDL database |

---

## 8. 🍎 Panduan Migrasi ke Mac

### Prasyarat
Pastikan sudah terinstal di Mac:

```bash
# 1. Cek apakah Homebrew sudah ada
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 2. Install Node.js (gunakan versi LTS via nvm — sangat dianjurkan)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
# Restart terminal, lalu:
nvm install --lts
nvm use --lts

# Verifikasi
node -v    # Harus 20.x atau lebih
npm -v     # Harus 10.x atau lebih
```

### Langkah Migrasi

**Step 1 — Transfer file proyek**

Pilih salah satu cara:
```bash
# Opsi A: Git (jika sudah ada remote repo)
git clone https://github.com/<username>/gmera-solusi-v3.git
cd gmera-solusi-v3

# Opsi B: Copy manual via USB / AirDrop / Google Drive
# Salin folder "Gmera Solusi V3" ke Mac
# PENTING: Jangan salin folder .next dan node_modules
# File yang perlu ada: src/, package.json, tsconfig.json, tailwind.config.ts,
#   postcss.config.mjs, next.config.mjs, middleware.ts, .gitignore
```

**Step 2 — Buat `.env.local`**

```bash
cd "Gmera Solusi V3"
touch .env.local
```

Isi dengan:
```env
NEXT_PUBLIC_SUPABASE_URL=https://<project-id>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key-anda>
```

**Step 3 — Install dependencies**

```bash
npm install
```

> ⚠️ Jika ada error ERESOLVE atau peer conflict, coba: `npm install --legacy-peer-deps`

**Step 4 — Jalankan dev server**

```bash
npm run dev
```

Buka browser: [http://localhost:3000](http://localhost:3000)

---

### Potensi Masalah di Mac & Solusinya

| Masalah | Penyebab | Solusi |
|---|---|---|
| `EACCES permission denied` saat install | Permission npm global | Gunakan nvm (lebih disarankan) atau `sudo chown -R $USER ~/.npm` |
| `Error: Cannot find module '...'` | node_modules tidak ter-install | Jalankan `rm -rf node_modules && npm install` |
| Port 3000 sudah dipakai | Proses lain | Gunakan `npx kill-port 3000` atau `npm run dev -- -p 3001` |
| `next dev` lambat di M1/M2 | Arsitektur ARM | Pastikan Node diinstall native (via nvm, bukan Rosetta) |
| `Cannot read environment variables` | `.env.local` belum dibuat | Buat file `.env.local` seperti langkah Step 2 |
| Tailwind tidak mau compile | PostCSS config | Pastikan `postcss.config.mjs` ada dan `tailwind.config.ts` valid |
| TypeScript error `ts-node` tidak ditemukan | dev dependency | Jalankan `npm install --save-dev typescript` |
| `.next/` cache corrupt setelah transfer | Build cache Windows | Hapus `.next/` lalu `npm run dev` lagi |

---

### Catatan Tambahan Mac

- **Case-sensitive filesystem**: Mac (APFS/HFS+) *biasanya* case-insensitive, Windows *selalu* case-insensitive. Impor file di TypeScript yang salah kapitalisasi mungkin tidak error di Windows tapi akan gagal jika Mac dalam mode case-sensitive.
- **`.env.local` wajib ada**: File ini tidak di-commit (ada di `.gitignore`). Isi nilainya dari Supabase Dashboard.
- **Supabase berjalan di cloud**: Tidak perlu install apapun untuk Supabase, karena backend-nya hosted di cloud Supabase. Cukup pastikan API key di `.env.local` benar.

---

## 9. Perintah Berguna

```bash
# Jalankan development server
npm run dev

# Build production
npm run build

# Jalankan setelah build
npm start

# Lint codebase
npm run lint

# Hapus cache dan restart
rm -rf .next && npm run dev

# Reinstall semua dependency
rm -rf node_modules && npm install
```

---

## 10. Kontak & Referensi

- **Supabase Dashboard**: https://supabase.com/dashboard
- **Next.js Docs**: https://nextjs.org/docs
- **AstraIcons** (perhatikan ejaan `CalenderIcon` bukan `CalendarIcon`): https://astraicons.com
- **Recharts Docs**: https://recharts.org
