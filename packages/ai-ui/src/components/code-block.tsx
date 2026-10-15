import { cn } from "cn";
import { CheckIcon, CopyIcon } from "lucide-react";
import { type ComponentProps, useEffect, useState } from "react";
import type { BundledLanguage, Highlighter } from "shiki";
import { TooltipIconButton } from "./tooltip-icon-button";

/*
 * Code, highlighted with Shiki. The highlighter loads on first use, and each
 * language when it is first needed, so the plain code shows until then.
 *
 * Shiki runs on its JavaScript regex engine: the default one compiles
 * WebAssembly, which strict Content Security Policies block.
 */

/** Both themes are rendered; `styles.css` shows the dark one in dark mode. */
const THEMES = { light: "github-light", dark: "github-dark" } as const;

let highlighter: Promise<Highlighter> | undefined;

/** Loads Shiki on first use, in its own chunk, so apps only download it once code shows up. */
function getHighlighter() {
  highlighter ??= import("shiki").then(({ createHighlighter, createJavaScriptRegexEngine }) =>
    createHighlighter({
      themes: Object.values(THEMES),
      langs: [],
      // Skips the few patterns JavaScript can't run, instead of failing the language
      engine: createJavaScriptRegexEngine({ forgiving: true }),
    }),
  );
  return highlighter;
}

function isBundledLanguage(
  language: string,
  languages: Record<BundledLanguage, unknown>,
): language is BundledLanguage {
  return Object.hasOwn(languages, language);
}

async function highlight(code: string, language: string) {
  const [instance, { bundledLanguages }] = await Promise.all([getHighlighter(), import("shiki")]);
  const lang = language.toLowerCase();
  if (!isBundledLanguage(lang, bundledLanguages)) {
    return instance.codeToHtml(code, { lang: "text", themes: THEMES });
  }

  if (!instance.getLoadedLanguages().includes(lang)) await instance.loadLanguage(lang);
  return instance.codeToHtml(code, { lang, themes: THEMES });
}

/** The highlighted HTML, or `undefined` until it's ready (or if highlighting failed). */
function useHighlightedHtml(code: string, language: string) {
  const [result, setResult] = useState<{ code: string; language: string; html: string }>();

  useEffect(() => {
    let isStale = false;
    highlight(code, language).then(
      (html) => {
        if (!isStale) setResult({ code, language, html });
      },
      () => {
        if (!isStale) setResult(undefined);
      },
    );
    return () => {
      isStale = true;
    };
  }, [code, language]);

  // A highlight of earlier code would hide what was streamed since
  return result?.code === code && result.language === language ? result.html : undefined;
}

/** A header and its code, as one card. */
function CodeBlock({ className, ...props }: ComponentProps<"div">) {
  return <div data-slot="code-block" className={cn("flex flex-col", className)} {...props} />;
}

type CodeBlockHeaderProps = ComponentProps<"div"> & {
  language: string | undefined;
  code: string;
  copyTooltip?: string;
  copiedTooltip?: string;
};

/** Names the language, and copies the code. Rounds the top of the card. */
function CodeBlockHeader({
  language,
  code,
  copyTooltip = "Copy code",
  copiedTooltip = "Copied",
  className,
  ...props
}: CodeBlockHeaderProps) {
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (!isCopied) return;
    const timeout = setTimeout(() => setIsCopied(false), 2000);
    return () => clearTimeout(timeout);
  }, [isCopied]);

  function copy() {
    // Stays as it was when the clipboard is unavailable, e.g. blocked by the host
    navigator.clipboard.writeText(code).then(
      () => setIsCopied(true),
      () => undefined,
    );
  }

  return (
    <div
      data-slot="code-block-header"
      className={cn(
        "flex items-center justify-between gap-2 rounded-t-lg border border-b-0 bg-muted/50 py-0.5 pr-0.5 pl-3 text-muted-foreground text-xs",
        className,
      )}
      {...props}
    >
      <span className="truncate lowercase">{language}</span>
      <TooltipIconButton
        tooltip={isCopied ? copiedTooltip : copyTooltip}
        size="icon-xs"
        onClick={copy}
        data-testid="code-block-copy"
      >
        {isCopied ? <CheckIcon /> : <CopyIcon />}
      </TooltipIconButton>
    </div>
  );
}

type CodeBlockCodeProps = Omit<ComponentProps<"div">, "children"> & {
  code: string;
  /** A Shiki language id or alias, e.g. `ts` or `python`. Unknown ones show as plain text. */
  language: string;
};

/** The highlighted code. Rounds the bottom of the card. */
function CodeBlockCode({ code, language, className, ...props }: CodeBlockCodeProps) {
  const html = useHighlightedHtml(code, language);
  const classNames = cn(
    "overflow-x-auto rounded-b-lg border bg-card font-mono text-[0.8125rem] leading-relaxed",
    // Shiki inlines its theme's background; the card's shows instead
    "[&_pre]:bg-transparent! [&_pre]:px-3 [&_pre]:py-2.5",
    className,
  );

  if (html === undefined) {
    return (
      <div data-slot="code-block-code" className={classNames} {...props}>
        <pre>
          <code>{code}</code>
        </pre>
      </div>
    );
  }

  return (
    <div
      data-slot="code-block-code"
      className={classNames}
      // Shiki escapes the code it highlights
      // biome-ignore lint/security/noDangerouslySetInnerHtml: see above
      dangerouslySetInnerHTML={{ __html: html }}
      {...props}
    />
  );
}

export { CodeBlock, CodeBlockCode, CodeBlockHeader };
