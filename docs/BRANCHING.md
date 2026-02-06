Branching strategy (moved from repository root)

Goal

- Keep `main` stable and release-ready.
- Use `develop` as the integration branch for feature work.

Flow

1. Create feature/fix branches from `develop` (naming: `feature/desc`, `fix/desc`).
2. Open PRs from feature branches -> `develop` for review and CI.
3. When `develop` is ready, open a PR from `develop` -> `main` (release). Do not open feature -> main PRs.

Rules / naming

- Feature branches: `feature/*`
- Bugfix branches: `fix/*` or `hotfix/*`
- Release branches: `release/*`
- Chores/docs: `chore/*`, `docs/*`

Enforcement

- A local Husky `pre-push` hook prevents pushes from protected or incorrectly-named branches.
- Use `npm run git:ensure-branch` to validate or auto-create a conforming branch.

Why

- Keeps history readable and safer releases via `develop` testing and integration.
