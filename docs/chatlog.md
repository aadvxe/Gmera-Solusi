# Maintenance Log

Last updated: 2026-06-06.

This file replaces the old chat transcript style document with a concise maintenance log.

## 2026-06-06 Documentation And Code Notes Pass

Work performed:

- Read the repository structure, package metadata, source files, database helper modules, routes, and schema summaries.
- Replaced stale project documentation with source-aligned documentation.
- Added maintainers' code notes in `docs/LLM.md`.
- Identified route/security risks for follow-up:
  - `/customer` is not included in middleware protected paths.
  - `/customer/[id]` is still mock-backed.
  - RLS policies are broad for authenticated users.
  - Debug logs remain in dashboard/data helper code.

## How To Use This Log

Add short entries when a major maintenance pass changes docs, architecture, schema, or cross-cutting behavior. Keep detailed implementation notes in commit messages or issue trackers.
