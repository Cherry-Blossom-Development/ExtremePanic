# ExtremePanic — Status

Last updated: 2026-08-12. This is a running log of where the build actually is
relative to `docs/x-panic-plan.docx` (business plan) and
`docs/x-panic-technical-plan-v2.docx` (technical plan, the one currently being
followed). Update this file when a phase milestone lands or a real decision
diverges from the written plan — it's meant to answer "where are we and what's
left" without re-reading every commit.

## Where we are

Early Phase 1 (`Core Site, Payments & Fulfillment`) of the 5-phase plan. The
app runs locally only — nothing is deployed, and there is no real reviewed
product in it yet, only seed/placeholder content. Option B (custom Next.js
build) was chosen over Shopify, per the plan's default recommendation.

## Built so far

- **App scaffold** — Next.js 16 (App Router, TypeScript, Tailwind, `src/`
  dir), per `AGENTS.md`'s note that this is a version with breaking API
  changes from older Next.js knowledge.
- **Local database** — Postgres via `docker-compose.yml` (port 5433, to
  avoid colliding with any other local Postgres) + Prisma ORM. Three
  domain tables: `Subscriber`, `Review`, `Order`.
- **Email capture** — landing page (`src/app/page.tsx`) with a signup form
  (`src/components/SubscribeForm.tsx`) posting to `POST /api/subscribe`,
  which writes to `Subscriber`.
- **Review catalog** — `/reviews` (list) and `/reviews/[slug]` (detail),
  reading from the `Review` table. One row = one reviewed product; the
  business model doesn't separate "product" from "review," so there's no
  separate Product model.
- **Admin panel** — password-protected `/admin` (single shared password via
  `ADMIN_PASSWORD`), HMAC-signed session cookie (`src/lib/adminAuth.ts`),
  gated by `src/proxy.ts` (Next 16's rename of `middleware.ts` — see
  gotchas below). Full CRUD for reviews: create, edit, publish/unpublish,
  delete (`src/app/admin/(dashboard)/reviews/*`).
- **Checkout** — "Buy" button on a review's detail page creates an `Order`
  row and redirects to a Square-hosted Payment Link
  (`src/lib/square.ts`, plan v2 §2.2). Needs sandbox
  `SQUARE_ACCESS_TOKEN` / `SQUARE_LOCATION_ID`; 500s without them.
- **Seed data** — one placeholder review (`prisma/seed.ts`, "Bladeless
  Neck Fan") so pages aren't empty during development. Not a real product.

## Not built yet

Roughly in the order the plan implies:

- **Order fulfillment loop** — Orders are created `PENDING` and never move
  to `PAID`. The Square webhook that would confirm payment needs a public
  HTTPS URL, so it's blocked on deployment, not on code.
- **PayPal** — plan v2 §2.2 specifies PayPal as the backup payment rail
  alongside Square. Not started.
- **Dropship supplier integration** — plan recommends CJdropshipping
  ($0/mo) as the starting supplier (§2.3, §8). Not started; nothing
  currently routes an order to a supplier.
- **A real first product** — the whole model depends on buying, photographing,
  and reviewing one physical item. Hasn't happened yet; only seed content
  exists.
- **Deployment** — plan recommends reusing the existing Prosaurus/Breakroom
  EC2 box (44.225.148.34) behind the same nginx, or AWS Amplify as a fully
  isolated alternative (§2.4). Neither is set up; the site has never run
  outside local Docker.
- **Phase 2 — Analytics**: PostHog + Microsoft Clarity + Square Dashboard
  (§3). Not started.
- **Phase 3 — Marketing**: Klaviyo email campaigns, Meta/Google/TikTok ads
  + pixels, SEO/schema.org markup (§4). The email-capture form exists
  (Phase 1 groundwork per §4.1) but nothing consumes the `Subscriber` list
  yet.
- **Phase 4 — Auxiliary/funnel sites**. Not started.
- **Phase 5 — Owned products**. Not started (and intentionally last —
  breaks the "no inventory" constraint the core plan is built around).

## Deliberate deviations from the written plan

- **CMS**: plan v2 §2.4 recommends Sanity.io for review content. The build
  instead put `Review` rows directly in Postgres with a custom admin panel
  under `/admin`. This avoids an extra vendor and keeps review content in
  the same database/transaction as everything else, at the cost of the
  admin UI being hand-built instead of Sanity's studio. Worth revisiting
  only if content editing needs (multiple editors, richer media handling)
  outgrow a single shared-password admin panel.

## Next likely steps

1. Buy and review one real product; replace the seed review with it.
2. Deploy somewhere reachable over HTTPS (this unblocks the Square webhook,
   which unblocks a working `PAID` order status).
3. Wire the Square webhook so `Order.status` actually reflects payment.
4. Pick and connect a dropship supplier (CJdropshipping per the plan) so a
   paid order actually ships.
