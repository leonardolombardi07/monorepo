# AGENTS.md

Excel Add-In is an AI assistant that runs as an Excel Office Add-In (task pane). Windows Excel desktop is the main target.

## Stack

Check `package.json`. When needed, make sure to search the web to find latest documentation for each package.

## Commands

Check `package.json`.
Run `pnpm typecheck`, `pnpm format` and `pnpm lint` before considering a change done.

## Structure

Paths are relative to `apps/excel-add-in`. `@/` points to `src`.

```
manifest.xml                # Add-in manifest (dev URLs point at https://localhost:300)
index.html                  # Task pane page; loads Office.js from Microsoft's CDN
public/                     # Served as-is
├── commands.html           # Manifest FunctionFile (ribbon commands without UI)
└── assets/icon-*.png       # Ribbon and add-in icons
src/                        # React app (@/)
├── main.tsx                # Entry - mounts the app after Office.onReady
├── -main/                  # Providers used only by main.tsx (Query, Router, Tooltip)
├── routeTree.gen.ts        # Generated - never edit, no need to read
├── assets/                 # CSS and static files
├── components/             # Components scoped to the app
│   ├── ui/                 # design system
│   └── icons.tsx           # Icons for app concepts (Agents, Skills...) - use these
├── routes/                 # TanStack Router routes
└── lib/                    # Every other reusable module
    ├── api/                # Backend integration (types in api/types/)
    ├── hooks/              # General-purpose hooks
    ├── office/             # Office.js helpers (OfficeInfo, waitForOffice)
    ├── internationalization/
    └── utils/              # Very generic helpers
```

## Principles

- **Colocation**: put code as close as possible to where it is used.
- **AHA (Avoid Hasty Abstractions)**: prefer duplication over the wrong abstraction. Abstract once reuse is real (e.g. a `useOpen` hook repeated everywhere), and then hold that code to a very high quality bar.

## Where code goes

Start at the narrowest scope that fits and promote code only when it is actually reused:

1. The route file itself.
2. Route-private folders (the `-` prefix keeps them out of routing): `-route/` for a layout route, `-index/` for an index route.
3. `-shared/` for code reused down a subtree (e.g. by `agents/index.tsx` and `agents/$agentId/index.tsx`).
4. `src/components/` for app-wide components (design system, not found, error states) and component-focused modules
5. `src/lib/` for everything else (if there's a module, e.g. `authorization` that has React components, but it's not its focus, its ok to keep it in `src/lib` - in other words, is not forbidden to export React components from `src/lib`)

```
routes/(authenticated)/agents/
├── route.tsx           # layout route - not agents.tsx
├── index.tsx           # index route - not agents.index.tsx
├── -route/             # used only by route.tsx
├── -index/             # used only by index.tsx
├── -shared/            # shared by index.tsx and $agentId/
└── $agentId/index.tsx
```

**Big files**: split `Component.tsx` into `Component/index.tsx` plus siblings (`Component/Part.tsx`, or `Component/Part/index.tsx` if that part is big too). Don't split early: a component that fits in one file stays `Component.tsx`. If siblings start reaching into each other's internals, extract a shared module at the right level.

**Dependencies**: be very economical. Add one only for a hard problem with a high-quality library. Stable, generic libraries (React, TanStack, dayjs) can be imported anywhere; wrap less stable ones in a `src/lib/<name>` module and import from there.

**API**: keep types in `lib/api/types/`, and colocate TanStack Query hooks and query options with the backend code they call.

## Conventions

- **Types**: no `any` or loose types. Use zod as much as possible - and infer types from it (prefer the `type` than the `interface` keyword). Keep types simple, but think them through.
- **UX**: sweat the details, e.g. wrap icon-only buttons in a `Tooltip` with a clear description.
- **Accessibility**: give icon-only and other non-text controls an `aria-label`. Prefer semantic HTML and the shadcn primitives.
- **i18n**: every user-facing string (including `aria-label`s) goes in `lib/internationalization/messages/<locale>.json`, added to every locale, and is rendered with `m.key()` from `@/lib/internationalization`. Route pathnames are not translated.
- **State**: `useState` for local state, props for parent/child, Context only for state that truly spans the tree, TanStack Query only for server state.
- **Test IDs**: add `data-testid` to key interactive elements for E2E tests.
- **Explicit code**: `Boolean(user)` over `!!user`; `function` declarations over arrow functions unless an arrow is needed. etc.
- **Exports**: named exports only, no `export default` (except where a tool requires it, e.g. config files). Named exports nudge coherence on the imports.
- **Imports**: `@/` for stable directories (`@/lib/...`, `@/components/...`); relative paths for nearby colocated files. Rename on clashes: `import { Header as UIHeader } from '@/components/ui/header'`.
- **Naming**: name by context. `agents/-index/Header.tsx` exports `Header`, not `AgentsHeader`.
- **File names**: Route files follow TanStack conventions. Elsewhere, use kebab-case (Linux is case sensitivity, so this is safer)
- **Comments**: explain why, not what. ASCII only (`-`, not `—`). Use `/** */` docblocks on declarations (types, members, functions, variables), `/* */` for any multiline comment, and `//` only for short single lines.

## Gotchas

- Never edit generated files: `routeTree.gen.ts` and `lib/internationalization/paraglide/`.
- shadcn here is built on Base UI: compose with the `render` prop (`<DropdownMenuTrigger render={<SidebarMenuButton />}>`), not Radix's `asChild`.
- Tailwind v4 has no `tailwind.config`; theme tokens live in `assets/main.css`.
- Office.js is loaded from Microsoft's CDN in `index.html` (there is no npm build); `@types/office-js` only provides the `Office`/`Excel` globals' types.
- Call Excel APIs only inside `Excel.run(...)`, and only after `Office.onReady` (the app mounts after it). Load properties with `.load()` and `await context.sync()` before reading them.
- Office only loads add-ins over HTTPS. The dev server uses `office-addin-dev-certs`, and its port (3000, `strictPort`) must match every URL in `manifest.xml`.
- Code changes hot-reload in the task pane; `manifest.xml` changes need `pnpm stop` + `pnpm start` because Excel caches the manifest.
- The router uses memory history: the task pane has no URL bar, and Office.js replaces `history.pushState`/`replaceState` in some hosts. Don't switch to browser or hash history.
- Where the add-in runs (`host`, `platform`) is in the router context as `office`; read it with `Route.useRouteContext()` instead of calling `Office.onReady` again.
- The task pane runs in WebView2 (Edge). Right-click inside it -> Inspect to open DevTools.

## Testing

No test runner is set up yet. Tests are a verification system to catch regressions and guide refactors: prioritize E2E, unit-test only modules complex enough to benefit, and colocate tests with the code they cover.
