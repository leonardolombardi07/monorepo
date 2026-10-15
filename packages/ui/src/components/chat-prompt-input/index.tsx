import { cn } from "cn";
import { ArrowUp, Square, Upload } from "lucide-react";
import { type ReactNode, useCallback, useState } from "react";
import { Button } from "../button";
import { FileUpload, FileUploadContent } from "../file-upload";
import {
  PromptInput,
  PromptInputAction,
  PromptInputActions,
  usePromptInput,
} from "../prompt-input";
import { ChatAddMenu, type ChatAddMenuLabels, type ChatPromptInputGroup } from "./add-menu";
import {
  ChatAttachments,
  type ChatAttachmentsLabels,
  type ChatPromptInputAttachment,
  type ChatPromptInputFile,
  toChatPromptInputAttachments,
} from "./attachments";
import { ChatEditor, type ChatEditorLabels, type ChatEditorRenderProps } from "./editor";
import { ChatMicrophoneButton, type ChatMicrophoneButtonLabels } from "./microphone-button";

/** Shaped like the AI SDK's `ChatStatus`. */
export type ChatPromptInputStatus = "submitted" | "streaming" | "ready" | "error";

/** What gets sent. Shaped like what the AI SDK's `sendMessage` accepts. */
export type ChatPromptInputMessage = {
  /** Markdown. */
  text: string;
  files: ChatPromptInputFile[];
};

export type ChatSendButtonLabels = { send: string; stop: string };

/** Every string the prompt input shows, besides its controls' own. */
export type ChatPromptInputLabels = ChatEditorLabels &
  ChatAddMenuLabels &
  ChatAttachmentsLabels &
  ChatMicrophoneButtonLabels &
  ChatSendButtonLabels & {
    /** Over the screen while files are dragged in. */
    dropFiles: string;
  };

export type ChatPromptInputProps = {
  status: ChatPromptInputStatus;
  /** Called with the draft, which then clears. Wrap `sendMessage` to add a request body. */
  onSubmit: (message: ChatPromptInputMessage) => void;
  onStop: () => void;
  /** Whether a message can be sent at all, e.g. once a model is picked. Defaults to true. */
  canSubmit?: boolean;
  /** Things to pick in the add menu, e.g. tools and skills. Picked ones show as attachments. */
  groups?: ChatPromptInputGroup[];
  /** Controls after the add menu and microphone, e.g. a permission select. */
  leadingControls?: ReactNode;
  /** Controls at the other end, e.g. the model and effort selects. */
  trailingControls?: ReactNode;
  /** Defaults to true. */
  showMicrophone?: boolean;
  /** Replaces the default textarea, e.g. with a Markdown editor. */
  renderEditor?: (props: ChatEditorRenderProps) => ReactNode;
  labels: ChatPromptInputLabels;
  className?: string;
};

/**
 * The prompt, its attachments and its controls. It keeps the draft (text and
 * files); everything else, picked tools and settings included, comes in as props.
 */
export function ChatPromptInput({
  status,
  onSubmit,
  onStop,
  canSubmit: canSubmitAtAll = true,
  groups = [],
  leadingControls,
  trailingControls,
  showMicrophone = true,
  renderEditor,
  labels,
  className,
}: ChatPromptInputProps) {
  const [text, setText] = useState("");
  const [files, setFiles] = useState<ChatPromptInputAttachment[]>([]);

  const items = groups.flatMap((group) =>
    group.options
      .filter((option) => group.selectedIds.includes(option.id))
      .map((option) => ({
        id: `${group.id}:${option.id}`,
        icon: group.icon,
        name: option.name,
        detail: group.itemLabel,
        onRemove: () =>
          group.onSelectedIdsChange(group.selectedIds.filter((id) => id !== option.id)),
      })),
  );
  const hasAttachments = files.length + items.length > 0;

  const isBusy = status === "submitted" || status === "streaming";
  const canSubmit = canSubmitAtAll && (text.trim() !== "" || files.length > 0);

  // Stable, because `FileUpload` re-subscribes its window listeners when it changes
  const addFiles = useCallback(async (newFiles: File[]) => {
    const attachments = await toChatPromptInputAttachments(newFiles);
    setFiles((previous) => [...previous, ...attachments]);
  }, []);

  function submit() {
    if (isBusy || !canSubmit) return;
    onSubmit({ text: text.trim(), files: files.map(({ file }) => file) });
    // Picked tools and skills stay picked for the next message, like the settings
    setText("");
    setFiles([]);
  }

  return (
    <FileUpload onFilesAdded={addFiles}>
      <div
        className={cn("@container flex min-h-0 flex-col gap-1.5", className)}
        data-testid="prompt-input"
      >
        <PromptInput
          value={text}
          onValueChange={setText}
          onSubmit={submit}
          isLoading={isBusy}
          className="flex min-h-0 flex-col gap-3 rounded-2xl p-3 transition-colors focus-within:border-ring"
        >
          {hasAttachments && (
            <ChatAttachments
              files={files}
              onRemoveFile={(id) =>
                setFiles((previous) => previous.filter((file) => file.id !== id))
              }
              items={items}
              labels={labels}
            />
          )}

          <div className="flex min-h-0 items-end gap-2">
            <ChatEditor onPasteFiles={addFiles} render={renderEditor} labels={labels} />
            <PromptInputActions className="shrink-0">
              <SendButton isBusy={isBusy} canSubmit={canSubmit} onStop={onStop} labels={labels} />
            </PromptInputActions>
          </div>
        </PromptInput>

        {/* Stacks the two control groups when the prompt is narrower than 24rem (a typical task pane) */}
        <div className="flex shrink-0 @sm:flex-row flex-col items-start @sm:items-center @sm:justify-between @sm:gap-2 gap-1">
          <div className="flex min-w-0 items-center gap-0.5">
            <ChatAddMenu groups={groups} labels={labels} />
            {showMicrophone && (
              <ChatMicrophoneButton onRecorded={(file) => addFiles([file])} labels={labels} />
            )}
            {leadingControls}
          </div>

          {trailingControls && (
            <div className="flex min-w-0 items-center gap-0.5">{trailingControls}</div>
          )}
        </div>
      </div>

      <FileUploadContent>
        <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed p-12 text-muted-foreground">
          <Upload className="size-8" />
          <p className="text-sm">{labels.dropFiles}</p>
        </div>
      </FileUploadContent>
    </FileUpload>
  );
}

type SendButtonProps = {
  isBusy: boolean;
  canSubmit: boolean;
  onStop: () => void;
  labels: ChatSendButtonLabels;
};

/** Sends the prompt, or stops the response while one is being generated. */
function SendButton({ isBusy, canSubmit, onStop, labels }: SendButtonProps) {
  const { onSubmit, textareaRef } = usePromptInput();
  const label = isBusy ? labels.stop : labels.send;

  function handleClick() {
    if (isBusy) onStop();
    else onSubmit?.();
    // Keep typing without reaching for the mouse
    textareaRef.current?.focus();
  }

  return (
    <PromptInputAction tooltip={label}>
      <Button
        size="icon-sm"
        className="rounded-full"
        aria-label={label}
        disabled={!isBusy && !canSubmit}
        onClick={handleClick}
        data-testid="prompt-input-send"
      >
        {isBusy ? <Square className="size-3 fill-current" /> : <ArrowUp />}
      </Button>
    </PromptInputAction>
  );
}

export {
  ChatAddMenu,
  type ChatAddMenuLabels,
  type ChatAddMenuProps,
  type ChatPromptInputGroup,
  type ChatPromptInputOption,
} from "./add-menu";
export {
  ChatAttachments,
  type ChatAttachmentsLabels,
  type ChatAttachmentsProps,
  type ChatPromptInputAttachedItem,
  type ChatPromptInputAttachment,
  type ChatPromptInputFile,
  toChatPromptInputAttachments,
} from "./attachments";
export {
  ChatEditor,
  type ChatEditorLabels,
  type ChatEditorProps,
  type ChatEditorRenderProps,
} from "./editor";
export {
  type ChatEffortOption,
  ChatEffortSelect,
  type ChatEffortSelectLabels,
  type ChatEffortSelectProps,
} from "./effort-select";
export {
  ChatMicrophoneButton,
  type ChatMicrophoneButtonLabels,
  type ChatMicrophoneButtonProps,
} from "./microphone-button";
export {
  type ChatModelOption,
  ChatModelSelect,
  type ChatModelSelectLabels,
  type ChatModelSelectProps,
} from "./model-select";
export {
  type ChatPermissionOption,
  ChatPermissionSelect,
  type ChatPermissionSelectLabels,
  type ChatPermissionSelectProps,
} from "./permission-select";
