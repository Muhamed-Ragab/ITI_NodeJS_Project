# Demo Walkthrough (Evaluation Script)

Use this script for project presentation and live demo.

## 1) Environment and startup

1. Show `.env` keys and explain sensitive secrets handling.
2. Start server:

```bash
npm run dev
```

3. Open Postman collection: `MEAN_E-Commerce_API.postman_collection.json`.

## 2) Customer journey

1. Register a new user (`POST /api/auth/register`).
2. Explain email verification link behavior, then verify using:
   - `GET /api/auth/verify-email?token=<token>`
3. Login (`POST /api/auth/login`) and capture JWT.
4. Browse categories/products:
   - `GET /api/categories`
   - `GET /api/products?search=&category_id=&min_price=&max_price=`
5. Add product to wishlist/cart:
   - `POST /api/users/wishlist`
   - `PUT /api/users/cart`
6. Create order from cart:
   - `POST /api/orders`
7. Create Stripe payment intent:
   - `POST /api/payments/create-payment-intent`

## 3) Seller journey

1. Login with seller account.
2. Create a product (`POST /api/products`).
3. Update stock/price (`PUT /api/products/:id`).
4. Upload product image payload flow:
   - `POST /api/products/images/upload-payload`
   - `POST /api/products/:id/images/upload`

## 4) Admin journey

1. Login with admin account.
2. Manage categories/products:
   - `POST /api/categories`
   - `PUT /api/products/admin/:id`
3. Manage users:
   - `GET /api/users/`
   - `PUT /api/users/admin/:id/role`
4. Manage orders:
   - `GET /api/orders`
   - `PUT /api/orders/:id/status`

## 5) Code walkthrough path

Follow this order to explain architecture quickly:

1. `src/app.js` (routing + middleware)
2. `src/middlewares/*` (auth/role/validation/error)
3. One module end-to-end (recommended: `auth`):
   - routes → controller → service → repository → model → validation
4. `orders` + `payments` integration path
5. `test/modules/*` to show testing approach

## 6) Quality proof

Run before/after demo:

```bash
npm run format
npm run lint
npm run build
npm test -- --run
```
