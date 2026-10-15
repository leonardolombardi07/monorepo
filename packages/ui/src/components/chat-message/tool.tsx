import { cn } from "cn";
import {
  Ban,
  Check,
  ChevronDown,
  CircleStop,
  CircleX,
  LoaderCircle,
  type LucideIcon,
  ShieldCheck,
  ShieldQuestionMark,
} from "lucide-react";
import { useState } from "react";
import { Button } from "../button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../collapsible";

/*
 * prompt-kit's Tool (https://www.prompt-kit.com/docs/tool), adapted to every
 * state of a tool call, approvals included, and to the theme's colors. The
 * details collapse into a header with the tool's status.
 */

/**
 * A call to a tool, whether its types are known (`tool-{name}`) or not
 * (`dynamic-tool`). Shaped like the AI SDK's `ToolUIPart | DynamicToolUIPart`,
 * so those can be passed straight in.
 */
export type ChatToolPart = {
  /** Shown instead of the tool's name. */
  title?: string;
  input?: unknown;
} & ({ type: `tool-${string}` } | { type: "dynamic-tool"; toolName: string }) &
  (
    | { state: "input-streaming" | "input-available" }
    | {
        state: "approval-requested";
        approval: {
          id: string;
          /** Why the tool asks for approval, when it says. */
          requestReason?: string;
        };
      }
    | { state: "approval-responded"; approval: { id: string; approved: boolean; reason?: string } }
    | {
        state: "output-available";
        output: unknown;
        /** A progress update from a tool still running. */
        preliminary?: boolean;
      }
    | { state: "output-error"; errorText: string }
    | { state: "output-denied"; approval: { id: string; reason?: string } }
  );

export function isChatToolPart(part: { type: string }): part is ChatToolPart {
  return part.type === "dynamic-tool" || part.type.startsWith("tool-");
}

/** The tool's own name, e.g. `readRange` for a `tool-readRange` part. */
export function getChatToolName(part: ChatToolPart) {
  return part.type === "dynamic-tool" ? part.toolName : part.type.slice("tool-".length);
}

/** Shaped like the argument of the AI SDK's `useChat().addToolApprovalResponse`. */
export type ChatToolApprovalResponse = { id: string; approved: boolean };

export type ChatToolStatus =
  | "preparing"
  | "running"
  | "awaiting-approval"
  | "approved"
  | "completed"
  | "failed"
  | "denied"
  | "stopped";

export type ChatToolLabels = {
  /** Next to the tool's name, e.g. `{ running: "Running", ... }`. */
  toolStatus: Record<ChatToolStatus, string>;
  toolInput: string;
  toolOutput: string;
  toolError: string;
  /** Titles why the call was denied. */
  toolReason: string;
  toolAllow: string;
  toolDeny: string;
  /** Asks the user to approve the call, e.g. `name => \`Allow ${name} to run?\``. */
  toolApprovalRequest: (name: string) => string;
  /**
   * The name shown for a tool, e.g. `readRange` -> "Read cells". Falls back to
   * the part's `title`, then to the tool's own name.
   */
  toolTitle?: (toolName: string) => string | undefined;
};

/**
 * Stopping a response leaves its unfinished tools in their last state, so
 * those only count as in progress while the message is still streaming.
 */
export function getChatToolStatus(part: ChatToolPart, isStreaming: boolean): ChatToolStatus {
  switch (part.state) {
    case "input-streaming":
      return isStreaming ? "preparing" : "stopped";
    case "input-available":
      return isStreaming ? "running" : "stopped";
    case "approval-requested":
      return "awaiting-approval";
    case "approval-responded":
      return part.approval.approved ? "approved" : "denied";
    case "output-available":
      if (!part.preliminary) return "completed";
      return isStreaming ? "running" : "stopped";
    case "output-error":
      return "failed";
    case "output-denied":
      return "denied";
  }
}

const STATUS_ICONS: Record<ChatToolStatus, LucideIcon> = {
  preparing: LoaderCircle,
  running: LoaderCircle,
  "awaiting-approval": ShieldQuestionMark,
  approved: ShieldCheck,
  completed: Check,
  failed: CircleX,
  denied: Ban,
  stopped: CircleStop,
};

export type ChatToolProps = {
  part: ChatToolPart;
  /** Whether the message is still being generated. */
  isStreaming: boolean;
  /** Without it, an approval request shows no buttons to answer it. */
  onApprovalResponse?: (response: ChatToolApprovalResponse) => void;
  labels: ChatToolLabels;
  className?: string;
};

export function ChatTool({
  part,
  isStreaming,
  onApprovalResponse,
  labels,
  className,
}: ChatToolProps) {
  // Undefined until the user toggles it
  const [open, setOpen] = useState<boolean>();

  const status = getChatToolStatus(part, isStreaming);
  const StatusIcon = STATUS_ICONS[status];
  const toolName = getChatToolName(part);
  const title = labels.toolTitle?.(toolName) ?? part.title;
  const name = title ?? toolName;

  return (
    <div className={cn("overflow-hidden rounded-lg border", className)} data-testid="message-tool">
      <Collapsible
        // The input is what gets approved, so it shows until the user decides
        open={open ?? status === "awaiting-approval"}
        onOpenChange={setOpen}
      >
        <CollapsibleTrigger
          render={
            <Button
              variant="ghost"
              // Inset, or the card would clip the focus ring
              className="h-auto w-full justify-between gap-2 rounded-none px-3 py-2 font-normal focus-visible:ring-inset"
              data-testid="message-tool-trigger"
            />
          }
        >
          <span className="flex min-w-0 items-center gap-2">
            <StatusIcon
              className={cn(
                "text-muted-foreground",
                (status === "preparing" || status === "running") && "animate-spin",
                status === "failed" && "text-destructive",
              )}
            />
            {/* A tool's own name is an identifier, so it looks like code */}
            <span className={cn("truncate", !title && "font-mono")}>{name}</span>
            <span className="text-muted-foreground text-xs">{labels.toolStatus[status]}</span>
          </span>
          <ChevronDown className="text-muted-foreground transition-transform group-data-panel-open/button:rotate-180" />
        </CollapsibleTrigger>

        <CollapsibleContent className="h-(--collapsible-panel-height) overflow-hidden border-t transition-[height] duration-150 ease-out data-ending-style:h-0 data-starting-style:h-0">
          <ToolDetails part={part} labels={labels} />
        </CollapsibleContent>
      </Collapsible>

      {part.state === "approval-requested" && onApprovalResponse && (
        <ApprovalRequest
          name={name}
          reason={part.approval.requestReason}
          onRespond={(approved) => onApprovalResponse({ id: part.approval.id, approved })}
          labels={labels}
        />
      )}
    </div>
  );
}

function ToolDetails({ part, labels }: { part: ChatToolPart; labels: ChatToolLabels }) {
  const denialReason =
    part.state === "approval-responded" || part.state === "output-denied"
      ? part.approval.reason
      : undefined;

  return (
    <div className="flex flex-col gap-3 p-3">
      {part.input !== undefined && (
        <ToolSection title={labels.toolInput}>{formatValue(part.input)}</ToolSection>
      )}
      {part.state === "output-available" && part.output !== undefined && (
        <ToolSection title={labels.toolOutput}>{formatValue(part.output)}</ToolSection>
      )}
      {part.state === "output-error" && (
        <ToolSection title={labels.toolError} className="text-destructive">
          {part.errorText}
        </ToolSection>
      )}
      {denialReason && <ToolSection title={labels.toolReason}>{denialReason}</ToolSection>}
    </div>
  );
}

function ToolSection({
  title,
  children,
  className,
}: {
  title: string;
  children: string;
  className?: string;
}) {
  return (
    <section className="flex flex-col gap-1.5">
      <h4 className="font-medium text-muted-foreground text-xs">{title}</h4>
      <pre
        className={cn(
          "wrap-break-word max-h-60 overflow-auto whitespace-pre-wrap rounded-md border bg-muted/40 p-2 font-mono text-xs",
          className,
        )}
      >
        {children}
      </pre>
    </section>
  );
}

/** Strings as they are, anything else as indented JSON. */
function formatValue(value: unknown) {
  return typeof value === "string" ? value : JSON.stringify(value, null, 2);
}

function ApprovalRequest({
  name,
  reason,
  onRespond,
  labels,
}: {
  name: string;
  /** Why the tool asks for approval, when it says. */
  reason?: string;
  onRespond: (approved: boolean) => void;
  labels: ChatToolLabels;
}) {
  return (
    <div className="flex items-center gap-3 border-t bg-muted/40 px-3 py-2">
      <div className="flex min-w-0 flex-1 flex-col">
        <p className="text-sm">{labels.toolApprovalRequest(name)}</p>
        {reason && <p className="text-muted-foreground text-xs">{reason}</p>}
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onRespond(false)}
        data-testid="message-tool-deny"
      >
        {labels.toolDeny}
      </Button>
      <Button size="sm" onClick={() => onRespond(true)} data-testid="message-tool-allow">
        {labels.toolAllow}
      </Button>
    </div>
  );
}
