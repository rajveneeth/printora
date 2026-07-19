# Database Documentation

Prompt 3 introduced the PostgreSQL and Prisma marketplace model. Prompt 8 extends it with transactional checkout, immutable delivery snapshots, payments, provider events, and order status history. Prompt 9 adds seller-scoped fulfilment, separate verified product and seller ratings, category metadata, moderation history, and general audit records.

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

`pnpm db:seed` runs `prisma/seed.ts`. The seed is idempotent and creates demo accounts, approved and pending sellers, all storefront catalogue products/variants, categories, images, inventory, addresses, orders in multiple states, seller fulfilments, verified ratings, and audit history.

## Core entities

- `User`, `Session`, `Account`, and `Verification` provide credential identity and database sessions. `Session.token` contains a SHA-256 digest, `Session.id` is the non-secret trace identifier, and `revokedAt` invalidates a session without destroying its audit linkage.
- `BuyerProfile`, `SellerProfile`, and `Address` separate buyer and seller domain data from the base account.
- `SellerApplication` stores the submitted seller-verification snapshot, declaration, review status, and requested-change note separately from the mutable seller profile.
- `Category`, `Product`, `ProductImage`, `ProductVariant`, and `Inventory` model the catalogue and product approval state.
- `ProductApprovalEvent` records seller and future administrator lifecycle changes without overwriting status history.
- `Favourite`, `Cart`, `CartItem`, and `CartMerge` support buyer discovery, account-cart persistence, session tracing, and idempotent anonymous-cart adoption.
- `RateLimitBucket` stores atomic fixed-window counters under peppered hash keys without raw IP/email identifiers.
- `Order` and `OrderItem` store immutable order snapshots for product, seller, variant, customisation, price, tax, shipping fee, quantity, and image history.
- `OrderAddress` preserves the selected delivery address even if the customer later edits or deletes the account address.
- `CheckoutSession` owns the checkout idempotency key, selected provider, expiry, completion state, and the authenticated database-session reference used to start it.
- `Payment` stores the expected amount, provider, provider order and payment identifiers, verification time, and final result without accepting a browser-owned status.
- `PaymentEvent` deduplicates provider callbacks and Razorpay webhook deliveries by external event ID.
- `OrderStatusEvent` records the initial reservation, verified payment, and payment-failure transitions without overwriting history.
- `SellerOrderFulfilment` gives each seller in a marketplace order an isolated status, carrier, and tracking record.
- `Review` and `SellerReview` store separate verified product and seller dimensions with one unique record per delivered order item.
- `ReviewModerationEvent` and `SellerModerationEvent` preserve before-and-after moderation states and reasons.
- `AuditLog` records actor, action, entity, state snapshots, reason, and timestamp for important mutations.

## Important constraints

- Public catalogue queries must only expose products with `PUBLISHED` status and a `publishedAt` value.
- `OrderItem` keeps historical snapshots and does not depend only on mutable product records.
- Favourites are unique per user and product.
- Cart items are unique per cart and hashed selection/customisation line key. Guest merges are unique per cart and guest-cart UUID.
- Seller stores and product slugs are unique for stable public URLs.
- Seller product and inventory writes require an active owned seller profile; quantity cannot be reduced below reserved stock.
- Product variants retain inactive historical records so existing cart and order references are not deleted during seller edits.
- Checkout creation runs at serializable isolation and reserves unreserved inventory with an optimistic equality predicate before it commits the pending order.
- Payment success consumes both stock and its reservation in the same transaction as the paid order state. Verified failure and provider-order setup failure release the reservation in the same transaction as cancellation.
- Checkout idempotency keys, provider order IDs, provider payment IDs, and provider event IDs are unique. Replayed confirmations therefore return recorded state without repeating inventory mutations.
- Address mutations always include the authenticated owner in their lookup; order history reads always include the buyer ID.
- Seller fulfilment writes require an active approved owning seller and accept only the next valid status; every transition records actor, previous state, new state, note, and time.
- Review submission reloads the order item inside a serializable transaction and rejects wrong owners, undelivered fulfilments, self-review, missing products, and duplicate product or seller ratings.
- Seller suspension pauses public products in the same transaction as the moderation and audit events.
- Product tags and search keywords use PostgreSQL arrays with GIN indexes for deterministic discovery queries.
- Search also indexes product creation date and base price for common result ordering and filtering paths.

## Provider boundaries

Payment provider network calls intentionally run outside database transactions. A pending order and reservation commit first, the provider order is created second, and its identifier is attached in a short follow-up transaction. Provider setup failure invokes an idempotent compensating transaction. Shipment tracking, external file storage, and shipping labels remain deferred.

## Migration files

The migrations are ordered under `prisma/migrations`. Prompt 10 migrations `20260720030000_hardening_sessions_cart` and `20260720040000_checkout_session_trace` add account-cart/session linkage, line keys, merge audit records, rate-limit buckets, retained revocation state, and checkout-to-session tracing. Use `pnpm db:migrate` locally and `pnpm db:deploy` in a release job.
