import type { ReasoningMessagePartProps } from "@assistant-ui/react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@repo/ui/components/collapsible";
import { cn } from "cn";
import { ChevronDownIcon } from "lucide-react";
import { type ComponentProps, createContext, useContext, useState } from "react";
import { MarkdownText } from "./markdown-text";
import { TextShimmer } from "./text-shimmer";

/*
 * What the model thought before answering. It's open while the model thinks
 * and closes once it's done, unless the user has toggled it.
 */

const ReasoningContext = createContext({ isStreaming: false });

type ReasoningProps = ComponentProps<typeof Collapsible> & {
  /** Whether the model is still thinking. */
  isStreaming?: boolean;
};

function Reasoning({
  isStreaming = false,
  open,
  onOpenChange,
  className,
  ...props
}: ReasoningProps) {
  // Undefined until the user toggles it, so it follows the stream until then
  const [userOpen, setUserOpen] = useState<boolean>();

  return (
    <ReasoningContext value={{ isStreaming }}>
      <Collapsible
        data-slot="reasoning"
        open={open ?? userOpen ?? isStreaming}
        onOpenChange={(nextOpen, details) => {
          setUserOpen(nextOpen);
          onOpenChange?.(nextOpen, details);
        }}
        className={cn("flex flex-col", className)}
        {...props}
      />
    </ReasoningContext>
  );
}

type ReasoningTriggerProps = ComponentProps<typeof CollapsibleTrigger> & {
  label?: string;
  /** Shown, shimmering, while the model thinks. */
  streamingLabel?: string;
};

function ReasoningTrigger({
  label = "Thought process",
  streamingLabel = "Thinking",
  className,
  ...props
}: ReasoningTriggerProps) {
  const { isStreaming } = useContext(ReasoningContext);

  return (
    <CollapsibleTrigger
      data-slot="reasoning-trigger"
      className={cn(
        "group/reasoning-trigger flex w-fit items-center gap-1 rounded-sm text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50",
        className,
      )}
      data-testid="reasoning-trigger"
      {...props}
    >
      {isStreaming ? <TextShimmer>{streamingLabel}</TextShimmer> : label}
      <ChevronDownIcon
        aria-hidden
        className="size-4 transition-transform group-data-panel-open/reasoning-trigger:rotate-180"
      />
    </CollapsibleTrigger>
  );
}

/** The thoughts, in a panel that animates open and closed. `className` styles the text. */
function ReasoningContent({
  className,
  children,
  ...props
}: ComponentProps<typeof CollapsibleContent>) {
  return (
    <CollapsibleContent
      data-slot="reasoning-content"
      className="h-(--collapsible-panel-height) overflow-hidden transition-[height] duration-150 ease-out data-ending-style:h-0 data-starting-style:h-0 motion-reduce:transition-none"
      {...props}
    >
      <div className={cn("mt-2 border-l-2 pl-3 text-[0.925em] text-muted-foreground", className)}>
        {children}
      </div>
    </CollapsibleContent>
  );
}

/** `MessagePrimitive.Parts`' `Reasoning` slot. */
function ReasoningPart({ text, status }: ReasoningMessagePartProps) {
  const isStreaming = status.type === "running";
  // Some providers keep the reasoning hidden, and only send that it happened
  if (!isStreaming && text.trim() === "") return null;

  return (
    <Reasoning isStreaming={isStreaming}>
      <ReasoningTrigger />
      <ReasoningContent>
        <MarkdownText />
      </ReasoningContent>
    </Reasoning>
  );
}

export { Reasoning, ReasoningContent, ReasoningPart, ReasoningTrigger };
