import { cn } from "cn";
import { useEffect, useState } from "react";
import {
  type BundledLanguage,
  bundledLanguages,
  createHighlighter,
  createJavaScriptRegexEngine,
  type Highlighter,
} from "shiki";

/*
 * prompt-kit's CodeBlock (https://www.prompt-kit.com/docs/code-block). Changes:
 * - Shiki runs on its JavaScript regex engine: the default one compiles
 *   WebAssembly, which the app's CSP blocks
 * - code is highlighted in both themes, and `assets/main.css` shows the dark
 *   one in dark mode, so `theme` is gone
 * - unknown languages fall back to plain text instead of throwing
 * - a highlight that finishes after the code changed is dropped, so streamed
 *   code never shows stale content
 */

const THEMES = { light: "github-light", dark: "github-dark" } as const;

let highlighter: Promise<Highlighter> | undefined;

/** Created on first use, with each language loaded when first needed. */
function getHighlighter() {
  highlighter ??= createHighlighter({
    themes: Object.values(THEMES),
    langs: [],
    // Skips the few patterns JavaScript can't run, instead of failing the language
    engine: createJavaScriptRegexEngine({ forgiving: true }),
  });
  return highlighter;
}

function isBundledLanguage(language: string): language is BundledLanguage {
  return Object.hasOwn(bundledLanguages, language);
}

async function highlight(code: string, language: string) {
  const instance = await getHighlighter();
  const lang = language.toLowerCase();

  if (!isBundledLanguage(lang)) {
    return instance.codeToHtml(code, { lang: "text", themes: THEMES });
  }
  if (!instance.getLoadedLanguages().includes(lang)) {
    await instance.loadLanguage(lang);
  }
  return instance.codeToHtml(code, { lang, themes: THEMES });
}

export type CodeBlockProps = {
  children?: React.ReactNode;
  className?: string;
} & React.HTMLProps<HTMLDivElement>;

function CodeBlock({ children, className, ...props }: CodeBlockProps) {
  return (
    <div
      className={cn(
        "not-prose flex w-full flex-col overflow-clip border",
        "rounded-xl border-border bg-card text-card-foreground",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export type CodeBlockCodeProps = {
  code: string;
  /** A Shiki language id or alias, e.g. `ts` or `c++`. */
  language?: string;
  className?: string;
  // The highlighted HTML is the content
} & Omit<React.HTMLProps<HTMLDivElement>, "children">;

function CodeBlockCode({ code, language = "tsx", className, ...props }: CodeBlockCodeProps) {
  const [highlightedHtml, setHighlightedHtml] = useState<string | null>(null);

  useEffect(() => {
    let isStale = false;
    highlight(code, language).then(
      (html) => {
        if (!isStale) setHighlightedHtml(html);
      },
      // Show the plain code rather than an earlier highlight
      () => {
        if (!isStale) setHighlightedHtml(null);
      },
    );
    return () => {
      isStale = true;
    };
  }, [code, language]);

  const classNames = cn(
    // Shiki inlines its theme's background; the block's own one shows instead
    "w-full overflow-x-auto text-[13px] [&>pre]:bg-transparent! [&>pre]:px-4 [&>pre]:py-4",
    className,
  );

  // Plain code until the highlighter (loaded on demand) is ready
  return highlightedHtml ? (
    // biome-ignore lint/security/noDangerouslySetInnerHtml: This is safe
    <div className={classNames} dangerouslySetInnerHTML={{ __html: highlightedHtml }} {...props} />
  ) : (
    <div className={classNames} {...props}>
      <pre>
        <code>{code}</code>
      </pre>
    </div>
  );
}

export type CodeBlockGroupProps = React.HTMLAttributes<HTMLDivElement>;

function CodeBlockGroup({ children, className, ...props }: CodeBlockGroupProps) {
  return (
    <div className={cn("flex items-center justify-between", className)} {...props}>
      {children}
    </div>
  );
}

export { CodeBlock, CodeBlockCode, CodeBlockGroup };
