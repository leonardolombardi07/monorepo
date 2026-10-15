import { cn } from "cn";
import { marked } from "marked";
import { createContext, memo, useContext, useMemo } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import { CodeBlock, CodeBlockCode } from "./code-block";

/*
 * prompt-kit's Markdown (https://www.prompt-kit.com/docs/markdown). Changes:
 * - block code is told apart from inline code by its `<pre>` parent, not by
 *   its line count, which misread a fence still being streamed
 * - links open in the browser: the window only hands `target="_blank"` links
 *   to the OS, and would navigate away on any other
 * - wide tables scroll instead of overflowing the message
 * - `components` extend the defaults instead of replacing them
 */

export type MarkdownProps = {
  children: string;
  /** Overrides for the default components, merged with them. */
  components?: Partial<Components>;
} & Omit<React.ComponentProps<"div">, "children">;

/** Top-level blocks, so streaming only re-renders the block being written. */
function parseMarkdownIntoBlocks(markdown: string): string[] {
  return marked.lexer(markdown).map((token) => token.raw);
}

/** `language-ts` -> `ts`. Shiki ids can contain symbols, e.g. `c++`. */
function extractLanguage(className?: string): string {
  return className?.match(/language-(\S+)/)?.[1] ?? "plaintext";
}

/** Whether a `code` element is inside a `pre`, i.e. a code block. */
const CodeBlockContext = createContext(false);

function Pre({ children }: React.ComponentProps<"pre">) {
  return <CodeBlockContext value={true}>{children}</CodeBlockContext>;
}

function Code({ className, children }: React.ComponentProps<"code">) {
  const isBlock = useContext(CodeBlockContext);

  if (!isBlock) {
    return (
      <code
        className={cn(
          "rounded-sm bg-muted px-1 py-0.5 font-mono font-normal text-[0.875em]",
          // Typography quotes inline code with backticks
          "before:content-none after:content-none",
          className,
        )}
      >
        {children}
      </code>
    );
  }

  return (
    <CodeBlock className="my-4">
      <CodeBlockCode
        // Markdown ends every code block with a line break
        code={String(children).replace(/\n$/, "")}
        language={extractLanguage(className)}
      />
    </CodeBlock>
  );
}

function Link({ href, children }: React.ComponentProps<"a">) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
}

function Table({ children }: React.ComponentProps<"table">) {
  return (
    <div className="overflow-x-auto">
      <table>{children}</table>
    </div>
  );
}

const DEFAULT_COMPONENTS: Partial<Components> = {
  pre: Pre,
  code: Code,
  a: Link,
  table: Table,
};

const MemoizedMarkdownBlock = memo(
  function MarkdownBlock({
    content,
    components,
  }: {
    content: string;
    components: Partial<Components>;
  }) {
    return (
      <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]} components={components}>
        {content}
      </ReactMarkdown>
    );
  },
  function propsAreEqual(prevProps, nextProps) {
    return prevProps.content === nextProps.content && prevProps.components === nextProps.components;
  },
);

function MarkdownComponent({ children, components, ...props }: MarkdownProps) {
  const blocks = useMemo(() => parseMarkdownIntoBlocks(children), [children]);
  const mergedComponents = useMemo(
    () => (components ? { ...DEFAULT_COMPONENTS, ...components } : DEFAULT_COMPONENTS),
    [components],
  );

  return (
    <div {...props}>
      {blocks.map((block) => (
        // Streaming only changes the last blocks, so earlier ones keep their key
        <MemoizedMarkdownBlock key={`${block}`} content={block} components={mergedComponents} />
      ))}
    </div>
  );
}

const Markdown = memo(MarkdownComponent);

export { Markdown };
