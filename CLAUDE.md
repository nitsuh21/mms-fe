# MMS Frontend (mms-fe)

Next.js admin portal for **MMS ("Eytta")** — a multi-tenant subscription/membership
management SaaS. Talks to the Django backend in the sibling `mms-be` repo
(`https://dev-mms-api.andlay.app` for dev, `https://mms-api.andlay.app` for prod).

## How we work — non-negotiable conventions

1. **Every feature/improvement/change gets its own doc** in `docs/changes/NNNN-slug.md`
   *before or alongside* the code. Start from `docs/TEMPLATE.md`; index it in
   `docs/README.md`; keep its Status current.
2. **Nothing market-specific in the bundle.** Currencies, countries, and payment
   methods render from backend reference data — never hardcoded (`ETB`/`Br` literals
   are being removed, see docs/changes/0001).
3. **Money never travels alone** — amounts always format through the shared
   `formatMoney(amount, currencyCode)` util with the currency the API returned.
4. **One way to do each thing**: one HTTP client (`src/services/api.ts`), one auth
   provider, one config file per tool. Duplicates get deleted, not added to.

## Branches & environments

- `dev` = working branch → dev environment (API: `dev-mms-api.andlay.app`)
- `main` = production (API: `mms-api.andlay.app`)
- Only these two branches exist; feature work goes through PRs into `dev`.

## Stack & services

- Next.js 16 App Router (`output: standalone`), React 18, TypeScript, Tailwind v4
  (class dark mode), TanStack Query v5, axios, react-hook-form + zod, ApexCharts,
  Headless UI + Heroicons/react-icons, sonner toasts. Package manager: **pnpm**.
- UI derived from the TailAdmin template — template residue (`components/ecommerce`,
  `example`, calendar, jvectormap) is being pruned; don't build on it.
- Backend API: Django REST (see `mms-be/CLAUDE.md`); JWT in headers with email-OTP
  login flow; token refresh via axios interceptor in `src/services/api.ts`.

## Layout

- Routes: `src/app/` — public `auth/*` + `/r/[affiliateId]` referral landing;
  authenticated portal under `merchant-portal/[merchantId]/` (merchant → platform →
  business contexts).
- Data layer: class-based services in `src/services/*Service.ts` consumed through
  TanStack Query; domain types in `src/types/`.
- App chrome: `src/components/shared/` (Sidebar/Header); primitives in
  `src/components/ui/`.

## Commands

```bash
pnpm install
pnpm dev          # local dev server (proxies /api to backend in dev)
pnpm build        # production build — must pass before merging
pnpm lint
```

## Roadmap anchors (see docs/README.md index)

Multi-currency money formatting (0001) → API client consolidation (0002) →
reference-data-driven UI (0003) → i18n plumbing (0004) → auth/RBAC consolidation
(0005). Read `docs/architecture-overview.md` first when onboarding.
