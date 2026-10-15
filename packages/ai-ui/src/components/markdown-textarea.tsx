import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cn } from "cn";
import {
  type ComponentProps,
  type ReactElement,
  type ReactNode,
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";

/*
 * A textarea that highlights the Markdown typed into it: `**bold**` looks
 * bold, `# ` starts a heading, `` `code` `` looks like code, and the syntax
 * itself is dimmed. The value stays the Markdown the user typed, so there is
 * nothing to serialize, and the textarea keeps every native behavior
 * (undo, IME, spellcheck, autosize, assistant-ui's keyboard handling).
 *
 * The textarea's text is transparent, over a mirror of it that carries the
 * styles. Both must lay the text out identically, so the mirror never changes
 * glyph widths: bold is drawn with a text shadow rather than a heavier weight,
 * code keeps the font, and its box comes from a shadow rather than padding.
 * Italics rely on the font having no italic face, so the browser slants the
 * regular one (the theme only loads Geist's upright face).
 */

/** Past this, the mirror shows plain text: highlighting a huge paste on every keystroke would lag. */
const MAX_HIGHLIGHTED_LENGTH = 20_000;

const STYLES = {
  syntax: "text-muted-foreground",
  strong: "[text-shadow:0.45px_0_0_currentColor]",
  emphasis: "italic",
  strikethrough: "line-through decoration-muted-foreground",
  code: "rounded-[3px] bg-muted shadow-[0_0_0_1.5px_var(--color-muted)]",
  codeBlock: "bg-muted/60",
  link: "text-primary underline decoration-primary/30 underline-offset-2",
  quote: "text-muted-foreground",
} as const;

type Segment = { text: string; className?: string };

type InlineRule = {
  /** Sticky (`y`), so it only matches where the scan is. */
  pattern: RegExp;
  toSegments: (match: RegExpExecArray, className: string) => Segment[];
};

/** Delimiters around content that can hold more Markdown, e.g. `**...**`. */
function delimited(pattern: RegExp, style: string): InlineRule {
  return {
    pattern,
    toSegments: ([, open = "", content = "", close = ""], className) => [
      { text: open, className: cn(className, STYLES.syntax) },
      ...highlightInline(content, cn(className, style)),
      { text: close, className: cn(className, STYLES.syntax) },
    ],
  };
}

const INLINE_RULES: InlineRule[] = [
  {
    // The closing run of backticks is exactly as long as the opening one
    pattern: /(`+)(.+?)(?<!`)(\1)(?!`)/y,
    toSegments: ([, ticks = "", code = ""], className) => [
      { text: ticks, className: cn(className, STYLES.syntax) },
      { text: code, className: cn(className, STYLES.code) },
      { text: ticks, className: cn(className, STYLES.syntax) },
    ],
  },
  delimited(/(\*\*)(?=\S)(.+?)(?<=\S)(\*\*)/y, STYLES.strong),
  // Underscores don't emphasize inside words, e.g. snake_case_names
  delimited(/(?<![\p{L}\p{N}_])(__)(?=\S)(.+?)(?<=\S)(__)(?![\p{L}\p{N}_])/uy, STYLES.strong),
  delimited(/(~~)(?=\S)(.+?)(?<=\S)(~~)/y, STYLES.strikethrough),
  delimited(/(\*)(?=[^\s*])(.+?)(?<=[^\s*])(\*)(?!\*)/y, STYLES.emphasis),
  delimited(
    /(?<![\p{L}\p{N}_])(_)(?=[^\s_])(.+?)(?<=[^\s_])(_)(?![\p{L}\p{N}_])/uy,
    STYLES.emphasis,
  ),
  {
    pattern: /(\[)([^\]\n]+)(\]\([^)\s]*\))/y,
    toSegments: ([, open = "", label = "", target = ""], className) => [
      { text: open, className: cn(className, STYLES.syntax) },
      ...highlightInline(label, cn(className, STYLES.link)),
      { text: target, className: cn(className, STYLES.syntax) },
    ],
  },
  {
    // Bare URLs, minus trailing punctuation that ends the sentence
    pattern: /(?<![\p{L}\p{N}])https?:\/\/[^\s<>]*[^\s<>.,:;!?"')\]}]/uy,
    toSegments: ([url = ""], className) => [{ text: url, className: cn(className, STYLES.link) }],
  },
];

/** Characters an inline rule can start at, so the scan skips the others quickly. */
const INLINE_TRIGGERS = new Set(["`", "*", "_", "~", "[", "h"]);

function highlightInline(text: string, className = ""): Segment[] {
  const segments: Segment[] = [];
  let plainStart = 0;
  let index = 0;

  while (index < text.length) {
    const match = INLINE_TRIGGERS.has(text.charAt(index)) ? matchInline(text, index) : null;
    if (!match) {
      index += 1;
      continue;
    }
    if (index > plainStart) {
      segments.push({ text: text.slice(plainStart, index), className });
    }
    segments.push(...match.rule.toSegments(match.result, className));
    index += match.result[0].length;
    plainStart = index;
  }

  if (plainStart < text.length) segments.push({ text: text.slice(plainStart), className });
  return segments;
}

function matchInline(text: string, index: number) {
  for (const rule of INLINE_RULES) {
    rule.pattern.lastIndex = index;
    const result = rule.pattern.exec(text);
    if (result) return { rule, result };
  }
  return null;
}

const HEADING = /^( {0,3}#{1,6})(?:(\s+)(.*))?$/;
const THEMATIC_BREAK = /^ {0,3}([-*_])(?: *\1){2,} *$/;
const BLOCKQUOTE = /^((?: {0,3}>[ \t]?)+)(.*)$/;
const LIST_ITEM = /^(\s*)([-*+]|\d{1,9}[.)])(\s+)(\[[ xX]\](?=\s))?(.*)$/;
const FENCE = /^ {0,3}(`{3,}|~{3,})/;

function highlightLine(line: string): Segment[] {
  const heading = HEADING.exec(line);
  if (heading) {
    const [, hashes = "", space = "", content = ""] = heading;
    return [
      { text: hashes, className: cn(STYLES.syntax, STYLES.strong) },
      { text: space },
      ...highlightInline(content, STYLES.strong),
    ];
  }

  if (THEMATIC_BREAK.test(line)) return [{ text: line, className: STYLES.syntax }];

  const quote = BLOCKQUOTE.exec(line);
  if (quote) {
    const [, markers = "", content = ""] = quote;
    return [{ text: markers, className: STYLES.syntax }, ...highlightInline(content, STYLES.quote)];
  }

  const item = LIST_ITEM.exec(line);
  if (item) {
    const [, indent = "", marker = "", space = "", task = "", content = ""] = item;
    return [
      { text: indent },
      { text: marker, className: STYLES.syntax },
      { text: space },
      { text: task, className: STYLES.syntax },
      ...highlightInline(content),
    ];
  }

  return highlightInline(line);
}

/** Splits Markdown into styled runs whose text, joined, is exactly the input. */
function highlightMarkdown(markdown: string): Segment[] {
  if (markdown.length > MAX_HIGHLIGHTED_LENGTH) return [{ text: markdown }];

  const segments: Segment[] = [];
  // The fence that opened the code block the scan is in, e.g. "```"
  let openFence: string | null = null;
  const lines = markdown.split("\n");

  for (const [index, line] of lines.entries()) {
    if (index > 0) segments.push({ text: "\n" });

    const fence = FENCE.exec(line)?.[1];
    if (openFence !== null) {
      // A block closes on a fence of the same character, at least as long
      const closes =
        fence?.charAt(0) === openFence.charAt(0) &&
        fence.length >= openFence.length &&
        line.trim() === fence;
      if (closes) openFence = null;
      segments.push({ text: line, className: closes ? STYLES.syntax : STYLES.codeBlock });
    } else if (fence !== undefined) {
      openFence = fence;
      segments.push({ text: line, className: STYLES.syntax });
    } else {
      segments.push(...highlightLine(line));
    }
  }
  return segments;
}

function renderSegments(segments: Segment[]): ReactNode[] {
  return segments.map(({ text, className }, index) =>
    className ? (
      // Segments never move, so their position is a stable key
      // biome-ignore lint/suspicious/noArrayIndexKey: see above
      <span key={index} className={className}>
        {text}
      </span>
    ) : (
      text
    ),
  );
}

/**
 * The wrapper sets the font, line height and padding, which both layers
 * share: the textarea inherits the font (Tailwind's preflight), and neither
 * layer adds padding of its own. Wrapping and whitespace must match too.
 */
const LAYER_CLASS = "m-0 border-0 p-0 whitespace-pre-wrap wrap-break-word [tab-size:4]";

export type MarkdownTextareaProps = Omit<ComponentProps<"textarea">, "className" | "value"> & {
  /** The Markdown, also shown highlighted. */
  value: string;
  /** Classes for the wrapper, whose font size, line height and padding both layers share. */
  className?: string;
  /**
   * Renders another textarea in place of the default one, with these props
   * merged in, e.g. `<ComposerPrimitive.Input />`.
   */
  render?: ReactElement;
};

export function MarkdownTextarea({
  value,
  className,
  render,
  ref,
  ...props
}: MarkdownTextareaProps) {
  const mirrorRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlighted = useMemo(() => renderSegments(highlightMarkdown(value)), [value]);

  // Typing can scroll the textarea before the mirror has the new text
  // biome-ignore lint/correctness/useExhaustiveDependencies: re-syncs whenever the text changes
  useLayoutEffect(() => {
    syncScroll(textareaRef.current, mirrorRef.current);
  }, [value]);

  const textarea = useRender({
    defaultTagName: "textarea",
    render,
    ref: ref ? [ref, textareaRef] : textareaRef,
    props: mergeProps<"textarea">(
      {
        value,
        className: cn(
          LAYER_CLASS,
          "relative block w-full resize-none bg-transparent text-transparent caret-foreground outline-none",
          // Hidden, as the mirror has no scrollbar to take up the same width
          "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          "selection:bg-primary/15 placeholder:text-muted-foreground disabled:cursor-not-allowed",
        ),
        onScroll: (event) => syncScroll(event.currentTarget, mirrorRef.current),
      },
      props,
    ),
  });

  return (
    <div data-slot="markdown-textarea" className={cn("relative text-sm leading-6", className)}>
      <div className="relative">
        <div
          ref={mirrorRef}
          aria-hidden
          className={cn(LAYER_CLASS, "pointer-events-none absolute inset-0 overflow-hidden")}
        >
          {highlighted}
          {/* A textarea shows the line after a final line break; a div needs content to */}
          {value.endsWith("\n") && " "}
        </div>
        {textarea}
      </div>
    </div>
  );
}

function syncScroll(textarea: HTMLTextAreaElement | null, mirror: HTMLDivElement | null) {
  if (textarea && mirror) mirror.scrollTop = textarea.scrollTop;
}
