import { cn } from "cn";
import { ChevronDown } from "lucide-react";
import { useStickToBottomContext } from "use-stick-to-bottom";
import { Button } from "./button";

/*
 * prompt-kit's ScrollButton (https://www.prompt-kit.com/docs/scroll-button),
 * for inside a `ChatContainerRoot`. Icon-only, so give it an `aria-label`.
 * While hidden at the bottom, it also leaves the tab order and the
 * accessibility tree, not just the screen. A given `onClick` runs after the
 * scroll instead of replacing it, e.g. when rendered by a tooltip trigger.
 */

export type ScrollButtonProps = React.ComponentProps<typeof Button>;

function ScrollButton({
  className,
  variant = "outline",
  size = "sm",
  onClick,
  ...props
}: ScrollButtonProps) {
  const { isAtBottom, scrollToBottom } = useStickToBottomContext();

  return (
    <Button
      variant={variant}
      size={size}
      className={cn(
        "size-10 rounded-full transition-all duration-150 ease-out",
        !isAtBottom
          ? "translate-y-0 scale-100 opacity-100"
          : "pointer-events-none translate-y-4 scale-95 opacity-0",
        className,
      )}
      tabIndex={isAtBottom ? -1 : undefined}
      aria-hidden={isAtBottom}
      {...props}
      onClick={async (event) => {
        onClick?.(event);
        await scrollToBottom();
      }}
    >
      <ChevronDown className="size-5" />
    </Button>
  );
}

export { ScrollButton };
