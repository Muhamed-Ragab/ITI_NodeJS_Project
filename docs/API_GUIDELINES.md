# API Guidelines (moved)

High-level API expectations, endpoint flows, validation and response shapes.

- Keep validation in Zod schemas.
- Controllers orchestrate services; business logic lives in Services; DB access in Repositories.
- Use consistent response envelopes and status codes as documented in ARCHITECTURE.md.
- Use `ApiError` for operational errors and let `errorHandler` + `sendError` serialize all API errors.
- Use shared middleware stack for protected routes: `requireAuth` then `requireRole(...)` when authorization is needed.
- Auth logout is DB-backed: `POST /api/auth/logout` (requires auth) increments `tokenVersion`, revoking all previously issued tokens for that user.
- Response envelope standard:
  - Success: `{ success: true, data, message? }`
  - Error: `{ success: false, error: { code, details? }, message? }`
- Example implementation route: `POST /examples/response`

(Full API guidelines remain in this file — previously at the repository root.)
