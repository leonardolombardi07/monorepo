import type { ToolCallMessagePartProps } from "@assistant-ui/react";
import { Button } from "@repo/ui/components/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@repo/ui/components/collapsible";
import { cn } from "cn";
import {
  BanIcon,
  CheckIcon,
  ChevronDownIcon,
  CircleStopIcon,
  CircleXIcon,
  HourglassIcon,
  LoaderCircleIcon,
  type LucideIcon,
  ShieldQuestionMarkIcon,
} from "lucide-react";
import { type ComponentProps, createContext, useContext, useState } from "react";

/*
 * A call the model made to a tool: a card whose header names the tool and its
 * status, and expands to the input and output. Calls that need the user's
 * approval show the request under it.
 *
 * `ToolCallPart` composes the pieces for any tool. For a tool that deserves
 * its own UI, compose them with your own content, and register it by name in
 * `MessagePrimitive.Parts`' `tools.by_name`.
 */

/** Where a call is, as the user sees it. */
type ToolCallStatus =
  | "running"
  | "awaiting-approval"
  /** Waiting for something other than an approval, e.g. a frontend tool's result. */
  | "waiting"
  | "completed"
  | "failed"
  | "denied"
  | "cancelled";

/** English labels; pass `statusLabel` to `ToolCallTrigger` to translate them. */
const TOOL_CALL_STATUS_LABELS: Record<ToolCallStatus, string> = {
  running: "Running",
  "awaiting-approval": "Awaiting approval",
  waiting: "Waiting",
  completed: "Completed",
  failed: "Failed",
  denied: "Denied",
  cancelled: "Stopped",
};

const STATUS_ICONS: Record<ToolCallStatus, LucideIcon> = {
  running: LoaderCircleIcon,
  "awaiting-approval": ShieldQuestionMarkIcon,
  waiting: HourglassIcon,
  completed: CheckIcon,
  failed: CircleXIcon,
  denied: BanIcon,
  cancelled: CircleStopIcon,
};

/** The status of the call assistant-ui renders. A decision on its approval comes first. */
function getToolCallStatus(
  part: Pick<ToolCallMessagePartProps, "status" | "approval" | "isError">,
): ToolCallStatus {
  const { status, approval } = part;
  if (approval?.resolution !== undefined) return "cancelled";
  if (approval?.approved === false) return "denied";
  if (approval && approval.approved === undefined) return "awaiting-approval";

  switch (status.type) {
    case "running":
      return "running";
    case "requires-action":
      return "waiting";
    case "incomplete":
      return status.reason === "cancelled" ? "cancelled" : "failed";
    case "complete":
      return part.isError ? "failed" : "completed";
  }
}

const ToolCallContext = createContext<ToolCallStatus>("running");

type ToolCallProps = ComponentProps<typeof Collapsible> & {
  status: ToolCallStatus;
};

function ToolCall({ status, open, onOpenChange, className, ...props }: ToolCallProps) {
  // Undefined until the user toggles it
  const [userOpen, setUserOpen] = useState<boolean>();

  return (
    <ToolCallContext value={status}>
      <Collapsible
        data-slot="tool-call"
        data-status={status}
        // The input is what gets approved, so it shows until the user decides
        open={open ?? userOpen ?? status === "awaiting-approval"}
        onOpenChange={(nextOpen, details) => {
          setUserOpen(nextOpen);
          onOpenChange?.(nextOpen, details);
        }}
        className={cn("overflow-hidden rounded-lg border", className)}
        data-testid="tool-call"
        {...props}
      />
    </ToolCallContext>
  );
}

type ToolCallTriggerProps = ComponentProps<typeof CollapsibleTrigger> & {
  /** The tool, as the user should see it. */
  name: string;
  /** Replaces the English label of the status. */
  statusLabel?: string;
};

function ToolCallTrigger({ name, statusLabel, className, ...props }: ToolCallTriggerProps) {
  const status = useContext(ToolCallContext);
  const StatusIcon = STATUS_ICONS[status];

  return (
    <CollapsibleTrigger
      data-slot="tool-call-trigger"
      render={
        <Button
          variant="ghost"
          // Inset, or the card would clip the focus ring
          className={cn(
            "h-auto w-full justify-between gap-2 rounded-none px-3 py-2 font-normal focus-visible:ring-inset",
            className,
          )}
          data-testid="tool-call-trigger"
        />
      }
      {...props}
    >
      <span className="flex min-w-0 items-center gap-2">
        <StatusIcon
          aria-hidden
          className={cn(
            "text-muted-foreground",
            status === "running" && "animate-spin motion-reduce:animate-none",
            status === "failed" && "text-destructive",
          )}
        />
        <span className="truncate font-mono text-[0.8125rem]">{name}</span>
        <span className="shrink-0 text-muted-foreground text-xs">
          {statusLabel ?? TOOL_CALL_STATUS_LABELS[status]}
        </span>
      </span>
      <ChevronDownIcon
        aria-hidden
        className="text-muted-foreground transition-transform group-data-panel-open/button:rotate-180"
      />
    </CollapsibleTrigger>
  );
}

/** The details, in a panel that animates open and closed. `className` styles their layout. */
function ToolCallContent({
  className,
  children,
  ...props
}: ComponentProps<typeof CollapsibleContent>) {
  return (
    <CollapsibleContent
      data-slot="tool-call-content"
      className="h-(--collapsible-panel-height) overflow-hidden border-t transition-[height] duration-150 ease-out data-ending-style:h-0 data-starting-style:h-0 motion-reduce:transition-none"
      {...props}
    >
      <div className={cn("flex flex-col gap-3 p-3", className)}>{children}</div>
    </CollapsibleContent>
  );
}

type ToolCallSectionProps = Omit<ComponentProps<"section">, "children"> & {
  title: string;
  /** Strings show as they are, anything else as indented JSON. */
  value: unknown;
  variant?: "default" | "error";
};

/** A titled value, e.g. the call's input or output. */
function ToolCallSection({
  title,
  value,
  variant = "default",
  className,
  ...props
}: ToolCallSectionProps) {
  return (
    <section
      data-slot="tool-call-section"
      className={cn("flex flex-col gap-1.5", className)}
      {...props}
    >
      <h4 className="font-medium text-muted-foreground text-xs">{title}</h4>
      <pre
        className={cn(
          "wrap-break-word max-h-60 overflow-auto whitespace-pre-wrap rounded-md border bg-muted/40 p-2 font-mono text-xs",
          variant === "error" && "border-destructive/30 text-destructive",
        )}
      >
        {typeof value === "string" ? value : JSON.stringify(value, null, 2)}
      </pre>
    </section>
  );
}

type ToolCallApprovalProps = Omit<ComponentProps<"div">, "children"> & {
  /** The question, e.g. "Allow write_range to run?" */
  prompt: string;
  /** Why the tool asks, when it says. */
  description?: string | undefined;
  /** Rejecting keeps the buttons enabled, so the user can try again. */
  onRespond: (approved: boolean) => Promise<void> | void;
  allowLabel?: string;
  denyLabel?: string;
};

/** Asks the user to allow or deny the call. Place it in `ToolCall`, after the content. */
function ToolCallApproval({
  prompt,
  description,
  onRespond,
  allowLabel = "Allow",
  denyLabel = "Deny",
  className,
  ...props
}: ToolCallApprovalProps) {
  const [isResponding, setIsResponding] = useState(false);

  function respond(approved: boolean) {
    setIsResponding(true);
    Promise.resolve(onRespond(approved)).then(
      () => setIsResponding(false),
      () => setIsResponding(false),
    );
  }

  return (
    <div
      data-slot="tool-call-approval"
      className={cn(
        "@container flex flex-wrap items-center gap-x-3 gap-y-2 border-t bg-muted/40 px-3 py-2",
        className,
      )}
      {...props}
    >
      <div className="flex min-w-40 flex-1 flex-col">
        <p className="text-sm">{prompt}</p>
        {description && <p className="text-muted-foreground text-xs">{description}</p>}
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={isResponding}
          onClick={() => respond(false)}
          data-testid="tool-call-deny"
        >
          {denyLabel}
        </Button>
        <Button
          size="sm"
          disabled={isResponding}
          onClick={() => respond(true)}
          data-testid="tool-call-allow"
        >
          {allowLabel}
        </Button>
      </div>
    </div>
  );
}

/**
 * `MessagePrimitive.Parts`' `tools.Fallback` slot: any tool's call, with its
 * input, its output or error, and its approval request.
 */
function ToolCallPart(part: ToolCallMessagePartProps) {
  const { toolName, args, result, isError, approval, respondToApproval } = part;
  const status = getToolCallStatus(part);

  return (
    <ToolCall status={status}>
      <ToolCallTrigger name={toolName} />
      <ToolCallContent>
        <ToolCallSection title="Input" value={args} />
        {result !== undefined && (
          <ToolCallSection
            title={isError ? "Error" : "Output"}
            value={result}
            variant={isError ? "error" : "default"}
          />
        )}
        {approval?.reason && <ToolCallSection title="Reason" value={approval.reason} />}
      </ToolCallContent>
      {status === "awaiting-approval" && (
        <ToolCallApproval
          prompt={approval?.prompt ?? `Allow ${toolName} to run?`}
          onRespond={(approved) => respondToApproval({ approved })}
        />
      )}
    </ToolCall>
  );
}

export type { ToolCallStatus };
export {
  getToolCallStatus,
  TOOL_CALL_STATUS_LABELS,
  ToolCall,
  ToolCallApproval,
  ToolCallContent,
  ToolCallPart,
  ToolCallSection,
  ToolCallTrigger,
};
