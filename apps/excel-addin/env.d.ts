/// <reference types="vite/client" />

/*
 * Types this app's `import.meta.env`. Declaration merging only works with
 * interfaces, hence the exceptions to the `type` rule.
 */

// biome-ignore lint/style/useConsistentTypeDefinitions: merges into Vite's `ImportMetaEnv`
interface ImportMetaEnv {
  /** Temporary, for local development only: see `.env.example`. */
  readonly VITE_OPENROUTER_API_KEY?: string;
  /** OpenRouter model id, see `.env.example`. */
  readonly VITE_OPENROUTER_MODEL?: string;
}

// biome-ignore lint/style/useConsistentTypeDefinitions: merges into Vite's `ImportMeta`
interface ImportMeta {
  readonly env: ImportMetaEnv;
}

