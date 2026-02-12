# Testing Guide

## Commands

- Run all tests once:

```bash
npm test -- --run
```

- Coverage:

```bash
npm run test:coverage
```

## Middleware test strategy

Middleware tests live in `test/middlewares/` and are split into:

1. **Unit tests**
   - `validate.middleware.test.js`
   - `error.middleware.test.js`

2. **Integration tests**
   - `middleware.integration.test.js`
   - Uses a minimal Express app to test middleware chaining and HTTP responses.

### Covered scenarios

- Validation success and payload normalization.
- Validation failure mapping to standard error envelope.
- Known application error mapping through global error middleware.
- Happy-path response for valid payloads.
