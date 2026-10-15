import { useChat as useAIChat } from "@ai-sdk/react";
import { lastAssistantMessageIsCompleteWithApprovalResponses } from "ai";
import type { ExcelAgentUIMessage } from "./excel-agent";
import { chatTransport } from "./transport";

export function useChat({ initialMessages }: { initialMessages: ExcelAgentUIMessage[] }) {
  return useAIChat({
    transport: chatTransport,
    messages: initialMessages,
    /*
     * A tool that needs approval ends the response with a request. Once the
     * user answers every request, resend the conversation so the agent runs
     * (or skips) those tools and carries on.
     */
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithApprovalResponses,
  });
}
