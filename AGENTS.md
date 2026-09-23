# MealPrep Planner

- Use strict TypeScript, React, Next.js and Tailwind. UI in Dutch; identifiers in English.
- Phase 1 is local-only. No authentication, cloud persistence, tracking, nutrition APIs or AI APIs.
- Keep business calculations pure in `calculations/`; domain models in `domain/`; persistence behind `StorageRepository` in `services/`.
- Calculate nutrition from raw/dry/drained ingredients. Never substitute cooked grain weight into nutrition formulas.
- Keep ingredient overrides separate from seeds. Preserve vegetables, sauce and bounds when scaling recipes.
- Run `npm test`, `npm run typecheck` and `npm run build` for changes to logic or behavior. Inspect key screens for UI changes.
- Keep the beginner README and static GitHub Pages deployment current.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
