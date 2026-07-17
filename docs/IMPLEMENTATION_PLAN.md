# Implementation Plan

## Prompt 5 delivery checklist

- Preserve the Prompt 1–4 foundation, authentication, domain models, and design system.
- Replace the foundation landing screen with the responsive Formivo storefront homepage.
- Add the public `/products`, `/categories`, `/categories/[slug]`, and `/products/[slug]` routes.
- Add typed catalogue models, fixtures, query parsing, sorting, filtering, and pagination services.
- Add reusable site header, mobile navigation, footer, category navigation, product card, product grid, price, rating, filter, pagination, gallery, and purchase-panel components.
- Use local reliable product artwork and `next/image` with stable aspect ratios.
- Add route-level loading, empty, error, and missing-product states.
- Add meaningful Jest and React Testing Library coverage for catalogue utilities and user-facing component behaviour.
- Run type checking, linting, formatting checks, tests, and a production build.

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
