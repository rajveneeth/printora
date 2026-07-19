# Formivo 3D

Formivo 3D is a full-stack marketplace foundation for ready-made and custom 3D-printed products. It currently includes credential authentication, a PostgreSQL/Prisma domain model, database-backed deterministic search, category-guided discovery, accessible suggestions, recent searches, persistent URL filters, the buyer storefront foundation, a database-backed seller workspace, and a transactional cart-to-order checkout foundation.

> **Architecture status:** `/search`, checkout validation, inventory, addresses, payments, and orders use PostgreSQL. The homepage, general catalogue, category pages, and product detail pages still read a deterministic TypeScript fixture. Google OAuth, Better Auth, and GraphQL remain planned integrations. Razorpay is available only when explicitly selected and configured; the local demo defaults to the labelled mock provider. See [Backend and data evolution](docs/BACKEND_EVOLUTION.md) for the audited migration plan.

## Product identity

- Product: Formivo 3D
- Tagline: Imagine it. Find it. Print it.
- Currency: INR
- Primary visual direction: calm green marketplace UI with spacious layouts, rounded cards, minimal shadows, and product-focused imagery.

## Technology stack

- Next.js App Router
- React
- TypeScript strict mode
- Tailwind CSS v4 entrypoint mapped to shared CSS variables
- SCSS token, base, and component-module styling architecture
- Zod environment validation
- PostgreSQL 16 and Prisma
- Jest and React Testing Library
- ESLint and Prettier
- pnpm 10

## Architecture

```mermaid
flowchart LR
    User[Customer Seller Admin] --> Web[Next.js App Router]
    Web --> Auth[Custom credential sessions]
    Web --> Actions[Server Components and Route Handlers]
    Actions --> Services[Domain Services]
    Services --> Repositories[Repository Layer]
    Repositories --> Database[(PostgreSQL via Prisma)]
    Services --> Storage[Storage Provider]
    Services --> Search[Database Search]
    Services -. future .-> GraphQL[GraphQL API adapter]
    Services --> Payment[Mock or Razorpay Payment Provider]
```

```mermaid
flowchart TD
    AppRouter[App Router] --> Layouts[Public Account Seller Admin Layouts]
    Layouts --> Pages[Route Pages]
    Pages --> Features[Feature Modules]
    Features --> Components[Reusable Components]
    Components --> DesignSystem[Design System]
    DesignSystem --> Tokens[Shared Design Tokens]
```

```mermaid
sequenceDiagram
    participant User
    participant UI
    participant API
    participant Service
    participant Repository
    participant Database

    User->>UI: Submit action
    UI->>API: Validated request
    API->>Service: Execute use case
    Service->>Repository: Read or write data
    Repository->>Database: Database operation
    Database-->>Repository: Result
    Repository-->>Service: Domain data
    Service-->>API: Result
    API-->>UI: Typed response
    UI-->>User: Updated interface
```

## Folder structure

```text
src/
  app/                         Public and role-based App Router routes
  components/                  Shared UI and public layout components
  config/                      Central product identity
  features/catalogue/          Catalogue models, data, services, components, tests
  features/cart/               Persistent bag store, pricing, summary, and cart UI
  features/checkout/           Addresses, checkout orchestration, payment UI, and tests
  features/orders/             Order confirmation queries and presentation
  features/seller/             Seller permissions, schemas, repositories, services, forms, and tests
  lib/                         Authentication, payments, Prisma, and shared utilities
  styles/                      Tokens, base styling, and global Tailwind bindings
docs/
  ENVIRONMENT.md               Local, OAuth, secret, and production runbook
  BACKEND_EVOLUTION.md         Database and GraphQL delivery plan
tests/
.github/workflows/
```

Server Components compose public catalogue pages from typed catalogue and search services. The `/search` route queries published products from approved active sellers through a Prisma repository and deterministically ranks the returned catalogue records. Filters, sort order, and page selection remain in URL search parameters. Focused Client Components handle autocomplete, recent-search storage, navigation drawers, the product gallery, product options, and wishlist feedback. Catalogue money is represented in paise and formatted centrally as INR.

## Local setup

Prerequisites are Node.js, pnpm 10, Docker, and Docker Compose. No Google, payment, or GraphQL credentials are required for the features implemented today.

```bash
pnpm install
docker compose up -d postgres
cp .env.example .env
pnpm db:generate
pnpm db:migrate
pnpm db:seed
pnpm dev
```

The complete key-acquisition, local configuration, production secret-management, migration, and troubleshooting procedure is in [Environment and deployment configuration](docs/ENVIRONMENT.md).

## Quality commands

Linting uses the ESLint CLI rather than `next lint`, which is not available in Next.js 16. The production build script selects Next.js's webpack compiler explicitly because the Turbopack build did not terminate reliably in the constrained local tool environment; the emitted application remains a standard Next.js production build.

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## Environment variables

| Variable                            | Required now                                        | Purpose                                                     |
| ----------------------------------- | --------------------------------------------------- | ----------------------------------------------------------- |
| `NEXT_PUBLIC_APP_URL`               | Yes                                                 | Canonical application origin. This is intentionally public. |
| `DATABASE_URL`                      | Yes for database-backed runtime and Prisma commands | Server-only PostgreSQL connection string.                   |
| `BETTER_AUTH_SECRET`                | No                                                  | Reserved; not consumed by current custom sessions.          |
| `BETTER_AUTH_URL`                   | No                                                  | Reserved; not consumed until Better Auth is adopted.        |
| `GOOGLE_CLIENT_ID`                  | No                                                  | Reserved until Google OAuth routes and UI are implemented.  |
| `GOOGLE_CLIENT_SECRET`              | No                                                  | Reserved server-only OAuth credential.                      |
| `PAYMENT_PROVIDER`                  | No; defaults to `mock`                              | Selects the labelled local mock or configured Razorpay.     |
| `ALLOW_MOCK_PAYMENTS_IN_PRODUCTION` | No; defaults to `false`                             | Permits simulation only for an explicit production demo.    |
| `RAZORPAY_KEY_ID`                   | Only in Razorpay mode                               | Public key ID returned only to Razorpay Checkout.           |
| `RAZORPAY_KEY_SECRET`               | Only in Razorpay mode                               | Server-only API and checkout-verification credential.       |
| `RAZORPAY_WEBHOOK_SECRET`           | Only in Razorpay mode                               | Server-only raw-webhook signature credential.               |
| `CUSTOMER_DASHBOARD_ENABLED`        | No; defaults to true                                | Customer dashboard feature gate.                            |
| `SELLER_DASHBOARD_ENABLED`          | No; defaults to true                                | Seller dashboard feature gate.                              |
| `SELLER_IMAGE_MAX_COUNT`            | No; defaults to 8                                   | Maximum product image metadata entries per seller listing.  |
| `SELLER_IMAGE_MAX_BYTES`            | No; defaults to 5 MiB                               | File-size limit enforced by the seller image abstraction.   |
| `ADMIN_DASHBOARD_ENABLED`           | No; defaults to true                                | Admin dashboard feature gate.                               |

Do not assume a feature is active because its variable appears in `.env.example`. Runtime integration status and exact setup steps are maintained in [`docs/ENVIRONMENT.md`](docs/ENVIRONMENT.md).

## Backend and GraphQL direction

The recommended product-stage architecture is a **single-repository modular monolith**. Next.js owns rendering and HTTP adapters; domain services own business rules; repository interfaces isolate Prisma and PostgreSQL. This avoids premature distributed-system overhead while leaving explicit seams for future extraction.

The next data milestone is to replace fixture-backed catalogue reads with a Prisma catalogue repository. GraphQL should follow as an optional typed transport over the same services, rather than bypassing repositories or duplicating business logic. Server Components should continue to load SEO-critical pages directly on the server; focused Client Components can use generated GraphQL operations for interactive dashboards and mutations.

See [`docs/BACKEND_EVOLUTION.md`](docs/BACKEND_EVOLUTION.md) for current-state findings, target and sequence diagrams, phased delivery, security controls, extraction criteria, and definition of done. See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the repository-wide architecture record.

## Implementation phases

1. Architecture and project foundation.
2. Design system and reusable UI foundation.
3. Database schema, repository contracts, model contracts, Docker PostgreSQL setup, and seed data.
4. Authentication, sessions, roles, and permissions.
5. Customer storefront, categories, products, and discovery.
6. Deterministic database search, suggestions, recent searches, persistent filters, and accessible keyboard flows.
7. Seller dashboard and product management.
8. Cart, addresses, checkout, payments, and order creation.
9. Admin moderation, content, settings, and audit workflows.
10. Hardening, tests, visual review, performance, and deployment readiness.

## Design system

The visual foundation follows the approved green reference: fern primary actions, clay orange custom-order emphasis, warm neutral surfaces, thin borders, restrained radius, and subtle shadows. Runtime design tokens live in SCSS partials and are exposed to Tailwind utilities through `src/styles/globals.scss`. Reusable components use local barrels and colocated tests.

## Cart, checkout, and payments

- `/cart` persists display snapshots in a hydration-safe Zustand store and supports seller grouping, accessible quantity changes, removal, tax, delivery estimates, and the shared header count.
- `/checkout` requires a server session, manages owned delivery addresses, reviews grouped items, and submits only stable product references and quantities.
- The server reloads publication state, seller approval, active variants, current prices, purchase limits, and unreserved stock from PostgreSQL before creating an order.
- A serializable transaction reserves inventory and creates immutable item/address snapshots, the initial order event, checkout session, and pending payment. Provider calls occur outside the transaction with compensating reservation release on setup failure.
- Mock success and failure are clearly simulated. Razorpay mode creates provider orders server-side, opens Standard Checkout with only the key ID, verifies returned signatures and provider payment state server-side, and processes signed, idempotent webhooks.
- `/checkout/success` displays only an order owned by the signed-in customer with a recorded paid-or-later state. `/checkout/failure` provides safe recovery without claiming payment success.

## Known limitations

- The homepage and `/products` catalogue still use the typed deterministic catalogue fixture from Prompt 5; `/search` is the first public product-discovery route backed by Prisma.
- Search uses deterministic field matching and application ranking. No semantic or AI search provider is configured or claimed.
- Wishlist, shipping-carrier integration, seller order transitions, quotations, payouts, and admin moderation are intentionally assigned to later prompts.
- Local credential authentication is available from Prompt 4; optional Google OAuth remains deferred. Razorpay checkout requires valid sandbox or live credentials and a webhook secret, while local development uses an explicitly simulated mock payment provider.
- Seller image management currently accepts deterministic local `/catalogue/` URLs. The provider validates image metadata and preserves a typed object-storage seam, but binary uploads and production object-storage credentials are not active yet.
- The Prompt 7 and Prompt 8 migrations and expanded seed are committed and validated at schema level. They were not applied in the implementation workspace because its Docker daemon was not running; start Docker and run `pnpm db:migrate && pnpm db:seed` locally.
- Pending checkout expiry is stored but automated expiry cleanup requires a production scheduler or queue worker; abandoned reservations should be released by that job before launch at scale.

## Catalogue routes

- `/` — marketplace homepage and featured discovery
- `/products` — complete catalogue with filtering, sorting, and pagination
- `/categories` — browse all active product categories
- `/categories/[slug]` — category-specific catalogue results
- `/products/[slug]` — product media, options, seller trust details, and related products
- `/search` — database-backed keyword search, category guidance, URL filters, sorting, and result states
- `/api/search/suggestions?q=phone` — typed product, category, seller, and popular-search suggestions
- `/cart` — persistent seller-grouped shopping bag and totals
- `/checkout` — authenticated address, review, stock validation, and payment flow
- `/checkout/success` and `/checkout/failure` — verified result and recovery states
- `/account/addresses` — owned delivery-address management
- `/api/payments/razorpay/webhook` — raw-signature-verified, idempotent provider events

## Search and discovery

- Search parameters are validated with Zod and include keyword, category, price, material, colour, rating, customisation, seller location, processing time, delivery estimate, stock, sort, and page.
- Suggestion requests begin after two characters, debounce in the browser, return at most five entries, and support Arrow Up, Arrow Down, Enter, and Escape.
- Submitted searches are stored only in local browser storage, capped at five unique recent entries, and retain optional category context.
- The development seed includes minimal, adjustable, and foldable phone stands for the guided phone-stand workflow.

## Seller workspace

- `/seller` — database-backed revenue, order, product, inventory, and rating overview
- `/seller/onboarding` — persisted seller application and capability profile
- `/seller/profile` — owned store settings and capability management
- `/seller/products` — responsive seller product listing with status and lifecycle actions
- `/seller/products/new` — twelve-section product editor with draft and review submission actions
- `/seller/products/[productId]/edit` — ownership-protected product editing
- `/seller/products/[productId]/inventory` — product and variant inventory with reserved-stock protection

Product drafts remain private. Approved sellers can submit complete drafts for administrator review, but cannot publish them until an administrator changes the product to `APPROVED`. Seller publication, pause, duplication, archive, image metadata, inventory, and every lifecycle mutation are authorised server-side. Editing an approved or published product moves it back to a private draft and removes its public publication date.

## Demo credentials

After running the idempotent seed, all demo accounts use password `Formivo123!`.

- Seller: `seller@formivo.local`
- Customer: `buyer@formivo.local`
- Admin: `admin@formivo.local`
