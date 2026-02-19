# AGENTS.md

This file defines mandatory rules for all coding agents working in this repository.

## 1) Branching policy (strict)

- Always branch from `develop`.
- Never push directly to `main` or `develop`.
- Allowed branch prefixes:
  - `feature/*`
  - `fix/*`
  - `hotfix/*`
  - `test/*`
  - `docs/*`
  - `chore/*`
  - `release/*`

## 2) Commit message policy

Use Conventional Commits:

```text
<type>(<scope>): <description>
```

Examples:
- `feat(middlewares): add request validation middleware`
- `test(middlewares): add integration tests for error flow`
- `docs(api): update error response examples`

## 3) Required quality gates before PR

Every branch must pass all checks locally before opening a PR:

```bash
npm run format
npm run lint
npm run build
npm test -- --run
```

A PR is blocked if any check fails.

## 4) Middleware change policy

If a PR changes files under `src/middlewares/`, it must also include:

1. Tests under `test/middlewares/` covering new/changed behavior.
2. Documentation updates in `docs/` (or README links) describing usage and contracts.

## 5) Scope and safety rules

- Keep PRs focused to one concern.
- Do not perform destructive git operations (`reset --hard`, forced pushes) unless explicitly requested.
- Preserve existing API contracts unless change is documented and justified.

## 6) Definition of done

A task is done only when all are true:

- Code implemented and reviewed.
- Tests added/updated and passing.
- Documentation updated.
- Build/lint/format/test all green.
- Branch pushed and ready for PR.

## 7) Default workflow for agents

1. Read current docs and nearby code before editing.
2. Implement smallest safe change.
3. Add/adjust tests.
4. Run all quality gates.
5. Commit with Conventional Commit message.
6. Push branch and provide PR-ready summary.

## 8) Documentation source-of-truth policy (read files, do not duplicate)

When instructions are needed, prefer reading and following the canonical docs instead of duplicating full guidance inside this file.

### A) Always read from `docs/`

- `docs/README.md` (documentation index + workflow overview)
- `docs/BRANCHING.md` (branching rules)
- `docs/COMMIT_GUIDELINES.md` (Conventional Commits)
- `docs/QUALITY_CHECKS.md` (required local gates)
- `docs/API_GUIDELINES.md` (API contracts)
- `docs/MIDDLEWARE_GUIDE.md` (middleware behavior/contracts)
- `docs/TESTING_GUIDE.md` (testing commands/strategy)
- `docs/TEAM_TASKS_WITH_FILES.md` (current module/task map)
- `docs/TEAM_PLAN_5_DAYS.md` (delivery planning context)

### B) Always read from `project-plan/`

- `project-plan/ARCHITECTURE.md` (implemented architecture and layering)
- `project-plan/ERD.md` (data model)
- `project-plan/TASKS.md` (phase/task breakdown)

### C) Style/commands source files

- `package.json` scripts are the source of truth for runnable commands.
- `biome.json` is the source of truth for formatting/linting/import organization.

If any guidance in this file conflicts with the documents above, follow those documents and update this file to reference them clearly.
