# API Endpoints Documentation

This document provides a comprehensive overview of all API endpoints in the MEAN Stack E-Commerce Backend project, including detailed workflows for key features.

## Base URL

```
http://localhost:3000/api
```

## Authentication

Most endpoints require authentication via JWT token. Include the token in the Authorization header:

```http
Authorization: Bearer <jwt_token>
```

---

## 1. Auth Module (`/auth`)

Handles user registration, login, and email verification.

| Method | Endpoint | Description | Auth | Request Body |
|--------|----------|-------------|------|--------------|
| POST | `/auth/register` | Register new user with email/password | Public | `name, email, password, phone` |
| POST | `/auth/login` | Login with email/password | Public | `email, password` |
| POST | `/auth/email/request-otp` | Request OTP for email login | Public | `email` |
| POST | `/auth/email/login` | Login with email OTP | Public | `email, otp` |
| POST | `/auth/logout` | Logout current user | Required | - |
| GET | `/auth/verify-email` | Verify email with token | Public | `token` (query) |
| GET | `/auth/google` | Initiate Google OAuth | Public | - |
| GET | `/auth/google/callback` | Google OAuth callback | Public | - |

### What's Useful:
- **register**: Create new customer/seller accounts
- **login**: Authenticate and get JWT token
- **email/request-otp**: Passwordless login via OTP
- **verify-email**: Verify account via email link
- **google**: Social login with Google

---

## 2. Users Module (`/users`)

Manages user profiles, wishlists, addresses, and engagement features.

### Core Profile Endpoints

| Method | Endpoint | Description | Auth | Request Body |
|--------|----------|-------------|------|--------------|
| GET | `/users/profile` | Get current user profile | Required | - |
| PUT | `/users/profile` | Update user profile | Required | `name, phone` |

### Wishlist Endpoints

| Method | Endpoint | Description | Auth | Request Body |
|--------|----------|-------------|------|--------------|
| GET | `/users/wishlist` | Get user's wishlist | Required | - |
| POST | `/users/wishlist` | Add item to wishlist | Required | `productId` |
| DELETE | `/users/wishlist/:productId` | Remove item from wishlist | Required | - |

### Cart Endpoints

| Method | Endpoint | Description | Auth | Request Body |
|--------|----------|-------------|------|--------------|
| GET | `/users/cart` | Get user's cart | Required | - |
| PUT | `/users/cart` | Add/update item in cart | Required | `productId, quantity` |
| DELETE | `/users/cart/:productId` | Remove item from cart | Required | - |

### Address Endpoints

| Method | Endpoint | Description | Auth | Request Body |
|--------|----------|-------------|------|--------------|
| GET | `/users/addresses` | Get all user addresses | Required | - |
| POST | `/users/address` | Add new address | Required | `street, city, country, zip` |
| PUT | `/users/address/:addressId` | Update address | Required | `street, city, country, zip` |
| DELETE | `/users/address/:addressId` | Delete address | Required | - |

### Wallet Endpoints

| Method | Endpoint | Description | Auth | Request Body |
|--------|----------|-------------|------|--------------|
| PUT | `/users/wallet` | Update wallet balance (admin) | Admin | `userId, amount` |

### Saved Payment Methods

| Method | Endpoint | Description | Auth | Request Body |
|--------|----------|-------------|------|--------------|
| GET | `/users/payment-methods` | List saved payment methods | Required | - |
| POST | `/users/payment-methods` | Add payment method | Required | `provider, provider_token, brand, last4, expiry_month, expiry_year` |
| DELETE | `/users/payment-methods/:methodId` | Remove payment method | Required | - |
| PATCH | `/users/payment-methods/:methodId/default` | Set default payment method | Required | - |

### Seller Onboarding

| Method | Endpoint | Description | Auth | Request Body |
|--------|----------|-------------|------|--------------|
| POST | `/users/seller/onboarding` | Request seller status | Required | `store_name, bio, payout_method` |
| GET | `/users/admin/seller-requests` | List pending requests (admin) | Admin | - |
| PATCH | `/users/admin/seller-requests/:id` | Approve/reject seller (admin) | Admin | `status, note` |

### Seller Payouts

| Method | Endpoint | Description | Auth | Request Body |
|--------|----------|-------------|------|--------------|
| POST | `/users/seller/payouts` | Request payout | Seller | `amount, note` |
| PATCH | `/users/admin/seller-payouts/:id/:payoutId` | Review payout (admin) | Admin | `status, note` |

---

## 3. Marketing & Engagement Features (Phase 4)

### Marketing Preferences

Users can control their marketing communication preferences.

| Method | Endpoint | Description | Auth | Request Body |
|--------|----------|-------------|------|--------------|
| PATCH | `/users/preferences/marketing` | Update marketing preferences | Required | `push_notifications, email_newsletter, promotional_notifications` |

**Workflow:**
1. User calls `PATCH /api/users/preferences/marketing` with preferences
2. System stores preferences in `user.marketing_preferences`
3. Admin can target users based on these preferences for broadcasts

**Request Example:**
```json
{
  "push_notifications": true,
  "email_newsletter": false,
  "promotional_notifications": true
}
```

### Preferred Language

| Method | Endpoint | Description | Auth | Request Body |
|--------|----------|-------------|------|--------------|
| PATCH | `/users/preferences/language` | Update preferred language | Required | `language` |

**Supported Languages:** `en`, `ar`, `fr`

**Workflow:**
1. User selects preferred language
2. System stores in `user.preferred_language`
3. Frontend uses this to display localized content

### Loyalty Points

| Method | Endpoint | Description | Auth | Request Body |
|--------|----------|-------------|------|--------------|
| GET | `/users/loyalty` | Get loyalty summary | Required | - |
| PATCH | `/users/admin/:id/loyalty` | Grant loyalty points (admin) | Admin | `points` |

**Workflow:**
1. User earns loyalty points through:
   - Making purchases
   - Applying referral codes
   - Admin grants
2. View balance via `GET /api/users/loyalty`

**Response Example:**
```json
{
  "loyalty_points": 150,
  "referrals_count": 3
}
```

### Referral System

| Method | Endpoint | Description | Auth | Request Body |
|--------|----------|-------------|------|--------------|
| POST | `/users/referrals/apply` | Apply referral code | Required | `referralCode` |
| GET | `/users/referrals` | Get referral summary | Required | - |

**Workflow:**
1. User registers → system auto-generates `REF-XXXXXX` referral code
2. New user applies referral during registration or later via API
3. Both users receive loyalty points (e.g., 25 points each)
4. Referrer's `referrals_count` increments

**Apply Referral Request:**
```json
{
  "referralCode": "REF-ABC123"
}
```

**Validation Rules:**
- Cannot apply own referral code
- Can only apply once per account
- Code must exist

### Admin Marketing Broadcast

| Method | Endpoint | Description | Auth | Request Body |
|--------|----------|-------------|------|--------------|
| POST | `/users/admin/marketing/broadcast` | Broadcast message | Admin | `channel, title, body` |

**Workflow:**
1. Admin sends broadcast with channel preference
2. System filters users by `marketing_preferences[channel]`
3. Returns count of targeted recipients

**Request Example:**
```json
{
  "channel": "email_newsletter",
  "title": "Summer Sale!",
  "body": "Get 50% off on all electronics"
}
```

---

## 4. Categories Module (`/categories`)

Product categorization management.

| Method | Endpoint | Description | Auth | Request Body |
|--------|----------|-------------|------|--------------|
| GET | `/categories` | Get all categories (tree) | Public | - |
| GET | `/categories/:id` | Get category by ID | Public | - |
| POST | `/categories` | Create new category | Admin | `name, description, parentId` |
| PUT | `/categories/:id` | Update category | Admin | `name, description` |
| DELETE | `/categories/:id` | Delete category | Admin | - |
| GET | `/categories/:id/products` | Get products in category | Public | - |

---

## 5. Products Module (`/products`)

Product inventory and details management.

| Method | Endpoint | Description | Auth | Request Body |
|--------|----------|-------------|------|--------------|
| GET | `/products` | List all products (paginated) | Public | `page, limit, category, search, minPrice, maxPrice, rating, sort` |
| GET | `/products/:id` | Get product details | Public | - |
| POST | `/products` | Create product (seller) | Seller | `name, description, price, category, stock, images` |
| PUT | `/products/:id` | Update product | Seller/Admin | Partial product fields |
| DELETE | `/products/:id` | Delete product | Seller/Admin | - |
| GET | `/products/seller/my-products` | Get seller's products | Seller | - |
| PUT | `/products/:id/stock` | Update stock quantity | Seller | `stock` |
| GET | `/products/:id/reviews` | Get product reviews | Public | - |
| POST | `/products/:id/reviews` | Add product review | Required | `rating, comment` |

---

## 6. Coupons Module (`/coupons`)

Discount code management for promotions.

| Method | Endpoint | Description | Auth | Request Body |
|--------|----------|-------------|------|--------------|
| GET | `/coupons` | Get all coupons (admin) | Admin | - |
| GET | `/coupons/:id` | Get coupon by ID (admin) | Admin | - |
| POST | `/coupons` | Create coupon | Admin | `code, type, value, minOrder, expiresAt, usageLimit` |
| PUT | `/coupons/:id` | Update coupon | Admin | Partial coupon fields |
| DELETE | `/coupons/:id` | Delete coupon (soft) | Admin | - |
| POST | `/coupons/validate` | Validate coupon for order | Required | `code, orderTotal` |

### Coupon Workflow

1. **Admin creates coupon:**
```json
{
  "code": "SUMMER25",
  "type": "percentage",
  "value": 25,
  "minOrderAmount": 100,
  "expiresAt": "2026-12-31T23:59:59Z",
  "usageLimit": 1000
}
```

2. **User validates before checkout:**
```
POST /api/coupons/validate
{
  "code": "SUMMER25",
  "orderTotal": 150
}
```

3. **System returns discount:**
```json
{
  "valid": true,
  "discountAmount": 37.5,
  "couponInfo": {
    "code": "SUMMER25",
    "type": "percentage",
    "value": 25
  }
}
```

4. **Coupon applies to order total during checkout**

**Validation Error Codes:**
- `COUPON.NOT_FOUND` - Invalid code
- `COUPON.INACTIVE` - Coupon disabled
- `COUPON.EXPIRED` - Past expiration date
- `COUPON.MIN_ORDER_NOT_MET` - Order below minimum
- `COUPON.USAGE_LIMIT_REACHED` - Max uses reached
- `COUPON.USER_LIMIT_REACHED` - User already used

---

## 7. Content Module (`/content`)

CMS content management for banners, FAQs, and pages.

### Banners

| Method | Endpoint | Description | Auth | Request Body |
|--------|----------|-------------|------|--------------|
| GET | `/content` | Get all content sections | Public | - |
| GET | `/content/:id` | Get content by ID | Public | - |
| POST | `/content` | Create content/banner | Admin | `section, title, content, image, link, order` |
| PUT | `/content/:id` | Update content | Admin | Partial content fields |
| DELETE | `/content/:id` | Delete content | Admin | - |

### Content Workflow

1. **Admin creates homepage banner:**
```json
{
  "section": "homepage",
  "title": "Summer Sale",
  "content": "Up to 50% off",
  "image": "https://cdn.example.com/banner.jpg",
  "link": "/products?category=sale",
  "order": 1
}
```

2. **Public accesses banner:**
```
GET /api/content?section=homepage
```

3. **Frontend displays banner in carousel/hero section**

**Supported Sections:**
- `homepage` - Homepage banners
- `banner` - Promotional banners

---

## 8. Reviews Module (`/reviews`)

Product reviews and ratings.

| Method | Endpoint | Description | Auth | Request Body |
|--------|----------|-------------|------|--------------|
| GET | `/reviews/product/:productId` | Get product reviews | Public | `page, limit` |
| POST | `/reviews` | Create review | Required | `productId, rating, comment` |
| PUT | `/reviews/:id` | Update own review | Required | `rating, comment` |
| DELETE | `/reviews/:id` | Delete own review | Required | - |
| GET | `/reviews/user` | Get user's reviews | Required | - |
| PUT | `/reviews/:id/helpful` | Mark review as helpful | Required | - |

### Reviews Workflow

1. **User creates review:**
```json
{
  "productId": "507f1f77bcf86cd799439011",
  "rating": 5,
  "comment": "Great product! Fast shipping."
}
```

2. **System updates product rating:**
   - Increments `ratings_count`
   - Recalculates `average_rating`

3. **Other users mark as helpful:**
```
PUT /api/reviews/:id/helpful
```

---

## 9. Orders Module (`/orders`)

Order processing and management.

| Method | Endpoint | Description | Auth | Request Body |
|--------|----------|-------------|------|--------------|
| GET | `/orders` | Get user orders | Required | `status` filter |
| GET | `/orders/:id` | Get order details | Required | - |
| POST | `/orders` | Create new order | Required | `items, shippingAddress, paymentMethod` |
| POST | `/orders/guest` | Guest checkout | Public | `items, guestInfo, shippingAddress` |
| PUT | `/orders/:id/cancel` | Cancel order | Required | - |
| GET | `/orders/seller` | Get seller orders | Seller | `status` filter |
| PUT | `/orders/:id/status` | Update order status | Seller/Admin | `status` |
| PUT | `/orders/:id/tracking` | Add tracking info | Seller | `trackingNumber, carrier` |

### Order Status Timeline

Orders track all status changes:
- `pending` - Order created, awaiting payment
- `paid` - Payment confirmed
- `processing` - Being prepared
- `shipped` - In transit
- `delivered` - Received by customer
- `cancelled` - Cancelled

---

## 10. Payments Module (`/payments`)

Payment processing with Stripe.

| Method | Endpoint | Description | Auth | Request Body |
|--------|----------|-------------|------|--------------|
| POST | `/payments/checkout` | Process checkout | Required | `orderId, method, savedMethodId` |
| POST | `/payments/webhook` | Stripe webhook handler | Public | Stripe signature |
| GET | `/payments/:orderId` | Get payment status | Required | - |
| POST | `/payments/:orderId/refund` | Process refund | Admin | `amount` |

### Checkout Methods

| Method | Description |
|--------|-------------|
| `stripe` | Credit/debit via Stripe |
| `paypal` | PayPal checkout |
| `cod` | Cash on delivery |
| `wallet` | Use account wallet balance |

---

## Role-Based Access Control

| Role | Permissions |
|------|-------------|
| **customer** | View products, manage own profile/wishlist/cart/orders, leave reviews, apply referrals |
| **seller** | All customer permissions + create/update/delete own products, manage seller orders, request payouts |
| **admin** | All permissions + manage categories, users (wallet, restrictions), coupons, content, refunds, all orders, seller approvals |

---

## Common Query Parameters

For paginated endpoints:

| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 10) |

For product filtering:

| Parameter | Type | Description |
|-----------|------|-------------|
| `search` | string | Search by name/description |
| `category` | string | Filter by category ID |
| `minPrice` | number | Minimum price |
| `maxPrice` | number | Maximum price |
| `rating` | number | Minimum rating (1-5) |
| `sort` | string | Sort field (e.g., `price_asc`, `price_desc`, `newest`) |

---

## Error Responses

All endpoints may return:

```json
{
  "success": false,
  "message": "Error description",
  "error": "DETAILED_ERROR"
}
```

Status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Server Error

---

## Testing with Postman

Import the collection from `MEAN_E-Commerce_API.postman_collection.json` for ready-to-use API requests.

---

*Last Updated: February 2026*
