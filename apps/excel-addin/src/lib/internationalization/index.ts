import { defineCustomClientStrategy, locales } from "./paraglide/runtime.js";

/*
 * The app's translations, with Paraglide. Everything lives in this folder:
 * - `project.inlang/`: the project's settings, and the compiler's in `paraglide.config.ts`
 * - `messages/`: the messages, one JSON file per locale
 * - `paraglide/`: the compiled messages and runtime, generated and ignored by git
 *
 * The rest of the app imports from this file only. Shared packages
 * (`@repo/ui`) don't translate: the app passes them its
 * strings as props, as in Paraglide's monorepo guide, so each app keeps its
 * own locales and strategy.
 */

/** Office's display language, as one of ours: `pt-PT` matches `pt-BR`, `en-GB` matches `en`. */
function getOfficeLocale() {
  if (typeof Office === "undefined") return undefined;
  const language = Office.context?.displayLanguage;
  if (!language) return undefined;

  const exact = locales.find((locale) => locale.toLowerCase() === language.toLowerCase());
  if (exact) return exact;
  const base = language.split("-")[0]?.toLowerCase();
  return locales.find((locale) => locale.split("-")[0]?.toLowerCase() === base);
}

// Registered on import, before the first message is rendered
defineCustomClientStrategy("custom-office", {
  getLocale: getOfficeLocale,
  // Office's language is changed in Office; a choice made here goes to localStorage
  setLocale: () => undefined,
});

export { m } from "./paraglide/messages.js";
export { getLocale, type Locale, locales, setLocale } from "./paraglide/runtime.js";
