import { X } from "lucide-react";
import type { ComponentType, ReactNode } from "react";
import { AttachmentCard, getFileExtension, getFileIcon } from "../attachment-card";
import { Button } from "../button";
import { Tooltip, TooltipContent, TooltipTrigger } from "../tooltip";

/** A file to send, as a data URL. Shaped like the AI SDK's `FileUIPart`. */
export type ChatPromptInputFile = {
  type: "file";
  mediaType: string;
  filename?: string;
  url: string;
};

/** A file attached to the prompt, keyed for the list while it's edited. */
export type ChatPromptInputAttachment = { id: string; file: ChatPromptInputFile };

/** Something else attached to the prompt, e.g. a picked tool or skill. */
export type ChatPromptInputAttachedItem = {
  /** Unique among the items. */
  id: string;
  icon: ComponentType<{ className?: string }>;
  name: string;
  /** What it is, e.g. "Tool". */
  detail: string;
  onRemove: () => void;
};

/** Reads files as the data-URL parts the AI SDK's `sendMessage` accepts. */
export async function toChatPromptInputAttachments(
  files: File[],
): Promise<ChatPromptInputAttachment[]> {
  return Promise.all(
    files.map(async (file) => ({
      id: generateId(),
      file: {
        type: "file" as const,
        // Browsers leave the type empty for extensions they don't know
        mediaType: file.type || "application/octet-stream",
        filename: file.name,
        url: await readAsDataUrl(file),
      },
    })),
  );
}

function readAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function generateId() {
  // `randomUUID` only exists in secure contexts
  return typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

export type ChatAttachmentsLabels = {
  /** Names the list, for screen readers. */
  attachments: string;
  /** Removes an attachment, e.g. `name => \`Remove ${name}\``. */
  remove: (name: string) => string;
};

export type ChatAttachmentsProps = {
  files: ChatPromptInputAttachment[];
  onRemoveFile: (id: string) => void;
  items?: ChatPromptInputAttachedItem[];
  labels: ChatAttachmentsLabels;
};

export function ChatAttachments({ files, onRemoveFile, items = [], labels }: ChatAttachmentsProps) {
  return (
    <ul
      aria-label={labels.attachments}
      className="flex shrink-0 flex-wrap gap-2"
      data-testid="prompt-input-attachments"
    >
      {files.map(({ id, file }) => {
        const name = file.filename ?? getFileExtension(file);
        return (
          <AttachmentItem
            key={id}
            name={name}
            removeLabel={labels.remove(name)}
            onRemove={() => onRemoveFile(id)}
          >
            {file.mediaType.startsWith("image/") ? (
              <img src={file.url} alt={name} className="size-12 rounded-lg border object-cover" />
            ) : (
              <AttachmentCard
                icon={getFileIcon(file.mediaType)}
                name={name}
                detail={getFileExtension(file)}
              />
            )}
          </AttachmentItem>
        );
      })}

      {items.map((item) => (
        <AttachmentItem
          key={item.id}
          name={item.name}
          removeLabel={labels.remove(item.name)}
          onRemove={item.onRemove}
        >
          <AttachmentCard icon={item.icon} name={item.name} detail={item.detail} />
        </AttachmentItem>
      ))}
    </ul>
  );
}

function AttachmentItem({
  name,
  removeLabel,
  onRemove,
  children,
}: {
  name: string;
  removeLabel: string;
  onRemove: () => void;
  children: ReactNode;
}) {
  return (
    <li className="group/attachment relative" title={name}>
      {children}
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              variant="secondary"
              size="icon-xs"
              aria-label={removeLabel}
              onClick={onRemove}
              className="absolute -top-1.5 -right-1.5 size-5 rounded-full border opacity-0 shadow-xs focus-visible:opacity-100 group-focus-within/attachment:opacity-100 group-hover/attachment:opacity-100"
            />
          }
        >
          <X />
        </TooltipTrigger>
        <TooltipContent>{removeLabel}</TooltipContent>
      </Tooltip>
    </li>
  );
}
