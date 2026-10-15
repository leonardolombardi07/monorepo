# AGENTS.md

Building blocks for AI chat and agent UIs, shared by every app (Excel and other Office add-ins, web, desktop). They style [assistant-ui](https://www.assistant-ui.com/docs)'s headless primitives (`@assistant-ui/react`) with `@repo/ui` (shadcn on Base UI).

## UI only

The blocks own how chat looks and behaves for the user: layout, styles, accessibility, small interactions (copy, collapse, paste). Everything else belongs to the apps, which compose the blocks into their own thread:

- the runtime and its transport (endpoints, auth, request body, AI SDK options), attachment adapters, persistence and thread lists;
- the tools and their logic, the models and settings to pick from, and where they come from;
- routing, translations and copy.

If a block needs data, it takes it as props or reads it from assistant-ui's state (`useAuiState`), never from an API.

## Composing

- A block wraps one primitive, or one visual unit, and passes its props through (`className`, `render`, events, `data-*`). Prefer a new block to a new prop, and a prop to a variant of a whole thread.
- Use primitives that render no DOM straight from `@assistant-ui/react` in apps (`MessagePrimitive.Parts`, `ThreadPrimitive.Messages`, `AuiIf`); don't wrap them here.
- Slots of `MessagePrimitive.Parts` are named `*Part` (`ReasoningPart`, `ToolCallPart`). Each composes the pure pieces of its file (`Reasoning`, `ReasoningTrigger`...), which apps recompose for their own needs, e.g. a tool's own UI made of `ToolCall*` and registered under `tools.by_name`.
- Visible text has an English default and a prop to replace it (`tooltip`, `label`, `statusLabel`...), so apps can translate it.
- Compose with `render` (Base UI and assistant-ui primitives both take it), never `asChild`.

## Styles

- Apps import `@repo/ai-ui/styles.css` after `@repo/ui/globals.css`. It makes Tailwind scan this package, and holds the CSS that can't be utilities (keyframes, Shiki's dark theme).
- Sizes inside messages are relative (`em`), so blocks follow the font size the app sets, e.g. `text-sm` on the thread.
- Shiki loads on first use, in its own chunk, on its JavaScript regex engine (strict CSPs block the WebAssembly one).

## The Markdown input

`MarkdownTextarea` (and `ComposerInput`, built on it) highlights Markdown as it's typed, over a transparent native textarea that keeps every native and assistant-ui behavior. Its value is the Markdown itself, so there is nothing to serialize. The mirror that draws the highlights must lay text out exactly like the textarea:

- no style in the mirror may change glyph widths: no font weight, size or family changes, no horizontal padding or margins (fake them with `text-shadow` and `box-shadow`);
- font, line height and padding are set on the wrapper, which both layers share;
- check alignment by making the textarea's text visible, e.g. `color: red`, over the mirror.

## Adding blocks

- shadcn primitives go to `packages/ui`, through its CLI run from an app's directory.
- assistant-ui's registry (`https://r.assistant-ui.com/styles/base-nova/<name>.json`) is a good reference for new blocks: port what you need, keep only the UI, and follow these conventions.
