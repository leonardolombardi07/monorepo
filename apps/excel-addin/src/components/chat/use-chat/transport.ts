import { type ChatTransport, createAgentUIStream, type UIMessage } from "ai";
import { createExcelAgent } from "./excel-agent";
import { openrouter } from "./provider";
import { type ChatBody, chatBodySchema } from "./types";

/**
 * The settings of each chat's last message. Approving a tool and regenerating
 * send no body, and carry on with the settings of the request they continue.
 */
const lastBodies = new Map<string, ChatBody>();

const DEFAULT_SETTINGS: ChatBody = {
  permissionMode: "manual",
  modelId: import.meta.env.VITE_OPENROUTER_MODEL || "nvidia/nemotron-3-super-120b-a12b:free",
  reasoning: "medium",
  toolIds: [],
  skillIds: [],
};

class LocalChatTransport implements ChatTransport<UIMessage> {
  async sendMessages({
    chatId,
    messages,
    abortSignal,
    body,
  }: Parameters<ChatTransport<UIMessage>["sendMessages"]>[0]) {
    const hasBody = body !== undefined && Object.keys(body).length > 0;
    const settings = hasBody
      ? chatBodySchema.parse(body)
      : (lastBodies.get(chatId) ?? DEFAULT_SETTINGS);
    lastBodies.set(chatId, settings);

    const agent = createExcelAgent({
      // OpenRouter ignores the SDK's `reasoning` call option, so it goes in
      // the model's settings instead
      model: openrouter.chat(settings.modelId, {
        reasoning: { effort: settings.reasoning },
      }),
      permissionMode: settings.permissionMode,
    });

    return createAgentUIStream({
      agent,
      uiMessages: messages,
      abortSignal,
      sendReasoning: true,
      sendSources: true,
      // The SDK masks errors by default, but here the user is the developer
      onError: getErrorMessage,
    });
  }

  /** Nothing keeps a stream running to resume, as with `DirectChatTransport`. */
  async reconnectToStream() {
    return null;
  }
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

export const chatTransport = new LocalChatTransport();
