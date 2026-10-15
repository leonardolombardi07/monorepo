import { cn } from "cn";
import { memo, type ReactNode } from "react";
import { TypingLoader } from "../loader";
import { MessageActions, MessageContent, Message as MessageRow } from "../message";
import { SystemMessage } from "../system-message";
import {
  ChatCopyAction,
  type ChatCopyActionLabels,
  ChatRegenerateAction,
  type ChatRegenerateActionLabels,
} from "./actions";
import { ChatFile, type ChatFileLabels } from "./file";
import { ChatReasoning, type ChatReasoningLabels } from "./reasoning";
import { type ChatSource, ChatSources, type ChatSourcesLabels, isChatSource } from "./sources";
import {
  ChatTool,
  type ChatToolApprovalResponse,
  type ChatToolLabels,
  type ChatToolPart,
  isChatToolPart,
} from "./tool";

/*
 * A chat message and its parts. The types mirror the AI SDK's `UIMessage`, so
 * its messages can be passed straight in, but nothing here depends on it.
 */

export type ChatTextPart = { type: "text"; text: string };

export type ChatReasoningPart = {
  type: "reasoning";
  text: string;
  /** Stopping a response leaves its last part streaming. */
  state?: "streaming" | "done";
};

export type ChatFilePart = { type: "file"; mediaType: string; url: string; filename?: string };

export type ChatReasoningFilePart = { type: "reasoning-file"; mediaType: string; url: string };

/** Typed `data-{name}`: defined by the app, which renders them with `renderDataPart`. */
export type ChatDataPart = { type: `data-${string}`; id?: string; data: unknown };

/** A step boundary: nothing to show. */
export type ChatStepStartPart = { type: "step-start" };

/** Provider-specific content: nothing to show. */
export type ChatCustomPart = { type: "custom" };

export type ChatMessagePart =
  | ChatTextPart
  | ChatReasoningPart
  | ChatFilePart
  | ChatReasoningFilePart
  | ChatSource
  | ChatToolPart
  | ChatDataPart
  | ChatStepStartPart
  | ChatCustomPart;

export type ChatMessageRole = "system" | "user" | "assistant";

export type ChatMessageData = {
  id: string;
  role: ChatMessageRole;
  parts: readonly ChatMessagePart[];
};

export type ChatPendingMessageLabels = {
  /** Read by screen readers while the response is on its way. */
  pending: string;
};

/** Every string the message shows. Keep the object stable, as `ChatMessage` is memoized. */
export type ChatMessageLabels = ChatCopyActionLabels &
  ChatRegenerateActionLabels &
  ChatFileLabels &
  ChatReasoningLabels &
  ChatSourcesLabels &
  ChatToolLabels &
  ChatPendingMessageLabels & {
    /** Names the list of files the user attached, for screen readers. */
    attachments: string;
  };

export type ChatMessageProps = {
  message: ChatMessageData;
  /** Whether this is the response being generated. */
  isStreaming?: boolean;
  /**
   * Whether this is the latest response, and nothing is being generated. Its
   * actions stay in view, and it's the only one that can be regenerated.
   */
  canRegenerate?: boolean;
  /** Shaped like `useChat().regenerate`. */
  onRegenerate?: (options: { messageId: string }) => void;
  /** Shaped like `useChat().addToolApprovalResponse`. */
  onToolApprovalResponse?: (response: ChatToolApprovalResponse) => void;
  /** Renders the app's own `data-{name}` parts, which show nothing by default. */
  renderDataPart?: (part: ChatDataPart) => ReactNode;
  labels: ChatMessageLabels;
};

/** Markdown styles, on top of `MessageContent`'s `prose`. */
const PROSE_CLASS = "prose-sm prose-neutral max-w-none dark:prose-invert";

/**
 * Memoized, so streaming only re-renders the message being written: the AI SDK
 * keeps the other messages' identity. Keep the callbacks and `labels` stable for that.
 */
export const ChatMessage = memo(function ChatMessage({ message, ...props }: ChatMessageProps) {
  switch (message.role) {
    case "user":
      return <UserMessage message={message} labels={props.labels} />;
    case "assistant":
      return <AssistantMessage message={message} {...props} />;
    case "system":
      return <ChatSystemMessage message={message} />;
  }
});

export type ChatPendingMessageProps = { labels: ChatPendingMessageLabels };

/** Shows that a response is on its way, until it shows something. */
export function ChatPendingMessage({ labels }: ChatPendingMessageProps) {
  return (
    <MessageRow>
      <Pending labels={labels} />
    </MessageRow>
  );
}

function Pending({ labels }: ChatPendingMessageProps) {
  return (
    <div role="status" className="flex h-6 items-center" data-testid="message-pending">
      <TypingLoader />
      <span className="sr-only">{labels.pending}</span>
    </div>
  );
}

function isTextPart(part: ChatMessagePart): part is ChatTextPart {
  return part.type === "text";
}

function isFilePart(part: ChatMessagePart): part is ChatFilePart {
  return part.type === "file";
}

/** The Markdown of the message, e.g. to copy it. */
export function getChatMessageText(message: ChatMessageData) {
  return message.parts
    .filter(isTextPart)
    .map((part) => part.text)
    .join("\n\n");
}

/** A response starts with a step boundary, before the model sends anything. */
function hasContent(message: ChatMessageData) {
  return message.parts.some((part) => part.type !== "step-start");
}

/** Shows its actions on hover, or always with `actionsInView`. */
function actionsClassName(actionsInView: boolean) {
  return cn(
    "transition-opacity",
    !actionsInView && "opacity-0 focus-within:opacity-100 group-hover/message:opacity-100",
  );
}

function UserMessage({ message, labels }: { message: ChatMessageData; labels: ChatMessageLabels }) {
  // Users write Markdown in the prompt input, alongside the attached files
  const files = message.parts.filter(isFilePart);
  const text = getChatMessageText(message);

  return (
    <MessageRow className="group/message flex-col items-end gap-2" data-testid="message-user">
      {files.length > 0 && (
        <ul aria-label={labels.attachments} className="flex flex-wrap justify-end gap-2">
          {files.map((file, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey:  Files are only ever appended, so the index is a stable key
            <li key={index}>
              <ChatFile file={file} labels={labels} />
            </li>
          ))}
        </ul>
      )}

      {text !== "" && (
        <>
          <MessageContent
            markdown
            className={cn(PROSE_CLASS, "max-w-[85%] rounded-3xl bg-secondary px-4 py-2.5")}
          >
            {text}
          </MessageContent>
          <MessageActions className={actionsClassName(false)}>
            <ChatCopyAction text={text} labels={labels} />
          </MessageActions>
        </>
      )}
    </MessageRow>
  );
}

function AssistantMessage({
  message,
  isStreaming = false,
  canRegenerate = false,
  onRegenerate,
  onToolApprovalResponse,
  renderDataPart,
  labels,
}: ChatMessageProps) {
  // Listed together under the response, rather than where they arrived
  const sources = message.parts.filter(isChatSource);
  const text = getChatMessageText(message);
  const showRegenerate = canRegenerate && onRegenerate !== undefined;

  return (
    <MessageRow className="group/message flex-col gap-3" data-testid="message-assistant">
      {isStreaming && !hasContent(message) && <Pending labels={labels} />}

      {message.parts.map((part, index) => (
        <MessagePart
          // biome-ignore lint/suspicious/noArrayIndexKey:  Parts are only ever appended, so the index is a stable key
          key={index}
          part={part}
          isStreaming={isStreaming}
          onToolApprovalResponse={onToolApprovalResponse}
          renderDataPart={renderDataPart}
          labels={labels}
        />
      ))}

      {sources.length > 0 && <ChatSources sources={sources} labels={labels} />}

      {!isStreaming && (text !== "" || showRegenerate) && (
        <MessageActions
          // Under the text it copies, minus the button's own padding
          className={cn("-ml-1.5", actionsClassName(canRegenerate))}
        >
          {text !== "" && <ChatCopyAction text={text} labels={labels} />}
          {showRegenerate && (
            <ChatRegenerateAction
              onRegenerate={() => onRegenerate({ messageId: message.id })}
              labels={labels}
            />
          )}
        </MessageActions>
      )}
    </MessageRow>
  );
}

type MessagePartProps = {
  part: ChatMessagePart;
  isStreaming: boolean;
  onToolApprovalResponse?: (response: ChatToolApprovalResponse) => void;
  renderDataPart?: (part: ChatDataPart) => ReactNode;
  labels: ChatMessageLabels;
};

function MessagePart({
  part,
  isStreaming,
  onToolApprovalResponse,
  renderDataPart,
  labels,
}: MessagePartProps) {
  // Typed `tool-{name}` for each static tool, so they need a type guard
  if (isChatToolPart(part)) {
    return (
      <ChatTool
        part={part}
        isStreaming={isStreaming}
        onApprovalResponse={onToolApprovalResponse}
        labels={labels}
      />
    );
  }

  switch (part.type) {
    case "text":
      // Starts empty, before the first token
      if (part.text === "") return null;
      return (
        <MessageContent markdown className={cn(PROSE_CLASS, "rounded-none bg-transparent p-0")}>
          {part.text}
        </MessageContent>
      );
    case "reasoning":
      return (
        <ChatReasoning
          text={part.text}
          // Stopping a response leaves its last part streaming
          isStreaming={isStreaming && part.state === "streaming"}
          labels={labels}
        />
      );
    case "file":
    case "reasoning-file":
      return <ChatFile file={part} labels={labels} />;
    // Listed together under the response
    case "source-url":
    case "source-document":
      return null;
    // A step boundary, and provider-specific content: nothing to show
    case "step-start":
    case "custom":
      return null;
    default:
      // Only `data-{name}` parts are left; fails to compile when a new part isn't handled
      return renderDataPart?.(part) ?? null;
  }
}

/** A notice the app added to the conversation, e.g. a change of mode. */
function ChatSystemMessage({ message }: { message: ChatMessageData }) {
  return (
    <SystemMessage fill data-testid="message-system">
      {getChatMessageText(message)}
    </SystemMessage>
  );
}

export {
  ChatCopyAction,
  type ChatCopyActionLabels,
  type ChatCopyActionProps,
  ChatRegenerateAction,
  type ChatRegenerateActionLabels,
  type ChatRegenerateActionProps,
} from "./actions";
export { ChatFile, type ChatFileData, type ChatFileLabels, type ChatFileProps } from "./file";
export { ChatReasoning, type ChatReasoningLabels, type ChatReasoningProps } from "./reasoning";
export {
  type ChatDocumentSource,
  type ChatSource,
  ChatSources,
  type ChatSourcesLabels,
  type ChatSourcesProps,
  type ChatUrlSource,
  isChatSource,
} from "./sources";
export {
  ChatTool,
  type ChatToolApprovalResponse,
  type ChatToolLabels,
  type ChatToolPart,
  type ChatToolProps,
  type ChatToolStatus,
  getChatToolName,
  getChatToolStatus,
  isChatToolPart,
} from "./tool";
