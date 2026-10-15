import { cn } from "cn";
import { FileText } from "lucide-react";
import { Source, SourceContent, SourceTrigger } from "../source";

/** A web page the response is based on. Shaped like the AI SDK's `SourceUrlUIPart`. */
export type ChatUrlSource = {
  type: "source-url";
  sourceId: string;
  url: string;
  title?: string;
};

/** A document the response is based on. Shaped like the AI SDK's `SourceDocumentUIPart`. */
export type ChatDocumentSource = {
  type: "source-document";
  sourceId: string;
  mediaType: string;
  title: string;
  filename?: string;
};

export type ChatSource = ChatUrlSource | ChatDocumentSource;

export function isChatSource(part: { type: string }): part is ChatSource {
  return part.type === "source-url" || part.type === "source-document";
}

export type ChatSourcesLabels = {
  /** Names the list, for screen readers. */
  sources: string;
};

export type ChatSourcesProps = {
  sources: ChatSource[];
  labels: ChatSourcesLabels;
  className?: string;
};

/** What the response is based on: web pages, which preview on hover, and documents. */
export function ChatSources({ sources, labels, className }: ChatSourcesProps) {
  return (
    <ul
      aria-label={labels.sources}
      className={cn("flex flex-wrap gap-1.5", className)}
      data-testid="message-sources"
    >
      {sources.map((source) => (
        <li key={source.sourceId} className="flex">
          {source.type === "source-url" ? (
            <Source href={source.url}>
              <SourceTrigger />
              <SourceContent
                title={source.title ?? source.url}
                description={source.title ? source.url : undefined}
              />
            </Source>
          ) : (
            <DocumentSource source={source} />
          )}
        </li>
      ))}
    </ul>
  );
}

/** Styled like `SourceTrigger`, but documents have no link to open. */
function DocumentSource({ source }: { source: ChatDocumentSource }) {
  return (
    <span
      className="inline-flex h-5 max-w-40 items-center gap-1 rounded-full bg-muted px-1.5 text-muted-foreground text-xs"
      title={source.filename ?? source.title}
    >
      <FileText className="size-3 shrink-0" />
      <span className="truncate">{source.title}</span>
    </span>
  );
}
