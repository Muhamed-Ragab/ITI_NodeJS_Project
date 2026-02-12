# Backend Architecture & Tech Stack

## 1. Tech Stack
- **Runtime:** Node.js (JavaScript ES6+)
- **Framework:** Express.js
- **Database:** MongoDB (using Mongoose ODM)
- **Validation:** Zod (Runtime schema validation)
- **Authentication:** JWT + Google OAuth 2.0
- **File Storage:** Cloudinary (CDN for images)
- **Payments:** Stripe API
- **Architecture Pattern:** Modular Monolith (Feature-based)

## 2. Directory Structure (Modular)
Each feature (User, Product, Order) acts as a mini-application.

```text
src/
├── config/                 # Environment vars, Database connection, Logger config
│   ├── db.js
│   └── env.js
├── middlewares/            # Global Middlewares
│   ├── auth.middleware.js  # JWT verification
│   ├── error.middleware.js # Global error handler
│   └── validate.middleware.js # Zod integration
├── modules/                # FEATURE MODULES (The Core)
│   ├── auth/
│   │   ├── auth.controller.js
│   │   ├── auth.service.js
│   │   ├── auth.repository.js  # Database logic
│   │   ├── auth.schema.js      # Zod Schemas
│   │   └── auth.routes.js
│   ├── users/
│   │   ├── user.model.js       # Mongoose Model
│   │   ├── user.repository.js
│   │   ├── user.controller.js
│   │   ├── user.service.js
│   │   └── user.routes.js
│   ├── products/
│   ├── orders/
│   └── cart/
├── utils/                  # Helper functions (AppError, catchAsync, EmailSender)
├── app.js                  # App entry point (Express app setup)
└── server.js               # Server entry point (Port listening)
```

## 3. Design Patterns & Standards

### A. Controller-Service-Repository Pattern
- **Routes:** Only define endpoints and call Controllers.
- **Controllers:** Handle HTTP Request/Response, parse body, and call Services.
- **Services:** Contain the **Business Logic**. They orchestrate calls to one or more Repositories.
- **Repositories:** Contain the **Data Access Logic**. This is the only place where Mongoose queries are written.
- **Models:** Define Database Schema.

### B. Validation (Zod)
We will create a generic middleware that takes a Zod schema and validates the request body/query/params.

**Example Zod Schema (`auth.schema.js`):**
```javascript
import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(['customer', 'seller']).optional()
  })
});
```

### C. Response Structure
All API responses must follow a consistent format:
```json
{
  "success": true,
  "data": { ... },
  "message": "..."
}

{
  "success": false,
  "error": { ... },
  "message": "..."
}
```

## 4. Git Workflow
- **Main Branch:** `main` (Production ready)
- **Development Branch:** `develop` (Staging)
- **Feature Branches:** `feature/feature-name`

**Rules:**
1. Never push directly to `main`.
2. Create a Pull Request (PR) for every task.
3. Code must pass linting (Biome) before merging.