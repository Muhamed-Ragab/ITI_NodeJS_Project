# MEAN Stack E-Commerce Backend (Node.js)

A robust, modular e-commerce backend built with Node.js, Express, and MongoDB. This project follows the **Controller-Service-Repository** pattern to ensure scalability and maintainability.

## 🚀 Tech Stack
- **Runtime:** Node.js (JavaScript ES6+)
- **Framework:** Express.js
- **Database:** MongoDB (Mongoose ODM)
- **Validation:** Zod
- **Authentication:** JWT + Google OAuth 2.0
  - Email verification token flow for email/password signup
- **Media Storage:** Cloudinary CDN
- **Payments:** Stripe API

## 📂 Project Structure
```text
src/
├── config/         # Environment & DB configurations
├── middlewares/    # Global middlewares (Auth, Validation, Error Handling)
├── modules/        # Feature-based modules (Auth, User, Product, Order, etc.)
├── utils/          # Shared helper functions
├── app.js          # Express app configuration
└── server.js       # Server entry point
```

## Documentation
All global project documentation has moved to the `docs/` folder. See `docs/README.md` for developer onboarding, branching rules, commit guidelines and DX scripts (git helpers).

Additional implementation guides:
- `docs/MIDDLEWARE_GUIDE.md` — global middleware behavior and usage patterns.
- `docs/TESTING_GUIDE.md` — middleware unit/integration test strategy.
- `docs/QUALITY_CHECKS.md` — required local quality-gate command order.
- `docs/TASKS_CHANGELOG.md` — consolidated phase-by-phase summary of delivered tasks and updates.
- `MEAN_E-Commerce_API.postman_collection.json` — up-to-date API requests for auth, users, commerce, and Phase 4 engagement endpoints.

## 🛠️ Setup Instructions

### Prerequisites
- Node.js (v20+)
- MongoDB (Local or Atlas)
- Cloudinary Account
- Stripe Account

### Installation
1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd project
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Variables:**
   Create a `.env` file in the root directory and add:
   ```env
   PORT=3000
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_secret
   STRIPE_SECRET_KEY=your_stripe_key
   CLOUDINARY_URL=your_cloudinary_url
   GOOGLE_CLIENT_ID=your_google_id
   GOOGLE_CLIENT_SECRET=your_google_secret
   APP_BASE_URL=http://localhost:3000
   ```

### Email Verification Flow
1. Register with `POST /api/auth/register`.
2. The backend creates a verification token and sends a verification link.
3. Verify account with `GET /api/auth/verify-email?token=<token>`.
4. Login is allowed only after successful email verification.

4. **Run the server:**
   ```bash
   # Development mode
   npm run dev
   ```

## Developer: Formatting & linting (Biome) 🧹

We replaced ESLint with Biome. Recommended local developer commands:

- Install editor plugin: Biome for your editor (VS Code, etc.)
- Check code: `npm run lint`
- Format code: `npm run format`
- Verify formatting (CI): `npm run format:check`

Pre-commit hooks have been removed; run `npm run format` and `npm run lint` locally — CI enforces formatting and checks.

## 🤝 Contribution Rules
- Always branch off `develop`.
- Use `feature/feature-name` naming convention.
- Follow `COMMIT_GUIDELINES.md` for all commits.
- Ensure all logic is split into Controller, Service, and Repository layers.
