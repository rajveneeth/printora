# Implementation Plan

## Prompt 6 delivery checklist

- Preserve the Prompt 1–5 authentication, catalogue, reusable component, and design-system foundation.
- Add the public `/search` route and typed `/api/search/suggestions` endpoint.
- Add a Prisma-backed deterministic product-search repository restricted to public products and approved active sellers.
- Add Zod-normalised keyword, category, price, material, colour, rating, customisation, location, timing, stock, sort, and pagination parameters.
- Persist filters in shareable URLs and retain category context through sorting, pagination, suggestion selection, and recent searches.
- Add a shared debounced autocomplete with product, category, seller, popular, and recent suggestions.
- Support Arrow Up, Arrow Down, Enter, Escape, active descendant state, and screen-reader result announcements.
- Add initial guidance, loading, success, empty, suggestion-error, and database-error states.
- Seed a minimal, adjustable, and foldable phone-stand workflow.
- Add meaningful Jest and React Testing Library coverage for parsing, URL persistence, database query construction, recent searches, suggestions, and keyboard interactions.
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
