# Project documentation

This folder contains the canonical, global documentation for the project.

- `BRANCHING.md` — Branching strategy and enforcement rules.
- `COMMIT_GUIDELINES.md` — Conventional commit rules.
- `API_GUIDELINES.md` — API endpoints, validation & response shapes.
- `MIDDLEWARE_GUIDE.md` — Validation/auth/error middleware behavior and contracts.
- `TESTING_GUIDE.md` — Unit/integration testing strategy and commands.
- `QUALITY_CHECKS.md` — Pre-PR build/lint/format/test quality gates.
- `TASKS_CHANGELOG.md` — phase-by-phase implementation summary and delivery log.
- `demo-walkthrough.md` — end-to-end demo script for customer/seller/admin flows.
- `presentation/README.md` — final presentation outline and speaker notes.

## Coding style (source of truth)

- Formatter + linter: **Biome** (`biome.json`) with Ultracite base config.
- JavaScript style enforced by config:
  - double quotes
  - tab indentation
  - import organization enabled (`assist/source/organizeImports`)
- Practical code conventions used across `src/`:
  - ESM imports/exports only.
  - Controller-Service-Repository separation.
  - Validation via `validate(...)` middleware + Zod schemas.
  - Operational errors via `ApiError`; centralized serialization in `errorHandler`.

## Recurring developer workflow

Use this flow for every code change:

1. Create a topic branch from `develop` using allowed prefixes (`feature/*`, `fix/*`, `docs/*`, ...).
2. Implement a focused change (single concern per PR).
3. Update tests and docs when behavior/contracts change.
4. Run local quality gates:

   ```bash
   npm run format
   npm run lint
   npm run build
   npm test -- --run
   ```

5. Commit using Conventional Commits:

   ```text
   <type>(<scope>): <description>
   ```

6. Push branch and open PR into `develop`.

Branch protection rules

- Do not push directly to `main` or `develop`. Use topic branches with the allowed prefixes (see `BRANCHING.md`).

Where to look next

- CONTRIBUTING and README in the repo root for onboarding steps.
