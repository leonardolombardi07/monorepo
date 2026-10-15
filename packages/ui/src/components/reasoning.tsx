import { cn } from "cn";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./collapsible";
import { Markdown } from "./markdown";

/*
 * prompt-kit's Reasoning (https://www.prompt-kit.com/docs/reasoning), built on
 * Base UI's Collapsible, which wires up the trigger's ARIA attributes and
 * animates the panel's height while it keeps growing with the stream. Like the
 * original, it opens while streaming and closes once done, but the open state
 * is derived instead of synced in an effect, and the user's choice wins.
 */

export type ReasoningProps = {
  children: React.ReactNode;
  className?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Keeps it open until streaming ends, unless the user toggles it. */
  isStreaming?: boolean;
};

function Reasoning({
  children,
  className,
  open,
  onOpenChange,
  isStreaming = false,
}: ReasoningProps) {
  const [internalOpen, setInternalOpen] = useState<boolean>();

  function handleOpenChange(nextOpen: boolean) {
    setInternalOpen(nextOpen);
    onOpenChange?.(nextOpen);
  }

  return (
    <Collapsible
      open={open ?? internalOpen ?? isStreaming}
      onOpenChange={handleOpenChange}
      className={className}
    >
      {children}
    </Collapsible>
  );
}

export type ReasoningTriggerProps = React.ComponentProps<typeof CollapsibleTrigger>;

function ReasoningTrigger({ children, className, ...props }: ReasoningTriggerProps) {
  return (
    <CollapsibleTrigger
      className={cn(
        "group/reasoning-trigger flex cursor-pointer items-center gap-2 rounded-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        className,
      )}
      {...props}
    >
      {children}
      <ChevronDown className="size-4 transition-transform group-data-panel-open/reasoning-trigger:rotate-180" />
    </CollapsibleTrigger>
  );
}

export type ReasoningContentProps = {
  className?: string;
  /** Classes for the content inside the animated panel. */
  contentClassName?: string;
} & ({ markdown: true; children: string } | { markdown?: false; children: React.ReactNode });

function ReasoningContent({
  markdown,
  children,
  className,
  contentClassName,
}: ReasoningContentProps) {
  return (
    <CollapsibleContent
      className={cn(
        "h-(--collapsible-panel-height) overflow-hidden transition-[height] duration-150 ease-out data-ending-style:h-0 data-starting-style:h-0",
        className,
      )}
    >
      <div
        className={cn("prose prose-sm dark:prose-invert text-muted-foreground", contentClassName)}
      >
        {markdown ? <Markdown>{children}</Markdown> : children}
      </div>
    </CollapsibleContent>
  );
}

export { Reasoning, ReasoningContent, ReasoningTrigger };
