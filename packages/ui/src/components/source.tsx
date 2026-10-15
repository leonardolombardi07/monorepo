import { cn } from "cn";
import { createContext, useContext } from "react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./hover-card";

/*
 * prompt-kit's Source (https://www.prompt-kit.com/docs/source), ported to
 * Base UI's PreviewCard, whose trigger is the link itself. The favicons are
 * gone: they came from Google, which the app's CSP doesn't allow images from.
 * Links open in the browser through `target="_blank"`, as in Markdown.
 */

const SourceContext = createContext<{
  href: string;
  domain: string;
} | null>(null);

function useSourceContext() {
  const context = useContext(SourceContext);
  if (!context) throw new Error("Source.* must be used inside <Source>");
  return context;
}

/** `https://www.example.com/page` -> `example.com`. */
function getDomain(href: string) {
  try {
    return new URL(href).hostname.replace(/^www\./, "");
  } catch {
    return href.split("/").pop() || href;
  }
}

export type SourceProps = {
  href: string;
  children: React.ReactNode;
};

function Source({ href, children }: SourceProps) {
  return (
    <SourceContext value={{ href, domain: getDomain(href) }}>
      <HoverCard>{children}</HoverCard>
    </SourceContext>
  );
}

export type SourceTriggerProps = {
  /** Defaults to the domain. */
  label?: string | number;
  className?: string;
};

function SourceTrigger({ label, className }: SourceTriggerProps) {
  const { href, domain } = useSourceContext();

  return (
    <HoverCardTrigger
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      delay={150}
      closeDelay={0}
      className={cn(
        "inline-flex h-5 max-w-32 items-center gap-1 overflow-hidden rounded-full bg-muted px-1.5 py-0 text-muted-foreground text-xs no-underline outline-none transition-colors duration-150 hover:bg-muted-foreground/30 hover:text-primary focus-visible:ring-3 focus-visible:ring-ring/50",
        className,
      )}
    >
      <span className="truncate text-center font-normal tabular-nums">{label ?? domain}</span>
    </HoverCardTrigger>
  );
}

export type SourceContentProps = {
  title: string;
  description?: string;
  className?: string;
};

function SourceContent({ title, description, className }: SourceContentProps) {
  const { href, domain } = useSourceContext();

  return (
    <HoverCardContent className={cn("w-80 p-0 shadow-xs", className)}>
      <a href={href} target="_blank" rel="noopener noreferrer" className="flex flex-col gap-2 p-3">
        <div className="truncate text-primary text-sm">{domain}</div>
        <div className="line-clamp-2 font-medium text-sm">{title}</div>
        {description && (
          <div className="line-clamp-2 break-all text-muted-foreground text-sm">{description}</div>
        )}
      </a>
    </HoverCardContent>
  );
}

export { Source, SourceContent, SourceTrigger };
