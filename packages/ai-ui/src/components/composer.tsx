import { AuiIf, ComposerPrimitive, useAui, useAuiState } from "@assistant-ui/react";
import { cn } from "cn";
import { ArrowUpIcon, PaperclipIcon, SquareIcon } from "lucide-react";
import type { ClipboardEvent, ComponentProps } from "react";
import { MarkdownTextarea } from "./markdown-textarea";
import { TooltipIconButton } from "./tooltip-icon-button";

/*
 * Where the user writes, for the app to compose with its own controls, e.g.:
 *
 *   <Composer>
 *     <ComposerAttachments />
 *     <ComposerInput placeholder="Ask anything" />
 *     <ComposerActions>
 *       <ComposerAddAttachment />
 *       <MyModelSelect className="mr-auto" />
 *       <ComposerSend />
 *       <ComposerCancel />
 *     </ComposerActions>
 *   </Composer>
 */

type ComposerProps = ComponentProps<typeof ComposerPrimitive.Root>;

/**
 * The composer's card, which takes dropped files when the runtime accepts
 * attachments. `className` styles the card; other props go to the `<form>`.
 */
function Composer({ className, children, ...props }: ComposerProps) {
  return (
    <ComposerPrimitive.Root data-slot="composer" className="flex w-full flex-col" {...props}>
      <ComposerPrimitive.AttachmentDropzone
        className={cn(
          "flex w-full cursor-text flex-col gap-2 rounded-2xl border bg-background p-2.5 shadow-xs transition-colors focus-within:border-ring",
          "data-[dragging=true]:border-ring data-[dragging=true]:border-dashed data-[dragging=true]:bg-accent/50",
          className,
        )}
        data-testid="composer"
      >
        {children}
      </ComposerPrimitive.AttachmentDropzone>
    </ComposerPrimitive.Root>
  );
}

/** Omits from each member of a union, keeping it a union (`submitMode` is one). */
type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;

type ComposerInputProps = DistributiveOmit<
  ComponentProps<typeof ComposerPrimitive.Input>,
  "render" | "asChild" | "className" | "addAttachmentOnPaste"
> & {
  /** Classes for the input's wrapper, which sets the font size, line height and padding. */
  className?: string;
};

/**
 * The message, written in Markdown and highlighted as it's typed. Enter
 * sends, Shift+Enter starts a new line.
 *
 * Pasted files are attached only when the clipboard has no text: Office apps
 * put an image of copied cells or text on the clipboard too, and pasting a
 * range from Excel should paste its text.
 */
function ComposerInput({ className, maxRows = 10, onPaste, ...props }: ComposerInputProps) {
  const aui = useAui();
  const text = useAuiState((s) => s.composer.text);

  function handlePaste(event: ClipboardEvent<HTMLTextAreaElement>) {
    onPaste?.(event);
    const files = Array.from(event.clipboardData.files);
    const hasText = Boolean(event.clipboardData.getData("text/plain"));
    const canAttach = aui.thread.getState().capabilities.attachments;
    if (event.defaultPrevented || files.length === 0 || hasText || !canAttach) return;

    event.preventDefault();
    for (const file of files) {
      // The runtime reports failures through the attachment's status
      aui.composer.addAttachment(file).catch(() => undefined);
    }
  }

  return (
    <MarkdownTextarea
      value={text}
      className={cn("px-1", className)}
      render={
        <ComposerPrimitive.Input
          rows={1}
          maxRows={maxRows}
          addAttachmentOnPaste={false}
          onPaste={handlePaste}
          data-testid="composer-input"
          {...props}
        />
      }
    />
  );
}

/** A row of controls under the input. */
function ComposerActions({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="composer-actions"
      className={cn("flex items-center gap-1", className)}
      {...props}
    />
  );
}

type ComposerButtonProps = Omit<ComponentProps<typeof TooltipIconButton>, "tooltip"> & {
  tooltip?: string;
};

/** Sends the message. Hidden while a response can be stopped, where `ComposerCancel` shows instead. */
function ComposerSend({ tooltip = "Send", className, ...props }: ComposerButtonProps) {
  return (
    <AuiIf condition={(s) => !s.composer.canCancel}>
      <ComposerPrimitive.Send
        render={
          <TooltipIconButton
            tooltip={tooltip}
            variant="default"
            className={cn("rounded-full", className)}
            data-testid="composer-send"
            {...props}
          />
        }
      >
        <ArrowUpIcon />
      </ComposerPrimitive.Send>
    </AuiIf>
  );
}

/** Stops the response being generated. Only shown while there is one. */
function ComposerCancel({ tooltip = "Stop", className, ...props }: ComposerButtonProps) {
  return (
    <AuiIf condition={(s) => s.composer.canCancel}>
      <ComposerPrimitive.Cancel
        render={
          <TooltipIconButton
            tooltip={tooltip}
            variant="default"
            className={cn("rounded-full", className)}
            data-testid="composer-cancel"
            {...props}
          />
        }
      >
        <SquareIcon className="size-3 fill-current" />
      </ComposerPrimitive.Cancel>
    </AuiIf>
  );
}

/** Opens the file picker. Hidden unless the runtime accepts attachments. */
function ComposerAddAttachment({
  tooltip = "Attach files",
  className,
  ...props
}: ComposerButtonProps) {
  return (
    <AuiIf condition={(s) => s.thread.capabilities.attachments}>
      <ComposerPrimitive.AddAttachment
        render={
          <TooltipIconButton
            tooltip={tooltip}
            className={cn("text-muted-foreground", className)}
            data-testid="composer-add-attachment"
            {...props}
          />
        }
      >
        <PaperclipIcon />
      </ComposerPrimitive.AddAttachment>
    </AuiIf>
  );
}

export {
  Composer,
  ComposerActions,
  ComposerAddAttachment,
  ComposerCancel,
  ComposerInput,
  ComposerSend,
};
