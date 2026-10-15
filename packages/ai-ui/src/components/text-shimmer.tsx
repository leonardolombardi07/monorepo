import { cn } from "cn";
import type { ComponentProps } from "react";

export type TextShimmerProps = ComponentProps<"span"> & {
  /** Seconds per sweep. */
  duration?: number;
};

/** Text with a highlight sweeping across it, for work in progress ("Thinking..."). */
export function TextShimmer({ duration = 2, className, style, ...props }: TextShimmerProps) {
  return (
    <span
      data-slot="text-shimmer"
      className={cn(
        "animate-[ai-ui-shimmer_linear_infinite] bg-size-[200%_auto] bg-clip-text text-transparent motion-reduce:animate-none motion-reduce:text-muted-foreground",
        className,
      )}
      style={{
        backgroundImage:
          "linear-gradient(to right, var(--muted-foreground) 30%, var(--foreground) 50%, var(--muted-foreground) 70%)",
        animationDuration: `${duration}s`,
        ...style,
      }}
      {...props}
    />
  );
}
