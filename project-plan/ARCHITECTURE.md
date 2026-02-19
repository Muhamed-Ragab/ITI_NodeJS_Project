# Backend Architecture & Tech Stack

## 1) Tech Stack

- **Runtime:** Node.js (ESM)
- **Framework:** Express 5
- **Database:** MongoDB with Mongoose
- **Validation:** Zod via shared `validate` middleware
- **Authentication/Authorization:** JWT + role-based middleware
- **Media Storage:** Cloudinary (via provider abstraction)
- **Payments:** Stripe (module planned/in-progress)
- **Testing:** Vitest
- **Code Quality:** Biome (format/lint/import organization)
- **Architecture Pattern:** Modular Monolith (feature-based modules)

## 2) Current Directory Structure (Implemented)

```text
src/
├── app.js
├── server.js
├── config/
│   ├── db.js
│   └── env.js
├── middlewares/
│   ├── auth.middleware.js
│   ├── role.middleware.js
│   ├── validate.middleware.js
│   └── error.middleware.js
├── modules/
│   ├── auth/
│   │   ├── auth.routes.js
│   │   ├── auth.controller.js
│   │   ├── auth.service.js
│   │   ├── auth.repository.js
│   │   └── auth.validation.js
│   ├── users/
│   │   ├── users.routes.js
│   │   ├── users.controller.js
│   │   ├── users.service.js
│   │   ├── users.repository.js
│   │   ├── users.validation.js
│   │   └── user.model.js
│   ├── categories/
│   │   ├── categories.routes.js
│   │   ├── categories.controller.js
│   │   ├── categories.service.js
│   │   ├── categories.repository.js
│   │   ├── categories.validation.js
│   │   └── categories.model.js
│   ├── products/
│   │   ├── products.routes.js
│   │   ├── products.controller.js
│   │   ├── products.service.js
│   │   ├── products.repository.js
│   │   ├── products.validation.js
│   │   └── products.model.js
│   ├── cart/
│   ├── orders/
│   └── payments/
├── services/
│   └── cdn/
│       ├── cdn-provider.js
│       ├── cloudinary-provider.js
│       └── index.js
└── utils/
    ├── response.js
    ├── pagination.js
    ├── logger.js
    └── errors/
        └── api-error.js
```

## 3) Layering and Responsibilities

### A) Route → Controller → Service → Repository

- **Routes**
  - Declare endpoints and middleware chain.
  - Apply auth/role/validation middleware.
- **Controllers**
  - Handle HTTP I/O only.
  - Call service methods and return standardized success responses.
- **Services**
  - Contain business rules and authorization checks at domain level.
  - Throw `ApiError` for operational failures.
- **Repositories**
  - Encapsulate Mongoose data access and query details.
- **Models**
  - Define MongoDB document schema and indexes.

### B) Cross-cutting Middlewares

- `validate.middleware.js`: validates `body`, `params`, and `query` with Zod and normalizes parsed values back to `req`.
- `auth.middleware.js`: verifies JWT and sets `req.user`.
- `role.middleware.js`: enforces role checks after auth.
- `error.middleware.js`: centralizes error normalization/serialization using `ApiError` + `sendError`.

### C) Shared Utilities and Platform Services

- `utils/response.js`: canonical API response envelope.
- `utils/pagination.js`: shared pagination parsing/meta helpers.
- `utils/errors/api-error.js`: typed operational error class.
- `services/cdn/*`: provider abstraction for image upload workflows (Cloudinary implementation).

## 4) API Response Contract

Success:

```json
{
  "success": true,
  "data": {},
  "message": "optional"
}
```

Error:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "details": {}
  },
  "message": "optional"
}
```

## 5) Coding and Quality Standards

- Biome is the source of truth for formatting/linting.
- Enforced style baseline:
  - double quotes
  - tab indentation
  - organized imports (`assist/source/organizeImports`)
  - ESM import/export syntax

Required local quality gates before PR:

```bash
npm run format
npm run lint
npm run build
npm test -- --run
```

## 6) Git Workflow and Branching Rules

- Base branch for task work: `develop`
- Never push directly to `main` or `develop`
- Allowed branch prefixes:
  - `feature/*`
  - `fix/*`
  - `hotfix/*`
  - `test/*`
  - `docs/*`
  - `chore/*`
  - `release/*`

Each task should be delivered through a focused PR into `develop`.