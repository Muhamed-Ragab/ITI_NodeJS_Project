# Quality Checks

Run the following commands before creating a PR:

```bash
npm run format
npm run lint
npm run build
npm test -- --run
```

## What each check validates

- `format`: writes canonical formatting on source files.
- `lint`: static checks using Biome.
- `build`: verifies server bundling using esbuild.
- `test`: validates unit + integration behavior.

## Suggested CI gate

A branch is PR-ready only when all four commands pass.
