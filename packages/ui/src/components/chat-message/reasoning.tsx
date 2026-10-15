import { Reasoning, ReasoningContent, ReasoningTrigger } from "../reasoning";
import { TextShimmer } from "../text-shimmer";

export type ChatReasoningLabels = {
  /** The trigger's label once the model is done thinking. */
  reasoning: string;
  /** The trigger's label while the model is thinking. */
  reasoningStreaming: string;
};

export type ChatReasoningProps = {
  /** What the model thought, in Markdown. */
  text: string;
  /** Whether the model is still thinking: it stays open, and its label shimmers. */
  isStreaming: boolean;
  labels: ChatReasoningLabels;
  className?: string;
};

/** What the model thought before answering, open while it's thinking. */
export function ChatReasoning({ text, isStreaming, labels, className }: ChatReasoningProps) {
  // Some providers keep the reasoning hidden and only send that it happened
  if (!isStreaming && text.trim() === "") return null;

  return (
    <Reasoning isStreaming={isStreaming} className={className}>
      <ReasoningTrigger
        className="text-muted-foreground text-sm hover:text-foreground"
        data-testid="message-reasoning"
      >
        {isStreaming ? <TextShimmer>{labels.reasoningStreaming}</TextShimmer> : labels.reasoning}
      </ReasoningTrigger>
      <ReasoningContent markdown contentClassName="prose-neutral mt-2 max-w-none border-l-2 pl-4">
        {text}
      </ReasoningContent>
    </Reasoning>
  );
}
