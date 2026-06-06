# Version Notes

Last updated: 2026-06-06.

The package version is currently `4.1.0`.

## Current Implemented Capabilities

- Supabase Auth login and session enrichment from `public.users`.
- Role-aware sidebar navigation.
- Dashboard summary cards, charts, activities, unpaid invoices, top clients, and top products.
- Income CRUD and export.
- Expense CRUD and export.
- E-invoice CRUD, item rows, status labels, detail preview, edit route, and export support.
- Customer list, create route, and soft-delete behavior.
- Reports with date-range aggregation and PDF/Excel export helpers.
- Settings for company profile, users, categories, tax, and payment details.
- Global search dropdown and search page.
- Supabase Storage upload helper.

## Documentation Refresh In This Pass

- Replaced stale/encoded README content with a current project overview.
- Rewrote technical specification around the actual Next.js 16/Supabase architecture.
- Replaced old diagram notes with Mermaid diagrams for app, data, invoice, reporting, and ER overview.
- Rewrote wireframe documentation around current screens.
- Replaced old ideation notes with a prioritized backlog based on the current implementation.
- Added a file-by-file code map for maintainers and LLM-assisted work.

## Known Gaps

- Middleware customer route mismatch: `/klien` should be `/customer`.
- Customer detail page is mock-backed.
- Current schema RLS is broad for authenticated users.
- Debug logging remains in some data helpers.
- No automated tests are currently configured beyond Next lint/build scripts.

## Suggested Next Version Targets

### 4.2.0

- Fix `/customer` middleware protection.
- Connect customer detail page to real data.
- Remove debug logs.
- Add focused tests for dashboard totals and invoice status transitions.

### 4.3.0

- Harden RLS by role.
- Split large feature pages into reusable components.
- Add route-level error/loading states.
- Finish profit/loss report UI.
