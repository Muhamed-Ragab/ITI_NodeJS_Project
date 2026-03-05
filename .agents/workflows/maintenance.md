---
description: Unified Project Maintenance Workflow
---

# Project Maintenance

This workflow ensures both NodeJS and Angular projects are clean, formatted, and linted.

## Steps

1. **Check NodeJS Project**
   - Run `npx @biomejs/biome check --write .`
   - Run `npx prettier --write .`

2. **Check Angular Project**
   - Run `npm run lint`
   - Run `npm run format`

3. **Verify Git Status**
   - Check `git status` in both repositories.

4. **Summarize Changes**
   - Document any fixes made during maintenance.
