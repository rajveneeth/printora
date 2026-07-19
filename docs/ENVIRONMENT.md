# Environment variables

Copy `.env.example` to `.env` for local development. `.env` and `.env*.local` are ignored; never commit real values. Runtime validation is composed in `src/lib/validation/env.ts` from shared, customer, seller, admin, and payment schemas.

## Variables

| Variable                            | Required       | Scope and validation                                                                                |
| ----------------------------------- | -------------- | --------------------------------------------------------------------------------------------------- |
| `NODE_ENV`                          | Set by runtime | `development`, `test`, or `production`                                                              |
| `NEXT_PUBLIC_APP_URL`               | Production     | Public absolute origin used for canonical metadata, sitemap, and robots; no secret                  |
| `DATABASE_URL`                      | Runtime        | PostgreSQL connection URL; use TLS in production                                                    |
| `RATE_LIMIT_SECRET`                 | Production     | Server-only random pepper, minimum 32 characters; the development default is rejected in production |
| `PAYMENT_PROVIDER`                  | No             | `mock` by default or `razorpay`                                                                     |
| `ALLOW_MOCK_PAYMENTS_IN_PRODUCTION` | No             | Must remain `false` for commerce; explicit demo escape hatch only                                   |
| `RAZORPAY_KEY_ID`                   | With Razorpay  | Provider key ID returned to Razorpay Checkout when needed                                           |
| `RAZORPAY_KEY_SECRET`               | With Razorpay  | Server-only provider secret                                                                         |
| `RAZORPAY_WEBHOOK_SECRET`           | With Razorpay  | Server-only, independently generated webhook signature secret                                       |
| `CUSTOMER_DASHBOARD_ENABLED`        | No             | Boolean feature gate, default `true`                                                                |
| `SELLER_DASHBOARD_ENABLED`          | No             | Boolean feature gate, default `true`                                                                |
| `SELLER_IMAGE_MAX_COUNT`            | No             | Integer 1–12, default `8`                                                                           |
| `SELLER_IMAGE_MAX_BYTES`            | No             | Integer bytes, minimum 1024, default 5 MiB                                                          |
| `ADMIN_DASHBOARD_ENABLED`           | No             | Boolean feature gate, default `true`                                                                |

There are no reserved or unused OAuth/auth-library variables. Add variables only when the corresponding integration exists in code and validation.

## Generate secrets

```bash
openssl rand -base64 32
```

Use independent values per local, CI, staging, and production environment. Rotating `RATE_LIMIT_SECRET` starts new logical buckets; it does not invalidate user sessions because bearer session tokens are random and stored as digests.

## Local PostgreSQL

```bash
docker compose up -d postgres
docker compose ps
```

Host-run application:

```dotenv
DATABASE_URL="postgresql://formivo:formivo@localhost:5432/formivo"
```

An application running inside the same Compose network would use hostname `postgres`, not `localhost`.

## Payments

Local demo:

```dotenv
PAYMENT_PROVIDER="mock"
ALLOW_MOCK_PAYMENTS_IN_PRODUCTION="false"
```

Razorpay:

```dotenv
PAYMENT_PROVIDER="razorpay"
RAZORPAY_KEY_ID="rzp_test_or_live_..."
RAZORPAY_KEY_SECRET="..."
RAZORPAY_WEBHOOK_SECRET="..."
```

Configure `https://your-origin.example/api/payments/razorpay/webhook` for `payment.captured` and `payment.failed`. The API key secret and webhook secret are different values. Test and live environments need separate credentials and webhook configuration.

## Production rules

- Set `NEXT_PUBLIC_APP_URL` to the final HTTPS origin.
- Use the hosting platform’s encrypted secret manager.
- Use a least-privileged PostgreSQL role, TLS, pooling appropriate to the runtime, automated backups, and restoration tests.
- Run `pnpm db:deploy` once before shifting traffic to code that depends on the new schema.
- Keep mock payments disabled unless the deployment is explicitly a non-commerce demo.
- Do not expose server values with a `NEXT_PUBLIC_` prefix.

See [deployment](DEPLOYMENT.md) for the release and rollback procedure.
