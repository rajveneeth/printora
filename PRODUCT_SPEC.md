Formivo 3D Marketplace: Complete MVP Implementation

You are acting as the lead full-stack engineer, UI engineer, database architect, accessibility engineer, and technical reviewer for this project.

Build a complete, production-quality MVP for a multi-vendor marketplace dedicated to ready-made and custom 3D-printed products.

Do not build only a static landing page or disconnected mock screens. Build a functioning full-stack application with authentication, database-backed features, role-based dashboards, search, seller product management, admin approval, custom quotation workflows, cart, checkout simulation, orders, ratings, reviews, and content management.

The application must run locally from a clean checkout.

⸻

1. Working product identity

Working product name:

Formivo 3D

Tagline:

Imagine it. Find it. Print it.

Centralise the product name, tagline, contact information, currency, commission percentage, and brand values inside a reusable application configuration file. Do not hardcode the product name across dozens of components.

The name is a working name and must be easy to replace later.

Suggested configuration:

export const siteConfig = {
  name: 'Formivo 3D',
  shortName: 'Formivo',
  tagline: 'Imagine it. Find it. Print it.',
  description:
    'A marketplace for ready-made and custom 3D-printed products.',
  currency: 'INR',
  currencySymbol: '₹',
  defaultCommissionPercentage: 10,
}

⸻

2. Product purpose

Formivo 3D brings independent 3D-printing sellers into one trusted marketplace.

Customers must be able to:

1. Browse existing 3D-printed products.
2. Search by product name, category, use case, material, colour, seller, and location.
3. Open a product page and review full product and seller information.
4. Select colours, sizes, materials, finishes, quantities, and available customisations.
5. Ask the seller for a minor product customisation.
6. Add products to a cart.
7. Place an order using a sandbox or simulated payment workflow.
8. Track regular and custom orders in one order dashboard.
9. Rate the product and seller after delivery.
10. Post an original idea as a custom request.
11. Receive quotations from multiple approved sellers.
12. Compare quotations.
13. select a quotation.
14. Pay for the selected quotation.
15. Track the custom product through design, production, shipping, and delivery.

Sellers must be able to:

1. Apply to become a seller.
2. Maintain a seller profile and store.
3. Create and edit product listings.
4. Upload product images.
5. Configure variants, materials, colours, dimensions, processing time, price, stock, and customisation options.
6. Submit products for admin approval.
7. Track approval status and requested changes.
8. Manage regular orders.
9. Update production and shipping statuses.
10. Browse eligible custom requests.
11. Submit quotations.
12. Manage accepted custom projects.
13. View monthly revenue, pending payouts, product performance, active orders, and reviews.

Administrators must be able to:

1. Verify sellers.
2. Review submitted products.
3. Approve, reject, or request changes to products.
4. Create and manage categories.
5. Moderate reviews.
6. View orders and disputes.
7. Moderate customer custom requests.
8. Manage homepage content.
9. Manage featured products and featured sellers.
10. Manage users and roles.
11. View audit history.
12. Configure platform commission and general marketplace settings.

⸻

3. Visual reference

Use the attached green marketplace design image as the primary visual reference.

The image is a visual direction, not an exact specification.

Use it to understand:

* Overall green theme
* Spacious layout
* Card proportions
* Header structure
* Product card structure
* Product detail structure
* Seller dashboard direction
* Admin dashboard direction
* Fresh and clean visual character
* Use of large product imagery
* Minimal shadows
* Rounded corners
* Soft neutral backgrounds

Do not copy incorrect or inconsistent text from the image.

Do not use the product name shown inside the image. Use Formivo 3D from the configuration file.

Do not attempt to reproduce the entire reference image as one page. Convert it into a coherent responsive application with separate routes.

The result should feel:

* Fresh
* Natural
* Premium but approachable
* Creative
* Calm
* Trustworthy
* Modern
* Simple
* Product-focused

Avoid:

* Neon cyberpunk styling
* Excessive gradients
* Glassmorphism
* Overly dark customer pages
* Large animated backgrounds
* Heavy shadows
* Oversized rounded cards everywhere
* Tiny low-contrast text
* Generic SaaS dashboard styling on the customer storefront
* Cultural clichés or literal New Zealand tourism imagery

⸻

4. Design system

Colour tokens

Use CSS variables and Tailwind theme tokens.

Primary palette:

--background: #f7f5ef;
--surface: #ffffff;
--surface-subtle: #f0eee6;
--primary: #174a3a;
--primary-hover: #123b2f;
--primary-foreground: #ffffff;
--secondary: #6f8b72;
--secondary-foreground: #ffffff;
--accent: #d86f45;
--accent-hover: #bf5e39;
--accent-foreground: #ffffff;
--sky: #cde8ee;
--ink: #1e2522;
--muted-foreground: #66706b;
--border: #dce2dc;
--success: #2e7d5b;
--warning: #c58a2d;
--error: #c84b4b;
--info: #3c7287;

Use fern green for:

* Main buttons
* Navigation emphasis
* Active states
* Links
* Seller and admin sidebar branding
* Positive marketplace signals

Use clay orange carefully for:

* Post your idea
* Request customisation
* Important custom-order actions
* Limited promotional highlights

Do not use clay orange for normal destructive actions.

Typography

Use next/font.

Preferred font combination:

* Headings: Manrope
* Body and interface: Geist
* Numeric dashboard values: Geist Mono, used sparingly

Typography should remain readable and restrained.

Use approximately:

* Hero heading: 48 to 64 pixels on desktop
* Page heading: 32 to 40 pixels
* Section heading: 24 to 32 pixels
* Card title: 16 to 18 pixels
* Body: 15 to 16 pixels
* Supporting text: 13 to 14 pixels

Shape and spacing

* Maximum public-page content width: approximately 1440 pixels
* Desktop page gutters: 32 to 48 pixels
* Tablet gutters: 24 pixels
* Mobile gutters: 16 pixels
* Card radius: 14 to 18 pixels
* Button radius: 10 to 12 pixels
* Input radius: 10 to 12 pixels
* Use thin neutral borders
* Use subtle shadows only where necessary
* Maintain generous white space
* Avoid making every section visually boxed

Motion

Use subtle motion only:

* Button hover
* Card hover
* Dropdown entrance
* Drawer entrance
* Step transitions
* Skeleton loading

Respect prefers-reduced-motion.

Do not use continuous floating animations.

⸻

5. Required technology stack

Use the current stable compatible versions available at implementation time.

Core

* Next.js with App Router
* React
* TypeScript with strict mode
* pnpm
* Node.js LTS

Styling and components

* Tailwind CSS
* shadcn/ui
* Radix UI primitives where needed
* Lucide React icons
* CSS variables for design tokens
* next/font
* next/image

Use shadcn/ui as editable component source. Do not install a large restrictive UI framework on top of it.

Forms and validation

* React Hook Form
* Zod
* Shared Zod schemas between client and server where appropriate

State management

Use Zustand only for genuine client interface state:

* Shopping cart
* Search overlay state
* Active product filters
* Product comparison state, if included
* Wishlist optimistic interface state
* Multi-step custom-request draft
* Temporary checkout state
* Mobile navigation state

Do not place the entire database or all server-fetched products inside Zustand.

Server-owned data must remain server-owned.

Use Server Components, Server Actions, route handlers, URL search parameters, and database queries for server data.

Avoid hydration mismatches when persisting Zustand state.

Authentication

Use Better Auth.

Implement:

* Google authentication
* Email and password authentication
* Session management
* Secure server-side session retrieval
* Role-based access
* Sign out
* Account linking where safely supported
* Protected customer, seller, and admin routes

Use the Better Auth Prisma adapter.

User roles:

enum UserRole {
  CUSTOMER
  SELLER
  ADMIN
}

A normal customer may apply to become a seller.

Do not rely only on client-side route protection. Authorisation must be enforced in server components, server actions, and route handlers.

Database

* PostgreSQL
* Prisma ORM
* Prisma migrations
* Idempotent seed script

Use a local Docker Compose PostgreSQL service for development.

The project must include:

* docker-compose.yml
* .env.example
* Prisma schema
* Migration files
* Seed data
* Database reset instructions

Payments

Create a payment-provider abstraction.

Provide two implementations:

1. A local mock provider that works without credentials.
2. A Razorpay sandbox adapter that activates when valid environment variables are provided.

The complete local demo must work using the mock provider.

For Razorpay mode:

* Create payment orders server-side.
* Verify payment signatures server-side.
* Never trust a payment status sent directly by the browser.
* Add a webhook route.
* Store provider transaction identifiers.
* Handle duplicate webhook events safely.

Do not include secret values in source control.

Media storage

Create a storage-provider abstraction.

Provide:

1. A local development storage implementation or URL-based fallback.
2. An S3-compatible or Cloudinary production adapter placeholder.

The local application and seed data must work without external storage credentials.

Validate:

* File type
* File size
* Image count
* Filename
* User permission

Use Next.js image optimisation for displayed images.

Testing

* Vitest
* React Testing Library
* Playwright
* Accessibility checks where practical

Code quality

* ESLint
* Prettier
* Strict TypeScript
* No unexplained any
* No ignored TypeScript errors
* No disabled lint rules without justification

⸻

6. Application architecture

Use a clear feature-oriented structure.

A suggested structure is:

src/
  app/
    (storefront)/
    (auth)/
    account/
    seller/
    admin/
    api/
  components/
    ui/
    common/
    storefront/
    product/
    custom-request/
    checkout/
    seller/
    admin/
  features/
    auth/
    products/
    categories/
    cart/
    checkout/
    orders/
    sellers/
    custom-requests/
    quotations/
    reviews/
    content/
    search/
  lib/
    auth/
    db/
    payments/
    storage/
    permissions/
    validation/
    utils/
  stores/
  hooks/
  types/
  config/
prisma/
public/
docs/
tests/

Use repository patterns or service functions only where they make the code clearer. Do not create unnecessary abstraction layers for simple queries.

Prefer:

* Server Components for initial data loading
* Server Actions for authenticated form mutations
* Route handlers where a public API, webhook, upload, autocomplete request, or external provider requires one
* Client Components only for interactivity

⸻

7. Database model

Design a complete relational schema.

At minimum, model the following entities:

Authentication

* User
* Session
* Account
* Verification

Use the schema required by Better Auth.

User profile

* UserProfile
* Address
* Wishlist

User profile fields should support:

* Display name
* Phone
* Profile image
* Default delivery address
* Role
* Account status
* Created date
* Last active date

Seller

* SellerProfile
* SellerApplication
* SellerCapability
* SellerPayoutAccount
* SellerPayout
* SellerReviewSummary

Seller profile fields:

* Store name
* Store slug
* Description
* Logo
* Banner
* Contact details
* Shipping origin city
* Shipping origin state
* Shipping origin postal code
* Years of experience
* Supported materials
* Supported print technologies
* Maximum printable dimensions
* Custom-order availability
* Average processing time
* Verification status
* Average seller rating
* Completed order count
* Cancellation rate
* Created date

Seller verification statuses:

enum SellerVerificationStatus {
  NOT_APPLIED
  PENDING
  CHANGES_REQUESTED
  APPROVED
  REJECTED
  SUSPENDED
}

Product catalogue

* Category
* Product
* ProductImage
* ProductVariant
* ProductOption
* ProductOptionValue
* ProductMaterial
* ProductTag
* ProductCustomisationOption
* InventoryRecord
* ProductApprovalEvent

Product fields:

* Name
* Slug
* Short description
* Full description
* Category
* Seller
* Base price
* Compare-at price
* Currency
* SKU
* Stock
* Minimum order quantity
* Maximum order quantity
* Dimensions
* Weight
* Material
* Finish
* Colour
* Processing time
* Shipping origin
* Customisation available
* Safety notes
* Intended use
* Age restrictions where appropriate
* Intellectual-property declaration
* Search keywords
* SEO title
* SEO description
* Status
* Published date
* Created date
* Updated date

Product statuses:

enum ProductStatus {
  DRAFT
  PENDING_REVIEW
  CHANGES_REQUESTED
  APPROVED
  REJECTED
  PUBLISHED
  PAUSED
  ARCHIVED
}

A product cannot appear publicly before admin approval and publication.

Cart and checkout

* Cart
* CartItem
* CheckoutSession
* Payment
* PaymentEvent

Orders

* Order
* OrderItem
* OrderAddress
* OrderStatusEvent
* Shipment
* Refund
* Dispute

Regular order statuses:

enum OrderStatus {
  PENDING_PAYMENT
  PAID
  CONFIRMED
  IN_PRODUCTION
  READY_TO_SHIP
  SHIPPED
  OUT_FOR_DELIVERY
  DELIVERED
  CANCELLED
  REFUND_REQUESTED
  REFUNDED
}

Each order item must retain a snapshot of:

* Product name
* Seller
* Price
* Chosen variant
* Customisation request
* Product image
* Quantity
* Tax
* Shipping fee

Do not depend entirely on the current product record for historical order display.

Custom request marketplace

* CustomRequest
* CustomRequestAttachment
* CustomRequestCategory
* CustomRequestStatusEvent
* Quotation
* QuotationMessage
* CustomProject
* CustomProjectMilestone
* DesignApproval

Custom request fields:

* Customer
* Title
* Description
* Category
* Reference attachments
* Approximate dimensions
* Intended use
* Preferred material
* Preferred colours
* Quantity
* Budget minimum
* Budget maximum
* Delivery destination
* Required delivery date
* Visibility
* Status
* Quote deadline
* Created date

Custom request statuses:

enum CustomRequestStatus {
  DRAFT
  PENDING_MODERATION
  OPEN_FOR_QUOTES
  QUOTE_SELECTED
  PAYMENT_PENDING
  DESIGN_DISCUSSION
  DESIGN_APPROVAL_PENDING
  IN_PRODUCTION
  READY_TO_SHIP
  SHIPPED
  DELIVERED
  CANCELLED
  EXPIRED
}

Quotation fields:

* Custom request
* Seller
* Price
* Shipping fee
* Tax estimate
* Material
* Production method
* Production duration
* Delivery estimate
* Proposal message
* Revision count
* Valid until
* Status

Quotation statuses:

enum QuotationStatus {
  SUBMITTED
  REVISED
  ACCEPTED
  REJECTED
  WITHDRAWN
  EXPIRED
}

A seller must not be able to view another seller’s private quotation amount before the buyer chooses a quotation.

Ratings and reviews

* ProductReview
* SellerReview
* ReviewMedia
* ReviewModerationEvent
* ReviewHelpfulVote

A customer can review only after a corresponding order has been delivered.

Store separate ratings for:

Product:

* Quality
* Finish
* Accuracy
* Value

Seller:

* Communication
* Dispatch speed
* Customisation experience

Do not allow sellers to delete reviews.

Admins may moderate abusive or fraudulent reviews, but must record:

* Previous visibility
* New visibility
* Moderator
* Reason
* Timestamp

Content authoring

* ContentPage
* ContentSection
* HomepageBanner
* FeaturedCollection
* NavigationItem
* FAQ
* SiteSetting

Administration

* AuditLog
* AdminNote
* ModerationReason
* PlatformSetting

Audit important actions:

* Role change
* Seller approval
* Seller suspension
* Product approval
* Product rejection
* Product content modification by admin
* Review moderation
* Refund action
* Order status override
* Category deletion
* Platform setting change

⸻

8. Customer-facing routes

Create the following routes.

Public storefront

/
 /search
 /categories
 /categories/[slug]
 /products/[slug]
 /sellers/[slug]
 /custom
 /custom/new
 /custom/[id]
 /how-it-works
 /become-a-seller
 /about
 /help
 /terms
 /privacy

Authentication

/auth/sign-in
/auth/sign-up
/auth/forgot-password
/auth/verify-email

Customer account

/account
/account/orders
/account/orders/[orderId]
/account/custom-requests
/account/custom-requests/[requestId]
/account/quotes/[requestId]
/account/wishlist
/account/addresses
/account/profile
/account/settings

Cart and checkout

/cart
/checkout
/checkout/success
/checkout/failure

Use page-level loading states, empty states, error boundaries, and not-found handling.

⸻

9. Homepage requirements

Create a polished storefront homepage based on the green reference.

Header

Desktop header:

* Formivo logo
* Large central search field
* Categories menu
* Post your idea
* Become a seller
* Wishlist
* Orders
* Account menu
* Cart with item count

Mobile header:

* Menu button
* Logo
* Search button
* Cart button

The search input should be prominent.

Placeholder:

What would you like to create?

Hero

Hero headline:

Find it, customise it, or bring it to life.

Supporting message:

Discover unique 3D-printed products from independent makers, or post your own idea and receive quotations from verified creators.

Primary action:

Shop products

Secondary action:

Post your idea

Use high-quality placeholder or seeded product visuals. Do not use random external images that may disappear.

Trust strip

Display four items:

* Independent makers
* Custom requests
* Secure payments
* Tracked delivery

Popular categories

Show:

* Home and décor
* Desk and workspace
* Phone and electronics accessories
* Personalised gifts
* Toys and collectibles
* Miniatures and figurines
* Utility and replacement parts
* Fashion and accessories
* Education and models
* Business and bulk orders

Product sections

Include:

* Trending creations
* Best sellers
* Recently added
* Customisable products

Custom request section

Make this visually prominent.

Headline:

Have an idea in mind?

Explanation:

Post a sketch, photograph, reference, or written description. Verified makers can respond with quotations.

Action:

Post a custom request

How custom orders work

Display five steps:

1. Post your idea
2. Receive quotations
3. Compare and select
4. Approve the design
5. Track production and delivery

Seller section

Show featured verified makers with:

* Logo
* Store name
* City
* Rating
* Completed orders
* Supported materials
* View store button

Footer

Include:

* Categories
* Customer help
* Seller resources
* Company
* Legal pages
* Social links as placeholders
* Newsletter field
* Copyright
* Payment and security indicators

⸻

10. Search experience

Search is a major feature and must be functional.

Search suggestions

When the user types two or more characters:

* Debounce requests
* Return no more than five primary suggestions
* Include products, categories, sellers, and popular searches
* Highlight matching text accessibly
* Support keyboard navigation
* Support Arrow Up
* Support Arrow Down
* Support Enter
* Support Escape
* Announce result count to screen readers

Suggested endpoint:

GET /api/search/suggestions?q=phone

When the user presses Enter, navigate to:

/search?q=phone+stand

Do not replace the homepage with search results.

Search results page

Use URL parameters for shareable filters.

Example:

/search?q=phone+stand&category=phone-accessories&material=pla&customisable=true&sort=rating

Filters:

* Category
* Price range
* Material
* Colour
* Rating
* Customisation available
* Seller location
* Processing time
* In-stock
* Delivery estimate

Sort options:

* Relevance
* Popular
* Highest rated
* Price low to high
* Price high to low
* Newest
* Fastest dispatch

Desktop:

* Left filter sidebar
* Results grid

Mobile:

* Filter drawer
* Sort sheet

Include:

* Result count
* Active filter chips
* Clear all
* Empty state
* Pagination or load more
* Skeleton state

For the MVP, implement search using PostgreSQL-compatible queries across:

* Product name
* Short description
* Full description
* Category name
* Seller store name
* Tags
* Search keywords

Keep the search service isolated so it can later be replaced with Typesense, Meilisearch, Algolia, or Elasticsearch.

⸻

11. Product listing card

Each product card must show:

* Product image
* Wishlist control
* Product name
* Seller name
* Price
* Compare-at price where available
* Discount percentage where valid
* Average rating
* Review count
* Customisable badge
* Processing-time indicator where useful

Do not show fake countdown timers or misleading urgency.

Card interactions:

* Entire title and image area navigate to product
* Wishlist control remains independently accessible
* Visible keyboard focus
* Stable image aspect ratio
* Subtle hover elevation
* No layout shift

⸻

12. Product detail page

Create a complete product detail page.

Media gallery

* Main image
* Thumbnail list
* Previous and next controls
* Full-screen viewer
* Keyboard support
* Mobile swipe-friendly layout
* Optional video or 360-degree placeholder support in the data model

Product details

Display:

* Breadcrumbs
* Product name
* Seller
* Rating
* Review count
* Price
* Compare-at price
* Tax note
* Available variants
* Material
* Colour
* Finish
* Dimensions
* Weight
* Quantity
* Stock
* Processing time
* Shipping origin
* Estimated delivery
* Add to cart
* Buy now
* Wishlist

Customisation

If the product supports customisation, show:

* Request customisation
* Text engraving
* Name or message
* Colour request
* Size change request
* Notes
* Reference-image attachment
* Additional-price warning

Separate minor product customisation from a fully custom project.

A major change should direct the user to create a custom request with product context prefilled.

Seller card

Display:

* Seller logo
* Store name
* Verified badge
* Location
* Seller rating
* Completed orders
* Average dispatch performance
* View store
* Contact or message placeholder

Reviews

Show:

* Product rating breakdown
* Seller rating summary
* Review list
* Verified purchase label
* Review images
* Sort and filter
* Helpful button
* Report button

Related content

* Similar products
* More from this seller
* Recently viewed using client state
* Related categories

Add Product and Breadcrumb structured data.

⸻

13. Cart and checkout

Cart

Implement a persistent Zustand cart.

Cart item fields:

* Product ID
* Variant ID
* Quantity
* Selected options
* Customisation notes
* Price snapshot for display

Always revalidate price, availability, and seller status on the server before checkout.

Cart requirements:

* Increase quantity
* Decrease quantity
* Remove item
* Move to wishlist
* Seller grouping
* Subtotal
* Shipping estimate
* Tax estimate
* Total
* Empty state

Checkout

Steps:

1. Sign in if required
2. Delivery address
3. Review items
4. Shipping
5. Payment
6. Confirmation

Use one order per checkout with seller-grouped order items, or clearly document the selected marketplace order strategy.

For the MVP, preserve seller association at order-item level.

The mock payment flow must:

* Create a pending payment
* Simulate success or failure
* Update the order transactionally
* Prevent duplicate fulfilment
* Redirect to success or failure routes

⸻

14. Custom request flow

Create a polished multi-step form.

Use React Hook Form, Zod, and Zustand draft persistence.

Step 1: Idea

* Request title
* Detailed description
* Intended use
* Category

Step 2: References

* Upload images
* Add reference links
* Add sketch or document placeholder
* Explain allowed file types

Step 3: Specifications

* Approximate width
* Approximate height
* Approximate depth
* Measurement unit
* Quantity
* Preferred material
* Preferred colour
* Indoor or outdoor use
* Strength requirement
* Finish preference

Step 4: Budget and delivery

* Minimum budget
* Maximum budget
* Delivery postal code
* Required date
* Quote deadline

Step 5: Review

* Show all entered details
* Allow editing
* Submit for moderation

Save draft progress locally and, when signed in, optionally save it to the database.

After submission:

* Create a custom request
* Mark it pending moderation
* Show a confirmation page
* Add it to the customer’s dashboard

Admin approval moves it to open for quotations.

⸻

15. Quote comparison

The customer quote page must display quotations in a comparable format.

For each quotation, show:

* Seller
* Seller rating
* Verification
* Price
* Shipping fee
* Total
* Material
* Proposed production method
* Production duration
* Estimated delivery
* Proposal
* Revision allowance
* Valid-until date

Allow:

* View seller
* Ask a question
* Shortlist
* Select quotation
* Reject quotation

Selecting a quote must:

1. Confirm the selection.
2. Reject or close other quotations appropriately.
3. Create a payment requirement.
4. Prevent a second selection.
5. Create a custom project after successful payment.
6. Show it in the unified orders area.

Use a transaction to prevent race conditions.

⸻

16. Unified customer order dashboard

The customer should see regular and custom orders together.

Provide tabs:

* All
* Regular products
* Custom projects
* Active
* Delivered
* Cancelled

Each order card should show:

* Order number
* Type
* Seller
* Date
* Total
* Current status
* Product image
* Next expected action
* Track order
* View details

Order detail timeline:

* Order placed
* Payment confirmed
* Seller confirmed
* Design approval, when relevant
* In production
* Ready to ship
* Shipped
* Out for delivery
* Delivered

Custom project details should also show:

* Selected quotation
* Approved specifications
* Milestones
* Design approval state
* Messages or project notes placeholder

⸻

17. Seller experience

Use a dedicated seller layout.

Desktop:

* Dark fern sidebar
* White or warm-neutral content area
* Compact top bar
* Responsive cards and tables

Mobile:

* Drawer navigation
* Compact metric cards
* Card-based data instead of wide tables where necessary

Seller navigation:

Overview
Products
Orders
Custom Requests
Quotations
Reviews
Payouts
Store Settings

Seller overview

Show:

* Total revenue
* Revenue this month
* New orders
* In production
* Awaiting action
* Completed orders
* Pending payout
* Average seller rating

Include:

* Revenue chart
* Order-status chart
* Recent orders
* Recent custom requests
* Top products
* Recent reviews

Use real seeded database data, not hardcoded dashboard numbers.

Seller products

Table or responsive card list:

* Image
* Product name
* Category
* Price
* Stock
* Approval status
* Published state
* Views
* Orders
* Updated date
* Actions

Actions:

* View
* Edit
* Duplicate
* Submit for review
* Pause
* Archive

Product creation

Use a multi-section form:

1. Basic details
2. Category
3. Images
4. Pricing
5. Inventory
6. Variants
7. Materials and finish
8. Dimensions and shipping
9. Customisation
10. SEO
11. Safety and declaration
12. Preview and submit

Validate category-specific required fields.

After submission, product status becomes PENDING_REVIEW.

The seller cannot manually publish an unapproved product.

Seller orders

Tabs:

* New
* Confirmed
* In production
* Ready to ship
* Shipped
* Completed
* Cancelled

Allow appropriate status transitions only.

Do not allow jumping directly from paid to delivered.

Record every transition.

Seller custom request board

Show only requests that:

* Are approved
* Are open for quotations
* Match seller capabilities reasonably
* Have not expired
* Are not created by the same user in an invalid scenario

Request cards must show:

* Title
* Category
* Budget range
* Quantity
* Delivery city
* Required date
* Quote deadline
* Attachment count
* Number of quotations, without exposing confidential amounts
* Match indicators

Seller can:

* Open request
* Submit quote
* Save request
* Ignore request
* Withdraw own quote before acceptance

Seller quotations

Show:

* Submitted
* Revised
* Accepted
* Rejected
* Expired
* Withdrawn

Seller payouts

For the MVP:

* Revenue summary
* Platform commission
* Net seller amount
* Pending
* Eligible
* Paid
* Payout history

Use mock payout records.

⸻

18. Admin experience

Create a separate protected admin layout.

Use:

* Dark fern sidebar
* Clear data tables
* Status badges
* Confirmation dialogs
* Filters
* Search
* Audit history

Admin navigation:

Overview
Product Approvals
Sellers
Orders
Custom Requests
Reviews
Categories
Content
Users
Reports
Settings
Audit Log

Admin overview

Show:

* Gross merchandise value
* Platform revenue
* Active sellers
* Pending seller applications
* Pending product approvals
* Open custom requests
* Active orders
* Disputes
* Review moderation queue

Product approval queue

Tabs:

* Pending
* Changes requested
* Approved
* Rejected

Approval-detail page must show in one review surface:

* Product images
* Product title
* Description
* Seller
* Seller history
* Category
* Variants
* Material
* Dimensions
* Pricing
* Stock
* Safety notes
* Intellectual-property declaration
* Customisation options
* SEO information
* Previous admin notes

Actions:

* Approve and publish
* Approve without immediate publication
* Request changes
* Reject
* Add internal note

Require a reason for rejection or requested changes.

Record every action in an audit log.

Seller verification

Review:

* Seller information
* Store information
* Location
* Capabilities
* Submitted documents as safe placeholders
* Previous moderation history

Actions:

* Approve
* Request changes
* Reject
* Suspend

Custom request moderation

Check for:

* Clear description
* Prohibited content
* Intellectual-property concerns
* Unsafe items
* Missing specifications
* Fraud or spam

Actions:

* Approve and open for quotations
* Request changes
* Reject

Category management

Support:

* Parent and child categories
* Slug
* Description
* Image
* Icon
* Display order
* Active state
* Product count
* Category-specific fields
* SEO information

Prevent unsafe deletion of a category containing products. Provide reassignment or archival.

Review moderation

Support:

* Search
* Report reason
* Product
* Seller
* Customer
* Order verification
* Visibility
* Moderator decision
* Audit history

Content authoring

Allow administrators to manage:

* Homepage hero
* Promotional banners
* Featured categories
* Featured products
* Featured sellers
* How-it-works content
* FAQs
* Static pages
* Footer links
* SEO metadata

Render homepage content from the database with sensible seeded defaults.

⸻

19. Roles and permissions

Create central permission helpers.

Examples:

canViewAdminDashboard(user)
canManageProducts(user)
canApproveProduct(user)
canManageOwnProduct(user, product)
canUpdateOrderStatus(user, order)
canQuoteCustomRequest(user, request)
canModerateReview(user)
canViewQuotation(user, quotation)

Never scatter arbitrary string role checks throughout components.

Server-side rules:

* Customer can access only their orders, addresses, requests, and quotations.
* Seller can manage only their seller profile, products, quotations, payouts, and relevant order items.
* Seller cannot approve their own products.
* Seller cannot access another seller’s private quotation.
* Admin can access moderation and platform management.
* Suspended sellers cannot publish, quote, or update fulfilment.
* Public users can view only published products from approved active sellers.

Include tests for permission boundaries.

⸻

20. Ratings and fairness

Implement separate product and seller ratings.

Only verified delivered orders can create reviews.

Prevent:

* Duplicate reviews for the same eligible order item
* Seller review deletion
* Reviewing one’s own product
* Client-side manipulation of order eligibility
* Review submission before delivery

Display:

* Average
* Rating distribution
* Review count
* Verified purchase
* Date
* Review media
* Helpful votes

Keep review moderation transparent through an audit trail.

Do not artificially rank sellers who pay unless the placement is clearly labelled as sponsored. The MVP does not need sponsored listings.

⸻

21. Content safety and marketplace restrictions

Add a basic prohibited-product policy.

Prevent or flag listings and requests involving:

* Weapons
* Firearm components
* Illegal items
* Dangerous devices
* Counterfeit branded products
* Explicit copyrighted-character copying without declaration
* Medical devices making unverified claims
* Products likely to be unsafe without proper review

This does not need advanced AI moderation in the MVP.

Implement:

* Required declaration checkbox
* Admin review fields
* Moderation reason
* Report listing action
* Prohibited-content policy page

Do not implement automated legal decisions.

⸻

22. Accessibility

Target WCAG 2.2 AA.

Required:

* Semantic HTML
* Correct heading hierarchy
* Keyboard-accessible navigation
* Visible focus states
* Skip-to-content link
* Proper input labels
* Descriptive validation errors
* Accessible dialogs
* Accessible drawers
* Accessible dropdowns
* Accessible autocomplete
* aria-live for async search result counts and cart updates
* Alt text for meaningful images
* Empty alt text for decorative images
* No colour-only status communication
* Sufficient colour contrast
* Minimum practical touch target size
* Reduced-motion support
* Focus restoration after dialogs
* Error summary for long forms

Do not add ARIA where native HTML already provides the correct semantics.

⸻

23. Responsive behaviour

Support:

* 360-pixel mobile width
* Modern mobile devices
* Tablets
* Small laptops
* Large desktop screens

Required responsive patterns:

* Mobile navigation drawer
* Search overlay on mobile
* Filter drawer on mobile
* Responsive product grid
* Sticky mobile product purchase bar
* Seller and admin sidebar collapses into a drawer
* Tables become card lists or horizontally controlled views
* Forms use one column on mobile
* Dashboard cards reflow cleanly
* No horizontal page overflow

⸻

24. Performance

Optimise for strong Core Web Vitals.

Use:

* Server Components by default
* Minimal client component boundaries
* next/image
* Correct image sizes
* Lazy loading
* Route-level loading UI
* Suspense where useful
* Dynamic imports for heavy client-only features
* Database indexes
* Pagination
* Debounced search
* Request deduplication
* Cached public catalogue queries where safe
* Revalidation after mutations
* Avoid large client-side datasets
* Avoid unnecessary global state
* Avoid large animation libraries unless genuinely needed

Add database indexes for:

* Product slug
* Product status
* Product seller ID
* Product category ID
* Product created date
* Product price
* Seller slug
* Seller verification status
* Order customer ID
* Order status
* Order created date
* Custom request status
* Quote seller ID
* Searchable product fields where supported

Aim for:

* Lighthouse performance above 90 on key public pages in a production build
* Accessibility above 95
* No obvious layout shift
* No large blocking JavaScript bundle caused by avoidable client components

Document any limitation preventing a score.

⸻

25. Security

Implement practical marketplace security.

Required:

* Server-side authorisation
* Zod validation
* Parameter validation
* Ownership checks
* Safe error responses
* Secure session cookies through authentication configuration
* Environment-variable validation
* Rate-limiting abstraction
* Safe file validation
* Payment signature verification
* Idempotent payment and webhook handling
* No secrets in browser code
* No secrets in the repository
* No raw database errors shown to users
* Audit logging
* Transactional order and quote selection
* Protection against mass assignment
* Safe redirects
* Prevent open redirects
* Validate uploaded content metadata
* Sanitize or safely render seller-entered rich content

Do not render arbitrary seller HTML.

Use structured text or a safely restricted content format.

⸻

26. SEO

Implement:

* Page metadata
* Dynamic product metadata
* Dynamic category metadata
* Canonical URLs
* Open Graph metadata
* Twitter card metadata
* Sitemap
* Robots file
* Product structured data
* Breadcrumb structured data
* Organisation structured data
* Descriptive slugs
* Server-rendered public content

Do not index:

* Account pages
* Seller dashboards
* Admin pages
* Cart
* Checkout
* Private custom requests
* Private quotation pages

⸻

27. Seed data

Create polished seed data that makes the application visually useful.

Seed at minimum:

* 1 admin
* 5 approved sellers
* 1 pending seller
* 20 to 30 products
* 10 categories
* Product variants
* Product images using reliable local placeholder assets
* 8 regular orders in different statuses
* 5 customer custom requests
* 8 quotations
* 3 custom projects
* 10 product reviews
* 8 seller reviews
* Homepage content
* FAQs
* Audit events
* Payout records

Suggested products:

* Minimal phone stand
* Adjustable phone stand
* Foldable phone stand
* Cable organiser
* Geometric planter
* Succulent planter
* Moon lamp holder
* Articulated dragon
* Desk pen organiser
* Headphone stand
* Controller stand
* Personalised name plate
* Wall-mounted key holder
* Miniature architectural model
* Custom cookie cutter
* Replacement appliance knob
* Educational molecule model
* Jewellery organiser
* Book stand
* Laptop riser

Use realistic Indian pricing.

Do not use lorem ipsum.

Add documented development users such as:

admin@formivo.local
seller@formivo.local
customer@formivo.local

Create safe local-development passwords and document them only as demo credentials in the README.

The seed script must be idempotent.

⸻

28. Empty, loading, and error states

Create thoughtful states for:

* No search results
* Empty cart
* Empty wishlist
* No orders
* No custom requests
* No quotes received
* No seller products
* No seller orders
* No eligible custom requests
* No pending admin approvals
* Authentication required
* Permission denied
* Suspended seller
* Expired quote
* Payment failed
* Upload failed
* Network error
* Missing product
* Archived product

Do not leave empty tables without explanation or action.

⸻

29. Notifications and feedback

Implement:

* Toast notifications
* Inline form feedback
* Confirmation dialogs
* Success pages
* Status badges
* Dashboard alerts

Do not show a success message until the server mutation actually succeeds.

Important destructive actions require confirmation.

⸻

30. Testing requirements

Add meaningful tests rather than snapshot-only tests.

Unit and component tests

Test:

* Currency formatting
* Price calculations
* Search parameter parsing
* Permission helpers
* Status transition validation
* Rating calculations
* Zod schemas
* Cart store
* Custom request draft store
* Search autocomplete keyboard interaction
* Product variant selection
* Quote comparison
* Admin approval form

Integration tests

Test:

* Product submission creates pending-review status
* Admin approval publishes product
* Unapproved product stays unavailable publicly
* Customer can create a custom request
* Admin can approve the request
* Seller can submit a quote
* Seller cannot see another private quote
* Customer can select only one quote
* Payment success creates the custom project
* Delivered order enables review
* Undelivered order rejects review
* Suspended seller cannot submit products or quotes

Playwright flows

At minimum:

1. Customer browses and purchases a product using mock payment.
2. Customer posts a custom request.
3. Seller submits a quotation.
4. Customer accepts the quote.
5. Admin approves a submitted product.
6. Mobile user searches for a phone stand.
7. Keyboard-only user completes core navigation.

Run accessibility checks on important pages where practical.

⸻

31. Developer experience

Provide scripts:

{
  "dev": "...",
  "build": "...",
  "start": "...",
  "lint": "...",
  "typecheck": "...",
  "test": "...",
  "test:watch": "...",
  "test:e2e": "...",
  "db:generate": "...",
  "db:migrate": "...",
  "db:seed": "...",
  "db:reset": "..."
}

Provide:

* .env.example
* README.md
* Setup instructions
* Docker instructions
* Database migration instructions
* Seed instructions
* Google OAuth setup instructions
* Razorpay sandbox setup instructions
* Mock-payment instructions
* Production deployment notes
* Demo account details
* Architecture overview
* Role and permission overview
* Known limitations
* Future roadmap

Validate environment variables using Zod.

⸻

32. Local setup target

The expected local flow should be approximately:

pnpm install
docker compose up -d
cp .env.example .env
pnpm db:migrate
pnpm db:seed
pnpm dev

After that, the application should open and be usable with demo credentials.

External OAuth and Razorpay credentials must be optional for the local demo.

When Google OAuth credentials are absent:

* Email and password demo authentication must still work.
* The Google button may be disabled with a clear development message or hidden based on configuration.
* The application must not crash.

⸻

33. Implementation process

Follow this order.

Stage 1: Inspect and plan

1. Inspect the existing repository.
2. If it is empty, scaffold the application.
3. Read the attached design reference.
4. Create docs/IMPLEMENTATION_PLAN.md.
5. Record architecture decisions in docs/ARCHITECTURE.md.
6. Create a checklist mapping requirements to routes and features.

Do not stop after planning.

Stage 2: Foundation

Implement:

* Project setup
* Design tokens
* Global styles
* Base layouts
* Database
* Authentication
* Roles
* Permissions
* Seed data
* Shared UI components

Stage 3: Customer marketplace

Implement:

* Homepage
* Search
* Categories
* Product cards
* Product details
* Wishlist
* Cart
* Checkout
* Account orders

Stage 4: Custom request marketplace

Implement:

* Request form
* Request moderation state
* Seller request board
* Quotation submission
* Quote comparison
* Quote selection
* Custom project creation
* Unified order dashboard

Stage 5: Seller dashboard

Implement:

* Overview
* Products
* Product form
* Orders
* Custom requests
* Quotations
* Reviews
* Payouts
* Store settings

Stage 6: Admin dashboard

Implement:

* Overview
* Product approval
* Seller verification
* Categories
* Custom request moderation
* Reviews
* Content authoring
* Users
* Settings
* Audit logs

Stage 7: Quality

Run:

pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e

Fix all implementation-caused failures.

Do not finish with known TypeScript or build errors.

Stage 8: Visual review

Run the application.

Compare key pages with the attached green reference:

* Homepage
* Product results
* Product page
* Seller dashboard
* Admin approval page

Check:

* Colour accuracy
* Spacing
* Typography
* Visual hierarchy
* Responsive behaviour
* Image proportions
* Button consistency
* Card density

Improve obvious visual mismatches while preserving usability.

⸻

34. Required reusable components

Create reusable components where appropriate:

* SiteHeader
* MobileNavigation
* SiteFooter
* SearchAutocomplete
* CategoryMenu
* ProductCard
* ProductGrid
* ProductGallery
* PriceDisplay
* RatingSummary
* ReviewCard
* SellerCard
* StatusBadge
* OrderTimeline
* EmptyState
* ErrorState
* LoadingSkeleton
* FilterSidebar
* MobileFilterDrawer
* Pagination
* ImageUploader
* AddressForm
* CustomRequestStepper
* QuoteCard
* QuoteComparison
* MetricCard
* DashboardSidebar
* DataTable
* ConfirmationDialog
* ModerationPanel
* AuditLogTimeline

Do not force unrelated screens into one excessively configurable component.

⸻

35. Acceptance criteria

The task is complete only when all of the following are true:

Application

* The project installs successfully.
* The development server starts.
* The production build succeeds.
* Database migration succeeds.
* Seed script succeeds.
* Demo authentication works.
* No page is only an unexplained placeholder.
* Major flows persist data.

Customer

* Customer can browse approved products.
* Search suggestions work.
* Enter opens a dedicated search route.
* Filters are represented in the URL.
* Customer can open a product.
* Customer can add a product to cart.
* Customer can complete mock checkout.
* Customer can view the created order.
* Customer can post a custom request.
* Customer can compare and accept quotations.
* Customer can see custom projects in orders.
* Customer can review a delivered purchase.

Seller

* Seller can view database-backed dashboard metrics.
* Seller can create a product.
* Seller can submit it for review.
* Seller cannot publish it directly.
* Seller can manage relevant orders.
* Seller can browse eligible custom requests.
* Seller can submit and manage quotations.

Admin

* Admin can approve or reject a seller.
* Admin can approve, reject, or request changes to a product.
* Approved product becomes public.
* Admin can moderate custom requests.
* Admin can manage categories.
* Admin can manage homepage content.
* Admin actions generate audit entries.

Quality

* Role boundaries are enforced server-side.
* Important flows have tests.
* The application is responsive.
* Core pages are keyboard accessible.
* No critical console errors occur.
* There are no known implementation-caused build failures.
* README contains complete setup instructions.

⸻

36. Final response expected from Codex

After implementation, provide:

1. A short architecture summary.
2. A list of major implemented features.
3. A list of important files created or changed.
4. Exact local setup commands.
5. Demo account credentials.
6. Environment variables that remain optional.
7. Test and build results.
8. Known limitations.
9. Suggested next production steps.

Do not merely explain what code should be written.

Write the files, install the dependencies, create the database schema, run the migrations, seed the data, run the application checks, and fix errors found during validation.

When a minor requirement is ambiguous, make a sensible implementation decision and record it in docs/ARCHITECTURE.md.

Continue working through the implementation stages until the complete runnable MVP and acceptance criteria are satisfied.
