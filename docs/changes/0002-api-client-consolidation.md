# 0002 — API Client Consolidation

- **Status:** Planned
- **Date:** 2026-07-18
- **Author:** Nitsuh / Claude

## Motivation

Three axios instances coexist with different behavior and **different token storage
keys**: `src/services/api.ts` (canonical: `accessToken` key, refresh interceptor,
`X-Tenant-ID`), `src/lib/axios.ts` (legacy tenant-in-URL logic), and
`src/services/apiClient.ts` (reads `localStorage['token']` — a key nothing writes).
Requests through the wrong client silently go out unauthenticated. Duplicate tool
configs (`next.config.js` vs `.ts`, `tailwind.config.js` vs `.ts`, `jsconfig.json`
vs `tsconfig.json`) make behavior depend on resolution order.

## Design / Changes

- `src/services/api.ts` becomes the **only** HTTP client. Migrate any imports of
  `lib/axios` / `apiClient`, then delete both files.
- Single source of truth for storage keys and API constants: merge
  `src/services/config.ts` and `src/config/index.ts` into one module.
- Switch base URL to the versioned API (`${NEXT_PUBLIC_API_URL}/api/v1`) in
  coordination with mms-be docs/changes/0004.
- Config dedupe: keep `next.config.ts` (merge remote image patterns from the `.js`
  variant into it, drop the ignore-build-errors flags), keep `tailwind.config.ts`,
  keep `tsconfig.json`; delete the shadow copies.

## Affected areas

- Deleted: `src/lib/axios.ts`, `src/services/apiClient.ts`, `next.config.js`,
  `tailwind.config.js`, `jsconfig.json`.
- Edited: `src/services/api.ts`, `src/services/config.ts` / `src/config/index.ts`
  (merged), every module importing a deleted client.

## Rollout

Pure refactor; behavior change only where the broken client was silently
unauthenticated (those calls start sending tokens — verify affected endpoints).
Base-URL switch waits for backend v1 aliases to be live.

## Testing

- Grep: no remaining imports of deleted modules.
- Manual smoke: signin → OTP → portal loads, business pages fetch, 401 refresh
  path still replays correctly.
- Build passes with `next.config.ts` only (no ignored type errors).

## Open questions

- Whether to fail the build on existing type errors immediately or keep a
  temporary allowlist while cleaning them up.
