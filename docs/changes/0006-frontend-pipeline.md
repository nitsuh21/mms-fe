# 0006 — Frontend Pipeline (CI Gate + Vercel Deploys)

- **Status:** In Progress
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

## Vercel settings to verify (needs Vercel access — MCP or dashboard)

- Dev project: production branch must be **`dev`** (was likely `development`,
  which no longer exists — deploys would be stuck on the last build).
- Prod project: production branch **`main`**.
- Env vars: `NEXT_PUBLIC_API_URL` = `https://dev-mms-api.andlay.app` (dev
  project) / `https://mms-api.andlay.app` (prod project).

## Testing

- `pnpm install && pnpm build` green locally; CI run green on push.
- After Vercel branch fix: push to `dev` produces a fresh dev-mms deployment.

## Open questions

- Confirm actual Vercel project names/settings once MCP access is authorized.
