import { useChatRuntime } from "@assistant-ui/ai-sdk";
import { lastAssistantMessageIsCompleteWithApprovalResponses } from "ai";
import { chatTransport } from "./transport";

export function useChat() {
  return useChatRuntime({
    transport: chatTransport,
    // Once the user answers every tool awaiting approval, the response carries on
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithApprovalResponses,
  });
}
