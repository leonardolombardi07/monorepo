import {
  ActionBarPrimitive,
  type AssistantState,
  AuiIf,
  MessagePrimitive,
} from "@assistant-ui/react";
import { FilePart, ImagePart, MessageAttachments } from "@repo/ai-ui/components/attachment";
import { MarkdownText } from "@repo/ai-ui/components/markdown-text";
import {
  EmptyPart,
  Message,
  MessageActions,
  MessageContent,
  MessageCopy,
  MessageError,
  MessageReload,
} from "@repo/ai-ui/components/message";
import { ReasoningPart } from "@repo/ai-ui/components/reasoning";
import { MessageSources } from "@repo/ai-ui/components/sources";
import { ToolCallPart } from "@repo/ai-ui/components/tool-call";
import { Button } from "@repo/ui/components/button";
import { m } from "@/lib/internationalization";

/* Defined once, so parts don't re-render with a new `components` object */

const USER_PARTS = { Text: MarkdownText, File: FilePart, Image: ImagePart };

const ASSISTANT_PARTS = {
  Text: MarkdownText,
  Reasoning: ReasoningPart,
  File: FilePart,
  Image: ImagePart,
  Empty: EmptyPart,
  tools: { Fallback: ToolCallPart },
  // No `Source`: `MessageSources` lists them together under the response
};

/** Not while a tool awaits approval, nor after an error, which offers its own retry. */
function canAct(s: AssistantState) {
  const status = s.message.status;
  return (
    status?.type !== "requires-action" &&
    !(status?.type === "incomplete" && status.reason === "error")
  );
}

export function UserMessage() {
  return (
    <Message className="items-end" data-testid="message-user">
      <MessageAttachments className="justify-end" />
      <div className="relative max-w-[85%]">
        <MessageContent variant="bubble" className="max-w-none">
          <MessagePrimitive.Parts components={USER_PARTS} />
        </MessageContent>
        {/* Beside the bubble, so showing it on hover doesn't move the thread */}
        <MessageActions
          autohide="always"
          className="absolute top-1/2 right-full mr-1 -translate-y-1/2"
        >
          <MessageCopy tooltip={m.message_copy()} copiedTooltip={m.message_copied()} />
        </MessageActions>
      </div>
    </Message>
  );
}

export function AssistantMessage() {
  return (
    <Message data-testid="message-assistant">
      <MessageContent>
        <MessagePrimitive.Parts components={ASSISTANT_PARTS} />
      </MessageContent>
      <MessageSources label={m.message_sources()} />
      <MessageError>
        <ActionBarPrimitive.Reload
          render={<Button variant="outline" size="xs" data-testid="message-retry" />}
        >
          {m.message_retry()}
        </ActionBarPrimitive.Reload>
      </MessageError>
      <AuiIf condition={canAct}>
        {/* Keeps its height while the actions hide, so the thread doesn't jump on hover */}
        <div className="-ml-1.5 flex h-7 items-center">
          <MessageActions>
            <MessageCopy tooltip={m.message_copy()} copiedTooltip={m.message_copied()} />
            <MessageReload tooltip={m.message_regenerate()} />
          </MessageActions>
        </div>
      </AuiIf>
    </Message>
  );
}
