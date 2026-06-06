# Wireframe Documentation

Last updated: 2026-06-06.

This document describes the current UI structure so designers and engineers can change screens without first reverse-engineering every component.

## Global Layout

Desktop:

- Fixed/sticky left sidebar.
- Sticky top navbar.
- Main content area with page padding and scrollable body.
- Global search centered in the navbar.
- Notification and profile menus on the right.

Mobile:

- Sidebar becomes an overlay drawer.
- Search moves into a top overlay opened from a navbar icon.
- Content keeps the same route order but stacks cards, tables, and controls vertically.

## Common Page Pattern

Most dashboard pages use this order:

1. Page title and optional primary action.
2. Summary cards or filter controls.
3. Main table/chart/form surface.
4. Modals for edit, delete, confirmation, preview, or export.

## Dashboard `/beranda`

Primary sections:

- Month/year filters.
- KPI cards for income, expense, profit, and receivables.
- Income/expense/profit chart mode.
- Unpaid and overdue invoices.
- Recent activity feed.
- Top clients and products.

Design intent: high-level scan first, detailed lists second.

## Income `/pendapatan`

Primary sections:

- Header with add/export actions.
- Search and date/status/category filters.
- Income table.
- Edit and delete modals.

Rows display date, source, category, payment method, reference, amount, status, and actions.

## Expense `/pengeluaran`

Mirrors the income page structure with expense-specific labels and data fields.

Rows display date, expense type, category, payment method, reference, amount, status, and actions.

## E-Invoice `/e-invoice`

Primary sections:

- Header with create/export actions.
- Status and search filters.
- Invoice list/table.
- Detail, edit, mark-paid, cancel, delete, and export actions.

Invoice status colors:

- Unpaid: warning
- Paid: success
- Overdue: danger
- Cancelled: muted

## Invoice Create/Edit

Form sections:

- Customer identity and contact data.
- Invoice date and due date.
- Item rows with quantity, unit, unit price, and total.
- Tax, discount, shipping, tracking, and notes.
- Preview-style pagination helpers for print/export layout.

## Customer `/customer`

Primary sections:

- Customer stats.
- Search/filter controls.
- Customer table.
- Create, edit, detail, and soft-delete actions.

`/customer/[id]` currently uses mock data and should be connected to `getClientById` plus `getInvoicesByClient` before production use.

## Reports `/laporan`

Primary sections:

- Date range controls.
- Summary totals.
- Chart/table data.
- Export to PDF/Excel.

The hidden `SHOW_LABA_RUGI` flag is reserved for future profit/loss report UI.

## Settings `/pengaturan`

Tabs:

- Profil perusahaan
- Pengguna
- Kategori
- Pajak
- Pembayaran

Settings changes often call `createAuditLog` through helper functions so they can appear in recent activity/notification surfaces.

## Profile `/profil`

Shows and edits signed-in user profile metadata loaded from `public.users` and Supabase user metadata.
