# Sistem Informasi Keuangan — Wireframe Documentation & Layout Specifications
## PT GMera Solusi — Complete Page-by-Page Wireframes

**Version:** 1.0  
**Date:** April 30, 2026  
**Grid System:** 12-column, 24px gutters, 1440px max-width  
**Design Tokens:** Defined in companion Technical Specification

---

## Table of Contents
1. [Design System & Tokens](#1-design-system--tokens)
2. [Global Layout Structure](#2-global-layout-structure)
3. [Authentication Pages](#3-authentication-pages)
4. [Dashboard Page](#4-dashboard-page)
5. [Income Module](#5-income-module)
6. [Expense Module](#6-expense-module)
7. [E-Invoice Module](#7-e-invoice-module)
8. [Reports Module](#8-reports-module)
9. [Client Module](#9-client-module)
10. [Settings Module](#10-settings-module)
11. [Responsive Breakpoints](#11-responsive-breakpoints)

---

## 1. Design System & Tokens

### Color Palette
```
Primary:        #2563EB (Blue-600)     — Navbar, primary buttons, links, active states
Primary Hover:  #1D4ED8 (Blue-700)     — Button hover, link hover
Primary Light:  #DBEAFE (Blue-100)     — Badge backgrounds, light accents

Success:        #16A34A (Green-600)    — Income, paid status, positive actions
Success Light:  #DCFCE7 (Green-100)    — Income cards, paid badges

Danger:         #DC2626 (Red-600)      — Expense, delete, unpaid alerts
Danger Light:   #FEE2E2 (Red-100)      — Expense cards, danger backgrounds

Warning:        #EAB308 (Yellow-500)   — Unpaid status, due soon alerts
Warning Light:  #FEF9C3 (Yellow-100)   — Warning badges

Neutral:        #F8FAFC (Slate-50)     — Page background
Surface:        #FFFFFF (White)        — Card backgrounds
Border:         #E2E8F0 (Slate-200)    — Dividers, input borders
Text Primary:   #0F172A (Slate-900)    — Headings, primary text
Text Secondary: #64748B (Slate-500)    — Descriptions, placeholders
Text Muted:     #94A3B8 (Slate-400)    — Disabled, timestamps
```

### Typography Scale
```
Page Title:     28px / font-weight: 700 / Slate-900
Section Title:  20px / font-weight: 600 / Slate-800
Card Title:     16px / font-weight: 600 / Slate-800
Body:           14px / font-weight: 400 / Slate-600
Small/Caption:  12px / font-weight: 400 / Slate-500
Data/Amount:    18px / font-weight: 700 / Slate-900 (tabular-nums)
```

### Spacing Scale (rem-based)
```
xs:  4px  (0.25rem)
sm:  8px  (0.5rem)
md:  16px (1rem)
lg:  24px (1.5rem)
xl:  32px (2rem)
2xl: 48px (3rem)
```

### Component Primitives
- **Buttons:**
  - Primary: bg-blue-600, text-white, px-4 py-2, rounded-lg, hover:bg-blue-700
  - Secondary: bg-white, border border-slate-200, text-slate-700, hover:bg-slate-50
  - Danger: bg-red-600, text-white, hover:bg-red-700
  - Success: bg-green-600, text-white, hover:bg-green-700
  - Icon: p-2, rounded-lg, hover:bg-slate-100
  
- **Cards:** bg-white, rounded-xl, shadow-sm, border border-slate-200, p-6
  
- **Inputs:** bg-white, border border-slate-300, rounded-lg, px-4 py-2.5, focus:ring-2 focus:ring-blue-500 focus:border-blue-500
  
- **Tables:** Header: bg-slate-50, text-slate-600, font-semibold, text-sm, uppercase tracking-wider. Rows: border-b border-slate-200, hover:bg-slate-50
  
- **Badges:** rounded-full, px-2.5 py-0.5, text-xs, font-medium
  - Paid: bg-green-100 text-green-700
  - Unpaid: bg-yellow-100 text-yellow-700
  - Overdue: bg-red-100 text-red-700
  - Manual: bg-blue-100 text-blue-700
  - Auto: bg-slate-100 text-slate-700

---

## 2. Global Layout Structure

### 2.1 Desktop Layout (>1024px)
```
┌─────────────────────────────────────────────────────────────────────────────┐
│  TOP NAVBAR (Fixed, 64px height, z-50)                                      │
│  ┌──────────────┬────────────────────────────────────┬──────────────────┐   │
│  │ Logo + Title │ Navigation Links                   │ User + Actions   │   │
│  │ SIKeuangan   │ Beranda | Pendapatan | Pengeluaran  │ [Notif] [User ▼]│   │
│  │              │ | E-Invoice | Laporan              │                  │   │
│  └──────────────┴────────────────────────────────────┴──────────────────┘   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  MAIN CONTENT AREA (min-h: calc(100vh - 64px), bg-slate-50)                 │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │  Breadcrumb + Page Title                                              │  │
│  │  Home > Module > Page                                                 │  │
│  │                                                                       │  │
│  │  [CONTENT — Cards, Tables, Forms, Charts]                             │  │
│  │                                                                       │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  Footer (Optional, only on auth pages): 48px                                │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Navigation Specification
```
Height: 64px (4rem)
Background: bg-blue-600
Shadow: shadow-md

Left Section:
  - Logo icon: 32×32px, white
  - System Title: "Sistem Informasi Keuangan", text-white, font-semibold, 16px
  - Margin between: 12px

Center Section:
  - Nav Links: flex, gap-1
  - Each link: px-4 py-2, rounded-lg, text-white/80, hover:text-white, hover:bg-white/10
  - Active link: bg-white/20, text-white, font-medium
  - Icon + Label: gap-2, icon 18px, label 14px
  - Links: Beranda, Pendapatan, Pengeluaran, E-Invoice, Laporan

Right Section:
  - Notification Bell: relative, icon 20px
    - Badge: absolute -top-1 -right-1, w-4 h-4, bg-red-500, text-[10px], text-white, rounded-full
  - User Dropdown: flex items-center, gap-2
    - Avatar: w-8 h-8, rounded-full, bg-white/20, text-white, font-semibold
    - Name: text-white, text-sm, max-w-[120px], truncate
    - Chevron: w-4 h-4, text-white/60
    - Dropdown Menu: absolute right-0 mt-2, w-48, bg-white, rounded-xl, shadow-lg, border border-slate-200
      - Profile, Settings, Divider, Logout (text-red-600)
```

---

## 3. Authentication Pages

### 3.1 Login Page (/login)
**Layout:** Centered card, full screen slate-50 background
**Access:** Public

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│                                                                             │
│                    ┌─────────────────────────────────────┐                  │
│                    │           [Logo Icon 64×64]          │                  │
│                    │                                     │                  │
│                    │    Sistem Informasi Keuangan        │                  │
│                    │    PT GMera Solusi                  │                  │
│                    │                                     │                  │
│                    │  ┌───────────────────────────────┐   │                  │
│                    │  │ Email                         │   │                  │
│                    │  │ ┌───────────────────────────┐ │   │                  │
│                    │  │ │ Masukkan email...         │ │   │                  │
│                    │  │ └───────────────────────────┘ │   │                  │
│                    │  └───────────────────────────────┘   │                  │
│                    │                                     │                  │
│                    │  ┌───────────────────────────────┐   │                  │
│                    │  │ Password                      │   │                  │
│                    │  │ ┌───────────────────────────┐ │   │                  │
│                    │  │ │ ●●●●●●●●●●               [👁]│ │   │                  │
│                    │  │ └───────────────────────────┘ │   │                  │
│                    │  └───────────────────────────────┘   │                  │
│                    │                                     │                  │
│                    │  [ ] Ingat saya                       │                  │
│                    │                                     │                  │
│                    │  ┌───────────────────────────────┐   │                  │
│                    │  │     🔐 Masuk                 │   │                  │
│                    │  └───────────────────────────────┘   │                  │
│                    │                                     │                  │
│                    │         © 2026 PT GMera Solusi      │                  │
│                    └─────────────────────────────────────┘                  │
│                                                                             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Card Specs:**
- Width: 440px max, centered
- Padding: 48px (3rem)
- Background: white
- Border-radius: 16px (rounded-2xl)
- Shadow: shadow-xl
- Border: 1px solid slate-200

**Form Specs:**
- Label: text-sm, font-medium, slate-700, mb-1.5
- Input: full width, py-3, px-4
- Button: full width, py-3, bg-blue-600, font-semibold

---

## 4. Dashboard Page (/dashboard)

### 4.1 UX Issues Identified in Client Mockup
1. **Missing Date Range Control** — Dashboard shows "all time" only, no period filter
2. **Confusing Chart Legend** — E-Invoice line mixed with Income/Expense bars (different metrics)
3. **Unclear Transaction Icons** — "BP", "BF" icons have no meaning
4. **Garbled Widget Text** — "Anteplan Gana keuangan" is placeholder/corrupted
5. **No Visual Priority** — All elements same visual weight; no clear CTA
6. **No Alert System** — No overdue invoice count or urgent notifications
7. **Cluttered "Download Laporan"** — Bottom bar unclear what it downloads

### 4.2 Improved Dashboard Wireframe
**Layout:** Full width, 4 summary cards → Charts + Side widgets → Quick actions

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  TOP NAVBAR                                                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │  Beranda                                          [? Help]           │  │
│  │                                                                     │  │
│  │  ┌─────────────────────────────────────────────────────────────┐   │  │
│  │  │  📅 Periode: [Hari Ini ▼]  📍 Dashboard Keuangan Overview  │   │  │
│  │  └─────────────────────────────────────────────────────────────┘   │  │
│  │                                                                     │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐               │  │
│  │  │ 💰       │ │ 📤       │ │ 📥       │ │ 📊       │               │  │
│  │  │Total     │ │Total     │ │Saldo     │ │Invoice   │               │  │
│  │  │Pendapatan│ │Pengeluaran│ │Saat Ini  │ │Belum     │               │  │
│  │  │         │ │         │ │         │ │Dibayar   │               │  │
│  │  │Rp 350jt │ │Rp 120jt │ │Rp 230jt │ │8 invoice │               │  │
│  │  │[+12% ▲] │ │[-5% ▼]  │ │[+8% ▲]  │ │[⚠ 3 overdue]│               │  │
│  │  │Bulan ini│ │Bulan ini│ │Bulan ini│ │Rp 45jt   │               │  │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘               │  │
│  │                                                                     │  │
│  │  ┌─────────────────────────────────────┐ ┌─────────────────────────┐  │  │
│  │  │                                     │ │  ⚠ JATUH TEMPO DEKAT   │  │  │
│  │  │   GRAFIK KEUANGAN BULANAN          │ │  ┌───────────────────┐  │  │
│  │  │                                     │ │  │ INV-025  25/01   │  │  │
│  │  │   [Bar Chart: Income vs Expense]    │ │  │ Rp 10.000.000   │  │  │
│  │  │                                     │ │  │ PT Maju Sejahtera│  │  │
│  │  │   Legends: Income (green)           │ │  ├───────────────────┤  │  │
│  │  │            Expense (red)            │ │  │ INV-018  20/01   │  │  │
│  │  │            [No E-Invoice line]      │ │  │ Rp 5.500.000    │  │  │
│  │  │                                     │ │  │ CV Sentosa Jaya  │  │  │
│  │  │   [Toggle: Bulan / Tahun / Kuartal] │ │  ├───────────────────┤  │  │
│  │  │                                     │ │  │ INV-015  18/02   │  │  │
│  │  └─────────────────────────────────────┘ │  │ Rp 8.750.000    │  │  │
│  │                                          │  │ [Lihat Semua →] │  │  │
│  │  ┌─────────────────────────────────────┐ │  └───────────────────┘  │  │
│  │  │  TRANSAKSI TERBARU                 │ │                        │  │
│  │  │  ┌────────────────────────────────┐  │ │  📋 AKSI CEPAT        │  │
│  │  │  │ [💰] Penjualan Produk         │  │ │  ┌───────────────────┐  │  │
│  │  │  │ Rp 50.000.000 · Penjualan     │  │ │  │ + Catat Pendapatan│  │  │
│  │  │  │ 20/01/2026                    │  │ │  ├───────────────────┤  │  │
│  │  │  ├────────────────────────────────┤  │ │  │ + Catat Pengeluaran│  │  │
│  │  │  │ [📄] Pembayaran Invoice       │  │ │  ├───────────────────┤  │  │
│  │  │  │ Rp 250.000 · Piutang          │  │ │  │ + Buat Invoice    │  │  │
│  │  │  │ 18/01/2026                    │  │ │  ├───────────────────┤  │  │
│  │  │  ├────────────────────────────────┤  │ │  │ 📥 Export Laporan │  │  │
│  │  │  │ [📦] Pembelian Bahan Baku     │  │ │  └───────────────────┘  │  │
│  │  │  │ Rp 3.000.000 · Pembelian      │  │ │                        │  │
│  │  │  │ 19/01/2026                    │  │ │  📈 TREN 30 HARI      │  │
│  │  │  └────────────────────────────────┘  │ │  [Mini sparkline]     │  │
│  │  │  [Lihat Semua Transaksi →]          │ │  Income: +15%         │  │
│  │  └─────────────────────────────────────┘ │  Expense: +8%         │  │
│  │                                          └─────────────────────────┘  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.3 Dashboard Component Specifications

**Summary Cards (4-column grid):**
- Container: grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4, gap-6
- Card: bg-white, rounded-xl, p-6, border border-slate-200, shadow-sm
- Icon: w-12 h-12, rounded-xl, centered icon (24px), background tinted
  - Income: bg-green-100, icon text-green-600
  - Expense: bg-red-100, icon text-red-600
  - Balance: bg-blue-100, icon text-blue-600
  - Unpaid: bg-yellow-100, icon text-yellow-600
- Label: text-sm, text-slate-500, mb-1
- Amount: text-2xl, font-bold, text-slate-900, tracking-tight
- Trend: text-xs, flex items-center, gap-1
  - Positive: text-green-600, bg-green-50, px-2 py-0.5, rounded-full
  - Negative: text-red-600, bg-red-50, px-2 py-0.5, rounded-full
- Period: text-xs, text-slate-400, mt-1

**Chart Section:**
- Container: col-span-2 (lg), bg-white, rounded-xl, p-6
- Title: text-lg, font-semibold, text-slate-800, mb-4
- Chart: height 320px, Recharts BarChart
- Toggle Group: flex gap-2, mt-4
  - Buttons: px-3 py-1, text-sm, rounded-lg, border
  - Active: bg-blue-600 text-white border-blue-600
  - Inactive: bg-white text-slate-600 border-slate-200
- **CRITICAL FIX:** Remove E-Invoice from chart. Chart shows only Income vs Expense.

**Unpaid Invoices Widget:**
- Container: bg-white, rounded-xl, p-6
- Title: flex items-center, gap-2, text-lg, font-semibold
- Warning icon: text-yellow-500 for overdue count
- List: space-y-3
- Item: flex items-center, justify-between, p-3, rounded-lg, hover:bg-slate-50
  - Left: invoice # (font-mono, text-sm, text-slate-700), date (text-xs, text-slate-400)
  - Right: amount (text-sm, font-semibold, text-slate-900)
- Status indicator: Left border 3px — Yellow for unpaid, Red for overdue

**Recent Transactions:**
- Same card style
- Item: flex, gap-3, items-start
- Icon circle: w-10 h-10, rounded-full, tinted bg
- Content: flex-1
- Amount: text-sm, font-semibold, right-aligned

**Quick Actions:**
- Vertical stack of buttons
- Each: w-full, justify-start, gap-3, py-3, px-4, rounded-xl
- Icon + Label style
- Hover: bg-slate-50, border-slate-300

---

## 5. Income Module

### 5.1 Income List Page (/pendapatan)
**Layout:** Full width, action bar → table

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  TOP NAVBAR                                                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │  Beranda > Pendapatan                                              │  │
│  │                                                                     │  │
│  │  Pendapatan                              ┌──────────────────────┐   │  │
│  │                                          │ 🔍 Cari data...      │   │  │
│  │  [+ Tambah Data Pendapatan]              └──────────────────────┘   │  │
│  │                                                                     │  │
│  │  ┌───────────────────────────────────────────────────────────────┐  │  │
│  │  │ Tanggal │ Sumber Pendapatan │ Kategori │ Jumlah │ Tipe │ ⋮ │  │  │
│  │  ├─────────┼───────────────────┼──────────┼────────┼──────┼───┤  │  │
│  │  │20/01/26 │ Penjualan Produk  │ Penjualan│50.000.0│Manual│⚙️│  │  │
│  │  │19/01/26 │ Invoice INV021    │ Piutang  │15.000.0│ Auto │⚙️│  │  │
│  │  │18/01/26 │ Pembayaran Invoice│ Piutang  │25.000.0│Manual│⚙️│  │  │
│  │  │15/01/26 │ Pengembalian Dana │Pengembal│10.000.0│Manual│⚙️│  │  │
│  │  │12/01/26 │ Penjualan Produk  │ Penjualan│35.000.0│Manual│⚙️│  │  │
│  │  └─────────┴───────────────────┴──────────┴────────┴──────┴───┘  │  │
│  │                                                                     │  │
│  │  Menampilkan 1-5 dari 50 data          [Sebelumnya] [1] [Selanjutnya]│  │
│  │                                                                     │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Table Specs:**
- Container: bg-white, rounded-xl, border, overflow-hidden
- Header: bg-slate-50, px-6 py-3.5, text-xs, font-semibold, uppercase, tracking-wider, text-slate-500
- Row: px-6 py-4, border-b border-slate-100, hover:bg-slate-50
- Tipe Badge:
  - Manual: bg-blue-100 text-blue-700
  - Auto: bg-slate-100 text-slate-600 (non-editable indicator)
- Actions: flex gap-2
  - Edit: p-1.5, text-blue-600, hover:bg-blue-50, rounded-lg (hidden for Auto entries if no permission)
  - Delete: p-1.5, text-red-600, hover:bg-red-50, rounded-lg (hidden for Auto entries)
- **Filter Bar:** Above table, flex gap-3
  - Date range: 2 date pickers
  - Category dropdown
  - Entry method dropdown
  - Reset Filters button

### 5.2 Add Income Form (/pendapatan/tambah)
**Layout:** 2-column on desktop (Form left ~65%, Summary sidebar right ~35%)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  TOP NAVBAR                                                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │  Beranda > Pendapatan > Tambah Data                                │  │
│  │                                                                     │  │
│  │  Tambah Data Pendapatan                                             │  │
│  │                                                                     │  │
│  │  ┌─────────────────────────────────────┐ ┌─────────────────────────┐│  │
│  │  │  A. Informasi Pendapatan            │ │    RINGKASAN PENDAPATAN ││  │
│  │  │  ─────────────────────────────────  │ │    ──────────────────── ││  │
│  │  │                                     │ │                         ││  │
│  │  │  Tanggal Pendapatan *               │ │    Subtotal (1 item)    ││  │
│  │  │  ┌─────────────────────────────┐    │ │    Rp 50.000.000       ││  │
│  │  │  │ 📅 23/04/2026              │    │ │                         ││  │
│  │  │  └─────────────────────────────┘    │ │    Diskon               ││  │
│  │  │                                     │ │    ┌─────┐ [ % ▼]     ││  │
│  │  │  Sumber Pendapatan *                │ │    │  0  │              ││  │
│  │  │  ┌─────────────────────────────┐    │ │    └─────┘              ││  │
│  │  │  │ Penjualan Produk     [▼]   │    │ │                         ││  │
│  │  │  └─────────────────────────────┘    │ │    Pajak (PPN 11%)      ││  │
│  │  │                                     │ │    Rp 0                ││  │
│  │  │  Kategori *                         │ │    ──────────────────── ││  │
│  │  │  ┌─────────────────────────────┐    │ │                         ││  │
│  │  │  │ Penjualan            [▼]   │    │ │    TOTAL PENDAPATAN     ││  │
│  │  │  └─────────────────────────────┘    │ │    Rp 50.000.000       ││  │
│  │  │                                     │ │    ████████████████████ ││  │
│  │  │  Metode Penerimaan                  │ │                         ││  │
│  │  │  ┌─────────────────────────────┐    │ │    Informasi Tambahan   ││  │
│  │  │  │ Transfer Bank        [▼]   │    │ │    ──────────────────── ││  │
│  │  │  └─────────────────────────────┘    │ │    Dibuat Oleh: Admin   ││  │
│  │  │                                     │ │    Tanggal: 23/04 22:35 ││  │
│  │  │  Nomor Referensi / Invoice          │ │                         ││  │
│  │  │  ┌─────────────────────────────┐    │ │                         ││  │
│  │  │  │ Contoh: INV021...           │    │ │                         ││  │
│  │  │  └─────────────────────────────┘    │ │                         ││  │
│  │  │                                     │ │                         ││  │
│  │  │  Deskripsi / Keterangan *           │ │                         ││  │
│  │  │  ┌─────────────────────────────┐    │ │                         ││  │
│  │  │  │ Penjualan produk untuk...   │    │ │                         ││  │
│  │  │  └─────────────────────────────┘    │ │                         ││  │
│  │  │                                     │ │                         ││  │
│  │  │  B. Detail Pendapatan               │ │                         ││  │
│  │  │  ─────────────────────────────────  │ │                         ││  │
│  │  │                                     │ │                         ││  │
│  │  │  ┌────┬──────────────────┬────┬────┬────────┬────┐              ││  │
│  │  │  │ No │ Nama Produk      │ Qty│Unit│  Harga │ 🔴 │              ││  │
│  │  │  ├────┼──────────────────┼────┼────┼────────┼────┤              ││  │
│  │  │  │ 1  │ Meja Kantor...   │ 5  │Unit│10.000.0│ 🗑️ │              ││  │
│  │  │  └────┴──────────────────┴────┴────┴────────┴────┘              ││  │
│  │  │  [+ Tambah Item]                    │ │                         ││  │
│  │  │                                     │ │                         ││  │
│  │  │  C. Lampiran (Opsional)             │ │                         ││  │
│  │  │  ┌─────────────────────────────┐    │ │                         ││  │
│  │  │  │ ☁️  Drop files here         │    │ │                         ││  │
│  │  │  │ JPG, PNG, PDF (Maks. 2MB)   │    │ │                         ││  │
│  │  │  └─────────────────────────────┘    │ │                         ││  │
│  │  │                                     │ │                         ││  │
│  │  │  D. Catatan (Opsional)              │ │                         ││  │
│  │  │  ┌─────────────────────────────┐    │ │                         ││  │
│  │  │  │ Catatan tambahan...         │    │ │                         ││  │
│  │  │  └─────────────────────────────┘    │ │                         ││  │
│  │  │                                     │ │                         ││  │
│  │  │  [← Batal]        [💾 Simpan Pendapatan]                     ││  │
│  │  └─────────────────────────────────────┘ └─────────────────────────┘│  │
│  │                                                                     │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Form Layout Specs:**
- Two-column on lg+: left 7/12, right 5/12
- Single column on tablet/mobile
- Gap between columns: 32px
- Section gaps: 32px vertical
- Sidebar card: sticky top-24 (sticks below navbar)

**Field Specifications:**
- Section labels: text-lg, font-semibold, text-slate-800, mb-4
- Label: text-sm, font-medium, text-slate-700, mb-1.5
- Required indicator: text-red-500 asterisk after label
- Input: full width, py-2.5, px-3.5
- Select dropdown: same as input, with chevron icon right
- Date picker: calendar icon left, formatted date
- Textarea: min-height 100px, resize vertical

**Sidebar Summary Specs:**
- Container: bg-white, rounded-xl, border, p-6, sticky
- Row: flex justify-between, py-2
- Label: text-sm, text-slate-600
- Value: text-sm, font-medium, text-slate-900
- Divider: border-t border-slate-200, my-3
- Total: text-base, font-bold, text-blue-600
- Progress bar: h-2, bg-slate-100, rounded-full, overflow-hidden
  - Fill: bg-blue-600, percentage of monthly target (if set)

---

## 6. Expense Module

### 6.1 Expense List Page (/pengeluaran)
**Structure:** Identical to Income List, different columns

```
Table Columns: Tanggal | Jenis Pengeluaran | Kategori | Jumlah | Aksi
Example Data:
- 19/01/2026 | Biaya Operasional | Operasional | Rp 7.500.000 | Edit Delete
- 18/01/2026 | Pembelian Bahan Baku | Pembelian | Rp 5.000.000 | Edit Delete
- 16/01/2026 | Pembayaran Tagihan Listrik | Tagihan | Rp 3.000.000 | Edit Delete
- 14/01/2026 | Gaji Karyawan | Gaji | Rp 25.000.000 | Edit Delete
- 12/01/2026 | Pembelian Inventaris | Operasional | Rp 6.500.000 | Edit Delete
```

### 6.2 Add Expense Form (/pengeluaran/tambah)
**Layout:** Identical structure to Income Form

```
Section A: Informasi Pengeluaran
- Tanggal Pengeluaran *
- Jenis Pengeluaran * (dropdown)
- Kategori * (Operasional, Pembelian, Tagihan, Gaji)
- Metode Pembayaran (Transfer Bank, Tunai, Check)
- Deskripsi / Keterangan *

Section B: Detail Pengeluaran (dynamic item table)
- Nama Item / Deskripsi | Qty | Satuan | Harga Satuan | Total | Delete

Section C: Lampiran (Opsional)
- File drop zone

Section D: Catatan (Opsional)

Sidebar: Ringkasan Pengeluaran
- Subtotal
- Pajak / Biaya Tambahan
- Total Pengeluaran

Footer: [Batal] [Simpan Pengeluaran]
```

---

## 7. E-Invoice Module

### 7.1 Invoice List Page (/e-invoice)
**Layout:** Action bar → Filter tabs → Table

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  TOP NAVBAR                                                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │  Beranda > E-Invoice                                               │  │
│  │                                                                     │  │
│  │  E-Invoice                                                          │  │
│  │                                                                     │  │
│  │  [+ Buat Invoice Baru]            [🔍 Cari invoice...]            │  │
│  │                                                                     │  │
│  │  ┌────────────────────────────────────────────────────────────┐    │  │
│  │  │ [Semua] [Belum Bayar] [Lunas] [Jatuh Tempo] [Dibatalkan]  │    │  │
│  │  └────────────────────────────────────────────────────────────┘    │  │
│  │                                                                     │  │
│  │  ┌───────────────────────────────────────────────────────────────┐  │  │
│  │  │No. Invoice│ Klien          │Tanggal │Jatuh Tempo│ Total    │Status│Aksi│
│  │  ├───────────┼────────────────┼────────┼───────────┼──────────┼──────┼────┤
│  │  │ INV-025   │ PT Maju Sej... │20/01/26│ 25/01/26  │10.000.000│🔴 BB│ 👁  │
│  │  │ INV-018   │ CV Sentosa ... │15/01/26│ 20/01/26  │ 5.500.000│🔴 BB│ 👁  │
│  │  │ INV-015   │ PT Sinar Ab... │10/01/26│ 18/01/26  │ 8.750.000│🔴 BB│ 👁  │
│  │  │ INV-011   │ UD Berkah M... │02/01/26│ 07/01/26  │12.250.000│🟢 L │ 👁  │
│  │  │ INV-009   │ Toko Makmur... │25/12/25│ 30/12/25  │ 4.000.000│🟢 L │ 👁  │
│  │  └───────────┴────────────────┴────────┴───────────┴──────────┴──────┴────┘
│  │                                                                     │  │
│  │  Menampilkan 1-5 dari 25 data        [Sebelumnya] [1] [2] [Selanjutnya]│  │
│  │                                                                     │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Filter Tabs:**
- Horizontal scroll on mobile
- Each tab: px-4 py-2, rounded-full, text-sm
- Active: bg-blue-600 text-white
- Inactive: bg-white text-slate-600 border border-slate-200
- Counter badge: ml-2, bg-slate-100, text-slate-600, px-2, rounded-full, text-xs

**Status Column:**
- Badge with left border accent (3px)
- Belum Bayar: bg-yellow-50, text-yellow-700, border-l-yellow-500
- Lunas: bg-green-50, text-green-700, border-l-green-500
- Jatuh Tempo: bg-red-50, text-red-700, border-l-red-500
- Dibatalkan: bg-slate-50, text-slate-600, border-l-slate-400

### 7.2 Create Invoice Form (/e-invoice/tambah)
**Layout:** 2-column (Form left ~65%, Summary sidebar right ~35%)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  TOP NAVBAR                                                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │  Beranda > E-Invoice > Tambah Invoice                              │  │
│  │                                                                     │  │
│  │  Tambah Invoice Baru                                                │  │
│  │                                                                     │  │
│  │  ┌─────────────────────────────────────┐ ┌─────────────────────────┐│  │
│  │  │  A. Informasi Invoice               │ │    RINGKASAN PEMBAYARAN ││  │
│  │  │  ─────────────────────────────────  │ │    ──────────────────── ││  │
│  │  │                                     │ │                         ││  │
│  │  │  ┌─────────────┐ ┌─────────────┐   │ │    Subtotal             ││  │
│  │  │  │Nomor Invoice│ │Tanggal Inv. │   │ │    Rp 10.000.000       ││  │
│  │  │  │ INV-026     │ │ 📅 20/01/26 │   │ │                         ││  │
│  │  │  └─────────────┘ └─────────────┘   │ │    Pajak (11%)          ││  │
│  │  │  (Auto-generated)   (readonly)     │ │    Rp 1.100.000        ││  │
│  │  │                                     │ │                         ││  │
│  │  │  Tanggal Jatuh Tempo *            │ │    Ongkos Kirim         ││  │  ⭐ NEW
│  │  │  ┌─────────────────────────────┐    │ │    ┌─────────────────┐  ││  │
│  │  │  │ 📅 27/01/2026              │    │ │    │ Rp 250.000       │  ││  │
│  │  │  └─────────────────────────────┘    │ │    └─────────────────┘  ││  │
│  │  │                                     │ │                         ││  │
│  │  │  Status                             │ │    ──────────────────── ││  │
│  │  │  ┌─────────────────────────────┐    │ │                         ││  │
│  │  │  │ Belum Bayar          [▼]   │    │ │    TOTAL AKHIR          ││  │
│  │  │  └─────────────────────────────┘    │ │    Rp 11.350.000       ││  │
│  │  │                                     │ │    ████████████████████ ││  │
│  │  │  B. Data Klien                      │ │                         ││  │
│  │  │  ─────────────────────────────────  │ │    Lampiran (Opsional)  ││  │
│  │  │                                     │ │    ┌─────────────────┐  ││  │
│  │  │  Nama Klien *                       │ │    │ ☁️ Drop files   │  ││  │
│  │  │  ┌─────────────────────────────┐    │ │    │ PDF, JPG, PNG   │  ││  │
│  │  │  │ PT Maju Sejahtera    [▼]   │    │ │    │ Maks. 2MB       │  ││  │
│  │  │  └─────────────────────────────┘    │ │    └─────────────────┘  ││  │
│  │  │  (Auto-fill: Alamat, Kontak, Email) │ │                         ││  │
│  │  │                                     │ │                         ││  │
│  │  │  Alamat Klien                       │ │                         ││  │
│  │  │  ┌─────────────────────────────┐    │ │                         ││  │
│  │  │  │ Jl. Merdeka No.123...       │    │ │                         ││  │
│  │  │  └─────────────────────────────┘    │ │                         ││  │
│  │  │                                     │ │                         ││  │
│  │  │  Kontak          Email              │ │                         ││  │
│  │  │  ┌──────────────┐ ┌──────────────┐  │ │                         ││  │
│  │  │  │ 0812-3456-789│ │info@maju...  │  │ │                         ││  │
│  │  │  └──────────────┘ └──────────────┘  │ │                         ││  │
│  │  │                                     │ │                         ││  │
│  │  │  C. Detail Item                     │ │                         ││  │
│  │  │  ─────────────────────────────────  │ │                         ││  │
│  │  │                                     │ │                         ││  │
│  │  │  ┌────┬──────────────────┬────┬────────────┬────────┬────┐      ││  │
│  │  │  │ No │ Nama Item/Desk.  │ Qty│ Harga Satuan│ Total  │ 🔴 │      ││  │
│  │  │  ├────┼──────────────────┼────┼────────────┼────────┼────┤      ││  │
│  │  │  │ 1  │ Jasa Pengembangan│  1 │ 7.500.000  │7.500.00│ 🗑️ │      ││  │
│  │  │  │ 2  │ Hosting & Domain │  1 │ 1.250.000  │1.250.00│ 🗑️ │      ││  │
│  │  │  │ 3  │ Maintenance (3bln│  1 │ 1.250.000  │1.250.00│ 🗑️ │      ││  │
│  │  │  └────┴──────────────────┴────┴────────────┴────────┴────┘      ││  │
│  │  │  [+ Tambah Item]                  │ │                         ││  │
│  │  │                                     │ │                         ││  │
│  │  │  D. Informasi Pengiriman            │ │                         ││  │  ⭐ NEW
│  │  │  ─────────────────────────────────  │ │                         ││  │
│  │  │                                     │ │                         ││  │
│  │  │  Metode Pengiriman                  │ │                         ││  │
│  │  │  ┌─────────────────────────────┐    │ │                         ││  │
│  │  │  │ JNE Regular          [▼]   │    │ │                         ││  │
│  │  │  └─────────────────────────────┘    │ │                         ││  │
│  │  │                                     │ │                         ││  │
│  │  │  Alamat Pengiriman                  │ │                         ││  │
│  │  │  ┌─────────────────────────────┐    │ │                         ││  │
│  │  │  │ (Same as client / custom)   │    │ │                         ││  │
│  │  │  └─────────────────────────────┘    │ │                         ││  │
│  │  │                                     │ │                         ││  │
│  │  │  E. Catatan (Opsional)              │ │                         ││  │
│  │  │  ┌─────────────────────────────┐    │ │                         ││  │
│  │  │  │ Terima kasih atas keperc... │    │ │                         ││  │
│  │  │  └─────────────────────────────┘    │ │                         ││  │
│  │  │                                     │ │                         ││  │
│  │  │  [← Batal]        [💾 Simpan Invoice]                         ││  │
│  │  └─────────────────────────────────────┘ └─────────────────────────┘│  │
│  │                                                                     │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 7.3 Invoice Calculation with Ongkos Kirim
```
Subtotal         = SUM(line_items.total_price)     = Rp 10.000.000
Pajak (11%)      = Subtotal × 0.11                  = Rp 1.100.000
Ongkos Kirim     = User input (default 0)           = Rp 250.000        ⭐
Discount         = User input (default 0)            = Rp 0
─────────────────────────────────────────────────────────
TOTAL AKHIR      = Subtotal + Pajak + Ongkos Kirim - Discount
                 = 10.000.000 + 1.100.000 + 250.000 - 0
                 = Rp 11.350.000
```

### 7.4 Invoice Detail/Preview Page (/e-invoice/:id)
**Layout:** Action bar → Two-column (Invoice preview left ~70%, Actions sidebar right ~30%)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  TOP NAVBAR                                                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │  Beranda > E-Invoice > INV-025                                     │  │
│  │                                                                     │  │
│  │  ┌─────────────────────────────────────────────────────────────┐   │  │
│  │  │ [← Kembali]    INV-025    [🖨️ Cetak] [✉️ Kirim Email] [⚙️] │   │  │
│  │  └─────────────────────────────────────────────────────────────┘   │  │
│  │                                                                     │  │
│  │  ┌─────────────────────────────────────┐ ┌─────────────────────────┐│  │
│  │  │                                     │ │    STATUS & AKSI         ││  │
│  │  │     [INVOICE PREVIEW — A4 Size]     │ │    ──────────────────── ││  │
│  │  │                                     │ │                         ││  │
│  │  │  ┌───────────────────────────────┐  │ │    Status Saat Ini      ││  │
│  │  │  │ [LOGO]    INVOICE             │  │ │    ┌─────────────────┐  ││  │
│  │  │  │           PT GMera Solusi     │  │ │    │ 🔴 BELUM BAYAR  │  ││  │
│  │  │  │           Jl. Address...      │  │ │    └─────────────────┘  ││  │
│  │  │  │                              │  │ │                         ││  │
│  │  │  │  Kepada:                      │  │ │    [✓ Tandai Lunas]     ││  │
│  │  │  │  PT Maju Sejahtera            │  │ │    [✏️ Edit Invoice]    ││  │
│  │  │  │  Jl. Merdeka No.123...        │  │ │    [🗑️ Hapus Invoice]   ││  │
│  │  │  │                              │  │ │                         ││  │
│  │  │  │  No. Invoice: INV-025         │  │ │    ──────────────────── ││  │
│  │  │  │  Tanggal: 20 Januari 2026    │  │ │    Riwayat Perubahan    ││  │
│  │  │  │  Jatuh Tempo: 25 Jan 2026    │  │ │    ┌─────────────────┐  ││  │
│  │  │  │                              │  │ │    │ Dibuat: Admin   │  ││  │
│  │  │  │  ┌────────────────────────┐  │  │ │    │ 20/01 10:30     │  ││  │
│  │  │  │  │ Item      Qty   Harga  │  │  │ │    └─────────────────┘  ││  │
│  │  │  │  ├────────────────────────┤  │  │ │                         ││  │
│  │  │  │  │ Jasa...    1   7.500.0 │  │  │ │    ──────────────────── ││  │
│  │  │  │  │ Hosting    1   1.250.0 │  │  │ │    Info Pembayaran      ││  │
│  │  │  │  │ Maint...   1   1.250.0 │  │  │ │    Total: Rp 11.350.000 ││  │
│  │  │  │  └────────────────────────┘  │  │ │    Jatuh Tempo: 25/01   ││  │
│  │  │  │                              │  │ │    [📋 Copy Link]       ││  │
│  │  │  │  Subtotal      Rp 10.000.000 │  │ │                         ││  │
│  │  │  │  Pajak (11%)    Rp 1.100.000 │  │ │                         ││  │
│  │  │  │  Ongkos Kirim     Rp 250.000 │  │ │                         ││  │
│  │  │  │  ─────────────────────────── │  │ │                         ││  │
│  │  │  │  TOTAL          Rp 11.350.00│  │ │                         ││  │
│  │  │  │                              │  │ │                         ││  │
│  │  │  │  Terima kasih...             │  │ │                         ││  │
│  │  │  │                              │  │ │                         ││  │
│  │  │  │  ─────────────────────────── │  │ │                         ││  │
│  │  │  │  Dibuat oleh: Admin         │  │ │                         ││  │
│  │  │  │  20 Januari 2026             │  │ │                         ││  │
│  │  │  └───────────────────────────────┘  │ │                         ││  │
│  │  │                                     │ │                         ││  │
│  │  └─────────────────────────────────────┘ └─────────────────────────┘│  │
│  │                                                                     │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 8. Reports Module (/laporan)

### 8.1 Reports Dashboard
**Layout:** 3-column card grid for report types

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  TOP NAVBAR                                                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │  Beranda > Laporan                                                 │  │
│  │                                                                     │  │
│  │  Laporan Keuangan                                                   │  │
│  │                                                                     │  │
│  │  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐      │  │
│  │  │  📈             │ │  📉             │ │  📊             │      │  │
│  │  │  Laporan        │ │  Laporan        │ │  Laporan        │      │  │
│  │  │  Pendapatan     │ │  Pengeluaran    │ │  Gabungan       │      │  │
│  │  │                 │ │                 │ │                 │      │  │
│  │  │  Ringkasan      │ │  Ringkasan      │ │  Pendapatan &   │      │  │
│  │  │  pendapatan     │ │  pengeluaran    │ │  pengeluaran    │      │  │
│  │  │  dalam periode  │ │  dalam periode  │ │  dalam periode  │      │  │
│  │  │  tertentu       │ │  tertentu       │ │  tertentu       │      │  │
│  │  │                 │ │                 │ │                 │      │  │
│  │  │  ┌─────────────┐  │ │  ┌─────────────┐  │ │  ┌─────────────┐  │      │  │
│  │  │  │ 📅 01/01/26 │  │ │  │ 📅 01/01/26 │  │ │  │ 📅 01/01/26 │  │      │  │
│  │  │  │    ↓        │  │ │  │    ↓        │  │ │  │    ↓        │  │      │  │
│  │  │  │ 📅 31/01/26 │  │ │  │ 📅 31/01/26 │  │ │  │ 📅 31/01/26 │  │      │  │
│  │  │  └─────────────┘  │ │  └─────────────┘  │ │  └─────────────┘  │      │  │
│  │  │                 │ │                 │ │                 │      │  │
│  │  │  [📄 PDF] [📊 Excel]              │  │  [📄 PDF] [📊 Excel]              │  │  [📄 PDF] [📊 Excel]              │  │
│  │  └─────────────────┘ └─────────────────┘ └─────────────────┘      │  │
│  │                                                                     │  │
│  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │  │
│  │                                                                     │  │
│  │  LAPORAN TERAKHIR DIBUAT                                            │  │
│  │  ┌───────────────────────────────────────────────────────────────┐ │  │
│  │  │ Nama Laporan          │ Periode       │ Dibuat     │ Aksi    │ │  │
│  │  ├───────────────────────┼───────────────┼────────────┼─────────┤ │  │
│  │  │ Laporan_Pendapatan_.. │ 01-31 Jan 2026│ 23 Apr 2026│ 📥 📄 │ │  │
│  │  │ Laporan_Gabungan_..   │ 01-31 Mar 2026│ 15 Apr 2026│ 📥 📄 │ │  │
│  │  └───────────────────────────────────────────────────────────────┘ │  │
│  │                                                                     │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Report Card Specs:**
- Container: bg-white, rounded-xl, p-6, border, hover:shadow-md transition
- Icon: w-16 h-16, rounded-2xl, centered, text-3xl
  - Income: bg-green-100, text-green-600
  - Expense: bg-red-100, text-red-600
  - Combined: bg-blue-100, text-blue-600
- Date Range: 2 inline date pickers, flex gap-2
- Actions: flex gap-3, mt-4
  - PDF: flex-1, bg-red-600, hover:bg-red-700
  - Excel: flex-1, bg-green-600, hover:bg-green-700

---

## 9. Client Module (/klien)

### 9.1 Client List Page
**Layout:** Action bar → Table

```
Table Columns: Nama Klien | Alamat | Telepon | Email | Total Invoice | Aksi

Actions:
- [👁 Lihat] → Shows client detail + invoice history
- [✏️ Edit] → Edit form
- [🗑️ Hapus] → Delete if no invoices
```

### 9.2 Add Client Form
**Layout:** Single column form, max-width 640px, centered

```
Fields:
- Nama Klien / Perusahaan *
- NPWP (Opsional)
- Alamat Lengkap *
- Kota, Provinsi, Kode Pos
- Nomor Telepon *
- Email
- Catatan (Opsional)

Buttons: [Batal] [Simpan Klien]
```

---

## 10. Settings Module (/pengaturan)

### 10.1 Settings Navigation
**Layout:** Sidebar tabs → Content area

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  TOP NAVBAR                                                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │  Beranda > Pengaturan                                              │  │
│  │                                                                     │  │
│  │  ┌─────────────┐ ┌────────────────────────────────────────────────┐  │  │
│  │  │ [🏢]        │ │  PROFIL PERUSAHAAN                          │  │  │
│  │  │ Profil      │ │  ────────────────────────────────────────── │  │  │
│  │  │ Perusahaan  │ │                                             │  │  │
│  │  │             │ │  Logo Perusahaan                            │  │  │
│  │  │ [👥]        │ │  ┌─────────────────────────────────────┐  │  │  │
│  │  │ Manajemen   │ │  │  [Preview Logo or Placeholder]      │  │  │  │
│  │  │ Pengguna    │ │  │  [Unggah Logo]                      │  │  │  │
│  │  │             │ │  │  Rekomendasi: 400×200px, PNG        │  │  │  │
│  │  │ [🏷️]        │ │  └─────────────────────────────────────┘  │  │  │
│  │  │ Kategori    │ │                                             │  │  │
│  │  │             │ │  Nama Perusahaan *                        │  │  │
│  │  │ [💰]        │ │  ┌─────────────────────────────────────┐  │  │  │
│  │  │ Pengaturan  │ │  │ PT GMera Solusi                     │  │  │  │
│  │  │ Pajak       │ │  └─────────────────────────────────────┘  │  │  │
│  │  │             │ │                                             │  │  │
│  │  │ [💳]        │ │  Alamat *                                   │  │  │
│  │  │ Metode      │ │  ┌─────────────────────────────────────┐  │  │  │
│  │  │ Pembayaran  │ │  │ Perumahan Griya Curug Blok A3...    │  │  │  │
│  │  │             │ │  └─────────────────────────────────────┘  │  │  │
│  │  │             │ │                                             │  │  │
│  │  │             │ │  Telepon *              Email *           │  │  │
│  │  │             │ │  ┌──────────────────┐ ┌──────────────────┐  │  │  │
│  │  │             │ │  │ (021) 1234 5678  │ │ info@gmera...    │  │  │  │
│  │  │             │ │  └──────────────────┘ └──────────────────┘  │  │  │
│  │  │             │ │                                             │  │  │
│  │  │             │ │  Informasi Bank                             │  │  │
│  │  │             │ │  ┌─────────────────────────────────────┐  │  │  │
│  │  │             │ │  │ Nama Bank: BCA                      │  │  │  │
│  │  │             │ │  │ No. Rekening: 1234567890            │  │  │  │
│  │  │             │ │  │ Atas Nama: PT GMera Solusi          │  │  │  │
│  │  │             │ │  └─────────────────────────────────────┘  │  │  │
│  │  │             │ │                                             │  │  │
│  │  │             │ │  [Simpan Perubahan]                         │  │  │
│  │  │             │ │                                             │  │  │
│  │  └─────────────┘ └────────────────────────────────────────────────┘  │  │
│  │                                                                     │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Settings Sidebar:**
- Width: 260px, fixed left
- Container: bg-white, border-r, h-full
- Menu item: px-4 py-3, flex gap-3, text-slate-600, hover:bg-slate-50
- Active: bg-blue-50, text-blue-600, border-l-3 border-blue-600
- Icon: w-5 h-5

### 10.2 User Management Sub-page
```
Table: Nama | Email | Peran | Status | Terakhir Login | Aksi
Actions: [✏️] [🔒 Reset Password] [🗑️]

[ + Tambah Pengguna ] Button top-right
Add User Modal:
  - Nama *
  - Email *
  - Peran * (dropdown)
  - Password * (auto-generated toggle)
  - Telepon
  - Status: Aktif / Nonaktif
```

### 10.3 Categories Sub-page
```
Two tabs: [Pendapatan] [Pengeluaran]
Each tab:
  - Table: Nama | Deskripsi | Jumlah Transaksi | Aksi
  - [+ Tambah Kategori]
  - Edit/Delete actions
```

---

## 11. Responsive Breakpoints

| Breakpoint | Width | Layout Changes |
|------------|-------|----------------|
| Mobile | < 640px | Single column, stacked cards, hamburger nav, horizontal scroll tables |
| Tablet | 640-1024px | 2-column grids, condensed navbar, sidebar becomes overlay |
| Desktop | 1024-1440px | Full layout, 3-4 column grids, sticky sidebars |
| Wide | > 1440px | Centered max-width container, enhanced whitespace |

### Mobile Adaptations
- **Navbar:** Hamburger menu, logo + user only
- **Summary Cards:** Horizontal scroll container, snap to card
- **Tables:** Card-based list view instead of table (or horizontal scroll)
- **Forms:** Single column, sidebar moves below form
- **Charts:** Simplified, touch-friendly tooltips
- **Modals:** Full-screen overlay on mobile

---

*End of Wireframe Documentation*
