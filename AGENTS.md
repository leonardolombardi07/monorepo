# AGENTS.md

Frontend monorepo for internal AI apps (web, desktop, mobile, Office add-ins, etc) that share code through `@repo/*` packages.

Apps and packages may have their own `AGENTS.md`. Read it before working in that directory.

This repo's dependencies are often newer than your training data. Check current docs before relying on memory for an API.

## Before you finish

From the repo root, run `pnpm format-and-lint:fix` and `pnpm typecheck`, and fix what they report.

## Where code goes

Put code as close as possible to where it is used, and promote it only when reuse is real. Prefer duplication over the wrong abstraction; but once something is shared, hold it to a very high quality bar and make sure changes in it are accomodated by all code that depends on it.

In an app, from narrowest to widest:

1. The file that uses it.
2. A private folder next to that file.
3. `src/components/` for app-wide components, `src/lib/` for every other module (a `lib` module may export React components when they are not its focus).
4. A `packages/*` package, ONLY once a second app REALLY needs it.

A file that gets too big becomes a folder: `chat-input.tsx` -> `chat-input/index.tsx` plus sibling parts. Don't split early. If the parts start reaching into each other's internals, extract a shared module at the right level.

## Dependencies

- Be economical: add one only for a hard problem with a high-quality library. Stable, generic libraries (React, TanStack, zod, dayjs) can be imported anywhere; wrap less stable ones in a `src/lib/<name>` module and import from there.
- Add it to the package that uses it. Versions shared across packages live in the `catalog` in `pnpm-workspace.yaml` and are referenced as `catalog:`; catalog mode is manual, so `pnpm add` won't do this for you.

## UI

- `@repo/ui` is shadcn on Base UI, not Radix: compose with the `render` prop (`<TooltipTrigger render={<Button />} />`), never `asChild`.
- Add shadcn components with its CLI, run from the app's directory, instead of writing them by hand. Primitives land in `packages/ui`.
- Tailwind v4: there is no `tailwind.config`. Theme tokens live in `packages/ui/src/styles/globals.css`.
- Sweat the UX details. Icon-only controls get an `aria-label` and a `Tooltip` with a clear description. Prefer semantic HTML and the existing primitives.
- Add `data-testid` to key interactive elements, for E2E tests.

## Conventions

- IExplicit code: `function` declarations unless an arrow is needed; `Boolean(user)` over `!!user`, etc. (make it readable)
-  Prefer zod schemas and infer types from them. Keep types simple, but think them through.
- State: `useState` for local state, props between parent and child, Context only for state that truly spans the tree, TanStack Query for server state.
- Names come from context: `agents/header.tsx` exports `Header`, not `AgentsHeader`. Rename on clashes: `import { Header as UIHeader } from "@repo/ui/components/header"`.
- Imports: `@/` (the app's `src`) for stable directories, relative paths for nearby colocated files.
- Comments explain why, not what. ASCII only (`-`, not `—`). `/** */` docblocks on declarations, `/* */` for multiline comments, `//` only for short single lines.

## Tests

No test runner yet. Tests exist to catch regressions and guide refactors: prioritize E2E, unit-test only modules complex enough to benefit, and colocate tests with the code they cover.
