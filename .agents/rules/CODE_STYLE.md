# NodeJS Project Code Style

## General Principles
- **DRY**: Don't Repeat Yourself.
- **Explicit over Clever**: Prefer readable code.
- **Functional & Maintainable**: Use clean architectures and modular designs.

## TypeScript/JavaScript
- Use Biome for linting and formatting.
- Follow ES6+ best practices.
- Use meaningful variable and function names.

## Project Specifics
- Modules should be organized by feature (e.g., `src/modules/users`).
- Use `ApiError` for structured error handling.
- Controllers should handle requests/responses and call service layer.
- Services should contain business logic.
- Repositories should handle database interactions.
