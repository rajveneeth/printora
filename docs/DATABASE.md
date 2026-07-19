# Database Documentation

Prompt 3 introduced the PostgreSQL and Prisma marketplace model. Prompt 8 extends it with transactional checkout, immutable delivery snapshots, payments, provider events, and order status history.

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
- `OrderAddress` preserves the selected delivery address even if the customer later edits or deletes the account address.
- `CheckoutSession` owns the checkout idempotency key, selected provider, expiry, and completion state.
- `Payment` stores the expected amount, provider, provider order and payment identifiers, verification time, and final result without accepting a browser-owned status.
- `PaymentEvent` deduplicates provider callbacks and Razorpay webhook deliveries by external event ID.
- `OrderStatusEvent` records the initial reservation, verified payment, and payment-failure transitions without overwriting history.
- `Review` stores product review ratings that can later be moderated by administrators.

## Important constraints

- Public catalogue queries must only expose products with `PUBLISHED` status and a `publishedAt` value.
- `OrderItem` keeps historical snapshots and does not depend only on mutable product records.
- Favourites are unique per user and product.
- Cart items are unique per cart, product, and variant.
- Seller stores and product slugs are unique for stable public URLs.
- Seller product and inventory writes require an active owned seller profile; quantity cannot be reduced below reserved stock.
- Product variants retain inactive historical records so existing cart and order references are not deleted during seller edits.
- Checkout creation runs at serializable isolation and reserves unreserved inventory with an optimistic equality predicate before it commits the pending order.
- Payment success consumes both stock and its reservation in the same transaction as the paid order state. Verified failure and provider-order setup failure release the reservation in the same transaction as cancellation.
- Checkout idempotency keys, provider order IDs, provider payment IDs, and provider event IDs are unique. Replayed confirmations therefore return recorded state without repeating inventory mutations.
- Address mutations always include the authenticated owner in their lookup; order history reads always include the buyer ID.
- Product tags and search keywords use PostgreSQL arrays with GIN indexes for deterministic discovery queries.
- Search also indexes product creation date and base price for common result ordering and filtering paths.

## Provider boundaries

Payment provider network calls intentionally run outside database transactions. A pending order and reservation commit first, the provider order is created second, and its identifier is attached in a short follow-up transaction. Provider setup failure invokes an idempotent compensating transaction. Shipment tracking, external file storage, and shipping labels remain deferred.

## Migration files

The initial Prisma migration is under `prisma/migrations/20260717074700_init`. Prompt 6 adds `prisma/migrations/20260719120000_search_discovery` for tags and search indexes. Prompt 7 adds `prisma/migrations/20260719180000_seller_dashboard` for applications, product audit events, view counters, and active variants. Prompt 8 adds `prisma/migrations/20260719210000_checkout_foundation` for checkout sessions, immutable addresses, payments, provider events, and order status events. Apply all committed migrations with `pnpm db:migrate` after dependencies are installed and PostgreSQL is running.
