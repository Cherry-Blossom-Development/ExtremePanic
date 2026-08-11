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
cp .env.example .env      # local Postgres connection string
npm install
npm run db:up              # starts Postgres in Docker (port 5433)
npm run db:migrate         # applies the Prisma schema
npm run dev                # http://localhost:3000
```

`npm run db:studio` opens Prisma Studio if you want to browse the database
directly.

### What's here so far

- A landing page (`src/app/page.tsx`) with an email capture form.
- `POST /api/subscribe` (`src/app/api/subscribe/route.ts`), which validates
  the address and writes it to the `Subscriber` table.
- One Postgres table (`Subscriber`) via Prisma — the first slice of "some
  kind of database," expanded as later phases (products, reviews, orders)
  need it.

### Not yet built

Payments (Square/PayPal), the review/product catalog and CMS, dropship
supplier integration, analytics, and deployment are all still ahead — see
`docs/x-panic-technical-plan-v2.docx` for the phased plan.
