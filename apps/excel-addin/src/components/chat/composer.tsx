import { useAui, useAuiState } from "@assistant-ui/react";
import { AddMenu } from "@repo/ai-ui/components/add-menu";
import { ComposerAttachments } from "@repo/ai-ui/components/attachment";
import {
  ComposerCancel,
  ComposerInput,
  ComposerSend,
  Composer as UIComposer,
} from "@repo/ai-ui/components/composer";
import { type EffortLevel, EffortSelect } from "@repo/ai-ui/components/effort-select";
import { MicrophoneButton } from "@repo/ai-ui/components/microphone-button";
import { type ModelOption, ModelSelect } from "@repo/ai-ui/components/model-select";
import { type PermissionOption, PermissionSelect } from "@repo/ai-ui/components/permission-select";
import { SkillIcon, ToolIcon } from "@repo/ui/icons";
import { useState } from "react";
import type { ChatBody, PermissionMode } from "@/lib/chat/types";
import { m } from "@/lib/internationalization";

type ReasoningEffort = ChatBody["reasoning"];

/* Built on render, so the labels follow the current locale */

function getPermissionOptions(): PermissionOption<PermissionMode>[] {
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

function getEffortLevels(): EffortLevel<ReasoningEffort>[] {
  return [
    { value: "none", label: m.composer_effort_none() },
    { value: "minimal", label: m.composer_effort_minimal() },
    { value: "low", label: m.composer_effort_low() },
    { value: "medium", label: m.composer_effort_medium() },
    { value: "high", label: m.composer_effort_high() },
    { value: "xhigh", label: m.composer_effort_xhigh() },
  ];
}

/** OpenRouter models, until the backend lists them. */
function getModels(): ModelOption[] {
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

const RECOMMENDED_EFFORT: ReasoningEffort = "medium";

/**
 * The message card, with the send button beside the input, and the settings
 * under it: what to add and how much the agent may do on the left, the model
 * and its effort on the right.
 *
 * The settings aren't sent with the message yet (see `DEFAULT_SETTINGS` in
 * `@/lib/chat/transport`).
 */
export function Composer() {
  const aui = useAui();
  const canAttach = useAuiState((s) => s.thread.capabilities.attachments);

  const [permissionMode, setPermissionMode] = useState<PermissionMode>("manual");
  const [modelId, setModelId] = useState<string>();
  const [reasoning, setReasoning] = useState<ReasoningEffort>(RECOMMENDED_EFFORT);
  const [toolIds, setToolIds] = useState<string[]>([]);
  const [skillIds, setSkillIds] = useState<string[]>([]);

  const models = getModels();
  // Until the user picks one, the first model is the default
  const model = models.find((model) => model.id === modelId) ?? models[0];

  function addFiles(files: File[]) {
    for (const file of files) {
      // The runtime reports failures through the attachment's status
      aui.composer.addAttachment(file).catch(() => undefined);
    }
  }

  return (
    // Stacks the two control groups when the composer is narrower than 24rem (a typical task pane)
    <div className="@container flex w-full flex-col gap-1.5" data-testid="composer-container">
      <UIComposer className="gap-3 rounded-2xl p-3">
        <ComposerAttachments />
        <div className="flex min-h-0 items-end gap-2">
          <ComposerInput
            placeholder={m.composer_placeholder()}
            aria-label={m.composer_label()}
            autoFocus
            className="min-h-12 min-w-0 flex-1 py-1 leading-6"
          />
          <ComposerSend tooltip={m.composer_send()} />
          <ComposerCancel tooltip={m.composer_stop()} />
        </div>
      </UIComposer>

      <div className="flex @sm:flex-row flex-col items-start @sm:items-center @sm:justify-between @sm:gap-2 gap-1">
        <div className="flex min-w-0 items-center gap-0.5">
          <AddMenu
            onAddFiles={canAttach ? addFiles : undefined}
            labels={{ trigger: m.composer_add(), addFiles: m.composer_add_files() }}
            selections={[
              {
                id: "tools",
                label: m.composer_tools(),
                icon: <ToolIcon />,
                emptyLabel: m.composer_no_tools(),
                // No tools to pick until the backend lists them
                options: [],
                selectedIds: toolIds,
                onSelectedIdsChange: setToolIds,
              },
              {
                id: "skills",
                label: m.composer_skills(),
                icon: <SkillIcon />,
                emptyLabel: m.composer_no_skills(),
                options: [],
                selectedIds: skillIds,
                onSelectedIdsChange: setSkillIds,
              },
            ]}
          />
          {canAttach && (
            <MicrophoneButton
              onRecorded={(file) => addFiles([file])}
              getFileName={(date) =>
                m.composer_recording_name({
                  time: date.toLocaleTimeString().replaceAll(":", "-"),
                })
              }
              labels={{
                record: m.composer_record(),
                stop: m.composer_stop_recording(),
                unavailable: m.composer_microphone_unavailable(),
              }}
            />
          )}
          <PermissionSelect
            options={getPermissionOptions()}
            value={permissionMode}
            onValueChange={setPermissionMode}
            labels={{
              title: m.composer_permissions(),
              search: m.composer_permissions_search(),
              empty: m.composer_no_results(),
            }}
          />
        </div>

        <div className="flex min-w-0 items-center gap-0.5">
          <ModelSelect
            models={models}
            value={model}
            onValueChange={(model) => setModelId(model.id)}
            labels={{
              title: m.composer_model(),
              search: m.composer_models_search(),
              empty: m.composer_no_results(),
            }}
          />
          <EffortSelect
            levels={getEffortLevels()}
            value={reasoning}
            onValueChange={setReasoning}
            recommended={RECOMMENDED_EFFORT}
            labels={{
              title: m.composer_effort(),
              faster: m.composer_effort_faster(),
              smarter: m.composer_effort_smarter(),
              recommended: m.composer_effort_recommended(),
              about: m.composer_effort_about(),
              help: m.composer_effort_help(),
            }}
          />
        </div>
      </div>
    </div>
  );
}
