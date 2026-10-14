# AGENTS.md

AI assistant that runs as an Excel add-in (task pane). Windows Excel desktop is the main target, where the pane runs in WebView2 (Edge).

## Office gotchas

- Office.js is loaded from Microsoft's CDN in `index.html`; there is no npm build. `@types/office-js` only types the `Office`/`Excel` globals.
- Office only loads add-ins over HTTPS. The dev server port (`strictPort` in `vite.config.ts`) must match every URL in `manifest.xml`.
- Code changes hot-reload in the task pane, but Excel caches the manifest: after editing `manifest.xml`, run `pnpm addin:validate`, then `pnpm addin:stop` and `pnpm addin:start`.
