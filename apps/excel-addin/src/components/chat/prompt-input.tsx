import {
  ChatEffortSelect,
  type ChatModelOption,
  ChatModelSelect,
  ChatPermissionSelect,
  ChatPromptInput,
  type ChatPromptInputGroup,
  type ChatPromptInputLabels,
  type ChatPromptInputMessage,
  type ChatPromptInputOption,
} from "@repo/ui/components/chat-prompt-input";
import { SkillIcon, ToolIcon } from "@repo/ui/icons";
import type { ChatStatus } from "ai";
import { useMemo, useState } from "react";
import { m } from "@/lib/internationalization";
import type { ChatBody, PermissionMode } from "./use-chat/types";

/** What gets sent: Markdown, and files as data URLs. */
export type PromptInputMessage = ChatPromptInputMessage;

/** Settings sent with every message, as the request body. */
export type PromptInputBody = ChatBody;

type ReasoningEffort = ChatBody["reasoning"];

type PromptInputProps = {
  status: ChatStatus;
  /** Shaped like `useChat().sendMessage`, so that can be passed straight in. */
  onSubmit: (message: PromptInputMessage, options: { body: PromptInputBody }) => void;
  onStop: () => void;
  className?: string;
};

/** The chat's prompt input, with the settings sent along with each message. */
export function PromptInput({ status, onSubmit, onStop, className }: PromptInputProps) {
  const [toolIds, setToolIds] = useState<string[]>([]);
  const [skillIds, setSkillIds] = useState<string[]>([]);
  const [permissionMode, setPermissionMode] = useState<PermissionMode>("manual");
  const [modelId, setModelId] = useState<string>();
  const [reasoning, setReasoning] = useState<ReasoningEffort>(RECOMMENDED_EFFORT);

  // Changing the locale reloads the page, so these are read once
  const labels = useMemo(getPromptInputLabels, []);
  const permissionOptions = useMemo(getPermissionOptions, []);
  const effortOptions = useMemo(getEffortOptions, []);
  const models = useMemo(getMockModels, []);
  const { tools, skills } = MOCK_CAPABILITIES;

  // Until the user picks one, the first model is the default
  const model = models.find((model) => model.id === modelId) ?? models[0];

  const groups: ChatPromptInputGroup[] = [
    {
      id: "tools",
      icon: ToolIcon,
      label: m.composer_tools(),
      emptyLabel: m.composer_no_tools(),
      itemLabel: m.composer_tool(),
      options: tools,
      selectedIds: toolIds,
      onSelectedIdsChange: setToolIds,
    },
    {
      id: "skills",
      icon: SkillIcon,
      label: m.composer_skills(),
      emptyLabel: m.composer_no_skills(),
      itemLabel: m.composer_skill(),
      options: skills,
      selectedIds: skillIds,
      onSelectedIdsChange: setSkillIds,
    },
  ];

  function submit(message: PromptInputMessage) {
    if (!model) return;
    onSubmit(message, {
      body: { permissionMode, modelId: model.id, reasoning, toolIds, skillIds },
    });
  }

  return (
    <ChatPromptInput
      status={status}
      onSubmit={submit}
      onStop={onStop}
      canSubmit={model !== undefined}
      groups={groups}
      leadingControls={
        <ChatPermissionSelect
          options={permissionOptions}
          value={permissionMode}
          onValueChange={setPermissionMode}
          labels={{
            permissions: m.composer_permissions(),
            permissionsSearch: m.composer_permissions_search(),
            noResults: m.composer_no_results(),
          }}
        />
      }
      trailingControls={
        <>
          <ChatModelSelect
            models={models}
            value={model}
            onValueChange={(model) => setModelId(model.id)}
            labels={{
              model: m.composer_model(),
              modelsSearch: m.composer_models_search(),
              noResults: m.composer_no_results(),
            }}
          />
          <ChatEffortSelect
            options={effortOptions}
            value={reasoning}
            onValueChange={setReasoning}
            recommended={RECOMMENDED_EFFORT}
            labels={{
              effort: m.composer_effort(),
              effortAbout: m.composer_effort_about(),
              effortHelp: m.composer_effort_help(),
              effortFaster: m.composer_effort_faster(),
              effortSmarter: m.composer_effort_smarter(),
              effortRecommended: m.composer_effort_recommended(),
            }}
          />
        </>
      }
      labels={labels}
      className={className}
    />
  );
}

const RECOMMENDED_EFFORT: ReasoningEffort = "medium";

function getPromptInputLabels(): ChatPromptInputLabels {
  return {
    placeholder: m.composer_placeholder(),
    label: m.composer_label(),
    add: m.composer_add(),
    addFiles: m.composer_add_files(),
    attachments: m.composer_attachments(),
    remove: (name) => m.composer_remove({ name }),
    record: m.composer_record(),
    stopRecording: m.composer_stop_recording(),
    microphoneUnavailable: m.composer_microphone_unavailable(),
    recordingName: (time) => m.composer_recording_name({ time }),
    send: m.composer_send(),
    stop: m.composer_stop(),
    dropFiles: m.composer_drop_files(),
  };
}

function getPermissionOptions(): { id: PermissionMode; name: string; description: string }[] {
  return [
    {
      id: "manual",
      name: m.composer_permission_manual(),
      description: m.composer_permission_manual_description(),
    },
    {
      id: "auto",
      name: m.composer_permission_auto(),
      description: m.composer_permission_auto_description(),
    },
    {
      id: "plan",
      name: m.composer_permission_plan(),
      description: m.composer_permission_plan_description(),
    },
    {
      id: "bypass",
      name: m.composer_permission_bypass(),
      description: m.composer_permission_bypass_description(),
    },
  ];
}

/** From least to most reasoning, as the agent's `reasoning` setting takes them. */
function getEffortOptions(): { value: ReasoningEffort; label: string }[] {
  return [
    { value: "none", label: m.composer_effort_none() },
    { value: "minimal", label: m.composer_effort_minimal() },
    { value: "low", label: m.composer_effort_low() },
    { value: "medium", label: m.composer_effort_medium() },
    { value: "high", label: m.composer_effort_high() },
    { value: "xhigh", label: m.composer_effort_xhigh() },
  ];
}

/*
 * MOCK: until the API serves the models, tools and skills, they're listed here.
 * The models are OpenRouter ids the agent can call; the tools and skills
 * aren't used by the agent yet (see `chatBodySchema`).
 */

function getMockModels(): ChatModelOption[] {
  return [
    {
      id: "nvidia/nemotron-3-super-120b-a12b:free",
      name: "Nemotron 3 Super",
      description: m.composer_model_nemotron_super_description(),
    },
    {
      id: "google/gemma-4-31b-it:free",
      name: "Gemma 4 31B",
      description: m.composer_model_gemma_description(),
    },
  ];
}

const MOCK_CAPABILITIES: { tools: ChatPromptInputOption[]; skills: ChatPromptInputOption[] } = {
  tools: [
    { id: "web-search", name: "Web search", description: "Search the web for current information" },
    { id: "charts", name: "Charts", description: "Create and edit charts in the workbook" },
    { id: "pivot-tables", name: "Pivot tables", description: "Summarize data with pivot tables" },
  ],
  skills: [
    {
      id: "financial-model",
      name: "Financial model",
      description: "Build a three-statement model",
    },
    { id: "data-cleanup", name: "Data cleanup", description: "Fix types, blanks and duplicates" },
  ],
};
