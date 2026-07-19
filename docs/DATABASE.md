# Database Documentation

Prompt 3 introduces the PostgreSQL and Prisma data model for Formivo 3D. The schema focuses on marketplace domain data only and does not add payment or shipping-provider integrations.

## Local database

Start PostgreSQL with Docker Compose:

```bash
docker compose up -d postgres
```

Copy the environment template before running Prisma commands:

```bash
cp .env.example .env
```

## Prisma commands

```bash
pnpm db:generate
pnpm db:migrate
pnpm db:seed
pnpm db:reset
```

`pnpm db:seed` runs `prisma/seed.ts`. The seed is idempotent and creates a buyer, three approved sellers, starter categories, a desk organiser, three phone-stand variants, a planter, local product images, inventory, an address, and a favourite.

## Core entities

- `User`, `Session`, `Account`, and `Verification` provide the Better Auth-compatible authentication foundation.
- `BuyerProfile`, `SellerProfile`, and `Address` separate buyer and seller domain data from the base account.
- `SellerApplication` stores the submitted seller-verification snapshot, declaration, review status, and requested-change note separately from the mutable seller profile.
- `Category`, `Product`, `ProductImage`, `ProductVariant`, and `Inventory` model the catalogue and product approval state.
- `ProductApprovalEvent` records seller and future administrator lifecycle changes without overwriting status history.
- `Favourite`, `Cart`, and `CartItem` support buyer discovery and checkout preparation.
- `Order` and `OrderItem` store immutable order snapshots for product, seller, variant, customisation, price, tax, shipping fee, quantity, and image history.
- `Review` stores product review ratings that can later be moderated by administrators.

## Important constraints

- Public catalogue queries must only expose products with `PUBLISHED` status and a `publishedAt` value.
- `OrderItem` keeps historical snapshots and does not depend only on mutable product records.
- Favourites are unique per user and product.
- Cart items are unique per cart, product, and variant.
- Seller stores and product slugs are unique for stable public URLs.
- Seller product and inventory writes require an active owned seller profile; quantity cannot be reduced below reserved stock.
- Product variants retain inactive historical records so existing cart and order references are not deleted during seller edits.
- Product tags and search keywords use PostgreSQL arrays with GIN indexes for deterministic discovery queries.
- Search also indexes product creation date and base price for common result ordering and filtering paths.

## Deferred integrations

Payment verification, payment events, shipment tracking, external file storage, and shipping labels are intentionally outside Prompt 3. Later prompts should add typed provider abstractions before implementing those workflows.

## Migration files

The initial Prisma migration is under `prisma/migrations/20260717074700_init`. Prompt 6 adds `prisma/migrations/20260719120000_search_discovery` for tags and search indexes. Prompt 7 adds `prisma/migrations/20260719180000_seller_dashboard` for applications, product audit events, view counters, and active variants. Apply all committed migrations with `pnpm db:migrate` after dependencies are installed and PostgreSQL is running.
