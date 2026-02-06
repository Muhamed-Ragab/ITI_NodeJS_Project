# Middlewares

This directory contains global Express middleware functions that are applied across various routes or handle specific concerns like authentication, error handling, and request validation.

## Purpose
- **Centralized Logic:** Encapsulate reusable request processing logic.
- **Decoupling:** Keep route handlers focused on their core business logic.
- **Security & Validation:** Enforce authentication, authorization, and input validation before reaching controllers.

## Files
-   `auth.middleware.js`: Handles JWT verification for protected routes.
-   `error.middleware.js`: Global error handling middleware to catch and format errors.
-   `validate.middleware.js`: Generic middleware for Zod schema validation of incoming request data.