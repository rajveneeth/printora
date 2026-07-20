# Implementation Plan

## Prompt 10 delivery checklist

- Add 30-day anonymous-cart retention, idempotent server cart merging, authenticated cart persistence, shared-browser isolation, and checkout cart clearing.
- Hash stored bearer session tokens, trace carts with non-secret session IDs, capture bounded request context, rotate sessions, and preserve safe post-login destinations.
- Enforce exact seller/admin workspaces, protect checkout in the request proxy, rate-limit authentication/search, bound webhook payloads, and apply production security headers.
- Add root and route error recovery, complete metadata endpoints, focus trapping, unique ARIA IDs, reduced-motion support, responsive overflow fixes, and image/performance configuration.
- Replace placeholder CI with database migration/seed, coverage, type, lint, format, Prisma, and production-build gates.
- Document environment variables, architecture, deployment, security, rate limiting, quality review, demo credentials, seed behavior, and known limitations.
- Remove unused environment placeholders, dependencies, scripts, and reference-only repository artifacts.

## Prompt 10 validation record

- Prisma client generation and schema validation pass with Prisma 6.19; all seven committed migrations apply successfully to PostgreSQL 16.
- The idempotent seed runs successfully and mirrors all 14 public catalogue products for authoritative cart and checkout validation.
- Strict TypeScript, ESLint, Prettier, Jest/React Testing Library with coverage, and the Next.js webpack production build pass.
- The complete Jest suite contains 41 suites and 95 tests, including anonymous-to-account cart adoption, revoked-session detection, and sign-out isolation.
- Production smoke tests return `307` safe-return redirects for anonymous `/checkout`, `/seller`, and `/admin` requests, `200` for public metadata, and the documented security headers.
- Historical Prompt 7–9 notes about an unavailable Docker daemon are superseded by this completed PostgreSQL validation.

## Prompt 9 delivery checklist

- Preserve Prompt 1–8 authentication, catalogue, search, seller, cart, checkout, payment, design-system, and repository boundaries.
- Add buyer-owned order history, order detail, seller-group tracking, immutable snapshots, filters, and status timelines.
- Add seller-owned order queues and sequential server-authorised fulfilment transitions with carrier and tracking capture at shipment.
- Add separate product and seller rating records, delivered-order eligibility, self-review protection, unique order-item constraints, and serializable submission.
- Add a protected dark-fern administration shell with database-backed marketplace metrics and responsive operational surfaces.
- Add category hierarchy, order, active state, imagery, icon, and SEO management using archival rather than unsafe deletion.
- Add product approval, approval-and-publication, requested-change, and rejection transactions with required adverse-decision reasons.
- Add seller approval, requested-change, rejection, and suspension transactions; suspension removes public product visibility atomically.
- Add review visibility moderation plus product, seller, review, order, and category audit trails containing actor, state change, reason, and timestamp.
- Add central cross-role permission helpers and meaningful tests for permissions, transitions, review eligibility, validation, and accessible presentation.
- Run Prisma generation and validation, strict TypeScript, ESLint, Prettier, Jest, and the Next.js production build.

## Prompt 8 delivery checklist

- Preserve the Prompt 1–7 authentication, catalogue, search, seller workspace, reusable component, and green design-system foundation.
- Add a hydration-safe persistent Zustand shopping bag with add, quantity, removal, grouped summary, header count, and meaningful empty state.
- Add authenticated delivery-address create, edit, default, and delete workflows with shared Zod validation and ownership enforcement.
- Add a server-authoritative checkout review that rejects unpublished products, inactive sellers or variants, invalid quantities, stale prices, missing inventory, and insufficient unreserved stock.
- Add immutable order address and item snapshots, checkout sessions, payments, payment events, order status events, provider identifiers, and idempotency constraints.
- Add serializable order/reservation creation plus idempotent payment success, payment failure, reservation release, and duplicate-event handling.
- Add a typed payment-provider interface, a credential-free labelled local mock, and a Razorpay adapter with server-side order creation, checkout verification, payment-state retrieval, and signed webhook handling.
- Add responsive cart, checkout, payment failure, order confirmation, and account-address routes following the warm-neutral and fern visual reference.
- Add meaningful Jest and React Testing Library coverage for cart behaviour, money and shipping calculations, checkout validation, address schemas, provider verification, and payment transaction orchestration.
- Run Prisma generation and validation, strict TypeScript, ESLint, Prettier, Jest, and the Next.js production build.

## Prompt 7 delivery checklist

- Preserve the Prompt 1–6 authentication, catalogue, search, reusable component, and design-system foundation.
- Add seller onboarding with a persisted application snapshot and verification status.
- Add an approved-seller profile editor and a database-backed dashboard with revenue, order, product, inventory, and review metrics.
- Add seller-owned product listing, creation, editing, duplication, draft, review submission, approved publication, pause, and archival workflows.
- Add explicit product lifecycle rules so a seller cannot publish an unapproved listing.
- Add product image metadata management behind a typed local URL storage provider that can later be replaced by object storage.
- Add product-level and variant-level inventory management with reserved-stock protection and low-stock thresholds.
- Add shared Zod validation, central seller permission helpers, ownership checks, suspended-seller restrictions, and mutation audit events.
- Separate shared, customer, seller, and admin environment configuration by prefixed schemas and documented groups.
- Add meaningful Jest coverage for permission boundaries, lifecycle transitions, product validation, image validation, and inventory rules.
- Run Prisma generation, type checking, linting, formatting checks, tests, and a production build.

## Prompt 6 delivery record

- Preserve the Prompt 1–5 authentication, catalogue, reusable component, and design-system foundation.
- Add the public `/search` route and typed `/api/search/suggestions` endpoint.
- Add a Prisma-backed deterministic product-search repository restricted to public products and approved active sellers.
- Add Zod-normalised keyword, category, price, material, colour, rating, customisation, location, timing, stock, sort, and pagination parameters.
- Persist filters in shareable URLs and retain category context through sorting, pagination, suggestion selection, and recent searches.
- Add a shared debounced autocomplete with product, category, seller, popular, and recent suggestions.
- Support Arrow Up, Arrow Down, Enter, Escape, active descendant state, and screen-reader result announcements.
- Add initial guidance, loading, success, empty, suggestion-error, and database-error states.
- Seed a minimal, adjustable, and foldable phone-stand workflow.
- Add meaningful Jest and React Testing Library coverage for parsing, URL persistence, database query construction, recent searches, suggestions, and keyboard interactions.
- Run type checking, linting, formatting checks, tests, and a production build.

## Prompt 7 validation record

- Prisma client generation and schema validation pass with Prisma 6.19.
- Strict TypeScript, ESLint, Prettier, Jest, React Testing Library, and the Next.js webpack production build pass.
- The complete Jest suite contains 26 suites and 59 tests after the seller delivery.
- Applying the committed migration and running the idempotent seed require a running PostgreSQL service. The local Docker daemon was unavailable during implementation, so those two database-runtime commands remain to be run after Docker starts.

## Prompt 8 validation record

- Prisma client generation and schema validation pass with Prisma 6.19 for the checkout migration.
- Strict TypeScript, ESLint, Prettier, Jest, React Testing Library, and the Next.js webpack production build pass.
- The complete Jest suite contains 31 suites and 71 tests after the cart and checkout delivery.
- The committed migration and expanded idempotent seed could not be executed against PostgreSQL because the workspace Docker daemon remains unavailable. Run `pnpm db:migrate && pnpm db:seed` after Docker starts.

## Prompt 9 validation record

- Prisma client generation and schema validation pass with Prisma 6.19 for the order, review, and administration migration.
- Strict TypeScript, ESLint, Prettier, Jest, React Testing Library, and the Next.js webpack production build pass.
- The complete Jest suite contains 38 suites and 86 tests after the Prompt 9 delivery.
- The migration includes a backfill that creates one seller fulfilment per existing order and seller pair before new workflows are used.
- Applying the migration and running the expanded idempotent seed remain unverified against PostgreSQL because the workspace Docker daemon is unavailable. Run `pnpm db:migrate && pnpm db:seed` after Docker starts.

## Requirement mapping

| Domain                                                       | Prompt |
| ------------------------------------------------------------ | ------ |
| Project foundation                                           | 1      |
| Green design system                                          | 2      |
| Prisma, model contracts, repository contracts, and seed data | 3      |
| Credential authentication and roles                          | 4      |
| Storefront catalogue                                         | 5      |
| Search                                                       | 6      |
| Seller dashboard and product management                      | 7      |
| Cart, addresses, checkout, payment, and order creation       | 8      |
| Orders, reviews, administration, permissions, and audit      | 9      |
| Quality, visual review, deployment                           | 10     |
