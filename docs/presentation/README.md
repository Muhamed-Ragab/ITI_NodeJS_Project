# Presentation Outline

Use this outline to build your final slide deck.

## Slide 1 — Project Overview
- Problem statement
- Target users (customer, seller, admin)
- High-level solution

## Slide 2 — Tech Stack
- Node.js + Express
- MongoDB + Mongoose
- Zod validation
- JWT + Google OAuth
- Stripe payments

## Slide 3 — Architecture
- Controller → Service → Repository pattern
- Module-based structure
- Shared middleware and utilities

## Slide 4 — Authentication & Security
- Register/login/logout flow
- Email verification flow
- Google OAuth flow
- RBAC and protected routes

## Slide 5 — Core Features
- Users: profile, wishlist, cart
- Products/categories: CRUD + filtering
- Orders: create/list/status updates
- Payments: Stripe intents + webhook

## Slide 6 — Admin & Seller Capabilities
- Admin: users/orders/products/categories management
- Seller: product/inventory management

## Slide 7 — Testing & Quality Gates
- Unit/integration tests with Vitest
- Required quality commands:
  - `npm run format`
  - `npm run lint`
  - `npm run build`
  - `npm test -- --run`

## Slide 8 — Demo Plan
- Customer journey
- Seller journey
- Admin journey
- Codebase walkthrough path

## Slide 9 — Current Gaps / Next Milestones
- Phone auth + OTP
- Reviews & ratings
- Coupons/promotions
- Guest checkout + multi-payment methods
- Notifications/marketing/i18n (bonus)
