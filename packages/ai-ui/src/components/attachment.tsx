import {
  type Attachment,
  AttachmentPrimitive,
  ComposerPrimitive,
  type FileMessagePartProps,
  type ImageMessagePartProps,
  MessagePrimitive,
} from "@assistant-ui/react";
import { cn } from "cn";
import {
  CircleAlertIcon,
  FileIcon,
  FileSpreadsheetIcon,
  FileTextIcon,
  LoaderCircleIcon,
  type LucideIcon,
  XIcon,
} from "lucide-react";
import { type ComponentProps, useEffect, useState } from "react";
import { TooltipIconButton } from "./tooltip-icon-button";

/** `report.pdf` -> `PDF`, falling back to the media subtype. */
function getFileExtension(name: string | undefined, contentType: string | undefined) {
  const extension = name?.includes(".") ? name.split(".").at(-1) : contentType?.split("/").at(-1);
  return (extension ?? "").toUpperCase();
}

function getFileIcon(contentType: string | undefined, name: string | undefined): LucideIcon {
  const extension = getFileExtension(name, contentType);
  if (["XLSX", "XLS", "XLSM", "CSV", "TSV"].includes(extension)) return FileSpreadsheetIcon;
  if (contentType?.startsWith("text/") || contentType === "application/pdf") return FileTextIcon;
  return FileIcon;
}

type AttachmentTileProps = ComponentProps<"div"> & {
  name: string;
  contentType?: string | undefined;
  /** A preview, for images. */
  src?: string | undefined;
  /** Whether it's still being prepared, or failed to be. */
  state?: "uploading" | "error" | undefined;
};

/** A file attached to a message: a thumbnail for images, a card naming any other file. */
function AttachmentTile({
  name,
  contentType,
  src,
  state,
  className,
  ...props
}: AttachmentTileProps) {
  const extension = getFileExtension(name, contentType);
  const Icon = getFileIcon(contentType, name);

  return (
    <div
      data-slot="attachment-tile"
      data-state={state}
      title={name}
      className={cn(
        "relative flex h-12 items-center overflow-hidden rounded-lg border bg-muted/40 data-[state=error]:border-destructive/50",
        src ? "w-12" : "max-w-52 gap-2 pr-3 pl-1.5",
        className,
      )}
      {...props}
    >
      {src ? (
        <img src={src} alt={name} className="size-full object-cover" />
      ) : (
        <>
          <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted">
            <Icon aria-hidden className="size-4 text-muted-foreground" />
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-sm">{name}</span>
            <span className="truncate text-muted-foreground text-xs">{extension}</span>
          </div>
        </>
      )}

      {state && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-[1px]">
          {state === "uploading" ? (
            <LoaderCircleIcon aria-hidden className="size-4 animate-spin text-muted-foreground" />
          ) : (
            <CircleAlertIcon aria-hidden className="size-4 text-destructive" />
          )}
        </div>
      )}
    </div>
  );
}

/** A URL for a local file, revoked once it's no longer shown. */
function useObjectUrl(file: File | undefined) {
  const [url, setUrl] = useState<string>();

  useEffect(() => {
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    return () => {
      URL.revokeObjectURL(objectUrl);
      setUrl(undefined);
    };
  }, [file]);

  return url;
}

function getAttachmentState(attachment: Attachment) {
  if (attachment.status.type === "running") return "uploading";
  if (attachment.status.type === "incomplete" && attachment.status.reason === "error") {
    return "error";
  }
  return undefined;
}

/** The image an attachment carries once sent, e.g. as a data URL. */
function getSentImage(attachment: Attachment) {
  for (const part of attachment.content ?? []) {
    if (part.type === "image") return part.image;
    if (part.type === "file" && part.mimeType.startsWith("image/")) {
      return toSource(part.data, part.mimeType);
    }
  }
  return undefined;
}

type AttachmentItemProps = {
  attachment: Attachment;
  /** Shows a button to remove it, as in the composer. */
  removable?: boolean;
  removeTooltip?: (name: string) => string;
};

function AttachmentItem({
  attachment,
  removable = false,
  removeTooltip = (name) => `Remove ${name}`,
}: AttachmentItemProps) {
  const isImage = attachment.type === "image";
  const localUrl = useObjectUrl(isImage ? attachment.file : undefined);

  return (
    <AttachmentPrimitive.Root
      data-slot="attachment"
      className="group/attachment relative"
      data-testid="attachment"
    >
      <AttachmentTile
        name={attachment.name}
        contentType={attachment.contentType}
        src={isImage ? (localUrl ?? getSentImage(attachment)) : undefined}
        state={getAttachmentState(attachment)}
      />
      {removable && (
        <AttachmentPrimitive.Remove
          render={
            <TooltipIconButton
              tooltip={removeTooltip(attachment.name)}
              variant="secondary"
              size="icon-xs"
              className={cn(
                "absolute -top-1.5 -right-1.5 size-5 rounded-full border shadow-xs",
                // Shown on hover, and whenever it could be reached by keyboard
                "opacity-0 focus-visible:opacity-100 group-focus-within/attachment:opacity-100 group-hover/attachment:opacity-100",
              )}
              data-testid="attachment-remove"
            />
          }
        >
          <XIcon />
        </AttachmentPrimitive.Remove>
      )}
    </AttachmentPrimitive.Root>
  );
}

type AttachmentsProps = ComponentProps<"div"> & {
  removeTooltip?: AttachmentItemProps["removeTooltip"];
};

/** The files attached to the message being written, each removable. Hidden while there are none. */
function ComposerAttachments({ removeTooltip, className, ...props }: AttachmentsProps) {
  return (
    <div
      data-slot="composer-attachments"
      className={cn("flex flex-wrap gap-2 empty:hidden", className)}
      {...props}
    >
      <ComposerPrimitive.Attachments>
        {({ attachment }) => (
          <AttachmentItem attachment={attachment} removable removeTooltip={removeTooltip} />
        )}
      </ComposerPrimitive.Attachments>
    </div>
  );
}

/** The files a sent message carries. Hidden while there are none. */
function MessageAttachments({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="message-attachments"
      className={cn("flex flex-wrap gap-2 empty:hidden", className)}
      {...props}
    >
      <MessagePrimitive.Attachments>
        {({ attachment }) => <AttachmentItem attachment={attachment} />}
      </MessagePrimitive.Attachments>
    </div>
  );
}

/** A file part's data, which is a URL or bare base64, as an image source. */
function toSource(data: string, mimeType: string) {
  return /^(data|https?|blob):/.test(data) ? data : `data:${mimeType};base64,${data}`;
}

function SentImage({ src, alt }: { src: string; alt: string }) {
  return (
    <img
      src={src}
      alt={alt}
      className="max-h-80 max-w-full self-start rounded-lg border object-contain"
    />
  );
}

/** `MessagePrimitive.Parts`' `File` slot. */
function FilePart({ filename, mimeType, data }: FileMessagePartProps) {
  if (mimeType.startsWith("image/")) {
    return <SentImage src={toSource(data, mimeType)} alt={filename ?? ""} />;
  }
  return (
    <AttachmentTile
      name={filename ?? getFileExtension(undefined, mimeType)}
      contentType={mimeType}
    />
  );
}

/** `MessagePrimitive.Parts`' `Image` slot. */
function ImagePart({ image, filename }: ImageMessagePartProps) {
  return <SentImage src={image} alt={filename ?? ""} />;
}

export { AttachmentTile, ComposerAttachments, FilePart, ImagePart, MessageAttachments };
