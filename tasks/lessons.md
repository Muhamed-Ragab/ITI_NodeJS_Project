# Project Lessons

## Architecture & Workflow

- Keep changes modular: add feature files as `routes -> controller -> service -> repository -> model -> validation`.
- Prefer smallest safe change with clear contracts instead of broad refactors.
- Always ship code + tests + docs together for behavior changes.
- For non-trivial work, keep a checklist in `tasks/todo.md` and update progress as you execute.

## Payments (Stripe SDK flow)

- Payment success source-of-truth is **Stripe webhook**, not client-side callback.
- Keep webhook route on `express.raw({ type: "application/json" })`; all other routes use JSON parser.
- Validate before creating payment intent:
  - order exists
  - requester owns order
  - order status is `pending`
- Store payment metadata (`stripe_payment_intent_id`, status, method) under `order.payment_info`.
- Keep webhook handling idempotent (if order already `paid`, return success without re-updating).

## Coupons & Order Pricing

- Persist explicit pricing snapshot on order:
  - `subtotal_amount`
  - `discount_amount`
  - `total_amount`
  - `coupon_info`
- Coupon validation should be explicit and deterministic:
  - active flag
  - date window
  - min order amount
  - total usage limit
  - per-user usage limit
- Use stable error codes for coupon failures (`COUPON.NOT_FOUND`, `COUPON.EXPIRED`, etc.) for frontend consistency.

## Testing & Quality

- Route-level E2E with in-memory express server + mocked services gives fast and reliable API contract coverage.
- Always include happy + non-happy status coverage (`400/401/403/404`) and role matrix checks.
- Run quality gates after feature completion:
  - `npm run format:check`
  - `npm run lint`
  - `npm run build`
  - `npm test -- --run`
- If one test fails, fix root cause first (route method, validation contract, auth chain), then rerun all gates.

