import { Check, Copy, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../button";
import { MessageAction } from "../message";

export type ChatCopyActionLabels = {
  copy: string;
  /** Shown for a moment after copying. */
  copied: string;
};

export type ChatCopyActionProps = {
  /** What gets copied, e.g. the message's Markdown. */
  text: string;
  labels: ChatCopyActionLabels;
  /** How long the button confirms the copy, in milliseconds. */
  copiedDuration?: number;
};

export function ChatCopyAction({ text, labels, copiedDuration = 2000 }: ChatCopyActionProps) {
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (!isCopied) return;
    const timeout = setTimeout(() => setIsCopied(false), copiedDuration);
    return () => clearTimeout(timeout);
  }, [isCopied, copiedDuration]);

  async function copy() {
    await navigator.clipboard.writeText(text);
    setIsCopied(true);
  }

  const label = isCopied ? labels.copied : labels.copy;

  return (
    <MessageAction tooltip={label}>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={label}
        onClick={copy}
        data-testid="message-copy"
      >
        {isCopied ? <Check /> : <Copy />}
      </Button>
    </MessageAction>
  );
}

export type ChatRegenerateActionLabels = { regenerate: string };

export type ChatRegenerateActionProps = {
  onRegenerate: () => void;
  labels: ChatRegenerateActionLabels;
};

export function ChatRegenerateAction({ onRegenerate, labels }: ChatRegenerateActionProps) {
  return (
    <MessageAction tooltip={labels.regenerate}>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={labels.regenerate}
        onClick={onRegenerate}
        data-testid="message-regenerate"
      >
        <RotateCcw />
      </Button>
    </MessageAction>
  );
}
