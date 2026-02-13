# API Guidelines (moved)

High-level API expectations, endpoint flows, validation and response shapes.

- Keep validation in Zod schemas.
- Controllers orchestrate services; business logic lives in Services; DB access in Repositories.
- Use consistent response envelopes and status codes as documented in ARCHITECTURE.md.
- Use shared middleware stack for protected routes: `requireAuth` then `requireRole(...)` when authorization is needed.
- Response envelope standard:
  - Success: `{ success: true, data, message? }`
  - Error: `{ success: false, error: { code, details? }, message? }`
- Example implementation route: `POST /examples/response`

(Full API guidelines remain in this file — previously at the repository root.)
