# Quality, accessibility, responsive, and performance review

## Automated gate

CI runs formatting, strict TypeScript, ESLint with Next.js Core Web Vitals rules, Jest/React Testing Library with enforced global coverage floors, Prisma validation, all migrations, the idempotent seed, and the production build against PostgreSQL 16. The current floors are 70% statements/lines, 45% functions, and 40% branches; they prevent regression while higher-risk repository integration coverage is expanded.

The test suite covers validation, permissions, password/session helpers, cart persistence, sign-in/sign-out cart transitions and merge inputs, pricing, search, seller lifecycle/inventory, checkout orchestration, payments, order transitions, review eligibility, administration, storage, and shared UI behavior.

## Accessibility review

Reviewed keyboard operation, focus visibility, names/descriptions, landmarks, live regions, reduced motion, loading/error states, and image alternatives.

Implemented findings:

- A visible-on-focus skip link targets `#main-content` on storefront pages.
- Global `:focus-visible` styling and `prefers-reduced-motion` handling are present.
- Inputs link hints/errors with `aria-describedby` and expose invalid state.
- Search autocomplete implements combobox keyboard behavior and announcements.
- Modal focus is moved inside, trapped for Tab/Shift+Tab, restored to the opener, closed with Escape, and prevents background scroll.
- Reusable empty/error states use unique generated heading IDs, avoiding duplicate ARIA references.
- Icon-only controls have accessible names; decorative images/icons use empty alternatives or `aria-hidden`.
- Error boundaries give recoverable, non-sensitive messages and payment errors never imply success.

Manual release checks still required: VoiceOver/NVDA flow, 200% browser zoom, Windows high-contrast mode, and Razorpay’s hosted checkout accessibility.

## Responsive review

Reviewed the shared header/navigation, catalogue grids and filters, product gallery/purchase panel, cart seller groups, checkout/address forms, buyer order cards, seller workspace, and admin tables at narrow mobile, tablet, laptop, and wide layouts.

The hardening pass removed the global 360 px minimum width, allowed long user/content strings to wrap, prevented form controls from forcing grid overflow, retained mobile navigation variants, and kept reduced-motion behavior. Release smoke testing should cover 320, 375, 768, 1024, and 1440 CSS pixels in current Chromium, Firefox, and Safari.

## Performance and images

- `next/image` handles product, category, cart, order, and hero media with responsive `sizes`; AVIF/WebP negotiation and a one-day minimum image cache TTL are enabled.
- The hero remains the only intentionally eager large visual; the initial trending grid was reduced from four priority images to two.
- `next/font` self-hosts and subsets the three font faces used by the design.
- Server Components remain the default, client state is scoped to interactive features, and suggestion responses are private/no-store.
- Metadata endpoints provide canonical URLs, Open Graph/Twitter cards, robots, sitemap, manifest, and an SVG application icon.
- Production compression is enabled and the framework signature header is disabled.

No Lighthouse score is asserted without a repeatable browser runner and deployed network profile. Add browser performance budgets for LCP, CLS, INP, JavaScript transfer, and image weight when the end-to-end runner is introduced.
