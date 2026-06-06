# Feature And UX Backlog

Last updated: 2026-06-06.

This backlog reflects the current codebase after review. It is not a promise of scope; use it to prioritize the next engineering passes.

## High Priority

1. Protect `/customer` in middleware.
   - Current middleware protects `/klien`, which is not the active route.

2. Replace mock customer detail data.
   - Connect `/customer/[id]` to `getClientById`, `getClientInvoiceStats`, and `getInvoicesByClient`.

3. Align RLS policies with roles.
   - Current schema allows broad authenticated access for most public tables.
   - UI role checks are helpful but not enough for production authorization.

4. Remove or gate debug logging.
   - Dashboard and income/expense total helpers log query details.

## Medium Priority

1. Split large pages into feature components.
   - `beranda`, `e-invoice/buat`, `pengaturan`, `pendapatan`, `pengeluaran`, and `customer` are large client components.

2. Add route-level loading and error states.
   - Some pages rely on internal spinners; consistent route feedback would improve perceived stability.

3. Standardize modals.
   - Several pages build custom edit/delete/export modals. Shared feature modal patterns would reduce drift.

4. Add empty-state copy and action buttons to all major lists.
   - Search, filtered lists, and no-data screens should guide the next action.

5. Add form validation helpers.
   - Income, expense, invoice, customer, and settings forms can share reusable validation utilities.

## Reporting Improvements

1. Enable and finish the profit/loss report path controlled by `SHOW_LABA_RUGI`.
2. Add saved report presets for common accounting periods.
3. Add export audit logs consistently for all export actions.
4. Add CSV export for lightweight data sharing.

## Search Improvements

1. Add direct search destinations for income and expense detail/edit views if those routes are added.
2. Add fuzzy matching for invoice/customer names.
3. Preserve recent searches per user.

## Dashboard Improvements

1. Add loading skeletons for each dashboard block.
2. Make chart aggregation reusable for income, expense, and profit cards.
3. Add drill-down links from KPI cards to prefiltered list pages.

## Data Quality Improvements

1. Normalize invoice status transitions in a single helper.
2. Add database constraints for positive amounts and item quantities.
3. Add unique/format validation for invoice numbers and customer tax IDs.
4. Add tests around date range boundaries, especially month-to-month comparisons.
