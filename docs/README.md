# MMS Frontend — Documentation

This folder is the documentation home for `mms-fe`. **Every feature, improvement, or
notable change must have its own doc here before (or alongside) the code change.**

## Convention

1. One doc per feature / improvement / significant change — no bundling unrelated work.
2. Docs live in [`changes/`](changes/), numbered sequentially: `NNNN-short-slug.md`.
3. Copy [`TEMPLATE.md`](TEMPLATE.md) to start a new doc.
4. Every doc carries a **Status**: `Planned` → `In Progress` → `Done` (or `Rejected`).
   Update the status as the work moves.
5. A PR that changes behavior links its doc; a doc with no code yet is a design proposal.
6. Cross-cutting reference material (architecture, conventions) lives at the top level
   of `docs/`, not in `changes/`.

## Index

### Reference

| Doc | Description |
|---|---|
| [architecture-overview.md](architecture-overview.md) | Map of the frontend: routing, data layer, auth, components |

### Changes

| # | Doc | Status |
|---|---|---|
| 0001 | [Multi-currency money formatting](changes/0001-multicurrency-money-formatting.md) | Planned |
| 0002 | [API client consolidation](changes/0002-api-client-consolidation.md) | Planned |
| 0003 | [Reference-data-driven UI](changes/0003-reference-data-driven-ui.md) | Planned |
| 0004 | [i18n plumbing (next-intl)](changes/0004-i18n-plumbing.md) | Planned |
| 0005 | [Auth & RBAC consolidation](changes/0005-auth-rbac-consolidation.md) | Planned |
| 0006 | [Frontend pipeline (CI gate + Vercel deploys)](changes/0006-frontend-pipeline.md) | In Progress |

## Design principles (apply to all changes)

- **Nothing market-specific in the bundle.** Currencies, countries, and payment
  methods are rendered from API reference data — never hardcoded strings.
- **Money never travels alone.** Amounts are always formatted with their currency
  via the shared `formatMoney` utility; no literal `ETB` / `Br` anywhere.
- **One way to do each thing:** one HTTP client, one auth provider, one toast
  system, one config file per tool. Duplicates get deleted, not added to.

The backend counterpart of these docs lives in `mms-be/docs/`.
