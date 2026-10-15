import { cn } from "cn";

/*
 * prompt-kit's TextShimmer (https://www.prompt-kit.com/docs/text-shimmer).
 * The `shimmer` keyframes live in `assets/main.css`.
 */

export type TextShimmerProps = {
  as?: "span" | "p" | "div";
  /** Seconds per sweep. */
  duration?: number;
  /** Width of the highlight, as a percentage of the text (5-45). */
  spread?: number;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLElement>;

function TextShimmer({
  as: Component = "span",
  className,
  duration = 4,
  spread = 20,
  children,
  style,
  ...props
}: TextShimmerProps) {
  const dynamicSpread = Math.min(Math.max(spread, 5), 45);

  return (
    <Component
      className={cn(
        "bg-size-[200%_auto] bg-clip-text font-medium text-transparent",
        "animate-[shimmer_4s_infinite_linear] motion-reduce:animate-none",
        className,
      )}
      style={{
        backgroundImage: `linear-gradient(to right, var(--muted-foreground) ${50 - dynamicSpread}%, var(--foreground) 50%, var(--muted-foreground) ${50 + dynamicSpread}%)`,
        animationDuration: `${duration}s`,
        ...style,
      }}
      {...props}
    >
      {children}
    </Component>
  );
}

export { TextShimmer };
