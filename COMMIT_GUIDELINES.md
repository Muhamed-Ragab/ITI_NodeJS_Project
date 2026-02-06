# Git Commit Guidelines

To maintain a clean and readable history, all team members must follow the **Conventional Commits** specification.

## Format
`<type>(<scope>): <description>`

## Types
- **feat**: A new feature for the user (e.g., `feat(auth): add google oauth flow`)
- **fix**: A bug fix (e.g., `fix(cart): correct item quantity calculation`)
- **docs**: Documentation only changes (e.g., `docs(readme): add setup instructions`)
- **style**: Changes that do not affect the meaning of the code (white-space, formatting, etc)
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **perf**: A code change that improves performance
- **test**: Adding missing tests or correcting existing tests
- **chore**: Changes to the build process or auxiliary tools and libraries

## Rules
1. Use the imperative, present tense: "change" not "changed" nor "changes".
2. Don't capitalize the first letter.
3. No dot (.) at the end.
4. Scope should be the module name (auth, user, product, etc.).

## Branching (short)
- Feature/fix branches must target `develop` (e.g. `feature/xxx`, `fix/yyy`).
- `develop` is the integration branch for features; open PRs from feature branches to `develop`.
- `main` only receives changes via a PR from `develop` (no direct feature -> main merges).
- Branch names should use kebab or slash separators and be prefixed with their type (feature/, fix/, hotfix/, release/, chore/, docs/).
