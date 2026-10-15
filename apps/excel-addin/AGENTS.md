# AGENTS.md

AI assistant that runs as an Excel add-in (task pane). Windows Excel desktop is the main target, where the pane runs in WebView2 (Edge).

## Office gotchas

- Office.js is loaded from Microsoft's CDN in `index.html`; there is no npm build. `@types/office-js` only types the `Office`/`Excel` globals.
- Office only loads add-ins over HTTPS. The dev server port (`strictPort` in `vite.config.ts`) must match every URL in `manifest.xml`.
- Code changes hot-reload in the task pane, but Excel caches the manifest: after editing `manifest.xml`, run `pnpm addin:validate`, then `pnpm addin:stop` and `pnpm addin:start`.

## Chat

- The chat is composed from `@repo/ai-ui` building blocks in `src/routes/(authenticated)/new/-thread/`; this app decides the layout, the copy and which parts and actions exist.
- `src/lib/chat` owns the runtime: the transport to the backend's `/chat` (at `VITE_API_URL`, see `.env.example`), which streams AI SDK UI messages, and the AI SDK options.
