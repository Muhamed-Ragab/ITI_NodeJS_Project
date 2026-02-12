# Feature Task Map (What/Where/Functions)

Use this as a build checklist. It assumes the standard structure below; adjust paths if your team uses different filenames.

## Auth
```
- what we need to do
  - Implement register, login, Google OAuth start + callback, JWT middleware usage.
  - Validation for inputs, consistent error responses, JWT issuance.
- filename
  - src/modules/auth/auth.routes.js
  - src/modules/auth/auth.controller.js
  - src/modules/auth/auth.service.js
  - src/modules/auth/auth.repository.js
  - src/modules/auth/auth.validation.js
  - src/modules/auth/auth.model.js (or reuse users.model.js if auth shares User)
- functions name and what every method responsible for
  - auth.routes.js
    - registerRoute: map POST /api/auth/register to controller [public]
    - loginRoute: map POST /api/auth/login to controller [public]
    - googleStartRoute: map GET /api/auth/google to controller [public]
    - googleCallbackRoute: map GET /api/auth/google/callback to controller [public]
  - auth.controller.js
    - register: request validation, call service, return token + user
    - login: request validation, call service, return token + user
    - googleStart: build oauth url and redirect
    - googleCallback: exchange code, call service, return token/redirect
  - auth.service.js
    - registerUser: check existing, hash password, create user, sign JWT
    - loginUser: verify credentials, sign JWT
    - handleGoogleCallback: exchange code, upsert user, sign JWT
  - auth.repository.js
    - findUserByEmail
    - findUserByGoogleId
    - createUser
  - auth.validation.js
    - registerSchema
    - loginSchema
    - googleCallbackSchema (if you validate query)
```

## Users
```
- what we need to do
  - Profile fetch/update (including single address object), wishlist add/remove/list, cart add/update/remove/list, admin role update.
- filename
  - src/modules/users/users.routes.js
  - src/modules/users/users.controller.js
  - src/modules/users/users.service.js
  - src/modules/users/users.repository.js
  - src/modules/users/users.validation.js
  - src/modules/users/users.model.js
- functions name and what every method responsible for
  - users.routes.js
    - getProfileRoute: GET /api/users/profile [auth]
    - updateProfileRoute: PUT /api/users/profile (includes address object) [auth]
    - getWishlistRoute: GET /api/users/wishlist [auth]
    - addWishlistRoute: POST /api/users/wishlist/:productId [auth]
    - removeWishlistRoute: DELETE /api/users/wishlist/:productId [auth]
    - getCartRoute: GET /api/users/cart [auth]
    - upsertCartRoute: POST /api/users/cart [auth]
    - removeCartRoute: DELETE /api/users/cart/:productId [auth]
    - updateRoleRoute: PUT /api/users/:userId/role [admin]
  - users.controller.js
    - getProfile
    - updateProfile (allows address object updates)
    - getWishlist
    - addWishlist
    - removeWishlist
    - getCart
    - upsertCartItem
    - removeCartItem
    - updateUserRole
  - users.service.js
    - getUserById
    - updateUserProfile (includes address object)
    - getUserWishlist
    - addProductToWishlist
    - removeProductFromWishlist
    - getUserCart
    - upsertCartItem
    - removeCartItem
    - updateRole
  - users.repository.js
    - findById
    - updateById (includes nested address updates)
    - addWishlist / removeWishlist
    - addCartItem / updateCartItem / removeCartItem
    - updateRole
  - users.validation.js
    - profileUpdateSchema
    - addressSchema (part of profileUpdateSchema or a nested schema)
    - wishlistSchema (productId param)
    - cartSchema (productId + qty)
    - roleUpdateSchema
```

## Categories
```
- what we need to do
  - CRUD categories, admin-only for write operations.
- filename
  - src/modules/categories/categories.routes.js
  - src/modules/categories/categories.controller.js
  - src/modules/categories/categories.service.js
  - src/modules/categories/categories.repository.js
  - src/modules/categories/categories.validation.js
  - src/modules/categories/categories.model.js
- functions name and what every method responsible for
  - categories.routes.js
    - createCategoryRoute: POST /api/categories [admin]
    - getCategoryRoute: GET /api/categories/:id [public]
    - updateCategoryRoute: PUT /api/categories/:id [admin]
    - deleteCategoryRoute: DELETE /api/categories/:id [admin]
    - listCategoriesRoute: GET /api/categories [public]
  - categories.controller.js
    - createCategory
    - getCategoryById
    - updateCategory
    - deleteCategory
    - listCategories
  - categories.service.js
    - createCategory
    - getCategoryById
    - updateCategory
    - deleteCategory
    - listCategories
  - categories.repository.js
    - create
    - findById
    - updateById
    - deleteById
    - list
  - categories.validation.js
    - categoryCreateSchema
    - categoryUpdateSchema
```

## Products
```
- what we need to do
  - Product CRUD (seller), list/search/filter, upload images (Cloudinary).
- filename
  - src/modules/products/products.routes.js
  - src/modules/products/products.controller.js
  - src/modules/products/products.service.js
  - src/modules/products/products.repository.js
  - src/modules/products/products.validation.js
  - src/modules/products/products.model.js
- functions name and what every method responsible for
  - products.routes.js
    - createProductRoute: POST /api/products [seller]
    - getProductRoute: GET /api/products/:id [public]
    - updateProductRoute: PUT /api/products/:id [seller]
    - deleteProductRoute: DELETE /api/products/:id [seller]
    - listProductsRoute: GET /api/products [public]
    - uploadImagesRoute: POST /api/products/:id/images/upload [seller]
  - products.controller.js
    - createProduct
    - getProductById
    - updateProduct
    - deleteProduct
    - listProducts
    - uploadProductImages
  - products.service.js
    - createProduct
    - getProductById
    - updateProduct
    - deleteProduct
    - listProducts
    - uploadImages
  - products.repository.js
    - create
    - findById
    - updateById
    - deleteById
    - listWithFilters
    - appendImages
  - products.validation.js
    - productCreateSchema
    - productUpdateSchema
    - productQuerySchema
    - imageUploadSchema
```

## Orders
```
- what we need to do
  - Create order from cart, get order, list my orders, admin list, update status.
- filename
  - src/modules/orders/orders.routes.js
  - src/modules/orders/orders.controller.js
  - src/modules/orders/orders.service.js
  - src/modules/orders/orders.repository.js
  - src/modules/orders/orders.validation.js
  - src/modules/orders/orders.model.js
- functions name and what every method responsible for
  - orders.routes.js
    - createOrderRoute: POST /api/orders [auth]
    - getOrderRoute: GET /api/orders/:id [auth, owner/admin]
    - updateOrderStatusRoute: PUT /api/orders/:id/status [admin/seller]
    - listMyOrdersRoute: GET /api/orders/me [auth]
    - listAllOrdersRoute: GET /api/orders [admin]
  - orders.controller.js
    - createOrder
    - getOrderById
    - updateOrderStatus
    - listMyOrders
    - listAllOrders
  - orders.service.js
    - createOrderFromCart
    - getOrderById
    - updateStatus
    - listOrdersByUser
    - listOrdersAll
  - orders.repository.js
    - create
    - findById
    - updateStatusById
    - findByUser
    - listAll
  - orders.validation.js
    - orderCreateSchema
    - orderStatusSchema
```

## Payments
```
- what we need to do
  - Create payment intent, handle Stripe webhook, update order status.
- filename
  - src/modules/payments/payments.routes.js
  - src/modules/payments/payments.controller.js
  - src/modules/payments/payments.service.js
  - src/modules/payments/payments.repository.js
  - src/modules/payments/payments.validation.js
- functions name and what every method responsible for
  - payments.routes.js
    - createPaymentIntentRoute: POST /api/payments/create-payment-intent [auth]
    - stripeWebhookRoute: POST /api/payments/webhook [public, Stripe only]
  - payments.controller.js
    - createPaymentIntent
    - stripeWebhook
  - payments.service.js
    - createPaymentIntent
    - handleStripeWebhook
  - payments.repository.js
    - findOrderById (or call orders repo)
    - updateOrderPaymentStatus
  - payments.validation.js
    - paymentIntentSchema
```

## Shared Middleware + Utils
```
- what we need to do
  - Auth guard, role guard, validation middleware, error handler, async wrapper, response helpers.
- filename
  - src/middlewares/auth.middleware.js
  - src/middlewares/validate.middleware.js
  - src/middlewares/error.middleware.js
  - src/utils/response.js
  - src/utils/pagination.js
  - src/utils/errors.js
- functions name and what every method responsible for
  - auth.middleware.js
    - requireAuth: verify JWT, attach user to req
    - requireRole: enforce role(s)
  - validate.middleware.js
    - validate: run zod schema and pass validated data
  - error.middleware.js
    - errorHandler: normalize errors and send response envelope
  - response.js
    - ok / created / fail helpers
  - pagination.js
    - parsePagination
  - errors.js
    - AppError class + error factories
```

## Notes
- If you already have a shared User model, Auth should reuse it.
- Orders should depend on Users (cart) and Products (price/stock), so align data structures early.
- Keep response envelopes consistent across modules.
