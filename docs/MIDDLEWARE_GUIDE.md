# Middleware Guide

This project exposes reusable middlewares under `src/middlewares/`.

## `validate` middleware

**File:** `src/middlewares/validate.middleware.js`

Purpose:
- Validate `req.body`, `req.params`, and/or `req.query` using Zod schemas.
- Replace request data with parsed/normalized values.
- Forward validation failures to global error middleware with `statusCode = 400`.

Usage example:

```js
import { z } from "zod";
import { validate } from "../middlewares/validate.middleware.js";

router.post(
	"/users",
	validate({
		body: z.object({
			email: z.string().email(),
			age: z.coerce.number().int().positive(),
		}),
	}),
	createUserController
);
```

## `requireAuth` middleware

**File:** `src/middlewares/auth.middleware.js`

Purpose:
- Read `Authorization: Bearer <token>` header.
- Verify JWT using `env.JWT_SECRET`.
- Attach decoded payload to `req.user`.
- Forward unauthorized access errors with status `401`.

## `errorHandler` middleware

**File:** `src/middlewares/error.middleware.js`

Purpose:
- Provide one global error response format.
- Convert `ZodError` into a `400 Validation failed` response.
- Serialize `ApiError` instances into the standard API error envelope.
- Respect `error.statusCode` for known application errors.
- Fall back to `500` for unknown failures.

Response shape:

```json
{
	"success": false,
	"error": {
		"code": "VALIDATION_ERROR",
		"details": []
	},
	"message": "Validation failed"
}
```

Register as last middleware in `src/app.js`:

```js
app.use(errorHandler);
```

## ApiError usage pattern

- Throw/forward `ApiError` from middleware and route handlers for operational errors.
- Keep `errorHandler` + `sendError` as the only response serialization path for errors.
