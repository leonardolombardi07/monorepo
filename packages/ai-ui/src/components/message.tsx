import {
  ActionBarPrimitive,
  type EmptyMessagePartProps,
  ErrorPrimitive,
  MessagePrimitive,
  useAuiState,
} from "@assistant-ui/react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";
import { CheckIcon, CircleAlertIcon, CopyIcon, RotateCcwIcon } from "lucide-react";
import type { ComponentProps } from "react";
import { TooltipIconButton } from "./tooltip-icon-button";

/*
 * Pieces of a message, for the app to compose per role, e.g.:
 *
 *   <Message>
 *     <MessageContent>
 *       <MessagePrimitive.Parts components={{ Text: MarkdownText, Empty: EmptyPart }} />
 *     </MessageContent>
 *     <MessageError />
 *     <MessageActions>
 *       <MessageCopy />
 *       <MessageReload />
 *     </MessageActions>
 *   </Message>
 */

/** A message row. `data-role` tells user and assistant messages apart, for styling and tests. */
function Message({ className, ...props }: ComponentProps<typeof MessagePrimitive.Root>) {
  const role = useAuiState((s) => s.message.role);

  return (
    <MessagePrimitive.Root
      data-slot="message"
      data-role={role}
      className={cn("group/message flex min-w-0 flex-col gap-1.5", className)}
      {...props}
    />
  );
}

const messageContentVariants = cva("wrap-break-word min-w-0", {
  variants: {
    variant: {
      /** Flows with the conversation, as assistant replies do. */
      plain: "flex flex-col gap-3",
      /** A bubble, as user messages are. Hidden while empty, e.g. a message with only attachments. */
      bubble:
        "max-w-[85%] rounded-2xl bg-secondary px-3.5 py-2 text-secondary-foreground empty:hidden",
    },
  },
  defaultVariants: { variant: "plain" },
});

function MessageContent({
  variant,
  className,
  ...props
}: ComponentProps<"div"> & VariantProps<typeof messageContentVariants>) {
  return (
    <div
      data-slot="message-content"
      className={cn(messageContentVariants({ variant }), className)}
      {...props}
    />
  );
}

/**
 * Actions on a message. By default they hide while it is being generated, and
 * only show on hover except on the last message.
 */
function MessageActions({
  hideWhenRunning = true,
  autohide = "not-last",
  className,
  ...props
}: ComponentProps<typeof ActionBarPrimitive.Root>) {
  return (
    <ActionBarPrimitive.Root
      data-slot="message-actions"
      hideWhenRunning={hideWhenRunning}
      autohide={autohide}
      className={cn("flex items-center gap-0.5 text-muted-foreground", className)}
      {...props}
    />
  );
}

type MessageCopyProps = Omit<ComponentProps<typeof TooltipIconButton>, "tooltip"> & {
  tooltip?: string;
  /** Replaces the tooltip for a moment once copied. */
  copiedTooltip?: string;
};

/** Copies the message's text, as Markdown. */
function MessageCopy({ tooltip = "Copy", copiedTooltip = "Copied", ...props }: MessageCopyProps) {
  const isCopied = useAuiState((s) => s.message.isCopied);

  return (
    <ActionBarPrimitive.Copy
      render={
        <TooltipIconButton
          tooltip={isCopied ? copiedTooltip : tooltip}
          data-testid="message-copy"
          {...props}
        />
      }
    >
      {isCopied ? <CheckIcon /> : <CopyIcon />}
    </ActionBarPrimitive.Copy>
  );
}

type MessageReloadProps = Omit<ComponentProps<typeof TooltipIconButton>, "tooltip"> & {
  tooltip?: string;
};

/** Generates the response again. */
function MessageReload({ tooltip = "Regenerate", ...props }: MessageReloadProps) {
  return (
    <ActionBarPrimitive.Reload
      render={<TooltipIconButton tooltip={tooltip} data-testid="message-reload" {...props} />}
    >
      <RotateCcwIcon />
    </ActionBarPrimitive.Reload>
  );
}

/**
 * Why the response failed, when it did. `children` go after the error, e.g. a
 * retry button made with `ActionBarPrimitive.Reload`.
 */
function MessageError({
  className,
  children,
  ...props
}: ComponentProps<typeof ErrorPrimitive.Root>) {
  return (
    <MessagePrimitive.Error>
      <ErrorPrimitive.Root
        data-slot="message-error"
        role="alert"
        className={cn(
          "flex items-start gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-destructive text-sm",
          className,
        )}
        data-testid="message-error"
        {...props}
      >
        <CircleAlertIcon aria-hidden className="mt-0.5 size-4 shrink-0" />
        <ErrorPrimitive.Message className="wrap-break-word min-w-0 flex-1" />
        {children}
      </ErrorPrimitive.Root>
    </MessagePrimitive.Error>
  );
}

type TypingIndicatorProps = ComponentProps<"span"> & {
  /** Read by screen readers instead of the dots. */
  label?: string;
};

/** Three bouncing dots, while a response is on its way. */
function TypingIndicator({
  label = "Generating response",
  className,
  ...props
}: TypingIndicatorProps) {
  return (
    <span
      data-slot="typing-indicator"
      role="status"
      className={cn("flex h-6 items-center gap-1", className)}
      {...props}
    >
      {[0, 1, 2].map((index) => (
        <span
          key={index}
          aria-hidden
          className="size-1.5 animate-[ai-ui-typing_1s_infinite] rounded-full bg-foreground motion-reduce:animate-none"
          style={{ animationDelay: `${index * 150}ms` }}
        />
      ))}
      <span className="sr-only">{label}</span>
    </span>
  );
}

/**
 * `MessagePrimitive.Parts`' `Empty` slot: the typing indicator, while the
 * response has nothing to show yet, e.g. before its first token or between
 * steps of a tool loop.
 */
function EmptyPart({ status }: EmptyMessagePartProps) {
  if (status.type !== "running") return null;
  return <TypingIndicator data-testid="message-pending" />;
}

export {
  EmptyPart,
  Message,
  MessageActions,
  MessageContent,
  MessageCopy,
  MessageError,
  MessageReload,
  TypingIndicator,
};
