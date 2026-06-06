# Technical Specification

Last updated: 2026-06-06.

## Architecture

GMera Solusi is a Next.js App Router application. The authenticated dashboard runs under `src/app/(dashboard)` and is wrapped by:

- `AuthProvider`, which loads Supabase session data and enriches it with `public.users`.
- `AuthGate`, which redirects unauthenticated users to `/login`.
- `SidebarProvider`, `Sidebar`, and `Navbar`, which provide navigation, search, profile actions, and notifications.

The browser client reads and writes Supabase through domain helpers in `src/lib/db`. Pages call those helpers directly from client components.

## Runtime Layers

| Layer | Files | Responsibility |
| --- | --- | --- |
| Route shell | `src/app/layout.tsx`, `src/app/(dashboard)/layout.tsx`, `middleware.ts` | Global metadata, fonts, toast host, protected layout, session refresh. |
| Auth | `src/components/AuthProvider.tsx`, `src/components/AuthGate.tsx`, `src/store/authStore.ts` | Session state, role metadata, display name helpers, login redirects. |
| Navigation | `src/components/layout/*`, `src/components/ui/SearchDropdown.tsx` | Sidebar role filtering, mobile sidebar state, global search, notifications. |
| Data access | `src/lib/db/*.ts` | Supabase CRUD, dashboard aggregation, search, settings, audit logs. |
| UI primitives | `src/components/ui/*.tsx` | Buttons, inputs, modal, table, select/date controls, skeletons, toasts. |
| Features | `src/app/(dashboard)/**/page.tsx` | Dashboard, income, expense, invoice, customer, report, settings, profile screens. |
| Exports | `src/lib/export.ts` | Styled PDF and Excel report output. |
| Storage | `src/lib/storage.ts` | Uploads to Supabase Storage and returns public URLs. |

## Authentication

1. `middleware.ts` creates a server Supabase client and calls `auth.getUser()` to refresh/validate session cookies.
2. Unauthenticated protected route visits redirect to `/login?next=<path>`.
3. Authenticated visits to `/` or `/login` redirect to `/beranda`.
4. `LoginPage` signs in with `signInWithPassword`, loads `public.users`, writes enriched role/name metadata into Zustand, updates `last_login`, and routes to `/beranda`.
5. `AuthProvider` repeats profile enrichment during app boot and token/user refresh events.

## Route Protection

Protected paths currently listed in middleware:

- `/beranda`
- `/pendapatan`
- `/pengeluaran`
- `/e-invoice`
- `/laporan`
- `/klien`
- `/pengaturan`
- `/profil`

Important: the customer route is `/customer`, not `/klien`, so customer pages are not covered by the current middleware path list.

## Data Access

The Supabase browser client factory is `src/utils/supabase/client.ts`; it memoizes one browser client instance. Server-side creation lives in `src/utils/supabase/server.ts`.

Domain modules:

- `clients.ts`: active customers, individual customer lookup, customer invoice stats, create/update/soft-delete.
- `categories.ts`: categories, category order updates, payment methods, category audit logs.
- `income.ts`: income list, monthly/all-time totals, create/update/delete, invoice auto-paid update when linked.
- `expense.ts`: expense list, monthly/all-time totals, create/update/delete.
- `invoices.ts`: overdue status refresh, invoice list/detail/client lookup, create/update with items, delete.
- `dashboard.ts`: KPI summary, chart series, yearly data, report totals, top customers/products, recent activities, accounting report rows.
- `search.ts`: static page shortcuts plus role-aware queries for invoices, clients, income, and expense.
- `users.ts`: current profile, all users, role/status updates, company profile updates, audit logging.

## Reporting And Export

Reports are generated from date-bounded income and expense rows. `src/lib/export.ts` supports:

- Standard tabular Excel/PDF exports with row totals.
- Accounting-style layouts using `HDR:`, `SUB:`, and `FTR:` markers to style section, subtotal, and footer rows.
- Indonesian date and currency formatting.

## Notifications

`Navbar` loads recent activities from `getRecentActivities(30)` and subscribes to Supabase Realtime changes on:

- `income`
- `expense`
- `invoices`
- `audit_logs`

Users can clear visible notifications locally with `localStorage.last_cleared_notifications`. Overdue invoice reminders remain visible after clearing.

## Styling

Tailwind theme tokens are defined in `tailwind.config.ts`:

- `primary`: `#7983ff`
- `success`: `#76c893`
- `danger`: `#f08a5d`
- `warning`: `#ffd166`
- `info`: `#62b6cb`
- background/surface/border/text tokens for the dashboard UI

Poppins is loaded in `src/app/layout.tsx` and exposed as `--font-poppins`.

## Current Risks

- UI role checks do not fully enforce authorization at database level.
- Customer middleware path uses `/klien` instead of `/customer`.
- Customer detail page uses mock data.
- Debug logging is present in dashboard and total calculation helpers.
- Several pages are large client components; future changes should consider smaller form/table/export subcomponents.
