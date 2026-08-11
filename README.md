# ExtremePanic

Repository for **ExtremePanic.com** — a reviewed-dropshipping e-commerce site. The
core model: buy one unit of a "low effort" product (no design, shipping, or storage
overhead required), photograph and review it, and let the listing generate revenue
indefinitely while the up-front cost of acquiring and reviewing it stays fixed.

## Contents

- `docs/` — planning documents
  - `x-panic-plan.docx` — the original business plan (five phases: storefront +
    commerce, analytics, marketing, auxiliary funnel sites, owned products)
  - `x-panic-technical-plan.docx` — original technical implementation plan
  - `x-panic-technical-plan-v2.docx` — current plan: Square + PayPal for
    payments, per-vendor cost/lock-in analysis, AWS-first hosting. This is the
    plan being built out below.
- `src/` — the Next.js app (App Router, TypeScript, Tailwind)
- `prisma/` — database schema and migrations (PostgreSQL)
- `docker-compose.yml` — local Postgres for development

This is a custom build (Option B from the technical plan), independent of the
Breakroom/Prosaurus stack — its own database, its own dependencies, its own
deploy target — so it can be hosted on its own regardless of what happens with
the rest of the AWS account.

## Getting started

Requires Node.js and Docker.

```bash
cp .env.example .env      # local Postgres connection string + admin password
npm install
npm run db:up               # starts Postgres in Docker (port 5433)
npm run db:migrate          # applies the Prisma schema
npm run db:seed             # adds one placeholder review so pages aren't empty
npm run dev                 # http://localhost:3000
```

`npm run db:studio` opens Prisma Studio if you want to browse the database
directly. Any Postgres client (DBeaver, etc.) can also connect directly using
the credentials in `.env.example`.

### What's here so far

- A landing page (`src/app/page.tsx`) with an email capture form and a
  "latest reviews" teaser.
- `POST /api/subscribe` (`src/app/api/subscribe/route.ts`), which validates
  the address and writes it to the `Subscriber` table.
- `/reviews` and `/reviews/[slug]` — public list and detail pages reading
  from a `Review` table (one row = one reviewed product; the business model
  doesn't separate "product" from "review," so this stays one table rather
  than two).
- `/admin` — a password-protected area (single shared password, set via
  `ADMIN_PASSWORD` in `.env`; local default is `changeme`) for creating,
  editing, publishing/unpublishing, and deleting reviews without touching
  the database directly.
- Three Postgres tables (`Subscriber`, `Review`, plus Prisma's migration
  tracking) via Prisma, expanded as later phases (orders, etc.) need it.

### Not yet built

Payments (Square/PayPal), dropship supplier integration, analytics, and
deployment are all still ahead — see `docs/x-panic-technical-plan-v2.docx`
for the phased plan.
