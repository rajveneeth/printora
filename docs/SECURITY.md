# Security review and rate limiting

## Implemented controls

- Random 256-bit session bearer tokens; only SHA-256 digests are stored in PostgreSQL.
- HTTP-only, Secure-in-production, SameSite=Lax session cookies with a 30-day maximum age.
- Session rotation on sign-in, retained server revocation on sign-out, active-account checks, and database session IDs linked to user/IP/user-agent context, cart adoption, and checkout creation.
- PBKDF2-SHA512 password hashing with unique salts, 210,000 iterations, and timing-safe comparison. Invalid-account attempts run the same password verification work to reduce timing disclosure.
- Exact admin and seller role guards in server code. The request proxy is a convenience redirect, never the authority.
- Safe same-origin return-path validation prevents open redirects and cross-role dashboard forwarding.
- Zod validation at action and route boundaries, ownership checks in repositories, serializable checkout/payment transactions, provider signature verification, and idempotency constraints.
- Account carts are server-owned. Anonymous local storage has a 30-day TTL and contains product selections only; price, stock, permissions, and payment state are revalidated.
- Content Security Policy, frame denial, MIME sniffing prevention, strict referrer policy, restricted browser permissions, production HSTS, and hidden framework signature.
- Payment webhook authentication occurs before JSON parsing; payloads are limited to 1 MB.

## Rate-limiting strategy

Current fixed-window counters use an atomic PostgreSQL upsert. Keys contain a SHA-256 hash of the scope, normalised identifier, time window, and `RATE_LIMIT_SECRET`, so raw IP/email identifiers are not stored in the bucket table.

Forwarded client addresses are ignored by default. Behind a controlled proxy chain, `TRUSTED_PROXY_HOPS` must match the exact number of trusted hops and direct access to the application must be blocked. The rate limiter then selects and validates the address relative to the trusted end of `X-Forwarded-For`, so client-prepended values cannot create new buckets.

| Surface            | Identity   | Limit             |
| ------------------ | ---------- | ----------------- |
| Sign-in            | IP + email | 5 per 15 minutes  |
| Sign-in            | IP         | 30 per 15 minutes |
| Sign-up            | IP + email | 3 per hour        |
| Sign-up            | IP         | 10 per hour       |
| Search suggestions | IP         | 120 per minute    |

Rejected API requests return `429` and `Retry-After`; authentication actions return a generic wait message. Login responses remain generic and account creation no longer confirms that a specific email exists.

Before high-scale or multi-region traffic:

1. Move counters to a managed distributed limiter close to the edge while preserving the policy contract.
2. Trust forwarding headers only from the configured proxy/platform; otherwise use the platform-provided client address.
3. Add per-user limits to authenticated mutations, addresses, reviews, seller/admin actions, checkout creation, and payment confirmation.
4. Add bot protection only after measuring abuse, with an accessible fallback.
5. Delete expired PostgreSQL buckets on a schedule while this implementation remains active.
6. Define and automate a privacy-approved retention period for expired/revoked session tracing rows and their bounded IP/user-agent fields.

## Residual risks

- No MFA, email verification, password reset, credential-breach screening, or user-facing session/device revocation.
- No CSRF token layer beyond SameSite cookies and Next.js server-action origin protections; reassess if cross-origin clients are introduced.
- CSP currently permits inline scripts/styles required by the framework and Razorpay integration. A nonce-based CSP would be stronger.
- Seller media is demo/static; production upload scanning and object-storage controls are pending.
- Reservation expiry needs a scheduled worker.

Report suspected vulnerabilities privately to the project owner; do not include secrets, raw session cookies, or customer data in issue trackers.
