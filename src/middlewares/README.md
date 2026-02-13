# Middlewares

This directory contains global Express middleware functions that are applied across various routes or handle specific concerns like authentication, error handling, and request validation.

## Purpose
- **Centralized Logic:** Encapsulate reusable request processing logic.
- **Decoupling:** Keep route handlers focused on their core business logic.
- **Security & Validation:** Enforce authentication, authorization, and input validation before reaching controllers.

## Files
-   `auth.middleware.js`: Handles JWT verification for protected routes.
-   `role.middleware.js`: Enforces role-based authorization for authenticated users.
-   `error.middleware.js`: Global error handling middleware to catch and format errors.
-   `validate.middleware.js`: Generic middleware for Zod schema validation of incoming request data.

## Standard response envelope

All routes should return one of these two envelopes:

- Success: `{ success: true, data, message? }`
- Error: `{ success: false, error: { code, details? }, message? }`

## Team example route

Use `POST /examples/response` as a reference implementation for:

- request validation via `validate(...)`
- raising typed business errors with `next(new ApiError(...))`
- returning success responses with `sendSuccess(...)`

## Error handling guidance

- Use `ApiError` for operational/business errors in middleware and route handlers.
- Let `errorHandler` be the only middleware that formats error responses.
- Let `sendError(...)` be the only helper that serializes the final error envelope.
