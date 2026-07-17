# Implementation Plan

## Prompt 4 completion checklist

- Architecture proposal documented.
- Mermaid diagrams added to architecture documentation and README.
- Next.js TypeScript foundation created.
- Strict TypeScript configuration enabled.
- ESLint, Prettier, Jest, and React Testing Library configured.
- Environment validation created.
- Path alias `@/*` configured.
- Base README and CI workflow created.
- Central green colour, spacing, typography, radius, shadow, and breakpoint tokens created.
- Tailwind theme bindings and SCSS base architecture created.
- Reusable Button, Input, Select, Card, Badge, Modal, Skeleton, EmptyState, and ErrorState components created with barrel exports and tests.
- Prisma schema created for authentication, buyer, seller, catalogue, cart, order, review, favourite, inventory, and address entities.
- Credential sign-up, sign-in, sign-out, HTTP-only sessions, protected routes, role dashboards, unauthorised state, and authentication tests added.
- Docker Compose PostgreSQL service added.
- Idempotent Prisma seed data added.
- Domain model contracts and repository contracts added.
- Database documentation added.

## Requirement mapping

| Domain                                                       | Prompt |
| ------------------------------------------------------------ | ------ |
| Project foundation                                           | 1      |
| Green design system                                          | 2      |
| Prisma, model contracts, repository contracts, and seed data | 3      |
| Better Auth and roles                                        | 4      |
| Storefront catalogue                                         | 5      |
| Search                                                       | 6      |
| Custom requests and quotes                                   | 7      |
| Seller dashboard                                             | 8      |
| Admin dashboard                                              | 9      |
| Quality, visual review, deployment                           | 10     |

## Deferred quality gate note

The CI quality gate note originated after Prompt 1 because the marketplace is not fully implemented yet. The configured lint, typecheck, test, build, migration, seed, and visual review steps must return in Prompt 10 before the MVP is considered complete.
