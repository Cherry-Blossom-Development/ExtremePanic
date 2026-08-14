# ExtremePanic — Status

Last updated: 2026-08-14. This is a running log of where the build actually is
relative to `docs/x-panic-plan.docx` (business plan) and
`docs/x-panic-technical-plan-v2.docx` (technical plan, the one currently being
followed). Update this file when a phase milestone lands or a real decision
diverges from the written plan — it's meant to answer "where are we and what's
left" without re-reading every commit.

## Where we are

Mid Phase 1 (`Core Site, Payments & Fulfillment`) of the 5-phase plan. **Live
in production** at https://extremepanic.com since 2026-08-12, deployed to the
existing Prosaurus/Breakroom EC2 box per the plan's default recommendation
(see `CLAUDE.md`'s "EC2 Production Deployment" section for the how-to). The
first real review (an EOHOE glucose meter) is published — the "buy one,
review it" model has now actually run once end-to-end, short of an actual
sale (Square is still sandbox-only). Option B (custom Next.js build) was
chosen over Shopify, per the plan's default recommendation.

## Built so far

- **App scaffold** — Next.js 16 (App Router, TypeScript, Tailwind, `src/`
  dir), per `AGENTS.md`'s note that this is a version with breaking API
  changes from older Next.js knowledge.
- **Local database** — Postgres via `docker-compose.yml` (port 5433, to
  avoid colliding with any other local Postgres) + Prisma ORM. Four
  domain tables: `Subscriber`, `Review`, `Order`, `ProductCandidate`.
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
  Neck Fan") so pages aren't empty during *local* development. Deliberately
  **not** run against production — the live `/reviews` is empty until a
  real product is added via `/admin`.
- **Production deployment** — containerized (`Dockerfile`, Next.js
  `output: "standalone"`) and running on the shared Prosaurus EC2 box
  (44.225.148.34) as its own Docker containers (`extremepanic-web`,
  `extremepanic-postgres` — isolated from Breakroom's MariaDB), behind the
  box's existing host nginx with a Let's Encrypt cert for
  `extremepanic.com` / `www.extremepanic.com`. Square is in **sandbox**
  mode (no real charges) since sandbox keys haven't been supplied yet —
  the Buy button 500s until `SQUARE_ACCESS_TOKEN` / `SQUARE_LOCATION_ID`
  are added to the box's `.env`.
- **Review image and video uploads** — the admin review form uploads
  images and (optional) videos directly to S3 (`src/lib/s3.ts`), mirroring
  Breakroom's approach but with its own bucket (`extremepanic-uploads`,
  us-west-2) and its own scoped IAM user — fully separate from Breakroom's
  uploads bucket/credentials. A manually pasted URL still works as a
  fallback for either field. Images: JPEG/PNG/GIF/WebP up to 5MB. Video:
  MP4/WebM/MOV up to 50MB, rendered on the review page with a native
  HTML5 `<video>` player (no YouTube/Vimeo embed support — direct video
  files only).
- **First real review published** — an EOHOE glucose meter, added
  2026-08-13 via `/admin`, replacing the local-only seed placeholder.
- **Candidates list** — a separate, internal-only admin section
  (`/admin/candidates`, `ProductCandidate` table) for tracking products
  worth considering before they're actually purchased: name, optional
  description, purchase link, price, added-on timestamp. No public route,
  no publish flag — distinct from `Review`, which only ever represents an
  already-bought, already-photographed product. A "Promote to review"
  link pre-fills the new-review form from a candidate and deletes the
  candidate once the review is actually created.

## Not built yet

Roughly in the order the plan implies:

- **Order fulfillment loop** — Orders are created `PENDING` and never move
  to `PAID`. The Square webhook that would confirm payment needs a public
  HTTPS URL — that's no longer blocked (the site is live over HTTPS now),
  just not built yet.
- **Square sandbox credentials** — the deployed site has no
  `SQUARE_ACCESS_TOKEN` / `SQUARE_LOCATION_ID` set, so the Buy button
  500s in production too, same as it always has locally.
- **PayPal** — plan v2 §2.2 specifies PayPal as the backup payment rail
  alongside Square. Not started.
- **Dropship supplier integration** — plan recommends CJdropshipping
  ($0/mo) as the starting supplier (§2.3, §8). Not started; nothing
  currently routes an order to a supplier.
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

1. Supply Square sandbox credentials (then later live credentials) to the
   box's `.env` so checkout works on the real review that's now live.
2. Wire the Square webhook so `Order.status` actually reflects payment —
   no longer blocked on deployment now that the site is live over HTTPS.
3. Pick and connect a dropship supplier (CJdropshipping per the plan) so a
   paid order actually ships.
4. Buy and review a second product now that the whole loop (buy → review →
   publish, with a real photo) has been proven out once.
