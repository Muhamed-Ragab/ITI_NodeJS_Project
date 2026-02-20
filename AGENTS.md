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
- `docs/AGENT_REVIEW_PROTOCOL.md` (global interactive review protocol and preferences)

### B) Always read from `project-plan/`

- `project-plan/ARCHITECTURE.md` (implemented architecture and layering)
- `project-plan/ERD.md` (data model)
- `project-plan/TASKS.md` (phase/task breakdown)

### C) Style/commands source files

- `package.json` scripts are the source of truth for runnable commands.
- `biome.json` is the source of truth for formatting/linting/import organization.

If any guidance in this file conflicts with the documents above, follow those documents and update this file to reference them clearly.

## 9) Mandatory review interaction protocol (before code changes)

Review the plan thoroughly before making any code changes. For every issue or recommendation:

- Explain concrete tradeoffs.
- Give an opinionated recommendation.
- Ask for user input before assuming a direction.

### Engineering preferences to prioritize

- DRY is important — flag repetition aggressively.
- Well-tested code is non-negotiable; prefer too many tests over too few.
- Aim for "engineered enough" solutions: avoid fragile hacks and avoid premature abstraction.
- Prefer handling more edge cases, not fewer; thoughtfulness over speed.
- Bias toward explicit over clever.

### Required review sections

#### 1) Architecture review

Evaluate:
- Overall system design and component boundaries.
- Dependency graph and coupling concerns.
- Data flow patterns and potential bottlenecks.
- Scaling characteristics and single points of failure.
- Security architecture (auth, data access, API boundaries).

#### 2) Code quality review

Evaluate:
- Code organization and module structure.
- DRY violations (aggressively).
- Error handling patterns and missing edge cases (call out explicitly).
- Technical debt hotspots.
- Over-engineered or under-engineered areas relative to preferences.

#### 3) Test review

Evaluate:
- Test coverage gaps (unit, integration, e2e).
- Test quality and assertion strength.
- Missing edge-case coverage (be thorough).
- Untested failure modes and error paths.

#### 4) Performance review

Evaluate:
- N+1 queries and database access patterns.
- Memory-usage concerns.
- Caching opportunities.
- Slow or high-complexity code paths.

### For each issue found

For every bug, smell, design concern, or risk:
- Describe the problem concretely, with file and line references.
- Present 2–3 options, including "do nothing" where reasonable.
- For each option, specify:
  - implementation effort,
  - risk,
  - impact on other code,
  - maintenance burden.
- Provide a recommended option and why, mapped to the preferences above.
- Explicitly ask whether the user agrees or wants a different direction before proceeding.

### Workflow and interaction constraints

- Do not assume priorities for timeline or scale.
- After each section, pause and ask for feedback before moving on.

### Before starting any review

Ask the user to choose one mode:
1. **BIG CHANGE**: Interactive, one section at a time (Architecture → Code Quality → Tests → Performance), with at most 4 top issues per section.
2. **SMALL CHANGE**: Interactive, one question per review section.

### Output format rules per review stage

- For each stage, output explanation plus pros/cons of each stage question.
- Provide an opinionated recommendation and rationale.
- Number issues (Issue 1, Issue 2, ...).
- Label options by letters (A, B, C, ...).
- In user questions, clearly include issue number + option letter.
- Always list the recommended option first.
