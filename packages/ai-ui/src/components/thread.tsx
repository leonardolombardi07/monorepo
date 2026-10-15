import { ThreadPrimitive } from "@assistant-ui/react";
import { cn } from "cn";
import { ArrowDownIcon } from "lucide-react";
import type { ComponentProps } from "react";
import { TooltipIconButton } from "./tooltip-icon-button";

/*
 * The conversation's frame. Messages and the composer are composed inside by
 * the app, e.g.:
 *
 *   <Thread>
 *     <ThreadViewport>
 *       <ThreadPrimitive.Messages>{() => <MyMessage />}</ThreadPrimitive.Messages>
 *       <ThreadViewportFooter>
 *         <ThreadScrollToBottom />
 *         <MyComposer />
 *       </ThreadViewportFooter>
 *     </ThreadViewport>
 *   </Thread>
 */

/** Fills its parent, so give the parent a bounded height. */
function Thread({ className, ...props }: ComponentProps<typeof ThreadPrimitive.Root>) {
  return (
    <ThreadPrimitive.Root
      data-slot="thread"
      className={cn("@container flex h-full min-h-0 flex-col bg-background", className)}
      {...props}
    />
  );
}

/**
 * The scrolling area. It follows new content down while the user is at the
 * bottom, and stops when they scroll up.
 */
function ThreadViewport({ className, ...props }: ComponentProps<typeof ThreadPrimitive.Viewport>) {
  return (
    <ThreadPrimitive.Viewport
      data-slot="thread-viewport"
      className={cn("relative flex min-h-0 flex-1 flex-col overflow-y-auto", className)}
      {...props}
    />
  );
}

/** Sticks to the bottom of the viewport, so messages scroll behind the composer. */
function ThreadViewportFooter({
  className,
  ...props
}: ComponentProps<typeof ThreadPrimitive.ViewportFooter>) {
  return (
    <ThreadPrimitive.ViewportFooter
      data-slot="thread-viewport-footer"
      className={cn("sticky bottom-0 mt-auto flex flex-col bg-background", className)}
      {...props}
    />
  );
}

type ThreadScrollToBottomProps = Omit<ComponentProps<typeof TooltipIconButton>, "tooltip"> & {
  tooltip?: string;
};

/**
 * Shown while the user is scrolled up. Place it in `ThreadViewportFooter`,
 * which it floats above.
 */
function ThreadScrollToBottom({
  tooltip = "Scroll to bottom",
  className,
  ...props
}: ThreadScrollToBottomProps) {
  return (
    <ThreadPrimitive.ScrollToBottom
      render={
        <TooltipIconButton
          tooltip={tooltip}
          variant="outline"
          size="icon"
          className={cn(
            // Disabled at the bottom, where it fades out of the way
            "absolute -top-11 z-10 self-center rounded-full bg-background shadow-xs transition-[opacity,scale] disabled:pointer-events-none disabled:scale-90 disabled:opacity-0 motion-reduce:transition-none",
            // Opaque in dark mode too, over the messages scrolling under it
            "dark:bg-background dark:hover:bg-muted",
            className,
          )}
          data-testid="thread-scroll-to-bottom"
          {...props}
        />
      }
    >
      <ArrowDownIcon />
    </ThreadPrimitive.ScrollToBottom>
  );
}

export { Thread, ThreadScrollToBottom, ThreadViewport, ThreadViewportFooter };
