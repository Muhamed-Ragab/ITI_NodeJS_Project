# Project documentation

This folder contains the canonical, global documentation for the project.

- `BRANCHING.md` — Branching strategy and enforcement (pre-push hook). ✅
- `COMMIT_GUIDELINES.md` — Conventional commit rules.
- `API_GUIDELINES.md` — API endpoints, validation & response shapes.
- `MIDDLEWARE_GUIDE.md` — Validation/auth/error middleware behavior and contracts.
- `TESTING_GUIDE.md` — Unit/integration testing strategy and commands.
- `QUALITY_CHECKS.md` — Pre-PR build/lint/format/test quality gates.

Developer utilities

- Git helpers:
  - `npm run git:ensure-branch` — validate current branch name before pushing; use `--create` to auto-create a suggested branch.
  - `npm run git:finish-branch` — merge topic branch into `develop` (or `--base=main`) and delete the remote branch (interactive; use `--yes` to skip prompt).

Branch protection rules

- Do not push directly to `main` or `develop`. Use topic branches with the allowed prefixes (see `BRANCHING.md`).

Where to look next

- CONTRIBUTING and README in the repo root for onboarding steps.
