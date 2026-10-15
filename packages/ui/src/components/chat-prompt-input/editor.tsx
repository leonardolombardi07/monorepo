import type { ClipboardEvent, ReactNode, RefObject } from "react";
import { PromptInputTextarea, usePromptInput } from "../prompt-input";

export type ChatEditorLabels = {
  placeholder: string;
  /** Names the editor, for screen readers. */
  label: string;
};

/** What a custom editor gets, wired to the surrounding `PromptInput`. */
export type ChatEditorRenderProps = {
  /** Focused when the prompt input is clicked. */
  ref: RefObject<HTMLElement | null>;
  value: string;
  onValueChange: (value: string) => void;
  /** Call on Enter. */
  onSubmit: () => void;
  onPasteFiles: (files: File[]) => void;
  disabled: boolean;
  placeholder: string;
  "aria-label": string;
};

export type ChatEditorProps = {
  onPasteFiles: (files: File[]) => void;
  /** Replaces the default textarea, e.g. with a Markdown editor. */
  render?: (props: ChatEditorRenderProps) => ReactNode;
  autoFocus?: boolean;
  labels: ChatEditorLabels;
};

/**
 * The prompt's text field, wired to the `PromptInput` context: value, submit on
 * Enter, and focus when the container is clicked. A plain textarea by default.
 */
export function ChatEditor({ onPasteFiles, render, autoFocus = true, labels }: ChatEditorProps) {
  const { value, setValue, onSubmit, disabled, textareaRef } = usePromptInput();

  function handlePaste(event: ClipboardEvent<HTMLTextAreaElement>) {
    // Copying from apps often puts both text and an image of it on the clipboard: keep the text
    const files = Array.from(event.clipboardData.files);
    if (files.length === 0 || event.clipboardData.types.includes("text/plain")) return;
    event.preventDefault();
    onPasteFiles(files);
  }

  return (
    // Grows with the content, then scrolls once the prompt input hits its max height
    <div className="min-h-0 flex-1 self-stretch overflow-y-auto">
      {render ? (
        render({
          ref: textareaRef,
          value,
          onValueChange: setValue,
          onSubmit: () => onSubmit?.(),
          onPasteFiles,
          disabled: disabled ?? false,
          placeholder: labels.placeholder,
          "aria-label": labels.label,
        })
      ) : (
        <PromptInputTextarea
          onPaste={handlePaste}
          autoFocus={autoFocus}
          placeholder={labels.placeholder}
          aria-label={labels.label}
          className="min-h-12 px-0 py-1 text-sm leading-6 dark:bg-transparent"
          data-testid="prompt-input-editor"
        />
      )}
    </div>
  );
}
