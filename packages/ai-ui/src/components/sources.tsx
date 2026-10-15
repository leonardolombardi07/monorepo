import { type PartState, useAuiState } from "@assistant-ui/react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@repo/ui/components/hover-card";
import { cn } from "cn";
import { FileTextIcon } from "lucide-react";
import { type ComponentProps, createContext, useContext, useMemo } from "react";

/*
 * What a response is based on: web pages, as chips that preview on hover and
 * open in the browser, and documents, which have nothing to open.
 */

const SourceContext = createContext<{ href: string; domain: string } | null>(null);

function useSourceContext() {
  const context = useContext(SourceContext);
  if (!context) throw new Error("Source parts must be used inside <Source>");
  return context;
}

/** `https://www.example.com/page` -> `example.com` */
function getDomain(href: string) {
  try {
    return new URL(href).hostname.replace(/^www\./, "");
  } catch {
    return href;
  }
}

type SourceProps = ComponentProps<typeof HoverCard> & { href: string };

/** A web page, previewed by `SourceContent` when `SourceTrigger` is hovered. */
function Source({ href, ...props }: SourceProps) {
  const value = useMemo(() => ({ href, domain: getDomain(href) }), [href]);
  return (
    <SourceContext value={value}>
      <HoverCard {...props} />
    </SourceContext>
  );
}

type SourceTriggerProps = Omit<ComponentProps<typeof HoverCardTrigger>, "href"> & {
  /** Defaults to the page's domain. */
  label?: string;
};

function SourceTrigger({ label, className, ...props }: SourceTriggerProps) {
  const { href, domain } = useSourceContext();

  return (
    <HoverCardTrigger
      data-slot="source-trigger"
      href={href}
      // Opens in the browser, rather than navigating the app away
      target="_blank"
      rel="noopener noreferrer"
      delay={150}
      closeDelay={0}
      className={cn(
        "inline-flex h-5 max-w-40 items-center rounded-full bg-muted px-2 text-muted-foreground text-xs outline-none transition-colors hover:bg-muted-foreground/20 hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50",
        className,
      )}
      data-testid="source"
      {...props}
    >
      <span className="truncate">{label ?? domain}</span>
    </HoverCardTrigger>
  );
}

type SourceContentProps = Omit<ComponentProps<typeof HoverCardContent>, "title"> & {
  title: string;
  description?: string | undefined;
};

function SourceContent({ title, description, className, ...props }: SourceContentProps) {
  const { href, domain } = useSourceContext();

  return (
    <HoverCardContent className={cn("w-72 p-0", className)} {...props}>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-col gap-1 rounded-lg p-3 outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <span className="truncate text-muted-foreground text-xs">{domain}</span>
        <span className="line-clamp-2 font-medium">{title}</span>
        {description && (
          <span className="line-clamp-2 break-all text-muted-foreground text-xs">
            {description}
          </span>
        )}
      </a>
    </HoverCardContent>
  );
}

/** Styled like `SourceTrigger`, for a source with no page to open. */
function DocumentSource({
  title,
  className,
  ...props
}: ComponentProps<"span"> & { title: string }) {
  return (
    <span
      data-slot="document-source"
      title={title}
      className={cn(
        "inline-flex h-5 max-w-40 items-center gap-1 rounded-full bg-muted px-2 text-muted-foreground text-xs",
        className,
      )}
      data-testid="source"
      {...props}
    >
      <FileTextIcon aria-hidden className="size-3 shrink-0" />
      <span className="truncate">{title}</span>
    </span>
  );
}

function isSource(part: PartState): part is Extract<PartState, { type: "source" }> {
  return part.type === "source";
}

type MessageSourcesProps = ComponentProps<"ul"> & {
  /** Names the list for screen readers. */
  label?: string;
};

/**
 * The message's sources, listed together wherever this is placed, e.g. under
 * the response. Renders nothing for a message without any.
 */
function MessageSources({ label = "Sources", className, ...props }: MessageSourcesProps) {
  const parts = useAuiState((s) => s.message.parts);
  const sources = useMemo(() => parts.filter(isSource), [parts]);
  if (sources.length === 0) return null;

  return (
    <ul
      data-slot="message-sources"
      aria-label={label}
      data-testid="message-sources"
      className={cn("flex flex-wrap gap-1.5", className)}
      {...props}
    >
      {sources.map((source) => (
        <li key={source.id} className="flex">
          {source.sourceType === "url" ? (
            <Source href={source.url}>
              <SourceTrigger />
              <SourceContent
                title={source.title ?? source.url}
                description={source.title ? source.url : undefined}
              />
            </Source>
          ) : (
            <DocumentSource title={source.title} />
          )}
        </li>
      ))}
    </ul>
  );
}

export { DocumentSource, MessageSources, Source, SourceContent, SourceTrigger };
