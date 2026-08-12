@AGENTS.md

# ExtremePanic

Reviewed-dropshipping e-commerce site: buy one unit of a "low effort"
product, photograph and review it, sell it indefinitely off that one
review. See `docs/x-panic-plan.docx` (business plan) and
`docs/x-panic-technical-plan-v2.docx` (technical plan — current, v1 is
superseded) for the full reasoning. **See `docs/STATUS.md` for what's
built, what's not, and what deliberately diverges from the written plan —
check it at the start of a session and update it when a milestone lands.**

This is a standalone project (Option B / custom build from the technical
plan) — its own Postgres database, its own deploy target, independent of
the Breakroom/Prosaurus stack described in the parent repo's `CLAUDE.md`,
even though it may eventually share the same AWS EC2 box for hosting.

## Commands

```bash
npm run dev              # http://localhost:3000
npm run db:up             # start local Postgres in Docker (port 5433)
npm run db:migrate        # apply Prisma schema (prisma migrate dev)
npm run db:seed           # seed one placeholder review
npm run db:studio         # Prisma Studio, browse the DB directly
npm run lint
npm run build
```

`.env` is required (copy from `.env.example`): `DATABASE_URL`,
`ADMIN_PASSWORD`, Square sandbox keys (`SQUARE_ACCESS_TOKEN`,
`SQUARE_LOCATION_ID`, `SQUARE_ENVIRONMENT`), `SITE_URL`.

## Architecture

- **`Review` is both product and review** — one row, no separate `Product`
  model, because the business model never buys inventory ahead of writing
  the review. Don't split this table without a real reason.
- **`Order`** is created `PENDING` when checkout starts and is meant to
  flip to `PAID` via a Square webhook — that webhook doesn't exist yet
  (needs a public HTTPS URL; see `docs/STATUS.md`). Don't assume `PAID`
  orders exist anywhere in the app yet.
- **Admin auth is a single shared password**, not per-user accounts —
  `ADMIN_PASSWORD` env var, HMAC-SHA256 signed session cookie
  (`src/lib/adminAuth.ts`), enforced by `src/proxy.ts`. This is
  intentionally simple (one team, one password) — don't add a users table
  or per-account auth without being asked.
- **`src/proxy.ts` is middleware** — this Next.js version renamed
  `middleware.ts` to `proxy.ts` / `export function proxy()`. Don't
  recreate a `middleware.ts` file or "fix" this back to the old name.
- **No CMS** — review content lives directly in Postgres via the custom
  `/admin` panel, not Sanity.io (which the written plan recommends). This
  was a deliberate choice; see `docs/STATUS.md` for the tradeoff.
- **Square, not Stripe** — Stripe was explicitly removed from the plan
  (vendor relationship severed). Never suggest Stripe. Square is primary,
  PayPal is the planned-but-unbuilt backup rail.

## Conventions

- Server actions live next to the routes that use them (e.g.
  `src/app/reviews/[slug]/actions.ts`, `src/app/admin/actions.ts`), not in
  a shared `actions/` directory.
- Shared server-only helpers go in `src/lib/` (`prisma.ts`, `square.ts`,
  `adminAuth.ts`, `stars.ts`).
- Prisma is the only way this app talks to Postgres — no raw SQL, no
  second ORM.
- Money is `Decimal` in Postgres/Prisma (`price`, `amount`); Square wants
  integer cents — conversion happens at the boundary in `src/lib/square.ts`,
  keep it there rather than scattering `* 100` / `/ 100` elsewhere.

## Docs directory

`docs/` holds planning docs (`.docx`, not meant to be hand-edited by
Claude — they're the owner's source-of-truth plan) plus `STATUS.md`
(the living build log, which Claude should keep current).
