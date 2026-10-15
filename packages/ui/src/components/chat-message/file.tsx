import { cn } from "cn";
import { AttachmentCard, getFileExtension, getFileIcon } from "../attachment-card";

/** A file in a message. Reasoning files have no name. */
export type ChatFileData = {
  mediaType: string;
  /** Any URL an `<img>` can load, e.g. a data URL. */
  url: string;
  filename?: string;
};

export type ChatFileLabels = {
  /** Alt text for an image without a name. */
  image: string;
};

export type ChatFileProps = {
  file: ChatFileData;
  labels: ChatFileLabels;
  className?: string;
};

/** An image, or a card naming any other file. */
export function ChatFile({ file, labels, className }: ChatFileProps) {
  if (file.mediaType.startsWith("image/")) {
    return (
      <img
        src={file.url}
        alt={file.filename ?? labels.image}
        className={cn("max-h-80 max-w-full rounded-lg border object-contain", className)}
      />
    );
  }

  const extension = getFileExtension(file);
  return (
    <div title={file.filename} className={className}>
      <AttachmentCard
        icon={getFileIcon(file.mediaType)}
        name={file.filename ?? extension}
        detail={extension}
      />
    </div>
  );
}
