# 0006 — Frontend Pipeline (CI Gate + Vercel Deploys)

- **Status:** Done
- **Date:** 2026-07-19
- **Author:** Nitsuh / Claude

## Motivation

The FE deploys via **Vercel** (discovered: `mms.andlay.app` = prod,
`dev-mms.andlay.app` = dev, both CNAME → vercel-dns), but had no CI gate and
several broken build/lint plumbing pieces. Bring the FE pipeline to parity with
the backend: `dev` branch → dev deployment, `main` → prod, with a quality gate
on every PR/push.

## Changes

1. **`.github/workflows/ci.yml`** — on PRs/pushes to `dev`/`main`: pnpm install
   (frozen lockfile) → lint → production build. **Build is the blocking gate.**
   Lint is `continue-on-error` for now: it surfaces 124 pre-existing errors from
   the template era; it becomes blocking once docs 0002/0005 cleanup lands.
   Vercel remains the deploy mechanism (build gate here, deploy there).
2. **Fixed `pnpm build`** — `pnpm-workspace.yaml` contained the literal
   `approve-builds` placeholder text ("set this to true or false"), which made
   every install/build fail; set `allowBuilds: {sharp: true, unrs-resolver: true}`.
3. **Fixed `pnpm lint`** — the script called `next lint`, which was removed in
   Next.js 16; now `eslint src`. Deleted legacy `.eslintrc.json` and rewrote
   `eslint.config.mjs` to use `eslint-config-next`'s native flat-config exports
   (the `FlatCompat` shim crashed with a circular-structure error);
   `eslint-config-next` pinned to 16.1.1 to match Next.
4. Verified: production build passes locally and in CI.

## Vercel setup (verified 2026-07-19 via Vercel MCP + bundle inspection)

Two Vercel projects in team `nitsuh21s-projects`, both building repo `nitsuh21/mms-fe`:

| Project | Production branch | Domain | Baked API URL (verified in deployed bundle) |
|---|---|---|---|
| `mms` | `main` | mms.andlay.app | `mms-api.andlay.app` ✅ |
| `dev-mms` | `dev` | dev-mms.andlay.app | `dev-mms-api.andlay.app` ✅ |

A third project `mms-fe` (domain mms.eytta.com) is a stray duplicate building the
same repo — candidate for deletion/pause to save build minutes.

## Testing

- `pnpm install && pnpm build` green locally; CI run green on push.
- After Vercel branch fix: push to `dev` produces a fresh dev-mms deployment.

## Open questions

- None — pipeline verified end to end.
