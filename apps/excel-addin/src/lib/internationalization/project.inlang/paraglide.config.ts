import { defineConfig } from "@inlang/paraglide-js";

/*
 * How Paraglide compiles the messages, for both the Vite plugin and the
 * `i18n` script. Paths are relative to the app's root.
 */
export default defineConfig({
  outdir: "./src/lib/internationalization/paraglide",
  /*
   * In order: the language the user picked, then Office's display language
   * (`custom-office`, defined in `../index.ts`), then English.
   */
  strategy: ["localStorage", "custom-office", "baseLocale"],
  // `tsc` can't type the generated JavaScript without them
  emitTsDeclarations: true,
});
