# Feature Task Map (What/Where/Functions)

Use this as the practical build/status checklist for the **current repository state**.

## Auth (implemented)

```text
- scope
  - Register/login with JWT.
  - Google OAuth start + callback.
  - Reuse User model through repository/service.
- files
  - src/modules/auth/auth.routes.js
  - src/modules/auth/auth.controller.js
  - src/modules/auth/auth.service.js
  - src/modules/auth/auth.repository.js
  - src/modules/auth/auth.validation.js
- current exported methods
  - auth.routes.js
    - POST /api/auth/register
    - POST /api/auth/login
    - POST /api/auth/logout
    - GET /api/auth/google
    - GET /api/auth/google/callback
  - auth.controller.js
    - register
    - login
    - logout
    - googleStart
    - googleCallback
  - auth.service.js
    - registerUser
    - loginUser
    - logoutUser
    - handleGoogleCallback
  - auth.repository.js
    - findUserByEmail
    - findUserByGoogleId
    - attachGoogleIdToUser
    - findUserById
    - incrementTokenVersion
    - createUser
  - auth.validation.js
    - registerSchema
    - loginSchema
    - googleCallbackSchema
```

## Users (implemented)

```text
- scope
  - Profile read/update.
  - Wishlist add/remove/list.
  - Cart add/update/remove/list.
  - Address add/update/remove.
  - Admin list users + update role.
- files
  - src/modules/users/users.routes.js
  - src/modules/users/users.controller.js
  - src/modules/users/users.service.js
  - src/modules/users/users.repository.js
  - src/modules/users/users.validation.js
  - src/modules/users/user.model.js
- current routes
  - GET /api/users/profile
  - PUT /api/users/profile
  - GET /api/users/wishlist
  - POST /api/users/wishlist
  - DELETE /api/users/wishlist/:productId
  - GET /api/users/cart
  - PUT /api/users/cart
  - DELETE /api/users/cart/:productId
  - POST /api/users/address
  - PUT /api/users/address/:addressId
  - DELETE /api/users/address/:addressId
  - GET /api/users/               [admin]
  - PUT /api/users/admin/:id/role [admin]
- notable controller methods
  - getProfile, updateProfile
  - getWishlist, addWishlistItem, removeWishlistItem
  - getCart, upsertCart, removeCartItemController
  - addAddress, updateAddress, removeAddress
  - listUsers, updateRole
- notable schema fields
  - `tokenVersion` used for JWT revocation on logout
```

## Categories (implemented)

```text
- scope
  - CRUD categories.
  - Write operations restricted to admin role.
- files
  - src/modules/categories/categories.routes.js
  - src/modules/categories/categories.controller.js
  - src/modules/categories/categories.service.js
  - src/modules/categories/categories.repository.js
  - src/modules/categories/categories.validation.js
  - src/modules/categories/categories.model.js
- current methods
  - controller/service: createCategory, getCategoryById, updateCategory, deleteCategory, listCategories
  - repository: create, findById, updateById, deleteById, list
  - validation: categoryCreateSchema, categoryUpdateSchema, categoryIdSchema
```

## Products (implemented)

```text
- scope
  - Seller CRUD for products.
  - Public listing/filtering.
  - Seller image upload + frontend upload payload flow.
- files
  - src/modules/products/products.routes.js
  - src/modules/products/products.controller.js
  - src/modules/products/products.service.js
  - src/modules/products/products.repository.js
  - src/modules/products/products.validation.js
  - src/modules/products/products.model.js
  - src/services/cdn/cdn-provider.js
  - src/services/cdn/cloudinary-provider.js
  - src/services/cdn/index.js
- current routes
  - GET /api/products/
  - POST /api/products/                         [seller]
  - GET /api/products/:id
  - PUT /api/products/:id                       [seller]
  - DELETE /api/products/:id                    [seller]
  - POST /api/products/images/upload-payload    [seller]
  - POST /api/products/:id/images/upload        [seller]
- notable methods
  - controller: createProduct, getProductById, updateProduct, deleteProduct, listProducts, uploadProductImages, getProductImageUploadPayload
  - service: createProduct, getProductById, updateProduct, deleteProduct, listProducts, uploadImages, getImageUploadPayload
  - repository: create, findById, updateById, deleteById, listWithFilters, appendImages
  - validation: productCreateSchema, productUpdateSchema, productIdSchema, productQuerySchema, imageUploadSchema, imageUploadPayloadSchema
```

## Orders (planned / not implemented yet)

```text
- current state
  - src/modules/orders/README.md exists.
  - No routes/controller/service/repository/model files yet.
- expected next files
  - src/modules/orders/orders.routes.js
  - src/modules/orders/orders.controller.js
  - src/modules/orders/orders.service.js
  - src/modules/orders/orders.repository.js
  - src/modules/orders/orders.validation.js
  - src/modules/orders/orders.model.js
```

## Payments (planned / not implemented yet)

```text
- current state
  - src/modules/payments/README.md exists.
  - No routes/controller/service/repository/validation files yet.
- expected next files
  - src/modules/payments/payments.routes.js
  - src/modules/payments/payments.controller.js
  - src/modules/payments/payments.service.js
  - src/modules/payments/payments.repository.js
  - src/modules/payments/payments.validation.js
```

## Shared Middleware + Utils (implemented)

```text
- files
  - src/middlewares/auth.middleware.js
  - src/middlewares/role.middleware.js
  - src/middlewares/validate.middleware.js
  - src/middlewares/error.middleware.js
  - src/utils/response.js
  - src/utils/pagination.js
  - src/utils/errors/api-error.js
- current exports
  - auth.middleware.js
    - requireAuth
  - role.middleware.js
    - requireRole
  - validate.middleware.js
    - validate
  - error.middleware.js
    - errorHandler
  - response.js
    - sendSuccess
    - sendError
  - pagination.js
    - parsePagination
    - buildPaginationMeta
  - api-error.js
    - ApiError class
    - ApiError.badRequest / unauthorized / forbidden / notFound / internal
```

## Notes

- Keep response envelope consistent (`success`, `data|error`, `message`).
- Keep route/controller/service/repository responsibilities separated.
- For new middleware changes, update tests under `test/middlewares/` and docs under `docs/`.
