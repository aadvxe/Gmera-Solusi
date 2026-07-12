# GMera Solusi

Financial management and e-invoice system for PT GMera Solusi. The app replaces manual spreadsheet workflows with a Supabase-backed dashboard for income, expenses, customers, invoices, reports, and operational settings.

Last documentation refresh: 2026-07-12.

## What This App Does

- Tracks income and expenses with categories, payment methods, references, attachments, and status.
- Creates, previews, edits, and exports e-invoices with itemized totals, tax, discount, shipping, and payment state.
- Manages customers and stores invoice-facing customer snapshots for historical accuracy.
- Shows dashboard KPIs, charts, recent activity, unpaid invoice reminders, and top customer/product summaries.
- Generates report views and PDF/Excel exports for finance review.
- Uses Supabase Auth plus a public `users` profile table for roles and display metadata.
- Supports role-aware navigation and global search across pages, invoices, customers, income, and expenses.

## Tech Stack

- Next.js 16.2.4 App Router
- React 19.2.5
- TypeScript 5
- Tailwind CSS 3
- Supabase Auth, PostgreSQL, Realtime, and Storage
- Zustand for client auth/UI state
- Recharts for charts
- Sonner for toast notifications
- `xlsx-js-style`, `jspdf`, `jspdf-autotable`, and `html2pdf.js` for exports
- Astraicons and Lucide icons

## Project Structure

| Path | Purpose |
| --- | --- |
| `src/app/` | Next.js route tree, root layout, login, and dashboard pages. |
| `src/app/(dashboard)/` | Authenticated app shell and feature pages. |
| `src/components/` | Auth wrappers, layout components, dashboard widgets, and shared UI primitives. |
| `src/lib/db/` | Supabase data access modules by business domain. |
| `src/lib/export.ts` | PDF and Excel export helpers. |
| `src/lib/storage.ts` | Supabase Storage upload helper. |
| `src/store/` | Zustand stores for auth and sidebar state. |
| `src/utils/supabase/` | Browser and server Supabase client factories. |
| `schema/` | Database schemas, seed scripts, user creation script, and full dump. |
| `docs/` | Maintained project documentation. |
| `middleware.ts` | Server-side session refresh and route protection. |

## Main Routes

| Route | Purpose |
| --- | --- |
| `/login` | Sign in with Supabase email/password. |
| `/beranda` | Dashboard KPIs, charts, activities, unpaid invoices, top clients/products. |
| `/pendapatan` | Income list, filters, export, edit/delete modals. |
| `/pendapatan/tambah` | Create income records. |
| `/pengeluaran` | Expense list, filters, export, edit/delete modals. |
| `/pengeluaran/tambah` | Create expense records. |
| `/e-invoice` | Invoice list, filters, status actions, export, delete. |
| `/e-invoice/buat` | Create a new e-invoice. |
| `/e-invoice/[id]/detail` | Preview and print/export an invoice. |
| `/e-invoice/[id]/edit` | Edit an existing invoice and its items. |
| `/customer` | Customer list, stats, edit/delete modals. |
| `/customer/tambah` | Create a customer. |
| `/customer/[id]` | Customer detail page. Currently uses mock detail data. |
| `/laporan` | Financial report page and export entry points. |
| `/pengaturan` | Company profile, users, categories, tax, and payment settings. |
| `/profil` | Signed-in user profile. |
| `/pencarian` | Full search page. |

## Roles

The app recognizes these roles:

- `super_admin`
- `finance_manager`
- `accounting_staff`
- `sales_staff`
- `viewer`

Role behavior is implemented mainly in `src/components/layout/Sidebar.tsx`, `src/lib/db/search.ts`, and the feature pages. Supabase RLS in the current schema is broad for authenticated users, so UI role gating should not be treated as the only authorization layer for production.

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create `.env.local`:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. Load the database:

   Use `schema/schema-final.sql` for the compact schema and seed baseline, or `schema/db_dump.sql` when restoring the full captured Supabase database.

4. Run the app:

   ```bash
   npm run dev
   ```

5. Open:

   [http://localhost:3000](http://localhost:3000)

## Available Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start Next.js in development mode on `0.0.0.0`. |
| `npm run build` | Build the production app. |
| `npm run start` | Start the production server on `0.0.0.0`. |
| `npm run lint` | Run ESLint with flat JavaScript and TypeScript presets. |

## Database Summary

Primary public tables:

- `users`
- `clients`
- `categories`
- `payment_methods`
- `company_profile`
- `invoices`
- `invoice_items`
- `income`
- `income_items`
- `expense`
- `expense_items`
- `audit_logs`
- `couriers`

Key relationships:

- `clients` to `invoices`
- `invoices` to `invoice_items`
- `invoices` optionally to generated `income`
- `income` and `expense` to `categories`, `payment_methods`, and `users`
- `users` to `audit_logs`

## Known Notes

- `/customer/[id]` currently displays mock detail/invoice history data instead of reading from Supabase.
- Several debug `console.log` statements remain in `src/lib/db/dashboard.ts`, `src/lib/db/expense.ts`, `src/lib/db/income.ts`, and the dashboard page.
- Route-level UI role checks exist, but database policies are permissive for authenticated users in the included schema.

## More Documentation

- [Technical Specification](docs/technical-specification.md)
- [Code Notes](docs/LLM.md)
- [Codebase Explained (Simple)](docs/codebase-explained-simple.md)
- [Code Syntax Explained](docs/code-explained-syntax.md)
- [System Diagrams](docs/diagram.md)
- [Wireframe Documentation](docs/wireframe-documentation.md)
- [Feature Backlog](docs/feature-ideation-ux-improvements.md)
- [Version Notes](docs/update-version3.1.md)
