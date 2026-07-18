# 0003 — Reference-Data-Driven UI

- **Status:** Planned
- **Date:** 2026-07-18
- **Author:** Nitsuh / Claude

## Motivation

Payment-method dropdowns, currency selectors, and (future) country pickers are
hardcoded in components. The backend is moving these to reference tables
(`Country`, `Currency`, `PaymentProvider` — mms-be docs/changes/0002) precisely so
that entering a new market or onboarding a gateway requires **no frontend release**.
The UI must render these from the API.

## Design / Changes

- New `src/services/referenceService.ts` + TanStack Query hooks:
  `useCountries()`, `useCurrencies()`, `usePaymentProviders(countryCode?)` —
  long `staleTime` (reference data changes rarely), cached per session.
- Payment method selectors (invoice creation, `PaymentModal`,
  `AdvancePaymentModal`, transactions filters) render from
  `usePaymentProviders(business.country)` — options appear/disappear by market.
- Currency selectors (business create/edit, settings) render from
  `useCurrencies()` (active only).
- Business create/edit gains a country field from `useCountries()`; phone inputs
  validate/format E.164 using the selected country's prefix.
- Delete the hardcoded option arrays these replace.

## Affected areas

- New: `src/services/referenceService.ts`, `src/hooks/useReferenceData.ts`.
- Edited: invoice/payment modals, business new/edit pages, settings
  (`GeneralSettingsTab`), transactions filters, membership/plan forms with
  payment-method fields; `src/types/` additions for the three reference shapes.

## Rollout

Depends on backend reference endpoints (`/countries/`, `/currencies/`,
`/payment-providers/`) from mms-be docs/changes/0002. Ship behind their availability.

## Testing

- Mocked-hook unit tests: dropdowns render API-provided options, none hardcoded.
- Manual: a provider deactivated in the backend admin disappears from the UI
  without a deploy.

## Open questions

- Phone input component choice (`react-phone-number-input` vs plain input +
  libphonenumber validation) — decide at implementation.
