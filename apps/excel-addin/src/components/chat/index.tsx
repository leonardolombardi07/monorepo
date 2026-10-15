import { cn } from "cn";
import type { ComponentProps } from "react";
import { Header } from "./header";
import { Messages } from "./messages";
import { PromptInput } from "./prompt-input";
import { useChat } from "./use-chat";
import type { ExcelAgentUIMessage } from "./use-chat/excel-agent";

type ExistingChat = {
  chatId: string;
  title: string;
};

export function Chat({
  chat,
  onSubmit,
  initialMessages,
}: {
  /** Omitted for a new chat, which exists only once its first message is sent. */
  chat?: ExistingChat;
  initialMessages: ExcelAgentUIMessage[];
  /** Replaces sending the message on this chat, e.g. to create the chat first. */
  onSubmit?: ComponentProps<typeof PromptInput>["onSubmit"];
  /** The header's title and actions; no header without them. */
}) {
  const { messages, status, error, sendMessage, regenerate, stop, addToolApprovalResponse } =
    useChat({
      initialMessages: initialMessages,
    });

  const isEmpty = messages.length === 0;

  return (
    <div className="flex h-full flex-col">
      <Header chat={chat} />

      {/*
       * Everything under the header. A new chat centres the greeting and prompt
       * together; once it has messages, they fill the space and the prompt drops
       * to the bottom.
       */}
      <div className={cn("flex min-h-0 flex-1 flex-col", isEmpty && "justify-center")}>
        {isEmpty ? (
          <Greeting />
        ) : (
          <Messages
            // Each chat opens at its latest message. Prefixed, as keys of siblings clash
            key={`messages-${chat?.chatId}`}
            messages={messages}
            status={status}
            error={error}
            onRegenerate={regenerate}
            onToolApprovalResponse={addToolApprovalResponse}
            className="min-h-0 flex-1"
          />
        )}

        <PromptInput
          // A draft belongs to its chat
          key={chat?.chatId ?? "new"}
          status={status}
          onSubmit={onSubmit ?? sendMessage}
          onStop={stop}
          className="mx-auto max-h-[90%] w-full max-w-3xl px-4 pb-4"
        />
      </div>
    </div>
  );
}

function Greeting() {
  return (
    <div className="flex flex-col items-center px-4 pb-6">
      <h1 className="font-bold text-5xl tracking-tight">Hello, Leonardo</h1>
    </div>
  );
}
