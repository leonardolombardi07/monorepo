import { cn } from "cn";
import { FileHeadphone, File as FileIcon, FileText, FileVideoCamera } from "lucide-react";
import type { ComponentType } from "react";

/** Any icon component, e.g. one of Lucide's. */
export type AttachmentCardIcon = ComponentType<{ className?: string }>;

/** The parts of a file its icon and extension come from. */
export type AttachmentCardFile = { mediaType: string; filename?: string };

export type AttachmentCardProps = {
  icon: AttachmentCardIcon;
  name: string;
  /** A second line, e.g. the file's extension or the kind of thing attached. */
  detail: string;
  className?: string;
};

/** A file, tool or agent attached to a prompt, before and after it's sent. */
export function AttachmentCard({ icon: Icon, name, detail, className }: AttachmentCardProps) {
  return (
    <div
      className={cn(
        "flex h-12 max-w-52 items-center gap-2 rounded-lg border bg-muted/40 pr-3 pl-1.5",
        className,
      )}
    >
      <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted">
        <Icon className="size-4 text-muted-foreground" />
      </div>
      <div className="flex min-w-0 flex-col">
        <span className="truncate text-sm">{name}</span>
        <span className="truncate text-muted-foreground text-xs">{detail}</span>
      </div>
    </div>
  );
}

export function getFileIcon(mediaType: string): AttachmentCardIcon {
  if (mediaType.startsWith("audio/")) return FileHeadphone;
  if (mediaType.startsWith("video/")) return FileVideoCamera;
  if (mediaType.startsWith("text/") || mediaType === "application/pdf") {
    return FileText;
  }
  return FileIcon;
}

/** `report.pdf` -> `PDF`, falling back to the media subtype. */
export function getFileExtension(file: AttachmentCardFile) {
  const extension = file.filename?.includes(".")
    ? file.filename.split(".").at(-1)
    : file.mediaType.split("/").at(-1);
  return (extension ?? "").toUpperCase();
}
