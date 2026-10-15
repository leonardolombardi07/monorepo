import {
  type CodeHeaderProps,
  MarkdownTextPrimitive,
  memoizeMarkdownComponents,
  type SyntaxHighlighterProps,
  useIsMarkdownCodeBlock,
} from "@assistant-ui/react-markdown";
import { cn } from "cn";
import remarkGfm from "remark-gfm";
import { CodeBlockCode, CodeBlockHeader } from "./code-block";

/*
 * Element styles for rendered Markdown. Sizes are in `em`, so the text
 * follows the size set around it, e.g. `text-sm` in a narrow task pane.
 */

function CodeHeader({ language, code }: CodeHeaderProps) {
  return <CodeBlockHeader language={language} code={code} className="mt-3 first:mt-0" />;
}

function SyntaxHighlighter({ language, code }: SyntaxHighlighterProps) {
  return <CodeBlockCode language={language} code={code} className="mb-3 last:mb-0" />;
}

const COMPONENTS = memoizeMarkdownComponents({
  h1: ({ className, ...props }) => (
    <h1
      className={cn("mt-5 mb-2 font-semibold text-[1.375em] first:mt-0 last:mb-0", className)}
      {...props}
    />
  ),
  h2: ({ className, ...props }) => (
    <h2
      className={cn("mt-5 mb-2 font-semibold text-[1.2em] first:mt-0 last:mb-0", className)}
      {...props}
    />
  ),
  h3: ({ className, ...props }) => (
    <h3
      className={cn("mt-4 mb-1.5 font-semibold text-[1.075em] first:mt-0 last:mb-0", className)}
      {...props}
    />
  ),
  h4: ({ className, ...props }) => (
    <h4 className={cn("mt-3 mb-1 font-semibold first:mt-0 last:mb-0", className)} {...props} />
  ),
  h5: ({ className, ...props }) => (
    <h5 className={cn("mt-3 mb-1 font-medium first:mt-0 last:mb-0", className)} {...props} />
  ),
  h6: ({ className, ...props }) => (
    <h6
      className={cn("mt-3 mb-1 font-medium text-muted-foreground first:mt-0 last:mb-0", className)}
      {...props}
    />
  ),
  p: ({ className, ...props }) => (
    <p className={cn("my-2.5 leading-relaxed first:mt-0 last:mb-0", className)} {...props} />
  ),
  a: ({ className, ...props }) => (
    // A link opens outside, rather than navigating the app away
    <a
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "font-medium text-primary underline decoration-primary/30 underline-offset-2 hover:decoration-primary",
        className,
      )}
      {...props}
    />
  ),
  strong: ({ className, ...props }) => (
    <strong className={cn("font-semibold", className)} {...props} />
  ),
  blockquote: ({ className, ...props }) => (
    <blockquote
      className={cn("my-2.5 border-l-2 pl-3 text-muted-foreground first:mt-0 last:mb-0", className)}
      {...props}
    />
  ),
  ul: ({ className, ...props }) => (
    <ul
      className={cn(
        "my-2.5 ml-5 list-disc marker:text-muted-foreground first:mt-0 last:mb-0 [&>li]:mt-1",
        className,
      )}
      {...props}
    />
  ),
  ol: ({ className, ...props }) => (
    <ol
      className={cn(
        "my-2.5 ml-5 list-decimal marker:text-muted-foreground first:mt-0 last:mb-0 [&>li]:mt-1",
        className,
      )}
      {...props}
    />
  ),
  li: ({ className, ...props }) => <li className={cn("leading-relaxed", className)} {...props} />,
  hr: ({ className, ...props }) => <hr className={cn("my-4", className)} {...props} />,
  table: ({ className, ...props }) => (
    // Wide tables scroll instead of overflowing the message
    <div className="my-2.5 overflow-x-auto first:mt-0 last:mb-0">
      <table
        className={cn("w-full border-separate border-spacing-0 text-[0.925em]", className)}
        {...props}
      />
    </div>
  ),
  th: ({ className, ...props }) => (
    <th
      className={cn(
        "border-y border-l bg-muted px-2.5 py-1.5 text-left font-medium first:rounded-tl-lg last:rounded-tr-lg last:border-r [[align=center]]:text-center [[align=right]]:text-right",
        className,
      )}
      {...props}
    />
  ),
  td: ({ className, ...props }) => (
    <td
      className={cn(
        "border-b border-l px-2.5 py-1.5 text-left last:border-r [[align=center]]:text-center [[align=right]]:text-right",
        className,
      )}
      {...props}
    />
  ),
  tr: ({ className, ...props }) => (
    <tr
      className={cn(
        "[&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg",
        className,
      )}
      {...props}
    />
  ),
  pre: ({ className, ...props }) => (
    <pre
      className={cn(
        "my-2.5 overflow-x-auto rounded-lg border bg-card px-3 py-2.5 font-mono text-[0.8125rem]",
        className,
      )}
      {...props}
    />
  ),
  code: function Code({ className, ...props }) {
    const isCodeBlock = useIsMarkdownCodeBlock();
    return (
      <code
        className={cn(
          // Tinted rather than `bg-muted`, so it shows in a user's bubble too
          !isCodeBlock && "rounded-sm bg-foreground/6 px-1 py-0.5 font-mono text-[0.875em]",
          className,
        )}
        {...props}
      />
    );
  },
  CodeHeader,
  SyntaxHighlighter,
});

const REMARK_PLUGINS = [remarkGfm];

/**
 * `MessagePrimitive.Parts`' `Text` slot: the part's Markdown, revealed
 * smoothly as it streams. Also renders a reasoning part's text.
 */
function MarkdownText() {
  return (
    <MarkdownTextPrimitive
      remarkPlugins={REMARK_PLUGINS}
      components={COMPONENTS}
      // `aui-md` places the streaming dot from `styles.css`
      className="aui-md wrap-break-word min-w-0"
      // Parsing waits for typing and scrolling, which stay responsive on long replies
      defer
    />
  );
}

export { MarkdownText };
