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

`pnpm db:seed` runs `prisma/seed.ts`. The seed is idempotent and creates a buyer, an approved seller, starter categories, one published product, images, variants, inventory, an address, and a favourite.

## Core entities

- `User`, `Session`, `Account`, and `Verification` provide the Better Auth-compatible authentication foundation.
- `BuyerProfile`, `SellerProfile`, and `Address` separate buyer and seller domain data from the base account.
- `Category`, `Product`, `ProductImage`, `ProductVariant`, and `Inventory` model the catalogue and product approval state.
- `Favourite`, `Cart`, and `CartItem` support buyer discovery and checkout preparation.
- `Order` and `OrderItem` store immutable order snapshots for product, seller, variant, customisation, price, tax, shipping fee, quantity, and image history.
- `Review` stores product review ratings that can later be moderated by administrators.

## Important constraints

- Public catalogue queries must only expose products with `PUBLISHED` status and a `publishedAt` value.
- `OrderItem` keeps historical snapshots and does not depend only on mutable product records.
- Favourites are unique per user and product.
- Cart items are unique per cart, product, and variant.
- Seller stores and product slugs are unique for stable public URLs.

## Deferred integrations

Payment verification, payment events, shipment tracking, external file storage, and shipping labels are intentionally outside Prompt 3. Later prompts should add typed provider abstractions before implementing those workflows.

## Migration files

The initial Prisma migration directory is present under `prisma/migrations/20260717074700_init`. Regenerate and apply the full SQL migration with `pnpm db:migrate` after dependencies are installed and PostgreSQL is running.
