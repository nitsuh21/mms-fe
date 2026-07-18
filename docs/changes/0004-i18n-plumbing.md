# 0004 — i18n Plumbing (next-intl)

- **Status:** Planned
- **Date:** 2026-07-18
- **Author:** Nitsuh / Claude

## Motivation

All UI strings are hardcoded English. Multi-country expansion needs translations
eventually, and the home market benefits immediately (Amharic). Retrofitting i18n
across thousands of strings is the most tedious job in frontend work — the framework
must go in **now** so new code is translatable from day one, even while old strings
are migrated opportunistically.

## Design / Changes

- Install `next-intl`; messages in `src/messages/en.json` (source of truth),
  `am.json` scaffolded empty (falls back to English).
- App Router integration without URL locale prefixes for now: locale resolved from
  user preference (profile/localStorage), default `en`. No route changes.
- `NextIntlClientProvider` added to the provider tree; `useTranslations()` is the
  standard for **all new/edited components** from this change forward.
- Migration policy (documented in README): any component touched by another change
  moves its strings into messages as part of that change — no dedicated big-bang
  sweep, no new hardcoded strings.
- Dates/numbers: use `next-intl`/`Intl` formatters; composes with `formatMoney`
  (changes/0001).

## Affected areas

- `package.json`, `src/components/providers/Providers.tsx`, new `src/messages/`,
  `src/i18n.ts` config; thereafter incremental across components.

## Rollout

Non-breaking; English-only until translations land. Amharic translation is a
separate future effort (content task, not engineering).

## Testing

- Build passes with the provider in place; a sample migrated component renders
  from messages in both `en` and (fallback) `am`.

## Open questions

- Locale persistence location once user profiles carry preferences (backend field
  vs localStorage) — start with localStorage.
