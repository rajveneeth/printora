# Formivo 3D

Formivo 3D is a full-stack marketplace foundation for ready-made and custom 3D-printed products. The current implementation includes Prompt 5: a responsive buyer storefront, category discovery, product listing, URL-based filtering and sorting, pagination, product details, and reusable catalogue components on top of the existing authentication, design-system, and database foundation.

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
- Jest and React Testing Library
- ESLint and Prettier
- pnpm 10

## Architecture

```mermaid
flowchart LR
    User[Customer Seller Admin] --> Web[Next.js App Router]
    Web --> Auth[Better Auth]
    Web --> Actions[Server Actions and Route Handlers]
    Actions --> Services[Domain Services]
    Services --> Repositories[Repository Layer]
    Repositories --> Database[(PostgreSQL via Prisma)]
    Services --> Storage[Storage Provider]
    Services --> Search[Database Search]
    Services --> Payment[Payment Provider]
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
  lib/                         Authentication, Prisma, and shared utilities
  styles/                      Tokens, base styling, and global Tailwind bindings
docs/
tests/
.github/workflows/
```

Server Components compose public catalogue pages from typed catalogue service results. Filters, sort order, and page selection remain in URL search parameters. Focused Client Components handle navigation drawers, the product gallery, product options, and wishlist feedback. Catalogue money is represented in paise and formatted centrally as INR.

## Local setup

```bash
pnpm install
cp .env.example .env
pnpm dev
```

## Quality commands

Linting uses the ESLint CLI rather than `next lint`, which is not available in Next.js 16.

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## Environment variables

| Variable               | Required now          | Purpose                                                  |
| ---------------------- | --------------------- | -------------------------------------------------------- |
| `NEXT_PUBLIC_APP_URL`  | Yes                   | Canonical local application URL.                         |
| `DATABASE_URL`         | Yes for database work | PostgreSQL connection string used by Prisma.             |
| `BETTER_AUTH_SECRET`   | No                    | Reserved for future Auth.js or Better Auth adapter work. |
| `BETTER_AUTH_URL`      | No                    | Reserved for future Auth.js or Better Auth adapter work. |
| `GOOGLE_CLIENT_ID`     | No                    | Optional future Google OAuth.                            |
| `GOOGLE_CLIENT_SECRET` | No                    | Optional future Google OAuth.                            |
| `RAZORPAY_KEY_ID`      | No                    | Optional future Razorpay sandbox.                        |
| `RAZORPAY_KEY_SECRET`  | No                    | Optional future Razorpay sandbox.                        |

## Implementation phases

1. Architecture and project foundation.
2. Design system and reusable UI foundation.
3. Database schema, repository contracts, model contracts, Docker PostgreSQL setup, and seed data.
4. Authentication, sessions, roles, and permissions.
5. Customer storefront, categories, products, and discovery.
6. Search suggestions, filters, sorting, and accessible keyboard flows.
7. Custom requests, quotations, and custom projects.
8. Seller dashboard and product/order management.
9. Admin moderation, content, settings, and audit workflows.
10. Hardening, tests, visual review, performance, and deployment readiness.

## Design system

The visual foundation follows the approved green reference: fern primary actions, clay orange custom-order emphasis, warm neutral surfaces, thin borders, restrained radius, and subtle shadows. Runtime design tokens live in SCSS partials and are exposed to Tailwind utilities through `src/styles/globals.scss`. Reusable components use local barrels and colocated tests.

## Known limitations

- Prompt 5 uses a typed deterministic catalogue source shaped for a repository adapter; expanding the Prisma seed and switching the public service to Prisma remains part of the later database integration pass.
- Search autocomplete, persisted wishlist/cart state, checkout, payments, shipping, seller dashboards, and admin moderation are intentionally assigned to later prompts.
- Local credential authentication is available from Prompt 4; optional Google OAuth and Razorpay adapters remain deferred.

## Catalogue routes

- `/` — marketplace homepage and featured discovery
- `/products` — complete catalogue with filtering, sorting, and pagination
- `/categories` — browse all active product categories
- `/categories/[slug]` — category-specific catalogue results
- `/products/[slug]` — product media, options, seller trust details, and related products
