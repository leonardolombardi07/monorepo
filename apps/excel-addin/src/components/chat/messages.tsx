import { ChatContainerContent, ChatContainerRoot } from "@repo/ui/components/chat-container";
import {
  ChatMessage,
  type ChatMessageLabels,
  ChatPendingMessage,
  type ChatToolApprovalResponse,
} from "@repo/ui/components/chat-message";
import { ScrollButton } from "@repo/ui/components/scroll-button";
import { SystemMessage } from "@repo/ui/components/system-message";
import { Tooltip, TooltipContent, TooltipTrigger } from "@repo/ui/components/tooltip";
import type { ChatStatus, UIMessage } from "ai";
import { cn } from "cn";
import { useMemo } from "react";
import { m } from "@/lib/internationalization";
import { getToolTitle } from "./use-chat/excel-agent";

type MessagesProps = {
  messages: UIMessage[];
  status: ChatStatus;
  /** Why the last response failed, when `status` is `error`. */
  error: Error | undefined;
  /**
   * Shaped like `useChat().regenerate`, so that can be passed straight in.
   * Without a message, retries the last response.
   */
  onRegenerate: (options?: { messageId: string }) => void;
  /** Shaped like `useChat().addToolApprovalResponse`. */
  onToolApprovalResponse: (response: ChatToolApprovalResponse) => void;
  className?: string;
};

/**
 * The conversation, following new content down unless the user scrolls up.
 * Keep the callbacks stable, so streaming only re-renders the last message.
 */
export function Messages({
  messages,
  status,
  error,
  onRegenerate,
  onToolApprovalResponse,
  className,
}: MessagesProps) {
  // Stable, as `ChatMessage` is memoized. Changing the locale reloads the page
  const labels = useMemo(getMessageLabels, []);
  const isBusy = status === "submitted" || status === "streaming";

  return (
    <ChatContainerRoot
      className={cn("relative", className)}
      aria-label={m.thread_label()}
      // Screen readers wait for the response to finish instead of reading every token
      aria-busy={isBusy}
      data-testid="messages"
    >
      {/* Lined up with the prompt input */}
      <ChatContainerContent className="mx-auto max-w-3xl gap-6 px-4 pt-6 pb-10">
        {messages.map((message, index) => {
          const isLast = index === messages.length - 1;
          return (
            <ChatMessage
              key={message.id}
              message={message}
              isStreaming={isLast && status === "streaming"}
              canRegenerate={isLast && message.role === "assistant" && status === "ready"}
              onRegenerate={onRegenerate}
              onToolApprovalResponse={onToolApprovalResponse}
              labels={labels}
            />
          );
        })}

        {/* Once it streams, the response shows this itself until it has content */}
        {status === "submitted" && <ChatPendingMessage labels={labels} />}

        {status === "error" && (
          <SystemMessage
            variant="error"
            fill
            role="alert"
            cta={{
              label: m.message_retry(),
              onClick: () => onRegenerate(),
            }}
            data-testid="messages-error"
          >
            {m.thread_error()}
            {error?.message && <span className="block text-xs opacity-80">{error.message}</span>}

            <pre className="wrap-break-word mt-2 max-h-40 overflow-auto whitespace-pre-wrap rounded-md border bg-muted/40 p-2 font-mono text-xs">
              {error?.stack}
            </pre>
          </SystemMessage>
        )}
      </ChatContainerContent>

      <Tooltip>
        <TooltipTrigger
          render={
            <ScrollButton
              className="absolute bottom-3 left-1/2 -translate-x-1/2 shadow-sm"
              aria-label={m.thread_scroll_to_bottom()}
              data-testid="messages-scroll-to-bottom"
            />
          }
        />
        <TooltipContent>{m.thread_scroll_to_bottom()}</TooltipContent>
      </Tooltip>
    </ChatContainerRoot>
  );
}

function getMessageLabels(): ChatMessageLabels {
  return {
    copy: m.message_copy(),
    copied: m.message_copied(),
    regenerate: m.message_regenerate(),
    pending: m.message_pending(),
    attachments: m.message_attachments(),
    image: m.message_image(),
    sources: m.message_sources(),
    reasoning: m.message_reasoning(),
    reasoningStreaming: m.message_reasoning_streaming(),
    toolStatus: {
      preparing: m.message_tool_preparing(),
      running: m.message_tool_running(),
      "awaiting-approval": m.message_tool_awaiting_approval(),
      approved: m.message_tool_approved(),
      completed: m.message_tool_completed(),
      failed: m.message_tool_failed(),
      denied: m.message_tool_denied(),
      stopped: m.message_tool_stopped(),
    },
    toolInput: m.message_tool_input(),
    toolOutput: m.message_tool_output(),
    toolError: m.message_tool_error(),
    toolReason: m.message_tool_reason(),
    toolAllow: m.message_tool_allow(),
    toolDeny: m.message_tool_deny(),
    toolApprovalRequest: (name) => m.message_tool_approval_request({ name }),
    toolTitle: getToolTitle,
  };
}
