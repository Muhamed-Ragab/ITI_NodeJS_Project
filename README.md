# MEAN Stack E-Commerce Backend (Node.js)

A robust, modular e-commerce backend built with Node.js, Express, and MongoDB. This project follows the **Controller-Service-Repository** pattern to ensure scalability and maintainability.

## 🚀 Tech Stack
- **Runtime:** Node.js (JavaScript ES6+)
- **Framework:** Express.js
- **Database:** MongoDB (Mongoose ODM)
- **Validation:** Zod
- **Authentication:** JWT + Google OAuth 2.0
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
   ```

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

Pre-commit hooks (husky + lint-staged) will auto-format and run lightweight checks on staged files.

## 🤝 Contribution Rules
- Always branch off `develop`.
- Use `feature/feature-name` naming convention.
- Follow `COMMIT_GUIDELINES.md` for all commits.
- Ensure all logic is split into Controller, Service, and Repository layers.
