# 0005 — Auth & RBAC Consolidation

- **Status:** Planned
- **Date:** 2026-07-18
- **Author:** Nitsuh / Claude

## Motivation

Two parallel auth systems coexist: `src/context/AuthContext.tsx` (global provider,
backend role codes) and `src/lib/auth/rbac.tsx` (portal layout provider with its own
`Role` union and permission matrix). The portal layout hardcodes
`role="merchant_admin"` — a value not even in the union — so RBAC is decorative.
There is no `middleware.ts`, so no route-level guard exists; protection is only the
axios 401 redirect. `src/lib/auth/hooks.ts` imports a non-exported context (broken).
Real authorization is enforced server-side (mms-be docs/changes/0001); the frontend
layer must be honest and consistent, not a second source of (wrong) truth.

## Design / Changes

- **One provider:** keep `src/context/AuthContext.tsx` as the single auth context,
  extended with the real user's role from the backend (`SA`/`MA`/`MB`/`BM`/`CU`)
  and current merchant/business context. Delete `src/lib/auth/rbac.tsx`,
  `src/lib/auth/types.ts` permission matrix, `src/lib/auth/hooks.ts`.
- **Role mapping:** UI gating driven by backend role codes + `BusinessMember` role,
  via a small `can(user, action)` helper — mirroring (not replacing) server rules.
  UI gating is UX only; the server remains the authority.
- **Route guard:** add `middleware.ts` that redirects unauthenticated users hitting
  `/merchant-portal/*` to `/auth/signin`. Requires the access token to be readable
  by middleware → move tokens from localStorage to **cookies** (httpOnly refresh
  cookie set by backend where possible; short-lived access token in a cookie).
  Coordinate with backend cookie support (merchants signup already sets httpOnly
  cookies — align the auth endpoints).
- Duplicate provider trees in the portal layout collapse into the single global
  `Providers` (one QueryClient, one Notification/Sidebar provider).

## Affected areas

- Deleted: `src/lib/auth/` (rbac, types, hooks).
- New: `middleware.ts`, `src/lib/permissions.ts`.
- Edited: `src/context/AuthContext.tsx`, `src/services/authService.ts` (cookie
  handling), `src/app/merchant-portal/[merchantId]/layout.tsx`, components using
  `WithPermission`/`withAuth`.

## Rollout

- Token-storage change invalidates existing sessions once (users re-login).
- Backend coordination: auth endpoints must set/read cookies consistently
  (tracked alongside mms-be docs/changes/0001).

## Testing

- Unauthenticated hit on a portal route → redirected to signin (middleware test).
- Role gating: staff-role user doesn't see mutation actions; server still rejects
  direct calls (backend tests cover that side).
- Refresh flow works with cookie storage; logout clears cookies.

## Open questions

- Whether Google OAuth flow needs rework for cookie-based tokens — verify during
  implementation.
