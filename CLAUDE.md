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

## EC2 Production Deployment

Live at https://extremepanic.com, deployed 2026-08-12 to the shared
Prosaurus/Breakroom EC2 box (44.225.148.34) — see the parent repo's
`Breakroom/CLAUDE.md` for that box's general layout. Runs as its own
Docker containers, isolated from Breakroom's MariaDB:

- `extremepanic-web` — this app, built from the repo's `Dockerfile`
  (Next.js `output: "standalone"`), image `dallascaley/extremepanic-web`
  on Docker Hub, bound to `127.0.0.1:3001` (Breakroom's backend already
  has `:3000`).
- `extremepanic-postgres` — `postgres:16-alpine`, own named volume, not
  published to the host (only reachable from `extremepanic-web` over the
  compose network) — unlike Breakroom's MariaDB, which is host-exposed.

Both are defined in `docker-compose.ec2.yml` (committed — no secrets in
it) at `~/extremepanic/` on the box, alongside a non-committed `.env`
(gitignored locally as `.env.production`, scp'd to the box as `.env`).
Host nginx (`/etc/nginx/conf.d/extremepanic.com.conf`, not in this repo)
terminates TLS (Let's Encrypt, auto-renewing via certbot's systemd timer)
and reverse-proxies to `127.0.0.1:3001`.

**The box is memory- and disk-constrained** (~1.9GB RAM, ~2GB disk free
at time of writing, no swap) and shared with live Breakroom — always
build images locally and push to Docker Hub, never build on the box
itself, and keep the runner image lean (see the Dockerfile's comments on
why it does a targeted `npm install --no-save prisma@<version>` instead
of copying the full project `node_modules` — the latter balloons the
image with `typescript`/`eslint`/etc. that the running app doesn't need).

### Redeploy after an app change

```bash
# From this repo, on the dev machine (Docker Desktop must be running):
docker build -t dallascaley/extremepanic-web:latest .
docker push dallascaley/extremepanic-web:latest

# On the EC2 box:
ssh -i ~/.ssh/Hostgator-Key-1.pem ec2-user@44.225.148.34
cd ~/extremepanic
docker compose -f docker-compose.ec2.yml --env-file .env pull web
docker compose -f docker-compose.ec2.yml --env-file .env up -d --force-recreate web
docker image prune -f   # reclaim space from the superseded image layers
```

If `prisma/schema.prisma` or its migrations changed, also run inside the
container after redeploying:

```bash
docker compose -f docker-compose.ec2.yml --env-file .env exec web node_modules/.bin/prisma migrate deploy
```

(Use the full `node_modules/.bin/prisma` path, not `npx prisma` — the
container has no network access assumption baked in and this avoids an
npx resolution surprise.)

If `docker-compose.ec2.yml` itself changed, `scp` it to
`~/extremepanic/docker-compose.ec2.yml` on the box before the `pull`/`up`
step above.

### Useful commands (on the box)

```bash
docker logs extremepanic-web -f
docker compose -f docker-compose.ec2.yml --env-file .env restart
docker compose -f docker-compose.ec2.yml --env-file .env stop   # stop, keep containers/volumes
sudo nginx -t && sudo systemctl reload nginx   # after editing the nginx conf
```

### Not yet configured

- **Square** — the box's `.env` has no `SQUARE_ACCESS_TOKEN` /
  `SQUARE_LOCATION_ID`, so checkout 500s in production, matching local
  dev. Add sandbox keys there (not to this repo) to enable it.
- **Square payment-confirmation webhook** — no longer blocked on
  deployment (the site has a public HTTPS URL now), but still not built.
