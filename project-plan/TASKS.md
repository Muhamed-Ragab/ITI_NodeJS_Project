# Team Task Breakdown

This document splits the project into 6 Phases. Each task is designed to be independent where possible to allow parallel development by team members.

## Phase 1: Setup & Foundation
**Goal:** Initialize project, set up CI/CD, and basic infrastructure.

- [ ] **Task 1.1: Repo Setup**
    - Initialize Git repo.
    - Setup `express`, `eslint`, `prettier`.
    - Create folder structure based on `ARCHITECTURE.md`.
- [ ] **Task 1.2: Database Connection**
    - Setup MongoDB Atlas or Local instance.
    - Write Mongoose connection logic (`config/db.js`).
- [ ] **Task 1.3: Global Middlewares**
    - Implement `ErrorHandler` (global catch).
    - Implement `ZodValidator` middleware.
    - Setup Logger (Morgan/Winston).

## Phase 2: User Management & Auth
**Goal:** Users can register, login, and manage profiles.

- [ ] **Task 2.1: Auth Module (Backend)**
    - Register API (Email/Password) with Zod validation.
    - Login API (Generate JWT).
    - **Google OAuth:** Implement generic Google Login flow.
    - Auth Middleware (Verify JWT).
- [ ] **Task 2.2: User Profile (Simplified)**
    - Manage Embedded Addresses/Wishlist/Cart APIs.
    - Role Management (RBAC).

## Phase 3: Product Catalog
**Goal:** Sellers can list items; Customers can browse/search.

- [ ] **Task 3.1: Category Module**
    - Simple CRUD for Categories.
- [ ] **Task 3.2: Product Management (Seller)**
    - Create Product API.
    - **Cloudinary Integration:** Middleware to upload images to Cloudinary and store URL.
    - Update/Delete Product API.
- [ ] **Task 3.3: Product Discovery**
    - Get All Products with Pagination.
    - Search & Filter.

## Phase 4: Shopping & Orders
**Goal:** The core e-commerce loop.

- [ ] **Task 4.1: Cart & Wishlist**
    - Add/Remove from User's embedded Cart/Wishlist arrays.
- [ ] **Task 4.2: Order Placement**
    - Create Order from User Cart.
    - Embed payment status (Pending).

## Phase 5: Payment & Reviews
**Goal:** Trust and Transactions.

- [ ] **Task 5.1: Payment Integration (Stripe)**
    - Create Payment Intent API (Stripe).
    - Webhook handler to confirm payment and update Order status.
- [ ] **Task 5.2: Reviews**
    - Add Review API.

## Phase 6: Admin & Polish
**Goal:** Admin controls and API Documentation.

- [ ] **Task 6.1: Admin Dashboard APIs**
    - User Management (Ban/Unban users).
    - Platform Analytics (Total Sales, Top Sellers).
- [ ] **Task 6.2: Documentation**
    - Write `README.md` with setup instructions.
    - Generate API Docs (Swagger/Postman Collection).