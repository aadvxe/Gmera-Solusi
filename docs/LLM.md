# Code Notes For Maintainers And LLMs

Last updated: 2026-06-06.

This file is the compact codebase map. Use it when you need to understand where a feature lives before editing.

## App Shell

| File | What it does |
| --- | --- |
| `src/app/layout.tsx` | Sets root metadata, Poppins font, global styles, body classes, and the toast host. |
| `src/app/page.tsx` | Redirects root visits to `/beranda`. |
| `src/app/login/page.tsx` | Handles Supabase email/password login, profile enrichment, and post-login routing. |
| `src/app/(dashboard)/layout.tsx` | Wraps dashboard pages in auth, sidebar, navbar, and layout spacing. |
| `middleware.ts` | Refreshes Supabase session cookies and redirects unauthenticated protected routes. |

## Dashboard Pages

| File | What it does |
| --- | --- |
| `src/app/(dashboard)/beranda/page.tsx` | Main dashboard with KPI cards, chart modes, unpaid invoice panel, top clients/products, and recent activity. |
| `src/app/(dashboard)/pendapatan/page.tsx` | Income list with filtering, editing, deletion, and exports. |
| `src/app/(dashboard)/pendapatan/tambah/page.tsx` | Income creation form with item rows and attachment support. |
| `src/app/(dashboard)/pengeluaran/page.tsx` | Expense list with filtering, editing, deletion, and exports. |
| `src/app/(dashboard)/pengeluaran/tambah/page.tsx` | Expense creation form with item rows and attachment support. |
| `src/app/(dashboard)/e-invoice/page.tsx` | Invoice list with status filters, payment actions, export, and deletion. |
| `src/app/(dashboard)/e-invoice/buat/page.tsx` | Invoice creation form, item pagination preview logic, totals, tax, discount, shipping, and save. |
| `src/app/(dashboard)/e-invoice/[id]/detail/page.tsx` | Invoice detail/preview page with print-style pagination. |
| `src/app/(dashboard)/e-invoice/[id]/edit/page.tsx` | Invoice edit form that reloads invoice/items and replaces item rows on save. |
| `src/app/(dashboard)/customer/page.tsx` | Customer list, stats cards, customer create/edit/delete entry points, and invoice/customer metrics. |
| `src/app/(dashboard)/customer/tambah/page.tsx` | Customer creation form. |
| `src/app/(dashboard)/customer/[id]/page.tsx` | Customer detail screen; currently mock-backed. |
| `src/app/(dashboard)/laporan/page.tsx` | Financial report screen and export controls. |
| `src/app/(dashboard)/pengaturan/page.tsx` | Company profile, users, categories, tax, payment settings, and audit-triggering updates. |
| `src/app/(dashboard)/profil/page.tsx` | Current user profile display/update screen. |
| `src/app/(dashboard)/pencarian/page.tsx` | Dedicated search page using the global search helper. |

## Components

| File | What it does |
| --- | --- |
| `src/components/AuthProvider.tsx` | Loads session user, enriches metadata from `public.users`, listens to auth changes. |
| `src/components/AuthGate.tsx` | Shows loading UI and redirects to login when no session is available. |
| `src/components/layout/SidebarContext.tsx` | Owns responsive sidebar open/close state. |
| `src/components/layout/Sidebar.tsx` | Role-filtered navigation and logout confirmation. |
| `src/components/layout/Navbar.tsx` | Search, notifications, profile menu, logout, and mobile search overlay. |
| `src/components/dashboard/MetricCard.tsx` | Reusable dashboard KPI card. |
| `src/components/dashboard/FinancialChart.tsx` | Bar chart card with daily/weekly/monthly grouping. |
| `src/components/dashboard/RecentTransactions.tsx` | Recent activity list card. |
| `src/components/dashboard/UnpaidInvoices.tsx` | Unpaid/overdue invoice list card. |
| `src/components/ui/Button.tsx` | Styled button primitive. |
| `src/components/ui/Input.tsx` | Styled input primitive with optional icon. |
| `src/components/ui/Modal.tsx` | Portal modal with body scroll lock and open/close animations. |
| `src/components/ui/ConfirmModal.tsx` | Confirmation dialog built on `Modal`. |
| `src/components/ui/CustomSelect.tsx` | Dropdown select control. |
| `src/components/ui/CustomDatePicker.tsx` | Calendar picker that emits `YYYY-MM-DD`. |
| `src/components/ui/SearchDropdown.tsx` | Debounced global search with keyboard navigation and invoice quick actions. |
| `src/components/ui/Table.tsx` | Responsive table primitives. |
| `src/components/ui/Skeleton.tsx` | Loading placeholders. |
| `src/components/ui/Toaster.tsx` | Sonner toast styling and icons. |
| `src/components/ui/ChartWrapper.tsx` | Delays Recharts rendering until after mount to avoid hydration mismatch. |

## Libraries And Stores

| File | What it does |
| --- | --- |
| `src/lib/utils.ts` | Class-name merge helper plus Indonesian Rupiah format/parse helpers. |
| `src/lib/supabase.ts` | Legacy direct Supabase client export. |
| `src/utils/supabase/client.ts` | Memoized browser Supabase client factory. |
| `src/utils/supabase/server.ts` | Server Supabase client factory with Next cookie integration. |
| `src/lib/storage.ts` | Uploads a file into Supabase Storage and returns its public URL. |
| `src/lib/export.ts` | Styled Excel/PDF export functions. |
| `src/store/authStore.ts` | Zustand auth state, role labels, display name, and initials helpers. |
| `src/store/uiStore.ts` | Legacy/global sidebar open state store. |

## Database Helpers

| File | What it does |
| --- | --- |
| `src/lib/db/types.ts` | Shared TypeScript models for public database tables. |
| `src/lib/db/index.ts` | Barrel export for all database helper modules. |
| `src/lib/db/clients.ts` | Customer CRUD and customer invoice stats. |
| `src/lib/db/categories.ts` | Category/payment method reads plus category create/update/delete/order helpers. |
| `src/lib/db/income.ts` | Income reads, totals, create/update/delete, and linked invoice payment update. |
| `src/lib/db/expense.ts` | Expense reads, totals, create/update/delete. |
| `src/lib/db/invoices.ts` | Invoice reads, overdue refresh, create/update with item rows, delete, status labels. |
| `src/lib/db/dashboard.ts` | Dashboard, chart, report, activity, top client/product, and accounting report aggregations. |
| `src/lib/db/search.ts` | Role-aware global search and page shortcut search. |
| `src/lib/db/users.ts` | User/company profile helpers and audit log insertion. |

## Editing Guidance

- Keep Supabase table names aligned with `schema/schema-final.sql`.
- Keep `YYYY-MM-DD` strings for date comparisons; many queries rely on lexicographic date ordering.
- Keep `"use client"` as the first statement in client components.
- When adding Recharts charts, wrap browser-only rendering with `ChartWrapper` or mount gating.
- When changing role behavior, update both UI checks and database policies.
- When adding export columns, prefer `ExportColumn` definitions and `resolveKey` nested access.
