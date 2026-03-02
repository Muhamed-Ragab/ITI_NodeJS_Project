# Presentation Outline

Use this outline to build your final slide deck.

## Slide 1 — Project Overview
- Problem statement
- Target users (customer, seller, admin)
- High-level solution

## Slide 1 Notes (talk track)
- We built a modular MEAN-style e-commerce backend focused on real production concerns: auth, payments, admin control, seller workflow, and quality gates.
- The system supports role-based journeys for customer, seller, and admin with cleanly separated routes/services/repositories.

## Slide 2 — Tech Stack
- Node.js + Express
- MongoDB + Mongoose
- Zod validation
- JWT + Google OAuth
- Stripe payments

## Slide 2 Notes
- Runtime & API: Node.js + Express.
- Data: MongoDB with Mongoose schema modeling.
- Validation: Zod at request boundaries.
- Security: JWT auth, email verification, OTP login, Google auth.
- Payment integrations: Stripe + additional checkout methods.

## Slide 3 — Architecture
- Controller → Service → Repository pattern
- Module-based structure
- Shared middleware and utilities

## Slide 3 Notes
- Each module follows: routes → controller → service → repository → model → validation.
- This keeps API concerns, business logic, and data access isolated and testable.
- Shared middleware handles auth, role checks, validation, and centralized error serialization.

## Slide 4 — Authentication & Security
- Register/login/logout flow
- Email verification flow
- Google OAuth flow
- RBAC and protected routes

## Slide 4 Notes
- Registration requires email verification before login.
- Email OTP flow supports passwordless login.
- Token revocation uses token versioning on logout.
- User state protections include restriction and soft delete enforcement.

## Slide 5 — Core Features
- Users: profile, wishlist, cart
- Products/categories: CRUD + filtering
- Orders: create/list/status updates
- Payments: Stripe intents + webhook

## Slide 5 Notes
- Checkout supports guest and authenticated users.
- Price snapshot persists subtotal/discount/shipping/tax/total.
- Promotions/coupons integrated in checkout validation.
- Reviews module updates product aggregates (`average_rating`, `ratings_count`).

## Slide 6 — Admin & Seller Capabilities
- Admin: users/orders/products/categories management
- Seller: product/inventory management

## Slide 6 Notes
- Admin: user role/restriction/soft-delete, promo/content management, seller approvals.
- Seller: onboarding workflow, seller-scoped order updates, payout requests.

## Slide 7 — Testing & Quality Gates
- Unit/integration tests with Vitest
- Required quality commands:
  - `npm run format`
  - `npm run lint`
  - `npm run build`
  - `npm test -- --run`

## Slide 7 Notes
- Focused tests cover auth, users, orders, payments, coupons, reviews, and middlewares.
- CI-friendly local gates guarantee consistency before PRs.

## Slide 8 — Demo Plan
- Customer journey
- Seller journey
- Admin journey
- Codebase walkthrough path

## Slide 8 Notes
- Demo order:
  1) customer registration/login + shopping + checkout,
  2) seller actions + order processing,
  3) admin moderation/operations,
  4) architecture + code walkthrough.

## Slide 9 — Bonus Features Delivered (Phase 4)
- Marketing preferences endpoints (push/email/promotional toggles)
- Newsletter/promo broadcast simulation endpoint (admin)
- Loyalty points summary + admin grant endpoint
- Referral code apply + reward flow
- Preferred language endpoint (`en`, `ar`, `fr`)

## Slide 10 — Final Demo Readiness Checklist
- Presentation structure complete (problem, architecture, flows, security, testing)
- Demo walkthrough document prepared
- Codebase walkthrough path prepared by module
- Quality gate evidence available
