# Deployment

## Supported shape

Deploy Formivo as one Node.js Next.js application plus PostgreSQL. The application needs persistent outbound access to PostgreSQL and, when enabled, Razorpay. Static catalogue assets ship with the application.

Recommended production prerequisites:

- Node.js 22 and pnpm 10.28.1
- HTTPS at the edge
- Managed PostgreSQL 16 with TLS, backups, and connection pooling
- Encrypted environment variables from [ENVIRONMENT.md](ENVIRONMENT.md)
- One migration job per release

## Release procedure

1. Build and validate the exact commit in CI.
2. Back up the database or confirm point-in-time recovery.
3. Install and generate the client.
4. Apply committed migrations once.
5. Build the application with production variables.
6. Start the new release and smoke-test public, authentication, role, cart, and payment-provider paths.
7. Shift traffic only after the checks pass.

```bash
pnpm install --frozen-lockfile
pnpm db:generate
pnpm db:validate
pnpm db:deploy
pnpm build
pnpm start
```

Do not run `prisma migrate dev`, `db:reset`, or the demo seed against a real production database. Run `pnpm db:seed` only for local, CI, or a disposable demonstration environment.

## Smoke checks

- `/`, `/products`, a product detail page, `/robots.txt`, and `/sitemap.xml` return successfully.
- An unauthenticated `/checkout`, `/seller`, or `/admin` request redirects to `/sign-in` with a safe `next` value.
- Customer, seller, and admin demo equivalents land only in allowed workspaces.
- An anonymous cart survives refresh; after sign-in it appears in the account cart exactly once.
- Search suggestions return normally and emit `429` plus `Retry-After` when intentionally rate-tested.
- In a sandbox, payment success is verified server-side and payment failure releases reservations.

## Rollback

Application rollback is safe only while the previous code can operate against the migrated schema. Migrations are forward-only in the normal release path. For a destructive or incompatible schema change, use an expand/migrate/contract sequence across releases. Restore from a tested backup only as an incident response decision; do not improvise a reverse migration on live data.

## Operations

- Monitor application errors, database saturation, authentication `429` rates, checkout latency, payment webhook failures, reservation age, and failed migrations.
- Schedule deletion of expired `RateLimitBucket` rows.
- Add a reservation-expiry worker before real commerce traffic.
- Rotate exposed credentials immediately and review session/audit records using database session IDs, never raw cookie values.
