# Architecture Overview — MMS Frontend

- **Status:** Living document
- **Last updated:** 2026-07-18

Admin portal (branded "Eytta") for the MMS multi-tenant subscription platform.
Talks to the Django backend (`mms-be`). Derived from the TailAdmin Next.js template;
template residue is being pruned over time.

## Stack

Next.js 16 (App Router, standalone output) · React 18 · TypeScript · Tailwind CSS v4
(class-based dark mode) · TanStack Query v5 · axios · react-hook-form + zod ·
Headless UI / Heroicons / react-icons · ApexCharts · pnpm · Docker.

Path alias `@/*` → `src/*`. Backend base URL from `NEXT_PUBLIC_API_URL`.

## Routing (`src/app/`)

- **Public:** `/auth/signin|signup|verify-otp|forgot-password|reset-password`
  (OTP-based 2FA flow), `/r/[affiliateId]` (public referral landing), `/` → signin.
- **Portal:** `/merchant-portal/[merchantId]/…` with three nested contexts:
  - *Merchant:* `businesses`, `settings`
  - *Platform:* `platform/dashboard|businesses|teams|reports|settings`
  - *Business:* `businesses/[businessId]/dashboard|members|membership-requests|plans|discounts|subscriptions|invoices|transactions|affiliates|reports|settings`
- Sidebar (`src/components/shared/Sidebar.tsx`) adapts nav items to the active context.

## Data layer

- **HTTP:** `src/services/api.ts` is the canonical axios instance — Bearer token
  from `AuthService`, `X-Tenant-ID` derived from the URL path, 401 → token refresh →
  replay, typed error mapping. (Two legacy duplicates exist and are being removed —
  see changes/0002.)
- **Services:** class-based singletons in `src/services/` (`authService`,
  `businessService`, `subscriptionService`, `planService`, `invoiceService`,
  `memberService`, `affiliateService`, `dashboardService`, …), consumed through
  TanStack Query in pages/components.
- **Types:** one file per domain in `src/types/`.

## Auth

Login → backend requires OTP → `/auth/verify-otp` → tokens (`accessToken`,
`refreshToken`, `user`) in localStorage via `AuthService`. Refresh on 401 through
the axios interceptor. Google OAuth helpers exist. RBAC/route-guard consolidation
is tracked in changes/0005.

## State & UI

- Providers (`src/components/providers/Providers.tsx`): QueryClient → Theme →
  Auth → Sidebar → Notification + sonner Toaster.
- Contexts in `src/context/`: Theme (dark mode), Sidebar, Notification, Loading.
- Primitives in `src/components/ui/`; feature components per domain
  (`subscriptions/`, `invoices/`, `affiliates/`, `dashboard/`, `Settings/`, …);
  app chrome in `src/components/shared/`.

## Known debt (tracked in change docs)

- Hardcoded `ETB`/`Br` across ~13 files → changes/0001.
- Three axios clients with different token keys; duplicate Next/Tailwind configs → changes/0002.
- Payment-method/currency dropdowns hardcoded → changes/0003.
- No i18n framework → changes/0004.
- Two parallel AuthProviders, hardcoded RBAC role, no `middleware.ts` → changes/0005.
- TailAdmin leftovers (`ecommerce/`, `example/`, calendar, jvectormap) — prune
  opportunistically.
