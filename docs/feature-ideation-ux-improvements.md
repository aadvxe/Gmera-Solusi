# Sistem Informasi Keuangan — Feature Ideation & UX Improvements
## PT GMera Solusi — Beyond the Client's Mockups

**Version:** 1.0  
**Date:** April 30, 2026  
**Purpose:** Define new features, UX improvements, and development prioritization

---

## Table of Contents
1. [Ongkos Kirim Integration](#1-ongkos-kirim-integration--shipping-cost)
2. [Dashboard UX Overhaul](#2-dashboard-ux-overhaul)
3. [New Module: Client Management](#3-new-module-client-management)
4. [New Module: Audit Trail](#4-new-module-audit-trail)
5. [UX Improvements by Module](#5-ux-improvements-by-module)
6. [Advanced Features (Phase 2)](#6-advanced-features-phase-2)
7. [Feature Prioritization Matrix](#7-feature-prioritization-matrix)

---

## 1. Ongkos Kirim Integration — Shipping Cost

### 1.1 Business Context
PT GMera Solusi is a **manufacturing company** in Tangerang. They sell physical products (office furniture — "meja kantor" visible in income form). When selling to clients outside their immediate area, shipping costs must be:
- Documented on the invoice
- Added to the total calculation
- Tracked for cost analysis

### 1.2 Integration Points

#### A. Invoice Form (/e-invoice/tambah)
**New Section: D. Informasi Pengiriman**
```
Fields Added:
├── Ongkos Kirim (Shipping Cost) — Input: Currency field, default Rp 0
├── Metode Pengiriman — Select: JNE Regular, JNE YES, TIKI, POS, GoSend, GrabExpress, Custom
├── No. Resi (Tracking Number) — Text input, optional
├── Alamat Pengiriman — Textarea, default = client address, editable
└── Estimasi Sampai — Date, auto-calculated based on courier + destination
```

#### B. Invoice Calculation Engine
```javascript
// Updated calculation formula
function calculateInvoiceTotal(data) {
  const subtotal = data.items.reduce((sum, item) => sum + item.total, 0);
  const taxAmount = subtotal * (data.taxRate / 100);
  const shippingCost = data.shippingCost || 0;  // ⭐ NEW
  const discountAmount = data.discountAmount || 0;
  
  const grandTotal = subtotal + taxAmount + shippingCost - discountAmount;
  
  return {
    subtotal,
    taxAmount,
    shippingCost,        // ⭐ Display in sidebar & PDF
    discountAmount,
    grandTotal
  };
}
```

#### C. Invoice Sidebar Summary — Updated
```
RINGKASAN PEMBAYARAN
────────────────────
Subtotal             Rp 10.000.000
Pajak (11%)          Rp 1.100.000
Ongkos Kirim         Rp 250.000        ⭐ NEW FIELD
────────────────────
TOTAL AKHIR          Rp 11.350.000
```

#### D. Invoice PDF — Updated Layout
```
┌─────────────────────────────────────┐
│          INVOICE HEADER             │
├─────────────────────────────────────┤
│ Item Table                          │
│ Subtotal        Rp 10.000.000       │
│ Pajak (11%)      Rp 1.100.000       │
│ Ongkos Kirim       Rp 250.000       │  ⭐ NEW LINE
│ ─────────────────────────────────── │
│ TOTAL           Rp 11.350.000       │
│                                     │
│ Metode Pengiriman: JNE Regular      │  ⭐ NEW SECTION
│ No. Resi: JNE123456789              │
│ Estimasi: 3-5 Hari Kerja            │
└─────────────────────────────────────┘
```

#### E. Database Schema Update
```sql
-- Add to invoices table
ALTER TABLE invoices ADD COLUMN shipping_cost DECIMAL(15,2) DEFAULT 0.00;
ALTER TABLE invoices ADD COLUMN shipping_method VARCHAR(50) NULL;
ALTER TABLE invoices ADD COLUMN tracking_number VARCHAR(100) NULL;
ALTER TABLE invoices ADD COLUMN shipping_address TEXT NULL;
ALTER TABLE invoices ADD COLUMN estimated_arrival DATE NULL;
```

#### F. Dashboard Integration
- New summary card: "Total Ongkos Kirim Bulan Ini" (shows shipping cost totals)
- New report type: "Laporan Ongkos Kirim" — breakdown by courier, destination, client

#### G. Income Linkage Logic
When invoice is marked as paid:
```
Auto-income created with:
  source: "Invoice INV-026"
  amount: grandTotal (INCLUDING shipping cost)
  // Shipping is revenue-bearing, so total invoice amount becomes income
```

### 1.3 Courier Database (Seed Data)
| Kode | Nama | Tipe | Estimasi Default |
|------|------|------|------------------|
| jne_reg | JNE Regular | Darat | 3-5 hari |
| jne_yes | JNE YES | Express | 1-2 hari |
| tiki_reg | TIKI Regular | Darat | 3-5 hari |
| tiki_ons | TIKI ONS | Express | 1-2 hari |
| pos_reg | POS Indonesia | Darat | 5-7 hari |
| pos_express | POS Express | Express | 2-3 hari |
| gosend | GoSend | Same-day | Same-day |
| grab_express | GrabExpress | Same-day | Same-day |
| custom | Lainnya | Custom | Manual input |

---

## 2. Dashboard UX Overhaul

### 2.1 Problems with Current Mockup

| # | Problem | Impact | Severity |
|---|---------|--------|----------|
| 1 | **No date range filter** | Users see all-time data only, can't analyze periods | High |
| 2 | **E-Invoice line on chart** | Mixing receivables (E-Invoice) with cash flow (Income/Expense) is confusing | High |
| 3 | **Garbled widget** | "Anteplan Gana keuangan" — placeholder text makes UI look broken | Medium |
| 4 | **No status alerts** | Overdue invoices hidden in side panel, no urgency indicators | High |
| 5 | **"Transaksi Terbaru" icons unclear** | "BP", "BF" labels have no meaning to users | Medium |
| 6 | **No quick actions** | To create anything, user must navigate through menu | Medium |
| 7 | **Download Laporan unclear** | Button at bottom with unclear scope | Low |

### 2.2 Recommended Dashboard Redesign

#### A. Period Selector (Top Bar)
```
📅 Periode: [Hari Ini ▼]  [←] [→]  📍 Dashboard Keuangan Overview
```
- Dropdown: Hari Ini, Minggu Ini, Bulan Ini, Kuartal Ini, Tahun Ini, Kustom
- Arrow buttons: Navigate to previous/next period
- Default: Bulan Ini (manufacturing companies think monthly)

#### B. Summary Cards (4 → 5 cards)
```
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ 💰           │ │ 📤           │ │ 📥           │ │ 📊           │ │ 🚚           │
│ Pendapatan   │ │ Pengeluaran  │ │ Saldo        │ │ Invoice      │ │ Ongkos       │
│ Rp 350jt     │ │ Rp 120jt     │ │ Rp 230jt     │ │ 8 Belum      │ │ Kirim        │
│ [+12% ▲]     │ │ [-5% ▼]      │ │ [+8% ▲]      │ │ Bayar        │ │ Rp 2.5jt     │
│ vs bulan lalu│ │ vs bulan lalu│ │ vs bulan lalu│ │ Rp 45jt total│ │ 12 pengiriman│
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘
```

#### C. Chart — Fixed & Improved
```
Title: Perbandingan Pendapatan vs Pengeluaran
Y-Axis: Rupiah (auto-formatted: jutaan)
X-Axis: Time periods based on selected filter
Series:
  - Pendapatan (Green bars)
  - Pengeluaran (Red bars)
  - [REMOVED: E-Invoice line — moved to separate widget]

New Widget: "Invoice Trend"
  - Mini line chart showing invoice issuance vs payment over time
  - Separate from cash flow chart to avoid confusion
```

#### D. Unpaid Invoices — Enhanced
```
⚠ INVOICE JATUH TEMPO DEKAT (3)
┌─────────────────────────────────────────┐
│ 🔴 INV-025  Rp 10.000.000   2 hari lagi │
│ 🟡 INV-018   Rp 5.500.000   5 hari lagi │
│ 🟡 INV-015   Rp 8.750.000   8 hari lagi │
│                                         │
│ [Kirim Pengingat 📧]  [Lihat Semua →]   │
└─────────────────────────────────────────┘
```
- Color coding: Red = overdue, Yellow = due within 7 days
- Quick action: Send reminder email directly from dashboard

#### E. Recent Transactions — Improved
```
📋 TRANSAKSI TERBARU
┌─────────────────────────────────────────┐
│ 💰  Penjualan Produk           +50jt │
│     Pendapatan · 20/01/26 · Admin     │
├─────────────────────────────────────────┤
│ 📄  Pembayaran Invoice INV-021  +15jt │
│     Piutang · 19/01/26 · Auto         │
├─────────────────────────────────────────┤
│ 📦  Pembelian Bahan Baku        -5jt  │
│     Pembelian · 19/01/26 · Admin      │
└─────────────────────────────────────────┘
```
- Clear icon + category + amount + sign (+/-)
- Color-coded amounts: Green income, Red expense

#### F. Quick Actions Panel (New)
```
⚡ AKSI CEPAT
┌─────────────────────────────────────────┐
│ [+ 💰] Catat Pendapatan                │
│ [+ 📤] Catat Pengeluaran               │
│ [+ 📄] Buat Invoice Baru               │
│ [📥]   Export Laporan Bulan Ini        │
└─────────────────────────────────────────┘
```

#### G. New Widget: Financial Health Score
```
🏥 KESEHATAN KEUANGAN
┌─────────────────────────────────────────┐
│                                         │
│     ┌─────────┐                         │
│     │   78%   │ ← Circular progress     │
│     │  BAIK   │                         │
│     └─────────┘                         │
│                                         │
│  Rasio Pengeluaran: 34%                 │
│  [████████░░░░░░░░░░]                   │
│                                         │
│  Target aman: < 60%                     │
└─────────────────────────────────────────┘
```
- Calculated as: (Expense / Income) × 100
- Green: < 60%, Yellow: 60-80%, Red: > 80%

---

## 3. New Module: Client Management (/klien)

### 3.1 Why It's Needed
The client's mockup shows "PT Maju Sejahtera", "CV Sentosa Jaya", etc. as invoice clients. Currently, these must be manually typed every time. This causes:
- Typos in client names
- Inconsistent addressing
- No client history visibility
- No client-level reporting

### 3.2 Features

#### A. Client Database
```
Table: Nama Perusahaan | NPWP | Alamat | Telepon | Email | Total Invoice | Total Nilai | Aksi
```

#### B. Client Detail Page
```
┌─────────────────────────────────────────┐
│ PT Maju Sejahtera                       │
│ Jl. Merdeka No.123, Jakarta Pusat       │
│ 📞 0812-3456-7890  ✉️ info@maju.com     │
├─────────────────────────────────────────┤
│ 📊 RINGKASAN KLIEN                      │
│ Total Invoice: 12   │   Total Nilai: Rp 150.000.000
│ Lunas: 8            │   Belum Bayar: Rp 35.000.000 (4 invoice)
├─────────────────────────────────────────┤
│ 📄 RIWAYAT INVOICE                      │
│ [Table: No. | Tanggal | Total | Status │
├─────────────────────────────────────────┤
│ 💰 RIWAYAT PEMBAYARAN                   │
│ [Table: Tanggal | Jumlah | Metode | Ref]
└─────────────────────────────────────────┘
```

#### C. Client Auto-fill on Invoice
When creating invoice:
```
Nama Klien: [PT Maju Sejahtera ▼]
→ Auto-populates:
   - Alamat: Jl. Merdeka No.123...
   - Telepon: 0812-3456-7890
   - Email: info@majusejahtera.co.id
→ User can override if needed (e.g., different shipping address)
```

### 3.3 Database Schema
```sql
CREATE TABLE clients (
  id UUID PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  npwp VARCHAR(50),
  address TEXT,
  city VARCHAR(100),
  province VARCHAR(100),
  postal_code VARCHAR(20),
  phone VARCHAR(20),
  email VARCHAR(255),
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

---

## 4. New Module: Audit Trail (/audit-log)

### 4.1 Why It's Needed
Multi-user financial system = accountability requirement. Without audit logs:
- Can't trace who deleted a record
- Can't recover from accidental changes
- No compliance trail for tax purposes

### 4.2 Features

#### A. Audit Log Table
```
Tanggal        Pengguna    Aksi      Modul      Detail
─────────────────────────────────────────────────────────────
23/04 14:30    admin       CREATE    Invoice    INV-026 created for PT Maju
23/04 14:15    staff_1     UPDATE    Income     #123 amount changed 50jt→55jt
23/04 13:45    staff_1     DELETE    Expense    #45 "Biaya Operasional" deleted
23/04 10:20    admin       LOGIN     Auth       Successful login from 192.168.1.1
```

#### B. Record-level History
On every Income/Expense/Invoice detail page:
```
[Tab: Detail] [Tab: Riwayat Perubahan]

Riwayat Perubahan:
┌─────────────────────────────────────────┐
│ 23/04 14:15  staff_1  MENGUBAH          │
│                                         │
│ Jumlah:                                 │
│   Sebelum: Rp 50.000.000               │
│   Sesudah:  Rp 55.000.000              │
│                                         │
│ Deskripsi:                              │
│   Sebelum: "Penjualan produk"          │
│   Sesudah:  "Penjualan produk + ongkir"│
└─────────────────────────────────────────┘
```

### 4.3 Implementation
- Middleware logs every POST/PUT/DELETE
- Stores old_values and new_values as JSONB
- Retention: 2 years (configurable)
- Accessible by: Super Admin, Finance Manager only

---

## 5. UX Improvements by Module

### 5.1 Global Improvements

| Improvement | Current | Proposed | Benefit |
|-------------|---------|----------|---------|
| **Loading States** | None | Skeleton screens + spinners | Perceived performance |
| **Empty States** | Blank tables | Illustration + CTA | User guidance |
| **Confirmation Modals** | Browser confirm | Styled modal with context | Professional feel, less accidental deletes |
| **Toast Notifications** | None | Top-right, auto-dismiss | Feedback on every action |
| **Keyboard Shortcuts** | None | Ctrl+Shift+N = New, Ctrl+S = Save | Power user efficiency |
| **Breadcrumbs** | Simple text | Clickable path with icons | Navigation clarity |
| **Sticky Action Bars** | Actions at top only | Bottom sticky bar on mobile | Mobile usability |

### 5.2 Income/Expense Forms — Improvements

| # | Improvement | Detail |
|---|-------------|--------|
| 1 | **Smart Defaults** | Date = today, Category = most used, Payment = Transfer Bank |
| 2 | **Duplicate Detection** | Warn if same amount + date + description exists |
| 3 | **Auto-save Draft** | Save form state to localStorage every 30 seconds |
| 4 | **Bulk Upload** | Upload CSV/Excel for bulk income/expense entry |
| 5 | **Recurring Transactions** | Mark as "Recurring Monthly" — auto-creates next month |
| 6 | **Template Items** | Save frequent item combinations as templates |

### 5.3 Invoice Module — Improvements

| # | Improvement | Detail |
|---|-------------|--------|
| 1 | **Invoice Templates** | 3 designs: Standard, Minimal, Detailed |
| 2 | **Email Template** | Editable email body when sending invoice |
| 3 | **Payment Link** | Generate shareable URL for online payment (future) |
| 4 | **Partial Payment** | Allow recording partial payments on invoices |
| 5 | **Invoice Notes on PDF** | Custom footer text per invoice |
| 6 | **Delivery Confirmation** | Checkbox: "Barang sudah diterima client" |
| 7 | **Multi-page Invoices** | Support >10 items with pagination on PDF |

### 5.4 Reports — Improvements

| # | Improvement | Detail |
|---|-------------|--------|
| 1 | **Schedule Reports** | Auto-generate monthly report on 1st of month |
| 2 | **Comparison Mode** | Compare this month vs last month vs same month last year |
| 3 | **Chart in PDF** | Include bar chart visual in exported PDF |
| 4 | **Custom Report Builder** | Drag-and-drop fields to build custom report |
| 5 | **Email Reports** | Auto-send monthly report to owner/manager |

---

## 6. Advanced Features (Phase 2)

### 6.1 Inventory Integration
Since PT GMera Solusi is a manufacturer:
```
┌─────────────────────────────────────────┐
│ MODUL INVENTORI (Future Phase)          │
│                                         │
│ Link expense "Pembelian Bahan Baku"     │
│ → to inventory stock-in                   │
│                                         │
│ Link income "Penjualan Produk"           │
│ → to inventory stock-out                  │
│                                         │
│ Low stock alerts                          │
│ COGS (Cost of Goods Sold) tracking        │
└─────────────────────────────────────────┘
```

### 6.2 Multi-Company / Branch Support
```
PT GMera Solusi
├── Cabang Tangerang (HQ)
├── Cabang Jakarta
└── Cabang Bandung

Each branch: Separate books, consolidated reports at HQ
```

### 6.3 Bank Integration (Future)
```
Connect to BCA / Mandiri / BRI API:
- Auto-import transactions
- Auto-match with invoices
- Real cash balance
```

### 6.4 WhatsApp Integration
```
Send invoice via WhatsApp:
- PDF attachment
- Payment confirmation bot
- Due date reminders
```

### 6.5 Tax Reporting (E-Faktur Integration)
```
Generate E-Faktur compatible CSV:
- PPN 11% breakdown per invoice
- Monthly SPT report preparation
- NPWP validation
```

---

## 7. Feature Prioritization Matrix

### 7.1 MoSCoW Prioritization

#### MUST HAVE (MVP — Week 1-6)
These are required for the system to function as a replacement for Excel:

| # | Feature | Effort | Business Value |
|---|---------|--------|----------------|
| 1 | Multi-role auth (5 roles) | Medium | Critical |
| 2 | Income CRUD + items table | Medium | Critical |
| 3 | Expense CRUD + items table | Medium | Critical |
| 4 | Invoice creation + line items | Medium | Critical |
| 5 | Invoice PDF generation | Medium | Critical |
| 6 | Basic dashboard (summary + chart) | Medium | High |
| 7 | Income/Expense/Combined reports + export | Medium | High |
| 8 | **Ongkos Kirim on invoice** | Low | High |
| 9 | Client database + auto-fill | Medium | High |
| 10 | Company profile settings | Low | Medium |

#### SHOULD HAVE (Week 7-8)
Significantly improve UX but system works without them:

| # | Feature | Effort | Business Value |
|---|---------|--------|----------------|
| 11 | Dashboard date range filter | Low | High |
| 12 | Invoice status lifecycle (paid → auto-income) | Medium | High |
| 13 | Email invoice to client | Medium | Medium |
| 14 | Audit trail | Medium | Medium |
| 15 | User management | Medium | Medium |
| 16 | Category management | Low | Medium |
| 17 | Attachment upload | Low | Medium |
| 18 | Overdue invoice alerts | Low | High |
| 19 | Toast notifications | Low | Medium |
| 20 | Confirmation modals | Low | Medium |

#### COULD HAVE (Phase 2 — Month 2)
Nice to have, can be added later:

| # | Feature | Effort | Business Value |
|---|---------|--------|----------------|
| 21 | Inventory integration | High | Medium |
| 22 | Recurring transactions | Medium | Medium |
| 23 | Bulk CSV upload | Medium | Low |
| 24 | Invoice templates (multiple designs) | Medium | Low |
| 25 | WhatsApp integration | High | Medium |
| 26 | Scheduled reports | Medium | Low |
| 27 | Financial health score | Low | Medium |
| 28 | Bank API integration | High | High |
| 29 | Multi-branch support | High | Medium |
| 30 | E-Faktur export | Medium | High |

#### WON'T HAVE (Future)
Not in scope for current engagement:

- Mobile native app (PWA is sufficient)
- AI-powered forecasting
- Multi-currency support (assume IDR only)
- Payroll module (beyond expense tracking)
- CRM features (beyond client DB)

### 7.2 Development Timeline

```
WEEK 1-2:  [████████████████████] Foundation + Auth + Users + Company Profile
WEEK 3-4:  [████████████████████] Income + Expense (full CRUD, items, attachments)
WEEK 5-6:  [████████████████████] E-Invoice (create, PDF, ongkos kirim, client DB)
WEEK 7:    [████████████░░░░░░░░] Dashboard (improved) + Reports + Export
WEEK 8:    [████████████░░░░░░░░] Polish: Audit trail, notifications, testing
           
MVP READY  ████████████████████  Week 8
```

---

## 8. UX Quick Wins (Implement Immediately)

These require minimal effort but maximum impact:

1. **Skeleton Loading** — Replace blank screens with animated skeleton cards
2. **Empty State Illustrations** — When no data, show friendly illustration + "Add your first X" CTA
3. **Sticky Navbar** — Navbar stays visible on scroll
4. **Form Autosave** — localStorage backup every 30 seconds
5. **Number Formatting** — All amounts formatted as Rp 50.000.000 (not 50000000)
6. **Date Formatting** — 20 Januari 2026 (not 20/01/2026) in UI
7. **Success/Error Toasts** — Every action gives feedback
8. **Breadcrumb Navigation** — Clickable path on every page
9. **Responsive Tables** — Card view on mobile, not squished tables
10. **Keyboard Shortcuts** — Ctrl+Shift+N for "New", Escape to close modals

---

*End of Feature Ideation & UX Improvements*
