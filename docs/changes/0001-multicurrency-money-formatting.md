# 0001 — Multi-Currency Money Formatting

- **Status:** Planned
- **Date:** 2026-07-18
- **Author:** Nitsuh / Claude

## Motivation

`ETB` / `Br` are hardcoded across ~13 files (plans, discounts, invoices, rewards,
settings, services). The platform is going multi-country and multi-currency: every
amount must render with **its own** currency (from the API), with correct symbol and
decimal rules per currency — never an assumed literal.

## Design / Changes

- New `src/lib/money.ts`:

  ```ts
  formatMoney(amount: number | string, currencyCode: string, locale?: string): string
  ```

  Implemented on `Intl.NumberFormat(locale, { style: 'currency', currency })` —
  symbols and decimal places (including 0-decimal currencies) come for free.
  Graceful fallback to `"<code> <amount>"` for unknown codes.
- Every money display goes through `formatMoney`, fed by the currency field the
  backend now returns on each monetary object (business, plan, invoice, payment,
  reward — see mms-be docs/changes/0002). **Never** from a constant.
- Amount inputs (plan price, discount value, payment amount) show the active
  business's currency symbol/code from `business.currency`, not a literal.
- Sweep and delete every hardcoded `ETB` / `Br` literal; add an ESLint
  `no-restricted-syntax`/grep CI check to keep them out.

## Affected areas

- New: `src/lib/money.ts`.
- Swept: plans, discounts, invoices (`PaymentModal`, `InvoiceDetails`,
  `AdvancePaymentModal`), affiliates (`RewardsTable`, campaign pages), settings
  pages, `SubscriptionPlanModal`, `invoiceService`, `subscriptionService`,
  business new/edit pages.

## Rollout

Depends on backend serializers exposing `currency` on monetary objects
(mms-be docs/changes/0002). Until then, `business.currency` is the fallback source.

## Testing

- Unit tests for `formatMoney` (ETB, USD, KES, a 0-decimal currency, unknown code).
- Manual pass over plans/invoices/rewards pages with a non-ETB business.
- Grep check: zero occurrences of `'ETB'` / `'Br'` literals outside tests/fixtures.

## Open questions

- Locale source for formatting (browser locale vs business country) — start with
  browser locale, revisit with i18n (changes/0004).
