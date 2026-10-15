import { AssistantRuntimeProvider, AuiIf, ThreadPrimitive, useAuiState } from "@assistant-ui/react";
import {
  ThreadScrollToBottom,
  ThreadViewport,
  ThreadViewportFooter,
  Thread as UIThread,
} from "@repo/ai-ui/components/thread";
import { cn } from "cn";
import { m } from "@/lib/internationalization";
import { Composer } from "./composer";
import { AssistantMessage, UserMessage } from "./messages";
import { useChat } from "./use-chat";

/** Keeps lines readable on a wide pane; the viewport still scrolls at the pane's edge. */
const COLUMN = "mx-auto w-full max-w-3xl";

export function Chat() {
  const runtime = useChat();

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <Thread />
    </AssistantRuntimeProvider>
  );
}

/** The conversation with the assistant, filling the task pane. Reads the runtime, so it sits inside the provider. */
function Thread() {
  const isEmpty = useAuiState((s) => s.thread.isEmpty);

  return (
    <UIThread className="text-sm">
      {/* A new thread centres the greeting and composer together; once it has messages, the composer drops to the bottom */}
      <ThreadViewport className={cn("px-3", isEmpty && "justify-center")}>
        <AuiIf condition={(s) => s.thread.isEmpty}>
          <Greeting />
        </AuiIf>

        <div className={cn(COLUMN, "flex flex-col gap-5 pt-4 pb-6 empty:hidden")}>
          <ThreadPrimitive.Messages>
            {({ message }) => (message.role === "user" ? <UserMessage /> : <AssistantMessage />)}
          </ThreadPrimitive.Messages>
        </div>

        {/* The footer's `mt-auto` would push it to the bottom, away from the greeting */}
        <ThreadViewportFooter className={cn(COLUMN, "pb-3", isEmpty && "mt-0")}>
          <ThreadScrollToBottom tooltip={m.thread_scroll_to_bottom()} />
          <Composer />
        </ThreadViewportFooter>
      </ThreadViewport>
    </UIThread>
  );
}

function Greeting() {
  return (
    <div className={cn(COLUMN, "flex flex-col items-center px-4 pb-6")}>
      <h1 className="font-bold text-5xl tracking-tight">Hello, Leonardo</h1>
    </div>
  );
}
