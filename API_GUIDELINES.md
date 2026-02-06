# API Guidelines and Endpoint Flows

This document outlines the expected API endpoints for each module, their purpose, validation rules, and general flow. All APIs should return responses in the format defined in `ARCHITECTURE.md`.

---

## 1. Auth Module (`/api/auth`)

**Purpose:** Handles user registration, login, and Google OAuth.

### 1.1. User Registration
-   **Endpoint:** `POST /api/auth/register`
-   **Description:** Creates a new user account with email and password.
-   **Request Body (Zod Schema):**
    -   `email`: string (valid email format, unique)
    -   `password`: string (min 6 characters)
    -   `role`: string (optional, default 'customer', enum: 'customer' | 'seller')
-   **Flow:**
    1.  Validate request body using `auth.schema.js`.
    2.  Check if email already exists in `UserRepository`.
    3.  Hash password using `bcrypt`.
    4.  Create user in `UserRepository`.
    5.  Generate JWT token.
    6.  Return JWT token and basic user info.
-   **Responses:**
    -   `201 Created`: `{ status: 'success', data: { token, user: { id, email, role } } }`
    -   `400 Bad Request`: Validation errors.
    -   `409 Conflict`: Email already registered.

### 1.2. User Login
-   **Endpoint:** `POST /api/auth/login`
-   **Description:** Authenticates a user and returns a JWT token.
-   **Request Body (Zod Schema):**
    -   `email`: string (valid email format)
    -   `password`: string
-   **Flow:**
    1.  Validate request body.
    2.  Find user by email in `UserRepository`.
    3.  Compare provided password with stored hashed password using `bcrypt`.
    4.  Generate JWT token.
    5.  Return JWT token and basic user info.
-   **Responses:**
    -   `200 OK`: `{ status: 'success', data: { token, user: { id, email, role } } }`
    -   `400 Bad Request`: Validation errors.
    -   `401 Unauthorized`: Invalid credentials.

### 1.3. Google OAuth Login/Registration
-   **Endpoint:** `GET /api/auth/google`
-   **Description:** Initiates the Google OAuth 2.0 flow.
-   **Flow:**
    1.  Redirects user to Google's authentication page.
-   **Endpoint:** `GET /api/auth/google/callback`
-   **Description:** Google's callback URL, handles user data after successful authentication.
-   **Flow:**
    1.  Google redirects back with `code`.
    2.  Exchange `code` for access/refresh tokens.
    3.  Fetch user profile from Google using access token.
    4.  Check if user exists in `UserRepository` by `google_id` or `email`.
    5.  If new user, create an account using Google profile data.
    6.  Generate JWT token.
    7.  Return JWT token and user info (typically via redirect to frontend with token in URL/cookie).
-   **Responses:**
    -   `302 Found`: Redirect to frontend with token.
    -   `500 Internal Server Error`: OAuth process failure.

---

## 2. User Module (`/api/users`)

**Purpose:** Manage user profiles, addresses, wishlist, and cart (all embedded in User document).

### 2.1. Get User Profile
-   **Endpoint:** `GET /api/users/profile`
-   **Description:** Retrieves the authenticated user's profile information.
-   **Auth:** JWT required.
-   **Flow:**
    1.  Authenticate user via JWT.
    2.  Fetch user data from `UserRepository`.
    3.  Return user profile (excluding sensitive info like password_hash).
-   **Responses:**
    -   `200 OK`: `{ status: 'success', data: { user: { id, email, full_name, addresses, cart, wishlist } } }`
    -   `401 Unauthorized`: No token or invalid token.

### 2.2. Update User Profile
-   **Endpoint:** `PUT /api/users/profile`
-   **Description:** Updates the authenticated user's profile details.
-   **Auth:** JWT required.
-   **Request Body (Zod Schema):**
    -   `full_name`: string (optional)
    -   `phone`: string (optional)
-   **Flow:**
    1.  Authenticate user.
    2.  Validate request body.
    3.  Update user in `UserRepository`.
    4.  Return updated user profile.
-   **Responses:**
    -   `200 OK`: `{ status: 'success', data: { user: { id, email, full_name } } }`
    -   `400 Bad Request`: Validation errors.

### 2.3. Manage User Addresses (Add, Update, Delete)
-   **Endpoints:**
    -   `POST /api/users/addresses`: Add new address.
    -   `PUT /api/users/addresses/:addressId`: Update existing address.
    -   `DELETE /api/users/addresses/:addressId`: Remove address.
-   **Auth:** JWT required.
-   **Flow:** (Similar for all: Auth, Validate, `UserRepository` update, Return updated user addresses).

### 2.4. Manage User Wishlist (Add, Remove)
-   **Endpoints:**
    -   `POST /api/users/wishlist/:productId`: Add product to wishlist.
    -   `DELETE /api/users/wishlist/:productId`: Remove product from wishlist.
-   **Auth:** JWT required.
-   **Flow:** (Auth, Find user, Modify `user.wishlist` array, `UserRepository` update).

### 2.5. Manage User Cart (Add, Update Quantity, Remove)
-   **Endpoints:**
    -   `GET /api/users/cart`: Get cart contents.
    -   `POST /api/users/cart`: Add/Update item in cart (`productId`, `quantity`).
    -   `DELETE /api/users/cart/:productId`: Remove item from cart.
-   **Auth:** JWT required.
-   **Flow:** (Auth, Find user, Modify `user.cart` array, `UserRepository` update).

---

## 3. Product Module (`/api/products`)

**Purpose:** Manage product listings, search, and filtering.

### 3.1. Create Product
-   **Endpoint:** `POST /api/products`
-   **Description:** Creates a new product.
-   **Auth:** JWT required (Role: 'seller' | 'admin').
-   **Request Body (Zod Schema):**
    -   `title`: string
    -   `description`: string
    -   `price`: number
    -   `stock_quantity`: number
    -   `category_id`: string (ObjectId)
    -   `images`: string[] (Cloudinary URLs)
-   **Flow:**
    1.  Auth (check role).
    2.  Validate body.
    3.  Create product in `ProductRepository`.
    4.  Return created product.
-   **Responses:** `201 Created`

### 3.2. Get Product Details
-   **Endpoint:** `GET /api/products/:id`
-   **Description:** Retrieves a single product by ID.
-   **Auth:** Optional (public access).
-   **Flow:** Find product in `ProductRepository`.
-   **Responses:** `200 OK` or `404 Not Found`.

### 3.3. Update Product
-   **Endpoint:** `PUT /api/products/:id`
-   **Description:** Updates an existing product.
-   **Auth:** JWT required (Role: 'seller' | 'admin', and seller must own product).
-   **Flow:** (Auth, Validate, `ProductRepository` update).

### 3.4. Delete Product
-   **Endpoint:** `DELETE /api/products/:id`
-   **Description:** Deletes a product.
-   **Auth:** JWT required (Role: 'seller' | 'admin', and seller must own product).
-   **Flow:** (Auth, `ProductRepository` delete - soft delete recommended).

### 3.5. Search and Filter Products
-   **Endpoint:** `GET /api/products`
-   **Description:** Retrieves a list of products with search, filtering, and pagination.
-   **Query Params (Zod Schema):**
    -   `q`: string (search term for title/description)
    -   `category`: string (category ID)
    -   `minPrice`: number
    -   `maxPrice`: number
    -   `page`: number (default 1)
    -   `limit`: number (default 10)
-   **Flow:**
    1.  Validate query params.
    2.  Construct MongoDB query (text search, filtering) in `ProductRepository`.
    3.  Apply pagination.
    4.  Return array of products and total count.

---

## 4. Order Module (`/api/orders`)

**Purpose:** Manage the checkout process and order lifecycle.

### 4.1. Place Order (Checkout)
-   **Endpoint:** `POST /api/orders`
-   **Description:** Converts the user's current cart into a new order.
-   **Auth:** JWT required.
-   **Request Body (Zod Schema):**
    -   `shipping_address_id`: string (ID of an address from user's embedded addresses)
    -   `payment_method`: string (e.g., 'stripe')
-   **Flow (Transactional - ACID properties important):**
    1.  Auth user.
    2.  Validate body.
    3.  Fetch user's cart from `UserRepository`.
    4.  For each item in cart:
        a.  Verify product existence and `stock_quantity` in `ProductRepository`.
        b.  Deduct `stock_quantity` from `ProductRepository` (atomic operation).
    5.  Create a snapshot of cart items (price, title, etc.) for the order.
    6.  Create new order in `OrderRepository` with `status: 'pending'`, `payment_info: { status: 'pending' }`.
    7.  Clear user's cart in `UserRepository`.
    8.  Return newly created order.
-   **Responses:** `201 Created`

### 4.2. Get User's Order History
-   **Endpoint:** `GET /api/orders/me`
-   **Description:** Retrieves all orders for the authenticated user.
-   **Auth:** JWT required.
-   **Flow:** Find orders by `user_id` in `OrderRepository`.

### 4.3. Get Single Order Details
-   **Endpoint:** `GET /api/orders/:id`
-   **Description:** Retrieves details for a specific order.
-   **Auth:** JWT required (user must own order, or admin).
-   **Flow:** Find order by ID in `OrderRepository`.

### 4.4. Update Order Status
-   **Endpoint:** `PUT /api/orders/:id/status`
-   **Description:** Updates the status of an order (e.g., 'shipped', 'delivered').
-   **Auth:** JWT required (Role: 'admin' | 'seller', and seller must be related to products in order).
-   **Flow:** (Auth, Validate, `OrderRepository` update).

---

## 5. Payment Module (`/api/payments`)

**Purpose:** Handle payment initiation and webhook processing.

### 5.1. Create Payment Intent
-   **Endpoint:** `POST /api/payments/create-payment-intent`
-   **Description:** Creates a Stripe Payment Intent for an order.
-   **Auth:** JWT required.
-   **Request Body (Zod Schema):**
    -   `orderId`: string (ID of the order to be paid)
-   **Flow:**
    1.  Auth user.
    2.  Fetch order details from `OrderRepository`.
    3.  Call Stripe API to create a Payment Intent with order's total amount.
    4.  Return `client_secret` to frontend.
-   **Responses:** `200 OK`

### 5.2. Stripe Webhook Handler
-   **Endpoint:** `POST /api/payments/webhook`
-   **Description:** Receives payment event notifications from Stripe.
-   **Auth:** Stripe signature verification (not JWT).
-   **Flow:**
    1.  Verify Stripe webhook signature.
    2.  Parse event data.
    3.  Handle `payment_intent.succeeded` event:
        a.  Find corresponding order in `OrderRepository`.
        b.  Update order `status` to 'paid' and `payment_info`.
    4.  Handle other events (e.g., `payment_intent.payment_failed`).
-   **Responses:** `200 OK` (to acknowledge receipt by Stripe).

---

## 6. Category Module (`/api/categories`)

**Purpose:** Manage product categories.

### 6.1. Create Category
-   **Endpoint:** `POST /api/categories`
-   **Description:** Creates a new product category.
-   **Auth:** JWT required (Role: 'admin').
-   **Request Body (Zod Schema):**
    -   `name`: string (unique)
    -   `image_url`: string (optional, Cloudinary URL)
-   **Flow:** (Auth, Validate, `CategoryRepository` create).

### 6.2. Get All Categories
-   **Endpoint:** `GET /api/categories`
-   **Description:** Retrieves all product categories.
-   **Auth:** Optional (public access).
-   **Flow:** Fetch all categories from `CategoryRepository`.

### 6.3. Update Category
-   **Endpoint:** `PUT /api/categories/:id`
-   **Description:** Updates an existing category.
-   **Auth:** JWT required (Role: 'admin').
-   **Flow:** (Auth, Validate, `CategoryRepository` update).

### 6.4. Delete Category
-   **Endpoint:** `DELETE /api/categories/:id`
-   **Description:** Deletes a category.
-   **Auth:** JWT required (Role: 'admin').
-   **Flow:** (Auth, `CategoryRepository` delete - consider implications for products in category).
